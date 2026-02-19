
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Bell, FileText, User, Settings, Upload, CheckCircle, Clock, AlertCircle, LogOut, Loader2, MessageSquare, Briefcase, Paperclip, X, Sparkles, ArrowRight, Calendar as CalendarIcon, Plus, type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCenter } from "@/components/MessageCenter";
import { BookingCalendar } from "@/components/BookingCalendar";
import { useAuth } from "@/hooks/useAuth";
import ApplicationTimeline from "@/components/ApplicationTimeline";
import DocumentChecklist from "@/components/DocumentChecklist";
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
import { LayoutDashboard } from "lucide-react";

const statusIcons: Record<string, LucideIcon> = {
  "İnceleniyor": Clock,
  "Onaylandı": CheckCircle,
  "İşlem Gerekli": AlertCircle,
  "Alındı": Clock,
  "Gönderildi": Clock,
  "Reddedildi": AlertCircle,
};

const statusColors: Record<string, string> = {
  "İnceleniyor": "bg-gold/10 text-gold-dark",
  "Onaylandı": "bg-success/10 text-success",
  "İşlem Gerekli": "bg-orange-500/10 text-orange-700",
  "Alındı": "bg-muted text-muted-foreground",
  "Gönderildi": "bg-blue-500/10 text-blue-700",
  "Reddedildi": "bg-destructive/10 text-destructive",
};

interface AppWithAdvisor {
  id: string;
  reference_id: string;
  destination: string;
  visa_type: string;
  plan: string;
  status: string;
  travel_date: string | null;
  created_at: string;
  advisorName: string | null;
  advisorId: string | null;
  advisorPhoto: string | null;
  payment_status: string | null;
}

interface AssignedAdvisor {
  id: string;
  user_id: string;
  full_name: string;
  photo_url?: string | null;
  avatar_url?: string | null;
  rating?: number;
  review_count?: number;
}

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AppWithAdvisor[]>([]);
  const [assignedAdvisor, setAssignedAdvisor] = useState<AssignedAdvisor | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [uploadingAppId, setUploadingAppId] = useState<string | null>(null);
  const [appDocuments, setAppDocuments] = useState<Record<string, { name: string; url: string }[]>>({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | applications | messages | profile
  const [selectedApp, setSelectedApp] = useState<AppWithAdvisor | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
    // Force refetch profile to check for assignments that might have happened
    if (user) {
      // We rely on useAuth to fetch initial profile, but we can also re-check specific fields
      // useAuth uses onAuthStateChange which might be cached or slow.
      // But for now, let's rely on the profile dependency in the next useEffect which fetches advisor.
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchApplications();
  }, [user]);

  useEffect(() => {
    const fetchAdvisor = async () => {
      const advisorId = profile?.assigned_advisor_id as string | undefined;
      if (advisorId) {
        // 1. Get Advisor Table Details
        const { data: advisorData } = await supabase
          .from('advisors')
          .select('*')
          .eq('id', advisorId)
          .single();

        if (advisorData) {
          // 2. Get Advisor User Profile (for name/photo if not in advisor table)
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', advisorData.user_id)
            .maybeSingle();

          setAssignedAdvisor({
            ...advisorData,
            full_name: userData?.full_name || 'Danışman',
            avatar_url: advisorData.photo_url,
            rating: 5.0,
            review_count: 0
          });
        }
      }
    };
    fetchAdvisor();
  }, [profile]);

  const fetchApplications = async () => {
    if (!user) return;

    const { data: apps } = await (supabase as any)
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!apps || apps.length === 0) {
      setApplications([]);
      setDataLoading(false);
      return;
    }

    // Get assignments for these applications
    const appIds = apps.map((a) => a.id);
    const { data: assignments } = await supabase
      .from("advisor_assignments")
      .select("application_id, advisor_id")
      .in("application_id", appIds);

    // Get advisor profiles
    const advisorMap = new Map<string, string>(); // advisor.id -> advisor name
    const advisorUserMap = new Map<string, string>(); // advisor.id -> advisor.user_id (for messaging)
    const advisorPhotoMap = new Map<string, string>(); // advisor.id -> photo_url

    if (assignments && assignments.length > 0) {
      const advisorIds = [...new Set(assignments.map((a) => a.advisor_id))];
      const { data: advisors } = await (supabase as any)
        .from("advisors")
        .select("id, user_id, photo_url")
        .in("id", advisorIds);

      if (advisors) {
        const userIds = advisors.map((a) => a.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) ?? []);
        advisors.forEach((adv) => {
          advisorMap.set(adv.id, profileMap.get(adv.user_id) || "Danışman");
          advisorUserMap.set(adv.id, adv.user_id);
          if (adv.photo_url) advisorPhotoMap.set(adv.id, adv.photo_url);
        });
      }
    }

    const assignmentMap = new Map(assignments?.map((a) => [a.application_id, a.advisor_id]) ?? []);

    setApplications(
      apps.map((app) => {
        const advisorId = assignmentMap.get(app.id);
        return {
          id: app.id,
          reference_id: app.reference_id,
          destination: app.destination,
          visa_type: app.visa_type,
          plan: app.plan,
          status: app.status || "Alındı",
          travel_date: app.travel_date,
          created_at: app.created_at,
          advisorName: advisorId ? advisorMap.get(advisorId) || null : null,
          advisorId: advisorId ? advisorUserMap.get(advisorId) || null : null,
          advisorPhoto: advisorId ? advisorPhotoMap.get(advisorId) || null : null,
          payment_status: app.payment_status || "pending",
        }
      })
    );

    // Fetch documents for these applications
    const { data: docsData } = await supabase
      .from('application_documents' as any)
      .select('application_id, name, url')
      .in('application_id', appIds);

    if (docsData) {
      const docMap: Record<string, { name: string; url: string }[]> = {};
      docsData.forEach((d: any) => {
        if (!docMap[d.application_id]) docMap[d.application_id] = [];
        docMap[d.application_id].push({ name: d.name, url: d.url });
      });
      setAppDocuments(docMap);
    }

    setDataLoading(false);
  };

  if (loading || !user) return null;

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Kullanıcı";

  return (
    <SidebarProvider style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-100 px-10 py-10">
            <h2 className="text-3xl font-black tracking-tight text-navy-dark px-2">
              Müşteri <span className="text-emerald-500 font-extrabold uppercase text-xs tracking-[0.2em] block mt-1">Süreç Takibi</span>
            </h2>
          </SidebarHeader>
          <SidebarContent className="px-6 py-6 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Gezinti</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-4">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'overview'}
                      onClick={() => setActiveTab('overview')}
                      size="lg"
                      className="rounded-2xl h-16 gap-4 font-bold transition-all hover:translate-x-1"
                    >
                      <LayoutDashboard className={activeTab === 'overview' ? 'text-emerald-600 w-6 h-6' : 'text-slate-400 w-6 h-6'} />
                      <span className={activeTab === 'overview' ? 'text-navy-dark text-lg' : 'text-slate-500 text-lg'}>Hızlı Bakış</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'applications'}
                      onClick={() => setActiveTab('applications')}
                      size="lg"
                      className="rounded-2xl h-16 gap-4 font-bold transition-all hover:translate-x-1"
                    >
                      <FileText className={activeTab === 'applications' ? 'text-emerald-600 w-6 h-6' : 'text-slate-400 w-6 h-6'} />
                      <span className={activeTab === 'applications' ? 'text-navy-dark text-lg' : 'text-slate-500 text-lg'}>Başvurularım</span>
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
                className="w-full h-16 justify-start text-navy-dark hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl font-extrabold text-lg transition-all group border border-transparent hover:border-emerald-100"
                onClick={() => navigate("/")}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-emerald-100 transition-colors">
                  <Plus className="h-5 w-5 text-navy-dark group-hover:text-emerald-600 rotate-45" />
                </div>
                Siteye Dön
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100 shadow-sm rounded-2xl font-extrabold text-base transition-all active:scale-[0.98]"
                onClick={async () => { await signOut(); navigate("/"); }}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center mr-4">
                  <LogOut className="h-4 w-4" />
                </div>
                Çıkış Yap
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12 pt-8 overflow-auto max-w-[1200px] mx-auto w-full">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500 w-full">
              <header className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
                <h1 className="text-4xl font-black text-navy-dark mb-3 tracking-tight tracking-tight">Hoş geldin, {displayName} 👋</h1>
                <p className="text-lg text-slate-500 font-medium">Vize süreçlerin kontrol altında.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active applications count summary box */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] shadow-xl shadow-blue-200/50 text-white relative overflow-hidden group">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-6">
                    <FileText size={28} />
                  </div>
                  <p className="text-5xl font-black tracking-tighter">{applications.length}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mt-2">Toplam Başvuru</p>
                </div>

                {/* Pending messages summary box if applicable */}
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-200/50 text-white relative overflow-hidden group">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-6">
                    <MessageSquare size={28} />
                  </div>
                  <p className="text-5xl font-black tracking-tighter">1</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mt-2">Yeni Mesaj</p>
                </div>

                {/* Status summary box */}
                <div className="bg-gradient-to-br from-violet-600 to-violet-700 p-8 rounded-[2.5rem] shadow-xl shadow-violet-200/50 text-white relative overflow-hidden group">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-6">
                    <AlertCircle size={28} />
                  </div>
                  <p className="text-5xl font-black tracking-tighter">{applications.filter(a => a.status === 'İşlem Gerekli').length}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mt-2">Dikkat Gereken</p>
                </div>
              </div>

              {/* Booking Banner */}
              {(applications[0]?.advisorId || assignedAdvisor) && (
                <div className="bg-white rounded-[2.5rem] p-8 border border-blue-50 shadow-sm relative overflow-hidden group mt-8">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 blur-3xl transition-colors group-hover:bg-blue-100"></div>
                  <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-navy-dark flex items-center justify-center text-white shadow-xl shadow-navy-dark/20 flex-shrink-0">
                      <CalendarIcon size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-black text-navy-dark mb-1 tracking-tight">Danışman Görüşmesi</h3>
                      <p className="text-slate-500 font-medium">Süreçle ilgili aklınıza takılanları birebir sorun.</p>
                    </div>
                    <Button
                      onClick={() => setIsBookingOpen(true)}
                      className="bg-navy-dark hover:bg-navy-light text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-navy-dark/10 transition-all hover:-translate-y-1 active:scale-[0.98]"
                    >
                      Randevu Al
                    </Button>
                  </div>
                </div>
              )}
              {/* Active Package Banner */}
              {profile?.active_package && applications.length === 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-lg relative overflow-hidden mt-8">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-transparent backdrop-blur-sm px-4 py-1.5 rounded-full font-bold">
                        Aktif Paket: <span className="ml-1 uppercase">{profile.active_package}</span>
                      </Badge>
                    </div>
                    <h2 className="text-3xl font-black mb-3 tracking-tight">Vize Başvurunuzu Hemen Başlatın</h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-lg font-medium">
                      Paketiniz hazır. Hemen formları doldurmaya başlayarak süreci hızlandırabilirsiniz.
                    </p>
                    <Link to="/apply" state={{ plan: profile.active_package }}>
                      <Button className="bg-white text-blue-700 hover:bg-blue-50 font-black px-10 h-14 rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                        Başvuruyu Başlat <ArrowRight size={20} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  {selectedApp && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedApp(null)}
                      className="rounded-xl h-10 w-10 p-0 hover:bg-slate-50 text-slate-400"
                    >
                      <X size={20} />
                    </Button>
                  )}
                  <h2 className="text-3xl font-black text-navy-dark tracking-tight">
                    {selectedApp ? "Başvuru Detayı" : "Başvurularım"}
                  </h2>
                </div>
                {!selectedApp && (
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-6 py-2 rounded-full font-bold">{applications.length} Kayıt</Badge>
                )}
              </header>

              {dataLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-muted-foreground" size={32} />
                </div>
              ) : selectedApp ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Timeline & Summary */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-navy-dark mb-8">Başvuru Durumu</h3>
                        <ApplicationTimeline currentStatus={selectedApp.status} createdAt={selectedApp.created_at} />
                      </div>

                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-navy-dark mb-4">Özet Bilgiler</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b border-slate-50">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Referans No</span>
                            <span className="text-sm font-mono font-bold text-navy-dark">{selectedApp.reference_id}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-slate-50">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Gidilecek Ülke</span>
                            <span className="text-sm font-bold text-navy-dark">{selectedApp.destination}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-slate-50">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Vize Türü</span>
                            <span className="text-sm font-bold text-navy-dark">{selectedApp.visa_type}</span>
                          </div>
                          <div className="flex justify-between items-center py-3">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Plan</span>
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[10px] font-black">{selectedApp.plan}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2" id="document-checklist-section">
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full">
                        <DocumentChecklist
                          applicationId={selectedApp.id}
                          userId={user.id}
                          destination={selectedApp.destination}
                          visaType={selectedApp.visa_type}
                        />

                        {appDocuments[selectedApp.id] && appDocuments[selectedApp.id].length > 0 && (
                          <div className="mt-12 pt-12 border-t border-slate-100">
                            <h3 className="text-xl font-black text-navy-dark mb-6 flex items-center gap-3">
                              <Sparkles className="text-emerald-500" size={24} /> Danışmanınızdan Gelen Belgeler
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {appDocuments[selectedApp.id].map((doc, i) => (
                                <a
                                  key={i}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center justify-between p-6 bg-slate-50 hover:bg-white rounded-[2rem] border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                      <FileText size={20} />
                                    </div>
                                    <span className="font-bold text-navy-dark group-hover:text-emerald-600 transition-colors">{doc.name}</span>
                                  </div>
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <ArrowRight size={18} />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-lg">Henüz bir başvurunuz bulunmuyor.</p>
                  <Link to="/apply" className="mt-4 inline-block text-emerald-500 font-bold hover:underline">İlk başvurunuzu oluşturun →</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((app) => {
                    const StatusIcon = statusIcons[app.status] || Clock;
                    return (
                      <div key={app.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-xs font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-lg">{app.reference_id}</span>
                              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[10px] font-black">{app.plan}</Badge>
                            </div>
                            <h3 className="text-2xl font-black text-navy-dark tracking-tight">{app.destination} — {app.visa_type}</h3>
                          </div>
                          <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black ring-1 ring-inset ${statusColors[app.status] || ""}`}>
                            <StatusIcon size={14} /> {app.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-3 text-slate-500 font-bold">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <User size={14} />
                            </div>
                            <span>Danışman: {app.advisorName || assignedAdvisor?.full_name || "Atanıyor..."}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-400">
                            Oluşturma: {new Date(app.created_at).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-4">
                          <Button
                            onClick={() => setSelectedApp(app)}
                            className="bg-navy-dark hover:bg-navy-light text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-navy-dark/10 transition-all hover:-translate-y-1"
                          >
                            Detayları Gör ve Takip Et
                          </Button>
                          {app.payment_status === 'paid' ? (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedApp(app);
                                setTimeout(() => {
                                  const el = document.getElementById("document-checklist-section");
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }, 100);
                              }}
                              className="rounded-xl h-12 px-6 font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Paperclip size={16} className="mr-2" /> Belge Yükle
                            </Button>
                          ) : (
                            <Link to="/apply" state={{ plan: app.plan }}>
                              <Button className="bg-rose-500 hover:bg-rose-600 rounded-xl h-12 px-8 font-black text-white shadow-lg shadow-rose-200 transition-all">
                                <AlertCircle size={16} className="mr-2" /> Ödemeyi Tamamla
                              </Button>
                            </Link>
                          )}
                        </div>

                        {appDocuments[app.id] && appDocuments[app.id].length > 0 && !selectedApp && (
                          <div className="mt-6 flex flex-wrap gap-3 p-4 bg-slate-50 rounded-2xl">
                            {appDocuments[app.id].map((doc, i) => (
                              <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold bg-white text-slate-600 px-4 py-2 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                                <Paperclip size={12} /> {doc.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <Link to="/apply" className="block mt-12">
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                    <Plus className="text-slate-400 group-hover:text-emerald-500" size={32} />
                  </div>
                  <p className="text-lg font-black text-slate-500 group-hover:text-emerald-600">Yeni Başvuru Oluştur</p>
                </div>
              </Link>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="h-[calc(100vh-8rem)] bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
              {applications.length > 0 && (applications[0].advisorId || applications[0].advisorName) ? (
                <MessageCenter
                  currentUserId={user!.id}
                  targetUserId={applications[0].advisorId || "placeholder"}
                  targetUserName={applications[0].advisorName || "Danışman"}
                  targetUserPhoto={applications[0].advisorPhoto}
                />
              ) : assignedAdvisor ? (
                <MessageCenter
                  currentUserId={user!.id}
                  targetUserId={assignedAdvisor.user_id}
                  targetUserName={assignedAdvisor.full_name}
                  targetUserPhoto={assignedAdvisor.photo_url || assignedAdvisor.avatar_url}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <MessageSquare size={48} className="text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-navy-dark mb-2 tracking-tight">Mesajlara Erişilemiyor</h3>
                  <p className="text-slate-500 font-medium max-w-sm">Henüz atanmış bir danışmanınız yok. Başvuru yaptığınızda sizinle buradan iletişime geçilecektir.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
              <header className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500"></div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 mb-6 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                    <User size={64} className="text-slate-300" />
                  </div>
                  <h2 className="text-3xl font-black text-navy-dark tracking-tight">{displayName}</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">VisaPath Müşterisi</p>
                </div>
              </header>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ad Soyad</p>
                    <div className="h-14 bg-slate-50 rounded-xl flex items-center px-4 font-bold text-navy-dark">{displayName}</div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-posta</p>
                    <div className="h-14 bg-slate-50 rounded-xl flex items-center px-4 font-bold text-navy-dark">{user.email}</div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Telefon</p>
                    <div className="h-14 bg-slate-50 rounded-xl flex items-center px-4 font-bold text-navy-dark">{profile?.phone || "-"}</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-slate-400 border-slate-100 cursor-not-allowed">Bilgileri Güncelle (Yakında)</Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <BookingCalendar
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        advisorId={applications[0]?.advisorId || assignedAdvisor?.user_id || ""}
        customerId={user!.id}
      />
    </SidebarProvider>
  );
}
