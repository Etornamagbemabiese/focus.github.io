import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { classId, groupId, noteIds } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header to identify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Fetch notes based on parameters
    let notesQuery = supabase
      .from("notes")
      .select("id, title, content, transcription, topics, keywords, class_id")
      .eq("user_id", user.id);

    if (noteIds && noteIds.length > 0) {
      notesQuery = notesQuery.in("id", noteIds);
    } else if (classId) {
      notesQuery = notesQuery.eq("class_id", classId);
    }

    const { data: notes, error: notesError } = await notesQuery;
    
    if (notesError) {
      throw new Error(`Failed to fetch notes: ${notesError.message}`);
    }

    if (!notes || notes.length === 0) {
      return new Response(
        JSON.stringify({ error: "No notes found to generate study guide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get class info if classId provided
    let className = "Study Guide";
    if (classId) {
      const { data: classData } = await supabase
        .from("classes")
        .select("name")
        .eq("id", classId)
        .single();
      if (classData) {
        className = `${classData.name} Study Guide`;
      }
    }

    // Compile all note content
    const allContent = notes.map(note => {
      const parts = [];
      if (note.title) parts.push(`Title: ${note.title}`);
      if (note.content) parts.push(`Content: ${note.content.replace(/<[^>]*>/g, '')}`);
      if (note.transcription) parts.push(`Transcription: ${note.transcription}`);
      if (note.topics?.length) parts.push(`Topics: ${note.topics.join(", ")}`);
      return parts.join("\n");
    }).join("\n\n---\n\n");

    // Call AI to generate study guide
    const systemPrompt = `You are an expert academic tutor that creates comprehensive study guides. 
Analyze the provided notes and create a study guide with:
1. A concise summary of all key concepts (2-3 paragraphs)
2. A list of 8-12 key concepts with brief explanations
3. 10-15 practice questions (mix of multiple choice and short answer)
4. 15-20 flashcards for memorization

Be thorough but concise. Focus on the most important and testable material.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here are the notes to create a study guide from:\n\n${allContent}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_study_guide",
              description: "Create a comprehensive study guide from notes",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A 2-3 paragraph summary of all key concepts"
                  },
                  key_concepts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        term: { type: "string" },
                        definition: { type: "string" }
                      },
                      required: ["term", "definition"]
                    },
                    description: "List of 8-12 key concepts with explanations"
                  },
                  practice_questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        type: { type: "string", enum: ["multiple_choice", "short_answer"] },
                        options: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Only for multiple choice questions"
                        },
                        answer: { type: "string" }
                      },
                      required: ["question", "type", "answer"]
                    },
                    description: "10-15 practice questions"
                  },
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        front: { type: "string" },
                        back: { type: "string" }
                      },
                      required: ["front", "back"]
                    },
                    description: "15-20 flashcards for memorization"
                  }
                },
                required: ["summary", "key_concepts", "practice_questions", "flashcards"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_study_guide" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate study guide");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid AI response format");
    }

    const studyGuideData = JSON.parse(toolCall.function.arguments);

    // Save the study guide to database
    const { data: savedGuide, error: saveError } = await supabase
      .from("study_guides")
      .insert({
        user_id: user.id,
        class_id: classId || null,
        group_id: groupId || null,
        title: className,
        summary: studyGuideData.summary,
        key_concepts: studyGuideData.key_concepts,
        practice_questions: studyGuideData.practice_questions,
        flashcards: studyGuideData.flashcards,
        source_note_ids: notes.map(n => n.id),
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save study guide:", saveError);
      // Still return the generated content even if save fails
      return new Response(
        JSON.stringify({ 
          ...studyGuideData, 
          title: className,
          saved: false 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        ...savedGuide,
        saved: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating study guide:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
