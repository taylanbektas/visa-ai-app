

# Build Hataları ve Site Güncellemesi Planı

## 1. Build Hatalarının Düzeltilmesi

Üç TypeScript hatası var:

### 1a. `sync_advisor_assignments` RPC tipi eksik (Admin.tsx:138)
`types.ts` dosyasındaki `Functions` bölümünde `sync_advisor_assignments` ve `get_least_busy_advisor` fonksiyonları tanımlı değil. Bu fonksiyonlar veritabanında mevcut ama types.ts otomatik oluşturulduğu için düzenlenemez.

**Çözüm:** `supabase.rpc()` yerine `as any` cast kullanarak veya `supabase.rpc("sync_advisor_assignments" as any)` şeklinde çağrı yapılacak. Aynısı Dashboard.tsx'deki `get_least_busy_advisor` için de uygulanacak.

### 1b. `travel_date` property eksik (AgencyPanel.tsx:889)
AgencyPanel'deki `Application` type'ında `travel_date` alanı yok.

**Çözüm:** `Application` type tanımına `travel_date?: string | null` eklenmesi.

## 2. Fiyatlandırmayı Panel İçine Taşıma

Pricing sayfası şu an public bir route (`/pricing`). Giriş yapıldıktan sonra Dashboard içinde gösterilecek.

**Değişiklikler:**
- Dashboard.tsx'e yeni bir "Paketler" sidebar sekmesi eklenir
- Pricing içeriği Dashboard panelinde render edilir (plan seçince doğrudan `/apply` sayfasına yönlendirilir)
- Public `/pricing` route'u kaldırılmaz ama navbar'dan giriş yapmış kullanıcılar `/dashboard?tab=pricing` e yönlendirilir

## 3. AI Bileşenlerinin Güçlendirilmesi

- `AIDashboardChat.tsx`: Mesaj balonlarının görünümü düzeltilecek, boş state'de hoş geldin mesajı eklenecek
- `AIApplicationSummary.tsx`: Loading skeleton ve hata durumu iyileştirilecek  
- `AIDocumentReview.tsx`: Sonuç kartlarının görünümü tutarlı hale getirilecek

## 4. Eşleşme Sorunlarının Çözümü

Dashboard'daki auto-assign `get_least_busy_advisor` RPC çağrısı type hatası veriyor. Cast ile düzeltilecek. Ayrıca advisor bilgilerinin (specializations, bio) müşteri panelinde gösterilmesi sağlanacak.

## 5. Tüm Dashboard Butonlarının İşlevselleştirilmesi

- Profil düzenleme kaydet butonu → `profiles` tablosuna `UPDATE`
- Belge yükleme → `application-documents` bucket + `application_documents` tablosu
- Randevu al butonu → BookingCalendar bileşeni (zaten çalışıyor)
- Mesaj gönder → messages tablosuna INSERT (zaten çalışıyor)

## 6. Tasarım Tutarlılığı

- Tüm panellerde (Dashboard, AdvisorPanel, AgencyPanel, Admin) aynı kart stilleri, buton boyutları ve renk şeması kullanılacak
- Sidebar navigation stillerinin tutarlılığı sağlanacak

## Uygulama Sırası

1. Build hatalarını düzelt (3 dosya: Admin.tsx, Dashboard.tsx, AgencyPanel.tsx)
2. Pricing'i Dashboard'a taşı
3. AI bileşenlerini güçlendir ve görünümlerini düzelt
4. Eşleşme mantığını düzelt
5. Eksik buton işlevlerini tamamla
6. Tasarım tutarlılığı güncellemeleri

