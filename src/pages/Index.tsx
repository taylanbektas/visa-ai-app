import { useState, useEffect, useRef } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Star,
  Shield,
  Clock,
  Users,
  Globe,
  FileText,
  ArrowRight,
  Zap,
  X,
  Check,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Animated hero word ─────────────────────────────────── */
const heroWords = ["kolay", "hızlı", "güvenli", "akıllı"];
const longestWord = "smartest"; // used to size the container - using longest EN word to be safe

/* ── Passport options — ordered by target audience ─────── */
const passportOptions = [
  { code: "TR", label: "Türkiye", flag: "🇹🇷" },
  { code: "DE", label: "Almanya", flag: "🇩🇪" },
  { code: "NL", label: "Hollanda", flag: "🇳🇱" },
  { code: "FR", label: "Fransa", flag: "🇫🇷" },
  { code: "GB", label: "İngiltere", flag: "🇬🇧" },
  { code: "US", label: "ABD", flag: "🇺🇸" },
  { code: "RU", label: "Rusya", flag: "🇷🇺" },
  { code: "AZ", label: "Azerbaycan", flag: "🇦🇿" },
  { code: "IR", label: "İran", flag: "🇮🇷" },
  { code: "UZ", label: "Özbekistan", flag: "🇺🇿" },
  { code: "TM", label: "Türkmenistan", flag: "🇹🇲" },
  { code: "KG", label: "Kırgızistan", flag: "🇰🇬" },
  { code: "EG", label: "Mısır", flag: "🇪🇬" },
  { code: "IQ", label: "Irak", flag: "🇮🇶" },
  { code: "SY", label: "Suriye", flag: "🇸🇾" },
  { code: "AF", label: "Afganistan", flag: "🇦🇫" },
];

/* ── Destination list ────────────────────────────────────── */
const destinations = [
  "Almanya", "Fransa", "İtalya", "İspanya", "Hollanda", "Belçika",
  "Avusturya", "İsviçre", "Portekiz", "Yunanistan",
  "ABD", "İngiltere", "Kanada", "Japonya", "Güney Kore",
];

/* ── Visa-free map: passport → visa-free destinations ──── */
const visaFreeMap: Record<string, string[]> = {
  // EU/EEA passports → free in Schengen + UK
  DE: ["Almanya", "Fransa", "İtalya", "İspanya", "Hollanda", "Belçika", "Avusturya", "İsviçre", "Portekiz", "Yunanistan", "İngiltere", "Japonya", "Güney Kore", "Kanada", "ABD"],
  FR: ["Almanya", "Fransa", "İtalya", "İspanya", "Hollanda", "Belçika", "Avusturya", "İsviçre", "Portekiz", "Yunanistan", "İngiltere", "Japonya", "Güney Kore", "Kanada", "ABD"],
  NL: ["Almanya", "Fransa", "İtalya", "İspanya", "Hollanda", "Belçika", "Avusturya", "İsviçre", "Portekiz", "Yunanistan", "İngiltere", "Japonya", "Güney Kore", "Kanada", "ABD"],
  GB: ["Almanya", "Fransa", "İtalya", "İspanya", "Hollanda", "Belçika", "Avusturya", "İsviçre", "Portekiz", "Yunanistan", "Japonya", "Güney Kore", "Kanada", "ABD"],
  US: ["Almanya", "Fransa", "İtalya", "İspanya", "Hollanda", "Belçika", "Avusturya", "İsviçre", "Portekiz", "Yunanistan", "İngiltere", "Japonya", "Güney Kore", "Kanada", "ABD"],
  // Turkish passport → limited visa-free
  TR: ["Güney Kore", "Japonya"],
  // Azerbaijani
  AZ: ["Güney Kore"],
  // Russian
  RU: ["Güney Kore"],
  // Other passports → generally visa required everywhere
  SY: [], IQ: [], IR: [], AF: [], UZ: [], TM: [], KG: [], EG: [],
};

/* ── Visa data by destination ─────────────────────────── */
const visaData: Record<string, { type: string; docs: string[]; duration: string; fee: string }> = {
  "Almanya": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Otel rezervasyonu", "Uçak bileti"], duration: "10-15 iş günü", fee: "€90" },
  "Fransa": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Konaklama belgesi", "Uçak bileti"], duration: "10-15 iş günü", fee: "€90" },
  "İtalya": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Otel rezervasyonu"], duration: "10-15 iş günü", fee: "€90" },
  "İspanya": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Konaklama belgesi"], duration: "10-15 iş günü", fee: "€90" },
  "Hollanda": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Davet mektubu veya otel"], duration: "10-15 iş günü", fee: "€90" },
  "Belçika": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Otel / davet"], duration: "10-15 iş günü", fee: "€90" },
  "Avusturya": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Otel rezervasyonu"], duration: "10-15 iş günü", fee: "€90" },
  "İsviçre": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Otel / davet"], duration: "10-15 iş günü", fee: "€90" },
  "Portekiz": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Konaklama"], duration: "10-15 iş günü", fee: "€90" },
  "Yunanistan": { type: "Schengen Vizesi", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Otel"], duration: "10-15 iş günü", fee: "€90" },
  "ABD": { type: "B1/B2 Turist Vizesi", docs: ["Pasaport", "DS-160 Formu", "Banka hesap özeti", "İş/Okul belgesi", "Fotoğraf"], duration: "Mülakata bağlı (30-90 gün)", fee: "$185" },
  "İngiltere": { type: "Standard Visitor Visa", docs: ["Pasaport", "Banka hesap özeti", "Konaklama belgesi", "Seyahat planı"], duration: "15-20 iş günü", fee: "£115" },
  "Kanada": { type: "Visitor Visa (TRV)", docs: ["Pasaport", "Banka hesap özeti", "Seyahat geçmişi", "Davet mektubu (varsa)"], duration: "20-30 iş günü", fee: "CAD $100" },
  "Japonya": { type: "Tourist Visa", docs: ["Pasaport", "Başvuru formu", "Fotoğraf", "Uçak bileti", "Otel"], duration: "5-7 iş günü", fee: "Ücretsiz" },
  "Güney Kore": { type: "K-ETA veya Vizesiz", docs: ["Pasaport", "K-ETA başvurusu (online)"], duration: "1-3 gün", fee: "₩10,000 (~€7)" },
};

/* ── Testimonials ────────────────────────────────────────── */
const testimonials = [
  { name: "Ayşe K.", city: "İstanbul", text: "İlk kez Schengen vizesi aldım, her şey çok kolaydı. Belgelerimi kontrol ettiler ve 12 günde vizem geldi.", rating: 5 },
  { name: "Mehmet Y.", city: "Ankara", text: "ABD vize mülakatına hazırlanmamda çok yardımcı oldular. Pro paket gerçekten karşılığını veriyor.", rating: 5 },
  { name: "Elif D.", city: "İzmir", text: "Daha önce kendi başıma başvurdum reddedildim. VisaPath ile ikinci başvurumda onaylandı!", rating: 5 },
];



/* ── FAQ ─────────────────────────────────────────────────── */
const faqs = [
  { q: "VisaPath gerçekten gerekli mi, kendi başıma yapamaz mıyım?", a: "Tabii ki kendiniz de başvurabilirsiniz. Ancak vize başvurularında en küçük bir eksik belge veya hata, ret ya da gecikme sebebi olabilir. VisaPath olarak uzman ekibimiz belgelerinizi kontrol eder, başvurunuzu optimize eder ve %98 onay oranıyla güvenle başvurmanızı sağlar." },
  { q: "Hangi ülkelere vize başvurusu yapabilirsiniz?", a: "Schengen ülkeleri (Almanya, Fransa, İtalya, İspanya, Hollanda vb.), ABD, İngiltere, Kanada ve daha birçok ülke için hizmet veriyoruz." },
  { q: "Başvuru süreci ne kadar sürer?", a: "Starter planımızla kendi hızınızda ilerlersiniz. Pro ve Elite planlarında belgelerinizi 24-48 saat içinde inceler, başvurunuzu hazırlarız. Konsolosluk işlem süreleri ülkeden ülkeye değişir." },
  { q: "Vize reddedilirse ne olur?", a: "Elite planımızda %100 para iade garantisi sunuyoruz. Pro ve Starter planlarında yeniden başvuru için indirimli destek sağlıyoruz." },
  { q: "Ödeme nasıl yapılır?", a: "Kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz. Tüm ödemeler SSL şifreleme ile güvence altındadır." },
];

export default function Index() {
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedPassport, setSelectedPassport] = useState("TR");
  const [selectedDestination, setSelectedDestination] = useState("");
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [wordWidth, setWordWidth] = useState<number | undefined>(undefined);
  const { t } = useLanguage();

  // Measure the widest word once on mount
  useEffect(() => {
    if (sizerRef.current) {
      setWordWidth(sizerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentPassport = passportOptions.find((p) => p.code === selectedPassport)!;

  // Determine visa status
  const isVisaFree = selectedDestination
    ? (visaFreeMap[selectedPassport] || []).includes(selectedDestination)
    : false;
  const visaResult = selectedDestination ? visaData[selectedDestination] : null;

  return (
    <div className="min-h-screen">

      {/* ━━━ HERO ━━━ */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-28 section-gradient-light">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center">
          {/* Hidden sizer — measures widest word to prevent layout shifts */}
          <span ref={sizerRef} className="text-5xl sm:text-6xl md:text-7xl font-extrabold invisible absolute" aria-hidden="true" style={{ lineHeight: 1.15 }}>
            {longestWord}
          </span>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-navy-dark tracking-tight mb-6 leading-tight flex flex-wrap justify-center gap-x-3 md:gap-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span>{t("hero.title.prefix")}</span>
            <span className="inline-flex min-w-[120px] justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroWords[wordIndex]}
                  className="text-gradient-mint"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                >
                  {t(`hero.word.${wordIndex}`)}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>{t("hero.title.suffix")}</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            dangerouslySetInnerHTML={{ __html: t("hero.subtitle") }}
          />

          {/* Visa Checker Widget */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-border/40 p-6 md:p-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              {/* Passport */}
              <div className="flex-1">
                <label className="text-sm font-extrabold text-foreground mb-2 block text-left uppercase tracking-wide">{t("checker.passport")}</label>
                <Select onValueChange={setSelectedPassport} value={selectedPassport}>
                  <SelectTrigger className="h-16 text-lg font-medium">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{currentPassport.flag}</span>
                        <span>{currentPassport.label}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {passportOptions.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        <span className="flex items-center gap-2">
                          <span>{p.flag}</span> {p.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination */}
              <div className="flex-1">
                <label className="text-sm font-extrabold text-foreground mb-2 block text-left uppercase tracking-wide">{t("checker.destination")}</label>
                <Select onValueChange={setSelectedDestination} value={selectedDestination}>
                  <SelectTrigger className="h-16 text-lg">
                    <SelectValue placeholder={t("checker.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CTA Button — visual anchor */}
              <div className="flex items-end">
                <Button
                  className="w-full sm:w-auto btn-gradient text-white font-bold h-16 px-10 rounded-xl text-lg"
                  disabled={!selectedDestination}
                >
                  {t("checker.button")} <ArrowRight size={18} className="ml-1.5" />
                </Button>
              </div>
            </div>

            {/* Inline Result — shows automatically on destination select */}
            <AnimatePresence>
              {selectedDestination && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-border"
                >
                  {isVisaFree ? (
                    /* ── Visa-free ── */
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-full bg-[#00D69E]/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-[#00D69E]" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-navy-dark mb-2">{t("checker.visaFree")}</h3>

                      {visaResult && visaResult.type.includes("K-ETA") ? (
                        <div className="mt-4">
                          <p className="text-lg text-muted-foreground mb-4">
                            {visaResult.type} gereklidir.
                          </p>
                          <Link to="/apply">
                            <Button className="btn-gradient text-white font-bold h-14 px-8 rounded-xl text-base">
                              {t("visa.evisa_starter")} <ArrowRight size={18} className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <p className="text-lg text-muted-foreground mb-2">
                          <strong className="text-foreground">{currentPassport.label}</strong> {t("checker.visaFreeDesc")} <strong className="text-foreground">{selectedDestination}</strong> {t("checker.visaFreeFor")}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* ── Visa required ── */
                    <>
                      <div className="grid sm:grid-cols-3 gap-4 text-left">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">Vize Türü</p>
                          <p className="font-bold text-base">{visaResult?.type}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">Tahmini Süre</p>
                          <p className="font-bold text-base">{visaResult?.duration}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">Konsolosluk Ücreti</p>
                          <p className="font-bold text-base">{visaResult?.fee}</p>
                        </div>
                      </div>
                      <div className="mt-5">
                        <p className="text-xs font-bold text-muted-foreground mb-2.5 uppercase tracking-wide">Gerekli Belgeler</p>
                        <div className="flex flex-wrap gap-2">
                          {visaResult?.docs.map((doc) => (
                            <span key={doc} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00D69E]/10 text-[#00B386] text-sm font-semibold">
                              <FileText size={13} /> {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link to="/apply" state={{ destination: selectedDestination }} className="block mt-6">
                        <Button className="w-full btn-gradient text-white font-bold h-14 text-lg rounded-xl">
                          {t("visa.get_visa")} <ArrowRight size={18} className="ml-2" />
                        </Button>
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Trust Row */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10 text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2"><Users size={22} className="text-[#00D69E]" /> <span><strong className="text-foreground font-extrabold">3.200+</strong> {t("trust.applications")}</span></div>
            <div className="flex items-center gap-2"><Shield size={22} className="text-[#00D69E]" /> <span><strong className="text-foreground font-extrabold">%96</strong> {t("trust.approval")}</span></div>
            <div className="flex items-center gap-2"><Clock size={22} className="text-[#00D69E]" /> <span><strong className="text-foreground font-extrabold">24/7</strong> {t("trust.support")}</span></div>
          </motion.div>
        </div>
      </section>



      {/* ━━━ COMPARISON — left muted, right green & bigger ━━━ */}
      <section className="py-20 md:py-28 section-gradient-light">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center text-navy-dark mb-4">
            {t("comparison.title")} <span className="text-gradient-mint">VisaPath</span>?
          </h2>
          <p className="text-center text-muted-foreground text-xl mb-14 max-w-lg mx-auto">
            {t("comparison.subtitle").replace("3.200+ başvuru", "3.200+ " + t("trust.applications")).replace("%96 onay oranı", "%96 " + t("trust.approval"))}
          </p>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* DIY — muted, grey, compact */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-8 md:p-10">
              <h3 className="text-xl font-bold text-muted-foreground mb-7 flex items-center gap-2">
                <X size={22} className="text-muted-foreground/60" />
                {t("comparison.diy")}
              </h3>
              <ul className="space-y-5">
                {[
                  "Uzun ve karmaşık resmi formlar",
                  "Tek bir hata ret veya gecikme sebebi",
                  "Takıldığınızda destek yok",
                  "Hangi belge gerekli, bulmak zor",
                  "Randevu almak saatler sürebilir",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-muted-foreground">
                    <X size={20} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VisaPath — green, bigger, bold, prominent */}
            <div className="rounded-2xl border-2 border-[#00D69E]/40 p-8 md:p-10 relative" style={{ background: "linear-gradient(135deg, rgba(0,214,158,0.04) 0%, rgba(0,179,134,0.08) 100%)" }}>
              <div className="absolute -top-3.5 right-5 btn-gradient text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                ÖNERİLEN
              </div>
              <h3 className="text-2xl font-extrabold text-[#00B386] mb-7 flex items-center gap-2">
                <CheckCircle size={24} className="text-[#00D69E]" />
                {t("comparison.withVP")}
              </h3>
              <ul className="space-y-5">
                {[
                  { text: "Basit ve anlaşılır başvuru süreci", bold: "Basit ve anlaşılır" },
                  { text: "Uzmanlar her belgeyi kontrol eder", bold: "Uzmanlar" },
                  { text: "7/24 WhatsApp, e-posta ve telefon desteği", bold: "7/24" },
                  { text: "Gerekli belge listesi otomatik oluşturulur", bold: "otomatik" },
                  { text: "Randevu desteği ve takip hizmeti", bold: "Randevu desteği" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-lg text-foreground">
                    <CheckCircle size={22} className="text-[#00D69E] mt-0.5 shrink-0" />
                    <span>
                      {item.text.split(item.bold).map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && <strong className="font-extrabold">{item.bold}</strong>}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 3 STEPS ━━━ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center text-navy-dark mb-4">
            {t("steps.title")}
          </h2>
          <p className="text-center text-muted-foreground text-xl mb-14 max-w-md mx-auto">
            {t("steps.subtitle")}
          </p>

          <div className="space-y-10">
            {[
              {
                step: "01",
                title: "Vize gereksinimini kontrol edin",
                desc: "Pasaportunuzu ve hedef ülkenizi girin, gerekli belgeleri anında görün.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Üye olun ve planınızı seçin",
                desc: "Hesabınızı oluşturun, size uygun paketi seçin. 5 dakikadan az sürer.",
                icon: FileText,
              },
              {
                step: "03",
                title: "Gerisini bize bırakın",
                desc: "Uzman ekibimiz belgelerinizi kontrol eder, başvurunuzu takip eder ve sonuçlanana kadar yanınızda olur.",
                icon: Zap,
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 rounded-2xl btn-gradient flex items-center justify-center shrink-0 shadow-md">
                  <span className="text-2xl font-extrabold text-white">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-navy-dark mb-2">{t(`steps.${parseInt(item.step) - 1}.title`)}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{t(`steps.${parseInt(item.step) - 1}.desc`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ STATS ━━━ */}
      <section className="py-16 md:py-20 bg-gradient-navy">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "3.200+", label: t("stats.applications") },
              { value: "%96", label: t("stats.approval") },
              { value: "7+", label: t("stats.experience") },
              { value: "24/7", label: t("stats.support") },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-extrabold text-gradient-mint">{stat.value}</p>
                <p className="text-base text-white/70 mt-2 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ TESTIMONIALS ━━━ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center text-navy-dark mb-14">
            {t("testimonials.title")}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-8 card-hover">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={20} className="fill-[#facc15] text-[#facc15]" />
                  ))}
                </div>
                <p className="text-base text-foreground/80 leading-relaxed mb-5">"{t(`testimonials.${i}.text`)}"</p>
                <div>
                  <p className="text-base font-extrabold text-navy-dark">{t(`testimonials.${i}.name`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`testimonials.${i}.city`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FAQs ━━━ */}
      <section className="py-20 md:py-28 section-gradient-light" id="sss">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center text-navy-dark mb-14">
            {t("faq.title")}
          </h2>

          <Accordion type="single" collapsible className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-border rounded-xl px-6">
                <AccordionTrigger className="text-base font-semibold text-left py-5 [&[data-state=open]]:text-[#00D69E]">
                  {t(`faq.${i}.q`)}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-5">
                  {t(`faq.${i}.a`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ━━━ CTA BANNER ━━━ */}
      <section className="py-20 md:py-24 bg-gradient-navy">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5">
            {t("cta.title")} <span className="text-gradient-mint">{t("cta.highlight")}</span> {t("cta.titleSuffix")}
          </h2>
          <p className="text-white/70 mb-10 text-xl">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply">
              <Button className="btn-gradient text-white font-bold px-10 h-16 text-xl rounded-full shadow-lg">
                {t("cta.button")} <ArrowRight size={22} className="ml-2" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="border-2 border-white/50 text-white hover:bg-white hover:text-navy-dark font-bold px-8 h-16 text-xl rounded-full transition-colors">
                {t("cta.check_price")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
