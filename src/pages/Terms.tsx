import { motion } from "framer-motion";

export default function Terms() {
    return (
        <div className="page-shell">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-navy-dark mb-8">
                        Kullanım Şartları
                    </h1>

                    <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-foreground/80 space-y-6">
                        <p className="text-muted-foreground text-sm">Son güncelleme: 17 Şubat 2026</p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">1. Genel Hükümler</h2>
                        <p>
                            Bu Kullanım Şartları, VisaPath web sitesi (visapath.com.tr) ve sunulan tüm
                            hizmetlerin kullanımını düzenler. Sitemizi kullanarak bu şartları kabul etmiş
                            sayılırsınız. VisaPath, bu şartları herhangi bir zamanda güncelleme hakkını saklı tutar.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">2. Hizmet Tanımı</h2>
                        <p>
                            VisaPath, vize başvuru süreçlerinde danışmanlık hizmeti sunan bir platformdur.
                            Hizmetlerimiz şunları kapsar:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Vize gereksinim bilgilendirmesi ve belge kontrolü</li>
                            <li>Başvuru formlarının hazırlanmasında yardım</li>
                            <li>Randevu destek hizmeti</li>
                            <li>Başvuru süreç takibi</li>
                            <li>Mülakat hazırlık desteği (Pro ve Elite planlar)</li>
                        </ul>
                        <p className="mt-4">
                            <strong>Önemli Not:</strong> VisaPath, resmi bir konsolosluk temsilcisi veya devlet
                            kurumu değildir. Vize onayı veya reddi tamamen ilgili konsolosluk/büyükelçiliğin
                            kararına bağlıdır.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">3. Hesap Oluşturma</h2>
                        <p>
                            Hizmetlerimizden yararlanmak için bir hesap oluşturmanız gerekebilir. Hesap bilgilerinizin
                            doğruluğundan siz sorumlusunuz. Hesabınıza yetkisiz erişim tespit ettiğinizde derhal
                            bize bildirmeniz gerekmektedir.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">4. Ücretlendirme ve Ödeme</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Hizmet ücretleri, seçilen plan ve hedefe göre değişir</li>
                            <li>Ödemeler, kredi kartı, banka kartı veya havale ile yapılabilir</li>
                            <li>Tüm ücretler Türk Lirası (TL) cinsinden belirtilir, aksi belirtilmedikçe</li>
                            <li>Konsolosluk harçları ve üçüncü taraf ücretleri hizmet bedelimize dahil değildir</li>
                            <li>Faturalar elektronik ortamda düzenlenir</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">5. İptal ve İade Politikası</h2>
                        <p>
                            <strong>Elite Plan:</strong> Vize reddedilmesi durumunda %100 iade garantisi
                            sunulmaktadır (konsolosluk harçları hariç).
                        </p>
                        <p>
                            <strong>Pro Plan:</strong> Hizmet başlamadan önce yapılan iptallerde tam iade yapılır.
                            Hizmet başladıktan sonra kısmi iade uygulanır.
                        </p>
                        <p>
                            <strong>Starter Plan:</strong> Dijital içerik niteliğinde olduğundan, erişim
                            sağlandıktan sonra iade yapılmaz.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">6. Kullanıcı Yükümlülükleri</h2>
                        <p>Sitemizi ve hizmetlerimizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Doğru ve güncel bilgiler sağlamak</li>
                            <li>Başkalarının hesaplarına yetkisiz erişim sağlamamak</li>
                            <li>Siteyi yasadışı amaçlarla kullanmamak</li>
                            <li>Sahte veya yanıltıcı belge sunmamak</li>
                            <li>Fikri mülkiyet haklarına saygı göstermek</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">7. Sorumluluk Sınırlandırması</h2>
                        <p>
                            VisaPath, vize sonuçları hakkında garanti vermez. Vize başvurularının onaylanıp
                            onaylanmayacağı tamamen ilgili makamların kararına bağlıdır. VisaPath, aşağıdaki
                            durumlardan sorumlu tutulamaz:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Konsoloslukların vize ret kararları</li>
                            <li>Konsolosluk kaynaklı gecikmeler</li>
                            <li>Kullanıcının yanlış veya eksik bilgi sağlaması</li>
                            <li>Mücbir sebepler (doğal afet, salgın, savaş vb.)</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">8. Fikri Mülkiyet</h2>
                        <p>
                            VisaPath web sitesindeki tüm içerik, tasarım, logo, metin ve görseller VisaPath'e
                            aittir ve telif hakkı ile korunmaktadır. İzinsiz kopyalama, dağıtma veya değiştirme
                            yasaktır.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">9. Uyuşmazlık Çözümü</h2>
                        <p>
                            Bu Kullanım Şartları Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda
                            İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">10. İletişim</h2>
                        <p>
                            Kullanım şartları hakkında sorularınız için:
                        </p>
                        <ul className="list-none space-y-1">
                            <li>📧 legal@visapath.com.tr</li>
                            <li>📞 +90 (212) 555 00 00</li>
                            <li>📍 Levent Mah. Büyükdere Cad. No:185, 34394 Şişli/İstanbul</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
