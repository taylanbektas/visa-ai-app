import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Animated hero word ─────────────────────────────────── */
const heroWords = ["kolay", "hızlı", "güvenli", "akıllı"];
const longestWord = "smartest"; // used to size the container - using longest EN word to be safe

/* ── Passport options — ordered by target audience ─────── */
const passportOptions = [
  { code: "TR", labelKey: "country.turkey", flag: "🇹🇷" },
  { code: "AZ", labelKey: "country.azerbaijan", flag: "🇦🇿" },
  { code: "RU", labelKey: "country.russia", flag: "🇷🇺" },
  { code: "UA", labelKey: "country.ukraine", flag: "🇺🇦" },
  { code: "DE", labelKey: "country.germany", flag: "🇩🇪" },
  { code: "NL", labelKey: "country.netherlands", flag: "🇳🇱" },
  { code: "FR", labelKey: "country.france", flag: "🇫🇷" },
  { code: "GB", labelKey: "country.uk", flag: "🇬🇧" },
  { code: "US", labelKey: "country.usa", flag: "🇺🇸" },
  { code: "IR", labelKey: "country.iran", flag: "🇮🇷" },
  { code: "UZ", labelKey: "country.uzbekistan", flag: "🇺🇿" },
  { code: "TM", labelKey: "country.turkmenistan", flag: "🇹🇲" },
  { code: "KG", labelKey: "country.kyrgyzstan", flag: "🇰🇬" },
  { code: "EG", labelKey: "country.egypt", flag: "🇪🇬" },
  { code: "IQ", labelKey: "country.iraq", flag: "🇮🇶" },
  { code: "SY", labelKey: "country.syria", flag: "🇸🇾" },
  { code: "AF", labelKey: "country.afghanistan", flag: "🇦🇫" },
];

/* ── Destination list with flags ─────────────────────────── */
const destinations = [
  { key: "germany", flag: "🇩🇪" },
  { key: "france", flag: "🇫🇷" },
  { key: "italy", flag: "🇮🇹" },
  { key: "spain", flag: "🇪🇸" },
  { key: "netherlands", flag: "🇳🇱" },
  { key: "belgium", flag: "🇧🇪" },
  { key: "austria", flag: "🇦🇹" },
  { key: "switzerland", flag: "🇨🇭" },
  { key: "portugal", flag: "🇵🇹" },
  { key: "greece", flag: "🇬🇷" },
  { key: "usa", flag: "🇺🇸" },
  { key: "uk", flag: "🇬🇧" },
  { key: "canada", flag: "🇨🇦" },
  { key: "japan", flag: "🇯🇵" },
  { key: "south_korea", flag: "🇰🇷" },
];

/* ── Visa-free map: passport → visa-free destination keys ──── */
const visaFreeMap: Record<string, string[]> = {
  DE: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "uk", "japan", "south_korea", "canada", "usa"],
  FR: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "uk", "japan", "south_korea", "canada", "usa"],
  NL: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "uk", "japan", "south_korea", "canada", "usa"],
  GB: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "japan", "south_korea", "canada", "usa"],
  US: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "uk", "japan", "south_korea", "canada", "usa"],
  TR: ["south_korea", "japan"],
  AZ: ["south_korea"],
  RU: ["south_korea"],
  UA: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "uk", "japan", "south_korea", "canada", "usa"], // UA visa free to schengen
  SY: [], IQ: [], IR: [], AF: [], UZ: [], TM: [], KG: [], EG: [],
};

/* ── E-Visa destinations (need an e-visa even if "visa-free" for some) ──── */
const eVisaDestinations = ["south_korea"]; // K-ETA required

/* ── Visa data by destination key ─────────────────────────── */
const visaData: Record<string, { typeKey: string; docKeys: string[]; durationKey: string; fee: string }> = {
  "germany": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.hotel_reservation", "doc.flight_ticket"], durationKey: "duration.10_15", fee: "€90" },
  "france": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.accommodation", "doc.flight_ticket"], durationKey: "duration.10_15", fee: "€90" },
  "italy": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.hotel_reservation"], durationKey: "duration.10_15", fee: "€90" },
  "spain": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.accommodation"], durationKey: "duration.10_15", fee: "€90" },
  "netherlands": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.invitation_or_hotel"], durationKey: "duration.10_15", fee: "€90" },
  "belgium": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.hotel_or_invitation"], durationKey: "duration.10_15", fee: "€90" },
  "austria": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.hotel_reservation"], durationKey: "duration.10_15", fee: "€90" },
  "switzerland": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.hotel_or_invitation"], durationKey: "duration.10_15", fee: "€90" },
  "portugal": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.accommodation_short"], durationKey: "duration.10_15", fee: "€90" },
  "greece": { typeKey: "visa_type.schengen", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_insurance", "doc.hotel"], durationKey: "duration.10_15", fee: "€90" },
  "usa": { typeKey: "visa_type.b1b2", docKeys: ["doc.passport", "doc.ds160", "doc.bank_statement", "doc.work_school", "doc.photo"], durationKey: "duration.interview", fee: "$185" },
  "uk": { typeKey: "visa_type.standard_visitor", docKeys: ["doc.passport", "doc.bank_statement", "doc.accommodation", "doc.travel_plan"], durationKey: "duration.15_20", fee: "£115" },
  "canada": { typeKey: "visa_type.trv", docKeys: ["doc.passport", "doc.bank_statement", "doc.travel_history", "doc.invitation_if_any"], durationKey: "duration.20_30", fee: "CAD $100" },
  "japan": { typeKey: "visa_type.tourist", docKeys: ["doc.passport", "doc.application_form", "doc.photo", "doc.flight_ticket", "doc.hotel"], durationKey: "duration.5_7", fee: "Ücretsiz" },
  "south_korea": { typeKey: "visa_type.keta", docKeys: ["doc.passport", "doc.keta"], durationKey: "duration.1_3", fee: "₩10,000 (~€7)" },
};

/* ── Testimonials data — realistic reviews ────────────── */
const testimonials = [
  { name: "Ayşe Karagöz", city: "İstanbul", country: "🇫🇷 Fransa", rating: 5, date: "2 hafta önce", text: "İlk kez Schengen vizesi aldım. Belgelerimi 24 saat içinde kontrol ettiler, 12 günde vizem geldi. Tavsiye ederim!" },
  { name: "Mehmet Yılmaz", city: "Ankara", country: "🇺🇸 ABD", rating: 5, date: "1 ay önce", text: "ABD mülakat hazırlığında çok yardımcı oldular. Mülakat simülasyonu yaptık, ilk denemede onaylandım!" },
  { name: "Elif Demir", city: "İzmir", country: "🇩🇪 Almanya", rating: 5, date: "3 hafta önce", text: "Daha önce reddedildim. VisaPath ile ikinci başvurumda eksiklerimi tamamlayıp onay aldım. Profesyonel hizmet." },
  { name: "Burak Arslan", city: "Bursa", country: "🇩🇪 Almanya", rating: 5, date: "1 hafta önce", text: "VIP Concierge ile Almanya iş vizesi aldım. Özel danışmanım her adımda yanımdaydı. 10 iş gününde sonuç!" },
  { name: "Zeynep Tuncer", city: "Antalya", country: "🇬🇧 İngiltere", rating: 5, date: "2 ay önce", text: "İngiltere vizesi formları karmaşıktı ama VisaPath her şeyi halletti. İlk denemede onay geldi!" },
  { name: "Emre Sarıoğlu", city: "İstanbul", country: "🇫🇷 Fransa", rating: 4, date: "1 ay önce", text: "Eşim ve 2 çocuğumla aile vizesi başvurduk. 3 kişilik dosyayı organize ettiler, tek seferde 3 vize aldık!" },
  { name: "Selin Mutlu", city: "Ankara", country: "🇵🇹 Portekiz", rating: 5, date: "3 ay önce", text: "Dijital göçebe vizesi (D7) için başvurdum. Gelir kanıtları konusunda yönlendirdiler. 3 haftada vizem geldi!" },
  { name: "Oğuz Kılıçarslan", city: "İzmir", country: "🇨🇦 Kanada", rating: 5, date: "2 hafta önce", text: "Kanada turist vizem reddedilmişti. Ret nedenlerini analiz edip güçlü bir dosya hazırladık. İkinci başvuruda kabul!" },
  { name: "Fatma Şahin", city: "Gaziantep", country: "🇦🇪 BAE", rating: 5, date: "1 hafta önce", text: "Dubai vizesi için başvurdum, 3 günde elime ulaştı. Online süreç çok hızlı ve pratikti. Mükemmel!" },
  { name: "Deniz Aydın", city: "İstanbul", country: "🇮🇹 İtalya", rating: 5, date: "1 ay önce", text: "İtalya Schengen vizesini 2 haftada aldım. Belge kontrolü çok detaylıydı, hiç sorun yaşamadım." },
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

/* ── Testimonials: Continuous Marquee ─────────────────── */
function TestimonialsCarousel({ t }: { t: (key: string) => string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  /* ── Embla navigation helpers ── */
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((api: any) => {
    setPrevBtnEnabled(api.canScrollPrev());
    setNextBtnEnabled(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-16 md:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl mb-10 text-center">
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
          <span>— {testimonials.length}+ {t("testimonials.reviews")}</span>
        </div>
      </div>

      <div className="relative container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex -ml-4">
            {testimonials.map((review, i) => (
              <div
                key={i}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 min-w-0"
              >
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} size={16} className="fill-[#facc15] text-[#facc15]" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">{review.date}</span>
                  </div>
                  <p className="text-sm md:text-base text-foreground/85 leading-relaxed mb-6 flex-grow">
                    &quot;{review.text}&quot;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
                    <div className="w-10 h-10 rounded-full bg-[#00D69E]/10 flex items-center justify-center text-[#00B386] font-bold text-sm ring-2 ring-white shadow-sm shrink-0">
                      {review.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-dark truncate">{review.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{review.city} · {review.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={scrollPrev}
            className="w-12 h-12 rounded-full border border-border bg-white flex items-center justify-center text-muted-foreground hover:text-navy-dark hover:border-navy-dark/30 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={scrollNext}
            className="w-12 h-12 rounded-full btn-gradient text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
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
    <div className="min-h-screen safe-bottom-pad" id="main-content">

      {/* ━━━ HERO ━━━ */}
      <section className="relative pt-24 pb-14 md:pt-40 md:pb-24 section-gradient-light" aria-label="Ana başlık ve vize kontrol aracı">
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
            className="text-lg md:text-2xl text-muted-foreground mb-10 md:mb-12 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            dangerouslySetInnerHTML={{ __html: t("hero.subtitle") }}
          />

          {/* Visa Checker Widget */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-border/40 p-5 sm:p-6 md:p-8 max-w-2xl mx-auto"
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
                        <span>{t(currentPassport.labelKey)}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[300px] max-h-[350px]">
                    {passportOptions.map((p) => (
                      <SelectItem key={p.code} value={p.code} className="py-3 cursor-pointer">
                        <span className="flex items-center gap-3">
                          <span className="text-2xl">{p.flag}</span>
                          <span className="text-base font-medium">{t(p.labelKey)}</span>
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
                  <SelectTrigger className="h-16 text-lg shadow-sm border-border/60">
                    <SelectValue placeholder={t("checker.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[300px] max-h-[350px]">
                    {destinations
                      .filter(d => d.key.toUpperCase() !== selectedPassport) // Prevent selecting same country
                      .map((country) => (
                        <SelectItem key={country.key} value={country.key} className="py-3 cursor-pointer">
                          <span className="flex items-center gap-3">
                            <span className="text-2xl">{country.flag}</span>
                            <span className="text-base font-medium">{t("country." + country.key)}</span>
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CTA Button — visual anchor */}
              <div className="flex items-end">
                <Button
                  className="w-full sm:w-auto btn-gradient text-white font-bold h-16 px-8 sm:px-10 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!selectedDestination}
                  onClick={() => {
                    if (selectedDestination) {
                      // Scroll to result instead of navigating immediately
                      const resultElement = document.getElementById("visa-result-container");
                      if (resultElement) {
                        resultElement.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }
                  }}
                  aria-label={t("checker.button")}
                >
                  {t("checker.button")} <ArrowRight size={18} className="ml-1.5" aria-hidden="true" />
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
                  id="visa-result-container" // Added ID for scrolling
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
                            {t(visaResult.typeKey)} gereklidir.
                          </p>
                          <Link to="/apply" state={{ destination: selectedDestination, passport: selectedPassport }}>
                            <Button className="btn-gradient text-white font-bold h-14 px-8 rounded-xl text-base">
                              {t("visa.evisa_starter")} <ArrowRight size={18} className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <p className="text-lg text-muted-foreground">
                            <strong className="text-foreground">{t(currentPassport.labelKey)}</strong> {t("checker.visaFreeDesc")} <strong className="text-foreground">{t("country." + selectedDestination)}</strong> {t("checker.visaFreeFor")}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── Visa required ── */
                    <>
                      <div className="grid sm:grid-cols-3 gap-4 text-left">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">{t("checker.visaType")}</p>
                          <p className="font-bold text-base">{visaResult && visaResult.typeKey ? t(visaResult.typeKey) : "Standard"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">{t("checker.duration")}</p>
                          <p className="font-bold text-base">{visaResult ? t(visaResult.durationKey) : ""}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">{t("checker.fee")}</p>
                          <p className="font-bold text-base">{visaResult?.fee}</p>
                        </div>
                      </div>
                      <div className="mt-5">
                        <p className="text-xs font-bold text-muted-foreground mb-2.5 uppercase tracking-wide">{t("checker.docs")}</p>
                        <div className="flex flex-wrap gap-2">
                          {visaResult?.docKeys.map((docKey) => (
                            <span key={docKey} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00D69E]/10 text-[#00B386] text-sm font-semibold">
                              <FileText size={13} /> {t(docKey)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link to="/apply" state={{ destination: selectedDestination, passport: selectedPassport }} className="block mt-6">
                        <Button className="w-full btn-gradient text-white font-bold h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
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
            className="flex flex-wrap justify-center gap-6 md:gap-12 mt-10 md:mt-12 text-sm md:text-base text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-border/50">
              <Users size={20} className="text-[#00D69E] shrink-0" />
              <span><strong className="text-foreground font-extrabold">3.200+</strong> {t("trust.applications")}</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-border/50">
              <Shield size={20} className="text-[#00D69E] shrink-0" />
              <span><strong className="text-foreground font-extrabold">%96</strong> {t("trust.approval")}</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-border/50">
              <Clock size={20} className="text-[#00D69E] shrink-0" />
              <span><strong className="text-foreground font-extrabold">{t("trust.supportTime")}</strong> {t("trust.support")}</span>
            </div>
          </motion.div>
        </div>
      </section >



      {/* ━━━ COMPARISON — left muted, right green & bigger ━━━ */}
      <section className="py-16 md:py-28 section-gradient-light" aria-label="VisaPath ve kendi başına başvuru karşılaştırması">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center text-navy-dark mb-4">
            {t("comparison.title")} <span className="text-gradient-mint">VisaPath</span>?
          </h2>
          <p className="text-center text-muted-foreground text-xl mb-14 max-w-lg mx-auto">
            {t("comparison.subtitle")}
          </p>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* DIY — muted, grey, compact */}
            <div className="rounded-2xl border border-border bg-secondary/20 p-8 md:p-10 transition-all hover:border-border/60">
              <h3 className="text-2xl font-bold text-muted-foreground mb-7 flex items-center gap-2">
                <X size={24} className="text-muted-foreground/60 shrink-0" />
                {t("comparison.diy")}
              </h3>
              <ul className="space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-3 text-base md:text-lg text-muted-foreground">
                    <X size={20} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{t(`comparison.diy.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VisaPath — green, bigger, bold, prominent */}
            <div className="rounded-2xl border-2 border-[#00D69E]/50 p-8 md:p-10 relative shadow-lg transition-all hover:shadow-xl pt-12 md:pt-14" style={{ background: "linear-gradient(135deg, rgba(0,214,158,0.06) 0%, rgba(0,179,134,0.12) 100%)" }}>
              <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-20 btn-gradient text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-xl whitespace-nowrap ring-4 ring-white">
                {t("comparison.recommended")}
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#00B386] mb-7 flex items-center gap-2">
                <CheckCircle size={26} className="text-[#00D69E] shrink-0" />
                {t("comparison.withVP")}
              </h3>
              <ul className="space-y-4">
                {[0, 1, 2, 3, 4].map((i) => {
                  const text = t(`comparison.vp.${i}.text`);
                  const bold = t(`comparison.vp.${i}.bold`);
                  return (
                    <li key={i} className="flex items-start gap-3 text-base md:text-lg text-foreground">
                      <CheckCircle size={20} className="text-[#00D69E] mt-0.5 shrink-0" />
                      <span className="leading-relaxed">
                        {text.split(bold).map((part, j, arr) => (
                          <span key={j}>
                            {part}
                            {j < arr.length - 1 && <strong className="font-extrabold text-[#00B386]">{bold}</strong>}
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
      </section >

      {/* ━━━ 3 STEPS ━━━ */}
      <section className="py-16 md:py-28 bg-white" aria-label="Vize başvuru süreci adımları">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center text-navy-dark mb-4">
            {t("steps.title")}
          </h2>
          <p className="text-center text-muted-foreground text-xl mb-14 max-w-md mx-auto">
            {t("steps.subtitle")}
          </p>

          <div className="space-y-8 md:space-y-10">
            {[
              { step: "1", icon: Globe },
              { step: "2", icon: FileText },
              { step: "3", icon: Zap },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="flex gap-5 md:gap-6 items-start group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl btn-gradient flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <span className="text-2xl md:text-3xl font-extrabold text-white">{item.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-lg md:text-xl lg:text-2xl text-navy-dark mb-2 group-hover:text-[#00B386] transition-colors">{t(`steps.${parseInt(item.step) - 1}.title`)}</h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{t(`steps.${parseInt(item.step) - 1}.desc`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* ━━━ STATS — Animated Counters ━━━ */}
      < StatsSection t={t} />

      {/* ━━━ TESTIMONIALS — iVisa-style carousel ━━━ */}
      < TestimonialsCarousel t={t} />

      {/* ━━━ FAQs ━━━ */}
      <section className="py-16 md:py-28 section-gradient-light" id="sss" aria-label="Sıkça sorulan sorular">
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
      </section >

      {/* ━━━ NEWSLETTER ━━━ */}
      < section className="py-16 md:py-24 bg-gradient-navy" >
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
              className="h-14 text-base bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#00D69E] focus:ring-2 focus:ring-[#00D69E]/20 flex-1 backdrop-blur-sm"
            />
            <Button className="btn-gradient text-white font-bold h-14 px-8 rounded-xl text-base whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              {t("newsletter.button")}
            </Button>
          </div>
          <p className="text-sm text-white/40 mt-4">{t("newsletter.privacy")}</p>
        </div>
      </section >

      {/* ━━━ CTA BANNER ━━━ */}
      < section className="py-16 md:py-24 bg-gradient-navy" >
        <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5">
            {t("cta.title")} <span className="text-gradient-mint">{t("cta.highlight")}</span> {t("cta.titleSuffix")}
          </h2>
          <p className="text-white/70 mb-10 text-xl">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply">
              <Button className="btn-gradient text-white font-bold px-10 h-16 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                {t("cta.button")} <ArrowRight size={22} className="ml-2" />
              </Button>
            </Link>
            <Button
              onClick={() => {
                navigate("/pricing");
                setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
              }}
              className="bg-transparent border-2 border-white/60 text-white hover:bg-white hover:text-navy-dark font-bold px-8 h-16 text-xl rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              {t("cta.check_price")}
            </Button>
          </div>
        </div>
      </section >
    </div >
  );
}
