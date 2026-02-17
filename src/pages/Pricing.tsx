import { useState } from "react";
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
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Star,
  ShieldCheck,
  X,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Quiz Logic Helper ──────────────────────────────────── */
function getRecommendation(answers: string[]): string {
  let score = 0;
  for (const a of answers) {
    if (a === "no") score += 1;
    if (a === "partial") score += 0.5;
  }
  if (score <= 1) return "starter";
  if (score <= 2) return "pro";
  return "elite";
}

export default function Pricing() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const { t, locale } = useLanguage();

  /* ── Data with Translations ───────────────────────────── */
  const questions = [
    {
      q: t("pricing.quiz.q1"),
      options: [{ label: t("pricing.quiz.opt.yes"), value: "yes" }, { label: t("pricing.quiz.opt.no"), value: "no" }]
    },
    {
      q: t("pricing.quiz.q2"),
      options: [{ label: t("pricing.quiz.opt.canDo"), value: "yes" }, { label: t("pricing.quiz.opt.partial"), value: "partial" }, { label: t("pricing.quiz.opt.support"), value: "no" }]
    },
    {
      q: t("pricing.quiz.q3"),
      options: [{ label: t("pricing.quiz.opt.absolute"), value: "yes" }, { label: t("pricing.quiz.opt.noNeed"), value: "no" }]
    },
  ];

  const plans = [
    {
      id: "starter",
      name: t("pricing.plan.starter.id"),
      subtitle: t("pricing.plan.starter.sub"),
      price: "49",
      features: [
        t("pricing.plan.feature.guide"),
        t("pricing.plan.feature.checklist"),
        t("pricing.plan.feature.ai"),
        t("pricing.plan.feature.email"),
        t("pricing.plan.feature.kb"),
      ],
    },
    {
      id: "pro",
      name: t("pricing.plan.pro.id"),
      subtitle: t("pricing.plan.pro.sub"),
      price: "149",
      popular: true,
      features: [
        t("pricing.plan.feature.starterAll"),
        t("pricing.plan.feature.expertReview"),
        t("pricing.plan.feature.appSupport"),
        t("pricing.plan.feature.aiVerify"),
        t("pricing.plan.feature.tracking"),
        t("pricing.plan.feature.phone"),
        t("pricing.plan.feature.reapply"),
      ],
    },
    {
      id: "elite",
      name: t("pricing.plan.elite.id"),
      subtitle: t("pricing.plan.elite.sub"),
      price: "349",
      features: [
        t("pricing.plan.feature.proAll"),
        t("pricing.plan.feature.consultant"),
        t("pricing.plan.feature.whatsapp"),
        t("pricing.plan.feature.travelPlan"),
        t("pricing.plan.feature.hotel"),
        t("pricing.plan.feature.airport"),
        t("pricing.plan.feature.guarantee"),
        t("pricing.plan.feature.priority"),
      ],
    },
  ];

  const compareFeatures = [
    { feature: t("pricing.plan.feature.guide"), starter: true, pro: true, elite: true },
    { feature: t("pricing.plan.feature.checklist"), starter: true, pro: true, elite: true },
    { feature: t("pricing.plan.feature.ai"), starter: true, pro: true, elite: true },
    { feature: t("pricing.plan.feature.expertReview"), starter: false, pro: true, elite: true },
    { feature: t("pricing.plan.feature.appSupport"), starter: false, pro: true, elite: true },
    { feature: t("pricing.plan.feature.phone"), starter: false, pro: true, elite: true },
    { feature: t("pricing.plan.feature.consultant"), starter: false, pro: false, elite: true },
    { feature: t("pricing.plan.feature.whatsapp"), starter: false, pro: false, elite: true },
    { feature: t("pricing.plan.feature.travelPlan"), starter: false, pro: false, elite: true },
    { feature: t("pricing.plan.feature.guarantee"), starter: false, pro: false, elite: true },
    { feature: t("pricing.comp.row.avgPrice"), starter: "€49", pro: "€149", elite: "€349" },
  ];

  const competitorRows = [
    { feature: t("pricing.comp.row.avgPrice"), us: t("pricing.comp.val.vp.price"), them: t("pricing.comp.val.trad.price") },
    { feature: t("pricing.comp.row.personal"), us: t("pricing.comp.val.vp.personal"), them: t("pricing.comp.val.trad.personal") },
    { feature: t("pricing.comp.row.error"), us: t("pricing.comp.val.vp.error"), them: t("pricing.comp.val.trad.error") },
    { feature: t("pricing.comp.row.contact"), us: t("pricing.comp.val.vp.contact"), them: t("pricing.comp.val.trad.contact") },
    { feature: t("pricing.comp.row.refund"), us: t("pricing.comp.val.vp.refund"), them: t("pricing.comp.val.trad.refund") },
    { feature: t("pricing.comp.row.process"), us: t("pricing.comp.val.vp.process"), them: t("pricing.comp.val.trad.process") },
    { feature: t("pricing.comp.row.tech"), us: t("pricing.comp.val.vp.tech"), them: t("pricing.comp.val.trad.tech") },
  ];

  const faqs = [
    { q: t("pricing.faq.q1"), a: t("pricing.faq.a1") },
    { q: t("pricing.faq.q2"), a: t("pricing.faq.a2") },
    { q: t("pricing.faq.q3"), a: t("pricing.faq.a3") },
    { q: t("pricing.faq.q4"), a: t("pricing.faq.a4") },
    { q: t("pricing.faq.q5"), a: t("pricing.faq.a5") },
  ];

  /* ── Handlers ─────────────────────────────────────────── */
  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setRecommendation(getRecommendation(newAnswers));
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQ(0);
    setAnswers([]);
    setRecommendation(null);
  };

  return (
    <div className="page-shell section-gradient-light">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy-dark mb-4">
            {t("pricing.title")} <span className="text-gradient-mint">{t("pricing.titleHighlight")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto" dangerouslySetInnerHTML={{ __html: t("pricing.subtitle") }} />
        </div>

        {/* Quiz */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="bg-white border border-border rounded-2xl p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={20} className="text-[#00D69E]" />
              <h3 className="font-bold text-lg">{t("pricing.quiz.title")}</h3>
            </div>

            <AnimatePresence mode="wait">
              {!quizStarted && !recommendation && (
                <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-[15px] text-muted-foreground mb-5">{t("pricing.quiz.desc")}</p>
                  <Button onClick={() => setQuizStarted(true)} className="btn-gradient text-white font-bold w-full h-12 rounded-xl text-[15px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    {t("pricing.quiz.btnStart")} <ArrowRight size={16} className="ml-2" />
                  </Button>
                </motion.div>
              )}

              {quizStarted && !recommendation && (
                <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {t("pricing.quiz.question")} {currentQ + 1} / {questions.length}
                  </p>
                  <p className="font-semibold text-[15px] mb-5">{questions[currentQ].q}</p>
                  <div
                    className={`grid gap-3 ${questions[currentQ].options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
                      }`}
                  >
                    {questions[currentQ].options.map((opt) => (
                      <Button
                        key={opt.value}
                        variant="outline"
                        className="h-12 w-full font-semibold text-[15px] hover:bg-[#00D69E]/5 hover:border-[#00D69E] hover:text-[#00B386] rounded-xl"
                        onClick={() => handleAnswer(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              {recommendation && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={20} className="text-[#00D69E]" />
                    <p className="font-bold text-[15px]">
                      {t("pricing.quiz.result.rec")} <span className="text-[#00D69E] capitalize">{t(`pricing.plan.${recommendation}.id`)} Plan</span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    {t(`pricing.quiz.result.${recommendation}`)}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/apply" className="flex-1">
                      <Button className="w-full btn-gradient text-white font-bold h-12 rounded-xl text-[15px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        {locale === "en" ?
                          <>{t("pricing.quiz.btnStartPlan")} {t(`pricing.plan.${recommendation}.id`)}</> :
                          <>{t(`pricing.plan.${recommendation}.id`)} {t("pricing.quiz.btnStartPlan")}</>
                        }
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={resetQuiz} className="text-muted-foreground font-semibold">
                      {t("pricing.quiz.btnRetry")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-20">
          {plans.map((plan) => {
            const isRecommended = recommendation === plan.id;
            return (
              <motion.div
                key={plan.id}
                className={`bg-white rounded-2xl border-2 p-7 md:p-9 relative flex flex-col ${plan.popular
                  ? "border-[#00D69E]/60 shadow-lg"
                  : isRecommended
                    ? "border-[#00D69E]/60 shadow-lg"
                    : "border-border"
                  }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 w-max max-w-[95%] justify-center z-10 flex-wrap">
                  {plan.popular && (
                    <div className="btn-gradient text-white text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md whitespace-nowrap">
                      <Star size={13} className="fill-white" /> {t("pricing.plan.popular")}
                    </div>
                  )}
                  {isRecommended && (
                    <div className="bg-navy-dark text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      ✨ {t("pricing.plan.recommended")}
                    </div>
                  )}
                </div>

                <div className="mb-6 mt-2">
                  <h3 className="text-xl font-extrabold text-navy-dark">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.subtitle}</p>
                </div>

                <div className="mb-7">
                  <span className="text-4xl md:text-5xl font-extrabold text-navy-dark">€{plan.price}</span>
                  <span className="text-muted-foreground font-medium ml-1">{t("pricing.plan.perApp")}</span>
                </div>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[15px]">
                      <CheckCircle size={18} className="text-[#00D69E] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/apply">
                  <Button
                    className={`w-full font-bold h-12 text-base rounded-xl transition-all duration-300 ${plan.popular || isRecommended
                        ? "btn-gradient text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                        : "bg-secondary text-foreground hover:bg-secondary/80 hover:scale-[1.01]"
                      }`}
                  >
                    {locale === "en" ? <>{t("pricing.plan.btn")} {plan.name}</> : <>{plan.name} {t("pricing.plan.btn")}</>}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ━━━ COMPETITOR COMPARISON ━━━ */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-navy-dark mb-4">
            {t("pricing.comp.title")} <span className="text-gradient-mint">{t("pricing.comp.highlight")}</span>
          </h2>
          <p className="text-center text-muted-foreground text-xl mb-12 max-w-lg mx-auto" dangerouslySetInnerHTML={{ __html: t("pricing.comp.desc") }} />

          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-3 border-b border-border">
              <div className="p-5 font-bold text-muted-foreground text-base"></div>
              <div className="p-5 text-center border-l border-border">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xl">✈️</span>
                  <span className="font-extrabold text-lg text-navy-dark">{t("pricing.comp.col.vp")}</span>
                </div>
                <span className="text-base font-bold text-[#00D69E]">{t("roi.modern_trust")}</span>
              </div>
              <div className="p-5 text-center border-l border-border">
                <span className="font-bold text-base text-muted-foreground">{t("pricing.comp.col.traditional")}</span>
                <p className="text-sm text-muted-foreground/60 mt-0.5">{t("pricing.comp.row.avgPrice")}</p>
              </div>
            </div>

            {/* Desktop rows */}
            <div className="hidden md:block">
              {competitorRows.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 ${i < competitorRows.length - 1 ? "border-b border-border/50" : ""}`}>
                  <div className="p-4 md:p-5 text-base md:text-lg font-semibold text-foreground flex items-center">{row.feature}</div>
                  <div className="p-4 md:p-5 text-center border-l border-border/50 flex items-center justify-center gap-2">
                    <CheckCircle size={18} className="text-[#00D69E] shrink-0" />
                    <span className="text-base font-medium text-foreground">{row.us}</span>
                  </div>
                  <div className="p-4 md:p-5 text-center border-l border-border/50 flex items-center justify-center gap-2">
                    <X size={18} className="text-muted-foreground/40 shrink-0" />
                    <span className="text-base text-muted-foreground">{row.them}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile card layout */}
            <div className="md:hidden divide-y divide-border">
              {competitorRows.map((row, i) => (
                <div key={i} className="p-4 space-y-2">
                  <p className="font-bold text-base text-navy-dark">{row.feature}</p>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-[#00D69E] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-[#00D69E] uppercase">{t("pricing.comp.col.vp")}</span>
                      <p className="text-sm font-medium text-foreground">{row.us}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <X size={16} className="text-muted-foreground/40 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase">{t("pricing.comp.col.traditional")}</span>
                      <p className="text-sm text-muted-foreground">{row.them}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-extrabold text-center text-navy-dark mb-12">
            {t("pricing.table.title")}
          </h2>

          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 border-b border-border">
                <div className="p-5 font-bold text-base text-muted-foreground">{t("pricing.table.feature")}</div>
                <div className="p-5 text-center font-bold text-base border-l border-border">{t("pricing.plan.starter.id")}</div>
                <div className="p-5 text-center font-bold text-base border-l border-border text-[#00D69E]">{t("pricing.plan.pro.id")}</div>
                <div className="p-5 text-center font-bold text-base border-l border-border">{t("pricing.plan.elite.id")}</div>
              </div>
              {compareFeatures.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 ${i < compareFeatures.length - 1 ? "border-b border-border/50" : ""}`}>
                  <div className="p-5 text-base md:text-lg font-medium">{row.feature}</div>
                  {(["starter", "pro", "elite"] as const).map((plan) => (
                    <div key={plan} className="p-5 text-center border-l border-border/50 flex items-center justify-center">
                      {typeof row[plan] === "boolean" ? (
                        row[plan] ? (
                          <CheckCircle size={18} className="text-[#00D69E] mx-auto" />
                        ) : (
                          <XCircle size={18} className="text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className={`font-bold text-[15px] ${plan === "pro" ? "text-[#00D69E]" : ""}`}>{row[plan]}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="md:hidden overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="grid grid-cols-4 border-b border-border">
                  <div className="p-3 font-bold text-sm text-muted-foreground">{t("pricing.table.feature")}</div>
                  <div className="p-3 text-center font-bold text-sm border-l border-border">{t("pricing.plan.starter.id")}</div>
                  <div className="p-3 text-center font-bold text-sm border-l border-border text-[#00D69E]">{t("pricing.plan.pro.id")}</div>
                  <div className="p-3 text-center font-bold text-sm border-l border-border">{t("pricing.plan.elite.id")}</div>
                </div>
                {compareFeatures.map((row, i) => (
                  <div key={i} className={`grid grid-cols-4 ${i < compareFeatures.length - 1 ? "border-b border-border/50" : ""}`}>
                    <div className="p-3 text-sm font-medium">{row.feature}</div>
                    {(["starter", "pro", "elite"] as const).map((plan) => (
                      <div key={plan} className="p-3 text-center border-l border-border/50 flex items-center justify-center">
                        {typeof row[plan] === "boolean" ? (
                          row[plan] ? (
                            <CheckCircle size={16} className="text-[#00D69E] mx-auto" />
                          ) : (
                            <XCircle size={16} className="text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className={`font-bold text-xs ${plan === "pro" ? "text-[#00D69E]" : ""}`}>{row[plan]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="rounded-2xl p-8 md:p-10 text-center bg-white border-2 border-[#00D69E]/20 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#00D69E]/10 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={32} className="text-[#00D69E]" />
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-navy-dark mb-3">{t("pricing.guarantee.title")}</h3>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed max-w-md mx-auto mb-4" dangerouslySetInnerHTML={{ __html: t("pricing.guarantee.text") }} />
            <p className="text-sm text-muted-foreground">{t("pricing.guarantee.note")}</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto" id="sss">
          <h2 className="text-3xl font-extrabold text-center text-navy-dark mb-12">
            {t("pricing.faq.title")} <span className="text-gradient-mint">{t("pricing.faq.titleSuffix")}</span>
          </h2>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-border rounded-xl px-6">
                <AccordionTrigger className="text-base md:text-lg font-semibold text-left py-5 [&[data-state=open]]:text-[#00D69E]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
