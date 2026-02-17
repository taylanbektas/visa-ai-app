import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clock,
  BookOpen,
  ArrowRight,
  Search,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const categoriesTR = ["Tümü", "Schengen", "ABD", "İngiltere", "Modern Vize", "Eğitim", "Seyahat İpuçları", "Belge Rehberleri"];
const categoriesEN = ["All", "Schengen", "USA", "UK", "Modern Visa", "Education", "Travel Tips", "Document Guides"];

const articles = [
  {
    id: "schengen-guide",
    titleTR: "Türk Vatandaşları İçin Eksiksiz Schengen Vize Rehberi",
    titleEN: "Complete Schengen Visa Guide for Turkish Citizens",
    excerptTR: "Schengen vizesi başvurusu hakkında bilmeniz gereken her şey — gerekli belgelerden yaygın ret sebeplerine kadar.",
    excerptEN: "Everything you need to know about Schengen visa applications — from required documents to common rejection reasons.",
    category: "Schengen",
    readTimeTR: "12 dk okuma",
    readTimeEN: "12 min read",
    image: "/images/articles/schengen-guide.png",
  },
  {
    id: "us-tourist-visa",
    titleTR: "ABD Turist Vizesi (B-1/B-2) Başvurusu — Adım Adım",
    titleEN: "US Tourist Visa (B-1/B-2) Application — Step by Step",
    excerptTR: "DS-160 formu, mülakat hazırlığı ve INA 214(b) kapsamında yaygın ret sebeplerine dair kapsamlı rehber.",
    excerptEN: "Comprehensive guide on the DS-160 form, interview preparation, and common rejection reasons under INA 214(b).",
    category: "ABD",
    readTimeTR: "15 dk okuma",
    readTimeEN: "15 min read",
    image: "/images/articles/us-tourist-visa.png",
  },
  {
    id: "uk-visitor-visa",
    titleTR: "İngiltere Standart Ziyaretçi Vizesi: Bilmeniz Gereken Her Şey",
    titleEN: "UK Standard Visitor Visa: Everything You Need to Know",
    excerptTR: "UKVI üzerinden online başvuru, biyometrik kayıt, belge gereksinimleri ve işlem süreleri detaylı anlatımı.",
    excerptEN: "Detailed guide on UKVI online application, biometric registration, document requirements, and processing times.",
    category: "İngiltere",
    readTimeTR: "10 dk okuma",
    readTimeEN: "10 min read",
    image: "/images/articles/uk-visitor-visa.png",
  },
  {
    id: "rejection-reasons",
    titleTR: "Vize Başvuruları Neden Reddedilir? (Ve Nasıl Önlenir)",
    titleEN: "Why Are Visa Applications Rejected? (And How to Prevent It)",
    excerptTR: "Gerçek örneklerle en sık karşılaşılan 7 ret sebebi ve başvurunuzu güçlendirecek pratik çözümler.",
    excerptEN: "The 7 most common rejection reasons with real examples and practical solutions to strengthen your application.",
    category: "Seyahat İpuçları",
    readTimeTR: "8 dk okuma",
    readTimeEN: "8 min read",
    image: "/images/articles/rejection-reasons.png",
  },
  {
    id: "biometric-photo",
    titleTR: "Biyometrik Fotoğraf Gereksinimleri — Eksiksiz Kontrol Listesi",
    titleEN: "Biometric Photo Requirements — Complete Checklist",
    excerptTR: "ICAO standartları, arka plan özellikleri, yüz ifadesi kuralları ve ülkelere göre boyut gereksinimleri.",
    excerptEN: "ICAO standards, background requirements, facial expression rules, and size requirements by country.",
    category: "Belge Rehberleri",
    readTimeTR: "6 dk okuma",
    readTimeEN: "6 min read",
    image: "/images/articles/biometric-photo.png",
  },
  {
    id: "cover-letter",
    titleTR: "Onay Alan Bir Vize Niyet Mektubu Nasıl Yazılır?",
    titleEN: "How to Write a Visa Cover Letter That Gets Approved",
    excerptTR: "Yapı, ton, neler dahil edilmeli ve nelerden kaçınılmalı — kullanıma hazır örnek mektup şablonuyla birlikte.",
    excerptEN: "Structure, tone, what to include and what to avoid — with a ready-to-use sample letter template.",
    category: "Belge Rehberleri",
    readTimeTR: "7 dk okuma",
    readTimeEN: "7 min read",
    image: "/images/articles/cover-letter.png",
  },
  {
    id: "digital-nomad",
    titleTR: "Dijital Göçebe Vizesi: Dünyayı Gezerek Çalışın",
    titleEN: "Digital Nomad Visa: Work While Traveling the World",
    excerptTR: "Uzaktan çalışanlar için Portekiz, İspanya ve diğer ülkelerin sunduğu vize fırsatları ve başvuru şartları.",
    excerptEN: "Visa opportunities for remote workers in Portugal, Spain, and other countries — requirements and application process.",
    category: "Modern Vize",
    readTimeTR: "9 dk okuma",
    readTimeEN: "9 min read",
    image: "/images/articles/digital-nomad.png",
  },
  {
    id: "student-visa",
    titleTR: "Avrupa ve Amerika'da Öğrenci Vizesi Rehberi",
    titleEN: "Student Visa Guide for Europe and the USA",
    excerptTR: "Okul kabulü, bloke hesap, gerekli belgeler ve çalışma izni hakkında kapsamlı rehber.",
    excerptEN: "Comprehensive guide on school admission, blocked accounts, required documents, and work permits.",
    category: "Eğitim",
    readTimeTR: "11 dk okuma",
    readTimeEN: "11 min read",
    image: "/images/articles/student-visa.png",
  },
  {
    id: "canada-tourist-visa",
    titleTR: "Kanada Turist Vizesi (TRV) Rehberi",
    titleEN: "Canada Tourist Visa (TRV) Guide",
    excerptTR: "Kanada geçici oturma vizesi başvuru süreci, gerekli belgeler, biyometrik kayıt ve işlem süreleri.",
    excerptEN: "Canada temporary resident visa application process, required documents, biometric registration, and processing times.",
    category: "Seyahat İpuçları",
    readTimeTR: "10 dk okuma",
    readTimeEN: "10 min read",
    image: "/images/articles/schengen-guide.png",
  },
  {
    id: "travel-insurance",
    titleTR: "Vize Başvurusunda Seyahat Sigortası Rehberi",
    titleEN: "Travel Insurance Guide for Visa Applications",
    excerptTR: "Schengen, ABD ve İngiltere vize başvurularında aranan sigorta şartları ve doğru poliçe seçimi.",
    excerptEN: "Insurance requirements for Schengen, US, and UK visa applications and choosing the right policy.",
    category: "Belge Rehberleri",
    readTimeTR: "7 dk okuma",
    readTimeEN: "7 min read",
    image: "/images/articles/biometric-photo.png",
  },
  {
    id: "transit-visa",
    titleTR: "Transit Vize Nedir, Ne Zaman Gerekir?",
    titleEN: "What Is a Transit Visa and When Do You Need One?",
    excerptTR: "Aktarmalı uçuşlarda transit vize gereksinimleri, ülkelere göre kurallar ve muafiyet şartları.",
    excerptEN: "Transit visa requirements for connecting flights, country-specific rules, and exemption conditions.",
    category: "Seyahat İpuçları",
    readTimeTR: "6 dk okuma",
    readTimeEN: "6 min read",
    image: "/images/articles/cover-letter.png",
  },
  {
    id: "first-time-abroad",
    titleTR: "İlk Kez Yurtdışına Çıkacaklar İçin Rehber",
    titleEN: "First-Time International Traveler's Guide",
    excerptTR: "Pasaport çıkarmadan vize başvurusuna, bavul hazırlığından havalimanı süreçlerine kadar eksiksiz rehber.",
    excerptEN: "Complete guide from getting your passport to visa applications, packing tips to airport procedures.",
    category: "Seyahat İpuçları",
    readTimeTR: "9 dk okuma",
    readTimeEN: "9 min read",
    image: "/images/articles/us-tourist-visa.png",
  },
];

// Map category from TR to EN for matching
const categoryMapTRtoEN: Record<string, string> = {
  "Schengen": "Schengen",
  "ABD": "USA",
  "İngiltere": "UK",
  "Modern Vize": "Modern Visa",
  "Eğitim": "Education",
  "Seyahat İpuçları": "Travel Tips",
  "Belge Rehberleri": "Document Guides",
};

export default function Learn() {
  const { locale, t } = useLanguage();
  const isEN = locale === "en";
  const categories = isEN ? categoriesEN : categoriesTR;
  const allLabel = isEN ? "All" : "Tümü";

  const [activeCategory, setActiveCategory] = useState(allLabel);
  const [search, setSearch] = useState("");

  const filtered = articles.filter((a) => {
    const catMatch = activeCategory === allLabel ||
      (isEN ? categoryMapTRtoEN[a.category] === activeCategory : a.category === activeCategory);
    const title = isEN ? a.titleEN : a.titleTR;
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    return catMatch && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 section-gradient-light">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-14 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy-dark mb-4">
            {isEN ? "Visa" : "Vize"} <span className="text-gradient-mint">{isEN ? "Guide" : "Rehberi"}</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            {isEN
              ? <>Expert guides and tips to help you navigate the visa process with <strong className="text-foreground">confidence</strong>.</>
              : <>Vize sürecini güvenle yönetmenize yardımcı olacak <strong className="text-foreground">uzman rehberler</strong> ve ipuçları.</>
            }
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto mb-10">
          <div className="relative mb-5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={isEN ? "Search articles..." : "Makale ara..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-14 text-base bg-white border-border"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${activeCategory === cat
                  ? "btn-gradient text-white shadow-md"
                  : "bg-white border border-border text-muted-foreground hover:border-[#00D69E]/40 hover:text-[#00D69E]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/learn/${article.id}`}
                className="block bg-white border border-border rounded-2xl overflow-hidden card-hover h-full group"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={isEN ? article.titleEN : article.titleTR}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-3 py-1 bg-secondary rounded-full font-semibold text-muted-foreground">
                      {isEN ? (categoryMapTRtoEN[article.category] || article.category) : article.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {isEN ? article.readTimeEN : article.readTimeTR}
                    </span>
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-2 leading-snug text-navy-dark group-hover:text-[#00D69E] transition-colors">
                    {isEN ? article.titleEN : article.titleTR}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {isEN ? article.excerptEN : article.excerptTR}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-lg">
            {isEN ? "No articles found matching your criteria." : "Arama kriterlerinize uygun makale bulunamadı."}
          </div>
        )}
      </div>
    </div>
  );
}
