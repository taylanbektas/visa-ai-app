import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

export default function VideoGuides() {
    const placeholderVideos = [
        { title: "Sisteme Nasıl Kayıt Olunur?", duration: "02:15" },
        { title: "Vize Başvurusu Nasıl Yapılır?", duration: "04:30" },
        { title: "Belgeleri Nereye Yükleyeceğim?", duration: "03:45" },
        { title: "Profil Bilgilerini Güncelleme", duration: "01:50" },
    ];

    return (
        <div className="page-shell">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 mt-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-navy-dark mb-4">
                        Video Rehberler
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Hizmetlerimizi en verimli şekilde kullanmak için hazırladığımız video rehberlere buradan erişebilirsiniz. Çok yakında eklenecektir.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-20">
                    {placeholderVideos.map((video, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                        >
                            <div className="aspect-video bg-secondary flex items-center justify-center relative">
                                <PlayCircle size={64} className="text-muted-foreground/30 group-hover:text-[#00D69E] transition-colors" />
                                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
                                    {video.duration}
                                </div>
                            </div>
                            <div className="p-6 flex-1">
                                <h3 className="font-bold text-lg text-navy-dark mb-2">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Çok yakında bu eğitim videosu platformumuza eklenecektir.
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
