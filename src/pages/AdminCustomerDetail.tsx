
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Clock,
    FileText,
    Briefcase,
    ShieldAlert,
    Loader2,
    ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Profile {
    id: string;
    user_id: string;
    full_name: string | null;
    phone: string | null;
    email?: string;
    created_at: string;
    last_seen: string | null;
    active_package: string | null;
    package_assigned_at: string | null;
    is_suspended: boolean | null;
    assigned_advisor_id: string | null;
    notes?: string | null;
}

interface Application {
    id: string;
    destination: string;
    visa_type: string;
    status: string | null;
    created_at: string | null;
}

const AdminCustomerDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [advisorName, setAdvisorName] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchCustomerData();
        }
    }, [id]);

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            // Fetch applications
            const { data: appsData, error: appsError } = await supabase
                .from("applications")
                .select("*")
                .eq("user_id", profileData.user_id)
                .order("created_at", { ascending: false });

            if (appsError) throw appsError;
            setApplications(appsData || []);

            // Fetch advisor name if assigned
            if (profileData.assigned_advisor_id) {
                const { data: advisorData } = await supabase
                    .from("advisors")
                    .select("user_id")
                    .eq("id", profileData.assigned_advisor_id)
                    .single();

                if (advisorData) {
                    const { data: advisorProfile } = await supabase
                        .from("profiles")
                        .select("full_name")
                        .eq("user_id", advisorData.user_id)
                        .single();

                    if (advisorProfile) {
                        setAdvisorName(advisorProfile.full_name);
                    }
                }
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Müşteri verileri yüklenirken bir sorun oluştu."
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!profile) return;
        const newStatus = !profile.is_suspended;

        const { error } = await supabase
            .from("profiles")
            .update({ is_suspended: newStatus })
            .eq("id", profile.id);

        if (error) {
            toast({ variant: "destructive", title: "Hata", description: "İşlem başarısız oldu." });
        } else {
            setProfile({ ...profile, is_suspended: newStatus });
            toast({ title: "Başarılı", description: newStatus ? "Müşteri askıya alındı." : "Müşteri erişimi açıldı." });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-navy-dark h-8 w-8" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 text-center bg-slate-50 min-h-screen">
                <h2 className="text-2xl font-bold text-navy-dark">Müşteri bulunamadı.</h2>
                <Button onClick={() => navigate("/admin")} variant="outline" className="mt-4">
                    Geri Dön
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/admin")}
                        className="rounded-full hover:bg-white shadow-sm border border-slate-200"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-navy-dark tracking-tight">
                                {profile.full_name || 'İsimsiz Müşteri'}
                            </h1>
                            {profile.is_suspended && (
                                <Badge variant="destructive" className="font-bold">ASKIYA ALINDI</Badge>
                            )}
                        </div>
                        <p className="text-slate-500 font-medium">Müşteri Detay Sayfası</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={profile.is_suspended ? "default" : "outline"}
                        className={profile.is_suspended ? "bg-emerald-600 hover:bg-emerald-700 font-bold" : "border-rose-200 text-rose-600 hover:bg-rose-50 font-bold"}
                        onClick={handleSuspend}
                    >
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        {profile.is_suspended ? "Erişimi Aç" : "Askıya Al"}
                    </Button>
                    <Button variant="destructive" className="font-bold" disabled>Sil (Pasif)</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Stats & Info */}
                <div className="space-y-6">
                    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border-0">
                        <CardHeader className="bg-navy-dark text-white p-8">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-white/10 flex items-center justify-center font-black text-3xl mb-4 border border-white/10 backdrop-blur-sm">
                                {profile.full_name?.substring(0, 2).toUpperCase() || 'AP'}
                            </div>
                            <CardTitle className="text-2xl font-black">{profile.full_name}</CardTitle>
                            <div className="flex items-center gap-2 text-white/70 text-sm font-medium mt-1">
                                <Clock className="h-4 w-4" />
                                Son görülme: {profile.last_seen ? new Date(profile.last_seen).toLocaleString('tr-TR') : 'Hiç görülmedi'}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-navy-dark group-hover:scale-110 transition-transform">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">E-posta</span>
                                    <span className="font-bold text-navy-dark break-all">{profile.email || 'Girilmemiş'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-navy-dark group-hover:scale-110 transition-transform">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Telefon</span>
                                    <span className="font-bold text-navy-dark">{profile.phone || 'Girilmemiş'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-navy-dark group-hover:scale-110 transition-transform">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Kayıt Tarihi</span>
                                    <span className="font-bold text-navy-dark">{new Date(profile.created_at).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-slate-100 shadow-sm border flex flex-col gap-2 p-8">
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 flex items-center gap-2">
                            <ShieldAlert className="h-3 w-3" /> Mevcut Atamalar
                        </h4>

                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                                        <Briefcase className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest font-black text-blue-400">Danışman</span>
                                        <span className="font-bold text-navy-dark">{advisorName || 'Atanmamış'}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-100">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest font-black text-indigo-400">Paket</span>
                                        <span className="font-bold text-navy-dark uppercase">{profile.active_package || 'Paket Yok'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Tabs & Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="applications" className="w-full">
                        <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm mb-6 flex h-14 w-full md:w-auto">
                            <TabsTrigger value="applications" className="flex-1 rounded-xl data-[state=active]:bg-navy-dark data-[state=active]:text-white font-bold transition-all px-6">
                                Başvurular ({applications.length})
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="flex-1 rounded-xl data-[state=active]:bg-navy-dark data-[state=active]:text-white font-bold transition-all px-6">
                                Notlar
                            </TabsTrigger>
                            <TabsTrigger value="logs" className="flex-1 rounded-xl data-[state=active]:bg-navy-dark data-[state=active]:text-white font-bold transition-all px-6">
                                Sistem Logları
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="applications" className="animate-in slide-in-from-bottom-2 duration-300">
                            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border">
                                <div className="p-8 border-b border-slate-100">
                                    <h3 className="text-xl font-black text-navy-dark">Vize Başvuru Geçmişi</h3>
                                    <p className="text-sm text-slate-500 font-medium">Bu kullanıcıya ait tüm aktif ve geçmiş başvurular.</p>
                                </div>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50 border-y border-slate-100">
                                            <TableRow>
                                                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-8 h-12">Başvuru ID</TableHead>
                                                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-8 h-12">Ülke & Tür</TableHead>
                                                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-8 h-12">Tarih</TableHead>
                                                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-8 h-12">Durum</TableHead>
                                                <TableHead className="text-right px-8"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {applications.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium italic">
                                                        Henüz bir başvuru yapılmamış.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                applications.map((app) => (
                                                    <TableRow key={app.id} className="group hover:bg-slate-50 transition-colors">
                                                        <TableCell className="font-mono text-xs px-8 py-4">{app.id.substring(0, 8)}</TableCell>
                                                        <TableCell className="px-8 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-navy-dark">{app.destination}</span>
                                                                <span className="text-xs text-slate-500 font-medium">{app.visa_type}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-slate-600 px-8 py-4">
                                                            {app.created_at ? new Date(app.created_at).toLocaleDateString('tr-TR') : '-'}
                                                        </TableCell>
                                                        <TableCell className="px-8 py-4">
                                                            <Badge
                                                                variant="outline"
                                                                className={`
                                  font-bold px-3 py-1 rounded-lg border
                                  ${app.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                        app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                                            'bg-blue-50 text-blue-600 border-blue-200'}
                                `}
                                                            >
                                                                {app.status === 'completed' ? 'Tamamlandı' :
                                                                    app.status === 'rejected' ? 'Reddedildi' :
                                                                        app.status === 'pending_review' ? 'İncelemede' :
                                                                            app.status === 'pending_documents' ? 'Belge Bekliyor' :
                                                                                'Aktif'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right px-8 py-4">
                                                            <Button variant="ghost" size="sm" className="font-bold text-navy-dark hover:bg-white hover:shadow-sm" onClick={() => navigate(`/admin/applications`)}>
                                                                Detaya Git <ExternalLink className="ml-2 h-3 w-3" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notes" className="animate-in slide-in-from-bottom-2 duration-300">
                            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border p-8">
                                <h3 className="text-xl font-black text-navy-dark mb-4">Müşteri Notları</h3>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 italic text-slate-500">
                                    {profile.notes || "Henüz bir not eklenmemiş."}
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="logs" className="animate-in slide-in-from-bottom-2 duration-300">
                            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border p-8">
                                <h3 className="text-xl font-black text-navy-dark mb-4">Son İşlemler</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4 items-start pb-4 border-b border-slate-50">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-bold text-navy-dark">Hesap oluşturuldu</p>
                                            <p className="text-xs text-slate-500 font-medium">{new Date(profile.created_at).toLocaleString('tr-TR')}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomerDetail;
