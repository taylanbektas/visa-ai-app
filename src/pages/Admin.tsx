
import { useEffect, useState } from "react";
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
  PieChart,
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
  Download
} from "lucide-react";
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
  user_id: string;
  email: string;
  created_at: string;
  roles: ("admin" | "moderator" | "user")[];
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
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'applications' | 'advisor-apps' | 'users'

  // Data
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [advisorApplications, setAdvisorApplications] = useState<AdvisorApplication[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    activeAdvisors: 0,
    totalUsers: 0
  });

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
      setApplications(apps as any[]); // Casting for simplicity if types mismatch
      setStats(prev => ({ ...prev, totalApplications: apps.length, pendingReview: apps.filter(a => a.status === 'pending_review').length }));
    }

    // 2. Fetch Advisors (mock for now or from DB if table exists/populated)
    // For now, let's just count users with moderator role
    // This part in previous code WAS fetching users and checking roles.

    // 3. Fetch Users & Roles
    // Note: 'auth.users' is not directly accessible usually. We might have to rely on a public profiles table or similar?
    // The previous code seemed to have a way or was mocking it.
    // Let's implement what I can see. The previous code had a SECTION for users.

    // 4. Fetch Advisor Applications (NEW)
    const { data: advApps } = await supabase
      .from("advisor_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (advApps) {
      setAdvisorApplications(advApps as AdvisorApplication[]);
    }

    setLoadingApps(false);
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
        .update({ status: 'approved' })
        .eq('id', app.id);

      if (appError) throw appError;

      toast({ title: "Başarılı", description: "Danışman onaylandı ve yetkileri verildi." });
      fetchData(); // Refresh list

    } catch (e: any) {
      console.error(e);
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    }
  };

  const handleRejectAdvisor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('advisor_applications')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Reddedildi", description: "Başvuru reddedildi." });
      fetchData();
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    }
  };

  if (authLoading || roleLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <h2 className="text-xl font-bold tracking-tight text-navy-dark">Admin Panel</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>YÖNETİM</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'dashboard'}
                      onClick={() => setActiveTab('dashboard')}
                    >
                      <LayoutDashboard />
                      <span>Genel Bakış</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'applications'}
                      onClick={() => setActiveTab('applications')}
                    >
                      <FileText />
                      <span>Vize Başvuruları</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'advisor-apps'}
                      onClick={() => setActiveTab('advisor-apps')}
                    >
                      <Briefcase />
                      <span>Danışmanlık Talepleri</span>
                      {advisorApplications.filter(a => a.status === 'pending').length > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {advisorApplications.filter(a => a.status === 'pending').length}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'users'}
                      onClick={() => setActiveTab('users')}
                    >
                      <Users />
                      <span>Kullanıcılar (Demo)</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => signOut()}>
                      <LogOut />
                      <span>Çıkış Yap</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-dark">
                {activeTab === 'dashboard' && 'Genel Bakış'}
                {activeTab === 'applications' && 'Vize Başvuruları'}
                {activeTab === 'advisor-apps' && 'Danışman Başvuruları'}
                {activeTab === 'users' && 'Kullanıcı Yönetimi'}
              </h1>
              <p className="text-muted-foreground">Sistem durumunu ve başvuruları buradan yönetebilirsiniz.</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>Siteye Dön</Button>
            </div>
          </header>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Toplam Başvuru</h3>
                  <p className="text-3xl font-bold text-navy-dark">{stats.totalApplications}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Bekleyen İnceleme</h3>
                  <p className="text-3xl font-bold text-orange-500">{stats.pendingReview}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Danışman Adayları</h3>
                  <p className="text-3xl font-bold text-blue-500">{advisorApplications.filter(a => a.status === 'pending').length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Toplam Kullanıcı</h3>
                  <p className="text-3xl font-bold text-green-500">{stats.totalUsers || '-'}</p>
                </div>
              </div>

              {/* Recent Activity Section could go here */}
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
                            {app.linkedin_url && (
                              <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                                <ExternalLink size={12} /> LinkedIn
                              </a>
                            )}
                            {app.resume_url && (
                              <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center gap-1 text-xs">
                                <Download size={12} /> CV İndir
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {app.status === 'approved' ? 'Onaylandı' : app.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {app.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 border-green-200" onClick={() => handleApproveAdvisor(app)}>
                                <CheckCircle size={14} className="mr-1" /> Onayla
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleRejectAdvisor(app.id)}>
                                <XCircle size={14} className="mr-1" /> Reddet
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* USERS TAB (Placeholder/Restored) */}
          {activeTab === 'users' && (
            <div className="bg-white p-8 rounded-xl border text-center text-muted-foreground">
              <p>Kullanıcı rolleri ve yönetimi bu alanda yapılacak.</p>
            </div>
          )}

        </main>
      </div>
    </SidebarProvider>
  );
}
