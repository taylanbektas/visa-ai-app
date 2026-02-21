import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, CheckCircle, Briefcase, Award, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function JoinAdvisor() {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        linkedin: "",
        bio: ""
    });
    const [submitted, setSubmitted] = useState(false);

    // Pre-fill if user is logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || "",
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: "Giriş Yapmalısınız",
                description: "Başvuru yapabilmek için lütfen önce giriş yapın veya kayıt olun.",
                variant: "destructive"
            });
            navigate("/login");
            return;
        }

        if (!file) {
            toast({
                title: "Dosya Eksik",
                description: "Lütfen CV'nizi yükleyin.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            // 1. Upload CV
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

            // 2. Insert Application Record
            const { error: dbError } = await supabase
                .from('advisor_applications')
                .insert({
                    user_id: user.id,
                    full_name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    linkedin_url: formData.linkedin,
                    bio: formData.bio,
                    resume_url: publicUrl,
                    status: 'pending'
                });

            if (dbError) throw dbError;

            setSubmitted(true);
            toast({
                title: "Başvuru Alındı",
                description: "Başvurunuz başarıyla gönderildi. Ekibimiz en kısa sürede inceleyecektir."
            });

        } catch (error: unknown) {
            console.error('Submission error:', error);
            if (error instanceof Error) {
                toast({
                    title: "Hata",
                    description: error.message || "Başvuru sırasında bir hata oluştu.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Hata",
                    description: "Başvuru sırasında bilinmeyen bir hata oluştu.",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="page-shell bg-slate-50 flex items-center justify-center py-32 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[3rem] p-12 md:p-20 max-w-2xl text-center shadow-2xl shadow-navy-dark/5 border border-slate-100"
                >
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-emerald-500/20 animate-bounce">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-navy-dark mb-6 tracking-tight">Başvurunuz Alındı!</h2>
                    <p className="text-lg text-slate-500 font-medium mb-12 leading-relaxed">
                        VisaPath Danışman Ağı'na katılma isteğiniz için teşekkür ederiz. Başvurunuz uzman ekibimiz tarafından incelendikten sonra size e-posta yoluyla döneceğiz.
                    </p>
                    <Button
                        onClick={() => navigate("/")}
                        className="bg-navy-dark hover:bg-navy-light text-white font-black h-16 px-12 rounded-2xl shadow-xl transition-all hover:scale-[1.05]"
                    >
                        Ana Sayfaya Dön
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="page-shell bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-navy-dark overflow-hidden py-24 md:py-32">
                {/* Abstract Background Accents */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="container mx-auto max-w-6xl px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] mb-8 shadow-sm">
                            VisaPath Danışman Ağı
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
                            Geleceğin <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Vize Uzmanı</span> Olun
                        </h1>
                        <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                            Yüzlerce vize başvuru sahibine profesyonel destek verin, uzmanlığınızı küresel bir ağda değerlendirin ve kazancınızı artırın.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
                    >
                        {[
                            { icon: Briefcase, title: "Esnek Çalışma", desc: "Kendi programınızı belirleyin, dilediğiniz yerden özgürce çalışın.", color: "blue" },
                            { icon: Award, title: "Profesyonel Gelişim", desc: "Geniş müşteri havuzu ve global vize ağımızla uzmanlığınızı katlayın.", color: "emerald" },
                            { icon: Globe, title: "Global Erişim", desc: "Birçok farklı ülkeden danışanla vizyonunuzu ve ağınızı genişletin.", color: "teal" }
                        ].map((item, idx) => (
                            <div key={idx} className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] text-left hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/5">
                                <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    <item.icon className={`text-${item.color}-400 w-7 h-7`} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{item.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 max-w-4xl -mt-20 relative z-20 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl shadow-navy-dark/5 border border-slate-100 p-8 md:p-16"
                >
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-navy-dark tracking-tight">Başvuru Formu</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Ekibimize Katılın</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-navy-dark/60 uppercase tracking-widest ml-1">Ad Soyad</label>
                                    <Input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Adınız Soyadınız"
                                        className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 px-6 font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-navy-dark/60 uppercase tracking-widest ml-1">E-posta</label>
                                    <Input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="ornek@email.com"
                                        className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 px-6 font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-navy-dark/60 uppercase tracking-widest ml-1">Telefon</label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        type="tel"
                                        placeholder="+90 5XX XXX XX XX"
                                        className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 px-6 font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-navy-dark/60 uppercase tracking-widest ml-1">LinkedIn Profil URL</label>
                                    <Input
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/..."
                                        className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 px-6 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-navy-dark/60 uppercase tracking-widest ml-1">Deneyiminiz</label>
                                <Textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Vize danışmanlığı konusundaki tecrübeleriniz, uzmanlık alanlarınız..."
                                    className="min-h-[160px] rounded-[1.5rem] bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 p-6 font-medium resize-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-navy-dark/60 uppercase tracking-widest ml-1">CV / Özgeçmiş (PDF)</label>
                                <div
                                    className={`relative group border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-300 ${dragActive
                                        ? "border-emerald-500 bg-emerald-50/50 shadow-inner"
                                        : "border-slate-100 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5"
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${file ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500"}`}>
                                        <Upload size={28} className={file ? "animate-bounce" : ""} />
                                    </div>
                                    <p className="text-base font-black text-navy-dark mb-1">
                                        {file ? file.name : "CV'nizi sürükleyin veya seçin"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">PDF formatında, maksimum 5MB</p>

                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        id="file-upload"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-8 flex flex-col items-center">
                                <Button
                                    type="submit"
                                    className="w-full md:w-auto md:min-w-[280px] bg-emerald-500 hover:bg-emerald-600 text-white font-black h-16 text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-3 animate-spin" /> Gönderiliyor...</>
                                    ) : (
                                        "Başvuruyu Tamamla"
                                    )}
                                </Button>
                                {!user && (
                                    <div className="mt-6 flex items-center gap-2 px-6 py-2 bg-rose-50 rounded-full border border-rose-100">
                                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">
                                            Başvuru için giriş yapmalısınız
                                        </p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
