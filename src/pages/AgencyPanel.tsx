import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { DashboardLayout, SidebarItem } from "@/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Settings,
  Users,
  Search,
  Plus,
  ChevronDown,
  Phone,
  Package,
  MapPin,
  Upload,
  X,
  MessageSquare,
  Bot,
  Loader2,
  Mail,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCenter } from "@/components/MessageCenter";
import AIDashboardChat from "@/components/AIDashboardChat";
import AIApplicationSummary from "@/components/AIApplicationSummary";
import { destinations } from "@/data/countries";
import { getRequirements } from "@/data/visaRequirements";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Application = {
  id: string;
  applicant_name: string;
  destination_country: string;
  visa_type: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
  user_id: string;
  profile_id: string;
  phone?: string | null;
  plan?: string;
  reference_id?: string;
  travel_date?: string | null;
};

type Customer = {
  user_id: string;
  profile_id: string;
  applicant_name: string;
  phone?: string | null;
  email?: string | null;
  plan?: string;
  applications: Application[];
};

const PLANS = [
  { id: "starter", name: "Starter" },
  { id: "pro", name: "Pro" },
  { id: "elite", name: "Elite" },
];
const VISA_TYPES = ["Turist Vizesi", "İş Vizesi", "Öğrenci Vizesi", "Aile Birleşim Vizesi"];

export default function AgencyPanel() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalApplications: 0,
    pendingReview: 0,
    pendingAction: 0,
    completed: 0,
  });
  const [timeFilter, setTimeFilter] = useState("1month");
  const [chartData, setChartData] = useState<{ name: string; value: number; cumulative: number }[]>([]);
  const [appDocs, setAppDocs] = useState<Record<string, { name: string; url: string }[]>>({});
  const [expandedCustomerIds, setExpandedCustomerIds] = useState<string[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<{ id: string; name: string } | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [addCustomerEmail, setAddCustomerEmail] = useState("");
  const [addCustomerSearchResult, setAddCustomerSearchResult] = useState<{
    profile_id: string;
    full_name: string | null;
    already_linked: boolean;
  } | null>(null);
  const [linkingCustomer, setLinkingCustomer] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [isCreateAppOpen, setIsCreateAppOpen] = useState(false);
  const [createAppCustomerId, setCreateAppCustomerId] = useState<string | null>(null);
  const [createAppDestination, setCreateAppDestination] = useState("");
  const [createAppVisaType, setCreateAppVisaType] = useState("");
  const [createAppPlan, setCreateAppPlan] = useState("pro");
  const [creatingApp, setCreatingApp] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedAppForUpload, setSelectedAppForUpload] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/agency-login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  useEffect(() => {
    const tab = (location.state as { tab?: string })?.tab;
    if (tab && ["dashboard", "customers", "messages", "ai-assistant", "analytics", "settings"].includes(tab)) {
      setActiveTab(tab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: profileList } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, phone, email, active_package")
      .eq("agency_id", user.id);

    const customerUserIds = profileList?.map((p) => p.user_id) || [];
    if (customerUserIds.length === 0) {
      setCustomers([]);
      setApplications([]);
      setStats({ totalCustomers: 0, totalApplications: 0, pendingReview: 0, pendingAction: 0, completed: 0 });
      setChartData([]);
      setLoading(false);
      return;
    }

    const { data: appsData } = await supabase
      .from("applications")
      .select("*, profiles(id, full_name, phone)")
      .in("user_id", customerUserIds)
      .order("created_at", { ascending: false });

    const appList: Application[] = (appsData || []).map((app: any) => ({
      id: app.id,
      applicant_name: app.profiles?.full_name || "İsimsiz",
      destination_country: app.destination,
      visa_type: app.visa_type,
      status: app.status || "Alındı",
      created_at: app.created_at,
      updated_at: app.updated_at,
      user_id: app.user_id,
      profile_id: app.profiles?.id ?? "",
      phone: app.profiles?.phone,
      plan: app.plan,
      reference_id: app.reference_id,
    }));

    const customerMap = new Map<string, Customer>();
    profileList?.forEach((p: any) => {
      customerMap.set(p.user_id, {
        user_id: p.user_id,
        profile_id: p.id,
        applicant_name: p.full_name || "İsimsiz",
        phone: p.phone,
        email: p.email,
        plan: p.active_package || undefined,
        applications: [],
      });
    });
    appList.forEach((app) => {
      const c = customerMap.get(app.user_id);
      if (c) {
        c.applications.push(app);
      }
    });
    setCustomers(Array.from(customerMap.values()));
    setApplications(appList);

    const appIds = appList.map((a) => a.id);
    if (appIds.length > 0) {
      const { data: docsData } = await supabase
        .from("application_documents")
        .select("application_id, name, url")
        .in("application_id", appIds);
      const docMap: Record<string, { name: string; url: string }[]> = {};
      (docsData || []).forEach((d: any) => {
        if (!docMap[d.application_id]) docMap[d.application_id] = [];
        docMap[d.application_id].push({ name: d.name, url: d.url });
      });
      setAppDocs(docMap);
    } else {
      setAppDocs({});
    }

    const pendingReview = appList.filter(
      (a) => a.status === "Alındı" || a.status === "İnceleniyor"
    ).length;
    const pendingAction = appList.filter((a) => a.status === "İşlem Gerekli").length;
    const completed = appList.filter(
      (a) => a.status === "Onaylandı" || a.status === "Tamamlandı"
    ).length;

    setStats({
      totalCustomers: profileList?.length || 0,
      totalApplications: appList.length,
      pendingReview,
      pendingAction,
      completed,
    });

    setLoading(false);
  };

  useEffect(() => {
    if (applications.length === 0) return;
    const now = new Date();
    let daysToGenerate = 30;
    let viewType: "day" | "month" = "day";
    if (timeFilter === "1week") daysToGenerate = 7;
    else if (timeFilter === "1month") daysToGenerate = 30;
    else if (timeFilter === "3months" || timeFilter === "6months") {
      daysToGenerate = timeFilter === "3months" ? 90 : 180;
      viewType = "month";
    } else if (timeFilter === "year" || timeFilter === "all") {
      daysToGenerate = timeFilter === "year" ? 365 : 730;
      viewType = "month";
    }
    const dataObj: Record<string, { name: string; value: number; cumulative: number }> = {};
    if (viewType === "day") {
      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        dataObj[key] = { name: d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }), value: 0, cumulative: 0 };
      }
    } else {
      const months = timeFilter === "year" ? 12 : timeFilter === "all" ? 24 : timeFilter === "3months" ? 3 : 6;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        dataObj[key] = { name: d.toLocaleString("tr-TR", { month: "short" }), value: 0, cumulative: 0 };
      }
    }
    applications.forEach((app) => {
      const created = new Date(app.created_at);
      const key = viewType === "day" ? `${created.getFullYear()}-${created.getMonth()}-${created.getDate()}` : `${created.getFullYear()}-${created.getMonth()}`;
      if (dataObj[key]) dataObj[key].value += 1;
    });
    let running = 0;
    const sortedKeys = Object.keys(dataObj).sort();
    sortedKeys.forEach((k) => {
      running += dataObj[k].value;
      dataObj[k].cumulative = running;
    });
    setChartData(sortedKeys.map((k) => dataObj[k]));
  }, [applications, timeFilter]);

  const toggleCustomerExpand = (userId: string) => {
    setExpandedCustomerIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSearchCustomer = async () => {
    const email = addCustomerEmail.trim();
    if (!email) {
      toast({ title: "E-posta girin", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase.rpc("agency_search_customer_by_email", { p_email: email });
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
      setAddCustomerSearchResult(null);
      return;
    }
    const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
    setAddCustomerSearchResult(
      row
        ? {
            profile_id: row.profile_id,
            full_name: row.full_name,
            already_linked: row.already_linked,
          }
        : null
    );
  };

  const handleLinkCustomer = async () => {
    if (!addCustomerSearchResult || addCustomerSearchResult.already_linked) return;
    setLinkingCustomer(true);
    const { error } = await supabase.rpc("agency_link_customer", {
      p_profile_id: addCustomerSearchResult.profile_id,
    });
    setLinkingCustomer(false);
    if (error) {
      toast({ title: "Bağlama hatası", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Müşteri acentaya bağlandı" });
    setAddCustomerEmail("");
    setAddCustomerSearchResult(null);
    setIsAddCustomerOpen(false);
    fetchData();
  };

  const handleSendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      toast({ title: "E-posta girin", variant: "destructive" });
      return;
    }
    setSendingInvite(true);
    const { error } = await supabase.from("agency_invites").insert({
      agency_user_id: user!.id,
      email,
      full_name: inviteName.trim() || null,
      phone: invitePhone.trim() || null,
    });
    setSendingInvite(false);
    if (error) {
      toast({ title: "Davetiye gönderilemedi", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Davetiye kaydedildi", description: "Müşteri bu e-posta ile kayıt olduğunda otomatik acentanıza bağlanacak." });
    setInviteEmail("");
    setInviteName("");
    setInvitePhone("");
    setIsInviteOpen(false);
  };

  const handleCreateApplication = async () => {
    const customer = customers.find((c) => c.user_id === createAppCustomerId);
    if (!customer || !createAppDestination || !createAppVisaType || !createAppPlan) {
      toast({ title: "Müşteri, hedef ve vize türü seçin", variant: "destructive" });
      return;
    }
    setCreatingApp(true);
    const refId = `VP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { error } = await supabase.from("applications").insert({
      user_id: customer.user_id,
      reference_id: refId,
      destination: createAppDestination,
      visa_type: createAppVisaType,
      plan: createAppPlan,
      status: "Alındı",
      created_by_agency_id: user!.id,
    });
    setCreatingApp(false);
    if (error) {
      toast({ title: "Başvuru oluşturulamadı", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Başvuru oluşturuldu", description: `Referans: ${refId}` });
    setIsCreateAppOpen(false);
    setCreateAppCustomerId(null);
    setCreateAppDestination("");
    setCreateAppVisaType("");
    setCreateAppPlan("pro");
    fetchData();
  };

  const handleAgencyUploadDocument = async (appId: string, file: File) => {
    if (!file || !newDocName || !user) return;
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `agency-uploads/${user.id}/${appId}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);
    if (uploadError) {
      toast({ title: "Yükleme hatası", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(filePath);
    const { error: dbError } = await supabase.from("application_documents").insert({
      application_id: appId,
      advisor_id: null,
      name: newDocName,
      url: publicUrl,
    });
    if (dbError) {
      toast({ title: "Kayıt hatası", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Belge yüklendi" });
      setNewDocName("");
      setIsUploadDialogOpen(false);
      setSelectedAppForUpload(null);
      fetchData();
    }
    setUploading(false);
  };

  const filteredCustomers = customers.filter((c) =>
    c.applicant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems: SidebarItem[] = [
    { id: "dashboard", label: t("agency.dashboard"), icon: LayoutDashboard },
    { id: "customers", label: "Müşterilerim", icon: Users },
    { id: "messages", label: "Mesajlar", icon: MessageSquare },
    { id: "ai-assistant", label: "AI Asistan", icon: Bot },
    { id: "analytics", label: t("agency.analytics"), icon: TrendingUp },
    { id: "settings", label: t("agency.settings"), icon: Settings },
  ];

  if (authLoading) return null;

  return (
    <DashboardLayout
      titlePrefix="Kurumsal"
      titleSuffix="Acenta Paneli"
      items={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      maxWidth="max-w-[1600px]"
      noPadding={activeTab === "messages" || activeTab === "ai-assistant"}
    >
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-navy-dark">
                {t("agency.dashboard")}
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Müşterilerinizi yönetin, belgeleri yükleyin ve başvuruları takip edin.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-2xl h-14 px-6 font-black border-slate-200"
                onClick={() => setIsInviteOpen(true)}
              >
                Davetiye Gönder
              </Button>
              <Button
                className="rounded-2xl h-14 px-8 font-black bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
                onClick={() => {
                  setIsAddCustomerOpen(true);
                  setAddCustomerSearchResult(null);
                }}
              >
                <UserPlus className="mr-2 h-5 w-5" /> Müşteri Ekle
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Müşteri Sayısı</p>
                  <p className="text-4xl font-black text-navy-dark">{stats.totalCustomers}</p>
                </div>
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("agency.totalApplications")}</p>
                  <p className="text-4xl font-black text-navy-dark">{stats.totalApplications}</p>
                </div>
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("agency.pendingReview")}</p>
                  <p className="text-4xl font-black text-navy-dark">{stats.pendingReview}</p>
                </div>
                <div className="bg-white p-7 rounded-[2.5rem] border border-amber-100 shadow-sm">
                  <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">İşlem Bekleyen</p>
                  <p className="text-4xl font-black text-amber-600">{stats.pendingAction}</p>
                </div>
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("agency.completedVisas")}</p>
                  <p className="text-4xl font-black text-navy-dark">{stats.completed}</p>
                </div>
              </div>

              {/* AI Özeti: Hangi müşterinin hangi işi yapılacak */}
              {applications.filter((a) => a.status !== "Onaylandı" && a.status !== "Tamamlandı").length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-[2.5rem] p-8 border border-purple-100/50 shadow-sm">
                  <h3 className="text-xl font-black text-navy-dark mb-2 flex items-center gap-3">
                    <Bot className="w-6 h-6 text-purple-500" /> Yapılacak İşler Özeti
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-6">Hangi müşterinin hangi işlemi beklemesi gerektiği</p>
                  <ul className="space-y-3">
                    {applications
                      .filter((a) => a.status !== "Onaylandı" && a.status !== "Tamamlandı")
                      .slice(0, 15)
                      .map((app) => {
                        const action =
                          app.status === "İşlem Gerekli"
                            ? "Aksiyon gerekli (durum güncelle veya belge tamamla)"
                            : app.status === "İnceleniyor"
                            ? "İnceleme devam ediyor"
                            : "Belge/ bilgi bekleniyor";
                        return (
                          <li
                            key={app.id}
                            className="flex flex-wrap items-center gap-2 p-4 bg-white/80 rounded-2xl border border-slate-100 hover:border-purple-100"
                          >
                            <span className="font-black text-navy-dark">{app.applicant_name}</span>
                            <span className="text-slate-400">·</span>
                            <Badge variant="outline" className="rounded-lg font-bold">{app.destination_country} — {app.visa_type}</Badge>
                            <span className="text-slate-400">→</span>
                            <span className="text-sm font-bold text-slate-600">{action}</span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}

              {chartData.length > 0 && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[350px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-navy-dark">Başvuru Trendi</h3>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-[160px] rounded-xl border-slate-200 font-bold">
                        <SelectValue placeholder="Aralık" />
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
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="agencyColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="agencyCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "1.5rem", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                        formatter={(value: number, name: string) => [value, name === "cumulative" ? "Kümülatif" : "Dönem"]}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="cumulative" name="Kümülatif" stroke="#0F172A" strokeWidth={2} fill="url(#agencyCumulative)" />
                      <Area type="monotone" dataKey="value" name="Dönem" stroke="#10b981" strokeWidth={3} fill="url(#agencyColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {applications.length > 0 && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-50">
                    <h3 className="text-xl font-black text-navy-dark">{t("agency.recentApps")}</h3>
                    <p className="text-sm text-slate-400 font-bold">Son başvurular</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="font-black text-slate-400 text-xs uppercase">Referans</TableHead>
                        <TableHead className="font-black text-slate-400 text-xs uppercase">Başvuru Sahibi</TableHead>
                        <TableHead className="font-black text-slate-400 text-xs uppercase">Hedef</TableHead>
                        <TableHead className="font-black text-slate-400 text-xs uppercase">Vize Türü</TableHead>
                        <TableHead className="font-black text-slate-400 text-xs uppercase">Durum</TableHead>
                        <TableHead className="font-black text-slate-400 text-xs uppercase text-right">Tarih</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.slice(0, 10).map((app) => (
                        <TableRow
                          key={app.id}
                          className="border-slate-50 cursor-pointer hover:bg-slate-50/80 transition-colors"
                          onClick={() => navigate(`/agency/application/${app.id}`)}
                        >
                          <TableCell className="font-mono font-black text-navy-dark">{app.reference_id || app.id.slice(0, 8)}</TableCell>
                          <TableCell className="font-bold text-slate-600">{app.applicant_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-xl border-slate-200 font-bold">
                              {app.destination_country}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-slate-400">{app.visa_type}</TableCell>
                          <TableCell>
                            <Badge
                              className={`rounded-full px-4 py-1.5 font-black text-xs uppercase ${
                                app.status === "Onaylandı" || app.status === "Tamamlandı"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : app.status === "Alındı" || app.status === "İnceleniyor"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-400">
                            {format(new Date(app.created_at), "d MMM yyyy", { locale: tr })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "customers" && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-black text-navy-dark tracking-tight">Müşterilerim</h2>
              <p className="text-slate-500 font-medium mt-1">Müşterileri yönetin, başvuru ekleyin ve belge yükleyin.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-2xl h-12" onClick={() => setIsInviteOpen(true)}>
                Davetiye Gönder
              </Button>
              <Button
                className="rounded-2xl h-12 bg-emerald-500 hover:bg-emerald-600"
                onClick={() => {
                  setIsAddCustomerOpen(true);
                  setAddCustomerSearchResult(null);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" /> Müşteri Ekle
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder={t("agency.searchPlaceholder")}
              className="pl-12 h-12 w-full max-w-md rounded-2xl border-slate-100 font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => {
                const isExpanded = expandedCustomerIds.includes(customer.user_id);
                const hasApplications = customer.applications.length > 0;
                return (
                  <div
                    key={customer.user_id}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                  >
                    <div
                      className={`p-6 cursor-pointer flex items-center justify-between ${isExpanded ? "bg-slate-50/50" : "hover:bg-slate-50/30"}`}
                      onClick={() => toggleCustomerExpand(customer.user_id)}
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-navy-dark font-black text-xl">
                          {customer.applicant_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-navy-dark">{customer.applicant_name}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                              <Phone size={12} /> {customer.phone || "-"}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                              <Mail size={12} /> {customer.email || "-"}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                              <Package size={12} /> {customer.plan || "Plan Yok"}
                            </span>
                            <span className="text-xs font-bold text-slate-400">{customer.applications.length} başvuru</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {hasApplications && (
                          <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">
                            {customer.applications.length} Başvuru
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          className="rounded-xl bg-navy-dark hover:bg-navy-light text-white font-black text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCreateAppCustomerId(customer.user_id);
                            setIsCreateAppOpen(true);
                          }}
                        >
                          <Plus size={14} className="mr-1" /> Başvuru Ekle
                        </Button>
                        <div className={`p-2 rounded-xl ${isExpanded ? "rotate-180 bg-navy-dark text-white" : "bg-slate-100 text-slate-400"}`}>
                          <ChevronDown size={20} />
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 bg-slate-50/50 space-y-4">
                        {hasApplications ? (
                          customer.applications.map((app) => (
                            <div
                              key={app.id}
                              className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
                              onClick={() => navigate(`/agency/application/${app.id}`)}
                            >
                              <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                  <MapPin size={24} />
                                </div>
                                <div>
                                  <p className="font-black text-navy-dark">{app.destination_country} — {app.visa_type}</p>
                                  <p className="text-xs font-bold text-slate-400">#{app.reference_id || app.id.slice(0, 8)} · {app.status}</p>
                                </div>
                              </div>
                              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() => {
                                    setSelectedAppForUpload(app.id);
                                    setNewDocName("");
                                    setIsUploadDialogOpen(true);
                                  }}
                                >
                                  <Upload size={14} className="mr-1" /> Belge Yükle
                                </Button>
                                <Button size="sm" className="rounded-xl bg-navy-dark hover:bg-navy-light text-white font-bold" onClick={() => navigate(`/agency/application/${app.id}`)}>
                                  Detay
                                </Button>
                              </div>
                              {appDocs[app.id] && appDocs[app.id].length > 0 && (
                                <div className="w-full md:w-auto text-xs font-bold text-slate-500" onClick={(e) => e.stopPropagation()}>
                                  {appDocs[app.id].length} belge yüklü
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm font-bold text-slate-400 italic py-4">Henüz başvuru yok. &quot;Başvuru Ekle&quot; ile oluşturun.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredCustomers.length === 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
                  <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold">Henüz müşteri yok.</p>
                  <p className="text-sm text-slate-400 mt-1">E-posta ile mevcut kullanıcıyı ekleyin veya davetiye gönderin.</p>
                  <div className="flex gap-3 justify-center mt-6">
                    <Button onClick={() => setIsAddCustomerOpen(true)} className="rounded-2xl bg-emerald-500 hover:bg-emerald-600">
                      Müşteri Ekle
                    </Button>
                    <Button variant="outline" onClick={() => setIsInviteOpen(true)} className="rounded-2xl">
                      Davetiye Gönder
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "messages" && (
        <div className="flex h-full w-full bg-slate-50 overflow-hidden">
          <div className="w-[350px] border-r border-slate-200 bg-white flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-2xl font-black text-navy-dark">Görüşmeler</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {customers.map((c) => (
                <div
                  key={c.user_id}
                  className={`p-6 rounded-3xl cursor-pointer transition-all ${selectedChatUser?.id === c.user_id ? "bg-white shadow-xl border border-emerald-100" : "hover:bg-slate-50"}`}
                  onClick={() => setSelectedChatUser({ id: c.user_id, name: c.applicant_name })}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-dark to-navy-light text-white flex items-center justify-center font-black text-lg">
                      {c.applicant_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-navy-dark">{c.applicant_name}</p>
                      <p className="text-sm font-bold text-slate-400">{c.applications.length} başvuru</p>
                    </div>
                  </div>
                </div>
              ))}
              {customers.length === 0 && <p className="text-center py-20 text-slate-400 font-bold">Müşteri bulunmuyor.</p>}
            </div>
          </div>
          <div className="flex-1 bg-slate-50 flex flex-col border-l border-slate-100">
            {selectedChatUser ? (
              <MessageCenter
                currentUserId={user!.id}
                targetUserId={selectedChatUser.id}
                targetUserName={selectedChatUser.name}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100/80">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <MessageSquare size={48} className="text-slate-300" />
                </div>
                <p className="text-xl font-bold text-slate-500">Mesajlaşmak için bir müşteri seçin</p>
                <p className="text-sm text-slate-400 mt-1">Sol listeden müşteri seçin</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "ai-assistant" && (
        <div className="h-full flex flex-col p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-navy-dark">AI Asistan</h2>
            <p className="text-slate-500 font-medium">Vize süreçleri ve belgeler hakkında soru sorun.</p>
          </div>
          <div className="flex-1 min-h-0 rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <AIDashboardChat
              persistKey={user?.id ? `agency-ai-chat-${user.id}` : undefined}
              context={
                applications.length > 0
                  ? {
                      applications: applications.map((a) => ({
                        referenceId: a.reference_id,
                        destination: a.destination_country,
                        visaType: a.visa_type,
                        status: a.status,
                        travelDate: a.travel_date ?? undefined,
                      })),
                      destination: applications[0].destination_country,
                      visaType: applications[0].visa_type,
                      status: applications[0].status,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
          <h2 className="text-4xl font-black text-navy-dark">{t("agency.analytics")}</h2>

          {applications.length > 0 ? (
            <>
              {/* Gerçek performans metrikleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Durum Dağılımı</p>
                  <div className="space-y-2 mt-3">
                    {[
                      { label: "Alındı / İnceleniyor", count: applications.filter((a) => a.status === "Alındı" || a.status === "İnceleniyor").length },
                      { label: "İşlem Gerekli", count: applications.filter((a) => a.status === "İşlem Gerekli").length },
                      { label: "Gönderildi", count: applications.filter((a) => a.status === "Gönderildi").length },
                      { label: "Onaylandı / Tamamlandı", count: applications.filter((a) => a.status === "Onaylandı" || a.status === "Tamamlandı").length },
                      { label: "Reddedildi", count: applications.filter((a) => a.status === "Reddedildi").length },
                    ]
                      .filter((r) => r.count > 0)
                      .map((r) => (
                        <div key={r.label} className="flex justify-between text-sm font-bold">
                          <span className="text-slate-600">{r.label}</span>
                          <span className="text-navy-dark">{r.count}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Belge Tamamlama</p>
                  {(() => {
                    const withReqs = applications.map((a) => {
                      const reqs = getRequirements(a.destination_country, a.visa_type);
                      const uploaded = appDocs[a.id]?.length || 0;
                      return { total: reqs.length, uploaded };
                    });
                    const totalReq = withReqs.reduce((s, x) => s + x.total, 0);
                    const totalUp = withReqs.reduce((s, x) => s + x.uploaded, 0);
                    const pct = totalReq > 0 ? Math.round((totalUp / totalReq) * 100) : 0;
                    return (
                      <div className="mt-3">
                        <p className="text-3xl font-black text-emerald-600">{pct}%</p>
                        <p className="text-sm font-bold text-slate-500 mt-1">{totalUp} / {totalReq} belge yüklü</p>
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Son 30 Gün</p>
                  {(() => {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    const completed = applications.filter(
                      (a) => (a.status === "Onaylandı" || a.status === "Tamamlandı") && new Date(a.created_at) >= thirtyDaysAgo
                    ).length;
                    const created = applications.filter((a) => new Date(a.created_at) >= thirtyDaysAgo).length;
                    return (
                      <div className="mt-3 space-y-1">
                        <p className="text-2xl font-black text-navy-dark">{created} yeni başvuru</p>
                        <p className="text-lg font-bold text-emerald-600">{completed} tamamlanan</p>
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ortalama Süre (tahmini)</p>
                  {(() => {
                    const completed = applications.filter((a) => a.status === "Onaylandı" || a.status === "Tamamlandı");
                    if (completed.length === 0) return <p className="text-slate-500 font-bold mt-3">Henüz tamamlanan yok</p>;
                    const appWithUpdated = applications.filter((a) => a.status === "Onaylandı" || a.status === "Tamamlandı");
                    const days = appWithUpdated.map((a) => {
                      const created = new Date(a.created_at).getTime();
                      const updated = a.updated_at ? new Date(a.updated_at).getTime() : Date.now();
                      return (updated - created) / (1000 * 60 * 60 * 24);
                    });
                    const avg = Math.round(days.reduce((s, d) => s + d, 0) / days.length);
                    return <p className="text-3xl font-black text-navy-dark mt-3">{avg} gün</p>;
                  })()}
                </div>
              </div>

              <AIApplicationSummary
                applications={applications.map((a) => {
                  const reqs = getRequirements(a.destination_country, a.visa_type);
                  const uploaded = appDocs[a.id]?.length || 0;
                  return {
                    destination: a.destination_country,
                    visaType: a.visa_type,
                    status: a.status,
                    plan: a.plan || "",
                    travelDate: null,
                    uploadedDocs: uploaded,
                    totalDocs: reqs.length,
                  };
                })}
              />
            </>
          ) : (
            <p className="text-slate-500 font-medium">Henüz başvuru yok.</p>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-2xl">
          <h2 className="text-4xl font-black text-navy-dark">{t("agency.settings")}</h2>
          <div className="bg-white p-8 rounded-3xl border border-slate-100">
            <p className="text-slate-500 font-medium">Acenta ayarları burada yönetilir.</p>
          </div>
        </div>
      )}

      {/* Add customer dialog */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-navy-dark">Müşteri Ekle</h3>
              <Button variant="ghost" size="icon" onClick={() => { setIsAddCustomerOpen(false); setAddCustomerSearchResult(null); }}>
                <X size={24} />
              </Button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Sistemde kayıtlı bir kullanıcıyı e-posta ile arayıp acentanıza bağlayın.</p>
            <div className="flex gap-2 mb-4">
              <Input
                type="email"
                placeholder="musteri@email.com"
                className="rounded-2xl h-12 flex-1"
                value={addCustomerEmail}
                onChange={(e) => setAddCustomerEmail(e.target.value)}
              />
              <Button onClick={handleSearchCustomer} className="rounded-2xl h-12 px-6">Ara</Button>
            </div>
            {addCustomerSearchResult && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-black text-navy-dark">{addCustomerSearchResult.full_name || "İsimsiz"}</p>
                  <p className="text-xs text-slate-500">{addCustomerSearchResult.already_linked ? "Zaten başka acentaya bağlı" : "Bağlanabilir"}</p>
                </div>
                <Button
                  disabled={addCustomerSearchResult.already_linked || linkingCustomer}
                  onClick={handleLinkCustomer}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                >
                  {linkingCustomer ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bağla"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite dialog */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-navy-dark">Davetiye Gönder</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsInviteOpen(false)}><X size={24} /></Button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Bu e-posta ile kayıt olan müşteri otomatik acentanıza bağlanacak.</p>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-black text-navy-dark">E-posta *</Label>
                <Input type="email" placeholder="musteri@email.com" className="rounded-2xl h-12 mt-1" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-black text-navy-dark">Ad Soyad</Label>
                <Input placeholder="İsim" className="rounded-2xl h-12 mt-1" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-black text-navy-dark">Telefon</Label>
                <Input placeholder="+90 5xx" className="rounded-2xl h-12 mt-1" value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)} />
              </div>
              <Button onClick={handleSendInvite} disabled={sendingInvite} className="w-full rounded-2xl h-12 bg-emerald-500 hover:bg-emerald-600 font-black">
                {sendingInvite ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Davetiye Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create application dialog */}
      {isCreateAppOpen && (
        <div className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-navy-dark">Yeni Başvuru</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateAppOpen(false)}><X size={24} /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-black text-navy-dark">Müşteri</Label>
                <p className="text-slate-600 font-bold mt-1">{customers.find((c) => c.user_id === createAppCustomerId)?.applicant_name || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-black text-navy-dark">Hedef Ülke</Label>
                <select
                  className="w-full mt-1 h-12 rounded-2xl border border-slate-200 px-4 font-bold"
                  value={createAppDestination}
                  onChange={(e) => setCreateAppDestination(e.target.value)}
                >
                  <option value="">Seçin</option>
                  {destinations.map((d) => (
                    <option key={d.key} value={d.key}>{d.key}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-black text-navy-dark">Vize Türü</Label>
                <select
                  className="w-full mt-1 h-12 rounded-2xl border border-slate-200 px-4 font-bold"
                  value={createAppVisaType}
                  onChange={(e) => setCreateAppVisaType(e.target.value)}
                >
                  <option value="">Seçin</option>
                  {VISA_TYPES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-black text-navy-dark">Paket</Label>
                <select
                  className="w-full mt-1 h-12 rounded-2xl border border-slate-200 px-4 font-bold"
                  value={createAppPlan}
                  onChange={(e) => setCreateAppPlan(e.target.value)}
                >
                  {PLANS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCreateApplication} disabled={creatingApp} className="w-full rounded-2xl h-12 bg-emerald-500 hover:bg-emerald-600 font-black">
                {creatingApp ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Başvuru Oluştur"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload document dialog */}
      {isUploadDialogOpen && selectedAppForUpload && (
        <div className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-navy-dark">Belge Yükle</h3>
              <Button variant="ghost" size="icon" onClick={() => { setIsUploadDialogOpen(false); setSelectedAppForUpload(null); }}><X size={24} /></Button>
            </div>
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-black text-navy-dark uppercase tracking-widest">Belge Adı</Label>
                <Input placeholder="Örn: Pasaport kopyası" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} className="h-14 rounded-2xl mt-2" />
              </div>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all">
                <Upload className="w-10 h-10 text-slate-300 mt-4 mb-2" />
                <p className="text-sm text-slate-500 font-bold">Yüklemek için tıklayın</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAgencyUploadDocument(selectedAppForUpload, file);
                  }}
                  disabled={uploading}
                />
              </label>
              {appDocs[selectedAppForUpload]?.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase mb-2">Yüklenen belgeler</p>
                  {appDocs[selectedAppForUpload].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-2">
                      <span className="font-bold text-sm">{doc.name}</span>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold text-xs">Görüntüle</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
