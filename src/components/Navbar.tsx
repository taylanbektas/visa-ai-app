import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  User,
  LogIn,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import type { Locale } from "@/i18n/translations";
import { contact } from "@/lib/contact";

const navLinks = [
  { labelKey: "nav.home", to: "/" },
  { labelKey: "nav.pricing", to: "/pricing" },
  { labelKey: "nav.learn", to: "/learn" },
];

const helpLinks = [
  { labelKey: "nav.faq", to: "/#sss", icon: HelpCircle },
  { labelKey: "nav.contact", to: "/contact", icon: MessageCircle },
  { labelKey: "nav.whatsapp", href: contact.whatsappUrl, icon: MessageCircle },
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
  const { getPanelPath } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const helpRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(false);
    setHelpOpen(false);
    setLangOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 14);
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

  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const activeLang = languages.find((l) => l.code === locale)!;
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleHashNavigation = (to?: string) => {
    if (!to || !to.includes("#")) return;

    const [path, hash] = to.split("#");
    if (window.location.pathname === path || path === "/") {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const isLinkActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${scrolled ? "border-b border-border/60 bg-white/95 shadow-sm backdrop-blur-md" : "bg-transparent"
        }`}
      role="navigation"
      aria-label="Ana navigasyon"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="text-2xl md:text-3xl">✈️</span>
            <span className="text-xl font-extrabold tracking-tight md:text-2xl">
              <span className="text-navy-dark">Visa</span>
              <span className="text-gradient-mint">Path</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-lg font-bold transition-colors hover:text-accent ${isLinkActive(link.to) ? "text-accent" : "text-foreground/90"
                  }`}
                onClick={() => {
                  if (link.to === "/") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {t(link.labelKey)}
              </Link>
            ))}

            <div className="relative" ref={helpRef}>
              <button
                onClick={() => {
                  setHelpOpen(!helpOpen);
                  setLangOpen(false);
                }}
                className="flex items-center gap-1 text-lg font-bold text-foreground/90 transition-colors hover:text-accent"
                aria-expanded={helpOpen}
                aria-haspopup="true"
                aria-label={`${t("nav.help")} menüsü`}
              >
                {t("nav.help")}{" "}
                <ChevronDown size={14} className={`transition-transform ${helpOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {helpOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-white py-2 shadow-lg"
                  >
                    {helpLinks.map((item) =>
                      item.href ? (
                        <a
                          key={item.labelKey}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-2.5 text-base text-foreground/80 transition-colors hover:bg-secondary hover:text-accent"
                        >
                          <item.icon size={16} /> {t(item.labelKey)}
                        </a>
                      ) : (
                        <Link
                          key={item.labelKey}
                          to={item.to!}
                          className="flex items-center gap-3 px-4 py-2.5 text-base text-foreground/80 transition-colors hover:bg-secondary hover:text-accent"
                          onClick={() => {
                            setHelpOpen(false);
                            handleHashNavigation(item.to);
                          }}
                        >
                          <item.icon size={16} /> {t(item.labelKey)}
                        </Link>
                      ),
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-secondary/30 p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code as Locale)}
                  className={`relative flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-bold transition-all ${locale === lang.code
                    ? "text-navy-dark"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                    }`}
                  aria-label={`Dil: ${lang.label}`}
                >
                  {locale === lang.code && (
                    <motion.div
                      layoutId="active-lang-bg"
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 mr-1.5 text-base" aria-hidden="true">{lang.flag}</span>
                  <span className="relative z-10">{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {!loading && user ? (
                <>
                  <Link to={getPanelPath()}>
                    <Button variant="outline" className="h-11 rounded-full border-2 border-navy-dark/10 bg-white px-5 text-base font-bold text-navy-dark shadow-sm transition-all hover:bg-navy-dark/5 hover:border-navy-dark/20 active:scale-95 flex items-center gap-2">
                      <LayoutDashboard size={18} className="text-navy-dark/70" />
                      {t("nav.panel")}
                    </Button>
                  </Link>

                  <Link to={getPanelPath() === '/dashboard' ? "/dashboard" : "/apply"}>
                    <Button className="btn-gradient h-11 rounded-full px-6 text-base font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                      {t("nav.apply")}
                    </Button>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="ml-1 flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-white text-muted-foreground shadow-sm transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                    title="Çıkış Yap"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : !loading ? (
                <>
                  <Link to="/login">
                    <Button className="h-11 rounded-full bg-navy-dark px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-navy-light">
                      <LogIn size={16} className="mr-1.5" /> {t("nav.login")}
                    </Button>
                  </Link>
                  <Link to="/apply">
                    <Button className="btn-gradient h-11 rounded-full px-6 text-base font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                      {t("nav.apply")}
                    </Button>
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link to={user && !loading ? (getPanelPath() === '/dashboard' ? "/dashboard" : "/apply") : "/apply"}>
              <Button className="btn-gradient h-10 rounded-full px-4 text-sm font-bold text-white">
                {t("nav.apply")}
              </Button>
            </Link>
            <button
              className="rounded-xl border border-border/80 bg-white/80 p-2.5 text-foreground"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 bottom-0 top-[calc(env(safe-area-inset-top,0px)+4rem)] z-40 overflow-y-auto border-t border-border bg-white md:hidden"
          >
            <div className="container mx-auto px-4 py-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block rounded-xl border px-4 py-3 text-base font-semibold transition-colors ${isLinkActive(link.to)
                      ? "border-accent/30 bg-accent/5 text-accent"
                      : "border-border text-foreground/80 hover:bg-secondary"
                      }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
                <Link
                  to="/track"
                  className={`block rounded-xl border px-4 py-3 text-base font-semibold transition-colors ${isLinkActive("/track")
                    ? "border-accent/30 bg-accent/5 text-accent"
                    : "border-border text-foreground/80 hover:bg-secondary"
                    }`}
                >
                  {t("nav.track")}
                </Link>
              </div>

              <div className="mt-6">
                <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("nav.help")}</p>
                <div className="space-y-2">
                  {helpLinks.map((item) =>
                    item.href ? (
                      <a
                        key={item.labelKey}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary"
                      >
                        <item.icon size={16} /> {t(item.labelKey)}
                      </a>
                    ) : (
                      <Link
                        key={item.labelKey}
                        to={item.to!}
                        onClick={() => handleHashNavigation(item.to)}
                        className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary"
                      >
                        <item.icon size={16} /> {t(item.labelKey)}
                      </Link>
                    ),
                  )}
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Language</p>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLocale(lang.code as Locale)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold ${locale === lang.code
                        ? "border-accent/30 bg-accent/5 text-accent"
                        : "border-border text-foreground/70"
                        }`}
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-4">
                {!loading && user ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">{displayName}</p>
                    <Link
                      to={getPanelPath()}
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-navy-dark/10 bg-white px-4 py-3 text-base font-bold text-navy-dark shadow-sm transition-all active:scale-[0.98]"
                    >
                      <LayoutDashboard size={18} className="text-navy-dark/70" />
                      {t("nav.panel")}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm font-semibold text-destructive"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                ) : !loading ? (
                  <Link to="/login">
                    <Button className="h-11 w-full rounded-xl bg-navy-dark text-sm font-bold text-white hover:bg-navy-light">
                      <LogIn size={15} className="mr-1.5" /> {t("nav.login")}
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
