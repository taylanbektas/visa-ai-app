export interface Article {
    title: string;
    category: string;
    toc: string[];
    content: string;
    related: string[];
}

export const articleImages: Record<string, string> = {
    "schengen-guide": "/images/articles/schengen-guide.png",
    "us-tourist-visa": "/images/articles/us-tourist-visa.png",
    "uk-visitor-visa": "/images/articles/uk-visitor-visa.png",
    "rejection-reasons": "/images/articles/rejection-reasons.png",
    "biometric-photo": "/images/articles/biometric-photo.png",
    "cover-letter": "/images/articles/cover-letter.png",
    "digital-nomad": "/images/articles/digital-nomad.png",
    "student-visa": "/images/articles/student-visa.png",
    "canada-tourist-visa": "/images/articles/canada-tourist-visa.png",
    "travel-insurance": "/images/articles/travel-insurance.png",
    "transit-visa": "/images/articles/transit-visa.png",
    "first-time-abroad": "/images/articles/first-time.png",
};

export const articles: Record<string, { tr: Article; en: Article }> = {
    "schengen-guide": {
        tr: {
            title: "Türk Vatandaşları İçin Eksiksiz Schengen Vize Rehberi",
            category: "Schengen",
            toc: ["Schengen Alanı Nedir?", "Gerekli Belgeler", "Başvuru Süreci", "Sık Yapılan Hatalar"],
            content: `## Schengen Vizesi Nedir?

Schengen vizesi, Avrupa'daki 27 üye ülke arasında serbest dolaşım sağlayan kısa süreli bir vizedir. Bu vize ile Almanya, Fransa, İtalya, İspanya gibi popüler destinasyonlara tek bir vize başvurusu ile seyahat edebilirsiniz. 90 güne kadar olan turistik, ticari veya aile ziyareti amaçlı seyahatler için uygundur.

## Gerekli Belgeler Listesi 👍

Başvurunuzun onaylanması için aşağıdaki belgelerin eksiksiz ve güncel olması gerekir:

*   **Pasaport:** Dönüş tarihinden itibaren en az 3 ay geçerli, son 10 yılda alınmış ve en az 2 boş sayfası olan geçerli pasaport.
*   **Biyometrik Fotoğraf:** 35x45mm boyutlarında, beyaz arka fonlu, güncel (son 6 ay içinde çekilmiş) 2 adet fotoğraf. 📸
*   **Seyahat Sağlık Sigortası:** Tüm seyahat süresini kapsayan, en az 30.000€ teminatlı seyahat sağlık sigortası.
*   **Uçak ve Konaklama Belgeleri:** Gidiş-dönüş uçak rezervasyonu ve otel konaklama belgesi (satın alınmış olması şart değil, rezervasyon yeterlidir).
*   **Maddi Durum Belgeleri:** Son 3 aya ait banka hesap dökümü (imzalı ve kaşeli), varsa tapu ve araç ruhsatları. 💰
*   **İş Belgeleri:** Çalışanlar için işveren mektubu, SGK dökümü, maaş bordroları; işverenler için vergi levhası ve ticaret sicil gazetesi.

## Başvuru Süreci Nasıl İşler?

1.  **Ülke Seçimi:** İlk giriş yapacağınız veya en uzun süre kalacağınız ülkeyi belirleyin. Başvuruyu o ülkenin konsolosluğuna yapmalısınız.
2.  **Randevu:** İlgili konsolosluğun aracı kurumundan (iData, VFS Global vb.) randevu alın. Yoğun dönemlerde randevu bulmak zor olabilir, erken davranın. 🗓️
3.  **Belge Hazırlığı:** Yukarıdaki listeye göre belgelerinizi hazırlayın. VisaPath olarak size özel hazırladığımız ek belgeleri de eklemeyi unutmayın.
4.  **Biyometrik İşlem:** Randevu günü parmak izi verin ve belgelerinizi teslim edin.
5.  **Pasaport Teslimi:** Vize sonucunuz genellikle 15 gün içinde açıklanır ve pasaportunuz size kargo ile gönderilir veya elden teslim alırsınız. ✈️

## Sık Yapılan Hatalar ⚠️

*   **Eksik Belge:** En yaygın ret sebebi eksik veya hatalı belgedir.
*   **Seyahat Amacı Uyumsuzluğu:** Otel rezervasyon tarihleriniz ile uçak biletiniz uyuşmalı.
*   **Yetersiz Bakiye:** Banka hesabınızda seyahat masraflarını karşılayacak kadar bakiye olduğundan emin olun.

## İpucu 💡

İlk Schengen başvurunuzda vize süreniz kısa olabilir (örn. seyahat süresi kadar). Düzenli ve kuralına uygun seyahat ettikçe sonraki vizelerinizin süresi uzayacaktır.`,
            related: ["rejection-reasons", "biometric-photo", "cover-letter"],
        },
        en: {
            title: "Complete Schengen Visa Guide for Turkish Citizens",
            category: "Schengen",
            toc: ["What is Schengen?", "Required Documents", "Application Process", "Common Mistakes"],
            content: `## What is a Schengen Visa?

A Schengen visa is a short-stay visa that allows free movement between 27 member countries in Europe. With this visa, you can travel to popular destinations such as Germany, France, Italy, and Spain with a single application. It is suitable for tourist, business, or family visits of up to 90 days.

## Required Documents Checklist

For your application to be approved, the following documents must be complete and up-to-date:

*   **Passport:** Valid for at least 3 months after your return date, issued within the last 10 years, and with at least 2 empty pages.
*   **Biometric Photo:** 2 recent photos (taken within the last 6 months), 35x45mm size, white background.
*   **Travel Health Insurance:** Minimum €30,000 coverage valid for the entire duration of your stay.
*   **Flight & Accommodation:** Round-trip flight reservation and hotel booking (purchase is not mandatory, reservation is sufficient).
*   **Financial Proof:** Last 3 months' bank statement (signed and stamped), property deeds, or vehicle registration if available.
*   **Employment Documents:** For employees: employer letter, social security records, payslips; for employers: tax registration and trade registry gazette.

## How the Process Works

1.  **Country Selection:** Determine the country of first entry or main destination. Apply to that country's consulate.
2.  **Appointment:** Book an appointment with the official visa center (iData, VFS Global, etc.). Book early as slots fill up fast.
3.  **Document Preparation:** Prepare documents according to the list. Don't forget the additional documents VisaPath prepares for you.
4.  **Biometric Data:** Submit fingerprints and documents on your appointment day.
5.  **Passport Collection:** Processing usually takes 15 days. Your passport will be mailed or available for pickup.

## Common Mistakes

*   **Missing Documents:** The most common reason for rejection.
*   **Inconsistent Purpose:** Ensure hotel dates match flight dates.
*   **Insufficient Funds:** Ensure your bank balance covers travel expenses.

## Tip

Your first Schengen visa might be short-term (e.g., exact travel dates). Regular and compliant travel increases the duration of subsequent visas.`,
            related: ["rejection-reasons", "biometric-photo", "cover-letter"],
        },
    },
    "us-tourist-visa": {
        tr: {
            title: "ABD Turist Vizesi (B-1/B-2)",
            category: "ABD",
            toc: ["B1/B2 Nedir?", "DS-160 Formu", "Mülakat Hazırlığı", "Sık Sorulan Sorular"],
            content: `## B1/B2 Vizesi Nedir?

ABD B1/B2 vizesi, turistik (B2) ve ticari (B1) seyahatler için verilen, genellikle 10 yıl geçerli olan çok girişli bir vizedir. Bu vize ile ABD'de çalışma veya eğitim hakkı elde etmezsiniz, sadece geçici ziyaretlerde bulunabilirsiniz. 🇺🇸

## DS-160 Formu: En Önemli Adım 📝

ABD vize başvurusunun temeli **DS-160** formudur. Bu online formda vereceğiniz bilgiler, mülakatın seyrini belirler.
*   Formu İngilizce doldurmalısınız.
*   Bilgilerinizin tutarlı ve doğru olması kritiktir.
*   "Save" (Kaydet) butonunu sık sık kullanarak ilerleyin, oturum süresi dolabilir.

## Mülakat Hazırlığı 🗣️

ABD vizesi, belge odaklı değil **mülakat odaklıdır**. Konsolosluk memuru ile yapacağınız 2-3 dakikalık görüşme sonucunu belirler.
*   **Kendinizden emin olun:** Sorulara net ve kısa cevaplar verin.
*   **Bağlayıcı unsurları vurgulayın:** Türkiye'ye döneceğinizi kanıtlayan iş, aile ve mal varlığı bağlarınızı belirtin.
*   **Dürüst olun:** Asla yalan beyanda bulunmayın, sistemde eski kayıtlarınız görünebilir.

## Sık Sorulan Mülakat Soruları

1.  ABD'ye neden gidiyorsunuz?
2.  Ne kadar kalacaksınız?
3.  Nerede konaklayacaksınız?
4.  Ne iş yapıyorsunuz?
5.  Masraflarınızı kim karşılayacak?

## Yaygın Ret Sebebi: 214(b) Maddesi ⚠️

Eğer memur, Türkiye'ye döneceğinize ikna olmazsa, başvurunuzu **INA 214(b)** maddesi gereğince reddedebilir. Bu, "göçmenlik potansiyeli taşıyor" demektir. Bunu aşmak için Türkiye'deki kurulu düzeninizi (uzun süreli iş, evlilik, tapu vb.) iyi anlatmalısınız.`,
            related: ["schengen-guide", "rejection-reasons", "cover-letter"],
        },
        en: {
            title: "US Tourist Visa (B-1/B-2)",
            category: "USA",
            toc: ["What is B1/B2?", "DS-160 Form", "Interview Prep", "Common Questions"],
            content: `## What is a B1/B2 Visa?

The US B1/B2 visa is a multiple-entry visa for tourist (B2) and business (B1) travel, typically valid for 10 years. It does not grant work or study rights; it is for temporary visits only.

## DS-160 Form: Critical Step

The foundation of the US visa application is the **DS-160** form. Your answers here determine the interview direction.
*   Fill it out in English.
*   Consistency and accuracy are key.
*   Save often to avoid session timeout.

## Interview Preparation

The US visa is **interview-based**. A 2-3 minute talk with the consular officer decides the outcome.
*   **Be confident:** Give clear, short answers.
*   **Emphasize ties:** Show strong ties to your home country (job, family, assets) proving you will return.
*   **Be honest:** Never lie; they may see past records.

## Common Interview Questions

1.  Why are you going to the US?
2.  How long will you stay?
3.  Where will you stay?
4.  What is your job?
5.  Who is paying for the trip?

## Common Rejection Reason: Section 214(b)

If the officer isn't convinced you'll return, they may reject under **INA 214(b)** (immigrant intent). To overcome this, clearly demonstrate your established life in your home country.`,
            related: ["schengen-guide", "rejection-reasons", "cover-letter"],
        },
    },
    "uk-visitor-visa": {
        tr: {
            title: "İngiltere Standart Ziyaretçi Vizesi",
            category: "İngiltere",
            toc: ["Genel Bakış", "Başvuru ve Ödeme", "Biyometrik Randevu", "Dikkat Edilmesi Gerekenler"],
            content: `## İngiltere Standart Ziyaretçi Vizesi 🇬🇧

İngiltere (Birleşik Krallık), Schengen bölgesine dahil değildir; bu nedenle ayrı bir vize almanız gerekir. Standart Ziyaretçi Vizesi ile turistik gezi, aile ziyareti veya kısa süreli iş toplantılarına katılabilirsiniz.

## Online Başvuru ve Ödeme 💻

Başvuru süreci **GOV.UK** üzerinden online form doldurularak başlar.
*   Kapsamlı bir form doldurmanız gerekir (seyahat geçmişi, gelir durumu, aile bilgileri).
*   Vize harcını (şu an için 6 aylık vize ~£115) online olarak ödemelisiniz.

## Biyometrik Randevu ve Pasaport Teslimi ✋

Formu tamamladıktan sonra, **TLScontact** (aracı kurum) web sitesinden randevu almanız gerekir.
1.  **Self-Service:** Belgelerinizi randevudan önce sisteme kendiniz yüklersiniz (Ücretsiz).
2.  **Assisted Service:** Belgeleri randevu günü götürürsünüz, onlar tarar (Ücretli).

Randevu günü pasaportunuzu teslim edersiniz. İşlem süresi standart olarak **3 haftadır (15 iş günü)**, ancak "Priority" (5 gün) veya "Super Priority" (24 saat) hizmetleri ek ücretle satın alınabilir.

## Dikkat Edilmesi Gerekenler ⚠️

*   **Banka Hesabı:** Hesabınıza aniden yatan yüksek meblağlar (kaynağı belirsiz) ret sebebidir. Düzenli gelir akışını göstermelisiniz.
*   **Seyahat Geçmişi:** Pasaportunuzdaki eski vizeler ve giriş-çıkış damgaları avantaj sağlar.
*   **Konaklama:** Davetiyeniz varsa davet eden kişinin pasaport ve oturum izni fotokopisi gereklidir.`,
            related: ["schengen-guide", "rejection-reasons", "biometric-photo"],
        },
        en: {
            title: "UK Standard Visitor Visa",
            category: "UK",
            toc: ["Overview", "Application", "Biometrics", "Key Points"],
            content: `## UK Standard Visitor Visa

The UK is not part of Schengen, so you need a separate visa. The Standard Visitor Visa covers tourism, family visits, and short business meetings.

## Online Application & Payment

Start by filling the online form on **GOV.UK**.
*   The form is extensive (travel history, income, family details).
*   Pay the visa fee (~£115 for 6 months) online.

## Biometric Appointment & Passport Submission

After the form, book an appointment via **TLScontact**.
1.  **Self-Service:** Upload documents yourself before the appointment (Free).
2.  **Assisted Service:** Bring documents to the appointment for scanning (Paid).

Submit your passport on appointment day. Standard processing is **3 weeks (15 working days)**. Priority (5 days) and Super Priority (24 hours) services are available for extra fees.

## Key Points

*   **Bank Account:** Sudden large deposits without clear origin are red flags. Show consistent income.
*   **Travel History:** Past visas and entry stamps strengthen your case.
*   **Accommodation:** If invited, provide the host's passport and residency copy.`,
            related: ["schengen-guide", "rejection-reasons", "biometric-photo"],
        },
    },
    "rejection-reasons": {
        tr: {
            title: "Vize Başvuruları Neden Reddedilir?",
            category: "Seyahat İpuçları",
            toc: ["Amaç İnandırıcı Değil", "Yetersiz Maddi Olanak", "Geri Dönüş Şüphesi", "Eksik Belge"],
            content: `## Vize Reddini Anlamak 🚫

Vize başvurunuzun reddedilmesi moral bozucu olabilir, ancak sebebini anlamak bir sonraki başvurunun başarısı için kritiktir. Konsolosluklar genellikle standart bir ret mektubu verir ve burada genel maddeler işaretlenir. İşte en sık karşılaşılan 7 sebep:

## 1. Seyahat Amacının İnandırıcı Bulunmaması

Konsolos, gerçekten turist olarak gittiğinize ikna olmamıştır.
*   **Çözüm:** Seyahat planınızı detaylandırın. Müze biletleri, konser rezervasyonları gibi kanıtlar ekleyin.

## 2. Yetersiz Maddi Olanaklar 💰

Banka hesabınızdaki para, seyahat süresince masraflarınızı karşılamaya yetmiyor veya paranın kaynağı belli değil.
*   **Çözüm:** Son 3 ayın hareketlerini gösteren, maaşın yattığı aktif bir hesap sunun. "Borç" para yatırmayın.

## 3. Geri Dönüş Kanıtının Yetersizliği

Ülkenize döneceğinize dair güçlü bağlar sunamadınız.
*   **Çözüm:** İş yerinden çalışma belgesi, SGK tescil dökümü, tapu, araç ruhsatı, öğrenci belgesi gibi "bağlayıcı" belgeler sunun.

## 4. Eksik veya Hatalı Belge 📄

En basit sebep: İstenen bir belgenin dosyada olmaması.
*   **Çözüm:** Checklist'i satır satır kontrol edin. Sigorta tarihleri, pasaport geçerlilik süresi vb. detaylara dikkat edin.

## 5. Sahte Belge Şüphesi

Otel rezervasyonunuzu yaptınız ama vize çıkmadan iptal ettiniz veya sahte uçak bileti sundunuz.
*   **Çözüm:** Asla sahte rezervasyon (dummy booking) yapmayın. Konsolosluklar otelleri arayıp teyit edebilir.

## 6. Geçmiş Vize İhlalleri

Daha önce aldığınız bir vizeyi ihlal ettiyseniz (süresinden fazla kalma vb.).
*   **Çözüm:** Dürüst olun ve nedenini açıklayan bir iyi niyet mektubu yazın.

## 7. Seyahat Sağlık Sigortası Sorunları 🏥

Sigortanız tüm seyahat süresini kapsamıyor veya teminatı düşük.
*   **Çözüm:** Seyahat tarihlerinizi (artı 1 gün opsiyonlu) kapsayan, en az 30.000€ teminatlı sigorta yaptırın.`,
            related: ["schengen-guide", "us-tourist-visa", "cover-letter"],
        },
        en: {
            title: "Why Are Visa Applications Rejected?",
            category: "Travel Tips",
            toc: ["Not Credible", "Insufficient Funds", "Return Doubts", "Missing Docs"],
            content: `## Understanding Visa Rejection

Rejection is frustrating, but understanding why is key for next time. Consulates usually provide a standard letter checking general boxes. Here are the top 7 reasons:

## 1. Purpose of Travel Not Credible

The consul isn't convinced you are a genuine tourist.
*   **Fix:** Detail your itinerary. Add museum tickets, event bookings, etc.

## 2. Insufficient Funds

Your bank balance doesn't cover contents or the source of funds is unclear.
*   **Fix:** Provide an active account showing salary deposits over 3 months. Don't deposit "borrowed" lump sums.

## 3. Insufficient Proof of Return

You didn't show strong ties to your home country.
*   **Fix:** Submit "binding" docs like employer letters, property deeds, student certificates.

## 4. Missing or Incorrect Documents

Simplest reason: A required doc is missing.
*   **Fix:** Check the checklist line by line. Watch dates and validity.

## 5. Fake Document Suspicion

Cancelled hotel bookings or fake flight tickets.
*   **Fix:** Never use dummy bookings. Consulates often verify reservations.

## 6. Past Visa Violations

Overstaying a previous visa.
*   **Fix:** Be honest and write a cover letter explaining why.

## 7. Travel Insurance Issues

Coverage doesn't match dates or is too low.
*   **Fix:** Get insurance covering all dates +1 day, with min €30,000 coverage.`,
            related: ["schengen-guide", "us-tourist-visa", "cover-letter"],
        }
    },
    "biometric-photo": {
        tr: {
            title: "Biyometrik Fotoğraf Nedir?",
            category: "Belge Rehberleri",
            toc: ["Genel Kurallar", "Ülke Standartları", "Tavsiyeler"],
            content: `## Biyometrik Fotoğraf Nedir? 📸

Vize başvurularında kullanılan, uluslararası ICAO (Uluslararası Sivil Havacılık Örgütü) standartlarına uygun, yüz biyometrisini net gösteren fotoğraftır. Vesikalık fotoğraftan farklıdır.

## Genel Kurallar

*   **Arka Fon:** Tamamen beyaz ve desensiz olmalıdır.
*   **Yüz İfadesi:** Nötr bir ifade olmalı, ağız kapalı, dişler görünmemelidir. Gülümsemeyin. 😐
*   **Gözlük:** Mümkünse gözlüksüz çekilin. Gözlük takacaksanız yansıma yapmamalı ve çerçeve gözleri kapatmamalıdır.
*   **Baş Pozisyonu:** Baş tam karşıya bakmalı, omuzlar görünmelidir. Yüz fotoğrafın %70-80'ini kaplamalıdır.
*   **Güncellik:** Son 6 ay içinde çekilmiş olmalıdır.

## Ülkelere Göre Boyutlar

*   **Schengen (Avrupa):** 35mm x 45mm
*   **ABD (Amerika):** 50mm x 50mm (2x2 inch)
*   **İngiltere:** 35mm x 45mm (Dijital ortamda da istenebilir)

## Tavsiyeler

*   Fotoğrafçıya gideceğiniz ülke için vize fotoğrafı çektirmek istediğinizi belirtin.
*   Fotoğrafın üzerinde oynama (rötuş) yaptırmayın, yüz lekeleri veya benler silinmemelidir.
*   Başörtülü kadınlar için: Yüz hatları (çene ucundan alına kadar) net görünmelidir, gölge düşmemelidir.`,
            related: ["schengen-guide", "uk-visitor-visa", "cover-letter"],
        },
        en: {
            title: "What is a Biometric Photo?",
            category: "Document Guides",
            toc: ["General Rules", "Sizes by Country", "Tips"],
            content: `## What is a Biometric Photo?

A photo meeting ICAO standards, clearly showing facial biometrics, used for visas. It differs from standard passport photos.

## General Rules

*   **Background:** Plain white, no patterns.
*   **Expression:** Neutral, mouth closed, no teeth showing. Do not smile.
*   **Glasses:** Preferably without. If worn, no reflections and frames shouldn't cover eyes.
*   **Head Position:** Facing forward, shoulders visible. Face should cover 70-80% of the photo.
*   **Recency:** Taken within the last 6 months.

## Sizes by Country

*   **Schengen (Europe):** 35mm x 45mm
*   **USA:** 50mm x 50mm (2x2 inch)
*   **UK:** 35mm x 45mm

## Tips

*   Tell the photographer specific country requirements.
*   No heavy retouching; moles/scars should remain visible.
*   For headscarves: Face must be clearly visible from chin to forehead, no shadows.`,
            related: ["schengen-guide", "uk-visitor-visa", "cover-letter"],
        }
    },
    "cover-letter": {
        tr: {
            title: "Vize Niyet Mektubu Nasıl Yazılır?",
            category: "Belge Rehberleri",
            toc: ["Neden Önemli?", "Nasıl Yazılmalı?", "Örnek Şablon"],
            content: `## Vize Talep Dilekçesi (Niyet Mektubu) Nedir? ✍️

Konsolosluğa hitaben yazılan, seyahat amacınızı, planınızı ve geri döneceğinizi anlatan resmi bir yazıdır. Özellikle evraklarınızda açıklanması gereken durumlar varsa (örn. yeni iş değişikliği, hesapta toplu para) dilekçe çok önemlidir.

## Nasıl Yazılmalı?

1.  **Başlık:** İlgili konsolosluğa hitaben başlayın (Örn: "To the Consulate General of France, Istanbul").
2.  **Giriş:** Seyahat tarihlerinizi ve amacınızı net belirtin.
3.  **Geliş:**
    *   Nerede kalacaksınız?
    *   Masrafları kim karşılıyor?
    *   İş durumunuz nedir?
4.  **Sonuç:** Vize bitiminde ülkenize döneceğinizi taahhüt edin ve teşekkür edin.

## Örnek Şablon (İngilizce)

**Subject:** Visa Application for [Adınız Soyadınız] - Passport No: [Pasaport No]

Dear Sir/Madam,

I would like to apply for a tourist visa to visit [Ülke] from [Başlangıç Tarihi] to [Bitiş Tarihi]. The main purpose of my travel is tourism/visiting friends.

I am currently working as a [Mesleğiniz] at [Şirket Adı] in Turkey. I have attached my employment documents proving my ties to my home country.

During my stay, I will reside at [Otel Adı/Adresi]. All my travel expenses will be covered by myself.

I guarantee that I will not seek any employment or permanent residency in [Ülke] and will return to Turkey before my visa expires.

Thank you for your time and consideration.

Sincerely,
[İmza]
[Adınız Soyadınız]
[Tarih]`,
            related: ["schengen-guide", "rejection-reasons", "biometric-photo"],
        },
        en: {
            title: "How to Write a Visa Cover Letter",
            category: "Document Guides",
            toc: ["Why Important?", "How to Write", "Sample Template"],
            content: `## What is a Visa Cover Letter?

A formal letter to the consulate explaining your travel purpose, itinerary, and intent to return. Crucial if you need to explain specific situations (e.g., new job, large deposit).

## How to Write It

1.  **Header:** Address the specific consulate (e.g., "To the Consulate General of France").
2.  **Intro:** State travel dates and purpose clearly.
3.  **Body:**
    *   Where will you stay?
    *   Who pays?
    *   Employment status?
4.  **Conclusion:** Commit to returning home and express thanks.

## Sample Template

**Subject:** Visa Application for [Name] - Passport No: [Number]

Dear Sir/Madam,

I am applying for a tourist visa to visit [Country] from [Start Date] to [End Date]. My purpose is tourism.

I work as a [Job Title] at [Company] in Turkey. Attached are documents proving my ties to my home country.

I will stay at [Hotel Name]. I will cover all expenses myself.

I guarantee I will not seek employment or residence in [Country] and will return to Turkey before my visa expires.

Thank you for your consideration.

Sincerely,
[Signature]
[Name]
[Date]`,
            related: ["schengen-guide", "rejection-reasons", "biometric-photo"],
        }
    },
    "digital-nomad": {
        tr: {
            title: "Dijital Göçebe (Digital Nomad) Vizesi",
            category: "Modern Vize",
            toc: ["Nedir?", "Kimler Başvurabilir?", "Avantajları", "Gerekenler"],
            content: `## Dijital Göçebe (Digital Nomad) Vizesi Nedir?

Uzaktan çalışanların (freelancer veya şirkete bağlı) başka bir ülkede yaşayarak çalışmasına izin veren vize türüdür. Portekiz, İspanya, Yunanistan, Estonya gibi ülkeler popülerdir.

## Kimler Başvurabilir?

*   Konumdan bağımsız çalışabilenler.
*   Gideceği ülkede bir işverene bağlı olmayanlar (gelir yurtdışından gelmeli).
*   Belirli bir aylık gelir düzeyini kanıtlayanlar (Örn: Portekiz için ~3.040€).

## Avantajları

*   Uzun süreli oturum izni (genellikle 1 yıl ve uzatılabilir).
*   Schengen bölgesinde serbest dolaşım.
*   Vergi avantajları (bazı ülkelerde).

## Başvuru İçin Gerekenler

*   İş sözleşmesi veya freelance kontratlar.
*   Son 3-6 aylık gelir belgeleri (Banka dökümü).
*   Temiz sabıka kaydı.
*   Konaklama belgesi (kira kontratı).`,
            related: ["schengen-guide"],
        },
        en: {
            title: "Digital Nomad Visa Guide",
            category: "Modern Visa",
            toc: ["What is it?", "Who Can Apply?", "Benefits", "Requirements"],
            content: `## What is a Digital Nomad Visa?

Allows remote workers (freelance or employed) to live and work in another country. Portugal, Spain, Greece, Estonia are popular.

## Who Can Apply?

*   Location-independent workers.
*   Income must come from outside the destination country.
*   Proof of specific monthly income (e.g., ~€3,040 for Portugal).

## Benefits

*   Long-term residence (usually 1 year + renewable).
*   Free movement in Schengen.
*   Tax benefits (in some countries).

## Requirements

*   Work contract or freelance agreements.
*   Proof of income for last 3-6 months.
*   Clean criminal record.
*   Accommodation proof (rental contract).`,
            related: ["schengen-guide"],
        }
    },
    "student-visa": {
        tr: {
            title: "Öğrenci Vizesi Rehberi",
            category: "Eğitim",
            toc: ["Vize Türleri", "Kabul Mektubu", "Bloke Hesap", "Süreç"],
            content: `## Öğrenci Vizesi (Eğitim Vizesi)

Yurtdışında dil okulu, lisans veya yüksek lisans eğitimi almak isteyenlerin başvurması gereken vize türüdür (Örn: Almanya için Ulusal Vize / D Tipi).

## Temel Şartlar

1.  **Kabul Mektubu:** Okuldan alınmış resmi kabul belgesi.
2.  **Maddi Yeterlilik (Bloke Hesap):** Özellikle Almanya gibi ülkeler, yıllık yaşam masrafını (yaklaşık 11.000€) bir banka hesabında bloke etmenizi ister. Aileniz sponsor olacaksa noter onaylı taahhütname gerekir.
3.  **Motivasyon Mektubu:** Neden bu bölümü, neden bu ülkeyi seçtiğinizi ve kariyer hedeflerinizi anlatan güçlü bir mektup.

## Süreç

Süreç turist vizesine göre daha uzundur (4-8 hafta). Mülakatta dil yeterliliğiniz ve akademik geçmişiniz sorgulanabilir.`,
            related: ["schengen-guide", "us-tourist-visa"],
        },
        en: {
            title: "Student Visa Guide",
            category: "Education",
            toc: ["Visa Types", "Acceptance Letter", "Blocked Account", "Process"],
            content: `## Student Visa

Required for language school, bachelor's, or master's degrees abroad (e.g., National Visa / Type D for Germany).

## Key Requirements

1.  **Acceptance Letter:** Official admission document from the school.
2.  **Financial Proof (Blocked Account):** Countries like Germany require blocking annual living costs (~€11,000) in a bank account. Or, a notarized sponsorship letter from family.
3.  **Motivation Letter:** A strong letter explaining why you chose this course/country and your career goals.

## Process

Takes longer than tourist visas (4-8 weeks). Interviews may test language skills and academic background.`,
            related: ["schengen-guide", "us-tourist-visa"],
        }
    },
    "canada-tourist-visa": {
        tr: {
            title: "Kanada Turist Vizesi (TRV)",
            category: "Kanada",
            toc: ["Online Başvuru", "Gerekli Belgeler", "Biyometrik"],
            content: `## Kanada Turist Vizesi (TRV)

Kanada'ya turistik, aile ziyareti veya kısa süreli iş amaçlı seyahatler için Geçici İkamet Vizesi (Temporary Resident Visa - TRV) almanız gerekir. Kanada vizesi genellikle pasaport süreniz kadar (maksimum 10 yıl) verilir.

## Başvuru Yöntemi: Online (GCKey)

Kanada başvuruları **IRCC** portalı üzerinden tamamen online yapılır. Fiziksel evrak teslimi yoktur (pasaport hariç).
1.  GCKey hesabı oluşturun.
2.  Sorulan sorulara göre size özel oluşan evrak listesini (Checklist) tamamlayın.
3.  Belgeleri PDF formatında sisteme yükleyin.

## Önemli Gerekli Belgeler

*   **Niyet Mektubu:** Seyahat planınızı ve amacınızı detaylı anlatan mektup çok önemlidir.
*   **Maddi Kanıtlar:** Banka dökümleri, tapular, araç ruhsatları. Kanada "maddi yeterlilik" konusunda çok hassastır.
*   **Seyahat Geçmişi:** Pasaportunuzdaki eski vizeler ("Travel History" dosyası olarak tek PDF'te birleştirin). ABD vizeniz varsa mutlaka ekleyin, büyük avantaj sağlar.

## Biyometrik ve Pasaport

Başvuruyu gönderip ödemeyi (Vize + Biyometrik ücreti) yaptıktan sonra, **VFS Global**'den biyometrik (parmak izi) randevusu almanız istenir. Parmak izi verdikten sonra dosyanız incelemeye alınır. Onay gelirse pasaportunuzu VFS'ye teslim edersiniz.`,
            related: ["schengen-guide", "us-tourist-visa", "cover-letter"],
        },
        en: {
            title: "Canada Tourist Visa (TRV)",
            category: "Canada",
            toc: ["Online Application", "Documents", "Biometrics"],
            content: `## Canada Tourist Visa (TRV)

For tourism, family visits, or short business, you need a Temporary Resident Visa (TRV). Usually valid until your passport expires (max 10 years).

## Application Method: Online (GCKey)

Applied wholly online via the **IRCC** portal. No physical submission (except passport).
1.  Create GCKey account.
2.  Complete the custom document checklist generated for you.
3.  Upload PDFs.

## Key Documents

*   **Letter of Explanation:** Detailed letter covering itinerary and purpose is crucial.
*   **Financial Proof:** Bank statements, assets. Canada is strict on "financial sufficiency".
*   **Travel History:** Combine past visas/stamps into one PDF. A US visa is a huge plus.

## Biometrics & Passport

After payment (Visa + Bio fee), book biometric appointment at **VFS Global**. Once approved, submit passport to VFS.`,
            related: ["schengen-guide", "us-tourist-visa", "cover-letter"],
        }
    },
    "travel-insurance": {
        tr: {
            title: "Vize İçin Seyahat Sigortası",
            category: "Belgeler",
            toc: ["Zorunluluk", "Schengen Şartları", "Hatalar", "Satın Alma"],
            content: `## Vize İçin Seyahat Sağlık Sigortası

Vize başvurularının, özellikle Schengen vizesinin **zorunlu** belgesidir. Sadece bir prosedür değil, seyahatinizde başınıza gelebilecek sağlık sorunlarına karşı bir güvencedir.

## Schengen Vizesi Sigorta Şartları

*   **Teminat:** En az **30.000 Euro** teminatlı olmalıdır.
*   **Kapsam:** Tüm Schengen üye ülkelerinde geçerli olmalıdır.
*   **Süre:** Seyahat sürenizin tamamını kapsamalıdır. (Tavsiye: Dönüş tarihinden sonraki günü de kapsayacak şekilde +1 gün opsiyonlu yaptırın).
*   **İçerik:** Acil tıbbi müdahale, hastane yatışı ve cenaze nakli masraflarını içermelidir.

## Sık Yapılan Hatalar

*   **Euro yerine Dolar teminatı:** Bazı konsolosluklar 30.000 USD teminatı kabul etmez, mutlaka 30.000 EUR yazmalıdır.
*   **Islak İmza/Kaşe:** Poliçenin çıktısını aldıktan sonra sigorta acentesine kaşeletip imzalatmanız gerekebilir (Online poliçelerde barkodlu ise gerekmeyebilir).
*   **Tarih Hatası:** Uçak bileti tarihlerinizle birebir örtüşmelidir.

## Sigorta Nereden Alınır?

VisaPath üzerinden başvuru yaparken size uygun sigortayı indirimli olarak sunuyoruz. Kendiniz yaptıracaksanız büyük sigorta şirketlerinin "Vize Sigortası" veya "Yurtdışı Seyahat Sigortası" paketlerini seçebilirsiniz.`,
            related: ["schengen-guide"],
        },
        en: {
            title: "Travel Insurance for Visas",
            category: "Documents",
            toc: ["Requirement", "Schengen Rules", "Mistakes", "Buying"],
            content: `## Travel Health Insurance for Visas

A **mandatory** document, especially for Schengen. Not just paperwork, but protection against health issues abroad.

## Schengen Insurance Requirements

*   **Coverage:** Minimum **€30,000**.
*   **Scope:** Valid in all Schengen member states.
*   **Duration:** Must cover entire travel period. (Tip: Add +1 day buffer after return date).
*   **Content:** Must cover emergency medical care, hospitalization, and repatriation.

## Common Mistakes

*   **USD instead of EUR:** Some consulates don't accept $30k; ensure it says €30k.
*   **Original Signature:** Printouts might need wet signature/stamp from the agency (unless barcode validated).
*   **Date Mismatch:** Must match flight dates exactly.

## Where to Buy?

VisaPath offers discounted suitable insurance during application. If buying independently, choose "Visa Insurance" or "Overseas Travel Insurance" packages from major insurers.`,
            related: ["schengen-guide"],
        }
    },
    "transit-visa": {
        tr: {
            title: "Transit Vize Rehberi",
            category: "Vize Türleri",
            toc: ["Nedir?", "A Tipi", "C Tipi", "Muafiyetler"],
            content: `## Transit Vize Nedir?

Bir ülkeye gitmek için başka bir ülkeden aktarma yaparken, havalimanından çıkmasanız bile o ülkenin talep edebileceği kısa süreli vizedir. Her ülke transit vize istemez.

## A Tipi (Havalimanı) Transit Vize

Havalimanının uluslararası transit bölgesinden (gümrükten) çıkmadan uçak değiştirecekler içindir.
*   **Kimden istenir?** Türk vatandaşlarından Almanya, Hollanda, Fransa gibi ülkeler bazı durumlarda transit vize ister (Eğer geçerli Schengen, ABD, İngiltere vizeniz yoksa).

## C Tipi Transit Vize

Havalimanından çıkıp, bagaj alıp tekrar check-in yapmanız gerekiyorsa veya havalimanı değiştiriyorsanız (Örn: Londra Heathrow'dan Gatwick'e geçiş) gerekir. Bu durumda o ülkeye giriş yapmış sayılırsınız, normal turist vizesi prosedürleri geçerlidir.

## Muafiyetler (Vize Gerekmeyen Durumlar)

Genellikle şu durumlarda transit vize istenmez:
*   Geçerli bir Schengen, ABD, Kanada, İngiltere veya Japonya vizeniz varsa.
*   Aktarma süresi 12-24 saati geçmiyorsa (Ülkeye göre değişir).
*   Transit bölgeden dışarı çıkılmayacaksa.

**Önemli:** Biletinizi almadan önce mutlaka transit kurallarını kontrol edin. "Self-transfer" (kendi aktarmanızı kendiniz yaptığınız) uçuşlarda genellikle vize gerekir.`,
            related: ["schengen-guide"],
        },
        en: {
            title: "Transit Visa Guide",
            category: "Visa Types",
            toc: ["What is it?", "Type A", "Type C", "Exemptions"],
            content: `## What is a Transit Visa?

A short-term visa required by some countries just to change planes, even if you don't verify customs.

## Type A (Airport) Transit Visa

For changing planes without leaving the international transit area.
*   **Who needs it?** Turkish citizens transit via Germany, Netherlands, France might need it (unless holding valid Schengen/US/UK visas).

## Type C Transit Visa

Required if leaving the airport, re-checking bags, or changing airports (e.g., Heathrow to Gatwick). You technically enter the country; standard rules apply.

## Exemptions

Usually waived if:
*   Holding valid Schengen, US, Canada, UK, or Japan visa.
*   Layover is under 12-24 hours (varies by country).
*   Staying in transit zone.

**Important:** Check rules before booking. "Self-transfer" flights usually require a visa.`,
            related: ["schengen-guide"],
        }
    },
    "first-time-abroad": {
        tr: {
            title: "İlk Kez Yurtdışına Çıkacaklara Tavsiyeler",
            category: "Seyahat İpuçları",
            toc: ["Pasaport", "Ülke Seçimi", "Uçak & Otel", "Havalimanı"],
            content: `## İlk Kez Yurtdışına Çıkacaklar İçin Adım Adım Rehber

İlk yurtdışı deneyimi heyecan verici ama biraz da stresli olabilir. İşte adım adım yapmanız gerekenler:

## 1. Pasaport Çıkarmak

Henüz pasaportunuz yoksa Nüfus Müdürlüğü'nden randevu alıp (Bordo Pasaport) başvurmalısınız.
*   En az 6 aylık, tavsiyemiz 10 yıllık pasaport almanızdır (Daha ekonomiktir).

## 2. Vize veya Vizesiz Ülke Seçimi

*   **Vizesiz:** Balkanlar (Karadağ, Sırbistan), Gürcistan (Kimlikle), Ukrayna gibi ülkelere vizesiz gidebilirsiniz.
*   **Vizeli:** Avrupa (Schengen) istiyorsanız en az 2 ay önceden vize işlemlerine başlayın.

## 3. Uçak Bileti ve Konaklama

Erken rezervasyon hayat kurtarır. Vize başvurusu yapacaksanız "iptal edilebilir" seçenekleri tercih edin.

## 4. Yurtdışı Çıkış Harcı

Havalimanına gitmeden önce veya havalimanındaki otomatlardan yurtdışı çıkış harcını ödeyin (Dekontu saklayın).

## 5. İletişim (Telefon)

Hattınızı yurtdışına açtırın veya gittiğiniz ülkeden e-SIM / fiziksel SIM kart almayı araştırın. Haritaları çevrimdışı kullanmak için indirin.

## 6. Para İşleri

Yanınızda bir miktar o ülkenin nakit parasını (Döviz) bulundurun. Kredi kartınızı yurtdışı kullanımına açtırın.

## 7. Havalimanı Süreci

*   Uçuştan 3 saat önce havalimanında olun.
*   Check-in kontuarına gidin, bavulu verin, biniş kartını alın.
*   Pasaport kontrolden geçin (Polis nereye gittiğinizi sorabilir).
*   Kapıya (Gate) gidin ve uçağı bekleyin. İyi yolculuklar!`,
            related: ["schengen-guide", "travel-insurance"],
        },
        en: {
            title: "Tips for First-Time Travelers",
            category: "Travel Tips",
            toc: ["Passport", "Destination", "Flight & Hotel", "Airport"],
            content: `## Step-by-Step Guide for First-Time Travelers

First time abroad is exciting but daunting. Here is your roadmap:

## 1. Get a Passport

Apply at the population office.
*   Get at least 10 years validity (more economical) if possible.

## 2. Visa vs. Visa-Free

*   **Visa-Free:** Balkans, Georgia (with ID), etc.
*   **Visa Required:** For Europe, start 2 months ahead.

## 3. Flight & Hotel

Book early. Choose "refundable" options if applying for a visa.

## 4. Departure Fee

Pay the exit tax fee before or at the airport (Keep receipt).

## 5. Communication

Enable roaming or check e-SIM options. Download offline maps.

## 6. Money

Carry some cash (foreign currency). Enable credit card for international use.

## 7. Airport Process

*   Arrive 3 hours early.
*   Check-in, drop bags, get boarding pass.
*   Passport control (police might ask destination).
*   Go to Gate. Bon voyage!`,
            related: ["schengen-guide", "travel-insurance"],
        }
    },
};
