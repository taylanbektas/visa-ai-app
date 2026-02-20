import { motion } from "framer-motion";

export default function Cookies() {
    return (
        <div className="page-shell">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-navy-dark mb-8">
                        Çerez Politikası
                    </h1>

                    <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-foreground/80 space-y-6">
                        <p className="text-muted-foreground text-sm">Son güncelleme: 20 Şubat 2026</p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">1. Çerez (Cookie) Nedir?</h2>
                        <p>
                            Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar, web sitesinin düzgün çalışmasını sağlamak, kullanıcı deneyimini iyileştirmek ve tercihlerinizi hatırlamak amacıyla kullanılır.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">2. Çerezleri Neden Kullanıyoruz?</h2>
                        <p>
                            Sitemizde çerezleri aşağıdaki amaçlarla kullanmaktayız:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevlerini yerine getirebilmesi için elzemdir (oturum yönetimi, güvenlik).</li>
                            <li><strong>İşlevsel Çerezler:</strong> Dil ve görünüm tercihlerinizi hatırlamamıza yardımcı olur.</li>
                            <li><strong>Analitik Çerezler:</strong> Ziyaretçi sayılarını ve kullanım istatistiklerini anonim olarak analiz ederek sitemizi iyileştirmemizi sağlar.</li>
                            <li><strong>Pazarlama Çerezleri:</strong> İlgi alanlarınıza uygun içerik veya reklamlar sunmamız için kullanılır (yalnızca izniniz dahilinde).</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">3. Çerez Yönetimi ve Devre Dışı Bırakma</h2>
                        <p>
                            Çoğu tarayıcı, çerezleri otomatik olarak kabul edecek şekilde ayarlanmıştır. Ancak, tarayıcınızın ayarlarını değiştirerek çerezleri reddedebilir veya silinmesini sağlayabilirsiniz. Çerezleri devre dışı bırakmanız durumunda, sitemizin bazı özelliklerinin düzgün çalışmayabileceğini lütfen unutmayın.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">4. Güncellemeler ve İletişim</h2>
                        <p>
                            Bu politika zaman zaman güncellenebilir. Çerez kullanımı hakkında sorularınız için <strong>privacy@visapath.com.tr</strong> adresi üzerinden bizimle iletişime geçebilirsiniz.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
