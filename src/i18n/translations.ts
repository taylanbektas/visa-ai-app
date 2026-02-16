export type Locale = "tr" | "en";

export const translations: Record<Locale, Record<string, string>> = {
    tr: {
        // Navbar
        "nav.home": "Ana Sayfa",
        "nav.pricing": "Fiyatlar",
        "nav.learn": "Rehber",
        "nav.help": "Yardım",
        "nav.faq": "Sıkça Sorulan Sorular",
        "nav.contact": "Bize Ulaşın",
        "nav.whatsapp": "WhatsApp Destek",
        "nav.login": "Giriş",
        "nav.apply": "Başvuru Yap",

        // Hero
        "hero.title.prefix": "Vize almanın en",
        "hero.title.suffix": "yolu",
        "hero.subtitle": "Hedef ülkenizi seçin, <strong>30 saniyede</strong> vize gereksinimlerini öğrenin.",
        "hero.word.0": "kolay",
        "hero.word.1": "hızlı",
        "hero.word.2": "güvenli",
        "hero.word.3": "akıllı",

        // Visa Checker
        "checker.passport": "Pasaportunuz",
        "checker.destination": "Nereye Gidiyorsunuz?",
        "checker.placeholder": "Ülke seçin",
        "checker.button": "Kontrol Et",
        "checker.visaFree": "Vize Gerekmiyor! 🎉",
        "checker.visaFreeDesc": "pasaportuyla",
        "checker.visaFreeFor": "için vize gerekmiyor.",
        "checker.visaType": "Vize Türü",
        "checker.duration": "Tahmini Süre",
        "checker.fee": "Konsolosluk Ücreti",
        "checker.docs": "Gerekli Belgeler",
        "checker.getHelp": "Profesyonel Destek Al",

        // Trust row
        "trust.applications": "Başarılı Başvuru",
        "trust.approval": "Onay Oranı",
        "trust.support": "Destek",

        // Comparison
        "comparison.title": "Neden",
        "comparison.subtitle": "3.200+ başvuru, %96 onay oranı — profesyonel desteğin farkını görün.",
        "comparison.diy": "Kendin Yap",
        "comparison.withVP": "VisaPath ile",
        "comparison.recommended": "ÖNERİLEN",

        // Steps
        "steps.title": "Nasıl Çalışır?",
        "steps.subtitle": "3 basit adımda vize başvurunuzu tamamlayın.",

        // Stats
        "stats.applications": "Başarılı Başvuru",
        "stats.approval": "Onay Oranı",
        "stats.experience": "Yıl Deneyim",
        "stats.support": "Müşteri Desteği",

        // Testimonials
        "testimonials.title": "Müşterilerimiz Ne Diyor?",
        "testimonials.0.name": "Ayşe K.",
        "testimonials.0.city": "İstanbul",
        "testimonials.0.text": "İlk kez Schengen vizesi aldım, her şey çok kolaydı. Belgelerimi kontrol ettiler ve 12 günde vizem geldi.",
        "testimonials.1.name": "Mehmet Y.",
        "testimonials.1.city": "Ankara",
        "testimonials.1.text": "ABD vize mülakatına hazırlanmamda çok yardımcı oldular. Pro paket gerçekten karşılığını veriyor.",
        "testimonials.2.name": "Elif D.",
        "testimonials.2.city": "İzmir",
        "testimonials.2.text": "Daha önce kendi başıma başvurdum reddedildim. VisaPath ile ikinci başvurumda onaylandı!",

        // FAQ
        "faq.title": "Sıkça Sorulan Sorular",
        "faq.0.q": "VisaPath gerçekten gerekli mi, kendi başıma yapamaz mıyım?",
        "faq.0.a": "Tabii ki kendiniz de başvurabilirsiniz. Ancak vize başvurularında en küçük bir eksik belge veya hata, ret ya da gecikme sebebi olabilir. VisaPath olarak uzman ekibimiz belgelerinizi kontrol eder, başvurunuzu optimize eder ve %98 onay oranıyla güvenle başvurmanızı sağlar.",
        "faq.1.q": "Hangi ülkelere vize başvurusu yapabilirsiniz?",
        "faq.1.a": "Schengen ülkeleri (Almanya, Fransa, İtalya, İspanya, Hollanda vb.), ABD, İngiltere, Kanada ve daha birçok ülke için hizmet veriyoruz.",
        "faq.2.q": "Başvuru süreci ne kadar sürer?",
        "faq.2.a": "Starter planımızla kendi hızınızda ilerlersiniz. Pro ve Elite planlarında belgelerinizi 24-48 saat içinde inceler, başvurunuzu hazırlarız. Konsolosluk işlem süreleri ülkeden ülkeye değişir.",
        "faq.3.q": "Vize reddedilirse ne olur?",
        "faq.3.a": "Elite planımızda %100 para iade garantisi sunuyoruz. Pro ve Starter planlarında yeniden başvuru için indirimli destek sağlıyoruz.",
        "faq.4.q": "Ödeme nasıl yapılır?",
        "faq.4.a": "Kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz. Tüm ödemeler SSL şifreleme ile güvence altındadır.",

        // CTA
        "cta.title": "Hayalinizdeki Seyahate",
        "cta.highlight": "Bir Adım",
        "cta.titleSuffix": "Kaldı",
        "cta.subtitle": "Başvurunuzu bugün başlatın, uzman ekibimiz sizin için çalışsın.",
        "cta.button": "Hemen Başvurun",
        "cta.pricing": "Fiyatları Gör",

        // Footer
        "footer.tagline": "Vize başvurularında güvenilir çözüm ortağınız.",
        "footer.quickLinks": "Hızlı Bağlantılar",
        "footer.support": "Destek",
        "footer.legal": "Yasal",
        "footer.rights": "Tüm hakları saklıdır.",

        // Features & ROI
        "roi.modern_trust": "Modern & Güvenilir",
        "roi.features.diy.title": "Kendin Yap",
        "roi.features.diy.0": "Uzman desteği yok",
        "roi.features.diy.1": "Karmaşık süreçler",
        "roi.features.diy.2": "Yüksek hata riski",
        "roi.features.diy.3": "Belirsiz bekleme süreleri",
        "roi.features.vp.title": "VisaPath ile",
        "roi.features.vp.0": "Uzman incelemesi",
        "roi.features.vp.1": "Basit & Hızlı süreç",
        "roi.features.vp.2": "Sıfır hata garantisi",
        "roi.features.vp.3": "Hızlı sonuç alma",

        // Steps
        "steps.0.title": "Vize gereksinimini kontrol edin",
        "steps.0.desc": "Pasaportunuzu ve hedef ülkenizi girin, gerekli belgeleri anında görün.",
        "steps.1.title": "Üye olun ve planınızı seçin",
        "steps.1.desc": "Hesabınızı oluşturun, size uygun paketi seçin. 5 dakikadan az sürer.",
        "steps.2.title": "Gerisini bize bırakın",
        "steps.2.desc": "Uzman ekibimiz belgelerinizi kontrol eder, başvurunuzu takip eder ve sonuçlanana kadar yanınızda olur.",

        // CTA
        "cta.check_price": "Fiyatları Gör",

        // E-Visa Logic
        "visa.evisa_starter": "K-ETA/E-Vize için Starter Paket Al",
        "visa.get_visa": "Vizeni Al",
    },

    en: {
        // Navbar
        "nav.home": "Home",
        "nav.pricing": "Pricing",
        "nav.learn": "Guide",
        "nav.help": "Help",
        "nav.faq": "FAQ",
        "nav.contact": "Contact Us",
        "nav.whatsapp": "WhatsApp Support",
        "nav.login": "Login",
        "nav.apply": "Apply Now",

        // Hero
        "hero.title.prefix": "The",
        "hero.title.suffix": "way to get your visa",
        "hero.subtitle": "Select your destination, learn visa requirements in <strong>30 seconds</strong>.",
        "hero.word.0": "easiest",
        "hero.word.1": "fastest",
        "hero.word.2": "safest",
        "hero.word.3": "smartest",

        // Visa Checker
        "checker.passport": "Your Passport",
        "checker.destination": "Where Are You Going?",
        "checker.placeholder": "Select country",
        "checker.button": "Check",
        "checker.visaFree": "No Visa Required! 🎉",
        "checker.visaFreeDesc": "passport to",
        "checker.visaFreeFor": "— no visa needed.",
        "checker.visaType": "Visa Type",
        "checker.duration": "Est. Processing",
        "checker.fee": "Consulate Fee",
        "checker.docs": "Required Documents",
        "checker.getHelp": "Get Professional Help",

        // Trust row
        "trust.applications": "Successful Applications",
        "trust.approval": "Approval Rate",
        "trust.support": "Support",

        // Comparison
        "comparison.title": "Why",
        "comparison.subtitle": "3,200+ applications, 96% approval rate — see the difference professional support makes.",
        "comparison.diy": "Do It Yourself",
        "comparison.withVP": "With VisaPath",
        "comparison.recommended": "RECOMMENDED",

        // Steps
        "steps.title": "How It Works",
        "steps.subtitle": "Complete your visa application in 3 simple steps.",

        // Stats
        "stats.applications": "Successful Applications",
        "stats.approval": "Approval Rate",
        "stats.experience": "Years Experience",
        "stats.support": "Customer Support",

        // Testimonials
        "testimonials.title": "What Our Customers Say",
        "testimonials.0.name": "Ayşe K.",
        "testimonials.0.city": "Istanbul",
        "testimonials.0.text": "Got my Schengen visa for the first time, everything was so easy. They checked my documents and I got my visa in 12 days.",
        "testimonials.1.name": "Mehmet Y.",
        "testimonials.1.city": "Ankara",
        "testimonials.1.text": "They helped me a lot in preparing for the US visa interview. The Pro package really pays off.",
        "testimonials.2.name": "Elif D.",
        "testimonials.2.city": "Izmir",
        "testimonials.2.text": "I applied on my own before and got rejected. With VisaPath, I got approved on my second application!",

        // FAQ
        "faq.title": "Frequently Asked Questions",
        "faq.0.q": "Is VisaPath really necessary, can't I do it myself?",
        "faq.0.a": "Of course you can apply yourself. However, even the slightest missing document or error in visa applications can cause rejection or delay. As VisaPath, our expert team checks your documents, optimizes your application, and ensures you apply with confidence with a 98% approval rate.",
        "faq.1.q": "Which countries can you apply for?",
        "faq.1.a": "We provide services for Schengen countries (Germany, France, Italy, Spain, Netherlands, etc.), USA, UK, Canada, and many more.",
        "faq.2.q": "How long does the application process take?",
        "faq.2.a": "With our Starter plan, you proceed at your own pace. In Pro and Elite plans, we review your documents within 24-48 hours and prepare your application. Consulate processing times vary by country.",
        "faq.3.q": "What happens if the visa is rejected?",
        "faq.3.a": "We offer a 100% money-back guarantee on our Elite plan. We provide discounted support for re-application on Pro and Starter plans.",
        "faq.4.q": "How is the payment made?",
        "faq.4.a": "You can pay by credit card, debit card, and bank transfer. All payments are secured with SSL encryption.",

        // CTA
        "cta.title": "Your Dream Trip Is",
        "cta.highlight": "One Step",
        "cta.titleSuffix": "Away",
        "cta.subtitle": "Start your application today, let our expert team handle the rest.",
        "cta.button": "Apply Now",
        "cta.pricing": "View Pricing",

        // Footer
        "footer.tagline": "Your trusted partner for visa applications.",
        "footer.quickLinks": "Quick Links",
        "footer.support": "Support",
        "footer.legal": "Legal",
        "footer.rights": "All rights reserved.",

        // Features & ROI
        "roi.modern_trust": "Modern & Reliable",
        "roi.features.diy.title": "Do It Yourself",
        "roi.features.diy.0": "No expert support",
        "roi.features.diy.1": "Complex processes",
        "roi.features.diy.2": "High risk of error",
        "roi.features.diy.3": "Uncertain waiting times",
        "roi.features.vp.title": "With VisaPath",
        "roi.features.vp.0": "Expert review",
        "roi.features.vp.1": "Simple & Fast process",
        "roi.features.vp.2": "Zero error guarantee",
        "roi.features.vp.3": "Fast results",

        // Steps
        "steps.0.title": "Check visa requirements",
        "steps.0.desc": "Enter your passport and destination to see required documents instantly.",
        "steps.1.title": "Sign up and choose your plan",
        "steps.1.desc": "Create your account and choose the plan that suits you. Takes less than 5 minutes.",
        "steps.2.title": "Leave the rest to us",
        "steps.2.desc": "Our expert team checks your documents, tracks your application, and stays with you until the result.",

        // CTA
        "cta.check_price": "See Pricing",

        // E-Visa Logic
        "visa.evisa_starter": "Get Starter Pack for E-Visa",
        "visa.get_visa": "Get Your Visa",
    },
};
