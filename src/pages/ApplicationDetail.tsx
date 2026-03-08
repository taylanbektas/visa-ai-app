
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft, FileText, ChevronRight, Bot, Sparkles,
    TrendingUp, AlertCircle, MessageSquare, Loader2, Upload,
    User, Phone, MapPin, Calendar, CreditCard, Save, History,
    CheckCircle2, Clock, ChevronDown, Zap, Plus
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
    notes?: string | null; // Profile level notes
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
            setProfile(profileData as any);
            setCustomerNotes((profileData as any).notes || "");

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
            <header className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8 max-w-7xl mx-auto mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        className="bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-xl h-12 w-12 border border-slate-200 p-0"
                        onClick={() => navigate("/advisor")}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-navy-dark flex items-center justify-center font-black text-xl text-white">
                            {profile.full_name?.substring(0, 1).toUpperCase() || "?"}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-navy-dark tracking-tight">{profile.full_name || "İsimsiz Müşteri"}</h1>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                <span>{profile.phone || "Telefon Yok"}</span>
                                <span className="border-l border-slate-200 pl-4">Üyelik: {profile.active_package || 'Standart'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {application && (
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                            <div className="pl-4 pr-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">DOSYA ({allApplications.length})</p>
                                <div className="relative group">
                                    <select
                                        className="bg-transparent text-navy-dark font-black text-sm h-7 pr-6 focus:outline-none cursor-pointer appearance-none"
                                        value={application.id}
                                        onChange={(e) => navigate(`/advisor/customer/${profile.id}?appId=${e.target.value}`)}
                                    >
                                        {allApplications.map(app => (
                                            <option key={app.id} value={app.id}>
                                                {app.destination} - {app.visa_type}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
                            <div className="px-4 py-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">DURUM</p>
                                <div className="relative group">
                                    <select
                                        className="bg-transparent text-navy-dark font-black text-sm h-7 pr-6 focus:outline-none cursor-pointer appearance-none"
                                        value={application.status}
                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                    >
                                        <option value="Alındı">Yeni Kayıt</option>
                                        <option value="İnceleniyor">İnceleniyor</option>
                                        <option value="İşlem Gerekli">Eksik Evrak</option>
                                        <option value="Gönderildi">Konsoloslukta</option>
                                        <option value="Onaylandı">Onaylandı</option>
                                        <option value="Reddedildi">Reddedildi</option>
                                    </select>
                                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <div className="max-w-7xl mx-auto px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
                <div className="lg:col-span-8 space-y-8">
                    {application ? (
                        <>
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 relative overflow-hidden">
                                <div className="flex flex-col xl:flex-row justify-between gap-8 mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
                                            <MapPin size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-navy-dark tracking-tight mb-1">{application.destination}</h2>
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-blue-50 text-blue-600 border-none font-black px-3 py-0.5 rounded-full text-[10px] tracking-widest uppercase">{application.visa_type}</Badge>
                                                <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">#{application.id.substring(0, 8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">PAKET</p>
                                            <p className="text-xl font-black text-navy-dark">{(application.plan || profile.active_package || 'Standart').toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Layer */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                                                <Bot size={24} />
                                            </div>
                                            <h3 className="text-lg font-black text-navy-dark uppercase tracking-tight">AI Analiz Özeti</h3>
                                        </div>

                                        <AIApplicationSummary
                                            applications={allApplications.map(app => ({
                                                destination: app.destination,
                                                visaType: app.visa_type,
                                                status: app.status,
                                                plan: app.plan,
                                                travelDate: null,
                                                uploadedDocs: docs.length,
                                                totalDocs: docs.length + 3
                                            }))}
                                        />
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden min-h-[400px] flex flex-col shadow-sm">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={16} className="text-blue-500" />
                                                <span className="text-xs font-black text-navy-dark uppercase tracking-widest">Akıllı Asistan</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
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

                            {/* Document Center */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-navy-dark flex items-center justify-center text-white">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-navy-dark tracking-tight">Belge Havuzu</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{docs.length} Belge Yüklendi</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setIsUploadDialogOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl font-black px-6 shadow-sm text-xs tracking-widest uppercase"
                                    >
                                        <Plus size={18} className="mr-2" /> BELGE EKLE
                                    </Button>
                                </div>

                                {docs.length > 0 ? (
                                    <div className="space-y-4">
                                        {docs.map((doc, idx) => (
                                            <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex items-center justify-between group hover:border-slate-200 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white text-navy-dark rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-navy-dark text-lg mb-0.5 tracking-tight">{doc.name}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(doc.created_at || '').toLocaleDateString('tr-TR')}</p>
                                                    </div>
                                                </div>
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" className="h-9 rounded-lg font-bold text-[10px] uppercase tracking-widest px-4 border-slate-200">GÖRÜNTÜLE</Button>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400 font-bold text-sm">Henüz belge yüklenmedi.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-24 text-center">
                            <Bot size={80} className="mx-auto text-slate-100 mb-8 animate-pulse" />
                            <h2 className="text-3xl font-black text-navy-dark tracking-tighter">İşlem Yapılacak Dosyayı Seçin</h2>
                            <p className="text-slate-400 font-bold mt-4 max-w-sm mx-auto">Müşterinin birden fazla başvurusu olabilir, yukarıdaki listeden ilgili olanı seçeren yönetebilirsiniz.</p>
                        </div>
                    )}
                </div>

                {/* Right CRM Panel */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-navy-dark rounded-[2rem] shadow-lg p-8 relative overflow-hidden text-white">
                        <h3 className="text-xl font-black mb-6 tracking-tight">Müşteri Profili</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Telefon</p>
                                <p className="text-lg font-black">{profile.phone || "Kayıtlı Değil"}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Paket</p>
                                <p className="text-lg font-black">{(profile.active_package || 'Standart').toUpperCase()}</p>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-blue-600/20"
                            onClick={() => navigate(`/advisor?tab=messages&userId=${profile.user_id}`)}
                        >
                            <MessageSquare size={20} className="mr-3" /> MESAJ GÖNDER
                        </Button>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <FileText size={20} />
                                </div>
                                <h3 className="text-lg font-black text-navy-dark tracking-tight">Notlar</h3>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-lg h-9 w-9 p-0 bg-slate-50 text-slate-400"
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                            >
                                {savingNotes ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            </Button>
                        </div>

                        <Textarea
                            placeholder="Müşteri hakkında notlar..."
                            className="flex-1 rounded-2xl bg-slate-50 border-slate-100 p-6 font-bold text-navy-dark text-sm leading-relaxed focus:bg-white transition-all resize-none"
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                        />
                        <Button
                            className="w-full mt-4 bg-navy-dark text-white rounded-xl font-black text-xs h-12 uppercase tracking-widest"
                            onClick={handleSaveNotes}
                        >
                            KAYDET
                        </Button>
                    </div>
                </div>
            </div>

            {/* Premium Document Upload Center */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="max-w-xl rounded-[3.5rem] p-12 border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden bg-white">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    <DialogHeader className="mb-12 text-center relative z-10">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-blue-50/50">
                            <Upload size={36} />
                        </div>
                        <DialogTitle className="text-4xl font-black text-navy-dark tracking-tighter mb-2">Merkezi Belge Yükleme</DialogTitle>
                        <p className="text-slate-400 font-bold text-md max-w-xs mx-auto">Dosyayı güvenli sunucularımıza aktarın ve anında analiz edin.</p>
                    </DialogHeader>

                    <form onSubmit={handleUploadDocument} className="space-y-10 relative z-10">
                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] ml-4">BELGE ADLANDIRMASI</Label>
                            <Input
                                placeholder="Örn: Pasaport Görseli - Son 6 Ay"
                                value={newDocName}
                                onChange={(e) => setNewDocName(e.target.value)}
                                className="h-18 rounded-[1.5rem] bg-slate-50/50 border-slate-100 font-black text-lg px-8 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner border"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] ml-4">DOSYA KAYNAĞI</Label>
                            <div className="relative group">
                                <Input
                                    id="ad-doc-upload"
                                    type="file"
                                    className="h-24 rounded-[2rem] bg-slate-50/50 border-slate-100 cursor-pointer pt-9 font-black px-8 group-hover:bg-white transition-all opacity-0 absolute inset-0 z-10"
                                />
                                <div className="h-24 rounded-[2rem] bg-slate-50/50 border-slate-100 border-dashed border-2 flex items-center justify-center px-8 text-slate-300 font-black text-md pointer-events-none group-hover:bg-white group-hover:border-blue-400/50 group-hover:text-blue-500 transition-all duration-500 shadow-inner">
                                    <Upload size={24} className="mr-4 transition-transform group-hover:-translate-y-1" />
                                    <span>Tıklayın veya Dosyayı Sürükleyin</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-10">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsUploadDialogOpen(false)}
                                className="flex-1 rounded-2xl font-black h-18 text-slate-400 hover:text-navy-dark hover:bg-slate-50 transition-all text-xs tracking-widest uppercase"
                            >
                                VAZGEÇ
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] bg-blue-600 hover:bg-blue-800 h-18 rounded-[1.5rem] font-black shadow-2xl shadow-blue-600/30 active:scale-95 transition-all text-xs tracking-[0.2em] uppercase"
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="animate-spin mr-4" /> : <Sparkles size={20} className="mr-4" />}
                                SİSTEME GÖNDER
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
