import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contextInfo = context
      ? `\n\nKullanıcının (sizin ilettiğiniz) başvuru bilgileri - kendisine "sizin" diye hitap edin:\n- Hedef Ülke: ${context.destination || 'Belirtilmemiş'}\n- Vize Türü: ${context.visaType || 'Belirtilmemiş'}\n- Başvuru Durumu: ${context.status || 'Belirtilmemiş'}\n- Seyahat Tarihi: ${context.travelDate || 'Belirtilmemiş'}`
      : "";

    const systemPrompt = `Sen VisaStride platformunun AI vize danışmanısın. Türkçe yanıt ver. Kullanıcıya (ekrandaki kişiye) doğrudan "siz" diye hitap et.

ÖNEMLİ HİTAP KURALLARI:
- Her zaman ikinci tekil/çoğul hitap kullan: "sizin", "sizin başvurularınız", "sizin için", "size", "başvurularınız", "belgeleriniz" gibi.
- Asla "müşteri", "müşterinin", "müşteriye" gibi üçüncü şahıs ifadeler kullanma. Örnek: "6 aktif başvurunuz bulunuyor" (doğru), "Müşterinin 6 aktif başvurusu" (yanlış).

Diğer kurallar:
- Nazik, profesyonel ve yardımsever ol
- Kesin hukuki tavsiye verme, genel bilgilendirme yap
- Belge gereksinimleri ve başvuru süreçlerini adım adım açıkla
- Bilmediğin konularda "Bu konuda danışmanınızla görüşmenizi öneririm" de
- Yanıtlarını kısa ve öz tut; uzun yanıtları 2-3 kısa mesaja böl ve mesajlar arasına tam olarak [YENİ_MESAJ] yaz (başka karakter ekleme)
- Emoji kullan ama abartma${contextInfo}`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Çok fazla istek gönderildi, lütfen biraz bekleyin." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI kredisi yetersiz." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI servisi şu an yanıt veremiyor." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
