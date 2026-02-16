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

const categories = ["Tümü", "Schengen", "ABD", "İngiltere", "Modern Vize", "Eğitim", "Seyahat İpuçları", "Belge Rehberleri"];

const articles = [
  {
    id: "schengen-guide",
    title: "Türk Vatandaşları İçin Eksiksiz Schengen Vize Rehberi",
    excerpt: "Schengen vizesi başvurusu hakkında bilmeniz gereken her şey — gerekli belgelerden yaygın ret sebeplerine kadar.",
    category: "Schengen",
    readTime: "12 dk okuma",
    image: "/images/articles/schengen-guide.png",
  },
  {
    id: "us-tourist-visa",
    title: "ABD Turist Vizesi (B-1/B-2) Başvurusu — Adım Adım",
    excerpt: "DS-160 formu, mülakat hazırlığı ve INA 214(b) kapsamında yaygın ret sebeplerine dair kapsamlı rehber.",
    category: "ABD",
    readTime: "15 dk okuma",
    image: "/images/articles/us-tourist-visa.png",
  },
  {
    id: "uk-visitor-visa",
    title: "İngiltere Standart Ziyaretçi Vizesi: Bilmeniz Gereken Her Şey",
    excerpt: "UKVI üzerinden online başvuru, biyometrik kayıt, belge gereksinimleri ve işlem süreleri detaylı anlatımı.",
    category: "İngiltere",
    readTime: "10 dk okuma",
    image: "/images/articles/uk-visitor-visa.png",
  },
  {
    id: "rejection-reasons",
    title: "Vize Başvuruları Neden Reddedilir? (Ve Nasıl Önlenir)",
    excerpt: "Gerçek örneklerle en sık karşılaşılan 7 ret sebebi ve başvurunuzu güçlendirecek pratik çözümler.",
    category: "Seyahat İpuçları",
    readTime: "8 dk okuma",
    image: "/images/articles/rejection-reasons.png",
  },
  {
    id: "biometric-photo",
    title: "Biyometrik Fotoğraf Gereksinimleri — Eksiksiz Kontrol Listesi",
    excerpt: "ICAO standartları, arka plan özellikleri, yüz ifadesi kuralları ve ülkelere göre boyut gereksinimleri.",
    category: "Belge Rehberleri",
    readTime: "6 dk okuma",
    image: "/images/articles/biometric-photo.png",
  },
  {
    id: "cover-letter",
    title: "Onay Alan Bir Vize Niyet Mektubu Nasıl Yazılır?",
    excerpt: "Yapı, ton, neler dahil edilmeli ve nelerden kaçınılmalı — kullanıma hazır örnek mektup şablonuyla birlikte.",
    category: "Belge Rehberleri",
    readTime: "7 dk okuma",
    image: "/images/articles/cover-letter.png",
  },
  {
    id: "digital-nomad",
    title: "Dijital Göçebe Vizesi: Dünyayı Gezerek Çalışın",
    excerpt: "Uzaktan çalışanlar için Portekiz, İspanya ve diğer ülkelerin sunduğu vize fırsatları ve başvuru şartları.",
    category: "Modern Vize",
    readTime: "9 dk okuma",
    image: "/images/articles/digital-nomad.png",
  },
  {
    id: "student-visa",
    title: "Avrupa ve Amerika'da Öğrenci Vizesi Rehberi",
    excerpt: "Okul kabulü, bloke hesap, gerekli belgeler ve çalışma izni hakkında kapsamlı rehber.",
    category: "Eğitim",
    readTime: "11 dk okuma",
    image: "/images/articles/student-visa.png",
  },
];

export default function Learn() {
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [search, setSearch] = useState("");

  const filtered = articles.filter((a) => {
    const matchCategory = activeCategory === "Tümü" || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
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
            Bilgi <span className="text-gradient-mint">Bankası</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Vize sürecini güvenle yönetmenize yardımcı olacak <strong className="text-foreground">uzman rehberler</strong> ve ipuçları.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto mb-10">
          <div className="relative mb-5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Makale ara..."
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
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-3 py-1 bg-secondary rounded-full font-semibold text-muted-foreground">
                      {article.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-2 leading-snug text-navy-dark group-hover:text-[#00D69E] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{article.excerpt}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-lg">
            Arama kriterlerinize uygun makale bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
