import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Mail,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

/* ── Destination list with flags ─────────────────────────── */
const destinations = [
  { name: "Almanya", flag: "🇩🇪" },
  { name: "Fransa", flag: "🇫🇷" },
  { name: "İtalya", flag: "🇮🇹" },
  { name: "İspanya", flag: "🇪🇸" },
  { name: "Hollanda", flag: "🇳🇱" },
  { name: "Belçika", flag: "🇧🇪" },
  { name: "Avusturya", flag: "🇦🇹" },
  { name: "İsviçre", flag: "🇨🇭" },
  { name: "Portekiz", flag: "🇵🇹" },
  { name: "Yunanistan", flag: "🇬🇷" },
  { name: "ABD", flag: "🇺🇸" },
  { name: "İngiltere", flag: "🇬🇧" },
  { name: "Kanada", flag: "🇨🇦" },
  { name: "Japonya", flag: "🇯🇵" },
  { name: "Güney Kore", flag: "🇰🇷" },
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

/* ── E-Visa destinations (need an e-visa even if "visa-free" for some) ──── */
const eVisaDestinations = ["Güney Kore"]; // K-ETA required

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

/* ── Testimonials data — realistic reviews ────────────── */
const testimonials = [
  { name: "Ayşe Karagöz", city: "İstanbul", country: "🇫🇷 Fransa", rating: 5, date: "2 hafta önce", text: "İlk kez Schengen vizesi aldım ve sürecin ne kadar kolay olduğuna inanamadım. Belgelerimi yükledikten 24 saat içinde kontrol edip eksikleri bildirdiler. 12 günde vizem elime ulaştı. Kesinlikle tavsiye ediyorum!" },
  { name: "Mehmet Yılmaz", city: "Ankara", country: "🇺🇸 ABD", rating: 5, date: "1 ay önce", text: "ABD B1/B2 vize mülakatı çok stresli bir süreçti ama VisaPath ekibi mülakat simülasyonu yaptı, sorulara nasıl cevap vereceğimi öğretti. İlk denemede onaylandım!" },
  { name: "Elif Demir", city: "İzmir", country: "🇩🇪 Almanya", rating: 5, date: "3 hafta önce", text: "Daha önce kendi başıma başvurdum ve banka hesap özeti yetersiz diye reddedildim. VisaPath ile ikinci başvurumda eksiklerimi tamamlayıp onay aldım. Gerçekten profesyonel bir hizmet." },
  { name: "Burak Arslan", city: "Bursa", country: "🇩🇪 Almanya", rating: 5, date: "1 hafta önce", text: "Almanya iş vizesi için başvurdum. VIP Concierge paketini aldım, özel danışmanım Zeynep Hanım her adımda yanımdaydı. 10 iş gününde sonuç aldım. Fiyatına değer!" },
  { name: "Zeynep Tuncer", city: "Antalya", country: "🇬🇧 İngiltere", rating: 5, date: "2 ay önce", text: "İngiltere vizesi için çok endişeliydim çünkü online formu çok karmaşık. VisaPath benim için her şeyi halletti, sadece belgeleri yükledim. İlk denemede onay geldi!" },
  { name: "Emre Sarıoğlu", city: "İstanbul", country: "🇫🇷 Fransa", rating: 4, date: "1 ay önce", text: "Eşim ve 2 çocuğumla aile vizesi başvurusu yaptık. 3 kişilik dosya hazırlamak zordu ama VisaPath her şeyi organize etti. Tek seferde 3 vize aldık. Harika!" },
  { name: "Selin Mutlu", city: "Ankara", country: "🇵🇹 Portekiz", rating: 5, date: "3 ay önce", text: "Dijital göçebe vizesi (D7) konusunda çok bilgiliydiler. Hangi belgelerin gerektiğini, gelir kanıtlarını nasıl hazırlayacağımı anlattılar. Portekiz vizemi 3 haftada aldım!" },
  { name: "Oğuz Kılıçarslan", city: "İzmir", country: "🇨🇦 Kanada", rating: 5, date: "2 hafta önce", text: "Kanada turist vizem reddedilmişti. VisaPath ile ret nedenlerini analiz edip güçlü bir dosya hazırladık. İkinci başvuruda kabul edildi! Gerçek uzmanlar." },
  { name: "Fatma Şahin", city: "Gaziantep", country: "🇦🇪 BAE", rating: 5, date: "1 hafta önce", text: "Dubai vizesi için başvurdum, 3 günde elime ulaştı. Online süreç çok hızlı ve pratikti. Fiyat/performans açısından mükemmel." },
  { name: "Ali Özkan", city: "İstanbul", country: "🇯🇵 Japonya", rating: 5, date: "1 ay önce", text: "Japonya vizesi almak istiyordum ama süreç hakkında hiçbir fikrim yoktu. VisaPath adım adım yönlendirdi, 5 iş gününde vizem geldi. Teşekkürler!" },
];


/* ── Animated Stats Section ────────────────────────────── */
function AnimatedCounter({ target, suffix = "", prefix = "", label }: { target: number; suffix?: string; prefix?: string; label: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref}>
      <p className="text-4xl md:text-5xl font-extrabold text-gradient-mint">
        {prefix}{count.toLocaleString("tr-TR")}{suffix}
      </p>
      <p className="text-base text-white/70 mt-2 font-medium">{label}</p>
    </div>
  );
}

function StatsSection({ t }: { t: (key: string) => string }) {
  return (
    <section className="py-16 md:py-20 bg-gradient-navy">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <AnimatedCounter target={3200} suffix="+" label={t("stats.applications")} />
          <AnimatedCounter target={96} prefix="%" label={t("stats.approval")} />
          <AnimatedCounter target={7} suffix="+" label={t("stats.experience")} />
          <AnimatedCounter target={150} suffix="+" label={t("stats.countries") || "Ülke desteği"} />
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedPassport, setSelectedPassport] = useState("TR");
  const [selectedDestination, setSelectedDestination] = useState("");
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [wordWidth, setWordWidth] = useState<number | undefined>(undefined);
  const { t } = useLanguage();
  const navigate = useNavigate();


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
  const isEVisa = selectedDestination ? eVisaDestinations.includes(selectedDestination) : false;
  const visaResult = selectedDestination ? visaData[selectedDestination] : null;

  /* ── Smooth scroll helper ─────────────────────────────── */
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">

      {/* ━━━ HERO ━━━ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 section-gradient-light">
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
                      <SelectItem key={country.name} value={country.name}>
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{country.flag}</span>
                          <span>{country.name}</span>
                        </span>
                      </SelectItem>
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

                      {isEVisa && visaResult ? (
                        <div className="mt-4">
                          <p className="text-lg text-muted-foreground mb-4">
                            {visaResult.type} gereklidir.
                          </p>
                          <Link to="/apply" state={{ destination: selectedDestination }}>
                            <Button className="btn-gradient text-white font-bold h-14 px-8 rounded-xl text-base">
                              {t("visa.evisa_starter")} <ArrowRight size={18} className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <p className="text-lg text-muted-foreground mb-4">
                            <strong className="text-foreground">{currentPassport.label}</strong> {t("checker.visaFreeDesc")} <strong className="text-foreground">{selectedDestination}</strong> {t("checker.visaFreeFor")}
                          </p>
                          <Link to="/apply" state={{ destination: selectedDestination }}>
                            <Button className="bg-secondary text-foreground hover:bg-secondary/80 font-bold h-14 px-8 rounded-xl text-base">
                              {t("visa.visa_free_starter")} <ArrowRight size={18} className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── Visa required ── */
                    <>
                      <div className="grid sm:grid-cols-3 gap-4 text-left">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">{t("checker.visaType")}</p>
                          <p className="font-bold text-base">{visaResult?.type}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">{t("checker.duration")}</p>
                          <p className="font-bold text-base">{visaResult?.duration}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">{t("checker.fee")}</p>
                          <p className="font-bold text-base">{visaResult?.fee}</p>
                        </div>
                      </div>
                      <div className="mt-5">
                        <p className="text-xs font-bold text-muted-foreground mb-2.5 uppercase tracking-wide">{t("checker.docs")}</p>
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
            <div className="flex items-center gap-2"><Clock size={22} className="text-[#00D69E]" /> <span><strong className="text-foreground font-extrabold">7/24</strong> {t("trust.support")}</span></div>
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
            {t("comparison.subtitle")}
          </p>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* DIY — muted, grey, compact */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-8 md:p-10">
              <h3 className="text-2xl font-bold text-muted-foreground mb-7 flex items-center gap-2">
                <X size={24} className="text-muted-foreground/60" />
                {t("comparison.diy")}
              </h3>
              <ul className="space-y-5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-muted-foreground">
                    <X size={22} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                    <span>{t(`comparison.diy.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VisaPath — green, bigger, bold, prominent */}
            <div className="rounded-2xl border-2 border-[#00D69E]/40 p-8 md:p-10 relative" style={{ background: "linear-gradient(135deg, rgba(0,214,158,0.04) 0%, rgba(0,179,134,0.08) 100%)" }}>
              <div className="absolute -top-3.5 right-5 btn-gradient text-white text-sm font-bold px-5 py-2 rounded-full shadow-md">
                {t("comparison.recommended")}
              </div>
              <h3 className="text-2xl font-extrabold text-[#00B386] mb-7 flex items-center gap-2">
                <CheckCircle size={26} className="text-[#00D69E]" />
                {t("comparison.withVP")}
              </h3>
              <ul className="space-y-5">
                {[0, 1, 2, 3, 4].map((i) => {
                  const text = t(`comparison.vp.${i}.text`);
                  const bold = t(`comparison.vp.${i}.bold`);
                  return (
                    <li key={i} className="flex items-start gap-3 text-lg text-foreground">
                      <CheckCircle size={22} className="text-[#00D69E] mt-0.5 shrink-0" />
                      <span>
                        {text.split(bold).map((part, j, arr) => (
                          <span key={j}>
                            {part}
                            {j < arr.length - 1 && <strong className="font-extrabold">{bold}</strong>}
                          </span>
                        ))}
                      </span>
                    </li>
                  );
                })}
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
              { step: "01", icon: Globe },
              { step: "02", icon: FileText },
              { step: "03", icon: Zap },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20 rounded-2xl btn-gradient flex items-center justify-center shrink-0 shadow-lg">
                  <span className="text-3xl font-extrabold text-white">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl md:text-2xl text-navy-dark mb-2">{t(`steps.${parseInt(item.step) - 1}.title`)}</h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{t(`steps.${parseInt(item.step) - 1}.desc`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ STATS — Animated Counters ━━━ */}
      <StatsSection t={t} />

      {/* ━━━ TESTIMONIALS — Draggable scroll ━━━ */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-navy-dark mb-4">
              {t("testimonials.title")}
            </h2>
            <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={20} className="fill-[#facc15] text-[#facc15]" />
                ))}
              </div>
              <span className="font-bold text-foreground">4.9/5</span>
              <span>— {testimonials.length}+ değerlendirme</span>
            </div>
          </div>

          {/* Draggable horizontal scroll */}
          <div
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            onMouseDown={(e) => {
              const el = e.currentTarget;
              const startX = e.pageX - el.offsetLeft;
              const scrollLeft = el.scrollLeft;
              const onMove = (ev: MouseEvent) => {
                const x = ev.pageX - el.offsetLeft;
                el.scrollLeft = scrollLeft - (x - startX);
              };
              const onUp = () => {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
              };
              document.addEventListener("mousemove", onMove);
              document.addEventListener("mouseup", onUp);
            }}
          >
            {testimonials.map((review, i) => (
              <div key={i} className="min-w-[320px] md:min-w-[380px] snap-start flex-shrink-0 bg-white border border-border rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow select-none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} size={16} className="fill-[#facc15] text-[#facc15]" />
                    ))}
                    {Array.from({ length: 5 - review.rating }).map((_, j) => (
                      <Star key={j} size={16} className="text-border" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm md:text-base text-foreground/80 leading-relaxed mb-5 line-clamp-4">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                    {review.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-dark">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.city} · {review.country}</p>
                  </div>
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
                <AccordionTrigger className="text-base md:text-lg font-semibold text-left py-5 [&[data-state=open]]:text-[#00D69E]">
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

      {/* ━━━ NEWSLETTER ━━━ */}
      <section className="py-20 md:py-24 bg-gradient-navy">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Mail size={36} className="text-[#00D69E]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            {t("newsletter.title")}
          </h2>
          <p
            className="text-lg text-white/70 mb-8 max-w-md mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t("newsletter.subtitle") }}
          />
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder={t("newsletter.placeholder")}
              className="h-14 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#00D69E] flex-1"
            />
            <Button className="btn-gradient text-white font-bold h-14 px-8 rounded-xl text-base whitespace-nowrap">
              {t("newsletter.button")}
            </Button>
          </div>
          <p className="text-sm text-white/40 mt-4">{t("newsletter.privacy")}</p>
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
            <Button
              onClick={() => {
                navigate("/pricing");
                setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
              }}
              className="bg-transparent border-2 border-white/50 text-white hover:bg-white hover:text-navy-dark font-bold px-8 h-16 text-xl rounded-full transition-colors"
            >
              {t("cta.check_price")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
