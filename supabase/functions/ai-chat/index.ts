import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEST_TR: Record<string, string> = {
  germany: "Almanya", usa: "ABD", "united states": "ABD", france: "Fransa", italy: "İtalya",
  spain: "İspanya", netherlands: "Hollanda", greece: "Yunanistan", "united kingdom": "İngiltere", uk: "İngiltere",
};

function destinationToTurkish(d: string | null | undefined): string {
  if (!d) return "Belirtilmemiş";
  const key = (d || "").toLowerCase().trim();
  return DEST_TR[key] || d;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Lütfen giriş yapın." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Kullanıcı adı: AI'ın isimle hitap etmesi için (örn. "Ahmet Bey", "Merhaba Ayşe Hanım")
    const userName = (context?.userName as string) || null;

    // Başvuru listesi: Öncelikle client'tan gelen context.applications kullan (Dashboard ile aynı kaynak; ai-application-summary ile tutarlı).
    // Yoksa veya boşsa RPC ile çek (fallback).
    type AppItem = { reference_id?: string; referenceId?: string; destination?: string; visa_type?: string; visaType?: string; status?: string; travel_date?: string; travelDate?: string };
    let apps: AppItem[] = [];

    if (context?.applications && Array.isArray(context.applications) && context.applications.length > 0) {
      apps = context.applications.map((a: AppItem) => ({
        reference_id: a.reference_id ?? a.referenceId,
        destination: a.destination,
        visa_type: a.visa_type ?? a.visaType,
        status: a.status,
        travel_date: a.travel_date ?? a.travelDate,
      }));
      console.log("[ai-chat] applications from client (context):", apps.length);
    } else {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: dbApps, error: appsError } = await supabase.rpc("get_applications_for_ai_chat");
      if (appsError) console.error("[ai-chat] applications RPC error:", appsError);
      apps = (dbApps || []) as AppItem[];
      console.log("[ai-chat] applications from RPC (fallback):", apps.length);
    }

    let contextInfo = "";

    if (apps.length > 0) {
      const N = apps.length;
      contextInfo = "\n\n--- BAŞVURU SAYISI (değiştirmeyin) ---\nBu kullanıcının sistemdeki başvuru sayısı: " + N + ". \"Kaç başvurum var?\" veya benzeri sorularda SADECE bu sayıyı (" + N + ") söyleyin.\n--- LİSTE ---\nAşağıdaki liste kullanıcının tüm başvurularıdır. Referans numarası, ülke adı (Almanya, ABD) veya \"son başvuru\" dediğinde listeden ilgili satırı bulun. Asla listede olmayan başvuru uydurmayın.\n";
      contextInfo += "Başvuru listesi (her satır bir başvuru, toplam " + N + " adet):\n";
      apps.forEach((app: AppItem, i: number) => {
        const ref = (app.reference_id ?? app.referenceId) ? `Ref: ${app.reference_id ?? app.referenceId} | ` : "";
        const dest = destinationToTurkish(app.destination);
        const visaType = app.visa_type ?? app.visaType;
        const status = app.status;
        const travelDate = app.travel_date ?? app.travelDate;
        contextInfo += `${i + 1}. ${ref}Hedef: ${dest}, Vize: ${visaType || "Belirtilmemiş"}, Durum: ${status || "Belirtilmemiş"}, Seyahat: ${travelDate || "Belirtilmemiş"}\n`;
      });
      contextInfo += "\n";
    } else {
      contextInfo = "\n\nTOPLAM 0 BAŞVURU. Kullanıcıya sadece \"Şu an sistemde görünen başvurunuz bulunmuyor; danışmanınızla görüşebilirsiniz.\" deyin; başvuru uydurmayın.\n\n";
    }

    if (context?.summary) {
      contextInfo += `\nBu kullanıcı için hazırlanan başvuru özeti (müşteriye söyleyebilirsin, zaten ona hitap ediyor):\n${context.summary}`;
      if (context.nextSteps?.length) {
        contextInfo += "\n\nÖnerilen sonraki adımlar: " + context.nextSteps.map((s: { action: string }) => s.action).join("; ");
      }
      contextInfo += "\n";
    }

    const nameInstruction = userName && userName.trim()
      ? `Kullanıcının adı: ${userName.trim()}. Yanıtlarında kullanıcıya ismiyle hitap et (örn. "${userName.trim()} Bey", "${userName.trim()} Hanım", "Merhaba ${userName.trim()}"). İlk karşılamada veya ara sıra isim kullan; her cümlede değil. `
      : "";
    const systemPrompt = `Sen VisaStride platformunun AI vize danışmanısın. Türkçe yanıt ver. ${nameInstruction}Kullanıcıya (ekrandaki kişiye) doğrudan "siz" diye hitap et.

ZORUNLU - SAYI VE LİSTE: (1) \"Kaç başvurum var?\" sorusunda yukarıdaki \"Başvuru sayısı\" satırındaki sayıyı aynen söyleyin (başka sayı uydurmayın). (2) Yanıtlarınızı SADECE "Başvuru listesi"ndeki satırlara dayandırın. Referans numarası veya ülke adı (Almanya, ABD) söylenince listeden o satırı bulun. Listede olmayan başvuru uydurmayın. Kullanıcı "6 başvurum var" gibi bir düzeltme yaparsa, listede kaç satır varsa onu söyleyin ve gerekirse danışmanla görüşmesini önerin.

BAŞVURU LİSTESİ HAKKINDA (ÇOK ÖNEMLİ):
- Size iletilen "Başvuru listesi" ekrandaki kullanıcının o anki TÜM başvurularıdır; sistem bunu her mesajda güncel olarak verir. Listede kaç satır varsa o kadar başvuru vardır.
- "Neden başvurularımı göremiyorsun?" veya benzeri sorularda ASLA teknik bahane uydurma: "API gecikmesi", "önbellek", "veri eşleşme filtresi", "referans bazlı sorgulama", "cross-reference mapping", "farklı kanallar", "profil senkronizasyonu" gibi ifadeler KULLANMA. Gerçek cevap: "Sistem bana şu an gördüğünüz listeyi iletiyor; listede X başvuru görünüyor. Hepsi burada. Eksik görüyorsanız sayfayı yenileyin veya danışmanınızla paylaşın."
- Başvuru EKLEMEZ veya "referans numarası verirseniz listeme eklerim" DEME. Sen listeyi oluşturmuyorsun; sistem sana hazır listeyi veriyor. Listede yoksa "Bu başvuru şu an listede görünmüyor; danışmanınızla kontrol edebilirsiniz" de.

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
