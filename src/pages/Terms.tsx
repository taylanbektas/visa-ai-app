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

                        <h2 className="text-xl font-bold text-navy-dark mt-8">1. Genel Hükümler ve Kabul</h2>
                        <p>
                            Bu Kullanım Şartları (&quot;Şartlar&quot;), VisaPath web sitesi (visapath.com.tr), mobil uygulaması ve sunulan tüm vize danışmanlık hizmetlerinin kullanımını düzenler. VisaPath (&quot;Şirket&quot;, &quot;biz&quot;, &quot;bizim&quot;) olarak anılacaktır.
                        </p>
                        <p>
                            Sitemizi veya hizmetlerimizi kullanarak, bu Kullanım Şartlarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş sayılırsınız. Bu şartları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayınız.
                        </p>
                        <p>
                            VisaPath, bu şartları önceden bildirimde bulunmaksızın herhangi bir zamanda güncelleme, değiştirme veya ekleme yapma hakkını saklı tutar. Güncel şartlar her zaman bu sayfada yayınlanacak olup, değişikliklerden sonra hizmeti kullanmaya devam etmeniz, güncel şartları kabul ettiğiniz anlamına gelir.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">2. Hizmet Tanımı ve Kapsam</h2>
                        <p>
                            VisaPath, vize başvuru süreçlerinde danışmanlık ve destek hizmeti sunan özel bir platformdur. Hizmetlerimiz şunları kapsar:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Vize gereksinimleri hakkında bilgilendirme ve danışmanlık</li>
                            <li>Gerekli belgelerin listelenmesi, kontrolü ve eksiklerin tespiti</li>
                            <li>Başvuru formlarının (DS-160, Schengen formları vb.) doldurulmasında yardım</li>
                            <li>Randevu alma ve randevu takibi desteği</li>
                            <li>Başvuru sürecinin baştan sona takibi</li>
                            <li>Mülakat hazırlık desteği (Pro ve Elite planlar)</li>
                            <li>Niyet mektubu ve kapak yazısı hazırlama desteği</li>
                            <li>Belge çeviri ve noter onayı yönlendirmeleri</li>
                        </ul>
                        <p className="mt-4">
                            <strong>Önemli Uyarı:</strong> VisaPath, resmi bir konsolosluk temsilcisi, büyükelçilik, devlet kurumu veya vize başvuru merkezi DEĞİLDİR. Vize onayı veya reddi kararı tamamen ilgili konsolosluk, büyükelçilik veya yetkili makamın takdirine bağlıdır. VisaPath, vize sonucu hakkında hiçbir garanti vermez.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">3. Hesap Oluşturma ve Kullanıcı Sorumlulukları</h2>
                        <p>
                            Hizmetlerimizden yararlanmak için bir hesap oluşturmanız gerekebilir. Hesap oluştururken verdiğiniz bilgilerin (e-posta, ad, soyad, telefon vb.) doğru, güncel ve eksiksiz olmasından siz sorumlusunuz.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Hesap bilgilerinizi gizli tutmak ve yetkisiz erişime karşı korumak sizin sorumluluğunuzdadır</li>
                            <li>Hesabınıza yetkisiz erişim tespit ettiğinizde derhal bize bildirmeniz gerekmektedir</li>
                            <li>18 yaşından küçükseniz, ebeveyn veya yasal vasinizin onayı ile hizmet kullanabilirsiniz</li>
                            <li>Bir başkası adına başvuru yapıyorsanız, gerekli yetkilendirmeye sahip olduğunuzu beyan etmiş sayılırsınız</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">4. Ücretlendirme, Ödeme ve Faturalandırma</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Fiyatlandırma:</strong> Hizmet ücretleri, seçilen plan (Starter, Pro, Elite), hedef ülke ve vize türüne göre değişir. Fiyatlar sitede ve başvuru sırasında gösterilir.</li>
                            <li><strong>Ödeme Yöntemleri:</strong> Kredi kartı, banka kartı (debit) ve havale/EFT ile ödeme kabul edilir. Tüm kart ödemeleri 3D Secure ile güvence altındadır.</li>
                            <li><strong>Para Birimi:</strong> Aksi belirtilmedikçe tüm ücretler Euro (€) veya Türk Lirası (₺) cinsinden gösterilir. Döviz kurları ödeme anındaki kura göre uygulanabilir.</li>
                            <li><strong>Konsolosluk Harçları:</strong> Vize harcı, biyometrik ücreti ve diğer resmi konsolosluk ücretleri hizmet bedelimize dahil DEĞİLDİR. Bu ücretler doğrudan ilgili kuruma ödenir.</li>
                            <li><strong>Fatura:</strong> Ödemeleriniz için elektronik fatura düzenlenir. Fatura bilgilerinizi başvuru sırasında veya hesap ayarlarınızdan güncelleyebilirsiniz.</li>
                        </ul>

                        <h2 id="refund" className="text-xl font-bold text-navy-dark mt-8">5. İptal ve İade Politikası</h2>
                        <p>
                            İade talepleri, aşağıdaki koşullara tabidir. Konsolosluk harçları ve üçüncü taraf ücretleri (randevu ücreti, kargo vb.) hiçbir koşulda iade edilmez.
                        </p>
                        <p><strong>Starter Plan:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Dijital içerik (rehber, checklist, AI araçları) niteliğindedir</li>
                            <li>Erişim sağlandıktan sonra iade yapılmaz</li>
                            <li>Ödeme öncesi iptal talebi kabul edilir</li>
                        </ul>
                        <p className="mt-4"><strong>Pro Plan:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Hizmet başlamadan önce (belge incelemesi yapılmadan) iptal: %100 iade</li>
                            <li>Belge incelemesi başladıktan sonra iptal: %50 iade</li>
                            <li>Randevu alındıktan veya başvuru gönderildikten sonra: iade yapılmaz</li>
                        </ul>
                        <p className="mt-4"><strong>Elite Plan:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Vize REDDİ durumunda: %100 hizmet bedeli iadesi (konsolosluk harçları hariç)</li>
                            <li>Red sonrası iade talebi, ret mektubunun ibrazı ile 30 gün içinde yapılmalıdır</li>
                            <li>Müşteri kaynaklı iptal (başvuruyu geri çekme, belge eksikliği vb.): standart iptal koşulları uygulanır</li>
                        </ul>
                        <p className="mt-4">
                            İade talepleriniz için <strong>destek@visapath.com.tr</strong> adresine e-posta gönderin. İade işlemi onaylandıktan sonra 7-14 iş günü içinde ödeme yaptığınız yönteme (kart/havale) iade edilir.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">6. Kullanıcı Yükümlülükleri ve Yasak Davranışlar</h2>
                        <p>Sitemizi ve hizmetlerimizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Doğru, güncel ve eksiksiz bilgiler sağlamak; yanıltıcı veya sahte bilgi vermemek</li>
                            <li>Sahte, düzenlenmiş veya başkasına ait belgeler sunmamak (bu durum yasal yaptırım gerektirir)</li>
                            <li>Başkalarının hesaplarına yetkisiz erişim sağlamamak</li>
                            <li>Siteyi yasadışı amaçlarla, zararlı yazılım yaymak veya güvenliği ihlal etmek için kullanmamak</li>
                            <li>Fikri mülkiyet haklarına (telif hakkı, ticari marka vb.) saygı göstermek</li>
                            <li>Spam, reklam veya istenmeyen içerik göndermemek</li>
                            <li>Diğer kullanıcıları rahatsız edecek veya hakaret içeren davranışlarda bulunmamak</li>
                        </ul>
                        <p>
                            Bu kurallara uyulmaması halinde hizmetten men, hesap kapatma ve gerekirse yasal işlem başlatma hakkımız saklıdır.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">7. Sorumluluk Sınırlandırması</h2>
                        <p>
                            VisaPath, vize sonuçları hakkında hiçbir garanti vermez. Vize başvurularının onaylanıp onaylanmayacağı, sürelerinin ne kadar olacağı tamamen ilgili konsolosluk/büyükelçiliğin kararına bağlıdır.
                        </p>
                        <p>VisaPath, aşağıdaki durumlardan sorumlu tutulamaz:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Konsoloslukların vize ret kararları veya gecikmeleri</li>
                            <li>Randevu sistemlerindeki (VFS, iData, TLScontact vb.) aksaklıklar veya yoğunluk</li>
                            <li>Kullanıcının yanlış, eksik veya gecikmeli bilgi/belge sağlaması</li>
                            <li>Mücbir sebepler (doğal afet, salgın, savaş, terör, grev, siber saldırı vb.)</li>
                            <li>Üçüncü taraf hizmet sağlayıcılarının (ödeme, hosting vb.) aksaklıkları</li>
                            <li>İnternet bağlantısı veya teknik altyapı kaynaklı kesintiler</li>
                        </ul>
                        <p>
                            Sorumluluğumuz, ödenen hizmet bedeli tutarı ile sınırlıdır (Elite plan iade garantisi hariç). Dolaylı zarar, kar kaybı, manevi tazminat talepleri kapsam dışındadır.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">8. Fikri Mülkiyet</h2>
                        <p>
                            VisaPath web sitesi ve uygulamasındaki tüm içerik, metin, grafik, logo, ikon, görsel, ses, video, yazılım kodu ve tasarım öğeleri VisaPath&apos;e aittir ve Türkiye Cumhuriyeti Fikir ve Sanat Eserleri Kanunu ile uluslararası telif hakkı sözleşmeleri kapsamında korunmaktadır.
                        </p>
                        <p>
                            İzinsiz kopyalama, çoğaltma, dağıtma, değiştirme, ticari amaçla kullanma veya türev çalışmalar oluşturma yasaktır. Rehber içeriklerimizi kişisel kullanım amacıyla indirebilirsiniz; ancak kaynak göstermeksizin başka platformlarda yayınlamak yasaktır.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">9. Gizlilik ve Kişisel Veriler</h2>
                        <p>
                            Kişisel verilerinizin işlenmesi, <strong>Gizlilik Politikamız</strong> kapsamında düzenlenmiştir. Bu şartları kabul etmekle, Gizlilik Politikası&apos;nı da okuduğunuzu ve kabul ettiğinizi beyan etmiş sayılırsınız.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">10. Uyuşmazlık Çözümü ve Uygulanacak Hukuk</h2>
                        <p>
                            Bu Kullanım Şartları, Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Türk mahkemeleri yetkilidir. Ticari uyuşmazlıklarda İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.
                        </p>
                        <p>
                            Öncelikle dostane çözüm yoluna gidilmesi tavsiye edilir. Şikayetleriniz için destek@visapath.com.tr adresine yazabilirsiniz; 14 gün içinde yanıt vermeyi taahüt ediyoruz.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">11. İletişim</h2>
                        <p>
                            Kullanım şartları hakkında sorularınız için:
                        </p>
                        <ul className="list-none space-y-1">
                            <li>📧 <strong>E-posta:</strong> legal@visapath.com.tr</li>
                            <li>📞 <strong>Telefon:</strong> +90 (212) 555 00 00</li>
                            <li>📍 <strong>Adres:</strong> Levent Mah. Büyükdere Cad. No:185, 34394 Şişli/İstanbul, Türkiye</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
