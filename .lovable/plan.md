
# Danışman Atama ve Yönetim Paneli

## Genel Bakış

Heltia/Hiwell uygulamalarındaki psikolog-danışan eşleştirme mantığına benzer bir sistem kurulacak. Danışmanlar (vize uzmanları) sisteme kayıt olup kendi panellerinden müşterilerini takip edecek, adminler ise atamaları ve tüm süreci yönetecek.

## Yapılacaklar

### 1. Veritabanı Yapısı

Yeni tablolar oluşturulacak:

- **advisors**: Danışman profilleri (uzmanlık alanı, biyografi, aktiflik durumu)
- **applications**: Vize başvuruları (müşteri bilgileri, hedef ülke, vize türü, plan, durum)
- **advisor_assignments**: Danışman-müşteri eşleştirme tablosu (hangi danışman hangi başvuruya atandı)

Her tablo için RLS politikaları yazılacak:
- Adminler tüm verileri gorebilir ve yönetebilir
- Danışmanlar yalnızca kendilerine atanan başvuruları gorebilir
- Müşteriler yalnızca kendi başvurularını gorebilir

### 2. Roller ve Yetkilendirme

Mevcut `user_roles` tablosu ve `has_role()` fonksiyonu kullanılacak. Sisteme kayıt olan bir kullanıcı varsayılan olarak "user" rolünde olacak. Admin panelinden bir kullanıcıya "admin" veya "moderator" (danışman) rolü atanabilecek.

### 3. Sayfa Yapısı

**Admin Paneli (`/admin`)** -- Sadece admin rolündeki kullanıcılar erişebilir:
- Sidebar navigasyon (Shadcn Sidebar) ile:
  - **Genel Bakış**: Toplam başvuru, aktif danışman, bekleyen atama gibi metrikler
  - **Başvurular**: Tüm başvuruların listesi, filtreleme, durum değiştirme
  - **Danışmanlar**: Kayıtlı danışmanların listesi, yeni danışman ekleme/aktif-pasif yapma
  - **Atamalar**: Bir başvuruya danışman atama (dropdown ile danışman seçimi)
  - **Kullanıcılar**: Tüm kayıtlı kullanıcıları listeleme, rol atama

**Danışman Paneli (`/advisor`)** -- Sadece moderator (danışman) rolündeki kullanıcılar erişebilir:
- Atanan müşterilerin listesi
- Her müşterinin başvuru detayları ve belgeleri
- Durum güncelleme (Inceleniyor, Gönderildi vb.)
- Notlar ekleme

**Müşteri Paneli (`/dashboard`)** -- Mevcut sayfa güncellenerek veritabanından veri çekilecek:
- Kendi başvurularını görme
- Atanan danışman bilgisi
- Başvuru durumu takibi

### 4. Giriş Sonrası Yönlendirme

Kullanıcı giriş yaptığında rolüne göre otomatik yönlendirme yapılacak:
- Admin --> `/admin`
- Danışman (moderator) --> `/advisor`
- Normal kullanıcı --> `/dashboard`

### 5. Navbar Güncellemesi

Giriş yapmış kullanıcının rolüne göre navbar'daki "Panelim" linki doğru panele yönlendirecek.

---

## Teknik Detaylar

### Veritabanı Migrasyonu

```sql
-- Danışman profilleri
CREATE TABLE public.advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  max_clients INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Başvurular
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  visa_type TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'Alındı',
  travel_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Danışman atamaları
CREATE TABLE public.advisor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES public.advisors(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(application_id)
);
```

RLS politikaları `has_role()` fonksiyonu kullanılarak yazılacak.

### Yeni Dosyalar

- `src/pages/Admin.tsx` -- Tamamen yeniden yazılacak (sidebar layout, veritabanı entegrasyonu)
- `src/pages/AdvisorPanel.tsx` -- Danışman paneli
- `src/hooks/useUserRole.ts` -- Kullanıcı rolünü kontrol eden hook
- `src/components/admin/` -- Admin paneli alt bileşenleri (ApplicationsTable, AdvisorsList, AssignmentDialog, StatsCards)

### Güncellenecek Dosyalar

- `src/App.tsx` -- Yeni route'lar eklenmesi
- `src/pages/Dashboard.tsx` -- Veritabanından veri çekme
- `src/pages/Login.tsx` -- Giriş sonrası role göre yönlendirme
- `src/components/Navbar.tsx` -- Role göre panel linki
