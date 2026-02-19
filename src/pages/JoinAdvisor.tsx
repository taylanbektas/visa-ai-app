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
            <div className="page-shell section-gradient-light flex items-center justify-center py-20">
                <div className="bg-white rounded-2xl p-10 max-w-lg text-center shadow-lg border border-border">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-navy-dark mb-4">Başvurunuz Alındı!</h2>
                    <p className="text-muted-foreground mb-8">
                        VisaPath Danışman Ağı'na katılma isteğiniz için teşekkür ederiz. Başvurunuz uzman ekibimiz tarafından incelendikten sonra e-posta yoluyla bilgilendirileceksiniz.
                    </p>
                    <Button onClick={() => navigate("/")} className="btn-gradient text-white font-bold h-12 px-8 rounded-xl">
                        Ana Sayfaya Dön
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell section-gradient-light">
            {/* Hero Section */}
            <div className="bg-navy-dark text-white py-20 px-4 mb-10">
                <div className="container mx-auto max-w-5xl text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold mb-6"
                    >
                        Vize Danışmanı <span className="text-gradient-mint">Olun</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8"
                    >
                        Yüzlerce vize başvuru sahibine profesyonel destek verin, uzmanlığınızı değerlendirin ve gelirinizi artırın.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-8 mt-10"
                    >
                        <div className="flex flex-col items-center gap-2 max-w-[200px]">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <Briefcase className="text-accent" />
                            </div>
                            <h3 className="font-bold">Esnek Çalışma</h3>
                            <p className="text-xs text-white/60">Kendi programınızı belirleyin ve dilediğiniz yerden çalışın.</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 max-w-[200px]">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <Award className="text-accent" />
                            </div>
                            <h3 className="font-bold">Profesyonel Gelişim</h3>
                            <p className="text-xs text-white/60">Geniş müşteri ağı ile deneyiminizi artırın.</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 max-w-[200px]">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <Globe className="text-accent" />
                            </div>
                            <h3 className="font-bold">Global Erişim</h3>
                            <p className="text-xs text-white/60">Farklı ülkelerden danışanlarla çalışma fırsatı.</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 max-w-3xl -mt-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10"
                >
                    <h2 className="text-2xl font-bold text-navy-dark mb-6 text-center">Başvuru Formu</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-semibold text-foreground mb-2 block">Ad Soyad</label>
                                <Input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Adınız Soyadınız"
                                    className="h-12"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-foreground mb-2 block">E-posta</label>
                                <Input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    type="email"
                                    placeholder="ornek@email.com"
                                    className="h-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-semibold text-foreground mb-2 block">Telefon</label>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    type="tel"
                                    placeholder="+90 5XX XXX XX XX"
                                    className="h-12"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-foreground mb-2 block">LinkedIn Profil URL</label>
                                <Input
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/..."
                                    className="h-12"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-foreground mb-2 block">Kendinizden ve Deneyiminizden Bahsedin</label>
                            <Textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Vize danışmanlığı konusundaki tecrübeleriniz, uzmanlık alanlarınız..."
                                className="min-h-[120px]"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-foreground mb-2 block">CV / Özgeçmiş Yükleyin (PDF)</label>
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? "border-accent bg-accent/5" : "border-border hover:border-gray-400"
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium mb-1">
                                    {file ? file.name : "Dosyayı buraya sürükleyin veya seçmek için tıklayın"}
                                </p>
                                <p className="text-xs text-muted-foreground">PDF, maks. 5MB</p>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={handleFileChange}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => document.getElementById("file-upload")?.click()}
                                >
                                    Dosya Seç
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full btn-gradient text-white font-bold h-14 text-base rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 animate-spin" /> Gönderiliyor...</>
                                ) : (
                                    "Başvuruyu Gönder"
                                )}
                            </Button>
                            {!user && (
                                <p className="text-center text-xs text-muted-foreground mt-3">
                                    Başvuru yapabilmek için hesabınızla giriş yapmış olmanız gerekmektedir.
                                </p>
                            )}
                        </div>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}
