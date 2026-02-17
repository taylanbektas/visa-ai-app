import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, HelpCircle, MessageCircle, Globe, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Locale } from "@/i18n/translations";

const navLinks = [
  { labelKey: "nav.home", to: "/" },
  { labelKey: "nav.pricing", to: "/pricing" },
  { labelKey: "nav.learn", to: "/learn" },
];

const helpLinks = [
  { labelKey: "nav.faq", to: "/#sss", icon: HelpCircle },
  { labelKey: "nav.contact", to: "/contact", icon: MessageCircle },
  { labelKey: "nav.whatsapp", href: "https://wa.me/905XXXXXXXXX", icon: MessageCircle },
];

const languages = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const location = useLocation();
  const helpRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsOpen(false); setHelpOpen(false); setLangOpen(false); }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLang = languages.find((l) => l.code === locale)!;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border/50" : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-3xl">✈️</span>
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-navy-dark">Visa</span>
              <span className="text-gradient-mint">Path</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-lg font-semibold transition-colors hover:text-[#00D69E] ${location.pathname === link.to ? "text-[#00D69E]" : "text-foreground/80"
                  }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}

            {/* Help Dropdown */}
            <div className="relative" ref={helpRef}>
              <button
                onClick={() => { setHelpOpen(!helpOpen); setLangOpen(false); }}
                className="flex items-center gap-1 text-lg font-semibold text-foreground/80 hover:text-[#00D69E] transition-colors"
              >
                {t("nav.help")} <ChevronDown size={14} className={`transition-transform ${helpOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {helpOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-lg py-2 z-50"
                  >
                    {helpLinks.map((item) =>
                      item.href ? (
                        <a
                          key={item.labelKey}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-2.5 text-base text-foreground/80 hover:bg-secondary hover:text-[#00D69E] transition-colors"
                        >
                          <item.icon size={16} /> {t(item.labelKey)}
                        </a>
                      ) : (
                        <Link
                          key={item.labelKey}
                          to={item.to!}
                          className="flex items-center gap-3 px-4 py-2.5 text-base text-foreground/80 hover:bg-secondary hover:text-[#00D69E] transition-colors"
                          onClick={() => {
                            setHelpOpen(false);
                            if (item.to?.includes("#")) {
                              const [path, hash] = item.to.split("#");
                              if (window.location.pathname === path || path === "/") {
                                setTimeout(() => {
                                  document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
                                }, 100);
                              }
                            }
                          }}
                        >
                          <item.icon size={16} /> {t(item.labelKey)}
                        </Link>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangOpen(!langOpen); setHelpOpen(false); }}
                className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors border border-border rounded-lg px-2.5 py-1.5"
              >
                <span>{activeLang.flag}</span>
                <span className="hidden lg:inline">{activeLang.code.toUpperCase()}</span>
                <ChevronDown size={12} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full right-0 mt-2 w-40 bg-white border border-border rounded-xl shadow-lg py-1 z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLocale(lang.code as Locale);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-secondary ${locale === lang.code ? "text-[#00D69E] font-semibold" : "text-foreground/80"
                          }`}
                      >
                        <span className="text-lg">{lang.flag}</span> {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth — grouped close together */}
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button className="font-bold px-6 h-11 text-base rounded-full bg-[#1a2332] text-white hover:bg-[#2a3a4e] transition-colors shadow-sm">
                  <LogIn size={16} className="mr-1.5" /> {t("nav.login")}
                </Button>
              </Link>

              <Link to="/apply">
                <Button className="btn-gradient text-white font-bold px-6 h-11 text-base rounded-full shadow-md">
                  {t("nav.apply")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-2 text-base font-medium ${location.pathname === link.to ? "text-[#00D69E]" : "text-foreground/70"
                    }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <Link to="/login" className="block py-2 text-base font-medium text-foreground/70">
                {t("nav.login")}
              </Link>

              {/* Mobile Language */}
              <div className="flex gap-2 pt-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code as Locale);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm ${locale === lang.code ? "border-[#00D69E] bg-[#00D69E]/5 text-[#00D69E] font-semibold" : "border-border text-foreground/70"
                      }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>

              <Link to="/apply" className="block pt-2">
                <Button className="w-full btn-gradient text-white font-bold text-base rounded-full h-12">
                  {t("nav.apply")}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
