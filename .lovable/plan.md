

# Musteri Paneline AI Ozellikleri Ekleme Plani

## Eklenecek AI Ozellikleri

### 1. AI Vize Destek Chatbotu (Panel Icinde)
Dashboard'a entegre, Lovable AI destekli akilli chatbot. Musteriler vize surecleri hakkinda sorular sorabilir, belge gereksinimleri ogrenebilir, basvuru durumlari hakkinda bilgi alabilir.

- Musterinin aktif basvurusuna gore kisisellestirilmis yanit (hedef ulke, vize turu, mevcut durum)
- Streaming yanitlar (token-by-token)
- Dashboard sidebar'a "AI Asistan" sekme olarak eklenir
- Turkce yanit verir, vize danismanligi odakli system prompt

### 2. Belge Uyumluluk Kontrolu (AI Document Review)
Musteri belge yuklediginde, AI belgeyi analiz edip uygunluk raporu olusturur:

- Yuklenen belgenin dogru turde olup olmadigi (ornegin pasaport yerine baska belge yuklenmesi)
- Belge kalitesi kontrolu (okunabilirlik, biyometrik foto uygunlugu)
- Her belge icin "Uygun / Kontrol Gerekli / Uygunsuz" durumu ve aciklama
- DocumentChecklist bilesenine "AI ile Kontrol Et" butonu eklenir

### 3. Basvuru Durumu Ozet ve Oneri Motoru
Overview sekmesinde AI destekli akilli ozet karti:

- Musterinin tum basvurularini analiz eder
- "Sonraki adiminiz su olmali..." seklinde oneri sunar
- Eksik belgeleri, yaklasan tarihleri vurgular
- Kisa ve aksiyon odakli ozetler uretir

### 4. Akilli Mesaj Onerici
MessageCenter'da mesaj yazarken AI destekli oneri:

- Danismana mesaj yazarken "AI ile Mesaj Olustur" butonu
- Duruma gore hazir mesaj sablonlari olusturur (belge sorusu, randevu talebi, durum sorgulama)

---

## Teknik Uygulama Detaylari

### Edge Function: `ai-chat`
Vize destek chatbotu icin streaming edge function olusturulacak. Lovable AI Gateway (`google/gemini-3-flash-preview`) kullanilacak. LOVABLE_API_KEY zaten mevcut.

```
supabase/functions/ai-chat/index.ts
```
- Musterinin basvuru bilgilerini (ulke, vize turu, durum) alir
- System prompt'a bu bilgileri ekler
- SSE streaming ile yanitlar

### Edge Function: `ai-document-review`
Belge analizi icin non-streaming edge function. Yuklenen belgenin signed URL'ini ve belge turunu alir, AI'dan analiz raporu ister.

```
supabase/functions/ai-document-review/index.ts
```

### Edge Function: `ai-application-summary`
Basvuru durumu ozeti ve oneri uretimi icin non-streaming function.

```
supabase/functions/ai-application-summary/index.ts
```

### Edge Function: `ai-message-suggest`
Mesaj onerisi icin non-streaming function.

```
supabase/functions/ai-message-suggest/index.ts
```

### Frontend Bilesenleri

1. **`src/components/AIDashboardChat.tsx`** - Dashboard icinde AI chatbot paneli (streaming destekli)
2. **`src/components/AIDocumentReview.tsx`** - Belge analiz sonuc karti
3. **`src/components/AIApplicationSummary.tsx`** - Overview'da akilli ozet karti
4. **`src/components/AIMessageSuggest.tsx`** - Mesaj onerileri butonu ve popup

### Dashboard Entegrasyonu

- `navItems` dizisine yeni "AI Asistan" sekmesi eklenir (Sparkles ikonu)
- Overview sekmesine AIApplicationSummary karti eklenir
- DocumentChecklist'e "AI ile Kontrol Et" butonu eklenir
- MessageCenter'a "AI Mesaj Onerisi" butonu eklenir

### Config Guncelleme

`supabase/config.toml` dosyasina 4 yeni function eklenir, hepsi `verify_jwt = false` olarak (kod icinde auth kontrolu yapilir).

### Sirasi

1. 4 edge function olustur ve deploy et
2. AIDashboardChat bileseni (streaming chatbot)
3. AIDocumentReview bileseni (belge kontrolu)
4. AIApplicationSummary bileseni (akilli ozet)
5. AIMessageSuggest bileseni (mesaj onerisi)
6. Dashboard.tsx entegrasyonu (sekmeler, butonlar)

