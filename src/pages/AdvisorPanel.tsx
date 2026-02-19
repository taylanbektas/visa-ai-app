import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  User,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Zap,
  Calendar,
  Plus,
  Trash2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { MessageCenter } from "@/components/MessageCenter";

// Types
type Application = {
  id: string;
  applicant_name: string;
  passport_type: string;
  destination_country: string;
  visa_type: string;
  status: string;
  created_at: string;
  assigned_to?: string;
  user_id: string; // Needed for messaging
  phone?: string | null;
};

type Consultation = {
  id: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  customer_name?: string;
  is_advisor_request?: boolean;
};

type Availability = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export default function AdvisorPanel() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isModerator, loading: roleLoading } = useUserRole(); // Fixed lint
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | applications | messages | profile
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    pendingMessages: 0,
    totalRevenue: 0,
    activeApps: 0,
    pendingConsultations: 0
  });

  // Profile Form State
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    bio: "",
    photo_url: "",
    specialties: [] as string[]
  });

  const SPECIALTIES_LIST = ["Schengen", "ABD", "İngiltere", "Kanada", "Dubai", "Öğrenci Vizesi", "Turistik", "Ticari"];

  // Messaging state
  const [selectedChatUser, setSelectedChatUser] = useState<{ id: string, name: string } | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [advisorId, setAdvisorId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || roleLoading) return;

    // Redirect if not advisor or admin
    if (!user) {
      navigate("/login");
      return;
    }
    // Allow moderators (advisors) and admins
    if (!isModerator && !isAdmin) {
      navigate("/dashboard");
      return;
    }

    fetchData();
  }, [user, authLoading, roleLoading, isModerator, isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);

    // 1. Get my advisor record first (to get the correct ID, not auth user_id)
    const { data: advisorData } = await supabase
      .from('advisors')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (advisorData) {
      // Pre-fill form
      setFormData({
        email: advisorData.email || "",
        phone: advisorData.phone || "",
        bio: advisorData.bio || "",
        photo_url: advisorData.photo_url || "",
        specialties: advisorData.specializations || []
      });

      setAdvisorId(advisorData.id);

      // 2. Fetch assigned users from profiles using the correct advisor ID
      const { data: assignedUsers } = await supabase
        .from("profiles")
        .select("*")
        .eq("assigned_advisor_id", advisorData.id);

      if (assignedUsers) {
        const mappedApps = assignedUsers.map(p => ({
          id: p.id,
          applicant_name: p.full_name || 'İsimsiz',
          passport_type: '-',
          destination_country: '-',
          visa_type: '-',
          status: 'Atandı',
          created_at: p.created_at,
          user_id: p.user_id,
          phone: p.phone
        }));
        setApplications(mappedApps);

        // Fetch pending messages count
        let pendingCount = 0;
        for (const app of mappedApps) {
          const { data: latestMsg } = await supabase
            .from('messages')
            .select('sender_id')
            .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${app.user_id}),and(sender_id.eq.${app.user_id},recipient_id.eq.${user?.id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestMsg && latestMsg.sender_id !== user?.id) {
            pendingCount++;
          }
        }

        // Fetch completed applications
        const userAuthIds = assignedUsers.map(u => u.user_id);
        const { count: completedCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('user_id', userAuthIds)
          .eq('status', 'completed');

        setStats({
          assigned: assignedUsers.length,
          completed: completedCount || 0,
          pendingMessages: pendingCount,
          totalRevenue: (completedCount || 0) * 3500,
          activeApps: assignedUsers.length - (completedCount || 0),
          pendingConsultations: 0 // Will be updated below
        });

        // 3. Fetch consultations
        const { data: consData } = await supabase
          .from('consultations' as any)
          .select('*, profiles(full_name)')
          .eq('advisor_id', advisorData.id)
          .order('start_time', { ascending: true });

        if (consData) {
          setConsultations(consData.map((c: any) => ({
            ...c,
            customer_name: c.profiles?.full_name || 'Müşteri'
          })));

          const pendingCons = consData.filter((c: any) => c.status === 'pending').length;
          setStats(prev => ({ ...prev, pendingConsultations: pendingCons }));
        }

        // 4. Fetch availability
        const { data: availData } = await supabase
          .from('advisor_availability' as any)
          .select('*')
          .eq('advisor_id', advisorData.id)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true }) as { data: any[] | null };

        if (availData) {
          setAvailability(availData);
        }
      }
    }

    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `advisor-photos/${user.id}/${Date.now()}.${fileExt}`;

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

    setFormData(prev => ({ ...prev, photo_url: publicUrl }));
    setUploading(false);
    toast({ title: "Fotoğraf yüklendi", description: "Lütfen profili kaydetmeyi unutmayın." });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates = {
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      photo_url: formData.photo_url,
      specializations: formData.specialties,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('advisors')
      .update(updates)
      .eq('user_id', user!.id);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Profil bilgileriniz güncellendi." });
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => {
      const current = prev.specialties || [];
      if (current.includes(specialty)) {
        return { ...prev, specialties: current.filter(s => s !== specialty) };
      } else {
        return { ...prev, specialties: [...current, specialty] };
      }
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleUpdateConsultationStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('consultations' as any)
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Görüşme durumu güncellendi." });
      fetchData();
    }
  };

  const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const [newAvail, setNewAvail] = useState({ day: 1, start: "09:00", end: "17:00" });

  const handleAddAvailability = async () => {
    if (!advisorId) return;
    const { error } = await supabase
      .from('advisor_availability' as any)
      .insert({
        advisor_id: advisorId,
        day_of_week: newAvail.day,
        start_time: newAvail.start,
        end_time: newAvail.end
      });

    if (error) {
      toast({ title: "Hata", description: "Müsaitlik eklenemedi: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Müsaitlik eklendi." });
      fetchData();
    }
  };

  const handleRemoveAvailability = async (id: string) => {
    const { error } = await supabase
      .from('advisor_availability' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Müsaitlik kaldırıldı." });
      fetchData();
    }
  };

  if (authLoading || roleLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <SidebarProvider style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        <Sidebar className="border-r border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-100 px-10 py-10">
            <h2 className="text-3xl font-black tracking-tight text-navy-dark px-2">VisaPath <span className="text-emerald-500 font-extrabold uppercase text-xs tracking-[0.2em] block mt-1">Advisor Portal</span></h2>
          </SidebarHeader>
          <SidebarContent className="px-6 py-6 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Yönetim Paneli</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-4">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'dashboard'}
                      onClick={() => setActiveTab('dashboard')}
                      size="lg"
                      className="rounded-2xl h-16 gap-4 font-bold transition-all hover:translate-x-1"
                    >
                      <LayoutDashboard className={activeTab === 'dashboard' ? 'text-emerald-600 w-6 h-6' : 'text-slate-400 w-6 h-6'} />
                      <span className={activeTab === 'dashboard' ? 'text-navy-dark text-lg' : 'text-slate-500 text-lg'}>Panel Özeti</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'applications'}
                      onClick={() => setActiveTab('applications')}
                      size="lg"
                      className="rounded-2xl h-16 gap-4 font-bold transition-all hover:translate-x-1"
                    >
                      <User className={activeTab === 'applications' ? 'text-emerald-600 w-6 h-6' : 'text-slate-400 w-6 h-6'} />
                      <span className={activeTab === 'applications' ? 'text-navy-dark text-lg' : 'text-slate-500 text-lg'}>Müşterilerim</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'messages'}
                      onClick={() => setActiveTab('messages')}
                      size="lg"
                      className="rounded-2xl h-16 gap-4 font-bold transition-all hover:translate-x-1"
                    >
                      <MessageSquare className={activeTab === 'messages' ? 'text-emerald-600 w-6 h-6' : 'text-slate-400 w-6 h-6'} />
                      <span className={activeTab === 'messages' ? 'text-navy-dark text-lg' : 'text-slate-500 text-lg'}>Mesajlar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'bookings'}
                      onClick={() => setActiveTab('bookings')}
                      size="lg"
                      className="rounded-2xl h-16 gap-4 font-bold transition-all hover:translate-x-1"
                    >
                      <Calendar className={activeTab === 'bookings' ? 'text-emerald-600 w-6 h-6' : 'text-slate-400 w-6 h-6'} />
                      <span className={activeTab === 'bookings' ? 'text-navy-dark text-lg' : 'text-slate-500 text-lg'}>Görüşmeler</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'profile'}
                      onClick={() => setActiveTab('profile')}
                      size="lg"
                      className="rounded-2xl h-16 gap-4 font-bold transition-all hover:translate-x-1"
                    >
                      <User className={activeTab === 'profile' ? 'text-emerald-600 w-6 h-6' : 'text-slate-400 w-6 h-6'} />
                      <span className={activeTab === 'profile' ? 'text-navy-dark text-lg' : 'text-slate-500 text-lg'}>Profilim</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto pt-10 pb-8 px-4 space-y-4">
              <Button
                variant="ghost"
                className="w-full h-16 justify-start text-navy-dark hover:bg-slate-100 rounded-2xl font-extrabold text-lg transition-all group border border-transparent hover:border-slate-200"
                onClick={() => setActiveTab('profile')}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                  <User className="h-5 w-5 text-navy-dark" />
                </div>
                Panelim
              </Button>
              <Button
                variant="outline"
                className="w-full h-16 justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100 shadow-sm rounded-2xl font-extrabold text-lg transition-all active:scale-[0.98]"
                onClick={handleSignOut}
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100/50 flex items-center justify-center mr-4">
                  <LogOut className="h-5 w-5" />
                </div>
                Çıkış Yap
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 lg:p-12 pt-24 md:pt-12 overflow-auto max-w-[1800px] mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h1 className="text-5xl font-black text-navy-dark mb-3 tracking-tight">Merhaba, {user?.user_metadata?.full_name || 'Danışman'} 👋</h1>
                <p className="text-xl text-slate-500 font-medium">Şu anda sistemde <strong className="text-navy-dark font-black">{stats.assigned}</strong> aktif müşteriden sorumlusunuz.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] shadow-xl shadow-blue-200/50 flex flex-col justify-between hover:scale-[1.02] transition-all cursor-default text-white overflow-hidden relative group">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-8">
                    <User size={32} />
                  </div>
                  <div>
                    <p className="text-6xl font-black tracking-tighter">{stats.assigned}</p>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mt-2">Toplam Müşteri</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-200/50 flex flex-col justify-between hover:scale-[1.02] transition-all cursor-default text-white overflow-hidden relative group">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-8">
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <p className="text-6xl font-black tracking-tighter">{stats.pendingMessages}</p>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mt-2">Bekleyen Mesaj</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-600 to-violet-700 p-8 rounded-[2.5rem] shadow-xl shadow-violet-200/50 flex flex-col justify-between hover:scale-[1.02] transition-all cursor-default text-white overflow-hidden relative group">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-8">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <p className="text-6xl font-black tracking-tighter">{stats.completed}</p>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mt-2">Tamamlanan İşlem</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-3xl font-black text-navy-dark tracking-tight">Gelir Analizi</h3>
                      <p className="text-lg text-slate-500 font-medium mt-1">Haftalık performans raporu</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-6 py-2 rounded-full text-sm font-black ring-8 ring-emerald-50/50">Yüksek Performans</Badge>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Pzt', revenue: 4000 },
                        { name: 'Sal', revenue: 7000 },
                        { name: 'Çar', revenue: 5000 },
                        { name: 'Per', revenue: 12000 },
                        { name: 'Cum', revenue: 8000 },
                        { name: 'Cmt', revenue: 15000 },
                        { name: 'Paz', revenue: 10000 },
                      ]}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 600 }} dy={10} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between translate-y-0 hover:-translate-y-2 transition-transform duration-300">
                  <div>
                    <h3 className="text-2xl font-black text-navy-dark mb-8 tracking-tight">Özet Veriler</h3>
                    <div className="space-y-6">
                      <div className="group">
                        <div className="flex justify-between items-center mb-2 px-2">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Tahmini Gelir</span>
                          <span className="text-emerald-600 font-black text-xl">₺{stats.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[75%] transition-all duration-1000"></div>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex justify-between items-center mb-2 px-2">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Aktif İşlemler</span>
                          <span className="text-blue-600 font-black text-xl">{stats.activeApps}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full w-[45%] transition-all duration-1000"></div>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex justify-between items-center mb-2 px-2">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Onay Oranı</span>
                          <span className="text-violet-600 font-black text-xl">%92</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full w-[92%] transition-all duration-1000"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-10 h-16 rounded-[1.5rem] bg-navy-dark text-white font-black text-lg hover:shadow-2xl hover:shadow-navy-dark/30 transition-all active:scale-[0.98]">
                    Detaylı Rapor Al
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-4xl font-black text-navy-dark tracking-tight">Müşterilerim</h2>
                <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-6 py-2 rounded-full font-bold">{applications.length} Kayıt</Badge>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="py-6 px-8 text-slate-400 font-bold uppercase tracking-widest text-xs">Başvuru No</TableHead>
                      <TableHead className="py-6 text-slate-400 font-bold uppercase tracking-widest text-xs">Müşteri</TableHead>
                      <TableHead className="py-6 text-slate-400 font-bold uppercase tracking-widest text-xs">Detaylar</TableHead>
                      <TableHead className="py-6 text-slate-400 font-bold uppercase tracking-widest text-xs">Durum</TableHead>
                      <TableHead className="py-6 px-8 text-right text-slate-400 font-bold uppercase tracking-widest text-xs">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                        <TableCell className="font-mono text-xs py-6 px-8 text-slate-400">{app.id.substring(0, 8)}</TableCell>
                        <TableCell className="font-black text-navy-dark py-6 text-lg">{app.applicant_name}</TableCell>
                        <TableCell className="py-6">
                          <div className="text-base font-bold text-slate-600">{app.destination_country}</div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{app.visa_type}</div>
                        </TableCell>
                        <TableCell className="py-6">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1 rounded-full font-bold">{app.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right py-6 px-8">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="lg" className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 px-6" onClick={() => {
                              setActiveTab('messages');
                              setSelectedChatUser({ id: app.user_id, name: app.applicant_name });
                            }}>
                              Mesaj At
                            </Button>
                            {app.phone && (
                              <Button size="lg" variant="ghost" className="rounded-xl h-12 w-12 p-0 text-slate-400 hover:text-navy-dark hover:bg-white border border-transparent hover:border-slate-200" onClick={() => window.open(`tel:${app.phone}`)}>
                                <Zap size={20} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="h-[calc(100vh-8rem)] bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex overflow-hidden animate-in fade-in duration-500">
              <div className="w-1/3 border-r border-slate-100 bg-slate-50/30 p-8">
                <h3 className="text-2xl font-black text-navy-dark mb-8 tracking-tight">Görüşmeler</h3>
                <div className="space-y-4">
                  {applications.map(app => (
                    <div
                      key={app.id}
                      className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 ${selectedChatUser?.id === app.user_id ? 'bg-white shadow-xl shadow-slate-200/50 scale-[1.02] border border-emerald-100' : 'hover:bg-white hover:shadow-lg hover:shadow-slate-200/30'}`}
                      onClick={() => setSelectedChatUser({ id: app.user_id, name: app.applicant_name })}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-dark to-navy-light text-white flex items-center justify-center font-black text-lg">
                          {app.applicant_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-lg font-black text-navy-dark truncate">{app.applicant_name}</p>
                          <p className="text-sm font-bold text-slate-400 truncate uppercase tracking-wider">{app.destination_country}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {applications.length === 0 && <p className="text-center py-20 text-slate-400 font-bold">Aktif görüşme bulunmuyor.</p>}
                </div>
              </div>

              <div className="flex-1 bg-white">
                {selectedChatUser ? (
                  <MessageCenter
                    currentUserId={user!.id}
                    targetUserId={selectedChatUser.id}
                    targetUserName={selectedChatUser.name}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <MessageSquare size={64} className="opacity-20" />
                    </div>
                    <p className="text-xl font-bold">Mesajlaşmak için bir müşteri seçin.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
              <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500"></div>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-black text-navy-dark tracking-tight">{user?.user_metadata?.full_name || 'Danışman'}</h2>
                  <p className="text-lg text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Kıdemli Vize Danışmanı</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-10">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-4 border-slate-100 flex items-center justify-center overflow-hidden relative group shadow-inner">
                      {formData.photo_url ? (
                        <img src={formData.photo_url} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-slate-200 w-20 h-20" />
                      )}
                      <label className="absolute inset-0 bg-navy-dark/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                        {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white w-8 h-8" />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                      </label>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fotoğrafı Değiştir</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-black text-navy-dark uppercase tracking-widest ml-1">E-posta Adresi</Label>
                      <Input
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-lg font-bold px-6"
                        placeholder="contact@visapath.com"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-black text-navy-dark uppercase tracking-widest ml-1">Telefon Numarası</Label>
                      <Input
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-lg font-bold px-6"
                        placeholder="+90 555 ..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-black text-navy-dark uppercase tracking-widest ml-1">Uzmanlık Alanları</Label>
                    <div className="flex flex-wrap gap-3">
                      {SPECIALTIES_LIST.map(specialty => (
                        <Badge
                          key={specialty}
                          variant={formData.specialties?.includes(specialty) ? "default" : "outline"}
                          className={`px-6 py-3 rounded-2xl cursor-pointer transition-all text-sm font-bold ${formData.specialties?.includes(specialty) ? "bg-navy-dark border-transparent scale-105 shadow-xl shadow-navy-dark/20" : "bg-white border-slate-100 hover:border-slate-300"}`}
                          onClick={() => toggleSpecialty(specialty)}
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-black text-navy-dark uppercase tracking-widest ml-1">Hakkımda</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Deneyimlerinizi ve danışanlarınıza yaklaşımınızı anlatın..."
                      className="min-h-[200px] rounded-[2rem] border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-lg font-medium p-8 leading-relaxed"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl h-20 rounded-[2rem] shadow-xl shadow-emerald-200/50 transition-all active:scale-[0.99] mt-6">
                    Profilimi Güncelle
                  </Button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Consultations Lists */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black text-navy-dark mb-8 tracking-tight flex items-center gap-2">
                      <Clock className="text-blue-500" /> Bekleyen Talepler
                      {stats.pendingConsultations > 0 && <Badge className="ml-2 bg-blue-500">{stats.pendingConsultations}</Badge>}
                    </h3>
                    <div className="space-y-4">
                      {consultations.filter(c => c.status === 'pending').map(c => (
                        <div key={c.id} className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between border border-slate-100 hover:border-blue-200 transition-colors">
                          <div>
                            <p className="font-black text-navy-dark text-lg">{c.customer_name}</p>
                            <p className="text-slate-500 font-bold text-sm">
                              {format(new Date(c.start_time), 'd MMMM yyyy, EEEE', { locale: tr })}
                            </p>
                            <p className="text-blue-600 font-black text-sm uppercase tracking-wider mt-1">
                              {format(new Date(c.start_time), 'HH:mm')} - {format(new Date(c.end_time), 'HH:mm')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdateConsultationStatus(c.id, 'confirmed')} className="bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold h-12 px-6">Onayla</Button>
                            <Button onClick={() => handleUpdateConsultationStatus(c.id, 'rejected')} variant="outline" className="text-rose-600 border-rose-100 hover:bg-rose-50 rounded-xl font-bold h-12 px-6">Reddet</Button>
                          </div>
                        </div>
                      ))}
                      {consultations.filter(c => c.status === 'pending').length === 0 && (
                        <p className="text-center py-10 text-slate-400 font-bold">Bekleyen randevu talebi bulunmuyor.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black text-navy-dark mb-8 tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500" /> Onaylanmış Görüşmeler
                    </h3>
                    <div className="space-y-4">
                      {consultations.filter(c => c.status === 'confirmed').map(c => (
                        <div key={c.id} className="p-6 bg-white rounded-3xl flex items-center justify-between border border-slate-100">
                          <div>
                            <p className="font-black text-navy-dark text-lg">{c.customer_name}</p>
                            <p className="text-slate-500 font-bold text-sm">
                              {format(new Date(c.start_time), 'd MMMM yyyy, EEEE', { locale: tr })}
                            </p>
                            <p className="text-emerald-600 font-black text-sm uppercase tracking-wider mt-1">
                              {format(new Date(c.start_time), 'HH:mm')} - {format(new Date(c.end_time), 'HH:mm')}
                            </p>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-1 rounded-full font-bold">Onaylandı</Badge>
                        </div>
                      ))}
                      {consultations.filter(c => c.status === 'confirmed').length === 0 && (
                        <p className="text-center py-10 text-slate-400 font-bold">Yaklaşan onaylı görüşme bulunmuyor.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Availability Settings */}
                <div className="space-y-8">
                  <div className="bg-navy-dark p-8 rounded-[2.5rem] text-white shadow-xl shadow-navy-dark/20">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                      <Zap className="text-emerald-400" /> Uygunluk Tanımla
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Gün</Label>
                        <select
                          value={newAvail.day}
                          onChange={e => setNewAvail({ ...newAvail, day: parseInt(e.target.value) })}
                          className="w-full bg-white/10 border-white/20 rounded-xl h-12 px-4 text-white font-bold outline-none focus:ring-2 ring-emerald-400/50"
                        >
                          {dayNames.map((name, i) => <option key={i} value={i} className="text-navy-dark">{name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Başlangıç</Label>
                          <Input
                            type="time"
                            value={newAvail.start}
                            onChange={e => setNewAvail({ ...newAvail, start: e.target.value })}
                            className="bg-white/10 border-white/20 h-12 text-white font-bold rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Bitiş</Label>
                          <Input
                            type="time"
                            value={newAvail.end}
                            onChange={e => setNewAvail({ ...newAvail, end: e.target.value })}
                            className="bg-white/10 border-white/20 h-12 text-white font-bold rounded-xl"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddAvailability} className="w-full bg-emerald-500 hover:bg-emerald-600 h-14 rounded-xl font-black gap-2 transition-all active:scale-[0.98]">
                        <Plus size={20} /> Ekle
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-navy-dark mb-6">Mevcut Uygunluklar</h3>
                    <div className="space-y-3">
                      {availability.map(a => (
                        <div key={a.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group">
                          <div>
                            <p className="font-black text-navy-dark text-sm">{dayNames[a.day_of_week]}</p>
                            <p className="text-slate-500 font-bold text-xs">{a.start_time.substring(0, 5)} - {a.end_time.substring(0, 5)}</p>
                          </div>
                          <Button onClick={() => handleRemoveAvailability(a.id)} variant="ghost" size="icon" className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      ))}
                      {availability.length === 0 && <p className="text-center text-slate-400 text-xs font-bold py-6">Müsaitlik tanımlanmamış.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
