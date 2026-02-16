import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, BookOpen } from "lucide-react";

/* ── Article images ─────────────────────────────────────── */
const articleImages: Record<string, string> = {
  "schengen-guide": "/images/articles/schengen-guide.png",
  "us-tourist-visa": "/images/articles/us-tourist-visa.png",
  "uk-visitor-visa": "/images/articles/uk-visitor-visa.png",
  "rejection-reasons": "/images/articles/rejection-reasons.png",
  "biometric-photo": "/images/articles/biometric-photo.png",
  "cover-letter": "/images/articles/cover-letter.png",
};

const articleContent: Record<string, { title: string; category: string; readTime: string; toc: string[]; content: string; related: string[] }> = {
  "schengen-guide": {
    title: "Türk Vatandaşları İçin Eksiksiz Schengen Vize Rehberi",
    category: "Schengen",
    readTime: "12 dk okuma",
    toc: ["Schengen Alanı Nedir?", "26 Schengen Ülkesi", "Vize Türleri", "Gerekli Belgeler", "Mali Gereksinimler", "İşlem Süresi", "Randevu Alma", "Yaygın Ret Sebepleri"],
    content: `## Schengen Alanı Nedir? 🇪🇺
    
Schengen Alanı, karşılıklı sınırlarındaki tüm pasaport ve sınır kontrollerini resmi olarak kaldırmış 26 Avrupa ülkesinden oluşan bir bölgedir. Türk vatandaşları için bu, tek bir Schengen vizesinin herhangi bir 180 günlük süre içinde 90 güne kadar tüm 26 üye ülkede serbest seyahat etmenize olanak tanıdığı anlamına gelir.

Schengen vizesi dünya genelinde en çok talep edilen vizelerden biridir ve başvuru sürecini iyice anlamak, onay şansınızı önemli ölçüde artırabilir.

## 26 Schengen Ülkesi 🗺️

Schengen Alanı şu ülkeleri kapsar: 
🇦🇹 Avusturya, 🇧🇪 Belçika, 🇨🇿 Çekya, 🇩🇰 Danimarka, 🇪🇪 Estonya, 🇫🇮 Finlandiya, 🇫🇷 Fransa, 🇩🇪 Almanya, 🇬🇷 Yunanistan, 🇭🇺 Macaristan, 🇮🇸 İzlanda, 🇮🇹 İtalya, 🇱🇻 Letonya, 🇱🇮 Lihtenştayn, 🇱🇹 Litvanya, 🇱🇺 Lüksemburg, 🇲🇹 Malta, 🇳🇱 Hollanda, 🇳🇴 Norveç, 🇵🇱 Polonya, 🇵🇹 Portekiz, 🇸🇰 Slovakya, 🇸🇮 Slovenya, 🇪🇸 İspanya, 🇸🇪 İsveç ve 🇨🇭 İsviçre.

**Önemli:** Başvuru yaparken, en çok zaman geçirmeyi planladığınız ülkenin konsolosluğuna veya birden fazla ülkede eşit zaman geçirecekseniz ilk giriş ülkesinin konsolosluğuna başvurmanız gerekir.

## Vize Türleri 📋

Türk vatandaşları için en yaygın Schengen vizesi **Tip C (Kısa Süreli)** vizedir. 

*   **Turistik:** Tatil ve gezi amaçlı.
*   **Ticari:** İş toplantıları ve fuarlar için.
*   **Aile Ziyareti:** AB'de yaşayan akrabaları ziyaret için.
*   **Kültürel/Sportif:** Etkinliklere katılım için.

Bu vize, 180 günlük bir süre içinde **maksimum 90 gün** kalış hakkı tanır. Sık seyahat edenler için 1 yıldan 5 yıla kadar geçerli **Çok Girişli (Multi)** vizeler mevcuttur.

## Gerekli Belgeler 🗂️

Başvurunuz şunları içermelidir:
1.  **Başvuru Formu:** Eksiksiz doldurulmuş ve imzalanmış.
2.  **Pasaport:** En az iki boş sayfası olan ve dönüş tarihinden itibaren en az 3 ay geçerli.
3.  **Biyometrik Fotoğraf:** 2 adet, 35x45mm, beyaz fonlu.
4.  **Seyahat Sağlık Sigortası:** Minimum €30.000 teminatlı, tüm Schengen bölgesinde geçerli.
5.  **Konaklama Kanıtı:** Otel rezervasyonu veya davetiye.
6.  **Ulaşım:** Gidiş-dönüş uçak bileti rezervasyonu.
7.  **Mali Durum:** Son 3 aylık banka dökümü (kaşeli/imzalı), maaş bordroları.
8.  **Mesleki Belgeler:** İşveren yazısı, SGK dökümü, vergi levhası vb.

## Mali Gereksinimler 💰

Konsolosluklar, seyahat masraflarınızı karşılayabileceğinizi kanıtlamanızı ister.
*   **Günlük Tutar:** Gideceğiniz ülkeye göre değişmekle birlikte, ortalama günlük **€50 - €100** arası bir bakiye göstermeniz beklenir.
*   **Banka Hareketleri:** Aniden yatırılan büyük meblağlar şüphe çeker. Düzenli gelir akışı önemlidir.

## İşlem Süresi ⏳

Standart işlem süresi **15 takvim günüdür**. Ancak yoğun dönemlerde (Yaz ayları, bayramlar) bu süre 45 güne kadar uzayabilir. Seyahatinizden en az **1.5 ay önce** başvurmanızı öneririz.

## Randevu Alma 📅

Randevular, ülkelerin yetkili aracı kurumları (VFS Global, iDATA, Kosmos vb.) üzerinden alınır. 
*   **Almanya/İtalya:** iDATA
*   **Fransa/Hollanda:** VFS Global
*   **Yunanistan:** Kosmos (bazı bölgeler)

⚠️ **Uyarı:** Randevu slotları çok hızlı dolmaktadır. Planlamanızı buna göre yapın.

## Yaygın Ret Sebepleri ❌

1.  **Mali Yetersizlik:** Bankada yeterli bakiye olmaması veya kaynağının belirsiz olması.
2.  **Geri Dönüş Şüphesi:** Türkiye'ye bağlayıcı (iş, eş, tapu vb.) unsurların yetersiz görülmesi.
3.  **Belge Eksikliği:** Sigorta, otel vb. belgelerin kurallara uymaması.
4.  **Yanlış Beyan:** Otel rezervasyonunun sahte olması veya iptal edilmesi.

VisaPath ile başvurarak belgelerinizin eksiksiz ve doğru olduğundan emin olabilir, ret riskini en aza indirebilirsiniz.`,
    related: ["rejection-reasons", "biometric-photo", "cover-letter"],
  },
  "us-tourist-visa": {
    title: "ABD Turist Vizesi (B-1/B-2) Başvurusu — Adım Adım",
    category: "ABD",
    readTime: "15 dk okuma",
    toc: ["Genel Bakış", "DS-160 Formu", "MRV Ücreti Ödemesi", "Mülakat Hazırlığı", "Gerekli Belgeler", "Yaygın Mülakat Soruları", "INA 214(b) Kapsamında Ret"],
    content: `## Genel Bakış

B-1/B-2 vizesi, Amerika Birleşik Devletleri'ne geçici ziyaretçiler için en yaygın göçmen olmayan vizedir. B-1 kategorisi iş ziyaretçilerini, B-2 ise turistleri, tıbbi tedavi arayanları ve aile veya arkadaş ziyaret edenleri kapsar. Çoğu Türk başvuru sahibi için B-2 turist vizesi uygun kategoridir.

ABD vize süreci benzersizdir çünkü ABD Büyükelçiliği veya Konsolosluğu'nda yüz yüze mülakat gerektirir. Mülakat kritik bir bileşendir — mükemmel belgelerle bile zayıf bir mülakat performansı vize reddine neden olabilir.

## DS-160 Formu

DS-160, online göçmen olmayan vize başvuru formudur. Mülakatınızı planlamadan önce bunu tamamlamanız gerekir. Form yaklaşık 60-90 dakika sürer ve kişisel bilgilerinizi, seyahat planlarınızı, iş geçmişinizi, eğitiminizi ve güvenlikle ilgili soruları kapsar.

DS-160 için önemli ipuçları: her soruyu dürüstçe ve tutarlı bir şekilde cevaplayın, ABD gereksinimlerini karşılayan bir fotoğraf yükleyin (2x2 inç, beyaz arka plan, son 6 ay içinde çekilmiş) ve onay sayfanızı kaydedin — mülakatınız için barkod numarasına ihtiyacınız olacak.

## MRV Ücreti Ödemesi

B-1/B-2 vizesi için Makine Okunabilir Vize (MRV) ücreti şu anda $185'tır. Bu ücret, vizenizin onaylanıp onaylanmadığına bakılmaksızın iade edilmez. Ödeme Türkiye'deki belirlenmiş banka şubelerinde veya ABD vize randevu planlama sistemi aracılığıyla online olarak yapılabilir.

## Mülakat Hazırlığı

Konsolosluk mülakatı genellikle 2-5 dakika sürer. Memurun temel endişesi, ziyaretinizden sonra sizi geri dönmeye zorlayacak Türkiye'ye güçlü bağlarınız olup olmadığıdır. Şunları açıkça ifade etmeye hazırlanın: seyahatinizin amacı, seyahat tarihleriniz, nerede kalacağınız, geziyi kimin finanse ettiği, istihdam durumunuz ve Türkiye'ye bağlarınız.

Profesyonel giyinin, erken gelin, düzenli belgeler getirin ve soruları doğrudan ve kısaca cevaplayın. Gereksiz bilgi vermeyin veya ezberlenmiş konuşmalar yapmayın.

## Gerekli Belgeler

Konsolosluk memuru tüm belgeleri görmek istemeyebilir ancak şunları getirmelisiniz: DS-160 onay sayfası, pasaport, mülakat randevu mektubu, MRV ücreti makbuzu, güncel fotoğraf, mali kanıt (banka hesap özetleri, vergi beyannameleri), işveren doğrulama mektubu, mülk sahipliği belgeleri, aile bağları belgeleri ve seyahat planınız.

## Yaygın Mülakat Soruları

Şu sorular bekleyin: "Ziyaretinizin amacı nedir?", "Ne kadar kalmayı planlıyorsunuz?", "Kimi ziyaret edeceksiniz?", "İşiniz ne?", "Daha önce uluslararası seyahat ettiniz mi?", "Geziyi kim ödüyor?" ve "ABD'de aileniz var mı?"

## INA 214(b) Kapsamında Ret

Göç ve Vatandaşlık Yasası'nın 214(b) bölümü, her B vizesi başvuru sahibinin aksini kanıtlayana kadar göçmek niyetinde olduğunu varsayar. Bu, vize reddi için en yaygın nedendir. Reddedilirseniz, ret nedenini açıklayan bir mektup alırsınız. İstediğiniz zaman yeniden başvurabilirsiniz, ancak ret nedenlerini ele almalısınız — tipik olarak memleketinize daha güçlü bağ kanıtları sunarak.

VisaPath'in VIP Concierge planıyla çalışmak, ABD vize başvuruları için onay oranlarını önemli ölçüde artıran mülakat koçluğuna erişim sağlar.`,
    related: ["schengen-guide", "rejection-reasons", "cover-letter"],
  },
  "uk-visitor-visa": {
    title: "İngiltere Standart Ziyaretçi Vizesi: Bilmeniz Gereken Her Şey",
    category: "İngiltere",
    readTime: "10 dk okuma",
    toc: ["Genel Bakış", "Online Başvuru", "Biyometrik Kayıt", "Gerekli Belgeler", "Mali Gereksinimler", "İşlem Süresi"],
    content: `## Genel Bakış

İngiltere Standart Ziyaretçi Vizesi, turizm, iş toplantıları, tıbbi tedavi veya akademik faaliyetler için 6 aya kadar Birleşik Krallık'ı ziyaret etmenize olanak tanır. Türk vatandaşları İngiltere'ye seyahat etmeden önce bu vizeyi almalıdır. Schengen'den farklı olarak İngiltere, UK Visas and Immigration (UKVI) tarafından yönetilen kendi ayrı vize sistemine sahiptir.

## Online Başvuru

Başvuru süreci resmi UKVI portalında online olarak başlar. Bir hesap oluşturmanız, başvuru formunu doldurmanız ve vize ücretini ödemeniz gerekir (standart 6 aylık vize için şu anda £115). Online form kişisel bilgilerinizi, seyahat geçmişinizi, mali durumunuzu ve ziyaret amacınızı kapsar.

Online formu tamamladıktan sonra, Türkiye'deki bir Vize Başvuru Merkezi'nde (VAC) biyometrik randevu alırsınız. VFS Global İstanbul, Ankara, İzmir ve diğer büyük şehirlerdeki VAC'ları işletmektedir.

## Biyometrik Kayıt

VAC randevunuzda biyometrik verilerinizi (parmak izleri ve dijital fotoğraf) verirsiniz. Ayrıca pasaportunuzu ve destekleyici belgelerinizi de teslim edersiniz. Randevu genellikle 15-30 dakika sürer.

## Gerekli Belgeler

Önemli belgeler: geçerli pasaport, mali kanıt (son 6 aydaki banka hesap özetleri), istihdam veya iş belgeleri, konaklama detayları, uçuş rezervasyonları ve ziyaretinizi açıklayan bir niyet mektubu. Aile veya arkadaş ziyaret ediyorsanız, göç durumu detayları ile birlikte davet mektubu dahil edin.

## Mali Gereksinimler

İngiltere minimum banka bakiyesi belirtmez, ancak çalışmadan kalışınızı rahatça finanse edebileceğinizi kanıtlamanız gerekir. Konsolosluk memurları tutarlı gelir, belirtilen planlarınızla uyumlu tasarruflar ve seyahati finanse ederken evinizde yaşam tarzınızı sürdürebileceğinize dair kanıt arar.

## İşlem Süresi

Standart işlem 3-6 hafta sürer. Ek ücret karşılığında öncelikli hizmetler mevcuttur: Öncelik (5 iş günü) £250 ve Süper Öncelik (ertesi iş günü) £500. Planlanan seyahatinizden en az 8 hafta önce başvurmanızı öneriyoruz.`,
    related: ["schengen-guide", "rejection-reasons", "biometric-photo"],
  },
  "rejection-reasons": {
    title: "Vize Başvuruları Neden Reddedilir? (Ve Nasıl Önlenir)",
    category: "Seyahat İpuçları",
    readTime: "8 dk okuma",
    toc: ["Giriş", "Sebep 1: Yetersiz Mali Kanıt", "Sebep 2: Ülkeye Zayıf Bağlar", "Sebep 3: Eksik Belgeler", "Sebep 4: Tutarsız Bilgiler", "Sebep 5: Önceki İhlaller", "Sebep 6: Yetersiz Sigorta", "Sebep 7: Zayıf Mülakat Performansı"],
    content: `## Giriş

Vize retleri çoğu başvuru sahibinin düşündüğünden daha yaygındır. Başvuruların reddedilmesinin en önemli nedenlerini anlamak — ve her birine nasıl çözüm bulacağınızı bilmek — başarı şansınızı dramatik şekilde artırabilir. İşte en yaygın yedi ret nedeni ve her biri için pratik çözümler.

## Sebep 1: Yetersiz Mali Kanıt

Bu dünya çapında vize reddi için bir numaralı nedendir. Konsolosluklar, gezinizi mali zorluk yaşamadan rahatça karşılayabileceğinizi görmek ister. Çözüm: düzenli gelir gösteren 3-6 aylık banka hesap özetleri sunun, Schengen için günde en az €50-100 tutarını kapsayan bakiye tutun ve başvurmadan önce büyük açıklanmamış yatırımlar yapmaktan kaçının.

## Sebep 2: Ülkeye Zayıf Bağlar

Göç memurları ziyaretinizden sonra ülkenize döneceğinize inanmalıdır. Çözüm: iş sözleşmeleri veya işletme sahipliği belgeleri, tapu veya uzun vadeli kira sözleşmeleri, aile belgeleri (evlilik cüzdanı, çocukların okul kaydı) ve memleketinizdeki devam eden taahhütlerin diğer kanıtlarını sunun.

## Sebep 3: Eksik Belgeler

Tek bir gerekli belgenin eksik olması bile reddedilmeye neden olabilir. Çözüm: ayrıntılı bir belge kontrol listesi kullanın (VisaPath'in sunduğu gibi), gerekiyorsa tüm belgelerin uygun şekilde tercüme edildiğinden emin olun, her şeyin kopyasını çıkarın ve belgeleri konsolosluğun beklediği sırayla düzenleyin.

## Sebep 4: Tutarsız Bilgiler

Başvuru formunuz ile destekleyici belgeleriniz arasındaki tutarsızlıklar şüphe uyandırır. Çözüm: her belgedeki tüm tarihleri, tutarları ve ayrıntıları çapraz kontrol edin. Belirtilen seyahat amacınızın güzergahınız, konaklama ve mali düzenlemelerinizle eşleştiğinden emin olun.

## Sebep 5: Önceki Göç İhlalleri

Önceki bir vizeyi aşmak veya vize koşullarını ihlal etmek çok ciddiye alınır. Çözüm: geçmiş ihlalleriniz varsa, bunları başvurunuzda dürüstçe ele alın. Değişen koşulların kanıtını sunun ve artık ülkenize daha güçlü bağlarınız olduğunu gösterin.

## Sebep 6: Yetersiz Seyahat Sigortası

Birçok ülke belirli minimum kapsam gerektirir. Schengen vizeleri için sigorta, tıbbi harcamalarda ve geri dönüşte en az €30.000'u kapsamalıdır. Çözüm: hedef ülkenizin özel gereksinimlerini karşılayan tanınmış bir sağlayıcıdan kapsamlı seyahat sigortası satın alın.

## Sebep 7: Zayıf Mülakat Performansı

Mülakat gerektiren ülkelerde (ABD gibi), performansınız belgeleriniz kadar önemlidir. Çözüm: cevaplarınızı prova edin, kısa ve kendinden emin olun, profesyonel giyinin ve asla yalan söylemeyin veya abartmayın. Heyecanlanıyorsanız, VisaPath'in VIP Concierge planında sunulan profesyonel mülakat hazırlık hizmetlerini düşünün.`,
    related: ["schengen-guide", "us-tourist-visa", "cover-letter"],
  },
  "biometric-photo": {
    title: "Biyometrik Fotoğraf Gereksinimleri — Eksiksiz Kontrol Listesi",
    category: "Belge Rehberleri",
    readTime: "6 dk okuma",
    toc: ["ICAO Standartları", "Arka Plan Gereksinimleri", "Yüz İfadesi ve Poz", "Ülkelere Göre Boyut Gereksinimleri", "Yaygın Hatalar"],
    content: `## ICAO Standartları

Uluslararası Sivil Havacılık Örgütü (ICAO), seyahat belgelerinde kullanılan biyometrik fotoğraflar için küresel standartlar belirler. Çoğu ülke bu standartları, bazı ek ülkeye özgü gereksinimlerle birlikte takip eder. Bu standartları anlamak fotoğrafınızın reddedilmemesini sağlar.

Temel ICAO gereksinimleri: fotoğraf renkli olmalı, düz açık renkli bir arka plan önünde çekilmeli, yüzünüz alından çeneye ve her iki kulak da görünecek şekilde net olmalıdır. Fotoğraf güncel olmalı (son 6 ay içinde çekilmiş) ve mevcut görünümünüzü doğru bir şekilde temsil etmelidir.

## Arka Plan Gereksinimleri

Arka plan çoğu ülke için düz beyaz veya kırık beyaz olmalıdır. ABD özellikle düz beyaz arka plan gerektirir. Schengen ülkeleri açık gri veya açık mavi kabul eder. İngiltere düz krem veya açık gri arka plan gerektirir. Desenli arka planlardan, arka plandaki gölgelerden veya saçınız veya kıyafetinizle karışan arka planlardan kaçının.

## Yüz İfadesi ve Poz

Yüz ifadeniz nötr olmalı, ağzınız kapalı. Gülümseme, kaş çatma veya kaş kaldırma yok. Doğrudan kameraya bakın, her iki göz açık ve net görünür. Başınız ortada ve eğik olmamalıdır. Tıbbi olarak gerekli olmadıkça gözlükleri çıkarın (bazı ülkeler gözlüklü fotoğrafları artık hiç kabul etmiyor). Baş örtüleri yalnızca dini amaçlarla kabul edilir ve yüzünüz yine de tamamen görünür olmalıdır.

## Ülkelere Göre Boyut Gereksinimleri

**Schengen / AB**: 35mm × 45mm. Yüz çerçevenin %70-80'ini kaplamalıdır. Çeneden tepeye baş yüksekliği 32-36mm.

**Amerika Birleşik Devletleri**: 2 inç × 2 inç (51mm × 51mm). Çeneden başın üstüne baş yüksekliği 1 inç ile 1-3/8 inç (25-35mm) arasında olmalıdır.

**Birleşik Krallık**: 45mm × 35mm. Çeneden tepeye baş yüksekliği 29-34mm.

**Kanada**: 50mm × 70mm. Çeneden tepeye yüz yüksekliği 31-36mm.

**Avustralya**: 35mm × 45mm. Çeneden tepeye baş yüksekliği 32-36mm.

## Yaygın Hatalar

En sık karşılaşılan fotoğraf ret nedenleri: yanlış boyutlar, kırmızı göz, yüzde veya arka planda gölgeler, çok karanlık veya aşırı pozlanmış fotoğraf, gözlük takma (giderek daha çok reddediliyor), yüzü kapatan baş örtüsü, yanlış arka plan rengi, 6 aydan eski fotoğraf ve dijital düzenleme veya filtreler. Her zaman hedefiniz için vize gereksinimlerini anlayan profesyonel bir fotoğraf hizmeti kullanın.`,
    related: ["schengen-guide", "uk-visitor-visa", "cover-letter"],
  },
  "cover-letter": {
    title: "Onay Alan Bir Vize Niyet Mektubu Nasıl Yazılır?",
    category: "Belge Rehberleri",
    readTime: "7 dk okuma",
    toc: ["Niyet Mektubu Neden Önemli", "Yapı", "Ton ve Dil", "Neler Dahil Edilmeli", "Nelerden Kaçınılmalı", "Örnek Niyet Mektubu"],
    content: `## Niyet Mektubu Neden Önemli

Vize niyet mektubu, davanızı doğrudan konsolosluk memuruna sunma fırsatınızdır. Her zaman zorunlu olmasa da, iyi yazılmış bir niyet mektubu, seyahat amacınızı açıkça açıklayarak, memleketinize bağlarınızı göstererek ve olası endişeleri proaktif olarak ele alarak başvurunuzu önemli ölçüde güçlendirebilir.

Bunu tüm destekleyici belgelerinizi tutarlı bir anlatıya bağlayan kişisel bir tanıtım olarak düşünün.

## Yapı

Niyet mektubunuz açık, profesyonel bir yapı izlemelidir: kişisel bilgileriniz ve başvurduğunuz vize ile başlayın, ardından seyahat amacınızı belirtin, güzergahınız hakkında ayrıntılar verin, mali durumunuzu açıklayın, memleketinize bağlarınızı vurgulayın ve kibarca vize onayı talebiyle kapatın.

Bir sayfada tutun — konsolosluk memurları yüzlerce başvuruyu inceler ve kısalığı takdir eder.

## Ton ve Dil

Profesyonel ama doğal bir tonda yazın. Aşırı resmi olmaktan veya süslü dil kullanmaktan kaçının. Doğrudan, dürüst ve spesifik olun. Doğru dilbilgisi ve yazım kullanın. İngilizce ana diliniz değilse, İngilizce'ye hakim biri tarafından okutun.

## Neler Dahil Edilmeli

Temel unsurlar: tam adınız ve pasaport numaranız, başvurduğunuz özel vize türü ve süresi, tarihlerle birlikte ayrıntılı seyahat güzergahınız, kimi ziyaret ettiğiniz veya nerede kalacağınız, geziyi nasıl finanse ettiğiniz, istihdam durumunuz, memleketinizdeki aile bağları ve vizenin süresi dolmadan dönme taahhüdünüz.

## Nelerden Kaçınılmalı

Asla yanlış bilgi, servetiniz hakkında abartılı iddialar, duygusal yalvarışlar, alakasız kişisel hikayeler veya memleketinize yönelik eleştiriler eklemeyin. Vizenin izin verdiğinin ötesinde çalışma, eğitim veya kalışınızı uzatma niyetinden bahsetmeyin. Gerçek durumunuzu yansıtmayan genel şablonlardan kaçının.

## Örnek Niyet Mektubu

Sayın Vize Memuru,

[Ülke] ziyareti için Schengen Turist Vizesi (Tip C) başvurumu desteklemek amacıyla yazıyorum. Planlanan tarihlerim [tarihler] ve pasaport numaram [numara].

İstanbul, Türkiye'de [şirket]'te [pozisyon] olarak çalışmaktayım ve burada [X] yıldır görev yapmaktayım. Ekli banka hesap özetlerimde ve iş yazımda belgelendiği üzere aylık [tutar] maaş almaktayım.

Ziyaretimin amacı turizmdir. [X] gün boyunca Paris, Lyon ve Nice'i ziyaret etmeyi planlıyorum. Konaklama [otel isimleri]'nde ve gidiş-dönüş uçuş rezervasyonum [havayolu] ile yapılmıştır.

Türkiye'ye güçlü bağlarım var: [mülk] sahibiyim, ailem burada yaşıyor ve [şirketteki] pozisyonuma dönme taahhüdüm var. Daha önce [ülkeleri] ziyaret ettim ve her zaman vize düzenlemelerine uydum.

Başvurumun olumlu değerlendirilmesini saygıyla arz ederim. Tüm destekleyici belgeler ektedir.

Saygılarımla,
[Adınız]`,
    related: ["schengen-guide", "rejection-reasons", "biometric-photo"],
  },
  "digital-nomad": {
    title: "Dijital Göçebe Vizesi: Dünyayı Gezerek Çalışın",
    category: "Modern Vize",
    readTime: "9 dk okuma",
    toc: ["Dijital Göçebe Vizesi Nedir?", "Popüler Ülkeler", "Başvuru Şartları", "Vergi Avantajları", "Nasıl Başvurulur?"],
    content: `## Dijital Göçebe Vizesi Nedir? 💻

Dijital Göçebe Vizesi (Digital Nomad Visa), uzaktan çalışan profesyonellerin yasal olarak yabancı bir ülkede yaşamasına ve çalışmasına olanak tanıyan bir oturum iznidir. Turist vizesinden farklı olarak daha uzun süre (genellikle 1 yıl ve üzeri) kalış hakkı tanır.

## Popüler Ülkeler 🌍

Türk vatandaşları için popüler seçenekler:
*   **🇵🇹 Portekiz (D8):** En popüler seçeneklerden. Aylık ~€3.040 gelir şartı var. 5 yıl sonra vatandaşlık yolu açık.
*   **🇪🇸 İspanya:** Yeni başlayan program. Aylık ~€2.500 gelir gerektiriyor. Vergi avantajları mevcut.
*   **🇬🇷 Yunanistan:** %50 vergi indirimi sunuyor. Aylık €3.500 kazanç göstermek gerekli.
*   **🇭🇺 Macaristan (White Card):** Aylık €2.000 gelir yeterli. Bütçe dostu bir seçenek.

## Başvuru Şartları 📝

Genel olarak aranan şartlar:
1.  **Uzaktan Çalışma:** Şirketinizin veya müşterilerinizin ülke dışında olduğunu kanıtlamalısınız.
2.  **Minimum Gelir:** Her ülke aylık belirli bir kazanç eşiği belirlemiştir (Genelde €2.000 - €3.500 arası).
3.  **Temiz Sabıka Kaydı:** Geçmişte suç kaydınızın olmaması gerekir.
4.  **Sağlık Sigortası:** Kapsamlı özel sağlık sigortası.

## Vergi Avantajları 💸

Birçok ülke dijital göçebeleri çekmek için özel vergi rejimleri sunar. Örneğin İspanya'da "Beckham Yasası" ile %24 sabit vergi ödeyebilirsiniz. Portekiz'de NHR statüsü ile 10 yıl boyunca dış gelirlerinizden muaf olabilirsiniz.

## Nasıl Başvurulur? 🚀

Başvurular genellikle ilgili ülkenin konsoloslukları üzerinden yapılır. Süreç:
1.  Belgelerin toplanması ve çevirisi.
2.  Konsolosluk randevusu.
3.  Vize onayı ile ülkeye giriş.
4.  Oturum kartı başvurusu (ülkeye vardıktan sonra).

VisaPath, Portekiz ve İspanya başvurularınızda size uçtan uca danışmanlık sağlar.`,
    related: ["schengen-guide"],
  },
  "student-visa": {
    title: "Avrupa ve Amerika'da Öğrenci Vizesi Rehberi",
    category: "Eğitim",
    readTime: "11 dk okuma",
    toc: ["Vize Türleri", "Okul Kabulü", "Bloke Hesap", "Gerekli Belgeler", "Çalışma İzni"],
    content: `## Vize Türleri 🎓

Eğitim vizeleri genellikle ikiye ayrılır:
*   **Dil Okulu Vizesi:** Kısa süreli dil eğitimi için. Çalışma izni genellikle vermez.
*   **Akademik Vize:** Lisans, Yüksek Lisans veya Doktora için. Genellikle yarı zamanlı çalışma izni sağlar.

## Okul Kabulü 🏫

Vize başvurusunun ilk adımı bir okuldan kabul almaktır.
*   **Şartlı Kabul:** Dil yeterliliği sağlandıktan sonra bölüme başlama.
*   **Kesin Kabul:** Doğrudan programa başlama.
Kabul mektubunuz (Letter of Acceptance) vize dosyanızın en önemli parçasıdır.

## Bloke Hesap (Blocked Account) 💶

Özellikle **Almanya** başvurularında zorunludur. Almanya'da yaşam masraflarınızı karşılayabileceğinizi kanıtlamak için, yıllık yaklaşık **€11.208** (2024 rakamı) tutarı bir Alman bankasında bloke hesaba yatırmanız gerekir. Bu para size aylık taksitler halinde geri ödenir.

## Gerekli Belgeler 📂

1.  **Kabul Mektubu:** Okuldan alınan resmi yazı.
2.  **Mali Yeterlilik:** Bloke hesap, burs yazısı veya garantör belgesi.
3.  **Motivasyon Mektubu:** Neden bu okulu ve ülkeyi seçtiğinizi anlatan detaylı yazı.
4.  **Dil Sertifikası:** TOEFL, IELTS, Goethe veya TestDaF sonucu.
5.  **Diploma ve Transkript:** Önceki eğitim belgeleriniz.

## Çalışma İzni 💼

Çoğu ülke öğrencilere haftada **20 saate kadar** (yarı zamanlı) çalışma izni verir. Bu, yaşam masraflarınızı karşılamanıza yardımcı olabilir. Tatil dönemlerinde genellikle tam zamanlı çalışabilirsiniz.

VisaPath ile öğrenci vizesi başvurularınızda motivasyon mektubu yazımından bloke hesap açılışına kadar destek alabilirsiniz.`,
    related: ["schengen-guide", "us-tourist-visa"],
  },
};

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const article = id ? articleContent[id] : null;

  if (!article) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Makale Bulunamadı</h1>
          <Link to="/learn"><Button variant="outline">Bilgi Bankası'na Dön</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft size={14} /> Bilgi Bankası'na Dön
          </Link>

          {/* Hero Image */}
          {id && articleImages[id] && (
            <div className="rounded-2xl overflow-hidden mb-8 border border-border">
              <img src={articleImages[id]} alt={article.title} className="w-full h-48 md:h-64 object-cover" />
            </div>
          )}

          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar TOC */}
            <aside className="hidden md:block">
              <div className="sticky top-24">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">İçindekiler</h4>
                <nav className="space-y-2">
                  {article.toc.map((item) => (
                    <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <motion.article
              className="md:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-3 py-1 bg-secondary rounded-full font-semibold text-muted-foreground">{article.category}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold mb-8 leading-tight text-navy-dark">{article.title}</h1>

              <div className="prose max-w-none text-foreground/80 leading-relaxed space-y-5">
                {article.content.split("\n\n").map((para, i) => {
                  if (para.startsWith("## ")) {
                    const heading = para.replace("## ", "");
                    return <h2 key={i} id={heading.toLowerCase().replace(/\s+/g, "-")} className="text-xl md:text-2xl font-extrabold text-navy-dark mt-10 mb-4">{heading}</h2>;
                  }
                  if (para.startsWith("**")) {
                    return <p key={i} className="font-semibold text-foreground text-base md:text-lg">{para.replace(/\*\*/g, "")}</p>;
                  }
                  return <p key={i} className="text-base md:text-lg">{para}</p>;
                })}
              </div>

              {/* CTA */}
              <div className="mt-12 p-8 md:p-10 rounded-2xl bg-gradient-navy text-primary-foreground">
                <h3 className="font-extrabold text-xl mb-3">Başvurmaya hazır mısınız? Evrak işlerini bize bırakın.</h3>
                <p className="text-base opacity-70 mb-5">VisaPath uzmanları vize başvurunuzun her adımında size rehberlik edecek.</p>
                <Link to="/apply">
                  <Button className="btn-gradient text-white font-bold h-13 px-8 text-base rounded-xl">
                    Başvuruyu Başlat <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Related */}
              {article.related.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-bold mb-4">İlgili Makaleler</h3>
                  <div className="grid gap-3">
                    {article.related.map((relId) => {
                      const rel = articleContent[relId];
                      if (!rel) return null;
                      return (
                        <Link key={relId} to={`/learn/${relId}`} className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-muted/50 transition-colors">
                          <BookOpen size={16} className="text-accent shrink-0" />
                          <span className="text-sm font-medium">{rel.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.article>
          </div>
        </div>
      </div>
    </div>
  );
}
