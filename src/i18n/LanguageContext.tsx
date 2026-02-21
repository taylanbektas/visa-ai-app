import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { translations, Locale } from "./translations";

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "visapath_locale";

function getStoredLocale(): Locale {
    try {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
        if (stored === "tr" || stored === "en") return stored;
    } catch {}
    return "tr";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(getStoredLocale);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        try {
            localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
        } catch {}
    }, []);

    const t = useCallback(
        (key: string): string => {
            return translations[locale]?.[key] ?? translations.tr[key] ?? key;
        },
        [locale]
    );

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
