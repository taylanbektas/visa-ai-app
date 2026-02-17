import { Link, useLocation } from "react-router-dom";
import { BookOpen, FileText, Home, Search, Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const tabs = [
  { to: "/", icon: Home, labelKey: "nav.home" },
  { to: "/pricing", icon: FileText, labelKey: "nav.pricing" },
  { to: "/apply", icon: Send, labelKey: "nav.apply" },
  { to: "/learn", icon: BookOpen, labelKey: "nav.learn" },
  { to: "/track", icon: Search, labelKey: "nav.track" },
];

const hiddenPathPrefixes = ["/login", "/admin", "/dashboard"];

export function MobileBottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  if (hiddenPathPrefixes.some((prefix) => location.pathname.startsWith(prefix))) {
    return null;
  }

  const isActive = (to: string) => {
    if (to === "/") {
      return location.pathname === "/";
    }

    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto max-w-xl px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.4rem)]">
        <div className="grid grid-cols-5 gap-1 rounded-2xl bg-secondary/40 p-1">
          {tabs.map((tab) => {
            const active = isActive(tab.to);

            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold transition-colors ${
                  active
                    ? "bg-white text-accent shadow-sm"
                    : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <tab.icon size={16} />
                <span className="truncate">{t(tab.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
