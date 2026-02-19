
# Kapsamli Sistem Duzeltme ve Gelistirme Plani

## Mevcut Sorunlar (Build Hatalari)

1. **Admin.tsx**: `profiles` tablosunda `email` kolonu yok -- sorgu `full_name, phone, email` seciyor ama tabloda `email` yok
2. **Dashboard.tsx**: `profiles` tablosunda `avatar_url` kolonu yok; `advisors` tablosunda `rating` ve `review_count` kolonu yok
3. **JoinAdvisor.tsx**: `advisor_applications` tablosu Supabase types dosyasinda tanimli degil (tablo DB'de var ama types guncellenmemis)

## Yapilacak Isler

### 1. Veritabani Migrasyonu

- `advisor_applications` tablosunu Supabase types dosyasina eklemek icin types dosyasini guncelleyemeyiz (otomatik), ancak `(supabase as any)` ile gecici cozum zaten var -- build hatasini tipler icinde duzeltmemiz gerekiyor
- Yeni kolon eklenmeyecek -- mevcut sema yeterli. Sorunlar kodun olmayan kolonlari sorgulamasindan kaynaklaniyor

### 2. Build Hatalarinin Duzeltilmesi

**Admin.tsx (satir ~188):**
- `profiles` sorgusundan `email` kolonunu kaldirmak. Profil tablosunda email yok, kullanicinin email'i `auth.users` tablosunda. Sorguyu `user_id, full_name, phone` olarak degistirmek yeterli

**Dashboard.tsx (satir ~78-87):**
- `profiles` sorgusundan `avatar_url` kolonunu kaldirmak (yok)
- `advisors` tablosundan `rating` ve `review_count` erisimini kaldirmak (bu kolonlar yok). Sabit degerler kullanilacak

**JoinAdvisor.tsx (satir ~111):**
- `advisor_applications` tablosu types'ta tanimli degil. `(supabase as any)` cast'i ile cozulecek (zaten Admin.tsx'te bu yontem kullaniliyor)

### 3. Danışman Profil Bilgileri

Danismanin kendi profilini duzenleyebildigi ekran zaten `AdvisorPanel.tsx`'te "Profilim" sekmesinde mevcut. Su anda `email`, `phone`, `about_me`, `photo_url` alanlarini kaydediyor. Bu alanlar `advisors` tablosunda zaten var.

Musteri panelinde (Dashboard.tsx) atanan danismanin bilgileri gosteriliyor -- sadece `avatar_url` ve `rating/review_count` referanslarini duzeltmemiz gerekiyor:
- `avatar_url` yerine `photo_url` kullanilacak (advisors tablosundaki kolon)
- `rating` ve `review_count` icin sabit/varsayilan degerler kullanilacak

### 4. Footer'a Staff Giris Linki Ekleme

Footer.tsx'e "Yetkili Girisi" linki eklenecek (`/staff-login` sayfasina yonlendirir). Bu sayfa zaten mevcut ve calisiyor.

### 5. Danışman Başvuru Akisi (JoinAdvisor)

Zaten mevcut ve calisir durumda:
- Kullanici `/join-advisor`'dan basvuruyor
- Admin panelinde "Danismanlik Talepleri" sekmesinde gorunuyor
- Admin onayladiginda `user_roles`'a `moderator` ekleniyor ve `advisors` tablosuna kayit olusturuluyor
- Tek sorun: types hatasi -- `(supabase as any)` ile cozulecek

### 6. Belge Yukleme Karari

Belge yukleme ozelligi **basvuru satın aldiktan sonra** aktif olacak. Best practice olarak:
- Kullanici basvuru yapar ve plani secer
- Basvuru olusturulduktan sonra Dashboard'da her basvuru icin belge yukleme alani gorunur
- Bu, gereksiz belge yuklemesini onler ve sureci daha organize tutar

Dashboard.tsx'e her basvuru kartinin altina bir "Belge Yukle" butonu/alani eklenecek. Belgeler Supabase Storage'daki mevcut `documents` bucket'ina yuklenecek.

### 7. Mesajlasma Sistemi

Mesajlasma zaten calisiyor (`MessageCenter` komponenti, `messages` tablosu, realtime subscription). Duzeltilecek tek sey: types uyumsuzlugu (`(supabase as any)` zaten kullaniliyor).

---

## Teknik Detaylar

### Degistirilecek Dosyalar

1. **src/pages/Admin.tsx**
   - Satir ~188: `profiles` sorgusundan `email` kaldirilacak
   - Satir ~195: `p?.email` referansi `adv.email` ile degistirilecek (advisors tablosundaki email)

2. **src/pages/Dashboard.tsx**
   - Satir ~78: `profiles` sorgusundan `avatar_url` kaldirilacak
   - Satir ~84-87: `avatar_url` yerine `photo_url`, `rating`/`review_count` yerine sabit degerler

3. **src/pages/JoinAdvisor.tsx**
   - Satir ~110-111: `supabase` yerine `(supabase as any)` cast'i eklenecek

4. **src/components/Footer.tsx**
   - Footer alt kismina "Yetkili Girisi" linki eklenecek

5. **src/pages/Dashboard.tsx** (ek)
   - Her basvuru kartina belge yukleme alani eklenecek
   - Supabase Storage'a dosya yukleme fonksiyonu eklenecek

6. **src/integrations/supabase/types.ts**
   - `advisor_applications` tablosu tanimini eklemek -- ancak bu dosya otomatik uretildigi icin dogrudan duzenlenemez. Bunun yerine kodda `(supabase as any)` kullanilacak
