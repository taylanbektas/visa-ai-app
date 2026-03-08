
import { useEffect, useState, Fragment } from "react";
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
import { DashboardLayout, SidebarItem } from "@/components/layout/DashboardLayout";
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
  Eye,
  TrendingUp,
  Plus,
  ShieldCheck
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
  is_active?: boolean;
};

type UserData = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  roles: ("admin" | "moderator" | "user" | "agency")[];
  assigned_advisor_id?: string | null;
  is_suspended?: boolean;
  active_package?: "starter" | "pro" | "elite" | null;
  package_assigned_at?: string;
  advisor?: Advisor;
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

function SyncAdvisorAssignmentsButton({ onSuccess, toast }: { onSuccess: () => void; toast: (p: { title: string; description?: string; variant?: "default" | "destructive" }) => void }) {
  const [syncing, setSyncing] = useState(false);
  const runSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.rpc("sync_advisor_assignments" as any);
      if (error) throw error;
      const row = Array.isArray(data) && data[0] ? data[0] : data;
      const updated = row?.applications_updated ?? 0;
      const inserted = row?.assignments_inserted ?? 0;
      toast({ title: "Senkronizasyon tamamlandı", description: `${updated} profil güncellendi, ${inserted} danışman ataması eklendi.` });
      onSuccess();
    } catch (e: any) {
      toast({ title: "Senkronizasyon hatası", description: e?.message || "RPC çağrılamadı.", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={runSync} disabled={syncing} className="shrink-0">
      {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      Danışman atamalarını senkronize et
    </Button>
  );
}

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
    totalUsers: 0,
    totalAdvisors: 0,
  });

  const [timeFilter, setTimeFilter] = useState("1month");
  const [chartData, setChartData] = useState<any[]>([]);
  const [financials, setFinancials] = useState({ revenue: 0, expenses: 0, net: 0 });

  const [selectedUser, setSelectedUser] = useState<UserData & { advisor?: Advisor } | null>(null); // For assignment dialog
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [editAdvisorOpen, setEditAdvisorOpen] = useState(false);
  const [assignCustomerOpen, setAssignCustomerOpen] = useState(false);
  const [selectedAdvisorForCustomer, setSelectedAdvisorForCustomer] = useState<Advisor | null>(null);
  const [expandedAdvisorId, setExpandedAdvisorId] = useState<string | null>(null);
  const [assignPackageOpen, setAssignPackageOpen] = useState(false);
  const [selectedUserForPackage, setSelectedUserForPackage] = useState<UserData | null>(null);

  // Detail View State
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserData & { advisor?: Advisor } | null>(null);
  const [selectedAdvisorDetails, setSelectedAdvisorDetails] = useState<Advisor | null>(null);
  const [selectedApplicationDetails, setSelectedApplicationDetails] = useState<Application | null>(null);

  // List Filters
  const [appSearchTerm, setAppSearchTerm] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("all");

  // Financials State
  const [financialTransactions, setFinancialTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!usersList.length) return;

    const transactions: any[] = [];
    const PACKAGE_PRICES = { starter: 49, pro: 149, elite: 349 };

    usersList.forEach(u => {
      if (u.active_package && u.package_assigned_at) {
        const price = PACKAGE_PRICES[u.active_package as keyof typeof PACKAGE_PRICES] || 0;

        // Income Transaction
        transactions.push({
          id: `inc-${u.id}`,
          date: u.package_assigned_at,
          type: 'income',
          category: `Paket Satışı (${u.active_package.toUpperCase()})`,
          customerName: u.full_name,
          advisorName: '-',
          amount: price,
        });

        // Expense Transaction if advisor exists
        if (u.assigned_advisor_id && u.advisor) {
          transactions.push({
            id: `exp-${u.id}`,
            date: u.package_assigned_at,
            type: 'expense',
            category: 'Danışman Komisyonu',
            customerName: u.full_name,
            advisorName: u.advisor.full_name,
            amount: price * 0.30,
          });
        }
      }
    });

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFinancialTransactions(transactions);

  }, [usersList]);

  useEffect(() => {
    if (!usersList.length) return;

    const PACKAGE_PRICES = { starter: 49, pro: 149, elite: 349 };
    const now = new Date();
    const dataObj: Record<string, { name: string, revenue: number, cumulative: number }> = {};

    let daysToGenerate = 0;
    let viewType: 'day' | 'month' = 'month';

    if (timeFilter === "1week") {
      daysToGenerate = 7;
      viewType = 'day';
    } else if (timeFilter === "1month") {
      daysToGenerate = 30;
      viewType = 'day';
    }

    const months = timeFilter === "year" ? 12 : timeFilter === "3months" ? 3 : timeFilter === "all" ? 24 : 6;

    if (viewType === 'day') {
      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayLabel = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        dataObj[key] = { name: dayLabel, revenue: 0, cumulative: 0 };
      }
    } else {
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('tr-TR', { month: 'short' });
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        dataObj[key] = { name: monthName, revenue: 0, cumulative: 0 };
      }
    }

    const usersWithPackages = usersList.filter(u => u.active_package && u.package_assigned_at)
      .sort((a, b) => new Date(a.package_assigned_at!).getTime() - new Date(b.package_assigned_at!).getTime());

    let totalBefore = 0;
    let compareDate: Date;
    if (viewType === 'day') {
      compareDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToGenerate + 1);
      compareDate.setHours(0, 0, 0, 0);
    } else {
      compareDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    }

    usersWithPackages.forEach(u => {
      const d = new Date(u.package_assigned_at!);
      const price = PACKAGE_PRICES[u.active_package as keyof typeof PACKAGE_PRICES] || 0;

      if (d < compareDate) {
        totalBefore += price;
      } else {
        const key = viewType === 'day'
          ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
          : `${d.getFullYear()}-${d.getMonth()}`;

        if (dataObj[key]) {
          dataObj[key].revenue += price;
        }
      }
    });

    let currentRunning = totalBefore;
    Object.keys(dataObj).forEach(key => {
      currentRunning += dataObj[key].revenue;
      dataObj[key].cumulative = currentRunning;
    });

    setChartData(Object.values(dataObj));
  }, [usersList, timeFilter]);

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

    // 1. Fetch Profiles first to have names ready
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const profileMap = new Map();
    profilesData?.forEach(p => profileMap.set(p.user_id, p.full_name));

    // 2. Fetch Applications
    const { data: apps, error: appsError } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (apps) {
      const mappedApps = apps.map((app: any) => ({
        ...app,
        applicant_name: profileMap.get(app.user_id) || 'İsimsiz',
        destination_country: app.destination || '-'
      }));
      setApplications(mappedApps as unknown as Application[]);
      setStats(prev => ({
        ...prev,
        totalApplications: apps.length,
        pendingReview: apps.filter(a => a.status === 'pending_review').length,
      }));
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
      setStats(prev => ({
        ...prev,
        activeAdvisors: mergedAdvisors.filter(a => a.is_active).length,
        totalAdvisors: mergedAdvisors.length
      }));
    } else {
      setActiveAdvisorsList([]);
    }

    // 3. Fetch Users (Profiles) - Using data from step 1
    const { data: rolesData } = await supabase.from('user_roles').select('*');

    if (profilesData) {
      const customerProfiles = profilesData.filter((p) => {
        const userRoles = rolesData?.filter(r => r.user_id === p.user_id).map(r => r.role) || [];
        return !userRoles.includes('admin') && !userRoles.includes('moderator');
      });

      let rev = 0;
      let exp = 0;
      const PACKAGE_PRICES = { starter: 49, pro: 149, elite: 349 };

      const usersWithRolesAndAdvisors = customerProfiles.map((p) => {
        const userRoles = rolesData?.filter(r => r.user_id === p.user_id).map(r => r.role) || [];
        const userData: UserData = {
          ...p,
          roles: userRoles as ("admin" | "moderator" | "user" | "agency")[]
        } as unknown as UserData;

        if (userData.active_package && PACKAGE_PRICES[userData.active_package as keyof typeof PACKAGE_PRICES]) {
          const price = PACKAGE_PRICES[userData.active_package as keyof typeof PACKAGE_PRICES];
          rev += price;
          if (userData.assigned_advisor_id) {
            exp += price * 0.30; // 30% commission
          }
        }

        if (userData.assigned_advisor_id && advisorMap.has(userData.assigned_advisor_id)) {
          userData.advisor = advisorMap.get(userData.assigned_advisor_id);
        }

        return userData;
      });

      setFinancials({ revenue: rev, expenses: exp, net: rev - exp });
      setUsersList(usersWithRolesAndAdvisors);

      setStats(prev => ({ ...prev, totalUsers: customerProfiles.length }));
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

  const handleAssignAdvisor = async (userId: string, authUserId: string, advisorId: string | null) => {
    // RPC expects auth user_id to update profile (profiles.user_id = auth user)
    const { error: profileError } = await (supabase.rpc as any)('admin_assign_advisor', {
      p_user_id: authUserId,
      p_advisor_id: advisorId
    });

    if (profileError) {
      toast({ title: "Hata", description: "Profil ataması yapılamadı: " + profileError.message, variant: "destructive" });
      return;
    }

    // Assign or unassign applications so advisor panel stays in sync
    const { data: apps } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', authUserId);

    if (apps && apps.length > 0) {
      const appIds = apps.map(a => a.id);
      await supabase.from('advisor_assignments').delete().in('application_id', appIds);

      if (advisorId) {
        const assignments = apps.map(app => ({
          application_id: app.id,
          advisor_id: advisorId
        }));
        const { error: assignError } = await supabase.from('advisor_assignments').insert(assignments);
        if (assignError) {
          toast({ title: "Hata", description: "Danışman atandı ancak başvuru eşlemesi yapılamadı: " + assignError.message, variant: "destructive" });
          setAssignmentOpen(false);
          setAssignCustomerOpen(false);
          fetchData();
          return;
        }
      }
    }

    toast({ title: "Başarılı", description: "Danışman atandı." });
    setAssignmentOpen(false);
    setAssignCustomerOpen(false);
    fetchData();
  };

  const handleAssignPackage = async (userId: string, packageName: "starter" | "pro" | "elite" | null) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        active_package: packageName,
        package_assigned_at: packageName ? new Date().toISOString() : null
      } as any)
      .eq('id', userId);

    if (error) {
      toast({ title: "Hata", description: "Paket atanamadı: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: packageName ? `${packageName.toUpperCase()} paketi başarıyla atandı.` : "Paket kaldırıldı." });
      setAssignPackageOpen(false);
      fetchData();
    }
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
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleAgencyRole = async (userId: string, currentRoles: string[]) => {
    try {
      const isAgency = currentRoles.includes('agency');

      if (isAgency) {
        // Remove agency role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .match({ user_id: userId, role: 'agency' });

        if (error) throw error;
        toast({ title: "Başarılı", description: "Acenta rolü kaldırıldı." });
      } else {
        // Add agency role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'agency'
          });

        if (error) throw error;
        toast({ title: "Başarılı", description: "Acenta rolü tanımlandı." });
      }

      fetchData();
    } catch (e: any) {
      toast({ title: "Hata", description: "Rol güncellenirken bir hata oluştu: " + e.message, variant: "destructive" });
    }
  };

  const handleUndoReject = async (id: string) => {
    const { error } = await supabase.from('advisor_applications').update({ status: 'pending' } as never).eq('id', id);
    if (!error) {
      toast({ title: "Başarılı", description: "Reddedilme iptal edildi, başvuru tekrar beklemeye alındı." });
      fetchData();
    } else {
      toast({ title: "Hata", description: "İşlem başarısız: " + error.message, variant: "destructive" });
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

  const handleToggleAdvisor = (advisorId: string) => {
    setExpandedAdvisorId(prev => prev === advisorId ? null : advisorId);
  };

  const handleSuspendCustomer = async (userId: string, currentStatus: boolean | undefined) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('profiles').update({ is_suspended: newStatus } as never).eq('id', userId);
    if (error) {
      toast({ title: "Hata", description: "Durum güncellenemedi: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: newStatus ? "Müşteri askıya alındı." : "Müşteri aktifleştirildi." });
      fetchData();
    }
  };

  const handleDeleteCustomer = async (userId: string) => {
    const { error } = await supabase.rpc('delete_user' as any, { user_id: userId });
    if (error) {
      toast({ title: "Hata", description: "Müşteri silinemedi: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Müşteri profili silindi." });
      fetchData();
    }
  };

  if (authLoading || roleLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const navItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'users', label: 'Müşteriler', icon: Users },
    { id: 'advisors', label: 'Danışmanlar', icon: Briefcase },
    { id: 'agencies', label: 'Acenteler', icon: ShieldCheck },
    { id: 'applications', label: 'Vize Başvuruları', icon: FileText },
    { id: 'advisor-apps', label: 'Talep Onay', icon: Briefcase, badgeCount: advisorApplications.filter(a => a.status === 'pending').length || undefined },
    { id: 'financials', label: 'Finansallar', icon: TrendingUp },
  ];

  const filteredApplications = applications.filter((app) => {
    const applicantName = app.applicant_name || "";
    const appId = app.id || "";
    const matchesSearch = applicantName.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      appId.toLowerCase().includes(appSearchTerm.toLowerCase());
    const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportAppsCSV = () => {
    const headers = ["Başvuru No", "İsim", "Ülke", "Vize Türü", "Durum", "Tarih"];
    const rows = filteredApplications.map(app => [
      app.id,
      app.applicant_name,
      app.destination_country,
      app.visa_type,
      app.status,
      new Date(app.created_at).toLocaleDateString("tr-TR")
    ]);

    // Use proper BOM for Excel UTF-8 support
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "basvurular.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout
      titlePrefix="Sistem"
      titleSuffix="Denetim Merkezi"
      groupLabel="YÖNETİM"
      items={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      maxWidth="max-w-[1600px]"
    >
      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto overflow-hidden">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center shrink-0 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-navy-dark">Genel Bakış</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Sistem durumunu ve performans metriklerini buradan takip edebilirsiniz.</p>
            </div>
            <SyncAdvisorAssignmentsButton onSuccess={fetchData} toast={toast} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText size={80} className="text-navy-dark" />
              </div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Toplam Başvuru</h3>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-navy-dark">{stats.totalApplications}</p>
                <span className="text-xs text-emerald-500 font-bold mb-1 flex items-center bg-emerald-50 px-2 py-0.5 rounded-lg">
                  +%12 geçen aya göre
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users size={80} className="text-navy-dark" />
              </div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Aktif Kullanıcı</h3>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-navy-dark">{stats.totalUsers}</p>
                <span className="text-xs text-blue-500 font-black mb-1 flex items-center bg-blue-50 px-2 py-0.5 rounded-lg">
                  Sistemde
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Briefcase size={80} className="text-navy-dark" />
              </div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Aktif Danışman</h3>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-navy-dark">{stats.totalAdvisors}</p>
                <span className="text-xs text-violet-500 font-black mb-1 flex items-center bg-violet-50 px-2 py-0.5 rounded-lg">
                  Uzman
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={80} className="text-navy-dark" />
              </div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Net Gelir / Ciro</h3>
              <div className="flex flex-col gap-1 z-10 relative">
                <p className="text-3xl font-black text-emerald-600">€{financials.net.toLocaleString()}</p>
                <div className="flex justify-between items-center mt-1 border-t pt-3 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ciro</span>
                    <span className="text-sm font-black text-slate-600">€{financials.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Gider</span>
                    <span className="text-sm font-black text-rose-500">€{financials.expenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[0] pb-6">
            {/* 1. Revenue/Usage Trends (Area Chart) - Takes up 2 cols */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-navy-dark">Gelir Analizi</h3>
                  <p className="text-xs text-muted-foreground">Satın alınan paketlerin kümülatif büyümesi</p>
                </div>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[140px] rounded-lg">
                    <SelectValue placeholder="Aralık Seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1week">Son 1 Hafta</SelectItem>
                    <SelectItem value="1month">Son 1 Ay</SelectItem>
                    <SelectItem value="3months">Son 3 Ay</SelectItem>
                    <SelectItem value="6months">Son 6 Ay</SelectItem>
                    <SelectItem value="year">Son 1 Yıl</SelectItem>
                    <SelectItem value="all">Tüm Zamanlar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full min-h-[0] mt-2">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D69E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00D69E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                        formatter={(value: any, name: any) => [`€${value} `, name === 'cumulative' ? 'Kümülatif Ciro' : 'Aylık Ciro']}
                        cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        name="Kümülatif Ciro"
                        stroke="#0F172A"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCumulative)"
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Aylık Ciro"
                        stroke="#00D69E"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">Veri yükleniyor veya boş...</div>
                )}
              </div>
            </div>

            {/* 2. Status Distribution Pie Chart */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-navy-dark mb-1">Durum Dağılımı</h3>
              <p className="text-sm text-muted-foreground mb-6">Başvuruların güncel durumu</p>
              <div className="h-[300px] w-full flex justify-center items-center relative">
                {applications.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Onaylandı', value: applications.filter(a => a.status === 'completed').length, color: '#10B981' },
                          { name: 'İnceleniyor', value: applications.filter(a => a.status === 'pending_review').length, color: '#F59E0B' },
                          { name: 'Belge Bekliyor', value: applications.filter(a => a.status === 'pending_documents').length, color: '#3B82F6' },
                          { name: 'Reddedildi', value: applications.filter(a => a.status === 'rejected').length, color: '#EF4444' },
                          { name: 'Konsoloslukta', value: applications.filter(a => a.status === 'submitted').length, color: '#8B5CF6' },
                          { name: 'Taslak/Diğer', value: applications.filter(a => !['completed', 'pending_review', 'pending_documents', 'rejected', 'submitted'].includes(a.status)).length, color: '#9CA3AF' },
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        cornerRadius={6}
                      >
                        {[
                          { name: 'Onaylandı', color: '#10B981' },
                          { name: 'İnceleniyor', color: '#F59E0B' },
                          { name: 'Belge Bekliyor', color: '#3B82F6' },
                          { name: 'Reddedildi', color: '#EF4444' },
                          { name: 'Konsoloslukta', color: '#8B5CF6' },
                          { name: 'Taslak/Diğer', color: '#9CA3AF' },
                        ].map((entry, index) => (
                          <Cell key={`cell - ${index} `} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-sm italic">Veri yok</div>
                )}
                {/* Centered Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-navy-dark">{applications.length}</span>
                  <span className="text-xs text-muted-foreground">Toplam</span>
                </div>
              </div>
              {/* Custom Legend list */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                {[
                  { name: 'Onaylandı', color: '#10B981', count: applications.filter(a => a.status === 'completed').length },
                  { name: 'İnceleniyor', color: '#F59E0B', count: applications.filter(a => a.status === 'pending_review').length },
                  { name: 'Belge Bekliyor', color: '#3B82F6', count: applications.filter(a => a.status === 'pending_documents').length },
                  { name: 'Reddedildi', color: '#EF4444', count: applications.filter(a => a.status === 'rejected').length },
                  { name: 'Konsoloslukta', color: '#8B5CF6', count: applications.filter(a => a.status === 'submitted').length },
                  { name: 'Diğer', color: '#9CA3AF', count: applications.filter(a => !['completed', 'pending_review', 'pending_documents', 'rejected', 'submitted'].includes(a.status)).length },
                ].filter(i => i.count > 0).map(i => (
                  <div key={i.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i.color }}></span>
                    <span className="text-gray-600 font-medium">{i.name} ({i.count})</span>
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
              <Input
                placeholder="Başvuru ara..."
                className="pl-9 bg-white"
                value={appSearchTerm}
                onChange={(e) => setAppSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
                <SelectTrigger className="w-[160px] bg-white text-sm h-9">
                  <SelectValue placeholder="Durum Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending_documents">Belge Bekliyor</SelectItem>
                  <SelectItem value="pending_review">İncelemede</SelectItem>
                  <SelectItem value="submitted">Konsoloslukta</SelectItem>
                  <SelectItem value="completed">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExportAppsCSV}>Dışa Aktar</Button>
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
                {filteredApplications.map((app) => (
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
                          app.status === "completed" || app.status === "Onaylandı"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : app.status === "rejected" || app.status === "Reddedildi"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : app.status === "submitted" || app.status === "Gönderildi"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : app.status === "pending_review" || app.status === "İncelemede"
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }
                      >
                        {app.status === "completed" || app.status === "Onaylandı"
                          ? "Onaylandı"
                          : app.status === "rejected" || app.status === "Reddedildi"
                            ? "Reddedildi"
                            : app.status === "submitted" || app.status === "Gönderildi"
                              ? "Konsoloslukta"
                              : app.status === "pending_review" || app.status === "İncelemede"
                                ? "İncelemede"
                                : "Belge Bekliyor"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Button size="sm" variant="default" className="h-8 shadow-sm bg-navy-dark hover:bg-navy-light text-white" onClick={(e) => { e.stopPropagation(); setSelectedApplicationDetails(app); }}>İncele</Button>
                        <Select
                          defaultValue={app.status}
                          onValueChange={(val) => handleStatusUpdate(app.id, val)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Application Details Sheet */}
          <Sheet open={!!selectedApplicationDetails} onOpenChange={(open) => !open && setSelectedApplicationDetails(null)}>
            <SheetContent className="w-full sm:max-w-xl bg-slate-50 p-0 border-l-0 overflow-y-auto custom-scrollbar">
              {selectedApplicationDetails && (
                <div className="flex flex-col min-h-full">
                  <div className="bg-navy-dark p-10 pb-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <SheetHeader>
                      <SheetTitle className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center font-black text-2xl text-white backdrop-blur-sm border border-white/10">
                          {selectedApplicationDetails.applicant_name?.substring(0, 2).toUpperCase() || 'AP'}
                        </div>
                        <div className="flex flex-col items-start gap-1 text-left">
                          {selectedApplicationDetails.applicant_name || 'İsimsiz Başvuru'}
                          <Badge className={
                            selectedApplicationDetails.status === "completed" || selectedApplicationDetails.status === "Onaylandı"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1 text-xs"
                              : selectedApplicationDetails.status === "rejected" || selectedApplicationDetails.status === "Reddedildi"
                                ? "bg-red-500/20 text-red-300 border-red-500/30 px-3 py-1 text-xs"
                                : selectedApplicationDetails.status === "submitted" || selectedApplicationDetails.status === "Gönderildi"
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 text-xs"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1 text-xs"
                          }>
                            {selectedApplicationDetails.status === "completed" || selectedApplicationDetails.status === "Onaylandı"
                              ? "Onaylandı"
                              : selectedApplicationDetails.status === "rejected" || selectedApplicationDetails.status === "Reddedildi"
                                ? "Reddedildi"
                                : selectedApplicationDetails.status === "submitted" || selectedApplicationDetails.status === "Gönderildi"
                                  ? "Konsoloslukta"
                                  : selectedApplicationDetails.status === "pending_review" || selectedApplicationDetails.status === "İncelemede"
                                    ? "İncelemede"
                                    : "Belge Bekliyor"}
                          </Badge>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                  </div>

                  <div className="flex-1 p-8 -mt-8 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-4">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={16} /> Başvuru Detayları
                      </h4>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Hedef Ülke</span>
                        <span className="font-black text-navy-dark">{selectedApplicationDetails.destination_country}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Vize Türü</span>
                        <span className="font-black text-navy-dark">{selectedApplicationDetails.visa_type}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Pasaport Türü</span>
                        <span className="font-black text-navy-dark">{selectedApplicationDetails.passport_type}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Oluşturulma Tarihi</span>
                        <span className="font-black text-navy-dark">{new Date(selectedApplicationDetails.created_at).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
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
                {advisorApplications.filter(app => app.status !== 'approved').map((app) => (
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
                        {app.status === 'rejected' ? (
                          <Button size="sm" variant="outline" className="h-8 border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => handleUndoReject(app.id)}>
                            Reddi Kaldır / Tekrar İncele
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 border-green-200 h-8" onClick={() => handleApproveAdvisor(app)}>
                              <CheckCircle size={14} className="mr-1" /> Onayla
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200 h-8" onClick={() => handleRejectAdvisor(app.id)}>
                              <XCircle size={14} className="mr-1" /> Reddet
                            </Button>
                          </>
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
            <Button size="sm" className="bg-navy-dark hover:bg-navy-light text-white">
              <Plus size={16} className="mr-1" /> Yeni Danışman
            </Button>
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
                <Fragment key={adv.id}>
                  <TableRow className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={(e) => {
                    // Prevent expanding if clicking on buttons
                    if ((e.target as HTMLElement).closest('button')) return;
                    handleToggleAdvisor(adv.id);
                  }}>
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
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="default" className="h-8 shadow-sm bg-navy-dark hover:bg-navy-light text-white" onClick={(e) => { e.stopPropagation(); navigate(`/admin/advisor/${adv.id}`); }}>İncele</Button>
                        <Button size="sm" variant="outline" className="h-8 border-slate-200" onClick={(e) => { e.stopPropagation(); setSelectedAdvisorForCustomer(adv); setAssignCustomerOpen(true); }}>Müşteri Ata</Button>
                        <Button size="sm" variant="outline" className={`h - 8 ${!adv.is_active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} `} onClick={(e) => { e.stopPropagation(); handleUpdateAdvisorStatus(adv.id, !adv.is_active); }}>
                          {!adv.is_active ? "Erişimi Aç" : "Askıya Al"}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 px-3" onClick={(e) => e.stopPropagation()}>Sil</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Danışmanı Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu danışmanı veritabanından kalıcı olarak silmek istediğinize emin misiniz? Bu işlem iptal edilemez.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Vazgeç</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={(e) => { e.stopPropagation(); handleDeleteAdvisor(adv.id, adv.user_id); }}>Sil</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedAdvisorId === adv.id && (
                    <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                      <TableCell colSpan={5} className="p-0">
                        <div className="p-4 px-6 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                          <h4 className="text-sm font-bold text-navy-dark mb-3 flex items-center justify-between">
                            Atanmış Müşteriler
                            <Badge variant="outline" className="bg-white">{usersList.filter(u => u.assigned_advisor_id === adv.id).length} Kişi</Badge>
                          </h4>
                          {(() => {
                            const assignedUsers = usersList.filter(u => u.assigned_advisor_id === adv.id);
                            if (assignedUsers.length === 0) return <p className="text-xs text-muted-foreground bg-white border rounded-lg p-3">Henüz bir atama yapılmamış.</p>;
                            return (
                              <ul className="space-y-2">
                                {assignedUsers.map(u => (
                                  <li key={u.id} className="text-sm flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{u.full_name}</span>
                                      <span className="text-xs text-muted-foreground">{u.phone} • {u.email}</span>
                                    </div>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => e.stopPropagation()}>
                                          Atamayı Kaldır
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Atamayı Kaldır</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            <span className="font-bold text-navy-dark">{u.full_name}</span> isimli müşteriyi bu danışmandan almak istediğinize emin misiniz?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>İptal</AlertDialogCancel>
                                          <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={(e) => {
                                            e.stopPropagation();
                                            handleAssignAdvisor(u.id, u.user_id, null);
                                          }}>Kaldır</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </li>
                                ))}
                              </ul>
                            );
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>

          {/* Advisor Details Sheet */}
          <Sheet open={!!selectedAdvisorDetails} onOpenChange={(open) => !open && setSelectedAdvisorDetails(null)}>
            <SheetContent className="w-full sm:max-w-xl bg-slate-50 p-0 border-l-0 overflow-y-auto custom-scrollbar">
              {selectedAdvisorDetails && (
                <div className="flex flex-col min-h-full">
                  <div className="bg-navy-dark p-10 pb-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <SheetHeader>
                      <SheetTitle className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center font-black text-2xl text-white backdrop-blur-sm border border-white/10">
                          {selectedAdvisorDetails.full_name?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <div className="flex flex-col items-start gap-1 text-left">
                          {selectedAdvisorDetails.full_name || 'İsimsiz Danışman'}
                          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 px-3 py-1 text-xs">{selectedAdvisorDetails.is_active ? 'Aktif Uzman' : 'Pasif'}</Badge>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                  </div>

                  <div className="flex-1 p-8 -mt-8 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-4">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={16} /> Danışman Bilgileri
                      </h4>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Kayıtlı Müşteri Sayısı</span>
                        <span className="font-black text-navy-dark">{usersList.filter(u => u.assigned_advisor_id === selectedAdvisorDetails.id).length} Kişi</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Puan</span>
                        <span className="font-black text-amber-500">5.0 / 5.0</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                        <Button className="flex-1 rounded-xl bg-navy-dark text-white hover:bg-navy-light h-12 font-bold" onClick={() => {
                          setSelectedAdvisorDetails(null);
                          setSelectedAdvisorForCustomer(selectedAdvisorDetails);
                          setAssignCustomerOpen(true);
                        }}>
                          Yeni Müşteri Ata
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

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
                  {usersList
                    .filter(usr => !usr.assigned_advisor_id) // Sadece atanmamış müşteriler
                    .map((usr: UserData & { full_name?: string }) => (
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
                  {usersList.filter(usr => !usr.assigned_advisor_id).length === 0 && (
                    <p className="text-sm text-center text-muted-foreground mt-4 border border-dashed rounded-lg p-6">
                      Boşta olan bir müşteri bulunmamaktadır. Tüm müşteriler zaten bir danışmana atanmış durumda.
                    </p>
                  )}
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
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={async () => {
                // This is a helper to fix the user's initial complaint: 
                // "advisor ve müşteri eşleştirmesini kaldırıp tekrar eşleştirdim ama advisor panele müşteri hala yansımıyor."
                // This will ensure advisor_assignments table is in sync with profiles.assigned_advisor_id
                const { data: users } = await supabase.from('profiles').select('id, assigned_advisor_id');
                if (users) {
                  for (const u of users) {
                    if (u.assigned_advisor_id) {
                      const { data: apps } = await supabase.from('applications').select('id').eq('user_id', u.id);
                      if (apps) {
                        for (const app of apps) {
                          // Try to insert, ignore if already exists
                          await supabase.from('advisor_assignments').upsert({
                            application_id: app.id,
                            advisor_id: u.assigned_advisor_id
                          }, { onConflict: 'application_id, advisor_id' });
                        }
                      }
                    }
                  }
                  toast({ title: "Başarılı", description: "Tüm eşleşmeler senkronize edildi." });
                }
              }}>
                Eşleşmeleri Senkronize Et
              </Button>
              <Button size="sm" className="bg-navy-dark hover:bg-navy-light text-white">
                <Plus size={16} className="mr-1" /> Yeni Kullanıcı
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead>Atanan Danışman</TableHead>
                <TableHead>Aktif Paket</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((usr: UserData & { full_name?: string; phone?: string; id?: string; advisor?: Advisor }) => (
                <TableRow key={usr.id} className={usr.is_suspended ? "opacity-50 line-through" : ""}>
                  <TableCell className="font-medium">
                    {usr.full_name || 'İsimsiz'}
                    <div className="text-xs text-muted-foreground">ID: {usr.id}</div>
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
                  <TableCell>
                    {usr.active_package ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 capitalize">
                        {usr.active_package}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Paket Yok</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Button size="sm" variant="default" className="h-8 shadow-sm bg-navy-dark hover:bg-navy-light text-white" onClick={(e) => { e.stopPropagation(); navigate(`/admin/customer/${usr.id}`); }}>İncele</Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-8 transition-colors ${usr.roles.includes('agency') ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'border-slate-200'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAgencyRole(usr.user_id, usr.roles);
                        }}
                      >
                        {usr.roles.includes('agency') ? 'Acenta Rolünü Kaldır' : 'Acenta Yap'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 border-slate-200">Düzenle</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:bg-red-50">Sil</Button>

                      {!usr.is_suspended && (
                        <Sheet open={assignmentOpen} onOpenChange={setAssignmentOpen}>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 border-slate-200" onClick={(e) => { e.stopPropagation(); setSelectedUser(usr); setAssignmentOpen(true); }}>
                              {usr.advisor ? "Danışman Değiştir" : "Danışman Ata"}
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Danışman Ata</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 space-y-4 text-left">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-bold text-navy-dark">{selectedUser?.full_name}</span> adlı kullanıcıya danışman atayın.
                              </p>
                              <div className="space-y-2">
                                {activeAdvisorsList.map(adv => (
                                  <div key={adv.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer text-left"
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
                                {selectedUser?.assigned_advisor_id && (
                                  <div className="mt-6 pt-4 border-t">
                                    <Button variant="destructive" className="w-full h-10" onClick={() => {
                                      if (selectedUser.id && selectedUser.user_id) {
                                        handleAssignAdvisor(selectedUser.id, selectedUser.user_id, null);
                                      }
                                    }}>
                                      Mevcut Atamayı Kaldır
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      )}

                      <Sheet open={assignPackageOpen} onOpenChange={setAssignPackageOpen}>
                        <SheetTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); setSelectedUserForPackage(usr); setAssignPackageOpen(true); }}>
                            {usr.active_package ? "Paket Değiştir" : "Paket Ata"}
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Paket Tanımla</SheetTitle>
                          </SheetHeader>
                          <div className="py-6 space-y-6 text-left">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-bold text-navy-dark">{selectedUserForPackage?.full_name}</span> adlı kullanıcıya vize paketi tanımlayın.
                            </p>

                            <div className="grid gap-4">
                              {[
                                { id: 'starter', name: 'Starter', desc: 'Dijital rehber + AI kontrol', color: 'bg-slate-100' },
                                { id: 'pro', name: 'Pro', desc: 'Uzman inceleme + randevu', color: 'bg-blue-50' },
                                { id: 'elite', name: 'Elite', desc: 'VIP hizmet + %100 iade', color: 'bg-purple-50' }
                              ].map((pkg) => (
                                <div
                                  key={pkg.id}
                                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-400 ${pkg.color} ${selectedUserForPackage?.active_package === pkg.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'}`}
                                  onClick={() => handleAssignPackage(selectedUserForPackage!.id, pkg.id as any)}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-lg">{pkg.name}</span>
                                    {selectedUserForPackage?.active_package === pkg.id && <Badge className="bg-blue-500">Aktif</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{pkg.desc}</p>
                                </div>
                              ))}
                            </div>

                            {selectedUserForPackage?.active_package && (
                              <Button
                                variant="ghost"
                                className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => handleAssignPackage(selectedUserForPackage.id, null)}
                              >
                                Mevcut Paketi Kaldır
                              </Button>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>

                      <Button size="sm" variant="outline" className={`h-8 ${usr.is_suspended ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`} onClick={(e) => { e.stopPropagation(); handleSuspendCustomer(usr.id, usr.is_suspended); }}>
                        {usr.is_suspended ? "Erişimi Aç" : "Askıya Al"}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 px-3" onClick={(e) => e.stopPropagation()}>Sil</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu müşterinin profilini kalıcı olarak silmek istediğinize emin misiniz? (Üye girişi tamamen engellenecektir ve veri tabanından silinecektir)
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>İptal</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(usr.id); }}>
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* User Details Sheet */}
          <Sheet open={!!selectedUserDetails} onOpenChange={(open) => !open && setSelectedUserDetails(null)}>
            <SheetContent className="w-full sm:max-w-xl bg-slate-50 p-0 border-l-0 overflow-y-auto custom-scrollbar">
              {selectedUserDetails && (
                <div className="flex flex-col min-h-full">
                  <div className="bg-navy-dark p-10 pb-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <SheetHeader>
                      <SheetTitle className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center font-black text-2xl text-white backdrop-blur-sm border border-white/10">
                          {selectedUserDetails.full_name?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div className="flex flex-col items-start gap-1 text-left">
                          {selectedUserDetails.full_name || 'İsimsiz Müşteri'}
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 text-xs">Müşteri Profili</Badge>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                  </div>

                  <div className="flex-1 p-8 -mt-8 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-4">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Users size={16} /> Temel Bilgiler
                      </h4>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Kayıt Tarihi</span>
                        <span className="font-black text-navy-dark">{new Date(selectedUserDetails.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">E-posta</span>
                        <span className="font-black text-navy-dark">{selectedUserDetails.email || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Telefon</span>
                        <span className="font-black text-navy-dark">{selectedUserDetails.phone || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Aktif Paket</span>
                        <span className="font-black text-blue-600 capitalize">{selectedUserDetails.active_package || 'Yok'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Danışman</span>
                        <span className="font-black text-emerald-600">{selectedUserDetails.advisor?.full_name || 'Atanmadı'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

        </div>
      )}

      {/* FINANCIALS TAB */}
      {activeTab === 'financials' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-navy-dark tracking-tight">Muhasebe ve Finans</h2>
              <p className="text-slate-500 font-medium mt-1">Tüm gelir ve gider (komisyon) kayıtları tablosu</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="rounded-2xl font-bold h-12 shadow-sm border-slate-200">Dışa Aktar</Button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 relative overflow-hidden group hover:border-emerald-200 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={80} className="text-emerald-900" />
              </div>
              <p className="text-emerald-800 font-bold uppercase text-xs tracking-widest mb-2">Toplam Ciro (Gelir)</p>
              <p className="text-4xl font-black text-emerald-600">€{financials.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100/50 relative overflow-hidden group hover:border-rose-200 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText size={80} className="text-rose-900" />
              </div>
              <p className="text-rose-800 font-bold uppercase text-xs tracking-widest mb-2">Toplam Komisyon (Gider)</p>
              <p className="text-4xl font-black text-rose-500">€{financials.expenses.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 relative overflow-hidden group hover:border-blue-200 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <LayoutDashboard size={80} className="text-blue-900" />
              </div>
              <p className="text-blue-800 font-bold uppercase text-xs tracking-widest mb-2">Net Kar</p>
              <p className="text-4xl font-black text-blue-600">€{financials.net.toLocaleString()}</p>
            </div>
          </div>

          {/* T-Table (T-Cetveli) Layout */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
            {/* Income Side */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-slate-50/10">
              <div className="bg-emerald-50/30 p-5 border-b border-emerald-100/50 text-center sticky top-0 z-10">
                <h3 className="font-black text-emerald-600 text-lg uppercase tracking-[0.3em]">GELİRLER</h3>
              </div>
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100/50">
                      <TableHead className="font-bold text-slate-400">Tarih</TableHead>
                      <TableHead className="font-bold text-slate-400">Açıklama</TableHead>
                      <TableHead className="text-right font-bold text-slate-400">Tutar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialTransactions.filter(t => t.type === 'income').map((t, idx) => (
                      <TableRow key={idx} className="border-slate-50 group hover:bg-emerald-50/20">
                        <TableCell className="text-xs font-medium text-slate-500">{new Date(t.date).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>
                          <div className="font-black text-navy-dark text-sm">{t.category}</div>
                          <div className="text-xs font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">{t.customerName}</div>
                        </TableCell>
                        <TableCell className="text-right font-black text-emerald-600 text-base">+€{t.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {financialTransactions.filter(t => t.type === 'income').length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400 font-medium h-32">Gelir kaydı bulunamadı.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Expense Side */}
            <div className="flex-1 flex flex-col bg-slate-50/10">
              <div className="bg-rose-50/30 p-5 border-b border-rose-100/50 text-center sticky top-0 z-10">
                <h3 className="font-black text-rose-500 text-lg uppercase tracking-[0.3em]">GİDERLER</h3>
              </div>
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100/50">
                      <TableHead className="font-bold text-slate-400">Tarih</TableHead>
                      <TableHead className="font-bold text-slate-400">Açıklama</TableHead>
                      <TableHead className="text-right font-bold text-slate-400">Tutar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialTransactions.filter(t => t.type === 'expense').map((t, idx) => (
                      <TableRow key={idx} className="border-slate-50 group hover:bg-rose-50/20">
                        <TableCell className="text-xs font-medium text-slate-500">{new Date(t.date).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>
                          <div className="font-black text-navy-dark text-sm">{t.category}</div>
                          <div className="text-xs font-bold text-slate-400 group-hover:text-rose-700 transition-colors">{t.advisorName} ({t.customerName})</div>
                        </TableCell>
                        <TableCell className="text-right font-black text-rose-500 text-base">-€{t.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {financialTransactions.filter(t => t.type === 'expense').length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400 font-medium h-32">Gider kaydı bulunamadı.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AGENCIES TAB */}
      {activeTab === 'agencies' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
            <h3 className="font-semibold">Tüm Acenteler</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acente</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.filter(u => u.roles.includes('agency')).length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Acente bulunamadı.</TableCell></TableRow>
              ) : (
                usersList.filter(u => u.roles.includes('agency')).map((usr) => (
                  <TableRow key={usr.id}>
                    <TableCell className="font-medium">
                      {usr.full_name || 'İsimsiz'}
                      <div className="text-xs text-muted-foreground">ID: {usr.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{usr.email}</div>
                      <div className="text-xs text-muted-foreground">{usr.phone}</div>
                    </TableCell>
                    <TableCell>{new Date(usr.created_at).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="default" className="h-8 shadow-sm bg-navy-dark hover:bg-navy-light text-white" onClick={() => navigate(`/admin/customer/${usr.id}`)}>İncele</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleToggleAgencyRole(usr.user_id, usr.roles)}
                        >
                          Acente Rolünü Kaldır
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

    </DashboardLayout>
  );
}
