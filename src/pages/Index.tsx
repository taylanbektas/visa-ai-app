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
/* ── Destination list with flags ─────────────────────────── */
import { destinations } from "@/data/countries";

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
  "montenegro": { typeKey: "visa_type.visa_free", docKeys: ["doc.passport", "doc.accommodation", "doc.travel_insurance"], durationKey: "duration.90_days", fee: "Ücretsiz" },
  "serbia": { typeKey: "visa_type.visa_free", docKeys: ["doc.passport", "doc.accommodation"], durationKey: "duration.90_days", fee: "Ücretsiz" },
  "bosnia_and_herzegovina": { typeKey: "visa_type.visa_free", docKeys: ["doc.passport", "doc.accommodation"], durationKey: "duration.90_days", fee: "Ücretsiz" },
  "north_macedonia": { typeKey: "visa_type.visa_free", docKeys: ["doc.passport", "doc.accommodation"], durationKey: "duration.90_days", fee: "Ücretsiz" },
  "albania": { typeKey: "visa_type.visa_free", docKeys: ["doc.passport", "doc.accommodation"], durationKey: "duration.90_days", fee: "Ücretsiz" },
  "kosovo": { typeKey: "visa_type.visa_free", docKeys: ["doc.passport", "doc.accommodation"], durationKey: "duration.90_days", fee: "Ücretsiz" },
};

/* ── Testimonials data — realistic reviews ────────────── */
const testimonials = [
  { name: "Selin Y.", city: "İstanbul", country: "🇫🇷 Fransa", rating: 5, date: "2 gün önce", text: "ilk defa schengen aldim cok gergindim ama ekip saolsun her seyi halletti. 12 gunde geldi vizem tavsiye ederim." },
  { name: "Murat Demir", city: "Ankara", country: "🇺🇸 ABD", rating: 5, date: "1 hafta önce", text: "Amerika vizesi için mülakat korkum vardı, yaptığımız prova çok işe yaradı. Vizeyi kaptım teşekkürler :)" },
  { name: "Ayşe K.", city: "İzmir", country: "🇩🇪 Almanya", rating: 4, date: "2 hafta önce", text: "Randevu bulmak zordu ama sürekli takip edip buldular. Evrak işleriyle uğraşmamak harika. Teşekkürler." },
  { name: "Caner E.", city: "Bursa", country: "🇬🇧 İngiltere", rating: 5, date: "3 hafta önce", text: "Ingiltere vizesi zor diyolardi ama hic sorun yasamadim. belgeleri yukledim gerisini onlar halletti. 6 aylik geldi." },
  { name: "Zeynep T.", city: "Antalya", country: "🇮🇹 İtalya", rating: 5, date: "1 ay önce", text: "İtalya için başvurdum, otel uçak rezervasyonlarını da onlar ayarladı. Kafam rahat gitti geldim. Tekrar tercih ederim." },
  { name: "Barış K.", city: "İstanbul", country: "🇳🇱 Hollanda", rating: 5, date: "1 ay önce", text: "Red alma riskim vardı ama dosya çok sağlam hazırlandı. 10 günde sonuçlandı." },
  { name: "Derya Y.", city: "Gaziantep", country: "🇦🇪 BAE", rating: 5, date: "2 gün önce", text: "Dubai vizesi 2 günde geldi. Çok hızlı sistem." },
  { name: "Ozan Çelik", city: "Eskişehir", country: "🇪🇸 İspanya", rating: 5, date: "3 gün önce", text: "Erasmus stajı için vize lazımdı. Okulun evrakları karışıktı ama danışmanım hemen çözdü. Süreç çok şeffaftı." },
  { name: "Elif S.", city: "Ankara", country: "🇨🇦 Kanada", rating: 5, date: "1 ay önce", text: "Kanada turist vizesi aldık ailecek. Formlar çok detaylıydı, kendimiz yapsak kesin hata yapardık. Profesyonel destek şart." },
  { name: "Mehmet A.", city: "İstanbul", country: "🇯🇵 Japonya", rating: 5, date: "2 hafta önce", text: "Japonya e-vize kalktı sanıyordum ama prosedür varmış. Hızlıca bilgilendirdiler, sorunsuz gittim." },
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
      <p className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D69E] to-[#00B386] tracking-tight drop-shadow-sm">
        {prefix}{count.toLocaleString("tr-TR")}{suffix}
      </p>
      <p className="text-base text-navy-dark/70 mt-2 font-medium">{label}</p>
    </div>
  );
}

function StatsSection({ t }: { t: (key: string) => string }) {
  return (
    <section className="py-16 md:py-20 bg-white border-t border-border/40">
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true, // Enable "wheel" feel
    containScroll: "trimSnaps"
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  /* ── Embla navigation helpers ── */
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((api: ReturnType<typeof useEmblaCarousel>[1]) => {
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
    <section className="py-16 md:py-28 bg-white overflow-hidden relative group">
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
        {/* Navigation Buttons - Absolute positioned on sides */}
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-14 h-14 rounded-full border border-border bg-white flex items-center justify-center text-muted-foreground hover:text-navy-dark hover:border-navy-dark/30 transition-all shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 duration-300 disabled:opacity-0"
          aria-label="Previous slide"
          disabled={!prevBtnEnabled}
        >
          <ChevronLeft size={28} />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-14 h-14 rounded-full border border-border bg-white flex items-center justify-center text-muted-foreground hover:text-navy-dark hover:border-navy-dark/30 transition-all shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 duration-300 disabled:opacity-0"
          aria-label="Next slide"
          disabled={!nextBtnEnabled}
        >
          <ChevronRight size={28} />
        </button>

        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex -ml-4">
            {testimonials.map((review, i) => (
              <div
                key={i}
                className="flex-[0_0_85%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 min-w-0"
              >
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col user-select-none">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} size={16} className="fill-[#facc15] text-[#facc15]" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">{review.date}</span>
                  </div>
                  <p className="text-sm md:text-base text-foreground/85 leading-relaxed mb-6 flex-grow">
                    {review.text}
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
                          <span className="text-base font-bold">{t(p.labelKey)}</span>
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
                            <span className="text-base font-bold">{t("country." + country.key)}</span>
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
            className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mt-12 text-sm md:text-base text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[#00D69E]" />
              <span><strong className="text-navy-dark font-extrabold">3.200+</strong> {t("trust.applications")}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-[#00D69E]" />
              <span><strong className="text-navy-dark font-extrabold">%96</strong> {t("trust.approval")}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-[#00D69E]" />
              <span><strong className="text-navy-dark font-extrabold">{t("trust.supportTime")}</strong> {t("trust.support")}</span>
            </div>
          </motion.div>
        </div>
      </section >



      {/* ━━━ COMPARISON — clean, trust-focused ━━━ */}
      <section className="py-16 md:py-28 section-gradient-light" aria-label="VisaPath ve kendi başına başvuru karşılaştırması">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center text-navy-dark mb-4">
            {t("comparison.title")} <span className="text-gradient-mint">VisaPath</span>?
          </h2>
          <p className="text-center text-muted-foreground text-xl mb-14 max-w-lg mx-auto">
            {t("comparison.subtitle")}
          </p>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* DIY — muted, clean */}
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-border/60 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
              <h3 className="text-2xl font-bold text-muted-foreground mb-8 flex items-center gap-3 pb-4 border-b border-border/50">
                <X size={28} className="text-muted-foreground/60 shrink-0" />
                {t("comparison.diy")}
              </h3>
              <ul className="space-y-5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-4 text-base md:text-lg text-muted-foreground/90">
                    <X size={20} className="text-red-400/80 mt-1 shrink-0" />
                    <span className="leading-relaxed">{t(`comparison.diy.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VisaPath — premium, trustworthy, no badges */}
            <div className="bg-white rounded-2xl p-8 md:p-10 border-2 border-[#00D69E]/20 shadow-[0_8px_30px_rgb(0,214,158,0.12)] relative">
              <h3 className="text-2xl md:text-3xl font-extrabold text-navy-dark mb-8 flex items-center gap-3 pb-4 border-b border-[#00D69E]/20">
                <CheckCircle size={32} className="text-[#00D69E] fill-[#00D69E]/20" />
                {t("comparison.withVP")}
              </h3>
              <ul className="space-y-5">
                {[0, 1, 2, 3, 4].map((i) => {
                  const text = t(`comparison.vp.${i}.text`);
                  const bold = t(`comparison.vp.${i}.bold`);
                  return (
                    <li key={i} className="flex items-start gap-4 text-base md:text-lg text-foreground">
                      <CheckCircle size={24} className="text-[#00D69E] fill-[#00D69E]/20 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {text.split(bold).map((part, j, arr) => (
                          <span key={j}>
                            {part}
                            {j < arr.length - 1 && <strong className="font-bold text-[#00B386]">{bold}</strong>}
                          </span>
                        ))}
                      </span>
                    </li>
                  );
                })}
                {/* Extra AI Feature */}
                <li className="flex items-start gap-4 text-base md:text-lg text-foreground bg-mint-light/10 p-4 rounded-xl -mx-4 border border-mint-light/20">
                  <div className="w-6 h-6 rounded-full bg-[#00D69E]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap size={14} className="text-[#00B386] stroke-[3]" />
                  </div>
                  <span className="leading-relaxed">
                    <strong className="font-bold text-[#00B386]">AI Agent Teknolojisi</strong> ile başvuru formlarınız anlık olarak taranır, hata riski <strong className="font-bold text-[#00B386]">sıfıra indirilir.</strong>
                  </span>
                </li>
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
