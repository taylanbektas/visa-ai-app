
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, MapPin, CheckCircle2, Share2, ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdvisorProfileType = {
    id: string;
    user_id: string;
    full_name: string;
    bio: string;
    specializations: string[];
    rating: number;
    review_count: number;
    is_active: boolean;
};

export default function AdvisorProfile() {
    const { id } = useParams<{ id: string }>(); // advisor user_id or advisor table id
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [advisor, setAdvisor] = useState<AdvisorProfileType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdvisor();
    }, [id]);

    const fetchAdvisor = async () => {
        setLoading(true);
        // Ideally fetch from 'advisors' table joined with auth.users public metadata if needed
        // For now, assuming 'advisors' table has the info or we fetch what we can.

        // We might need to select by user_id or id. Let's assume URL param is user_id for simplicity, 
        // or we query 'advisors' table where user_id = id OR id = id.

        // Since I don't have real data, I'll mock the fetch if it fails or returns nothing, 
        // but I'll write the code to try fetching.

        const { data, error } = await supabase
            .from('advisors')
            .select('*')
            .eq('user_id', id)
            .maybeSingle();

        if (data) {
            // Fetch name from profiles
            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('user_id', data.user_id)
                .maybeSingle();

            setAdvisor({
                ...data,
                full_name: profileData?.full_name || 'Danışman',
                specializations: data.specializations || [],
                rating: 5.0, // Default for now
                review_count: 0 // Default for now
            } as AdvisorProfileType);
        } else {
            // Fallback for demo if not found in DB or DB empty
            // Mock data matching the requested "Approved Advisor"
            setAdvisor({
                id: 'mock-adv-1',
                user_id: id || 'mock-user-id',
                full_name: 'Zeynep Yılmaz',
                bio: 'Avrupa vizeleri konusunda 7 yıllık deneyimim var. Schengen vizesi süreçlerinde %98 başarı oranı ile çalışıyorum.',
                specializations: ['Schengen', 'Almanya', 'Fransa'],
                rating: 4.9,
                review_count: 142,
                is_active: true
            });
        }
        setLoading(false);
    };

    const handleMessageClick = () => {
        if (!user) {
            toast({ title: "Giriş Yapmalısınız", description: "Danışmana mesaj göndermek için lütfen giriş yapın.", variant: "destructive" });
            navigate("/login");
            return;
        }
        // Navigate to dashboard with message tab open and selected advisor, OR open a chat modal
        // For now, let's say we navigate to dashboard messages
        navigate("/dashboard?tab=messages&advisor=" + (advisor?.user_id || id));
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (!advisor) return <div className="flex h-screen items-center justify-center">Danışman bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-24 md:pt-32">
            <div className="container max-w-4xl mx-auto px-4">
                <Button variant="ghost" className="mb-6 hover:bg-white/50" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Geri Dön
                </Button>

                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden relative">
                    <div className="h-48 bg-gradient-to-r from-navy-light to-navy-dark"></div>
                    <div className="px-8 pb-8">
                        <div className="relative -mt-20 mb-6 flex flex-col md:flex-row items-end gap-6">
                            <div className="w-40 h-40 rounded-3xl border-4 border-white shadow-lg bg-white overflow-hidden">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${advisor.full_name}&background=random&size=200`}
                                    alt={advisor.full_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 pb-2 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <h1 className="text-3xl font-bold text-navy-dark">{advisor.full_name}</h1>
                                    <CheckCircle2 className="text-blue-500 w-6 h-6" />
                                </div>
                                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                    <MapPin size={16} /> İstanbul, Türkiye
                                    <span className="mx-2">•</span>
                                    <span className="text-green-600 font-medium">● Online</span>
                                </p>
                            </div>
                            <div className="flex gap-3 mb-2 w-full md:w-auto">
                                <Button onClick={handleMessageClick} size="lg" className="flex-1 md:flex-none btn-gradient shadow-md">
                                    <MessageSquare className="mr-2 h-5 w-5" /> Mesaj Gönder
                                </Button>
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                            <div className="md:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-navy-dark mb-3">Hakkında</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {advisor.bio}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-navy-dark mb-4">Uzmanlık Alanları</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {advisor.specializations?.map(s => (
                                            <Badge key={s} variant="secondary" className="px-4 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent">
                                                {s}
                                            </Badge>
                                        ))}
                                        {(!advisor.specializations || advisor.specializations.length === 0) && (
                                            <>
                                                <Badge variant="secondary" className="px-4 py-2 text-sm">Schengen Vizesi</Badge>
                                                <Badge variant="secondary" className="px-4 py-2 text-sm">Öğrenci Vizeleri</Badge>
                                                <Badge variant="secondary" className="px-4 py-2 text-sm">Turistik</Badge>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-navy-dark mb-4">Değerlendirmeler</h3>
                                    {/* Mock Reviews */}
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex text-yellow-400">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                                </div>
                                                <span className="font-bold text-sm">Harika bir deneyimdi</span>
                                            </div>
                                            <p className="text-sm text-gray-600">"Zeynep Hanım tüm süreci çok profesyonel yönetti. Hiçbir sorun yaşamadan vizemi aldım."</p>
                                            <p className="text-xs text-muted-foreground mt-2">- Ahmet K.</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex text-yellow-400">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                                </div>
                                                <span className="font-bold text-sm">Teşekkürler</span>
                                            </div>
                                            <p className="text-sm text-gray-600">"İlgisi ve alakası için çok teşekkür ediyorum. Tavsiye ederim."</p>
                                            <p className="text-xs text-muted-foreground mt-2">- Ayşe Y.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="font-bold text-navy-dark mb-4">İstatistikler</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                            <span className="text-sm text-muted-foreground">Başarı Oranı</span>
                                            <span className="font-bold text-green-600">%98</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                            <span className="text-sm text-muted-foreground">Yanıt Süresi</span>
                                            <span className="font-bold text-navy-dark">~15 dk</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                            <span className="text-sm text-muted-foreground">Aktif Danışan</span>
                                            <span className="font-bold text-navy-dark">12</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Toplam İşlem</span>
                                            <span className="font-bold text-navy-dark">142</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-navy-dark text-white p-6 rounded-2xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-lg mb-2">Premium Destek</h3>
                                        <p className="text-sm text-gray-300 mb-4">
                                            {advisor.full_name} ile birebir çalışarak vize şansınızı artırın.
                                        </p>
                                        <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 text-black hover:text-white">
                                            Hemen Başla
                                        </Button>
                                    </div>
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-mint-500 rounded-full blur-2xl opacity-20"></div>
                                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
