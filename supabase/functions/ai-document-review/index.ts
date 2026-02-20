import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { documentName, documentType, destination, visaType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Bir vize başvurusu belge kontrolü yapıyorsun.

Başvuru Bilgileri:
- Hedef Ülke: ${destination}
- Vize Türü: ${visaType}

Yüklenen Belge:
- Belge Adı: ${documentName}
- Beklenen Belge Türü: ${documentType}

Lütfen bu belgeyi değerlendir ve aşağıdaki formatta yanıt ver. Belgenin adına ve türüne bakarak genel bir uyumluluk değerlendirmesi yap.`;

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
            content: `Sen bir vize belgesi uyumluluk kontrol uzmanısın. Türkçe yanıt ver. Belgeleri değerlendirip kısa ve net bir rapor sun.`
          },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "document_review",
            description: "Belge uyumluluk analiz sonucu",
            parameters: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["uygun", "kontrol_gerekli", "uygunsuz"],
                  description: "Belge uyumluluk durumu"
                },
                summary: {
                  type: "string",
                  description: "Kısa değerlendirme özeti (1-2 cümle)"
                },
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                  description: "İyileştirme önerileri listesi"
                }
              },
              required: ["status", "summary", "suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "document_review" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Çok fazla istek, lütfen bekleyin." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI kredisi yetersiz." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI servisi yanıt veremedi");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback
    return new Response(JSON.stringify({
      status: "kontrol_gerekli",
      summary: "Belge değerlendirmesi tamamlanamadı.",
      suggestions: ["Lütfen danışmanınızla iletişime geçin."]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("document review error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
