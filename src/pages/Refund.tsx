import { motion } from "framer-motion";

export default function Refund() {
    return (
        <div className="page-shell">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-navy-dark mb-8">
                        İade Politikası
                    </h1>

                    <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-foreground/80 space-y-6">
                        <p className="text-muted-foreground text-sm">Son güncelleme: 20 Şubat 2026</p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">1. Genel İade Koşulları</h2>
                        <p>
                            VisaPath olarak, satın aldığınız danışmanlık hizmetlerinden en yüksek verimi almanızı hedefliyoruz. İptal ve iade talepleriniz, hizmetin başladığı aşamaya ve seçtiğiniz pakete göre değerlendirilmektedir.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">2. Pakete Özel İade Durumları</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Elite Paket (%100 İade Garantisi):</strong> Vize başvurunuzun reddedilmesi durumunda, ödemiş olduğunuz danışmanlık hizmet bedeli kesintisiz olarak iade edilir. (Konsolosluk harçları dahil değildir.)</li>
                            <li><strong>Pro ve Starter Paketleri:</strong> Süreç başladıktan ve uzmanlarımız belge incelemesine geçtikten sonra standart durumlarda iade yapılmamaktadır. Ancak vize reddi durumlarında, bir sonraki başvurunuz için özel indirimler tanımlanır.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">3. İptal ve Hizmetin Başlaması</h2>
                        <p>
                            Satın alımın ardından, belgeleriniz henüz uzman incelemesine girmemişse ve randevunuz oluşturulmamışsa (ödemeden itibaren 24 saat içinde), tam para iadesi talep edebilirsiniz. Hizmetin kısmen başlamış olması durumunda (%100 garanti kapsamında olmayan paketlerde), iade söz konusu değildir.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">4. İade Süreci</h2>
                        <p>
                            Onaylanan iade ödemeleri, işlemi gerçekleştirdiğiniz ödeme yöntemine (kredi kartı, havale) sadık kalınarak 7-14 iş günü içinde hesabınıza yansıtılır. Gecikmeler bankanızla ilgili olabilir.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">5. İletişim</h2>
                        <p>
                            İade talepleriniz ve değerlendirme süreçleri için <strong>info@visapath.com.tr</strong> adresi üzerinden destek ekibimizle iletişime geçebilirsiniz.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
