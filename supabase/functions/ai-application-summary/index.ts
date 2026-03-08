import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { applications } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const appsInfo = applications.map((app: any) =>
      `- ${app.destination} / ${app.visaType} | Durum: ${app.status} | Plan: ${app.plan} | Tarih: ${app.travelDate || 'Belirtilmemiş'} | Belge: ${app.uploadedDocs}/${app.totalDocs}`
    ).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Sen bir vize danışmanlık asistanısın. Özeti okuyan kişi başvuru sahibinin kendisi. Doğrudan "siz/sizin" diye hitap et. Kısa, samimi ve net yaz. "Müşteri" kelimesini asla kullanma. Emoji kullanma. Türkçe yanıt ver.`
          },
          {
            role: "user",
            content: `Başvuralar:\n${appsInfo}\n\n2-3 cümlelik kısa bir özet ve en fazla 3 somut sonraki adım önerisi yaz.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "application_summary",
            description: "Başvuru özeti ve sonraki adım önerileri",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Kısa özet (2-3 cümle, doğal Türkçe)" },
                nextSteps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string", description: "Kısa ve net adım cümlesi" },
                      priority: { type: "string", enum: ["yüksek", "orta", "düşük"] },
                      icon: { type: "string", enum: ["alert", "document", "calendar", "check"] }
                    },
                    required: ["action", "priority", "icon"],
                    additionalProperties: false
                  }
                }
              },
              required: ["summary", "nextSteps"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "application_summary" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Çok fazla istek." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI kredisi yetersiz." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI servisi yanıt veremedi");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      try {
        const payload = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify(payload), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(toolCall.function.arguments, {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({
      summary: "Başvurularınız inceleniyor.",
      nextSteps: [{ action: "Eksik belgeleri yükleyin", priority: "yüksek", icon: "document" }]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
