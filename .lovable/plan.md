

# Kapsamlı Site Güncellemesi Planı

Bu plan; Pricing sayfasının kaldırılması, müşteri paneli modernizasyonu, mobil uyumluluk, AI iyileştirmeleri, danışman/admin paneli düzeltmeleri ve tüm butonların işlevselliği konularını kapsar.

---

## 1. Pricing Sayfasını Kaldır

- `App.tsx`: `/pricing` route'unu kaldır
- `Navbar.tsx`: `navLinks` dizisinden `nav.pricing` linkini çıkar
- `MobileBottomNav.tsx`: Pricing linki varsa çıkar
- Dashboard'daki `pricing` sekmesi zaten mevcut, kalacak (panel içi fiyatlandırma)

## 2. Müşteri Paneli (Dashboard.tsx) — Mobil Uyumluluk & UI

**Mobil responsive düzeltmeleri:**
- DashboardLayout sidebar'ı mobilde gizli olmalı, hamburger menü ile açılmalı — `SidebarProvider` zaten bunu destekliyor ancak `min-h-screen` ve sabit genişlikler sorun yaratıyor
- Tüm `rounded-[2rem]` ve `rounded-[2.5rem]` değerleri mobilde `rounded-2xl` ile değiştirilecek
- `grid-cols-3` alanları mobilde `grid-cols-1` olacak (zaten bazıları var, eksikleri tamamlanacak)
- Stat kartlarının `p-8`, `gap-6` değerleri mobilde küçültülecek
- `text-3xl`, `text-4xl` başlıklar mobilde `text-xl`/`text-2xl` olacak
- Başvuru listesi kartlarındaki `flex-row` düzeni mobilde `flex-col` olacak
- Profil düzenleme formu mobilde tam genişlik

**Aktif başvuru "yok" görünme hatası:**
- `MyConsultations` bileşeni `customer_id` ile sorgu yapıyor ama consultations tablosunda `customer_id` profiles.id'ye referans veriyor. Doğru `profile.id` gönderiliyor — sorun yok
- "Aktif başvuru yok" sorunu: Danışman panelinde `no-app-` prefix'li dummy kayıtlar oluşturuluyor. Bunlar filtrelenmeli veya doğru gösterilmeli

**Randevularım — geçmiş randevuları ayır:**
- `MyConsultations.tsx`: Gelecekteki ve geçmiş randevuları iki ayrı bölümde göster
- Geçmiş olanlar ayrı bir "Geçmiş" accordion altında, daha soluk (opacity-60) gösterilecek
- Sadece aktif/yaklaşan randevular ana listede

## 3. AI İyileştirmeleri

**AI Chatbot konuşma stili:**
- `ai-chat/index.ts` system prompt: Daha doğal, samimi Türkçe kullanması için prompt güncelleme — "yapay" ve "resmi" dil yerine günlük konuşma tonu
- Emojilerin aşırı kullanımını sınırla

**AI Belge Özetleyici:**
- `ai-application-summary/index.ts`: Prompt'u daha kısa, net ve doğal cümleler üretecek şekilde güncelle
- `ai-document-review/index.ts`: Sonuç kartlarını daha okunaklı hale getir

**AI Asistan başvuru görünürlüğü:**
- Dashboard'dan AI'a gönderilen `applications` context'i zaten tüm başvuruları içeriyor
- `ai-chat/index.ts`'deki RPC fallback `get_applications_for_ai_chat` da tüm başvuruları çekiyor (LIMIT 5000)
- Sorun: Context getter her çağrıldığında `applications` state'i kullanıyor — eğer data henüz yüklenmediyse boş gidiyor. Çözüm: `applications.length === 0 && dataLoading` durumunda AI'a veri henüz yükleniyor mesajı göster

## 4. DashboardLayout — Mobil Uyumluluk

- Sidebar'ı mobilde (< 768px) varsayılan kapalı olarak ayarla
- `SidebarProvider` zaten mobilde sheet/drawer olarak çalışıyor — bunu doğrula
- Main content'e mobilde `p-4` padding uygula (şu an `p-8 lg:p-12`)
- Sidebar trigger (hamburger) butonu ekle mobil header'a

## 5. Danışman Paneli (AdvisorPanel.tsx) Düzeltmeleri

**Müşterilerim sayfası uyumu:**
- Customer kartlarındaki `rounded-[3rem]` ve aşırı padding değerlerini diğer sekmelerle tutarlı hale getir (`rounded-[2rem]`, `p-6`)
- "Aktif Başvuru Bulunamadı" mesajı: `no-app-` prefix kontrolü düzgün çalışıyor ama UI'da "Aktif başvuru yok" yerine başvuru varsa gösterilmeli
- Müşteri kartlarında profil fotoğrafı göster (şu an sadece baş harfler)

**Finansal Durum sayfası:**
- Mevcut tablo yapısı çalışıyor, UI modernize edilecek
- Kart tasarımlarını daha modern ve tutarlı yap
- `DollarSign` ikonu yerine daha uygun finansal ikonlar

**Performans metrikleri:**
- `avgResponseTime: "1.2s"` gibi hardcoded değerler yerine gerçek veriye dönüştür veya "Yakında" olarak göster
- `satisfactionRate: 98` ve `completionRate` → gerçek veri zaten hesaplanıyor (completionRate)

**Profil fotoğrafları:**
- `documents` bucket private — `getPublicUrl` çalışmaz. `createSignedUrl` kullanılmalı
- Veya storage bucket'ı public yapılmalı (sadece profil fotoları için)

**SVG/İkon güncellemeleri:**
- Lucide ikonları zaten modern, ek SVG sorunu yok
- Badge ref uyarısını düzelt: `forwardRef` ile sarma

## 6. Admin Paneli Düzeltmeleri

- Grafiklerde gerçek veri zaten kullanılıyor (usersList üzerinden hesaplanıyor)
- Admin dashboard kartlarını ve chart alanını mobilde responsive yap
- Profil fotoğrafları için aynı signed URL düzeltmesi

## 7. Tüm Butonların İşlevselliği

Çalışmayan/eksik butonlar:
- AdvisorPanel → "Performans Detayları" butonu: Şu an `onClick` yok → tab değişikliği veya modal ekle
- AdvisorPanel → Mesajlar sekmesindeki müşteri mesaj butonu: `MessageSquare` butonu `onClick` yok → `setSelectedChatUser` bağla
- Customer listesindeki mesaj butonu (satır 1105): onClick handler ekle

## 8. Uygulama Sırası

1. Pricing route/navbar kaldır
2. DashboardLayout mobil responsive düzelt (en kritik — tüm panelleri etkiler)
3. Dashboard.tsx mobil uyumluluk + MyConsultations geçmiş ayırma
4. AI prompt ve context düzeltmeleri (edge functions + frontend)
5. AdvisorPanel müşterilerim + finansal + profil fotoğrafı düzeltmeleri
6. Admin paneli responsive + grafik düzeltmeleri
7. Çalışmayan butonları işlevsel hale getir
8. Badge ref uyarısını düzelt

---

## Teknik Notlar

- Storage bucket `documents` private olduğu için profil fotoğrafları `getPublicUrl` ile erişilemez → `createSignedUrl` ile geçici URL oluşturulacak
- Mobil responsive için Tailwind `sm:`, `md:`, `lg:` prefix'leri kullanılacak; sabit pixel değerleri kaldırılacak
- AI prompt güncellemeleri edge function'larda yapılacak (otomatik deploy)
- Yaklaşık 8-10 dosya düzenlenecek

