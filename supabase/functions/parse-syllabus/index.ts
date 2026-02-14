import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { syllabusText, fileName } = await req.json();

    if (!syllabusText) {
      return new Response(
        JSON.stringify({ error: "No syllabus text provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Parsing syllabus:", fileName || "unknown");

    const systemPrompt = `You are an expert at extracting structured information from academic syllabi. 
Extract the following information from the syllabus text provided. Be thorough and accurate.

Return a JSON object with this exact structure:
{
  "courseName": "Full course name",
  "courseCode": "Course code like CS101, BIO 201, etc.",
  "professorName": "Professor's full name",
  "professorEmail": "Email if found, or null",
  "meetingDays": [1, 3], // Array of day numbers: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  "startTime": "09:00", // 24-hour format HH:MM
  "endTime": "10:30", // 24-hour format HH:MM
  "location": "Building and room number",
  "semesterStart": "2025-01-15", // YYYY-MM-DD format, estimate if not explicit
  "semesterEnd": "2025-05-15", // YYYY-MM-DD format, estimate if not explicit
  "officeHours": {
    "day": "Monday",
    "time": "2:00 PM - 4:00 PM",
    "location": "Office 123"
  },
  "deadlines": [
    {
      "title": "Midterm Exam",
      "type": "exam", // Types: assignment, exam, quiz, midterm, final, reading, other
      "dueDate": "2025-03-15T10:00:00", // ISO format with time if known
      "weight": 20, // Percentage weight in grade if mentioned, or null
      "description": "Covers chapters 1-5"
    }
  ],
  "confidence": {
    "courseName": "high", // high, medium, low
    "schedule": "high",
    "deadlines": "medium"
  }
}

If information is not found, use null for that field.
For meeting days, convert day names to numbers (Monday=1, Tuesday=2, etc.).
For deadlines, include ALL assignments, exams, quizzes, papers, projects, and key dates mentioned.
Estimate semester dates based on context if not explicitly stated.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please extract information from this syllabus:\n\n${syllabusText}` }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse JSON from the response (handle markdown code blocks)
    let parsedData;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse extracted data");
    }

    console.log("Successfully parsed syllabus");

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error parsing syllabus:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to parse syllabus" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
