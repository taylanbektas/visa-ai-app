import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messageType, destination, visaType, status } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            content: "Vize danışmanına gönderilecek profesyonel mesajlar oluştur. Türkçe, kısa ve nazik ol."
          },
          {
            role: "user",
            content: `Mesaj türü: ${messageType}\nÜlke: ${destination || 'Belirtilmemiş'}\nVize Türü: ${visaType || 'Belirtilmemiş'}\nDurum: ${status || 'Belirtilmemiş'}\n\n3 farklı mesaj önerisi oluştur.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "message_suggestions",
            description: "Mesaj önerileri",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Kısa başlık" },
                      message: { type: "string", description: "Mesaj içeriği" }
                    },
                    required: ["title", "message"],
                    additionalProperties: false
                  }
                }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "message_suggestions" } }
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
      return new Response(toolCall.function.arguments, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      suggestions: [
        { title: "Durum Sorgulama", message: "Merhaba, başvurumun güncel durumu hakkında bilgi alabilir miyim?" },
        { title: "Belge Sorusu", message: "Merhaba, yüklemem gereken belgeler hakkında bilgi almak istiyorum." },
        { title: "Randevu Talebi", message: "Merhaba, müsait olduğunuz bir zamanda görüşme ayarlamak istiyorum." }
      ]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("message suggest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
