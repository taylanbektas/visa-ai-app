import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ShieldCheck, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Success() {
    const { referenceId } = useParams();
    const { t } = useLanguage();

    return (
        <div className="page-shell section-gradient-light min-h-screen flex items-center justify-center py-20">
            <div className="container mx-auto px-4 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-[2.5rem] border border-border p-8 md:p-12 shadow-2xl text-center relative overflow-hidden"
                >
                    {/* Background decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00D69E] via-[#00B386] to-[#00D69E]"></div>

                    <div className="w-24 h-24 bg-[#00D69E]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle className="w-12 h-12 text-[#00D69E]" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-navy-dark mb-6 tracking-tight">
                        Tebrikler!
                    </h1>

                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        Vize başvurunuz başarıyla oluşturuldu ve uzman ekibimize iletildi.
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-100 group transition-all hover:bg-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Referans Numaranız</p>
                        <p className="text-3xl font-mono font-black text-navy-dark group-hover:text-[#00B386] transition-colors">
                            {referenceId}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
                        <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50 text-[#00D69E]">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-navy-dark text-sm">Onay E-postası</p>
                                <p className="text-xs text-muted-foreground">Detaylar mail adresinize gönderildi.</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-navy-dark text-sm">Dosya İnceleme</p>
                                <p className="text-xs text-muted-foreground">Expert ekibimiz 24 saat içinde dönecek.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/dashboard" className="flex-1">
                            <Button className="w-full btn-gradient text-white font-black h-16 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                                Panelime Git <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </Link>
                        <Button variant="outline" className="h-16 px-8 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                            Dekontu İndir <Download size={20} className="ml-2" />
                        </Button>
                    </div>

                    <p className="mt-12 text-sm text-slate-400 font-medium">
                        Bir sorunuz mu var? <Link to="/contact" className="text-[#00D69E] hover:underline font-bold">Destek ekibimizle iletişime geçin.</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
