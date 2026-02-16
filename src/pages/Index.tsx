import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  FileText,
  Search,
  Send,
  Star,
  Globe,
  Plane,
  Shield,
  ArrowRight,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stats = [
  { value: "2,400+", label: "Visas Approved" },
  { value: "98.6%", label: "Success Rate" },
  { value: "150+", label: "Countries Covered" },
  { value: "4.9★", label: "Client Rating" },
];

const steps = [
  {
    icon: Search,
    title: "Check Requirements",
    desc: "Use our visa checker to instantly see what you need for your destination.",
  },
  {
    icon: FileText,
    title: "Apply Online",
    desc: "Fill out a guided application form and upload your documents securely.",
  },
  {
    icon: Send,
    title: "Track & Receive",
    desc: "Monitor your application in real-time and get your visa delivered.",
  },
];

const visaTypes = [
  { country: "Schengen", flag: "🇪🇺", desc: "26 European countries", color: "from-blue-500/10 to-blue-600/5" },
  { country: "United States", flag: "🇺🇸", desc: "B1/B2 Tourist & Business", color: "from-red-500/10 to-blue-500/5" },
  { country: "United Kingdom", flag: "🇬🇧", desc: "Standard Visitor Visa", color: "from-red-500/10 to-red-600/5" },
  { country: "Canada", flag: "🇨🇦", desc: "Visitor Visa & eTA", color: "from-red-500/10 to-white/5" },
  { country: "UAE", flag: "🇦🇪", desc: "Tourist & Business Visa", color: "from-green-500/10 to-green-600/5" },
  { country: "Australia", flag: "🇦🇺", desc: "ETA & Visitor Visa", color: "from-blue-500/10 to-yellow-500/5" },
];

const testimonials = [
  {
    name: "Ayşe Karagöz",
    country: "Turkey → France",
    type: "Schengen Visa",
    text: "I was dreading the Schengen application process, but VisaPath made it incredibly smooth. My advisor caught a mistake in my bank statements that would have caused a rejection. Got my visa in 12 days!",
    rating: 5,
  },
  {
    name: "Mehmet Yilmaz",
    country: "Turkey → United States",
    type: "B1/B2 Visa",
    text: "The interview preparation alone was worth the Concierge plan. My advisor walked me through likely questions and helped craft my answers. Approved on my first attempt after a previous refusal.",
    rating: 5,
  },
  {
    name: "Elena Petrov",
    country: "Bulgaria → UK",
    type: "Standard Visitor Visa",
    text: "Applied through VisaPath's Navigator plan. The document review was thorough, and the real-time tracking kept me stress-free. Highly recommend for anyone applying for a UK visa.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How does VisaPath work?",
    a: "VisaPath is a fully online visa consultancy service. You start by checking visa requirements for your destination, then complete a guided application with our expert support. We review your documents, help you prepare for interviews if needed, and track your application from submission to decision.",
  },
  {
    q: "Is VisaPath a government agency?",
    a: "No. VisaPath is an independent visa consultancy service. We are not affiliated with any government or embassy. We help you prepare and submit your visa applications correctly, increasing your chances of approval.",
  },
  {
    q: "What's included in each plan?",
    a: "Our Pathfinder plan ($49) gives you a guided application and document checklist. Navigator ($129) adds expert document review and tracking. Concierge ($249) includes a dedicated advisor, cover letter, and full rejection support. See our pricing page for details.",
  },
  {
    q: "What if my visa gets rejected?",
    a: "With our Concierge plan, you get full rejection support including re-application assistance at no extra cost. For other plans, we offer a discounted re-application service. Our 98.6% success rate means rejections are rare.",
  },
  {
    q: "How long does the visa process take?",
    a: "Processing times vary by country. Schengen visas typically take 10-15 business days, US visas depend on interview availability, and UK visas take 3-6 weeks. We provide estimated timelines in our visa checker tool.",
  },
  {
    q: "Do you handle embassy appointments?",
    a: "Yes! With our Navigator and Concierge plans, we assist with embassy appointment scheduling. For countries that require biometric enrollment, we guide you through the entire process including appointment booking.",
  },
  {
    q: "Can I track my application status?",
    a: "Absolutely. Navigator and Concierge plan users get access to a real-time tracking dashboard where you can monitor every stage of your application. Pathfinder users receive email updates at key milestones.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards through Stripe's secure payment processing. All transactions are encrypted and PCI-DSS compliant. We also offer installment options for the Concierge plan.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-navy min-h-[90vh] flex items-center">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/60 to-navy/90" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 py-32">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Globe size={14} className="text-gold" />
              <span className="text-xs font-medium text-gold-light">
                Trusted by 2,400+ travelers worldwide
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
              Your Visa,{" "}
              <span className="text-gradient-gold">Handled.</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-xl leading-relaxed">
              From Istanbul to the world — fully online, no agency middlemen. Expert guidance for every visa type, every destination.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/apply">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-gold-dark text-base px-8 h-12"
                >
                  Start Your Application
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/visa-checker">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 h-12"
                >
                  Check Visa Requirements
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b bg-card">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                {...fadeInUp}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps to your visa approval
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative text-center"
                {...fadeInUp}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <step.icon size={28} className="text-accent" />
                </div>
                <div className="absolute -top-2 -right-2 md:right-auto md:left-[calc(50%+24px)] w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa Types */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Popular Visa Types
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Expert guidance for the world's most popular destinations
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {visaTypes.map((visa, i) => (
              <motion.div
                key={visa.country}
                {...fadeInUp}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link
                  to="/visa-checker"
                  className={`block p-6 rounded-xl bg-card border card-hover bg-gradient-to-br ${visa.color}`}
                >
                  <span className="text-3xl mb-3 block">{visa.flag}</span>
                  <h3 className="font-semibold mb-1">{visa.country}</h3>
                  <p className="text-xs text-muted-foreground">{visa.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Real stories from real travelers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="bg-card border rounded-xl p-6 card-hover"
                {...fadeInUp}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      className="fill-accent text-accent"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  "{t.text}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.country} · {t.type}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div {...fadeInUp}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
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
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div {...fadeInUp}>
            <Plane size={40} className="text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-md mx-auto">
              Join thousands of travelers who trusted VisaPath for their visa applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/apply">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-gold-dark px-8 h-12"
                >
                  Start Your Application
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/visa-checker">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 h-12"
                >
                  Check Requirements First
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-primary-foreground/50">
              <Shield size={14} />
              <span>Secure payments · No hidden fees · Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
