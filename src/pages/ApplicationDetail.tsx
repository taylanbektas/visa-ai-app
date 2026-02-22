
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft, FileText, ChevronRight, Bot, Sparkles,
    TrendingUp, AlertCircle, MessageSquare, Loader2, Upload,
    User, Phone, MapPin, Calendar, CreditCard, Save, History,
    CheckCircle2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AIApplicationSummary from "@/components/AIApplicationSummary";
import AIDocumentReview from "@/components/AIDocumentReview";
import AIDashboardChat from "@/components/AIDashboardChat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Application = {
    id: string;
    reference_id: string;
    destination: string;
    visa_type: string;
    status: string;
    created_at: string;
    user_id: string;
    plan: string;
    notes: string | null;
    travel_date: string | null;
};

type Profile = {
    id: string;
    full_name: string | null;
    phone: string | null;
    user_id: string;
    active_package: string | null;
    notes: string | null; // Profile level notes
};

export default function ApplicationDetail() {
    const { id: profileId } = useParams<{ id: string }>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const appId = queryParams.get("appId");

    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [allApplications, setAllApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [docs, setDocs] = useState<any[]>([]);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [newDocName, setNewDocName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [customerNotes, setCustomerNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);

    useEffect(() => {
        if (profileId) {
            fetchData();
        }
    }, [profileId, appId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);
            setCustomerNotes(profileData.notes || "");

            // 2. Fetch all applications for this user
            const { data: appsData, error: appsError } = await supabase
                .from('applications')
                .select('*')
                .eq('user_id', profileData.user_id)
                .order('created_at', { ascending: false });

            if (appsError) throw appsError;
            setAllApplications(appsData || []);

            // 3. Set specific application or first one
            let activeApp = null;
            if (appId) {
                activeApp = appsData?.find(a => a.id === appId);
            }
            if (!activeApp && appsData && appsData.length > 0) {
                activeApp = appsData[0];
            }

            if (activeApp) {
                // 4. Fetch documents for active application
                const { data: docsData } = await supabase
                    .from('application_documents' as any)
                    .select('*')
                    .eq('application_id', activeApp.id);

                setDocs(docsData || []);
                setApplication({
                    ...activeApp,
                    destination: activeApp.destination
                });
            }
        } catch (error: any) {
            toast({ title: "Hata", description: error.message, variant: "destructive" });
            navigate("/advisor");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!application) return;

        const { error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', application.id);

        if (error) {
            toast({ title: "Hata", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Başarılı", description: "Başvuru durumu güncellendi." });
            setApplication({ ...application, status });
        }
    };

    const handleSaveNotes = async () => {
        if (!profile) return;
        setSavingNotes(true);

        const { error } = await supabase
            .from('profiles')
            .update({ notes: customerNotes })
            .eq('id', profile.id);

        if (error) {
            toast({ title: "Hata", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Başarılı", description: "Notlar kaydedildi." });
            setProfile({ ...profile, notes: customerNotes });
        }
        setSavingNotes(false);
    };

    const handleUploadDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!application) return;

        const fileInput = document.getElementById('ad-doc-upload') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file || !newDocName) {
            toast({ title: "Hata", description: "Lütfen tüm alanları doldurun.", variant: "destructive" });
            return;
        }

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const filePath = `advisor-docs/${application.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) {
            toast({ title: "Yükleme Hatası", description: uploadError.message, variant: "destructive" });
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase
            .from('application_documents' as any)
            .insert({
                application_id: application.id,
                name: newDocName,
                url: publicUrl,
                type: 'advisor_upload'
            });

        if (dbError) {
            toast({ title: "Veritabanı Hatası", description: dbError.message, variant: "destructive" });
        } else {
            toast({ title: "Başarılı", description: "Belge başarıyla yüklendi." });
            setNewDocName("");
            setIsUploadDialogOpen(false);
            fetchData();
        }
        setUploading(false);
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-navy-dark" size={48} /></div>;
    if (!profile) return <div className="p-10 text-center">Profil bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header Section */}
            <div className="bg-navy-dark pt-10 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>

                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            className="bg-white/5 text-white hover:bg-white/10 rounded-xl p-0 h-12 w-12 border border-white/10 transition-all active:scale-95"
                            onClick={() => navigate("/advisor")}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center font-black text-2xl text-white backdrop-blur-md border border-white/20 shadow-2xl">
                                {profile.full_name?.substring(0, 2).toUpperCase() || "??"}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-0.5">
                                    <h1 className="text-3xl font-black text-white tracking-tight">{profile.full_name || "İsimsiz Müşteri"}</h1>
                                    <Badge className="bg-blue-500/20 text-blue-300 border-none px-2 py-0.5 rounded-lg text-[9px] uppercase font-black tracking-widest">Müşteri</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Phone size={12} className="text-blue-400" /> {profile.phone || "-"}</span>
                                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-emerald-400" /> Kayıt: {new Date(application?.created_at || '').toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {application && (
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Application Switcher */}
                            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 mr-4">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-3">BAŞVURU SEÇ:</span>
                                <select
                                    className="bg-navy-dark text-white font-black text-xs h-9 px-4 rounded-xl focus:outline-none border border-white/10 cursor-pointer"
                                    value={application.id}
                                    onChange={(e) => navigate(`/advisor/customer/${profile.id}?appId=${e.target.value}`)}
                                >
                                    {allApplications.map(app => (
                                        <option key={app.id} value={app.id} className="text-navy-dark">
                                            {app.destination} ({app.id.substring(0, 8).toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                                <div className="px-5 py-2">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">DURUMU GÜNCELLE</p>
                                    <select
                                        className="bg-transparent text-white font-black text-sm focus:outline-none cursor-pointer p-0 appearance-none pr-6"
                                        value={application.status}
                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '12px' }}
                                    >
                                        <option className="text-navy-dark" value="Alındı">Alındı</option>
                                        <option className="text-navy-dark" value="İnceleniyor">İnceleniyor</option>
                                        <option className="text-navy-dark" value="İşlem Gerekli">İşlem Gerekli</option>
                                        <option className="text-navy-dark" value="Gönderildi">Gönderildi</option>
                                        <option className="text-navy-dark" value="Onaylandı">Onaylandı</option>
                                        <option className="text-navy-dark" value="Reddedildi">Reddedildi</option>
                                    </select>
                                </div>
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500 ${application.status === 'Onaylandı' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                    application.status === 'İşlem Gerekli' ? 'bg-amber-500 shadow-amber-500/20' :
                                        'bg-blue-500 shadow-blue-500/20'
                                    }`}>
                                    {application.status === 'Onaylandı' ? <CheckCircle2 size={24} className="text-white" /> : <Clock size={24} className="text-white" />}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 -mt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
                {/* Left Column - Applications & Documents */}
                <div className="lg:col-span-8 space-y-8">
                    {application ? (
                        <>
                            {/* Application Summary Card */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
                                    <Sparkles size={120} className="text-navy-dark" />
                                </div>

                                <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-navy-dark border border-slate-100 shadow-inner">
                                            <MapPin size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-navy-dark tracking-tight">{application.destination}</h2>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{application.visa_type}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:flex gap-6 md:gap-10">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">REFERANS NO</p>
                                            <p className="text-lg font-black text-navy-dark">#{application.reference_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">PAKET</p>
                                            <Badge className="bg-blue-50 text-blue-600 border-none font-black px-3 py-1 text-xs truncate max-w-[120px]">{application.plan}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                                    <Bot size={22} />
                                                </div>
                                                <h3 className="text-sm font-black text-navy-dark uppercase tracking-[0.15em]">AI Başvuru Özeti</h3>
                                            </div>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-3 py-1 text-[10px]">{allApplications.length} Toplam Başvuru</Badge>
                                        </div>
                                        <AIApplicationSummary
                                            applications={allApplications.map(app => ({
                                                destination: app.destination,
                                                visaType: app.visa_type,
                                                status: app.status,
                                                plan: app.plan,
                                                travelDate: app.travel_date,
                                                uploadedDocs: docs.length, // Ideally we'd fetch counts for all, but this helps the AI count the apps correctly
                                                totalDocs: docs.length + 2
                                            }))}
                                        />
                                    </div>

                                    {/* Smart Advisor Tools */}
                                    <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-sm font-black text-navy-dark uppercase tracking-widest flex items-center gap-3">
                                                <Sparkles size={20} className="text-emerald-500" /> Akıllı Danışman Araçları
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                            {[
                                                { label: "Durum Analizi", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                                                { label: "Eksik Kontrolü", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
                                                { label: "Mesaj Taslağı", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" }
                                            ].map((action) => (
                                                <Button
                                                    key={action.label}
                                                    variant="outline"
                                                    className={`h-auto py-6 rounded-2xl border-white bg-white shadow-sm flex flex-col gap-3 hover:border-emerald-200 hover:shadow-md transition-all active:scale-[0.98] group`}
                                                >
                                                    <div className={`p-3 rounded-xl transition-colors ${action.bg}`}>
                                                        <action.icon size={28} className={action.color} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-navy-dark transition-colors">{action.label}</span>
                                                </Button>
                                            ))}
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-slate-200">
                                            <div className="h-64 overflow-hidden relative rounded-[2rem] border border-white bg-white shadow-sm">
                                                <AIDashboardChat
                                                    context={{
                                                        destination: application.destination,
                                                        visaType: application.visa_type,
                                                        status: application.status
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                            <FileText size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-navy-dark tracking-tight">Belge Merkezi</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{docs.length} Toplam Belge</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setIsUploadDialogOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-black px-6 shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-xs"
                                    >
                                        <Upload size={16} className="mr-2" /> BELGE YÜKLE
                                    </Button>
                                </div>

                                {docs.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6">
                                        {docs.map((doc, idx) => (
                                            <div key={idx} className="group bg-slate-50/50 hover:bg-white rounded-3xl border border-slate-100 p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl shadow-sm flex items-center justify-center border border-slate-50 group-hover:bg-blue-50 transition-colors">
                                                            <FileText size={24} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-navy-dark text-lg mb-0.5">{doc.name}</h4>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                    <History size={10} /> {new Date(doc.created_at || '').toLocaleDateString('tr-TR')}
                                                                </span>
                                                                {doc.type === 'advisor_upload' && (
                                                                    <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase px-2 py-0">Danışman</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="outline" className="h-10 rounded-xl font-black text-[10px] uppercase px-5 border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all">Görüntüle</Button>
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-2xl p-2 border border-slate-50 group-hover:border-blue-50/50 transition-colors">
                                                    <AIDocumentReview
                                                        documentName={doc.name}
                                                        documentType={doc.name.includes("Pasaport") ? "Pasaport" : "Belge"}
                                                        destination={application.destination}
                                                        visaType={application.visa_type}
                                                        requirementId={doc.id || idx.toString()}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
                                            <FileText size={40} className="text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-bold text-lg mb-1">Dosya Bulunamadı</p>
                                        <p className="text-slate-300 text-sm">Müşteri henüz bir belge yüklemedi.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-20 text-center">
                            <Bot size={64} className="mx-auto text-slate-200 mb-6" />
                            <h2 className="text-2xl font-black text-navy-dark tracking-tight">Başvuru Seçilmedi</h2>
                            <p className="text-slate-400 font-bold mt-2">Lütfen işlem yapmak için bir başvuru seçin.</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Customer Info & Notes */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Customer Info Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-1/4 -translate-y-1/4 rotate-12 scale-150 pointer-events-none">
                            <User size={120} className="text-navy-dark" />
                        </div>

                        <h3 className="text-xl font-black text-navy-dark mb-8 tracking-tight">İletişim Bilgileri</h3>
                        <div className="space-y-4">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Phone size={10} /> Telefon</p>
                                <p className="text-lg font-black text-navy-dark">{profile.phone || "Girilmemiş"}</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CreditCard size={10} /> Aktif Paket</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-lg font-black text-navy-dark">{profile.active_package || "Paket Yok"}</p>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase px-2">AKTİF</Badge>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-8 bg-navy-dark hover:bg-slate-800 text-white h-16 rounded-[1.2rem] font-black shadow-xl shadow-navy-dark/10 active:scale-[0.98] transition-all"
                            onClick={() => navigate(`/advisor?tab=messages&userId=${profile.user_id}`)}
                        >
                            <MessageSquare size={20} className="mr-3" /> MESAJ GÖNDER
                        </Button>
                    </div>

                    {/* Customer Notes Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <FileText size={20} />
                                </div>
                                <h3 className="text-xl font-black text-navy-dark tracking-tight">Müşteri Notları</h3>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className={`rounded-xl h-10 w-10 p-0 text-slate-400 hover:text-emerald-500 transition-colors ${customerNotes !== (profile.notes || "") ? 'text-amber-500 animate-pulse' : ''}`}
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                            >
                                {savingNotes ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            </Button>
                        </div>

                        <div className="relative group">
                            <Textarea
                                placeholder="Müşteri hakkında özel notlar, ara görüşme detayları veya kişisel hatırlatmalar ekle..."
                                className="min-h-[250px] rounded-3xl bg-slate-50/50 border-slate-100 p-6 font-bold text-navy-dark text-sm leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all resize-none"
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                            />
                            <div className="absolute right-6 bottom-6 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                <Button
                                    size="sm"
                                    className="bg-navy-dark text-white rounded-xl font-black text-[10px] uppercase h-9 px-4"
                                    onClick={handleSaveNotes}
                                >
                                    KAYDET
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Sparkles size={16} />
                            </div>
                            <p className="text-[11px] font-bold text-blue-800/70 leading-relaxed">
                                Bu notlar sadece sizin tarafınızdan görülebilir. Müşteri veya diğer danışmanlar bu notlara erişemez.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                    <DialogHeader className="mb-10 text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Upload size={32} />
                        </div>
                        <DialogTitle className="text-3xl font-black text-navy-dark tracking-tight">Yeni Belge Yükle</DialogTitle>
                        <p className="text-slate-400 font-bold text-sm mt-1">Sisteme manuel belge ekleyin.</p>
                    </DialogHeader>

                    <form onSubmit={handleUploadDocument} className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">BELGE BAŞLIĞI</Label>
                            <Input
                                placeholder="Örn: Vize Başvuru Formu"
                                value={newDocName}
                                onChange={(e) => setNewDocName(e.target.value)}
                                className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-bold px-6 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">DOSYA SEÇİN</Label>
                            <div className="relative group">
                                <Input
                                    id="ad-doc-upload"
                                    type="file"
                                    className="h-16 rounded-2xl bg-slate-50 border-slate-100 cursor-pointer pt-4.5 font-bold px-6 group-hover:bg-white transition-all opacity-0 absolute inset-0 z-10"
                                />
                                <div className="h-16 rounded-2xl bg-slate-50 border-slate-100 border-dashed border-2 flex items-center px-6 text-slate-400 font-bold text-sm pointer-events-none group-hover:bg-white group-hover:border-blue-200 transition-all">
                                    <FileText size={18} className="mr-3 text-slate-300" />
                                    <span>Tıkla veya Dosyayı Sürükle</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsUploadDialogOpen(false)}
                                className="flex-1 rounded-2xl font-black h-14 text-slate-400 hover:text-navy-dark"
                            >
                                İPTAL
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] bg-blue-600 hover:bg-blue-800 h-14 rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="animate-spin mr-3" /> : <Upload size={18} className="mr-3" />}
                                ŞİMDİ YÜKLE
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
