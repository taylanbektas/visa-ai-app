
export interface Requirement {
    id: string;
    name: string;
    description: string;
    required: boolean;
}

export const visaRequirements: Record<string, Record<string, Requirement[]>> = {
    germany: {
        "Turist Vizesi": [
            { id: "passport", name: "Pasaport", description: "En az 6 ay geçerliliği olan pasaportun aslı ve fotokopisi.", required: true },
            { id: "photo", name: "Biyometrik Fotoğraf", description: "Son 6 ay içinde çekilmiş 2 adet biyometrik fotoğraf.", required: true },
            { id: "bank", name: "Banka Hesap Dökümü", description: "Son 3 aya ait, kaşeli ve imzalı banka hesap dökümü.", required: true },
            { id: "insurance", name: "Seyahat Sağlık Sigortası", description: "Tüm Schengen bölgesini kapsayan 30.000 Euro teminatlı sigorta.", required: true },
            { id: "job", name: "İş Yeri Belgeleri", description: "SGK işe giriş bildirgesi, maaş bordrosu ve faaliyet belgesi.", required: false },
        ],
    },
    france: {
        "Turist Vizesi": [
            { id: "passport", name: "Pasaport", description: "En az 6 ay geçerliliği olan pasaport.", required: true },
            { id: "photo", name: "Biyometrik Fotoğraf", description: "35x45mm boyutunda beyaz fonlu fotoğraf.", required: true },
            { id: "bank", name: "Banka Hesap Dökümü", description: "Güncel bakiye bilgilerini içeren kaşeli döküm.", required: true },
            { id: "hotel", name: "Konaklama Rezervasyonu", description: "Otel rezervasyon onay belgesi.", required: true },
            { id: "flight", name: "Uçak Rezervasyonu", description: "Gidiş-dönüş uçak bileti rezervasyonu.", required: true },
        ],
    },
    italy: {
        "Turist Vizesi": [
            { id: "passport", name: "Pasaport", description: "Geçerli pasaport.", required: true },
            { id: "photo", name: "Biyometrik Fotoğraf", description: "Biyometrik standartlara uygun fotoğraf.", required: true },
            { id: "bank", name: "Banka Hesap Dökümü", description: "Maddi durumu belgeleyen banka dökümü.", required: true },
            { id: "residence", name: "Ikametgah", description: "E-devletten alınmış ikametgah belgesi.", required: true },
        ],
    },
    usa: {
        "Turist Vizesi": [
            { id: "ds160", name: "DS-160 Formu Onayı", description: "Tamamlanmış DS-160 formu onay sayfası.", required: true },
            { id: "passport", name: "Pasaport", description: "Geçerli pasaport.", required: true },
            { id: "photo", name: "5x5 Fotoğraf", description: "Dijital ve fiziksel olarak 5x5 boyutunda fotoğraf.", required: true },
        ],
    },
};

export const defaultRequirements: Requirement[] = [
    { id: "passport", name: "Pasaport", description: "Geçerli pasaportun aslı.", required: true },
    { id: "photo", name: "Biyometrik Fotoğraf", description: "Standartlara uygun 2 adet fotoğraf.", required: true },
    { id: "bank", name: "Banka Hesap Dökümü", description: "Maddi durumu gösteren belge.", required: true },
];

export const getRequirements = (destination: string, visaType: string): Requirement[] => {
    return visaRequirements[destination.toLowerCase()]?.[visaType] || defaultRequirements;
};
