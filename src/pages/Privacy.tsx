import { motion } from "framer-motion";

export default function Privacy() {
    return (
        <div className="min-h-screen pt-28 pb-20">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-navy-dark mb-8">
                        Gizlilik Politikası
                    </h1>

                    <div className="prose prose-lg max-w-none text-foreground/80 space-y-6">
                        <p className="text-muted-foreground text-sm">Son güncelleme: 17 Şubat 2026</p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">1. Giriş</h2>
                        <p>
                            VisaPath ("biz", "bizim" veya "Şirket") olarak kişisel verilerinizin korunmasına büyük
                            önem veriyoruz. Bu Gizlilik Politikası, web sitemizi (visapath.com.tr) ve hizmetlerimizi
                            kullanırken toplanan, işlenen ve saklanan kişisel verileriniz hakkında sizi bilgilendirmek
                            amacıyla hazırlanmıştır.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">2. Toplanan Veriler</h2>
                        <p>Hizmetlerimizi sunabilmek için aşağıdaki kişisel verileri toplayabiliriz:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, doğum tarihi, uyruk</li>
                            <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
                            <li><strong>Pasaport Bilgileri:</strong> Pasaport numarası, geçerlilik tarihi, çıkaran ülke</li>
                            <li><strong>Ödeme Bilgileri:</strong> Kredi kartı bilgileri (PCI-DSS uyumlu altyapımız aracılığıyla)</li>
                            <li><strong>Kullanım Verileri:</strong> IP adresi, tarayıcı bilgisi, ziyaret edilen sayfalar</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">3. Verilerin Kullanım Amaçları</h2>
                        <p>Topladığımız kişisel verilerinizi aşağıdaki amaçlarla kullanırız:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Vize başvuru hizmetlerinin sunulması ve yönetilmesi</li>
                            <li>Başvuru süreciniz hakkında bilgilendirme yapılması</li>
                            <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
                            <li>Müşteri desteği sağlanması</li>
                            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                            <li>Hizmet kalitesinin artırılması ve analiz</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">4. Verilerin Paylaşımı</h2>
                        <p>
                            Kişisel verileriniz, vize başvurusu kapsamında ilgili konsolosluklar ve yetkili
                            kurumlarla paylaşılabilir. Bunun dışında, verileriniz açık rızanız olmadan üçüncü
                            taraflarla paylaşılmaz. Aşağıdaki durumlarda veri paylaşımı yapılabilir:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Yasal zorunluluk durumlarında yetkili makamlarla</li>
                            <li>Hizmet sağlayıcılarımızla (ödeme işlemcisi, bulut hizmetleri) gizlilik sözleşmesi kapsamında</li>
                            <li>Açık rızanızın bulunduğu durumlarda</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">5. Veri Güvenliği</h2>
                        <p>
                            Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz.
                            Tüm veri aktarımları SSL/TLS şifreleme ile korunur. Ödeme bilgileri PCI-DSS uyumlu
                            altyapımız aracılığıyla işlenir ve sunucularımızda saklanmaz.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">6. Çerezler (Cookies)</h2>
                        <p>
                            Web sitemizde deneyiminizi iyileştirmek amacıyla çerezler kullanılmaktadır. Zorunlu
                            çerezler siteyi çalıştırmak için gereklidir. Analitik ve pazarlama çerezleri için
                            onayınızı alırız.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">7. Veri Saklama Süresi</h2>
                        <p>
                            Kişisel verileriniz, hizmetin sunulması için gerekli olan süre boyunca ve yasal
                            saklama yükümlülüklerimiz çerçevesinde (genellikle 5 yıl) muhafaza edilir.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">8. Haklarınız</h2>
                        <p>6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>Kişisel verileriniz hakkında bilgi talep etme</li>
                            <li>Verilerin düzeltilmesini veya silinmesini isteme</li>
                            <li>Verilerin aktarıldığı üçüncü kişileri öğrenme</li>
                            <li>İşlemeye itiraz etme</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">9. İletişim</h2>
                        <p>
                            Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                        </p>
                        <ul className="list-none space-y-1">
                            <li>📧 privacy@visapath.com.tr</li>
                            <li>📞 +90 (212) 555 00 00</li>
                            <li>📍 Levent Mah. Büyükdere Cad. No:185, 34394 Şişli/İstanbul</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
