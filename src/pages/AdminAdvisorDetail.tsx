
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Briefcase,
    Mail,
    Phone,
    Star,
    Users,
    ShieldCheck,
    Loader2,
    ExternalLink,
    CheckCircle,
    XCircle
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

interface Advisor {
    id: string;
    user_id: string;
    full_name?: string;
    email: string | null;
    phone: string | null;
    bio: string | null;
    specializations: string[] | null;
    is_active: boolean | null;
    rating?: string;
    review_count?: number;
    created_at: string | null;
}

interface AssignedCustomer {
    id: string;
    full_name: string | null;
    phone: string | null;
    email: string | null;
}

const AdminAdvisorDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [advisor, setAdvisor] = useState<Advisor | null>(null);
    const [customers, setCustomers] = useState<AssignedCustomer[]>([]);

    useEffect(() => {
        if (id) {
            fetchAdvisorData();
        }
    }, [id]);

    const fetchAdvisorData = async () => {
        setLoading(true);
        try {
            // Fetch advisor record
            const { data: advisorData, error: advisorError } = await supabase
                .from("advisors")
                .select("*")
                .eq("id", id)
                .single();

            if (advisorError) throw advisorError;

            // Fetch profile to get name and phone
            const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name, phone")
                .eq("user_id", advisorData.user_id)
                .single();

            const fullAdvisor: Advisor = {
                ...advisorData,
                full_name: profileData?.full_name || 'Danışman',
                phone: profileData?.phone || advisorData.phone,
                rating: "5.0", // Mock for now
                review_count: 0 // Mock for now
            };
            setAdvisor(fullAdvisor);

            // Fetch assigned customers
            const { data: customersData } = await supabase
                .from("profiles")
                .select("id, full_name, phone, user_id")
                .eq("assigned_advisor_id", advisorData.id);

            if (customersData) {
                setCustomers(customersData as unknown as AssignedCustomer[]);
            }

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Danışman verileri yüklenirken bir sorun oluştu."
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!advisor) return;
        const newStatus = !advisor.is_active;

        const { error } = await supabase
            .from("advisors")
            .update({ is_active: newStatus })
            .eq("id", advisor.id);

        if (error) {
            toast({ variant: "destructive", title: "Hata", description: "İşlem başarısız oldu." });
        } else {
            setAdvisor({ ...advisor, is_active: newStatus });
            toast({ title: "Başarılı", description: newStatus ? "Danışman aktif edildi." : "Danışman askıya alındı." });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-navy-dark h-8 w-8" />
            </div>
        );
    }

    if (!advisor) {
        return (
            <div className="p-8 text-center bg-slate-50 min-h-screen">
                <h2 className="text-2xl font-bold text-navy-dark">Danışman bulunamadı.</h2>
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
                                {advisor.full_name}
                            </h1>
                            <Badge variant={advisor.is_active ? "default" : "secondary"} className="font-bold">
                                {advisor.is_active ? "AKTİF" : "PASİF"}
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-medium">Danışman Detay Sayfası</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={advisor.is_active ? "outline" : "default"}
                        className={advisor.is_active ? "border-orange-200 text-orange-600 hover:bg-orange-50 font-bold" : "bg-emerald-600 hover:bg-emerald-700 font-bold"}
                        onClick={handleToggleStatus}
                    >
                        {advisor.is_active ? "Askıya Al" : "Erişimi Aç"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Stats & Info */}
                <div className="space-y-6">
                    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border-0">
                        <CardHeader className="bg-navy-dark text-white p-8">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-white/10 flex items-center justify-center font-black text-3xl mb-4 border border-white/10 backdrop-blur-sm">
                                {advisor.full_name?.substring(0, 2).toUpperCase() || 'AD'}
                            </div>
                            <CardTitle className="text-2xl font-black">{advisor.full_name}</CardTitle>
                            <div className="flex items-center gap-2 text-white/70 text-sm font-medium mt-1">
                                <ShieldCheck className="h-4 w-4" />
                                Vize Danışmanı Uzmanı
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-navy-dark group-hover:scale-110 transition-transform">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">E-posta</span>
                                    <span className="font-bold text-navy-dark break-all">{advisor.email || 'Girilmemiş'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-navy-dark group-hover:scale-110 transition-transform">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Telefon</span>
                                    <span className="font-bold text-navy-dark">{advisor.phone || 'Girilmemiş'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-navy-dark group-hover:scale-110 transition-transform">
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Değerlendirme</span>
                                    <span className="font-bold text-navy-dark">{advisor.rating} ({advisor.review_count} yorum)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-slate-100 shadow-sm border p-8">
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4 flex items-center gap-2">
                            <Briefcase className="h-3 w-3" /> Uzmanlık Alanları
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {advisor.specializations?.length ? advisor.specializations.map((spec, i) => (
                                <Badge key={i} variant="secondary" className="bg-slate-100 text-navy-dark font-bold px-3 py-1">
                                    {spec}
                                </Badge>
                            )) : (
                                <span className="text-sm text-slate-400 italic">Uzmanlık alanı belirtilmemiş.</span>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column - Tabs & Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="customers" className="w-full">
                        <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm mb-6 flex h-14 w-full md:w-auto">
                            <TabsTrigger value="customers" className="flex-1 rounded-xl data-[state=active]:bg-navy-dark data-[state=active]:text-white font-bold transition-all px-6">
                                Danışanlar ({customers.length})
                            </TabsTrigger>
                            <TabsTrigger value="bio" className="flex-1 rounded-xl data-[state=active]:bg-navy-dark data-[state=active]:text-white font-bold transition-all px-6">
                                Biyografi
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="customers" className="animate-in slide-in-from-bottom-2 duration-300">
                            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border">
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black text-navy-dark">Atanmış Müşteriler</h3>
                                        <p className="text-sm text-slate-500 font-medium">Bu danışmanın sorumlu olduğu tüm aktif danışanlar.</p>
                                    </div>
                                    <Users className="h-8 w-8 text-slate-200" />
                                </div>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50 border-y border-slate-100">
                                            <TableRow>
                                                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-8 h-12">Müşteri</TableHead>
                                                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-8 h-12">İletişim</TableHead>
                                                <TableHead className="text-right px-8"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-12 text-slate-400 font-medium italic">
                                                        Henüz bir müşteri atanmamış.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                customers.map((cust) => (
                                                    <TableRow key={cust.id} className="group hover:bg-slate-50 transition-colors">
                                                        <TableCell className="px-8 py-4">
                                                            <span className="font-bold text-navy-dark">{cust.full_name || 'İsimsiz'}</span>
                                                        </TableCell>
                                                        <TableCell className="px-8 py-4">
                                                            <div className="flex flex-col text-sm">
                                                                <span className="font-medium text-slate-600">{cust.phone || '-'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right px-8 py-4">
                                                            <Button variant="ghost" size="sm" className="font-bold text-navy-dark hover:bg-white hover:shadow-sm" onClick={() => navigate(`/admin/customer/${cust.id}`)}>
                                                                İncele <ExternalLink className="ml-2 h-3 w-3" />
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

                        <TabsContent value="bio" className="animate-in slide-in-from-bottom-2 duration-300">
                            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border p-8">
                                <h3 className="text-xl font-black text-navy-dark mb-4">Hakkında / Biyografi</h3>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {advisor.bio || "Biyografi bilgisi bulunmamaktadır."}
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default AdminAdvisorDetail;
