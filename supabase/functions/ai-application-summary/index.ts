import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Üçüncü şahıs (müşteri/müşterinin) → ikinci şahıs (siz/sizin) dönüşümü. */
function toSecondPerson(text: string): string {
  if (!text || typeof text !== "string") return text;
  let s = text;
  // Sayılı başvuru: "Müşterinin 6 başvurusu var" → "Sizin 6 başvurunuz var"
  s = s.replace(/\bMüşterinin\s+(\d+)\s+başvurusu\s+var\b/gi, "Sizin $1 başvurunuz var");
  s = s.replace(/\bmüşterinin\s+(\d+)\s+başvurusu\b/g, "sizin $1 başvurunuz");
  s = s.replace(/\bMüşterinin\s+(\d+)\s+başvurusu\b/g, "Sizin $1 başvurunuz");
  // "müşterinin başvuruları" → "başvurularınız"
  s = s.replace(/\bMüşterinin\s+başvuruları\b/g, "Başvurularınız");
  s = s.replace(/\bmüşterinin\s+başvuruları\b/g, "başvurularınız");
  // "müşterinin X başvurusu" (genel) → "sizin X başvurunuz" / "Sizin X başvurunuz"
  s = s.replace(/\bMüşterinin\s+(.+?)\s+başvurusu\b/g, "Sizin $1 başvurunuz");
  s = s.replace(/\bmüşterinin\s+(.+?)\s+başvurusu\b/g, "sizin $1 başvurunuz");
  // müşteriye / Müşteriye → size / Size
  s = s.replace(/\bMüşteriye\b/g, "Size");
  s = s.replace(/\bmüşteriye\b/g, "size");
  // Kalan "müşterinin" → "sizin"
  s = s.replace(/\bMüşterinin\b/g, "Sizin");
  s = s.replace(/\bmüşterinin\b/g, "sizin");
  // "kullanıcının başvuruları" → "başvurularınız"
  s = s.replace(/\bkullanıcının\s+başvuruları\b/gi, "başvurularınız");
  s = s.replace(/\bKullanıcının\s+başvuruları\b/g, "Başvurularınız");
  return s;
}

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
            content: `Sen bir vize danışmanlık asistanısın. Özeti ekrandaki kişi için yazıyorsun—yani kendisi okuyacak. Asla "müşteri", "müşterinin", "müşteriye" yazma. Doğal Türkçe ile yaz (örn. "6 başvurunuz var", "Almanya başvurunuzda belge eksik"). Türkçe yanıt ver.`
          },
          {
            role: "user",
            content: `Başvurular:\n${appsInfo}\n\nBu listeye göre kısa bir özet ve sonraki adım önerileri yaz. Müşteri veya müşterinin deme.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "application_summary",
            description: "Başvuru özeti ve sonraki adım önerileri; müşteri/müşterinin kullanma",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Kısa özet (2-3 cümle)" },
                nextSteps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string", description: "Sonraki adım cümlesi" },
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
      let payload: { summary?: string; nextSteps?: Array<{ action?: string; priority?: string; icon?: string }> };
      try {
        payload = JSON.parse(toolCall.function.arguments) as typeof payload;
      } catch {
        return new Response(toolCall.function.arguments, {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (payload.summary) payload.summary = toSecondPerson(payload.summary);
      if (Array.isArray(payload.nextSteps)) {
        payload.nextSteps = payload.nextSteps.map((step) => ({
          ...step,
          action: step.action ? toSecondPerson(step.action) : step.action,
        }));
      }
      return new Response(JSON.stringify(payload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
