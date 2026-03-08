

# Advisor Panel Müşterilerim, Admin Finansallar ve Genel Düzeltme Planı

---

## 1. Advisor Panel — Müşterilerim Sayfası Tasarım Düzeltmesi

**Sorunlar:** Dropdown/expand butonu tıklanınca 180° dönüyor ve animasyon yavaş. Genel tasarım eski ve ağır.

**Düzeltmeler:**
- `ChevronDown` ikonunun `rotate-180` ve `duration-500` animasyonunu `duration-200` yap
- Customer kart yapısını sadeleştir: aşırı `tracking-widest`, `font-black` ve `text-[10px]` değerlerini normal boyutlara çek
- Filtre alanındaki native `<select>` elementini Shadcn `Select` bileşeniyle değiştir (dropdown rendering sorunu çözülür)
- "SON ETKİLEŞİM — Bugün, 14:30" hardcoded metni kaldır veya gerçek veriye bağla (last_seen'den çek)

## 2. Advisor Panel — Müşteri Detay Sayfası (AdvisorProfile / navigate to customer)

**Sorunlar:** Ülke adları İngilizce ("Italy" vs "İtalya"), bayrak yok, AI müşteri için çalışıyor danışman için değil, mesajlar gözükmüyor, belge havuzu bağlantısı belirsiz.

**Düzeltmeler:**
- `destination_country` alanında Türkçe çeviri map'i uygula (aynı `ai-chat`'teki `DEST_TR` gibi bir map): `{ italy: "İtalya", germany: "Almanya", ... }`
- Ülke adının yanına bayrak emoji ekle (basit bir map: `{ "İtalya": "🇮🇹", "Almanya": "🇩🇪", ... }`)
- Detay sayfasında (navigate ile gidilen) mesaj bölümü ekle — `MessageCenter` bileşenini inline olarak göster
- Belge havuzu: `application_documents` tablosundan çekilen belgeler müşteriye de görünür (RLS zaten buna izin veriyor). Advisor upload ettiğinde `application_documents`'a kaydoluyor — müşteri Dashboard'da `appDocs` state'i varsa görebilir. Dashboard'da belge listesinin `application_documents` tablosundan fetch edilip gösterildiğini doğrula.

## 3. Mesajlar Sayfası — Başvuru Başına Değil Müşteri Başına

**Sorun:** Mesajlar sekmesinde her `applications` kaydı ayrı bir konuşma satırı olarak listeleniyor (satır 1204: `applications.map`). Aynı müşterinin birden fazla başvurusu varsa birden fazla satır çıkıyor.

**Düzeltme:** `applications.map` yerine `customers` listesini kullan (zaten hesaplanmış, satır 207). Her müşteri bir kez görünsün. Duplicate user_id'leri filtrele.

## 4. Finansal Durum — Bekleyen Ödeme Mantığı

**Sorun:** Advisor finansal durumda "Bekleyen Ödeme" tüm onaylanmamış başvuru komisyonlarını gösteriyor. Halbuki çekilebilir bakiye olan parayı çekmek için bir buton olmalı, "çek" butonuna basana kadar bekleyen ödemeye geçmemeli.

**Düzeltme:**
- "Bekleyen Ödeme" kartını "İşlemdeki Kazanç" olarak yeniden adlandır — bunlar henüz vize onaylanmamış başvuruların komisyonları
- "Çekilebilir Bakiye" kartına bir "Ödeme Talep Et" butonu ekle (tıklanınca toast ile "Talep alındı" mesajı göster — gerçek ödeme sistemi daha sonra entegre edilebilir)
- Mantık doğru: Onaylanmış/Tamamlanmış başvuruların komisyonu = çekilebilir. Diğerleri = işlemde. Bu şekilde kullanıcıya net açıklama yapılır.

## 5. Performans Metrikleri — Gerçek Veri

**Sorun:** `avgResponseTime: "1.2s"` ve `satisfactionRate: 98` hardcoded.

**Düzeltme:**
- `avgResponseTime`: Mesaj yanıt süresi hesapla — gelen mesaj ve danışmanın ilk yanıtı arasındaki fark ortalamasını al (messages tablosundan). Veri yoksa "N/A" göster.
- `satisfactionRate`: Henüz rating sistemi yok → "Yakında" veya gerçek `completionRate` değerini kullan.
- Bu iki metriğin altına "(gerçek veri)" veya "(tahmini)" label'ı ekle.

## 6. Admin Panel — Finansallar Düzeltmesi

**Sorunlar:** T-cetveli (gelir/gider tablosu) mevcut ama tasarım modern değil. Metrikler düzgün çalışıyor gibi görünüyor ama doğrulanmalı.

**Düzeltmeler:**
- Finansal kartları daha modern gradient'ler ve shadow'larla güncelle
- T-cetveli tablosundaki `<Table>` yapısını daha okunabilir yap (row hover efektleri, daha net renk ayrımı)
- "Dışa Aktar" butonuna CSV export fonksiyonu bağla (şu an onClick yok)

## 7. Admin Panel — Genel Bakış Metrikleri

**Sorun:** "+%12 geçen aya göre" gibi hardcoded metrikler var (satır 819).

**Düzeltme:**
- Gerçek ay-ay karşılaştırma hesapla veya hardcoded string'leri kaldır
- Stats kartlarına gerçek trend göstergesi ekle (bu ay vs geçen ay başvuru sayısı farkı)

## 8. Uygulama Sırası

1. Mesajlar: `applications.map` → `customers` listesi (basit düzeltme)
2. Müşterilerim dropdown/tasarım düzeltmesi
3. Ülke çevirisi + bayrak ekleme (advisor panel genelinde)
4. Finansal mantık düzeltmesi (advisor + admin)
5. Performans metrikleri gerçek veriye bağlama
6. Admin finansallar modernizasyonu
7. Mesaj bölümünü detay sayfasına ekleme

**Tahmini değişiklik:** ~4-5 dosya (AdvisorPanel.tsx, Admin.tsx, AdminAdvisorDetail.tsx, + yardımcı util dosyası ülke çevirisi için)

