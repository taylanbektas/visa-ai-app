
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft, FileText, Bot, Sparkles,
    MessageSquare, Loader2, Upload,
    User, MapPin, Calendar, Save,
    ChevronDown, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AIDashboardChat from "@/components/AIDashboardChat";
import { MessageCenter } from "@/components/MessageCenter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryWithFlag } from "@/lib/countryUtils";

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
    notes?: string | null;
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
    const [activeSection, setActiveSection] = useState<'overview' | 'messages' | 'ai'>('overview');

    useEffect(() => {
        if (profileId) {
            fetchData();
        }
    }, [profileId, appId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData as any);
            setCustomerNotes((profileData as any).notes || "");

            const { data: appsData, error: appsError } = await supabase
                .from('applications')
                .select('*')
                .eq('user_id', profileData.user_id)
                .order('created_at', { ascending: false });

            if (appsError) throw appsError;
            setAllApplications(appsData || []);

            let activeApp = null;
            if (appId) {
                activeApp = appsData?.find(a => a.id === appId);
            }
            if (!activeApp && appsData && appsData.length > 0) {
                activeApp = appsData[0];
            }

            if (activeApp) {
                const { data: docsData } = await supabase
                    .from('application_documents' as any)
                    .select('*')
                    .eq('application_id', activeApp.id);

                setDocs(docsData || []);
                setApplication(activeApp);
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
            .update({ notes: customerNotes } as any)
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
        <DashboardLayout
            titlePrefix="Müşteri"
            titleSuffix="Detay"
            groupLabel="Müşteri Yönetimi"
            items={[]}
            activeTab="detail"
            onTabChange={() => {}}
        >
            {/* Header */}
            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-xl h-10 w-10 border border-slate-200 p-0 shrink-0"
                            onClick={() => navigate("/advisor?tab=applications")}
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-navy-dark flex items-center justify-center font-black text-lg text-white shrink-0">
                                {profile.full_name?.substring(0, 1).toUpperCase() || "?"}
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-navy-dark tracking-tight">{profile.full_name || "İsimsiz Müşteri"}</h1>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-0.5">
                                    <span>{profile.phone || "Telefon Yok"}</span>
                                    <span className="hidden sm:inline border-l border-slate-200 pl-3">{profile.active_package?.toUpperCase() || 'Standart'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {application && (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                <div className="px-3">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dosya</p>
                                    <Select
                                        value={application.id}
                                        onValueChange={(val) => navigate(`/advisor/customer/${profile.id}?appId=${val}`)}
                                    >
                                        <SelectTrigger className="h-7 border-none shadow-none bg-transparent font-bold text-sm text-navy-dark p-0 min-w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allApplications.map(app => (
                                                <SelectItem key={app.id} value={app.id}>
                                                    {countryWithFlag(app.destination)} — {app.visa_type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="h-6 w-px bg-slate-200" />
                                <div className="px-3">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Durum</p>
                                    <Select
                                        value={application.status}
                                        onValueChange={handleUpdateStatus}
                                    >
                                        <SelectTrigger className="h-7 border-none shadow-none bg-transparent font-bold text-sm text-navy-dark p-0 min-w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Alındı">Yeni Kayıt</SelectItem>
                                            <SelectItem value="İnceleniyor">İnceleniyor</SelectItem>
                                            <SelectItem value="İşlem Gerekli">Eksik Evrak</SelectItem>
                                            <SelectItem value="Gönderildi">Konsoloslukta</SelectItem>
                                            <SelectItem value="Onaylandı">Onaylandı</SelectItem>
                                            <SelectItem value="Reddedildi">Reddedildi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section tabs */}
                <div className="flex gap-2 mt-4 border-t border-slate-100 pt-4">
                    {[
                        { id: 'overview' as const, label: 'Genel Bakış', icon: FileText },
                        { id: 'messages' as const, label: 'Mesajlar', icon: MessageSquare },
                        { id: 'ai' as const, label: 'AI Asistan', icon: Bot },
                    ].map(tab => (
                        <Button
                            key={tab.id}
                            variant={activeSection === tab.id ? "default" : "ghost"}
                            size="sm"
                            className={`rounded-xl font-bold text-xs ${activeSection === tab.id ? 'bg-navy-dark text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            onClick={() => setActiveSection(tab.id)}
                        >
                            <tab.icon size={14} className="mr-1.5" /> {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {activeSection === 'overview' && application && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Application info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl border border-blue-100">
                                    {countryWithFlag(application.destination).split(' ')[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-navy-dark tracking-tight">{countryWithFlag(application.destination)}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className="bg-blue-50 text-blue-600 border-none font-bold px-2.5 py-0.5 rounded-lg text-[10px]">{application.visa_type}</Badge>
                                        <span className="text-[10px] font-bold text-slate-300">#{application.reference_id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paket</p>
                                    <p className="font-black text-navy-dark">{(application.plan || 'Standart').toUpperCase()}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Durum</p>
                                    <p className="font-black text-navy-dark">{application.status}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tarih</p>
                                    <p className="font-bold text-navy-dark text-sm">{new Date(application.created_at).toLocaleDateString('tr-TR')}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seyahat</p>
                                    <p className="font-bold text-navy-dark text-sm">{application.travel_date ? new Date(application.travel_date).toLocaleDateString('tr-TR') : 'Belirtilmedi'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Document Center */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-navy-dark flex items-center justify-center text-white">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-navy-dark">Belge Havuzu</h3>
                                        <p className="text-xs text-slate-400 font-bold">{docs.length} belge yüklendi • Müşteri bu belgeleri görebilir</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setIsUploadDialogOpen(true)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs px-4"
                                >
                                    <Plus size={14} className="mr-1.5" /> Belge Ekle
                                </Button>
                            </div>

                            {docs.length > 0 ? (
                                <div className="space-y-3">
                                    {docs.map((doc, idx) => (
                                        <div key={idx} className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:border-slate-200 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white text-navy-dark rounded-lg shadow-sm flex items-center justify-center border border-slate-100">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-navy-dark text-sm">{doc.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold">{new Date(doc.created_at || '').toLocaleDateString('tr-TR')}</p>
                                                </div>
                                            </div>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="rounded-lg font-bold text-xs px-3 border-slate-200">Görüntüle</Button>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold text-sm">Henüz belge yüklenmedi.</p>
                                    <p className="text-xs text-slate-300 mt-1">Yüklediğiniz belgeler müşteri panelinde de görünecektir.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right CRM Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-navy-dark rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-black mb-4">Müşteri Profili</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Telefon</p>
                                    <p className="font-black">{profile.phone || "Kayıtlı Değil"}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Paket</p>
                                    <p className="font-black">{(profile.active_package || 'Standart').toUpperCase()}</p>
                                </div>
                            </div>
                            <Button
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 h-11 rounded-xl font-bold text-sm"
                                onClick={() => setActiveSection('messages')}
                            >
                                <MessageSquare size={16} className="mr-2" /> Mesaj Gönder
                            </Button>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-navy-dark">Danışman Notları</h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-lg h-8 w-8 p-0 bg-slate-50 text-slate-400"
                                    onClick={handleSaveNotes}
                                    disabled={savingNotes}
                                >
                                    {savingNotes ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                </Button>
                            </div>
                            <Textarea
                                placeholder="Müşteri hakkında notlar..."
                                className="rounded-xl bg-slate-50 border-slate-100 p-4 font-medium text-navy-dark text-sm leading-relaxed focus:bg-white transition-all resize-none min-h-[120px]"
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                            />
                            <Button
                                size="sm"
                                className="w-full mt-3 bg-navy-dark text-white rounded-xl font-bold text-xs h-9"
                                onClick={handleSaveNotes}
                            >
                                Kaydet
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'messages' && profile && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
                    <MessageCenter
                        currentUserId={user!.id}
                        targetUserId={profile.user_id}
                        targetUserName={profile.full_name || "Müşteri"}
                    />
                </div>
            )}

            {activeSection === 'ai' && application && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <Bot size={16} className="text-emerald-500" />
                        <span className="text-xs font-black text-navy-dark uppercase tracking-wider">Danışman AI Asistanı</span>
                        <span className="text-xs text-slate-400 ml-2">— {profile?.full_name} dosyası hakkında</span>
                    </div>
                    <div className="flex-1" style={{ height: 'calc(100% - 52px)' }}>
                        <AIDashboardChat
                            context={{
                                role: 'advisor',
                                customerName: profile?.full_name || 'Müşteri',
                                destination: application.destination,
                                visaType: application.visa_type,
                                status: application.status,
                                documentsUploaded: docs.length,
                                plan: application.plan,
                            }}
                        />
                    </div>
                </div>
            )}

            {activeSection === 'overview' && !application && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
                    <Bot size={64} className="mx-auto text-slate-200 mb-6" />
                    <h2 className="text-2xl font-black text-navy-dark tracking-tight">Dosya Seçilmedi</h2>
                    <p className="text-slate-400 font-medium mt-2">Üstten bir başvuru dosyası seçin.</p>
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl p-8">
                    <DialogHeader className="mb-6 text-center">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Upload size={28} />
                        </div>
                        <DialogTitle className="text-xl font-black text-navy-dark">Belge Yükle</DialogTitle>
                        <p className="text-sm text-slate-400 mt-1">Yüklenen belgeler müşteri panelinde de görünür.</p>
                    </DialogHeader>

                    <form onSubmit={handleUploadDocument} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Belge Adı</Label>
                            <Input
                                placeholder="Örn: Pasaport Görseli"
                                value={newDocName}
                                onChange={(e) => setNewDocName(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold px-4"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dosya</Label>
                            <Input
                                id="ad-doc-upload"
                                type="file"
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 cursor-pointer"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)} className="flex-1 rounded-xl font-bold h-11">
                                Vazgeç
                            </Button>
                            <Button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 rounded-xl font-bold h-11" disabled={uploading}>
                                {uploading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Upload size={16} className="mr-2" />}
                                Yükle
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
