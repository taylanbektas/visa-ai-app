import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { articles, articleImages } from "@/data/articles";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const currentLang = (locale === "tr" || locale === "en") ? locale : "tr";

  if (!id) return <Navigate to="/learn" replace />;

  const data = articles[id as keyof typeof articles];
  if (!data) return <Navigate to="/learn" replace />;

  const article = data[currentLang];
  if (!article) return <Navigate to="/learn" replace />;

  const image = articleImages[id] || "/images/articles/schengen-guide.png";
  const readTime = Math.max(1, Math.round(article.content.split(/\s+/).filter(Boolean).length / 150));

  return (
    <div className="page-shell section-gradient-light min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl py-8 md:py-12">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-white/50 -ml-2"
          onClick={() => navigate("/learn")}
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("learn.filter.all")}
        </Button>

        <article>
          <div className="rounded-2xl overflow-hidden bg-white border border-border shadow-sm mb-8">
            <img
              src={image}
              alt=""
              className="w-full h-48 md:h-64 object-cover"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="px-3 py-1 bg-secondary rounded-full font-semibold text-foreground">
              {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {readTime} {t("article.readTime")}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-navy-dark mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="prose prose-navy prose-lg max-w-none prose-headings:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-p:leading-relaxed prose-ul:my-4">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {article.related && article.related.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-lg font-bold text-navy-dark mb-4">
                {t("article.relatedArticles")}
              </h2>
              <ul className="space-y-2">
                {article.related.map((relatedId) => {
                  const relatedData = articles[relatedId as keyof typeof articles];
                  const related = relatedData?.[currentLang];
                  if (!related) return null;
                  return (
                    <li key={relatedId}>
                      <Link
                        to={`/learn/${relatedId}`}
                        className="text-[#00D69E] font-semibold hover:underline"
                      >
                        {related.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
