// Country name translations and flag emojis
const DEST_TR: Record<string, string> = {
  germany: "Almanya", usa: "ABD", "united states": "ABD", france: "Fransa",
  italy: "İtalya", spain: "İspanya", netherlands: "Hollanda", greece: "Yunanistan",
  "united kingdom": "İngiltere", uk: "İngiltere", canada: "Kanada",
  australia: "Avustralya", japan: "Japonya", "south korea": "Güney Kore",
  china: "Çin", brazil: "Brezilya", mexico: "Meksika", india: "Hindistan",
  russia: "Rusya", switzerland: "İsviçre", austria: "Avusturya",
  belgium: "Belçika", portugal: "Portekiz", sweden: "İsveç",
  norway: "Norveç", denmark: "Danimarka", finland: "Finlandiya",
  ireland: "İrlanda", poland: "Polonya", "czech republic": "Çekya",
  hungary: "Macaristan", dubai: "Dubai", uae: "BAE",
  "united arab emirates": "BAE", qatar: "Katar", egypt: "Mısır",
};

const FLAGS: Record<string, string> = {
  "Almanya": "🇩🇪", "ABD": "🇺🇸", "Fransa": "🇫🇷", "İtalya": "🇮🇹",
  "İspanya": "🇪🇸", "Hollanda": "🇳🇱", "Yunanistan": "🇬🇷", "İngiltere": "🇬🇧",
  "Kanada": "🇨🇦", "Avustralya": "🇦🇺", "Japonya": "🇯🇵", "Güney Kore": "🇰🇷",
  "Çin": "🇨🇳", "Brezilya": "🇧🇷", "Meksika": "🇲🇽", "Hindistan": "🇮🇳",
  "Rusya": "🇷🇺", "İsviçre": "🇨🇭", "Avusturya": "🇦🇹", "Belçika": "🇧🇪",
  "Portekiz": "🇵🇹", "İsveç": "🇸🇪", "Norveç": "🇳🇴", "Danimarka": "🇩🇰",
  "Finlandiya": "🇫🇮", "İrlanda": "🇮🇪", "Polonya": "🇵🇱", "Çekya": "🇨🇿",
  "Macaristan": "🇭🇺", "Dubai": "🇦🇪", "BAE": "🇦🇪", "Katar": "🇶🇦", "Mısır": "🇪🇬",
};

export function translateCountry(destination: string | null | undefined): string {
  if (!destination || destination === '-') return destination || '-';
  const key = destination.toLowerCase().trim();
  return DEST_TR[key] || destination;
}

export function getCountryFlag(countryName: string): string {
  // Try translated name first, then original
  const translated = translateCountry(countryName);
  return FLAGS[translated] || FLAGS[countryName] || '';
}

export function countryWithFlag(destination: string | null | undefined): string {
  if (!destination || destination === '-') return destination || '-';
  const translated = translateCountry(destination);
  const flag = FLAGS[translated] || '';
  return flag ? `${flag} ${translated}` : translated;
}
