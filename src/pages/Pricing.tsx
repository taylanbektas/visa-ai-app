import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Star,
  ShieldCheck,
  X,
  Check,
  AlertTriangle,
  Clock,
  Phone,
  Ban,
} from "lucide-react";

/* ── Quiz ──────────────────────────────────────────────── */
const questions = [
  { q: "Daha önce Schengen vizesi aldınız mı?", options: [{ label: "Evet", value: "yes" }, { label: "Hayır", value: "no" }] },
  { q: "Belge hazırlamayı kendiniz yapmak ister misiniz?", options: [{ label: "Evet, yapabilirim", value: "yes" }, { label: "Hayır, destek istiyorum", value: "no" }] },
  { q: "Randevu ve takip desteği ister misiniz?", options: [{ label: "Evet, kesinlikle", value: "yes" }, { label: "Hayır, gerek yok", value: "no" }] },
];

function getRecommendation(answers: string[]): string {
  const noCount = answers.filter((a) => a === "no").length;
  if (noCount <= 1) return "starter";
  if (noCount === 2) return "pro";
  return "elite";
}

/* ── Plans ─────────────────────────────────────────────── */
const plans = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Deneyimli gezginler için",
    price: "49",
    features: [
      "Dijital vize rehberi",
      "Gerekli belge checklist'i",
      "AI belge ön kontrol",
      "E-posta desteği",
      "Bilgi bankası erişimi",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "En popüler seçim",
    price: "149",
    popular: true,
    features: [
      "Starter'daki her şey",
      "Uzman belge inceleme ve düzeltme",
      "Randevu alma desteği",
      "AI destekli başvuru doğrulama",
      "5 iş günü takip desteği",
      "Telefon desteği",
      "Ret durumunda indirimli yeniden başvuru",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    subtitle: "Tam kapsamlı VIP hizmet",
    price: "349",
    features: [
      "Pro'daki her şey",
      "Kişisel vize danışmanı",
      "7/24 WhatsApp destek hattı",
      "Seyahat planlaması desteği",
      "Otel ve restoran önerileri",
      "Havalimanı bilgi paketi",
      "%100 para iade garantisi (ret durumunda)",
      "Öncelikli işlem",
    ],
  },
];

/* ── Comparison table features ─────────────────────────── */
const compareFeatures = [
  { feature: "Dijital Vize Rehberi", starter: true, pro: true, elite: true },
  { feature: "Belge Checklist", starter: true, pro: true, elite: true },
  { feature: "AI Belge Kontrol", starter: true, pro: true, elite: true },
  { feature: "Uzman Belge İnceleme", starter: false, pro: true, elite: true },
  { feature: "Randevu Desteği", starter: false, pro: true, elite: true },
  { feature: "Telefon Desteği", starter: false, pro: true, elite: true },
  { feature: "Kişisel Danışman", starter: false, pro: false, elite: true },
  { feature: "7/24 WhatsApp Hattı", starter: false, pro: false, elite: true },
  { feature: "Seyahat Planlaması", starter: false, pro: false, elite: true },
  { feature: "%100 İade Garantisi", starter: false, pro: false, elite: true },
  { feature: "Fiyat", starter: "€49", pro: "€149", elite: "€349" },
];

/* ── Competitor comparison ────────────────────────────── */
const competitorRows = [
  { feature: "Ortalama Fiyat", us: "€49 – €349", them: "€500 – €1.500+" },
  { feature: "Kişisel İlgi", us: "Her müşteriye özel danışman", them: "Toplu işlem, kişisel destek yok" },
  { feature: "Hata Riski", us: "AI + uzman çift kontrol", them: "Manuel süreç, hataya açık" },
  { feature: "İletişim", us: "7/24 WhatsApp, telefon, e-posta", them: "Sadece e-posta, uzun bekleme" },
  { feature: "İade Garantisi", us: "%100 para iade (Elite)", them: "İade yok veya kısıtlı" },
  { feature: "Süreç Takibi", us: "Gerçek zamanlı bilgilendirme", them: "Siz sormadıkça bilgi yok" },
  { feature: "Teknoloji", us: "AI destekli belge kontrolü", them: "Tamamen manuel" },
];

/* ── FAQ ───────────────────────────────────────────────── */
const faqs = [
  { q: "Fiyata konsolosluk ücreti dahil mi?", a: "Hayır. Fiyatlarımız danışmanlık hizmet ücretini kapsar. Konsolosluk harçları (Schengen vizesi için €90 vb.) ayrıca ödenir." },
  { q: "Ödeme nasıl yapılır?", a: "Kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz. Tüm ödemeler 256-bit SSL şifreleme ile güvence altındadır." },
  { q: "Pro paket neyi içerir?", a: "Pro paket; uzman belge incelemesi, randevu desteği, AI destekli doğrulama, 5 iş günü takip ve telefon desteğini içerir." },
  { q: "Elite'deki %100 iade garantisi nasıl çalışır?", a: "Elite planında vize başvurunuz reddedilirse, danışmanlık ücretinin tamamını iade ederiz. Konsolosluk harçları hariçtir." },
  { q: "Planımı sonradan yükseltebilir miyim?", a: "Evet! İstediğiniz zaman planınızı yükseltebilirsiniz. Sadece fark ücretini ödersiniz." },
];

export default function Pricing() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setRecommendation(getRecommendation(newAnswers));
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQ(0);
    setAnswers([]);
    setRecommendation(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 section-gradient-light">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy-dark mb-4">
            Basit ve Şeffaf <span className="text-gradient-mint">Fiyatlandırma</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            İhtiyacınıza uygun planı seçin. <strong className="text-foreground">Gizli ücret yok</strong>, <strong className="text-foreground">sürpriz yok</strong>.
          </p>
        </div>

        {/* Quiz */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="bg-white border border-border rounded-2xl p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={20} className="text-[#00D69E]" />
              <h3 className="font-bold text-lg">Size Uygun Planı 3 Soruda Bulun</h3>
            </div>

            <AnimatePresence mode="wait">
              {!quizStarted && !recommendation && (
                <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-[15px] text-muted-foreground mb-5">Kısa testimiz ile hangi planın size en uygun olduğunu öğrenin.</p>
                  <Button onClick={() => setQuizStarted(true)} className="btn-gradient text-white font-bold w-full h-12 rounded-xl text-[15px]">
                    Teste Başla <ArrowRight size={16} className="ml-2" />
                  </Button>
                </motion.div>
              )}

              {quizStarted && !recommendation && (
                <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Soru {currentQ + 1} / {questions.length}
                  </p>
                  <p className="font-semibold text-[15px] mb-5">{questions[currentQ].q}</p>
                  <div className="flex gap-3">
                    {questions[currentQ].options.map((opt) => (
                      <Button
                        key={opt.value}
                        variant="outline"
                        className="flex-1 h-12 font-semibold text-[15px] hover:bg-[#00D69E]/5 hover:border-[#00D69E] hover:text-[#00B386] rounded-xl"
                        onClick={() => handleAnswer(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              {recommendation && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={20} className="text-[#00D69E]" />
                    <p className="font-bold text-[15px]">
                      Size önerimiz: <span className="text-[#00D69E] capitalize">{recommendation === "starter" ? "Starter" : recommendation === "pro" ? "Pro" : "Elite"} Plan</span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    {recommendation === "starter" && "Deneyimli bir gezginsiniz. Starter planı ile kendi hızınızda ilerleyebilirsiniz."}
                    {recommendation === "pro" && "Profesyonel destek sizi rahatlatacak. Pro planı belgelerinizi uzmanlarımız kontrol etsin."}
                    {recommendation === "elite" && "Tam kapsamlı, kişisel bir hizmet istiyorsunuz. Elite planı sizi her adımda destekleyecek."}
                  </p>
                  <div className="flex gap-3">
                    <Link to="/apply" className="flex-1">
                      <Button className="w-full btn-gradient text-white font-bold h-12 rounded-xl text-[15px]">
                        {recommendation === "starter" ? "Starter" : recommendation === "pro" ? "Pro" : "Elite"} ile Başla
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={resetQuiz} className="text-muted-foreground font-semibold">
                      Tekrar Dene
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-20">
          {plans.map((plan) => {
            const isRecommended = recommendation === plan.id;
            return (
              <motion.div
                key={plan.id}
                className={`bg-white rounded-2xl border-2 p-7 md:p-9 relative flex flex-col ${plan.popular
                  ? "border-[#00D69E]/60 shadow-lg"
                  : isRecommended
                    ? "border-[#00D69E]/60 shadow-lg"
                    : "border-border"
                  }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {plan.popular && !isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 btn-gradient text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                    <Star size={12} className="fill-white" /> En Popüler
                  </div>
                )}
                {isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-navy-dark text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    Size Önerildi
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-extrabold text-navy-dark">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.subtitle}</p>
                </div>

                <div className="mb-7">
                  <span className="text-4xl md:text-5xl font-extrabold text-navy-dark">€{plan.price}</span>
                  <span className="text-muted-foreground font-medium ml-1">/ başvuru</span>
                </div>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[15px]">
                      <CheckCircle size={18} className="text-[#00D69E] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/apply">
                  <Button
                    className={`w-full font-bold h-13 text-base rounded-xl ${plan.popular || isRecommended
                      ? "btn-gradient text-white"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                  >
                    {plan.name} ile Başla
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ━━━ COMPETITOR COMPARISON ━━━ */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-navy-dark mb-4">
            Diğer Ajanslarla <span className="text-gradient-mint">Karşılaştırın</span>
          </h2>
          <p className="text-center text-muted-foreground text-xl mb-12 max-w-lg mx-auto">
            Geleneksel vize danışmanlık şirketleri pahalı ve yavaş. <strong className="text-foreground">VisaPath farkını rakamlarla görün.</strong>
          </p>

          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-5 font-bold text-muted-foreground text-sm"></div>
              <div className="p-5 text-center border-l border-border">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg">✈️</span>
                  <span className="font-extrabold text-navy-dark">VisaPath</span>
                </div>
                <span className="text-xs font-semibold text-[#00D69E]">Modern & Güvenilir</span>
              </div>
              <div className="p-5 text-center border-l border-border">
                <span className="font-bold text-muted-foreground">Geleneksel Ajanslar</span>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Ortalama rakip</p>
              </div>
            </div>

            {competitorRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 ${i < competitorRows.length - 1 ? "border-b border-border/50" : ""}`}>
                <div className="p-4 md:p-5 text-base font-semibold text-foreground flex items-center">{row.feature}</div>
                <div className="p-4 md:p-5 text-center border-l border-border/50 flex items-center justify-center gap-2">
                  <CheckCircle size={16} className="text-[#00D69E] shrink-0" />
                  <span className="text-[15px] font-medium text-foreground">{row.us}</span>
                </div>
                <div className="p-4 md:p-5 text-center border-l border-border/50 flex items-center justify-center gap-2">
                  <X size={16} className="text-muted-foreground/40 shrink-0" />
                  <span className="text-[15px] text-muted-foreground">{row.them}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-extrabold text-center text-navy-dark mb-12">
            Plan Karşılaştırma
          </h2>

          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 border-b border-border">
              <div className="p-5 font-bold text-sm text-muted-foreground">Özellik</div>
              <div className="p-5 text-center font-bold text-sm border-l border-border">Starter</div>
              <div className="p-5 text-center font-bold text-sm border-l border-border text-[#00D69E]">Pro</div>
              <div className="p-5 text-center font-bold text-sm border-l border-border">Elite</div>
            </div>
            {compareFeatures.map((row, i) => (
              <div key={i} className={`grid grid-cols-4 ${i < compareFeatures.length - 1 ? "border-b border-border/50" : ""}`}>
                <div className="p-4 text-[15px] font-medium">{row.feature}</div>
                {(["starter", "pro", "elite"] as const).map((plan) => (
                  <div key={plan} className="p-4 text-center border-l border-border/50">
                    {typeof row[plan] === "boolean" ? (
                      row[plan] ? (
                        <CheckCircle size={18} className="text-[#00D69E] mx-auto" />
                      ) : (
                        <XCircle size={18} className="text-muted-foreground/30 mx-auto" />
                      )
                    ) : (
                      <span className={`font-bold text-[15px] ${plan === "pro" ? "text-[#00D69E]" : ""}`}>{row[plan]}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="rounded-2xl p-8 md:p-10 text-center bg-white border-2 border-[#00D69E]/20 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#00D69E]/10 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={32} className="text-[#00D69E]" />
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-navy-dark mb-3">%100 Para İade Garantisi</h3>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed max-w-md mx-auto mb-4">
              Elite planımızda vize başvurunuz reddedilirse, danışmanlık ücretinin <strong className="text-foreground font-extrabold">tamamını iade ederiz</strong>. Risk sıfır.
            </p>
            <p className="text-sm text-muted-foreground">Konsolosluk harçları hariçtir.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto" id="sss">
          <h2 className="text-3xl font-extrabold text-center text-navy-dark mb-12">
            Fiyatlandırma Hakkında <span className="text-gradient-mint">SSS</span>
          </h2>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-border rounded-xl px-6">
                <AccordionTrigger className="text-base md:text-lg font-semibold text-left py-5 [&[data-state=open]]:text-[#00D69E]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
