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
  Trash2,
  Check
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
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [appDocs, setAppDocs] = useState<Record<string, any[]>>({});
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedAppForUpload, setSelectedAppForUpload] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState("");


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
      setAdvisorId(advisorData.id);

      // Pre-fill form
      setFormData({
        email: advisorData.email || "",
        phone: advisorData.phone || "",
        bio: advisorData.bio || "",
        photo_url: advisorData.photo_url || "",
        specialties: advisorData.specializations || []
      });

      // 2. Fetch assigned applications
      const { data: assignments } = await supabase
        .from('advisor_assignments')
        .select('application_id')
        .eq('advisor_id', advisorData.id);

      if (assignments && assignments.length > 0) {
        const appIds = assignments.map(a => a.application_id);
        const { data: appsData } = await supabase
          .from('applications')
          .select('*, profiles(full_name, phone)')
          .in('id', appIds);

        if (appsData) {
          const mappedApps = appsData.map((app: any) => ({
            id: app.id,
            applicant_name: app.profiles?.full_name || 'İsimsiz',
            passport_type: '-',
            destination_country: app.destination,
            visa_type: app.visa_type,
            status: app.status || 'Alındı',
            created_at: app.created_at,
            user_id: app.user_id,
            phone: app.profiles?.phone
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
          const completedApps = appsData.filter(a => a.status === 'Onaylandı' || a.status === 'Tamamlandı');

          setStats({
            assigned: appsData.length,
            completed: completedApps.length,
            pendingMessages: pendingCount,
            totalRevenue: (completedApps.length) * 3500,
            activeApps: appsData.length - completedApps.length,
            pendingConsultations: 0 // Will be updated below
          });

          // Fetch documents for these applications
          const { data: docsData } = await supabase
            .from('application_documents' as any)
            .select('*')
            .in('application_id', appIds);

          if (docsData) {
            const docMap: Record<string, any[]> = {};
            docsData.forEach((d: any) => {
              if (!docMap[d.application_id]) docMap[d.application_id] = [];
              docMap[d.application_id].push(d);
            });
            setAppDocs(docMap);
          }
        }
      }

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

      // 5. Fetch blocked slots
      const { data: blockedData } = await supabase
        .from('advisor_blocked_slots' as any)
        .select('*')
        .eq('advisor_id', advisorData.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true }) as { data: any[] | null };

      if (blockedData) {
        setBlockedSlots(blockedData);
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
  const [newAvail, setNewAvail] = useState({ days: [1], start: "09:00", end: "17:00", isBlocked: false });

  const handleAddAvailability = async () => {
    const aid = advisorId;
    if (!aid) return;

    if (newAvail.isBlocked) {
      // Logic for Blocked Slots (specific dates/times)
      // For now, let's treat these as one-off blocks or specific hour blocks
      // Implementing a simple block for today or recurring if needed
      // Actually, for consistency with the plan, let's just save as a blocked slot
      toast({ title: "Bilgi", description: "Meşgul saatler özelliği için lütfen tarih seçimi de ekleyin.", variant: "default" });
      return;
    }

    const inserts = newAvail.days.map(day => ({
      advisor_id: aid,
      day_of_week: day,
      start_time: newAvail.start,
      end_time: newAvail.end
    }));

    const { error } = await supabase
      .from('advisor_availability' as any)
      .insert(inserts);

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

  const [newBlocked, setNewBlocked] = useState({ date: format(new Date(), 'yyyy-MM-dd'), start: "09:00", end: "17:00" });

  const handleAddBlockedSlot = async () => {
    if (!advisorId) return;

    const startTime = new Date(`${newBlocked.date}T${newBlocked.start}`);
    const endTime = new Date(`${newBlocked.date}T${newBlocked.end}`);

    const { error } = await supabase
      .from('advisor_blocked_slots' as any)
      .insert({
        advisor_id: advisorId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        reason: 'Meşgul'
      });

    if (error) {
      toast({ title: "Hata", description: "Engel eklenemedi: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Tarih meşgul olarak işaretlendi." });
      fetchData();
    }
  };

  const handleRemoveBlockedSlot = async (id: string) => {
    const { error } = await supabase
      .from('advisor_blocked_slots' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Engel kaldırıldı." });
      fetchData();
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appId);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Başvuru durumu güncellendi." });
      fetchData();
    }
  };

  const handleAdvisorUploadDocument = async (appId: string, file: File) => {
    if (!file || !newDocName) {
      toast({ title: "Uyarı", description: "Lütfen belge adı girin ve dosya seçin.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `advisor-uploads/${appId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Hata", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('application_documents' as any)
      .insert({
        application_id: appId,
        advisor_id: advisorId,
        name: newDocName,
        url: publicUrl
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

  if (authLoading || roleLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <SidebarProvider style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        <Sidebar className="border-r border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-100 px-10 py-10">
            <h2 className="text-3xl font-black tracking-tight text-navy-dark px-2">Danışman <span className="text-emerald-500 font-extrabold uppercase text-xs tracking-[0.2em] block mt-1">Yönetim Portalı</span></h2>
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
                onClick={() => navigate("/")}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                  <Plus className="h-5 w-5 text-navy-dark rotate-45" />
                </div>
                Anasayfa
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100 shadow-sm rounded-2xl font-extrabold text-base transition-all active:scale-[0.98]"
                onClick={handleSignOut}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center mr-4">
                  <LogOut className="h-4 w-4" />
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
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition-all cursor-default group relative overflow-hidden">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-8">
                    <User size={32} />
                  </div>
                  <div>
                    <p className="text-6xl font-black tracking-tighter text-navy-dark">{stats.assigned}</p>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Toplam Müşteri</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-all cursor-default group relative overflow-hidden">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-8">
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <p className="text-6xl font-black tracking-tighter text-navy-dark">{stats.pendingMessages}</p>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Bekleyen Mesaj</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:border-violet-200 transition-all cursor-default group relative overflow-hidden">
                  <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl w-fit mb-8">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <p className="text-6xl font-black tracking-tighter text-navy-dark">{stats.completed}</p>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Tamamlanan İşlem</p>
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
                          <select
                            className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 rounded-full font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={app.status}
                            onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                          >
                            <option value="Alındı">Alındı</option>
                            <option value="İnceleniyor">İnceleniyor</option>
                            <option value="İşlem Gerekli">İşlem Gerekli</option>
                            <option value="Gönderildi">Gönderildi</option>
                            <option value="Onaylandı">Onaylandı</option>
                            <option value="Reddedildi">Reddedildi</option>
                          </select>
                        </TableCell>
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="lg" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6" onClick={() => {
                            setSelectedAppForUpload(app.id);
                            setIsUploadDialogOpen(true);
                          }}>
                            Belge Yükle
                          </Button>
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



              {isUploadDialogOpen && selectedAppForUpload && (
            <div className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-navy-dark">Belge Yükle</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsUploadDialogOpen(false)} className="rounded-full">
                    <X size={24} />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-black text-navy-dark uppercase tracking-widest">Belge Adı</Label>
                    <Input
                      placeholder="Örn: Vize Randevu Belgesi"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold px-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-black text-navy-dark uppercase tracking-widest">Dosya Seçin</Label>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition-colors mb-3" />
                        <p className="text-sm text-slate-500 font-bold">Yüklemek için tıklayın</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAdvisorUploadDocument(selectedAppForUpload, file);
                        }}
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  {appDocs[selectedAppForUpload] && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Yüklenen Belgeler</p>
                      <div className="space-y-2">
                        {appDocs[selectedAppForUpload].map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="font-bold text-navy-dark text-sm">{doc.name}</span>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-black text-xs uppercase hover:underline">Görüntüle</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
          {/* Header section with summary */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-4xl font-black text-navy-dark tracking-tight">Randevu & Müsaitlik Yönetimi</h2>
              <p className="text-lg text-slate-500 font-medium mt-1">Görüşme taleplerini onaylayın ve çalışma saatlerinizi düzenleyin.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-center">
                <p className="text-2xl font-black text-blue-600 leading-none">{stats.pendingConsultations}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mt-1">Bekleyen</p>
              </div>
              <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 text-center">
                <p className="text-2xl font-black text-emerald-600 leading-none">{consultations.filter(c => c.status === 'confirmed').length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Onaylı</p>
              </div>
            </div>
          </div>

          {/* Consultation Requests & Approved Meetings - Side by Side or Vertical based on screens */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Requests */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-navy-dark tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <Clock size={20} />
                    </div>
                    Bekleyen Talepler
                  </h3>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {consultations.filter(c => c.status === 'pending').map(c => (
                    <div key={c.id} className="p-6 bg-slate-50 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 hover:border-blue-200 transition-all group gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-navy-dark font-black text-lg border border-slate-100">
                          {c.customer_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-navy-dark text-lg leading-tight">{c.customer_name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="text-slate-500 font-bold text-sm flex items-center gap-1">
                              <Calendar size={14} /> {format(new Date(c.start_time), 'd MMMM yyyy, EEEE', { locale: tr })}
                            </span>
                            <span className="text-blue-600 font-black text-sm uppercase tracking-wider">
                              {format(new Date(c.start_time), 'HH:mm')} - {format(new Date(c.end_time), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button onClick={() => handleUpdateConsultationStatus(c.id, 'confirmed')} className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold h-12 px-6 shadow-lg shadow-emerald-500/20">Onayla</Button>
                        <Button onClick={() => handleUpdateConsultationStatus(c.id, 'rejected')} variant="outline" className="flex-1 sm:flex-none text-rose-600 border-rose-100 hover:bg-rose-50 rounded-xl font-bold h-12 px-6">Reddet</Button>
                      </div>
                    </div>
                  ))}
                  {consultations.filter(c => c.status === 'pending').length === 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 py-10 opacity-30">
                      <Clock size={48} className="mb-4" />
                      <p className="font-bold">Bekleyen randevu talebi bulunmuyor.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approved Meetings */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-navy-dark tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={20} />
                    </div>
                    Onaylanmış Görüşmeler
                  </h3>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {consultations.filter(c => c.status === 'confirmed').map(c => (
                    <div key={c.id} className="p-6 bg-white rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 hover:shadow-md transition-all gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg border border-emerald-100">
                          <Check size={28} />
                        </div>
                        <div>
                          <p className="font-black text-navy-dark text-lg leading-tight">{c.customer_name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="text-slate-500 font-bold text-sm flex items-center gap-1">
                              <Calendar size={14} /> {format(new Date(c.start_time), 'd MMMM yyyy, EEEE', { locale: tr })}
                            </span>
                            <span className="text-emerald-600 font-black text-sm uppercase tracking-wider">
                              {format(new Date(c.start_time), 'HH:mm')} - {format(new Date(c.end_time), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest">Görüşme Var</Badge>
                    </div>
                  ))}
                  {consultations.filter(c => c.status === 'confirmed').length === 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 py-10 opacity-30">
                      <CheckCircle2 size={48} className="mb-4" />
                      <p className="font-bold">Yaklaşan onaylı görüşme bulunmuyor.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weekly Availability - Now more compact and structured */}
            <div className="xl:col-span-12">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-navy-dark tracking-tight mb-2 flex items-center gap-3">
                      <Calendar className="text-emerald-500" /> Haftalık Uygunluk
                    </h2>
                    <p className="text-slate-500 font-medium">Randevu alınabilecek saat aralıklarını bu tablodan yönetin.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setNewAvail({ ...newAvail, days: [1, 2, 3, 4, 5] })}
                      variant="ghost"
                      className="rounded-xl h-10 px-4 font-bold bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      Hafta İçi Seçi
                    </Button>
                    <Button
                      onClick={() => setNewAvail({ ...newAvail, days: [0, 1, 2, 3, 4, 5, 6] })}
                      variant="ghost"
                      className="rounded-xl h-10 px-4 font-bold bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Tüm Haftayı Seç
                    </Button>
                    <Button
                      onClick={() => setNewAvail({ ...newAvail, days: [] })}
                      variant="ghost"
                      className="rounded-xl h-10 px-4 font-bold bg-slate-50 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Temizle
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                  {dayNames.map((name, i) => {
                    const daySlots = availability.filter(a => a.day_of_week === i);
                    const isSelected = newAvail.days.includes(i);
                    return (
                      <div key={i} className={`flex flex-col rounded-[2rem] p-5 border-2 transition-all duration-300 ${isSelected ? 'border-emerald-500/30 bg-emerald-50/10 ring-4 ring-emerald-500/5' : 'border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className={`text-lg font-black ${isSelected ? 'text-emerald-600' : 'text-navy-dark opacity-70'}`}>{name}</h4>
                          <button
                            onClick={() => {
                              const days = newAvail.days.includes(i)
                                ? newAvail.days.filter(d => d !== i)
                                : [...newAvail.days, i];
                              setNewAvail({ ...newAvail, days });
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-slate-200 text-transparent hover:border-emerald-500/50'}`}
                          >
                            {isSelected ? <Check size={18} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                          </button>
                        </div>

                        <div className="min-h-[100px] flex-1 space-y-2 mb-4">
                          {daySlots.length > 0 ? (
                            daySlots.map(a => (
                              <div key={a.id} className="group relative py-2 px-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                                <span className="text-xs font-black text-navy-dark tracking-tight">{a.start_time.substring(0, 5)} - {a.end_time.substring(0, 5)}</span>
                                <button
                                  onClick={() => handleRemoveAvailability(a.id)}
                                  className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white flex items-center justify-center"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 opacity-20 border border-dashed border-slate-300 rounded-xl">
                              <AlertCircle size={20} className="mb-1" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-center">Kapalı</p>
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <div className="pt-4 border-t border-emerald-500/10 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 ml-1">Giriş</label>
                                <input
                                  type="time"
                                  value={newAvail.start}
                                  onChange={e => setNewAvail({ ...newAvail, start: e.target.value })}
                                  className="w-full bg-white border-slate-200 rounded-lg text-[11px] font-black py-2 px-1 focus:ring-2 focus:ring-emerald-500/20 text-center"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 ml-1">Çıkış</label>
                                <input
                                  type="time"
                                  value={newAvail.end}
                                  onChange={e => setNewAvail({ ...newAvail, end: e.target.value })}
                                  className="w-full bg-white border-slate-200 rounded-lg text-[11px] font-black py-2 px-1 focus:ring-2 focus:ring-emerald-500/20 text-center"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                const tempDays = newAvail.days;
                                setNewAvail({ ...newAvail, days: [i] });
                                setTimeout(() => {
                                  handleAddAvailability();
                                  setNewAvail({ ...newAvail, days: tempDays });
                                }, 0);
                              }}
                              className="w-full h-9 bg-navy-dark hover:bg-navy-light text-white rounded-xl text-[10px] font-black uppercase tracking-wider"
                            >
                              Saat Ekle
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quick Bulk Update Bar */}
                <div className="mt-10 p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-900/20">
                  <div className="flex items-center gap-5 text-left">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <Zap size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Toplu Saat İşleme</h3>
                      <p className="text-slate-400 text-sm font-medium">Seçili {newAvail.days.length} güne aynı aralığı ekle.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 w-full lg:w-auto">
                    <div className="flex gap-2 bg-slate-800 p-2 rounded-2xl">
                      <input
                        type="time"
                        value={newAvail.start}
                        onChange={e => setNewAvail({ ...newAvail, start: e.target.value })}
                        className="bg-transparent border-none p-2 font-black text-white text-lg focus:ring-0 w-28 text-center"
                      />
                      <div className="h-10 w-[1px] bg-white/10 self-center" />
                      <input
                        type="time"
                        value={newAvail.end}
                        onChange={e => setNewAvail({ ...newAvail, end: e.target.value })}
                        className="bg-transparent border-none p-2 font-black text-white text-lg focus:ring-0 w-28 text-center"
                      />
                    </div>
                    <Button
                      onClick={handleAddAvailability}
                      disabled={newAvail.days.length === 0}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] h-14 px-8 font-black text-base shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-20 flex-1 lg:flex-none"
                    >
                      Uygula
                    </Button>
                  </div>
                </div>

                {/* Exceptions Section inside Availability */}
                <div className="mt-12 pt-12 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-4 space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-navy-dark tracking-tight mb-2">Tatil & Bloklamalar</h3>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">Özel bir günü veya saat aralığını tamamen kapatmak için yeni bir engel girişi yapın.</p>
                    </div>

                    <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100 flex flex-col gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-rose-600/70 ml-1">Engellenecek Tarih</Label>
                          <input
                            type="date"
                            value={newBlocked.date}
                            onChange={e => setNewBlocked({ ...newBlocked, date: e.target.value })}
                            className="w-full bg-white border border-rose-100 rounded-2xl p-4 font-bold text-navy-dark focus:ring-2 focus:ring-rose-500/20"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-rose-600/70 ml-1">Başlangıç</Label>
                            <input
                              type="time"
                              value={newBlocked.start}
                              onChange={e => setNewBlocked({ ...newBlocked, start: e.target.value })}
                              className="w-full bg-white border border-rose-100 rounded-2xl p-4 font-bold text-navy-dark focus:ring-2 focus:ring-rose-500/20 text-center"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-rose-600/70 ml-1">Bitiş</Label>
                            <input
                              type="time"
                              value={newBlocked.end}
                              onChange={e => setNewBlocked({ ...newBlocked, end: e.target.value })}
                              className="w-full bg-white border border-rose-100 rounded-2xl p-4 font-bold text-navy-dark focus:ring-2 focus:ring-rose-500/20 text-center"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleAddBlockedSlot}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl h-14 font-black text-base shadow-lg shadow-rose-500/20"
                      >
                        Tarihi Kapat
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 flex flex-col">
                    <h4 className="text-xl font-black text-navy-dark mb-6 flex items-center gap-2 opacity-60 uppercase tracking-widest text-xs">
                      Aktif Engel Kayıtları
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                      {blockedSlots.map(slot => (
                        <div key={slot.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                              <Clock size={20} />
                            </div>
                            <div>
                              <p className="font-black text-navy-dark text-sm">{format(new Date(slot.start_time), 'd MMMM yyyy', { locale: tr })}</p>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {format(new Date(slot.start_time), 'HH:mm')} - {format(new Date(slot.end_time), 'HH:mm')}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveBlockedSlot(slot.id)}
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <X size={20} />
                          </Button>
                        </div>
                      ))}
                      {blockedSlots.length === 0 && (
                        <div className="col-span-full py-16 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                          <AlertCircle size={40} className="mb-3 opacity-20" />
                          <p className="font-bold text-sm tracking-tight text-slate-400">Aktif bir kısıtlama bulunmuyor.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
    </SidebarProvider>
  );
}

