

# Kapsamli Hata Duzeltme ve Sistem Iyilestirme Plani

## Tespit Edilen Sorunlar

### 1. Veritabani: applications tablosunda sonsuz dongu (Infinite Recursion)
`applications` tablosunun RLS politikasi `advisor_assignments` tablosunu kontrol ediyor, ancak `advisor_assignments` tablosunun RLS politikasi da geri `applications` tablosunu kontrol ediyor. Bu dongusel referans PostgreSQL'in "infinite recursion" hatasi vermesine neden oluyor.

### 2. Giris sonrasi yanlis yonlendirme
- **StaffLogin**: Her zaman `/advisor`'a yonlendiriyor, admin olsa bile.
- **Login**: `getPanelPath()` roller yuklenmeden cagriliyor (race condition). Admin yetkisine sahip `user@example.com` advisor panele yonleniyor.

### 3. AdvisorPanel veri cekme hatasi
Advisor paneli `profiles.assigned_advisor_id = user.id` (auth UUID) kontrolu yapiyor, ancak `assigned_advisor_id` alani `advisors` tablosundaki ID'yi tutuyor. Bu yuzden atanan musteriler gorunmuyor.

### 4. Dashboard'da danismani goruntuleme
Admin panelden atama yapildiktan sonra musteri panelinde "Atanmis danisman yok" gorunuyor, cunku profil bilgisi yeniden cekilmiyor.

### 5. Advisor profil duzenleme formu
Mevcut veriler forma on-dolgu yapilmiyor, form bos basliyor. Ayrica tasarim cok basit.

### 6. Veritabaninda yanlis rol atamalari
`customer@example.com` kullanicisina yanlis olarak `moderator` rolu atanmis.

---

## Cozum Plani

### Adim 1: RLS Sonsuz Dongu Duzeltmesi (Veritabani Migrasyonu)

Yeni bir `SECURITY DEFINER` fonksiyonu olusturulacak ve `advisor_assignments` tablosundaki sorunlu politika guncellenecek:

```sql
-- Advisor assignments icin guvenli kontrol fonksiyonu
CREATE OR REPLACE FUNCTION public.is_own_application(_user_id uuid, _application_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications
    WHERE id = _application_id AND user_id = _user_id
  )
$$;

-- Sorunlu politikayi kaldir ve yeniden olustur
DROP POLICY IF EXISTS "Users can view own application assignments" ON public.advisor_assignments;
CREATE POLICY "Users can view own application assignments" ON public.advisor_assignments
  FOR SELECT USING (public.is_own_application(auth.uid(), application_id));
```

Ayrica `customer@example.com` kullanicisinin yanlis moderator rolunu temizlemek icin:
```sql
DELETE FROM public.user_roles 
WHERE user_id = '23190572-2439-4251-9978-647f217caf00' AND role = 'moderator';
```

### Adim 2: Giris Sonrasi Dogru Yonlendirme

**StaffLogin.tsx** ve **Login.tsx** dosyalarinda giris sonrasi rol kontrolu duzelecek. Mevcut sistem `setTimeout` ile 500-1000ms bekliyor ve `getPanelPath()` cagriyor, ancak roller henuz yuklenmemis olabiliyor.

Cozum: Giris basarili olduktan sonra rolleri tekrar cek ve ardından yonlendir:

```typescript
// StaffLogin.tsx & Login.tsx - giris sonrasi
const { error } = await signIn(email, password);
if (!error) {
  // Rolleri dogrudan DB'den cek
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id);
  
  const userRoles = roles?.map(r => r.role) || [];
  if (userRoles.includes('admin')) navigate('/admin');
  else if (userRoles.includes('moderator')) navigate('/advisor');
  else navigate('/dashboard');
}
```

**Login.tsx**: Normal musteri girisi icin her zaman `/dashboard`'a yonlendirecek. Staff girisi ayri sayfadan yapilacak.

**StaffLogin.tsx**: Rol kontrolu yapilacak. Eger giren kisi sadece "user" rolundeyse, "Bu panel yetkili personel icindir" mesaji gosterilip `/dashboard`'a yonlendirilecek.

### Adim 3: AdvisorPanel Veri Cekme Duzeltmesi

Mevcut hata: `profiles.assigned_advisor_id = user.id` (auth UUID kullaniliyor ama deger advisor table ID).

Duzeltme: Once `advisors` tablosundan kendi advisor kaydini bul, sonra `profiles` tablosunda `assigned_advisor_id = advisor.id` ile eslesenleri getir:

```typescript
// AdvisorPanel.tsx - fetchData
// 1. Kendi advisor kaydini bul
const { data: myAdvisor } = await supabase
  .from('advisors')
  .select('id')
  .eq('user_id', user.id)
  .single();

if (myAdvisor) {
  // 2. Bu advisor'a atanmis musterileri getir
  const { data: assignedUsers } = await supabase
    .from('profiles')
    .select('*')
    .eq('assigned_advisor_id', myAdvisor.id);
}
```

### Adim 4: Dashboard Danisman Gosterimi

`useAuth` hook'undaki `fetchProfile` fonksiyonu sadece auth state degistiginde calisiyor. Dashboard acildiginda profili yeniden cekmek gerekiyor.

Cozum: Dashboard'a bir `refetchProfile` mekanizmasi eklenecek veya `useEffect` ile profil dogrudan cekilecek:

```typescript
// Dashboard.tsx
useEffect(() => {
  if (!user) return;
  // Profili dogrudan cek (useAuth'taki stale veriyi bypass et)
  const fetchMyProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('assigned_advisor_id')
      .eq('user_id', user.id)
      .single();
    if (data?.assigned_advisor_id) {
      // Advisor bilgilerini cek...
    }
  };
  fetchMyProfile();
}, [user]);
```

### Adim 5: Advisor Profil Formu Iyilestirmesi

- Sayfa acildiginda mevcut advisor verileri DB'den cekilip forma doldurulacak
- `Input` ve `Textarea` bilesenlerinden Shadcn/ui kullanilacak (simdi duz HTML input var)
- Fotograf yukleme icin dosya secici eklenecek (Supabase Storage)
- Toast bildirimleri `alert()` yerine `sonner` kullanilacak
- Uzmanlık alanları (specializations) coklu secim ile eklenebilecek

### Adim 6: Ek Iyilestirmeler

- **Dashboard'dan developer tools (Admin Yap, Danisman Yap butonlari) kaldirilacak** -- guvenlik riski
- **RoleRoute** zaten mevcut ve calisiyor, tum korunmali route'lar bununla sarili
- **Admin panelde danisman atama**: Mevcut akis `profiles.assigned_advisor_id` uzerinden calisiyor. Bu yeterli ve dogru. `advisor_assignments` tablosu ise vize basvurularina ozel atamalar icin kullanilacak (ileride)

---

## Teknik Detaylar

### Degistirilecek Dosyalar

| Dosya | Degisiklik |
|-------|-----------|
| `supabase/migrations/` | Yeni migrasyon: RLS duzeltme + rol temizligi |
| `src/pages/StaffLogin.tsx` | Rol bazli yonlendirme, yetkisiz kullanici kontrolu |
| `src/pages/Login.tsx` | Musteri icin her zaman /dashboard'a yonlendirme |
| `src/pages/AdvisorPanel.tsx` | Dogru advisor ID ile veri cekme, profil formu iyilestirmesi, mevcut verilerin on-dolgusu |
| `src/pages/Dashboard.tsx` | Danisman bilgisini dogrudan cekme, developer tools kaldirma |

### Olusturulacak Yeni Dosyalar

Yok -- mevcut dosyalar uzerinde duzeltmeler yapilacak.
