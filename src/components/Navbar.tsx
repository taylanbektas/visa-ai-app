import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, HelpCircle, MessageCircle, Globe, User, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const helpRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsOpen(false); setHelpOpen(false); setLangOpen(false); setUserMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLang = languages.find((l) => l.code === locale)!;
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border/50" : "bg-transparent"}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
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
              <Link key={link.to} to={link.to} className={`text-lg font-bold transition-colors hover:text-accent ${location.pathname === link.to ? "text-accent" : "text-foreground/90"}`}>
                {t(link.labelKey)}
              </Link>
            ))}

            {/* Help Dropdown */}
            <div className="relative" ref={helpRef}>
              <button onClick={() => { setHelpOpen(!helpOpen); setLangOpen(false); }} className="flex items-center gap-1 text-lg font-bold text-foreground/90 hover:text-accent transition-colors">
                {t("nav.help")} <ChevronDown size={14} className={`transition-transform ${helpOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {helpOpen && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-lg py-2 z-50">
                    {helpLinks.map((item) =>
                      item.href ? (
                        <a key={item.labelKey} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-base text-foreground/80 hover:bg-secondary hover:text-accent transition-colors">
                          <item.icon size={16} /> {t(item.labelKey)}
                        </a>
                      ) : (
                        <Link key={item.labelKey} to={item.to!} className="flex items-center gap-3 px-4 py-2.5 text-base text-foreground/80 hover:bg-secondary hover:text-accent transition-colors"
                          onClick={() => {
                            setHelpOpen(false);
                            if (item.to?.includes("#")) {
                              const [path, hash] = item.to.split("#");
                              if (window.location.pathname === path || path === "/") {
                                setTimeout(() => { document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }); }, 100);
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
              <button onClick={() => { setLangOpen(!langOpen); setHelpOpen(false); }} className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors border border-border rounded-lg px-2.5 py-1.5">
                <span>{activeLang.flag}</span>
                <span className="hidden lg:inline">{activeLang.code.toUpperCase()}</span>
                <ChevronDown size={12} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full right-0 mt-2 w-40 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
                    {languages.map((lang) => (
                      <button key={lang.code} onClick={() => { setLocale(lang.code as Locale); setLangOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-secondary ${locale === lang.code ? "text-accent font-semibold" : "text-foreground/80"}`}>
                        <span className="text-lg">{lang.flag}</span> {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth */}
            <div className="flex items-center gap-2">
              {!loading && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 font-bold px-4 h-11 text-base rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                  >
                    <User size={16} />
                    <span className="max-w-[120px] truncate">{displayName}</span>
                    <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full right-0 mt-2 w-52 bg-white border border-border rounded-xl shadow-lg py-2 z-50">
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-secondary hover:text-accent transition-colors">
                          <LayoutDashboard size={16} /> Panelim
                        </Link>
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                          <LogOut size={16} /> Çıkış Yap
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : !loading ? (
                <Link to="/login">
                  <Button className="font-bold px-6 h-11 text-base rounded-full bg-navy-dark text-white hover:bg-navy-light transition-colors shadow-sm">
                    <LogIn size={16} className="mr-1.5" /> {t("nav.login")}
                  </Button>
                </Link>
              ) : null}

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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-border">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={`block py-2 text-base font-medium ${location.pathname === link.to ? "text-accent" : "text-foreground/70"}`}>
                  {t(link.labelKey)}
                </Link>
              ))}

              {user ? (
                <>
                  <Link to="/dashboard" className="block py-2 text-base font-medium text-foreground/70">Panelim</Link>
                  <button onClick={handleSignOut} className="block py-2 text-base font-medium text-destructive">Çıkış Yap</button>
                </>
              ) : (
                <Link to="/login" className="block py-2 text-base font-medium text-foreground/70">{t("nav.login")}</Link>
              )}

              <div className="flex gap-2 pt-2">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => setLocale(lang.code as Locale)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm ${locale === lang.code ? "border-accent bg-accent/5 text-accent font-semibold" : "border-border text-foreground/70"}`}>
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>

              <Link to="/apply" className="block pt-2">
                <Button className="w-full btn-gradient text-white font-bold text-base rounded-full h-12">{t("nav.apply")}</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
