
export interface Country {
    code: string;
    labelKey: string;
    flag: string;
}

export interface Destination {
    key: string;
    flag: string;
    popular?: boolean;
}

/* ── Passport options — ordered by probability for Turkish/Regional users ─────── */
export const passportOptions: Country[] = [
    { code: "TR", labelKey: "country.turkey", flag: "🇹🇷" },
    { code: "AZ", labelKey: "country.azerbaijan", flag: "🇦🇿" },
    { code: "RU", labelKey: "country.russia", flag: "🇷🇺" },
    { code: "UA", labelKey: "country.ukraine", flag: "🇺🇦" },
    { code: "DE", labelKey: "country.germany", flag: "🇩🇪" },
    { code: "NL", labelKey: "country.netherlands", flag: "🇳🇱" },
    { code: "FR", labelKey: "country.france", flag: "🇫🇷" },
    { code: "GB", labelKey: "country.uk", flag: "🇬🇧" },
    { code: "US", labelKey: "country.usa", flag: "🇺🇸" },
    { code: "IR", labelKey: "country.iran", flag: "🇮🇷" },
    { code: "UZ", labelKey: "country.uzbekistan", flag: "🇺🇿" },
    { code: "TM", labelKey: "country.turkmenistan", flag: "🇹🇲" },
    { code: "KG", labelKey: "country.kyrgyzstan", flag: "🇰🇬" },
    { code: "EG", labelKey: "country.egypt", flag: "🇪🇬" },
    { code: "IQ", labelKey: "country.iraq", flag: "🇮🇶" },
    { code: "SY", labelKey: "country.syria", flag: "🇸🇾" },
    { code: "AF", labelKey: "country.afghanistan", flag: "🇦🇫" },
];

/* ── Destination list — sorted by popularity for Turkish citizens (2024-2025 stats) ─────── */
/* ── Destination list — sorted by popularity for Turkish citizens (2024-2025 stats) ─────── */
export const destinations: Destination[] = [
    { key: "germany", flag: "🇩🇪", popular: true },
    { key: "italy", flag: "🇮🇹", popular: true },
    { key: "france", flag: "🇫🇷", popular: true },
    { key: "greece", flag: "🇬🇷", popular: true },
    { key: "montenegro", flag: "🇲🇪" },
    { key: "serbia", flag: "🇷🇸" },
    { key: "bosnia", flag: "🇧🇦" },
    { key: "macedonia", flag: "🇲🇰" },
    { key: "albania", flag: "🇦🇱" },
    { key: "kosovo", flag: "🇽🇰" },
    { key: "spain", flag: "🇪🇸" },
    { key: "netherlands", flag: "🇳🇱" },
    { key: "belgium", flag: "🇧🇪" },
    { key: "austria", flag: "🇦🇹" },
    { key: "switzerland", flag: "🇨🇭" },
    { key: "portugal", flag: "🇵🇹" },
    { key: "usa", flag: "🇺🇸" },
    { key: "uk", flag: "🇬🇧" },
    { key: "canada", flag: "🇨🇦" },
    { key: "japan", flag: "🇯🇵" },
    { key: "south_korea", flag: "🇰🇷" },
    { key: "egypt", flag: "🇪🇬" },
    { key: "uae", flag: "🇦🇪" },
];

/* ── Visa-free map: passport → visa-free destination keys ──── */
export const visaFreeMap: Record<string, string[]> = {
    // EU Passports (Schengen) - access to all Schengen + many others
    DE: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "bulgaria", "uk", "japan", "south_korea", "canada", "usa", "georgia", "montenegro", "macedonia", "serbia", "bosnia", "uae"],
    FR: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "bulgaria", "uk", "japan", "south_korea", "canada", "usa", "georgia", "montenegro", "macedonia", "serbia", "bosnia", "uae"],
    NL: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "bulgaria", "uk", "japan", "south_korea", "canada", "usa", "georgia", "montenegro", "macedonia", "serbia", "bosnia", "uae"],

    // UK/US
    GB: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "bulgaria", "japan", "south_korea", "canada", "usa", "georgia", "montenegro", "macedonia", "serbia", "bosnia"],
    US: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "bulgaria", "uk", "japan", "south_korea", "canada", "georgia", "montenegro", "macedonia", "serbia", "bosnia"],

    // TR - Visa Free / VOA
    TR: ["georgia", "montenegro", "macedonia", "serbia", "bosnia", "albania", "kosovo", "japan", "south_korea", "ukraine", "belgrade", "sharm"],
    // NOTE: Egypt is VOA for Turks usually, but we'll treat as 'visa needed' for the upsell or handle in logic if needed. 
    // For simplicity in this app, we mark widely known visa-free. 

    // Others
    AZ: ["turkey", "georgia", "montenegro", "serbia", "ukraine", "russia"],
    RU: ["turkey", "georgia", "montenegro", "serbia", "bosnia", "thailand", "vietnam", "south_korea"],
    UA: ["germany", "france", "italy", "spain", "netherlands", "belgium", "austria", "switzerland", "portugal", "greece", "bulgaria", "georgia", "turkey"],

    SY: [], IQ: [], IR: ["turkey", "georgia"], AF: [], UZ: ["turkey", "russia", "georgia"], TM: ["turkey"], KG: ["turkey", "russia", "georgia"], EG: [],
};

/* ── E-Visa destinations ──── */
export const eVisaDestinations = ["south_korea", "usa", "canada", "egypt", "uae"];
// USA/Canada are ESTA/eTA, effectively e-visa workflows for eligible, but stick to simple logic.
