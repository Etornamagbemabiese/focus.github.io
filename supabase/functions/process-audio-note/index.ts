import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { noteId, transcription, classId, eventId } = await req.json();

    if (!noteId || !transcription) {
      return new Response(JSON.stringify({ error: "Missing noteId or transcription" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI to extract to-dos from the transcription
    const systemPrompt = `You are an intelligent assistant that analyzes lecture notes and transcriptions to extract actionable to-do items.

Analyze the following transcription and extract any:
- Assignments mentioned (homework, projects, readings)
- Deadlines or due dates
- Tasks the student should complete
- Study items or review topics
- Anything that requires future action

For each to-do, determine:
- A clear, concise title
- Optional description with more details
- Priority (low, medium, high) based on urgency/importance mentioned
- Due date if mentioned (as ISO date string)

Be thorough but only extract genuine action items, not general information.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Transcription:\n\n${transcription}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_todos",
              description: "Extract to-do items from the transcription",
              parameters: {
                type: "object",
                properties: {
                  todos: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Clear, concise title of the to-do" },
                        description: { type: "string", description: "Additional details or context" },
                        priority: { type: "string", enum: ["low", "medium", "high"] },
                        due_date: { type: "string", description: "ISO date string if a due date was mentioned" },
                      },
                      required: ["title", "priority"],
                    },
                  },
                },
                required: ["todos"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_todos" } },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to process with AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    let extractedTodos: Array<{
      title: string;
      description?: string;
      priority: string;
      due_date?: string;
    }> = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        extractedTodos = parsed.todos || [];
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    // Insert extracted to-dos into the database
    if (extractedTodos.length > 0) {
      const todosToInsert = extractedTodos.map((todo) => ({
        user_id: user.id,
        note_id: noteId,
        class_id: classId || null,
        title: todo.title,
        description: todo.description || null,
        due_date: todo.due_date || null,
        priority: todo.priority,
        status: "todo",
      }));

      const { error: insertError } = await supabase
        .from("extracted_todos")
        .insert(todosToInsert);

      if (insertError) {
        console.error("Failed to insert todos:", insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        todosExtracted: extractedTodos.length,
        todos: extractedTodos,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing audio note:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
