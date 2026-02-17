import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, BookOpen } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { articles, articleImages } from "@/data/articles";

/* ── Helper: Calculate reading time ─────────────────────── */
function calcReadTime(text: string, t: (key: string) => string): string {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 150));
  return `${minutes} ${t("article.readTime")}`;
}

function toAnchorId(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/* ── Helper: Render markdown-like content to JSX ─────────── */
function renderContent(content: string) {
  const blocks = content.split("\n\n");
  const elements: JSX.Element[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    // Heading
    if (block.startsWith("## ")) {
      const headingText = block.replace("## ", "");
      const id = toAnchorId(headingText);
      elements.push(
        <h2
          key={i}
          id={id}
          className="text-xl md:text-2xl font-extrabold text-navy-dark mt-10 mb-4"
        >
          {headingText}
        </h2>
      );
      continue;
    }

    // Unordered list (lines starting with * or -)
    if (/^[-*]\s+/.test(block) || /^\*\s{3}/.test(block)) {
      const items = block
        .split("\n")
        .filter((line) => /^[-*]\s+/.test(line.trim()) || /^\*\s{3}/.test(line.trim()));
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-2 text-base md:text-lg pl-2">
          {items.map((item, j) => (
            <li key={j}>
              {renderInline(item.replace(/^[-*]\s+/, "").replace(/^\*\s{3}/, "").trim())}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list (lines starting with number.)
    if (/^\d+\.\s+/.test(block)) {
      const items = block
        .split("\n")
        .filter((line) => /^\d+\.\s+/.test(line.trim()));
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-2 text-base md:text-lg pl-2">
          {items.map((item, j) => (
            <li key={j}>
              {renderInline(item.replace(/^\d+\.\s+/, "").trim())}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-base md:text-lg leading-relaxed">
        {renderInline(block)}
      </p>
    );
  }

  return elements;
}

/* ── Helper: Render inline markdown (bold, italic) ──────── */
function renderInline(text: string): (string | JSX.Element)[] {
  // Process **bold** and remaining * for italic
  const parts: (string | JSX.Element)[] = [];
  // First handle **bold**
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={`b-${match.index}`} className="font-bold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function ArticlePage() {
  const { t, locale } = useLanguage();
  const { id } = useParams<{ id: string }>();

  const currentLang = locale;

  const articleData = id ? articles[id] : null;
  const article = articleData ? articleData[currentLang] : null;

  if (!article) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t("article.notFound")}</h1>
          <Link to="/learn">
            <Button variant="outline">{t("article.backToKnowledgeBase")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const readTime = calcReadTime(article.content, t);

  return (
    <div className="page-shell">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft size={14} /> {t("article.backToKnowledgeBase")}
          </Link>

          {/* Hero Image */}
          {id && articleImages[id] && (
            <div className="rounded-2xl overflow-hidden mb-8 border border-border shadow-sm bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={articleImages[id]}
                alt={article.title}
                className="w-full h-56 md:h-80 object-cover"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/articles/schengen-guide.png";
                }}
              />
            </div>
          )}

          {article.toc.length > 0 && (
            <div className="mb-6 rounded-xl border border-border bg-white p-4 md:hidden">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("article.tableOfContents")}
              </p>
              <div className="flex flex-wrap gap-2">
                {article.toc.map((item) => {
                  const anchorId = toAnchorId(item);

                  return (
                    <a
                      key={item}
                      href={`#${anchorId}`}
                      className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold text-foreground/80"
                    >
                      {item}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-4 md:gap-8">
            {/* Sidebar TOC */}
            <aside className="hidden md:block">
              <div className="sticky top-24">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {t("article.tableOfContents")}
                </h4>
                <nav className="space-y-2">
                  {article.toc.map((item) => {
                    const anchorId = toAnchorId(item);
                    return (
                      <a
                        key={item}
                        href={`#${anchorId}`}
                        className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <motion.article
              className="md:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-3 py-1 bg-secondary rounded-full font-semibold text-muted-foreground">
                  {article.category}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock size={12} /> {readTime}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold mb-8 leading-tight text-navy-dark">
                {article.title}
              </h1>

              <div className="prose max-w-none text-foreground/80 leading-relaxed space-y-5">
                {renderContent(article.content)}
              </div>

              {/* CTA */}
              <div className="mt-12 rounded-2xl bg-gradient-navy p-6 text-primary-foreground md:p-10">
                <h3 className="font-extrabold text-xl mb-3">
                  {t("article.ctaTitle")}
                </h3>
                <p className="text-base opacity-70 mb-5">
                  {t("article.ctaDescription")}
                </p>
                <Link to="/apply">
                  <Button className="btn-gradient text-white font-bold h-12 px-8 text-base rounded-xl">
                    {t("article.ctaButton")} <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Related */}
              {article.related && article.related.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-bold mb-4">{t("article.relatedArticles")}</h3>
                  <div className="grid gap-3">
                    {article.related.map((relId) => {
                      const relData = articles[relId];
                      if (!relData) return null;
                      const rel = relData[currentLang];
                      return (
                        <Link
                          key={relId}
                          to={`/learn/${relId}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-muted/50 transition-colors"
                        >
                          <BookOpen
                            size={16}
                            className="text-accent shrink-0"
                          />
                          <span className="text-sm font-medium">
                            {rel.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.article>
          </div>
        </div>
      </div>
    </div>
  );
}
