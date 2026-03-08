
# Site Entegrasyon Plani

Bu plan, sitenin tum ozelliklerini canli ve calisir hale getirmek icin gereken degisiklikleri kapsar: Google ile giris, e-posta dogrulama, musteri-danisman eslesmesi, booking sistemi ve tum butonlarin backend entegrasyonu.

---

## 1. Google ile Giris (Login Sayfasina Ekleme)

Login sayfasina "Google ile Giris Yap" butonu eklenecek. Lovable Cloud'un yonetilen Google OAuth ozelligi kullanilacak.

- `src/integrations/lovable/index` modulunu import edip `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` cagrisi yapilacak
- Login.tsx'e e-posta/sifre formunun ustune veya altina bir ayirici ("veya") ve Google butonu eklenecek
- Giris basariliysa mevcut rol kontrol mantigi aynen uygulanacak (admin/moderator ise cikis yaptir, user ise /dashboard'a yonlendir)

**Teknik Detay:** Lovable Cloud'un Configure Social Login araci cagirilarak `src/integrations/lovable` klasoru otomatik olusturulacak. Ardindan Login.tsx'e buton eklenir.

---

## 2. E-posta Dogrulama

Mevcut kayit akisinda e-posta dogrulama zaten uygulanmis durumda (signUp sonrasi `showEmailVerification` ekrani gosteriliyor). Supabase tarafinda auto-confirm KAPALI olmali -- bu kontrol edilip gerekiyorsa onaylanacak.

- Kayit sonrasi kullaniciya dogrulama e-postasi gonderiliyor (Supabase varsayilan davranisi)
- Kullanici e-postadaki linke tiklayinca hesap aktif oluyor
- Mevcut akis korunacak, ek bir degisiklik gerekmeyecek

---

## 3. SMS Dogrulama (OTP)

SMS OTP destegi icin Supabase Phone Auth yapilandirilacak. Ancak SMS OTP, Lovable Cloud'da harici bir SMS saglayicisi (Twilio vb.) gerektirir.

- Kullaniciya SMS dogrulama icin Twilio entegrasyonu gerektigi bildirilecek
- Alternatif olarak, telefon numarasi profilde saklanmaya devam edecek (mevcut haliyle)
- SMS OTP tam entegrasyon icin kullanicidan Twilio API anahtari talep edilecek

**Not:** Bu adim kullanici onayina bagli olarak opsiyonel kalacak.

---

## 4. Musteri-Danisman Eslesmesi (Iki Tarafli Gorunum)

### 4a. Musteri Paneli (Dashboard.tsx)
Mevcut durum: Dashboard zaten `assigned_advisor_id` uzerinden danisman bilgilerini cekiyor ve "Danisman" kartinda gosteriyor. Ayrica `advisor_assignments` tablosu uzerinden basvuru bazli eslesmeler de gorunuyor.

Eklenecekler:
- Overview'daki danisman kartina danisman uzmanliklari (specializations) ve kisa bio eklenecek
- Her basvurunun detayinda atanan danisman bilgisi daha belirgin gosterilecek
- Eslesmesi olmayan kullanicilara "Danisman atamaniz bekleniyor" mesaji gosterilecek

### 4b. Danisman Paneli (AdvisorPanel.tsx)
Mevcut durum: `advisor_assignments` + `applications` + `profiles` tablolari uzerinden atanan musteriler listeleniyor.

Eklenecekler:
- Musteri detay gorunumunde musteri profili (telefon, e-posta, paket durumu) gosterilecek
- Musteri basvuru durumunu guncelleme butonlari zaten calisir durumda (handleUpdateApplicationStatus)
- Mesajlasma mevcut ve calisir durumda

---

## 5. Booking Sistemi (Availability ve Requestler)

### 5a. Danisman Tarafinda Musaitlik Yonetimi
Mevcut durum: AdvisorPanel'de `advisor_blocked_slots` tablosu kullanilarak gun bazli musaitlik ekleniyor (reason='Musait'). Bu zaten calisir durumda:
- Takvimden gun sec
- Saat dilimlerini isaretle
- Kaydet

**Iyilestirme:** Musaitlik kaydedildikten sonra listeyi yenileyerek guncel durumu gostermek.

### 5b. Musteri Tarafinda Randevu Talebi
Mevcut durum: `BookingCalendar` bileseni zaten calisir durumda:
- Danisman musait gunleri takvimde gosteriyor
- Musait saatleri listeli yor
- Randevu istegi `consultations` tablosuna 'pending' olarak ekleniyor

**Iyilestirmeler:**
- Dashboard'daki "Randevu Al" butonu zaten `isBookingOpen` state ile BookingCalendar'i aciyor
- Musteri panelinde mevcut randevulari listeleme bolumu eklenecek (consultations tablosundan)
- Randevu durumu (pending/confirmed/rejected) musteri panelinde gorulecek

### 5c. Danisman Tarafinda Randevu Yonetimi
Mevcut durum: AdvisorPanel "bookings" sekmesinde randevular listeleniyor ve onay/red butonlari mevcut.

**Iyilestirmeler:**
- Onaylanan randevularin musteri tarafinda da guncellenmesi (realtime veya refetch)
- Danisman tarafindan dogrudan randevu olusturma (directBookOpen zaten mevcut)

---

## 6. Tum Butonlarin Calisir Hale Getirilmesi

Mevcut durumda cogu buton zaten backend'e bagli. Kontrol edilecek ve baglanti kurulacak alanlar:

| Sayfa | Buton/Aksiyon | Durum |
|-------|-------------|-------|
| Apply.tsx | Basvuru olusturma | Calisiyor (applications tablosuna insert) |
| Dashboard | Belge yukleme | Kontrol edilecek (storage + application_documents) |
| Dashboard | Mesaj gonderme | Calisiyor (MessageCenter) |
| Dashboard | Randevu alma | Calisiyor (BookingCalendar) |
| AdvisorPanel | Durum guncelleme | Calisiyor |
| AdvisorPanel | Belge yukleme | Calisiyor |
| AdvisorPanel | Profil guncelleme | Calisiyor |
| Pricing | Paket secimi | /apply sayfasina yonlendirme kontrolu |
| Contact | Form gonderme | Backend entegrasyonu kontrol edilecek |

---

## 7. Musteri Paneline Randevularim Bolumu Ekleme

Dashboard.tsx'e yeni bir "Randevularim" bolumu eklenecek:
- `consultations` tablosundan musterinin randevulari cekilecek
- Tarih, saat, danisman adi ve durum (Bekliyor/Onaylandi/Reddedildi) gosterilecek
- Overview sekmesinde yaklasan randevu kartolarak gosterilecek

---

## Uygulama Sirasi

1. Google OAuth yapilandirmasi (Configure Social Login araci + Login.tsx butonu)
2. E-posta dogrulama ayarlarini kontrol et
3. Dashboard'a randevularim bolumu ekle
4. Musteri panelinde danisman bilgilerini zenginlestir
5. Danisman panelinde musteri detaylarini zenginlestir
6. Tum sayfalardaki butonlarin backend baglantilarini dogrula
7. Contact formu backend entegrasyonu (gerekiyorsa)
8. SMS OTP icin kullanici bilgilendirmesi

---

## Teknik Notlar

- Google OAuth icin `lovable.auth.signInWithOAuth("google")` kullanilacak, `supabase.auth.signInWithOAuth()` degil
- Tum storage bucket'lar zaten private (application-documents, message_attachments, documents)
- RLS politikalari zaten mevcut tablolarda uygulanmis durumda
- Yeni tablo olusturmaya gerek yok, mevcut sema yeterli
