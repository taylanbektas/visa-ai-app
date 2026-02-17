import { motion } from "framer-motion";

export default function Privacy() {
    return (
        <div className="page-shell">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-navy-dark mb-8">
                        Gizlilik Politikası
                    </h1>

                    <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-foreground/80 space-y-6">
                        <p className="text-muted-foreground text-sm">Son güncelleme: 17 Şubat 2026</p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">1. Giriş ve Veri Sorumlusu</h2>
                        <p>
                            VisaPath (&quot;biz&quot;, &quot;bizim&quot;, &quot;Şirket&quot; veya &quot;veri sorumlusu&quot;) olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuata uygun olarak hazırlanmıştır.
                        </p>
                        <p>
                            Bu politika, visapath.com.tr web sitemizi, mobil uygulamamızı ve sunduğumuz tüm vize danışmanlık hizmetlerini kullanırken toplanan, işlenen, saklanan ve paylaşılan kişisel verileriniz hakkında sizi kapsamlı şekilde bilgilendirmek amacıyla hazırlanmıştır. Hizmetlerimizi kullanarak bu politikayı okuduğunuzu ve kabul ettiğinizi beyan etmiş sayılırsınız.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">2. Toplanan Kişisel Veriler</h2>
                        <p>Hizmetlerimizi sunabilmek, başvurularınızı yönetebilmek ve yasal yükümlülüklerimizi yerine getirebilmek için aşağıdaki kişisel verileri toplayabiliriz:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, doğum tarihi, doğum yeri, cinsiyet, T.C. kimlik numarası (talep edildiğinde), uyruk</li>
                            <li><strong>İletişim Bilgileri:</strong> E-posta adresi, cep telefonu numarası, sabit telefon numarası, adres (ikametgâh ve fatura adresi)</li>
                            <li><strong>Pasaport ve Seyahat Belgeleri:</strong> Pasaport numarası, pasaport geçerlilik tarihi, pasaport çıkaran ülke, biyometrik fotoğraf, önceki vize bilgileri, seyahat geçmişi</li>
                            <li><strong>Finansal ve Ödeme Bilgileri:</strong> Kredi kartı bilgileri (PCI-DSS uyumlu ödeme altyapımız aracılığıyla işlenir; kart numarası sunucularımızda saklanmaz), banka hesap bilgileri, fatura bilgileri</li>
                            <li><strong>Mesleki Bilgiler:</strong> İşveren adı, iş unvanı, maaş bilgisi, çalışma süresi (vize başvurusu için gerekli olduğunda)</li>
                            <li><strong>Teknik ve Kullanım Verileri:</strong> IP adresi, cihaz bilgisi, tarayıcı türü ve sürümü, işletim sistemi, ziyaret edilen sayfalar, sayfa görüntüleme süreleri, tıklama verileri</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">3. Verilerin İşlenme Amaçları</h2>
                        <p>Topladığımız kişisel verilerinizi aşağıdaki amaçlarla işliyoruz:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Vize başvuru süreçlerinin yürütülmesi, belge hazırlığı ve konsolosluk ile iletişim</li>
                            <li>Randevu planlaması ve başvuru takibi hizmetlerinin sunulması</li>
                            <li>Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi ve faturalandırma</li>
                            <li>Müşteri desteği, soru-cevap ve şikayet yönetimi</li>
                            <li>Yasal yükümlülüklerin yerine getirilmesi (vergi mevzuatı, ticari kayıtlar vb.)</li>
                            <li>Hizmet kalitesinin ölçülmesi, analiz ve iyileştirme çalışmaları</li>
                            <li>Güvenlik tehditlerinin tespiti ve önlenmesi</li>
                            <li>İletişim izni verdiğiniz takdirde, kampanya ve bilgilendirme e-postalarının gönderilmesi</li>
                        </ul>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">4. Verilerin Paylaşımı ve Aktarımı</h2>
                        <p>
                            Kişisel verileriniz, vize başvurusu kapsamında ilgili konsolosluklar, büyükelçilikler, vize başvuru merkezleri (VFS Global, iData, TLScontact vb.) ve yetkili devlet kurumlarıyla paylaşılabilir. Bu paylaşım, hizmetin sunulması için zorunludur.
                        </p>
                        <p>Aşağıdaki durumlarda veri paylaşımı yapılabilir:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Yasal zorunluluk durumlarında yetkili makamlarla (mahkeme kararı, savcılık talebi vb.)</li>
                            <li>Hizmet sağlayıcılarımızla (ödeme işlemcisi, bulut depolama, e-posta servisi) gizlilik sözleşmesi ve veri işleme sözleşmesi kapsamında</li>
                            <li>Açık rızanızın bulunduğu durumlarda üçüncü taraflarla</li>
                            <li>Kurumsal birleşme, devralma veya satış durumunda, alıcı tarafa</li>
                        </ul>
                        <p>
                            Verileriniz, AB üyesi olmayan ülkelere (örneğin bulut sunucu sağlayıcıları) aktarılabilir. Bu durumda KVKK&apos;nın 9. maddesi kapsamında gerekli güvenlik önlemleri alınır ve gerekirse açık rızanız alınır.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">5. Veri Güvenliği</h2>
                        <p>
                            Kişisel verilerinizi korumak için teknik ve idari tedbirler uyguluyoruz. Tüm veri aktarımları SSL/TLS şifreleme ile korunur. Ödeme bilgileri PCI-DSS Level 1 uyumlu altyapımız aracılığıyla işlenir; kredi kartı numaraları sunucularımızda saklanmaz.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Erişim kontrolü: Verilere yalnızca yetkili personel erişebilir</li>
                            <li>Şifreleme: Hassas veriler şifrelenerek saklanır</li>
                            <li>Düzenli güvenlik denetimleri ve penetrasyon testleri</li>
                            <li>Çalışanlarımıza gizlilik ve veri güvenliği eğitimleri</li>
                        </ul>

                        <h2 id="cookies" className="text-xl font-bold text-navy-dark mt-8">6. Çerezler (Cookies) ve İzleme Teknolojileri</h2>
                        <p>
                            Web sitemizde kullanıcı deneyimini iyileştirmek, site performansını analiz etmek ve belirli işlevleri sağlamak amacıyla çerezler ve benzeri teknolojiler kullanılmaktadır.
                        </p>
                        <p><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevleri için gereklidir (oturum yönetimi, güvenlik, dil tercihi). Bu çerezler olmadan site düzgün çalışmaz.</p>
                        <p><strong>Analitik Çerezler:</strong> Ziyaretçi sayısı, sayfa görüntüleme, trafik kaynakları gibi istatistikleri toplar. Bu veriler toplu ve anonim olarak işlenir.</p>
                        <p><strong>İşlevsel Çerezler:</strong> Tercihlerinizi (dil, tema vb.) hatırlamamızı sağlar.</p>
                        <p><strong>Pazarlama Çerezleri:</strong> Reklam kampanyalarının etkinliğini ölçmek için kullanılır. Bu çerezler için ayrıca onayınızı alırız.</p>
                        <p>
                            Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda sitenin bazı özellikleri düzgün çalışmayabilir.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">7. Veri Saklama Süresi</h2>
                        <p>
                            Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama yükümlülüklerimiz çerçevesinde muhafaza edilir.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Başvuru verileri:</strong> Başvuru tamamlandıktan sonra en az 5 yıl (ticari defter tutma ve vergi mevzuatı gereği)</li>
                            <li><strong>Ödeme kayıtları:</strong> 10 yıl (Vergi Usul Kanunu gereği)</li>
                            <li><strong>İletişim kayıtları:</strong> Talep sonuçlandıktan sonra 2 yıl</li>
                            <li><strong>Teknik loglar:</strong> En fazla 12 ay</li>
                            <li><strong>Pazarlama onayı:</strong> İptal edilene kadar</li>
                        </ul>
                        <p>Saklama süresi sona erdiğinde verileriniz silinir veya anonim hale getirilir.</p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">8. KVKK Kapsamındaki Haklarınız</h2>
                        <p>6698 sayılı Kanun kapsamında aşağıdaki haklara sahipsiniz:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                            <li>Kanunun 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini talep etme</li>
                            <li>Düzeltme ve silme işlemlerinin, aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                            <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                        </ul>
                        <p>
                            Bu haklarınızı kullanmak için <strong>privacy@visapath.com.tr</strong> adresine yazılı başvuru yapabilir veya şahsen başvurabilirsiniz. Başvurunuz en geç 30 gün içinde sonuçlandırılır. Ücretsiz olarak yapılan başvurularda, Kişisel Verileri Koruma Kurulu tarafından belirlenen ücret tarifesi uygulanabilir.
                        </p>
                        <p>Haklarınızı kullanmanız halinde sonucundan memnun kalmazsanız, Kişisel Verileri Koruma Kurulu&apos;na şikayette bulunma hakkınız saklıdır.</p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">9. Politika Güncellemeleri</h2>
                        <p>
                            Bu Gizlilik Politikası, yasal değişiklikler veya hizmetlerimizdeki güncellemeler nedeniyle değiştirilebilir. Önemli değişiklikler yapıldığında sizi e-posta veya site üzerinden bilgilendireceğiz. Güncel politika her zaman bu sayfada yayınlanacaktır.
                        </p>

                        <h2 className="text-xl font-bold text-navy-dark mt-8">10. İletişim</h2>
                        <p>
                            Gizlilik politikamız veya kişisel verileriniz hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                        </p>
                        <ul className="list-none space-y-1">
                            <li>📧 <strong>E-posta:</strong> privacy@visapath.com.tr</li>
                            <li>📞 <strong>Telefon:</strong> +90 (212) 555 00 00</li>
                            <li>📍 <strong>Adres:</strong> Levent Mah. Büyükdere Cad. No:185, 34394 Şişli/İstanbul, Türkiye</li>
                            <li>📋 <strong>Veri Sorumlusu:</strong> VisaPath Vize Danışmanlık Hizmetleri</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
