import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Search,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { articles, articleImages } from "@/data/articles";

export default function Learn() {
  const { locale, t } = useLanguage();
  // Ensure locale is valid key for articles
  const currentLang = (locale === "tr" || locale === "en") ? locale : "tr";

  const [activeCategory, setActiveCategory] = useState(t("learn.filter.all"));
  const [search, setSearch] = useState("");

  /* ── Helper: Calculate reading time ─────────────────────── */
  const calcReadTime = (text: string) => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 150));
    return `${minutes} ${t("article.readTime")}`;
  };

  /* ── Helper: Generate Excerpt ───────────────────────────── */
  const getExcerpt = (text: string) => {
    // Remove markdown
    const plain = text
      .replace(/[#*`]/g, "") // basic strip
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .split("\n")[0]; // take first paragraph

    return plain.length > 120 ? plain.slice(0, 120) + "..." : plain;
  };

  // Transform articles data to array
  const allArticles = Object.entries(articles).map(([id, data]) => {
    const item = data[currentLang];
    if (!item) return null;
    return {
      id,
      title: item.title,
      category: item.category,
      image: articleImages[id] || "/images/articles/schengen-guide.png", // Fallback image
      readTime: calcReadTime(item.content),
      excerpt: getExcerpt(item.content),
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  // Extract unique categories
  const categories = [t("learn.filter.all"), ...Array.from(new Set(allArticles.map(a => a.category)))];

  // Filter
  const filtered = allArticles.filter((a) => {
    const catMatch = activeCategory === t("learn.filter.all") || a.category === activeCategory;
    const searchMatch = a.title.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
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
            {t("learn.title")} <span className="text-gradient-mint">{t("learn.titleHighlight")}</span>
          </h1>
          <p
            className="text-muted-foreground text-lg md:text-xl"
            dangerouslySetInnerHTML={{ __html: t("learn.subtitle") }}
          />
        </motion.div>

        <div className="max-w-4xl mx-auto mb-10">
          <div className="relative mb-5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("learn.searchPlaceholder")}
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
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/articles/schengen-guide.png"; // Fallback on error
                    }}
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
                  <h3 className="font-bold text-base md:text-lg mb-2 leading-snug text-navy-dark group-hover:text-[#00D69E] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-lg">
            {t("learn.noResults")}
          </div>
        )}
      </div>
    </div>
  );
}
