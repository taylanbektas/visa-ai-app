import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clock,
  BookOpen,
  ArrowRight,
  Tag,
} from "lucide-react";

const categories = ["All", "Schengen", "USA", "UK", "Travel Tips", "Document Guides", "FAQs"];

const articles = [
  {
    id: "schengen-guide",
    title: "The Complete Schengen Visa Guide for Turkish Citizens",
    excerpt: "Everything you need to know about applying for a Schengen visa — from required documents to common rejection reasons.",
    category: "Schengen",
    readTime: "12 min read",
    image: "🇪🇺",
  },
  {
    id: "us-tourist-visa",
    title: "How to Apply for a US Tourist Visa (B-1/B-2) — Step by Step",
    excerpt: "A comprehensive guide covering the DS-160 form, interview preparation, and common refusal reasons under INA 214(b).",
    category: "USA",
    readTime: "15 min read",
    image: "🇺🇸",
  },
  {
    id: "uk-visitor-visa",
    title: "UK Standard Visitor Visa: Everything You Need to Know",
    excerpt: "Online application via UKVI, biometric enrollment, document requirements, and processing times explained.",
    category: "UK",
    readTime: "10 min read",
    image: "🇬🇧",
  },
  {
    id: "rejection-reasons",
    title: "Why Visa Applications Get Rejected (And How to Avoid It)",
    excerpt: "The top 7 rejection reasons with real examples and actionable fixes to strengthen your application.",
    category: "Travel Tips",
    readTime: "8 min read",
    image: "⚠️",
  },
  {
    id: "biometric-photo",
    title: "Biometric Photo Requirements — The Complete Checklist",
    excerpt: "ICAO standards, background specs, expression rules, and size requirements per country all in one place.",
    category: "Document Guides",
    readTime: "6 min read",
    image: "📸",
  },
  {
    id: "cover-letter",
    title: "How to Write a Visa Cover Letter That Gets Approved",
    excerpt: "Structure, tone, what to include and avoid, with a ready-to-use sample letter template.",
    category: "Document Guides",
    readTime: "7 min read",
    image: "✍️",
  },
];

export default function Learn() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = articles.filter((a) => {
    const matchCategory = activeCategory === "All" || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <BookOpen size={24} className="text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Knowledge Base</h1>
          <p className="text-muted-foreground text-lg">
            Expert guides and tips to help you navigate the visa process with confidence.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto mb-8">
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/learn/${article.id}`}
                className="block bg-card border rounded-xl p-6 card-hover h-full"
              >
                <span className="text-3xl mb-4 block">{article.image}</span>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full font-medium text-muted-foreground">
                    {article.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock size={10} /> {article.readTime}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-2 leading-snug">{article.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{article.excerpt}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No articles found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
