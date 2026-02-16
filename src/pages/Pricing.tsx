import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  X,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Crown,
} from "lucide-react";

const plans = [
  {
    name: "Pathfinder",
    subtitle: "Self-guided",
    price: 49,
    icon: Zap,
    popular: false,
    features: [
      { text: "Document checklist", included: true },
      { text: "Application form pre-filled", included: true },
      { text: "Submission guide PDF", included: true },
      { text: "Email support (48h response)", included: true },
      { text: "Expert document review", included: false },
      { text: "Appointment booking", included: false },
      { text: "Real-time tracking", included: false },
      { text: "Dedicated advisor", included: false },
    ],
  },
  {
    name: "Navigator",
    subtitle: "Most Popular",
    price: 129,
    icon: Star,
    popular: true,
    features: [
      { text: "Document checklist", included: true },
      { text: "Application form pre-filled", included: true },
      { text: "Submission guide PDF", included: true },
      { text: "Expert document review (24h)", included: true },
      { text: "Appointment booking assistance", included: true },
      { text: "Real-time tracking dashboard", included: true },
      { text: "WhatsApp/chat support", included: true },
      { text: "1 revision round", included: true },
      { text: "Dedicated advisor", included: false },
      { text: "Cover letter written for you", included: false },
    ],
  },
  {
    name: "Concierge",
    subtitle: "Full-service",
    price: 249,
    icon: Crown,
    popular: false,
    features: [
      { text: "Everything in Navigator", included: true },
      { text: "Dedicated visa advisor", included: true },
      { text: "Cover letter written for you", included: true },
      { text: "Rejection support & re-application", included: true },
      { text: "Priority processing", included: true },
      { text: "100% money-back guarantee*", included: true },
    ],
  },
];

const comparisonFeatures = [
  { feature: "Document Checklist", pathfinder: true, navigator: true, concierge: true },
  { feature: "Pre-filled Application", pathfinder: true, navigator: true, concierge: true },
  { feature: "Submission Guide", pathfinder: true, navigator: true, concierge: true },
  { feature: "Email Support", pathfinder: "48h", navigator: "24h", concierge: "Priority" },
  { feature: "Expert Document Review", pathfinder: false, navigator: true, concierge: true },
  { feature: "Appointment Booking", pathfinder: false, navigator: true, concierge: true },
  { feature: "Real-time Tracking", pathfinder: false, navigator: true, concierge: true },
  { feature: "WhatsApp/Chat Support", pathfinder: false, navigator: true, concierge: true },
  { feature: "Revision Rounds", pathfinder: false, navigator: "1", concierge: "Unlimited" },
  { feature: "Dedicated Advisor", pathfinder: false, navigator: false, concierge: true },
  { feature: "Cover Letter", pathfinder: false, navigator: false, concierge: true },
  { feature: "Rejection Support", pathfinder: false, navigator: false, concierge: true },
  { feature: "Money-back Guarantee", pathfinder: false, navigator: false, concierge: true },
];

const pricingFaqs = [
  { q: "Can I get a refund if my visa is rejected?", a: "Concierge plan includes a 100% money-back guarantee if the rejection is due to our error. For other plans, we offer discounted re-application services." },
  { q: "What happens after I pay?", a: "You'll receive immediate access to your application dashboard. For Navigator and Concierge plans, an advisor will be assigned within 2 hours during business hours." },
  { q: "Can I upgrade my plan later?", a: "Yes! You can upgrade at any time by paying the difference. Your application progress will be preserved." },
  { q: "Are there any hidden fees?", a: "No hidden fees. The price you see covers our full service. Government visa fees (paid to the embassy) are separate and clearly communicated upfront." },
  { q: "Do you offer payment plans?", a: "We offer installment options for the Concierge plan. Contact support for details." },
];

export default function Pricing() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the level of support you need. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative bg-card border rounded-xl p-6 flex flex-col ${
                plan.popular
                  ? "border-accent shadow-lg shadow-accent/10 ring-1 ring-accent/20"
                  : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <plan.icon size={20} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground text-sm"> / application</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check size={16} className="text-success mt-0.5 shrink-0" />
                    ) : (
                      <X size={16} className="text-muted-foreground/30 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${f.included ? "" : "text-muted-foreground/50"}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to="/apply">
                <Button
                  className={`w-full h-11 ${
                    plan.popular
                      ? "bg-accent text-accent-foreground hover:bg-gold-dark"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          className="max-w-5xl mx-auto mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Feature</th>
                    <th className="text-center p-4 font-medium">Pathfinder</th>
                    <th className="text-center p-4 font-medium text-accent">Navigator</th>
                    <th className="text-center p-4 font-medium">Concierge</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                      <td className="p-4 text-muted-foreground">{row.feature}</td>
                      {(["pathfinder", "navigator", "concierge"] as const).map((plan) => (
                        <td key={plan} className="text-center p-4">
                          {row[plan] === true ? (
                            <Check size={16} className="text-success mx-auto" />
                          ) : row[plan] === false ? (
                            <X size={16} className="text-muted-foreground/30 mx-auto" />
                          ) : (
                            <span className="text-xs font-medium">{row[plan]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Pricing FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Pricing FAQ</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {pricingFaqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border rounded-xl px-6"
              >
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield size={14} />
              <span>All payments secured by Stripe · PCI-DSS compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
