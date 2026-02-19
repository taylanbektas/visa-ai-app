
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Download,
  Eye
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Application = {
  id: string;
  applicant_name: string;
  passport_type: string;
  destination_country: string;
  visa_type: string;
  status: string;
  created_at: string;
  assigned_to?: string;
  email?: string;
};

type Advisor = {
  id: string;
  user_id: string;
  full_name: string;
  status: string;
  active_applications: number;
};

type UserData = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  roles: ("admin" | "moderator" | "user")[];
  assigned_advisor_id?: string | null;
};

type AdvisorApplication = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  resume_url: string;
  bio: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

// Mock data for initial detailed view (restoring the previous mock data structure if real data isn't fully wired up yet)
// But wait, the previous code was fetching from Supabase. I will try to fetch real data where possible.

export default function Admin() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'applications' | 'advisor-apps' | 'users' | 'advisors'

  // Data
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [activeAdvisorsList, setActiveAdvisorsList] = useState<Advisor[]>([]); // Real advisors from 'advisors' table
  const [usersList, setUsersList] = useState<UserData[]>([]); // Real customers from 'profiles'
  const [advisorApplications, setAdvisorApplications] = useState<AdvisorApplication[]>([]); // Applications to become advisor

  // Stats
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    activeAdvisors: 0,
    totalUsers: 0
  });

  const [selectedUser, setSelectedUser] = useState<UserData & { advisor?: Advisor } | null>(null); // For assignment dialog
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [editAdvisorOpen, setEditAdvisorOpen] = useState(false);
  const [assignCustomerOpen, setAssignCustomerOpen] = useState(false);
  const [selectedAdvisorForCustomer, setSelectedAdvisorForCustomer] = useState<Advisor | null>(null);

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }

    fetchData();
  }, [user, authLoading, roleLoading, isAdmin, navigate]);

  const fetchData = async () => {
    setLoadingApps(true);

    // 1. Fetch Applications
    const { data: apps } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (apps) {
      setApplications(apps as unknown as Application[]);
      setStats(prev => ({ ...prev, totalApplications: apps.length, pendingReview: apps.filter(a => a.status === 'pending_review').length }));
    }

    // 2. Fetch Active Advisors (Real Table)
    const { data: realAdvisors } = await supabase
      .from("advisors")
      .select("*")
      .order("created_at", { ascending: false });

    const advisorMap = new Map();

    if (realAdvisors && realAdvisors.length > 0) {
      const userIds = realAdvisors.map(a => a.user_id);
      const { data: advProfiles } = await supabase.from('profiles').select('user_id, full_name, phone').in('user_id', userIds);

      const mergedAdvisors = realAdvisors.map(adv => {
        const p = advProfiles?.find(p => p.user_id === adv.user_id);
        const fullAdvisor = {
          ...adv,
          full_name: p?.full_name || 'Danışman',
          email: adv.email || '-',
          phone: p?.phone || adv.phone || '-',
          status: adv.is_active ? 'Aktif' : 'Pasif',
          active_applications: 0 // calc later if needed
        };
        advisorMap.set(adv.id, fullAdvisor);
        return fullAdvisor;
      });
      setActiveAdvisorsList(mergedAdvisors as Advisor[]);
      setStats(prev => ({ ...prev, activeAdvisors: mergedAdvisors.filter(a => a.is_active).length }));
    } else {
      setActiveAdvisorsList([]);
    }

    // 3. Fetch Users (Profiles)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profiles) {
      // Map advisor details to users
      const usersWithAdvisors = (profiles as unknown as UserData[]).map((p) => {
        if (p.assigned_advisor_id && advisorMap.has(p.assigned_advisor_id)) {
          return { ...p, advisor: advisorMap.get(p.assigned_advisor_id) };
        }
        return p;
      });

      setUsersList(usersWithAdvisors);
      setStats(prev => ({ ...prev, totalUsers: profiles.length }));
    }

    // 4. Fetch Advisor Applications (NEW)
    const { data: advApps } = await supabase
      .from("advisor_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (advApps) {
      setAdvisorApplications(advApps as unknown as AdvisorApplication[]);
    }

    setLoadingApps(false);
  };

  const handleAssignAdvisor = async (userId: string, authUserId: string, advisorId: string) => {
    // Try to update profile. Use .select() to check if row was actually updated (RLS fallback detection)
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update({ assigned_advisor_id: advisorId } as never)
      .eq('id', userId)
      .select();

    if (profileError) {
      toast({ title: "Hata", description: "Profil ataması yapılamadı: " + profileError.message, variant: "destructive" });
      return;
    }

    if (!updatedProfile || updatedProfile.length === 0) {
      toast({
        title: "Yetki Hatası (RLS)",
        description: "Danışman atandı olarak işaretlenemedi. Adminlerin 'profiles' tablosunu güncelleyebilmesi için RLS izinlerine ihtiyacı var.",
        variant: "destructive"
      });
      return; // Stop here if profile update failed silently
    }

    // Assign existing applications
    const { data: apps } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', authUserId);

    if (apps && apps.length > 0) {
      const appIds = apps.map(a => a.id);
      await supabase.from('advisor_assignments').delete().in('application_id', appIds);

      const assignments = apps.map(app => ({
        id: crypto.randomUUID(), // Assuming UUID is required if it's not auto-generated properly
        application_id: app.id,
        advisor_id: advisorId
      }));

      const { error: assignError } = await supabase.from('advisor_assignments').insert(assignments);
      if (assignError) {
        console.error("Assignment error:", assignError);
      }
    }

    toast({ title: "Başarılı", description: "Danışman atandı." });
    setAssignmentOpen(false);
    setAssignCustomerOpen(false);
    fetchData();
  };

  const handleUpdateAdvisorStatus = async (advisorId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('advisors')
      .update({ is_active: isActive })
      .eq('id', advisorId);

    if (error) {
      toast({ title: "Hata", description: "Güncelleme başarısız: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Danışman durumu güncellendi." });
      setEditAdvisorOpen(false);
      fetchData();
    }
  };

  const generateDummyData = async () => {
    const dummyApps = [
      { applicant_name: "Ahmet Yılmaz", passport_type: "TR", destination_country: "Almanya", visa_type: "Turistik", status: "pending_review", created_at: new Date().toISOString() },
      { applicant_name: "Ayşe Kaya", passport_type: "TR", destination_country: "Fransa", visa_type: "Ogrenci", status: "pending_documents", created_at: new Date(Date.now() - 86400000).toISOString() },
      { applicant_name: "Mehmet Demir", passport_type: "TR", destination_country: "İtalya", visa_type: "Ticari", status: "completed", created_at: new Date(Date.now() - 172800000).toISOString() },
    ];

    setApplications(dummyApps.map((a, i) => ({ ...a, id: `mock-${i}` } as unknown as Application)));

    const dummyAdvApps = [
      { id: 'mock-adv-1', full_name: 'Canan Uzman', email: 'canan@example.com', phone: '5559998877', status: 'pending', created_at: new Date().toISOString(), bio: '5 yıllık deneyim', linkedin_url: '#', resume_url: '#' },
      { id: 'mock-adv-2', full_name: 'Burak Danışman', email: 'burak@example.com', phone: '5551112233', status: 'rejected', created_at: new Date(Date.now() - 100000000).toISOString(), bio: 'Yeni mezun', linkedin_url: '#', resume_url: '#' },
    ];
    setAdvisorApplications(prev => [...prev, ...dummyAdvApps] as AdvisorApplication[]);

    toast({ title: "Demo Verileri Yüklendi", description: "Geçici veriler tabloya eklendi." });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Hata", description: "Durum güncellenemedi", variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Başvuru durumu güncellendi" });
      fetchData();
    }
  };

  const handleApproveAdvisor = async (app: AdvisorApplication) => {
    try {
      // 1. Assign Role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: app.user_id,
        role: 'moderator'
      });
      if (roleError && !roleError.message.includes('duplicate')) throw roleError;

      // 2. Create Advisor Profile
      const { error: advError } = await supabase.from('advisors').insert({
        user_id: app.user_id
      });
      if (advError && !advError.message.includes('duplicate')) throw advError;

      // 3. Update Application Status
      const { error: appError } = await supabase
        .from('advisor_applications')
        .update({ status: 'approved' } as never)
        .eq('id', app.id);

      if (appError) throw appError;

      toast({ title: "Başarılı", description: "Danışman onaylandı ve yetkileri verildi." });
      fetchData(); // Refresh list

    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        toast({ title: "Hata", description: e.message, variant: "destructive" });
      } else {
        toast({ title: "Hata", description: "Bilinmeyen bir hata oluştu.", variant: "destructive" });
      }
    }
  };

  const handleRejectAdvisor = async (id: string) => {
    try {
      const app = advisorApplications.find(a => a.id === id);

      const { error } = await supabase
        .from('advisor_applications')
        .update({ status: 'rejected' } as never)
        .eq('id', id);

      if (error) throw error;

      if (app) {
        // Revoke the moderator role if they had it
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .match({ user_id: app.user_id, role: 'moderator' });

        if (roleError) console.error("Role revoke error:", roleError);

        // Delete their advisor profile completely
        const { error: advError } = await supabase
          .from('advisors')
          .delete()
          .eq('user_id', app.user_id);

        if (advError) {
          console.error("Advisor delete error:", advError);
          // Fallback to inactivate if delete fails (e.g. RLS)
          await supabase.from('advisors').update({ is_active: false }).eq('user_id', app.user_id);
          toast({ title: "Uyarı", description: "Başvuru reddedildi ancak profil silinemedi (RLS kısıtlaması olabilir).", variant: "destructive" });
        } else {
          toast({ title: "Reddedildi", description: "Başvuru reddedildi ve varsa yetkileri tamamen silindi." });
        }
      } else {
        toast({ title: "Reddedildi", description: "Başvuru reddedildi." });
      }

      fetchData();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast({ title: "Hata", description: e.message, variant: "destructive" });
      } else {
        toast({ title: "Hata", description: "Bilinmeyen bir hata oluştu.", variant: "destructive" });
      }
    }
  };

  const handleDeleteAdvisor = async (advisorId: string, userId: string) => {
    try {
      // 1. Delete assigned applications or unassign them first (if needed, but ON DELETE CASCADE should handle assignments table if setup correctly)

      // 2. Remove moderator role
      await supabase
        .from('user_roles')
        .delete()
        .match({ user_id: userId, role: 'moderator' });

      // 3. Delete advisor profile
      const { error } = await supabase
        .from('advisors')
        .delete()
        .eq('id', advisorId);

      if (error) {
        toast({ title: "Silme Hatası", description: "Hata: " + error.message, variant: "destructive" });
      } else {
        toast({ title: "Başarılı", description: "Danışman veritabanından kalıcı olarak silindi." });
        fetchData();
      }
    } catch (e: unknown) {
      console.error(e);
      toast({ title: "Hata", description: "Silme işlemi sırasında beklenmeyen bir hata oluştu.", variant: "destructive" });
    }
  };

  if (authLoading || roleLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4 pt-24 md:pt-4"> {/* Mobile/Desktop spacing fix */}
            <h2 className="text-xl font-bold tracking-tight text-navy-dark">Admin Panel</h2>
          </SidebarHeader>
          <SidebarContent>
            {/* ... sidebar content ... */}
            <SidebarGroup>
              <SidebarGroupLabel>YÖNETİM</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'dashboard'}
                      onClick={() => setActiveTab('dashboard')}
                      size="lg" // Try to use larger size if available or just update classes below if not
                      className="gap-3 font-medium transition-all hover:translate-x-1"
                    >
                      <LayoutDashboard className={activeTab === 'dashboard' ? 'text-primary' : 'text-gray-500'} />
                      <span className={activeTab === 'dashboard' ? 'font-bold text-navy-dark' : 'text-gray-600'}>Genel Bakış</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'users'}
                      onClick={() => setActiveTab('users')}
                      size="lg"
                      className="gap-3 font-medium transition-all hover:translate-x-1"
                    >
                      <Users className={activeTab === 'users' ? 'text-primary' : 'text-gray-500'} />
                      <span className={activeTab === 'users' ? 'font-bold text-navy-dark' : 'text-gray-600'}>Müşteriler</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'advisors'}
                      onClick={() => setActiveTab('advisors')}
                      size="lg"
                      className="gap-3 font-medium transition-all hover:translate-x-1"
                    >
                      <Briefcase className={activeTab === 'advisors' ? 'text-primary' : 'text-gray-500'} />
                      <span className={activeTab === 'advisors' ? 'font-bold text-navy-dark' : 'text-gray-600'}>Danışmanlar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* ... other menu items ... */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'applications'}
                      onClick={() => setActiveTab('applications')}
                      size="lg"
                      className="gap-3 font-medium transition-all hover:translate-x-1"
                    >
                      <FileText className={activeTab === 'applications' ? 'text-primary' : 'text-gray-500'} />
                      <span className={activeTab === 'applications' ? 'font-bold text-navy-dark' : 'text-gray-600'}>Vize Başvuruları</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'advisor-apps'}
                      onClick={() => setActiveTab('advisor-apps')}
                      size="lg"
                      className="gap-3 font-medium transition-all hover:translate-x-1"
                    >
                      <Briefcase className={activeTab === 'advisor-apps' ? 'text-primary' : 'text-gray-500'} />
                      <span className={activeTab === 'advisor-apps' ? 'font-bold text-navy-dark' : 'text-gray-600'}>Danışmanlık Talepleri</span>
                      {advisorApplications.filter(a => a.status === 'pending').length > 0 && (
                        <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                          {advisorApplications.filter(a => a.status === 'pending').length}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* ... */}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {/* ... footer group ... */}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 overflow-auto pt-24 md:pt-8"> {/* Content spacing fix */}
          {/* ... header ... */}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-navy-dark">Genel Bakış</h1>
                <p className="text-muted-foreground mt-1">Sistem durumunu ve performans metriklerini buradan takip edebilirsiniz.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText size={64} className="text-navy-dark" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Toplam Başvuru</h3>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-extrabold text-navy-dark">{stats.totalApplications}</p>
                    <span className="text-sm text-green-500 font-bold mb-1 flex items-center">
                      <ChevronRight className="w-4 h-4 rotate-[-45deg]" /> %12
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Geçen aya göre artış</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <LayoutDashboard size={64} className="text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-green-700 mb-2">Tahmini Gelir</h3>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-extrabold text-green-600">₺{(stats.totalApplications * 3500).toLocaleString('tr-TR')}</p>
                  </div>
                  <p className="text-xs text-green-600/80 mt-2">Bu ayki tahmini kazanç</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Briefcase size={64} className="text-blue-500" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Danışman Adayları</h3>
                  <p className="text-4xl font-extrabold text-blue-600">{advisorApplications.filter(a => a.status === 'pending').length}</p>
                  <p className="text-xs text-muted-foreground mt-2">İncelenmeyi bekleyen başvuru</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users size={64} className="text-purple-600" />
                  </div>
                  <h3 className="text-sm font-medium text-purple-700 mb-2">Aktif Danışmanlar</h3>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-extrabold text-purple-600">{Math.max(1, stats.activeAdvisors)}</p>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold mb-1">Online</span>
                  </div>
                  <p className="text-xs text-purple-600/80 mt-2">Sisteme kayıtlı uzmanlar</p>
                </div>
              </div>

              {/* CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Revenue/Usage Trends (Area Chart) - Takes up 2 cols */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-navy-dark">Gelir Analizi</h3>
                      <p className="text-sm text-muted-foreground">Son 6 aylık performans grafiği</p>
                    </div>
                    <Select defaultValue="6months">
                      <SelectTrigger className="w-[140px] rounded-lg">
                        <SelectValue placeholder="Aralık Seç" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">Son 6 Ay</SelectItem>
                        <SelectItem value="year">Bu Yıl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Eyl', revenue: 15000, organic: 12000 },
                        { name: 'Eki', revenue: 22000, organic: 18000 },
                        { name: 'Kas', revenue: 18000, organic: 10000 },
                        { name: 'Ara', revenue: 35000, organic: 25000 },
                        { name: 'Oca', revenue: 28000, organic: 20000 },
                        { name: 'Şub', revenue: 42000, organic: 30000 },
                      ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D69E" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#00D69E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickFormatter={(value) => `₺${value / 1000}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            padding: '12px'
                          }}
                          cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area
                          type="monotone"
                          dataKey="organic"
                          name="Organik Gelir"
                          stroke="#00D69E"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorOrganic)"
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Toplam Beklenti"
                          stroke="#0F172A"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Status Distribution Pie Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-navy-dark mb-1">Durum Dağılımı</h3>
                  <p className="text-sm text-muted-foreground mb-6">Başvuruların güncel durumu</p>
                  <div className="h-[300px] w-full flex justify-center items-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Onaylandı', value: 35, color: '#10B981' },
                            { name: 'İnceleniyor', value: 25, color: '#F59E0B' },
                            { name: 'Belge Bekliyor', value: 15, color: '#3B82F6' },
                            { name: 'Reddedildi', value: 5, color: '#EF4444' },
                            { name: 'Taslak', value: 20, color: '#9CA3AF' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          cornerRadius={6}
                        >
                          {[
                            { name: 'Onaylandı', value: 35, color: '#10B981' },
                            { name: 'İnceleniyor', value: 25, color: '#F59E0B' },
                            { name: 'Belge Bekliyor', value: 15, color: '#3B82F6' },
                            { name: 'Reddedildi', value: 5, color: '#EF4444' },
                            { name: 'Taslak', value: 20, color: '#9CA3AF' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        {/* Custom Legend moved below */}
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-extrabold text-navy-dark">100+</span>
                      <span className="text-xs text-muted-foreground">Toplam</span>
                    </div>
                  </div>
                  {/* Custom Legend list */}
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                    {[
                      { name: 'Onaylandı', color: '#10B981' },
                      { name: 'İnceleniyor', color: '#F59E0B' },
                      { name: 'Belge', color: '#3B82F6' },
                      { name: 'Reddedildi', color: '#EF4444' },
                      { name: 'Diğer', color: '#9CA3AF' },
                    ].map(i => (
                      <div key={i.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i.color }}></span>
                        <span className="text-gray-600 font-medium">{i.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Başvuru ara..." className="pl-9 bg-white" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Filtrele</Button>
                  <Button variant="outline" size="sm">Dışa Aktar</Button>
                </div>
              </div>
              {loadingApps ? (
                <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : applications.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">Henüz başvuru bulunmuyor.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başvuru No</TableHead>
                      <TableHead>Kişi</TableHead>
                      <TableHead>Ülke</TableHead>
                      <TableHead>Vize Türü</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-xs">{app.id.substring(0, 8)}</TableCell>
                        <TableCell className="font-medium">{app.applicant_name}</TableCell>
                        <TableCell>{app.destination_country}</TableCell>
                        <TableCell>{app.visa_type}</TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString("tr-TR")}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              app.status === "completed"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : app.status === "rejected"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }
                          >
                            {app.status === "completed"
                              ? "Onaylandı"
                              : app.status === "rejected"
                                ? "Reddedildi"
                                : "İnceleniyor"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            defaultValue={app.status}
                            onValueChange={(val) => handleStatusUpdate(app.id, val)}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs ml-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending_documents">Belge Bekliyor</SelectItem>
                              <SelectItem value="pending_review">İncelemede</SelectItem>
                              <SelectItem value="submitted">Konsoloslukta</SelectItem>
                              <SelectItem value="completed">Onaylandı</SelectItem>
                              <SelectItem value="rejected">Reddedildi</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* ADVISOR APPLICATIONS TAB (NEW) */}
          {activeTab === 'advisor-apps' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold">Danışman Olma Talepleri</h3>
              </div>
              {loadingApps ? (
                <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : advisorApplications.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">Henüz başvuru yok.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>Email & Telefon</TableHead>
                      <TableHead>Profil & CV</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advisorApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          {app.full_name}
                          <div className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString("tr-TR")}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{app.email}</div>
                          <div className="text-xs text-muted-foreground">{app.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {/* Details Dialog */}
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs border border-dashed">
                                  <Eye size={12} className="mr-1" /> Detay
                                </Button>
                              </SheetTrigger>
                              <SheetContent>
                                <SheetHeader>
                                  <SheetTitle>Danışman Adayı Detayı</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 space-y-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Ad Soyad</p>
                                    <p className="font-medium">{app.full_name}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">İletişim</p>
                                    <p>{app.email}</p>
                                    <p>{app.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Kendinden Bahset (Bio)</p>
                                    <div className="bg-muted p-3 rounded-md text-sm mt-1 whitespace-pre-wrap">
                                      {app.bio || "Bio girilmemiş."}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    {app.linkedin_url && (
                                      <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                                        <ExternalLink size={14} /> LinkedIn Profili
                                      </a>
                                    )}
                                    {app.resume_url && (
                                      <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center gap-1 text-sm">
                                        <Download size={14} /> CV Görüntüle
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </SheetContent>
                            </Sheet>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {app.status === 'approved' ? 'Onaylandı' : app.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Always show actions to allow changing status */}
                            {app.status !== 'approved' && (
                              <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 border-green-200 h-8" onClick={() => handleApproveAdvisor(app)}>
                                <CheckCircle size={14} className="mr-1" /> Onayla
                              </Button>
                            )}
                            {app.status !== 'rejected' && (
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200 h-8" onClick={() => handleRejectAdvisor(app.id)}>
                                <XCircle size={14} className="mr-1" /> Reddet
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* ADVISORS TAB */}
          {activeTab === 'advisors' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-in fade-in">
              <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                <h3 className="font-semibold">Tüm Danışmanlar</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Danışman</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Puan</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAdvisorsList.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Danışman bulunamadı.</TableCell></TableRow>
                  ) : activeAdvisorsList.map((adv: Advisor & { email?: string; phone?: string; rating?: string; review_count?: number; is_active?: boolean }) => (
                    <TableRow key={adv.id}>
                      <TableCell className="font-medium">
                        {adv.full_name}
                        <div className="text-xs text-muted-foreground">ID: {adv.id.substring(0, 8)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{adv.email}</div>
                        <div className="text-xs text-muted-foreground">{adv.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={adv.is_active ? 'default' : 'secondary'}>{adv.is_active ? 'Aktif' : 'Pasif'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{adv.rating || '5.0'}</span>
                          <span className="text-xs text-muted-foreground">({adv.review_count || 0})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="mr-2" onClick={() => { setSelectedAdvisorForCustomer(adv); setAssignCustomerOpen(true); }}>Müşteri Ata</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="mr-2">Sil</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Danışmanı Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu danışmanı veritabanından kalıcı olarak silmek istediğinize emin misiniz? Bu işlem iptal edilemez.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteAdvisor(adv.id, adv.user_id)}>Sil</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Sheet open={editAdvisorOpen} onOpenChange={setEditAdvisorOpen}>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedAdvisor(adv); setEditAdvisorOpen(true); }}>Düzenle</Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Danışman Düzenle</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 space-y-4">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-bold">Danışman:</span> {selectedAdvisor?.full_name}
                              </p>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Hesap Durumu</label>
                                <Select
                                  defaultValue={selectedAdvisor?.status === "Aktif" ? "active" : "passive"}
                                  onValueChange={(val) => handleUpdateAdvisorStatus(selectedAdvisor?.id, val === "active")}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="passive">Pasif (Gizle)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button className="w-full mt-4" onClick={() => setEditAdvisorOpen(false)}>Kapat</Button>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Customer Assignment to Advisor Sheet */}
              <Sheet open={assignCustomerOpen} onOpenChange={setAssignCustomerOpen}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Müşteri Ata</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold text-navy-dark">{selectedAdvisorForCustomer?.full_name}</span> adlı danışmana müşteri atayın.
                    </p>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                      {usersList.map((usr: UserData & { full_name?: string }) => (
                        <div key={usr.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            if (selectedAdvisorForCustomer && usr.id && usr.user_id) {
                              handleAssignAdvisor(usr.id, usr.user_id, selectedAdvisorForCustomer.id);
                            }
                          }}>
                          <div>
                            <p className="font-medium">{usr.full_name || 'İsimsiz'}</p>
                            <p className="text-xs text-muted-foreground">{usr.phone || '-'}</p>
                          </div>
                          <Button size="sm" variant="ghost">Seç</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                <h3 className="font-semibold">Tüm Kullanıcılar</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead>Atanan Danışman</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((usr: UserData & { full_name?: string; phone?: string; id?: string; advisor?: Advisor }) => (
                    <TableRow key={usr.id}>
                      <TableCell className="font-medium">
                        {usr.full_name || 'İsimsiz'}
                        <div className="text-xs text-muted-foreground">{usr.id}</div>
                      </TableCell>
                      <TableCell>{usr.phone || '-'}</TableCell>
                      <TableCell>{new Date(usr.created_at).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>
                        {usr.advisor ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-navy-dark">{usr.advisor.full_name}</span>
                            <span className="text-xs text-muted-foreground">ID: {usr.advisor.id.substring(0, 6)}...</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Atanmadı</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Sheet open={assignmentOpen} onOpenChange={setAssignmentOpen}>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedUser(usr); setAssignmentOpen(true); }}>Atama Yap</Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Danışman Ata</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 space-y-4">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-bold text-navy-dark">{selectedUser?.full_name}</span> adlı kullanıcıya danışman atayın.
                              </p>
                              <div className="space-y-2">
                                {activeAdvisorsList.map(adv => (
                                  <div key={adv.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                      if (selectedUser?.id && selectedUser?.user_id) {
                                        handleAssignAdvisor(selectedUser.id, selectedUser.user_id, adv.id);
                                      }
                                    }}>
                                    <div>
                                      <p className="font-medium">{adv.full_name}</p>
                                      <p className="text-xs text-muted-foreground">{adv.active_applications || 0} aktif danışan</p>
                                    </div>
                                    <Button size="sm" variant="ghost">Seç</Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

        </main>
      </div>
    </SidebarProvider>
  );
}
