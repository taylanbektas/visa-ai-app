
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Bell, FileText, User, Settings, Upload, CheckCircle, Clock, AlertCircle, LogOut, Loader2, MessageSquare, Briefcase, Paperclip, X, Sparkles, ArrowRight, ArrowLeft, Calendar as CalendarIcon, Plus, Bot, Package, type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCenter } from "@/components/MessageCenter";
import { BookingCalendar } from "@/components/BookingCalendar";
import { useAuth } from "@/hooks/useAuth";
import ApplicationTimeline from "@/components/ApplicationTimeline";
import DocumentChecklist from "@/components/DocumentChecklist";
import { DashboardLayout, SidebarItem } from "@/components/layout/DashboardLayout";
import { LayoutDashboard } from "lucide-react";
import { destinations } from "@/data/countries";
import { translations } from "@/i18n/translations";
import AIDashboardChat from "@/components/AIDashboardChat";
import AIApplicationSummary, { type SummaryResult } from "@/components/AIApplicationSummary";
import MyConsultations from "@/components/MyConsultations";
import { getRequirements } from "@/data/visaRequirements";

const statusIcons: Record<string, LucideIcon> = {
  "İnceleniyor": Clock,
  "Onaylandı": CheckCircle,
  "İşlem Gerekli": AlertCircle,
  "Başvuru Alındı": Clock,
  "Gönderildi": Clock,
  "Reddedildi": AlertCircle,
};

const statusColors: Record<string, string> = {
  "İnceleniyor": "bg-amber-500/10 text-amber-600",
  "Onaylandı": "bg-success/10 text-success",
  "İşlem Gerekli": "bg-orange-500/10 text-orange-700",
  "Başvuru Alındı": "bg-yellow-400/10 text-yellow-600",
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
  advisorRecordId: string | null;
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
  const { user, profile, loading, signOut, refetchProfile } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AppWithAdvisor[]>([]);
  const [assignedAdvisor, setAssignedAdvisor] = useState<AssignedAdvisor | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [uploadingAppId, setUploadingAppId] = useState<string | null>(null);
  const [appDocuments, setAppDocuments] = useState<Record<string, { name: string; url: string }[]>>({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const hasTriedAutoAssign = useRef(false);

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };
  const [selectedApp, setSelectedApp] = useState<AppWithAdvisor | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [applicationSummary, setApplicationSummary] = useState<SummaryResult | null>(null);

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

  // Auto-assign advisor when customer has no advisor (e.g. no package bought yet)
  useEffect(() => {
    if (!user || !profile || profile.assigned_advisor_id || hasTriedAutoAssign.current) return;
    hasTriedAutoAssign.current = true;
    (async () => {
      try {
        const { data: advisorId, error: rpcError } = await supabase.rpc("get_least_busy_advisor" as any);
        if (rpcError || !advisorId) return;
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ assigned_advisor_id: advisorId } as any)
          .eq("user_id", user.id);
        if (!updateError) await refetchProfile();
      } catch {
        // ignore
      }
    })();
  }, [user, profile, refetchProfile]);

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
    setDataLoading(true);

    const { data: apps, error: appsError } = await (supabase as any)
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (appsError) {
      console.error("Başvurular yüklenirken hata:", appsError);
      toast.error("Başvurular yüklenemedi: " + (appsError.message || "Bilinmeyen hata"));
      setApplications([]);
      setDataLoading(false);
      return;
    }

    if (!apps || apps.length === 0) {
      setApplications([]);
      setDataLoading(false);
      return;
    }

    try {
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
            advisorRecordId: advisorId || null,
            advisorPhoto: advisorId ? advisorPhotoMap.get(advisorId) || null : null,
            payment_status: app.payment_status || "pending",
          }
        }).map(app => {
          // Normalize status labels and map technical statuses to Turkish
          let normalizedStatus = app.status;
          if (normalizedStatus === "Alındı" || !normalizedStatus) normalizedStatus = "Başvuru Alındı";
          if (normalizedStatus.toLowerCase() === "rejected") normalizedStatus = "Reddedildi";
          if (normalizedStatus === "submitted") normalizedStatus = "Gönderildi";
          if (normalizedStatus === "pending_review") normalizedStatus = "İnceleniyor";
          if (normalizedStatus === "pending_documents") normalizedStatus = "Belge Bekliyor";
          if (normalizedStatus === "İşlem Gerekli") normalizedStatus = "İşlem Gerekli"; // Keep as is

          return { ...app, status: normalizedStatus };
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
    } catch (err: any) {
      console.error("Başvurular işlenirken hata:", err);
      toast.error("Başvurular yüklenirken hata oluştu: " + (err?.message || "Bilinmeyen hata"));
      setApplications([]);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || !user) return null;

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Kullanıcı";

  const navItems: SidebarItem[] = [
    { id: 'overview', label: 'Hızlı Bakış', icon: LayoutDashboard },
    { id: 'applications', label: 'Başvurularım', icon: FileText },
    { id: 'pricing', label: 'Paketler', icon: Package },
    { id: 'messages', label: 'Mesajlar', icon: MessageSquare, badgeCount: applications.some(a => a.status === 'İşlem Gerekli') ? 1 : undefined },
    { id: 'ai-assistant', label: 'AI Asistan', icon: Bot },
    { id: 'profile', label: 'Profilim', icon: User },
  ];

  return (
    <DashboardLayout
      items={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      maxWidth={(activeTab === 'applications' || activeTab === 'ai-assistant') ? "max-w-none" : "max-w-[1200px]"}
      noPadding={activeTab === 'messages' || activeTab === 'ai-assistant'}
    >
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500 w-full mb-10">
          <header className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-navy-dark tracking-tight mb-2">Hoş geldin, {displayName} 👋</h1>
                <p className="text-slate-500 font-medium text-lg">Vize süreçlerin kontrol altında.</p>
              </div>
            </div>
          </header>

          {/* Dashboard Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Recent Apps & AI Summary */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-navy-dark tracking-tighter">{applications.length}</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Toplam Başvuru</p>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-navy-dark tracking-tighter">
                      {applications.filter(a =>
                        a.status === 'İşlem Gerekli' ||
                        a.status === 'Belge Bekliyor' ||
                        Object.keys(appDocuments[a.id] || {}).length === 0
                      ).length}
                    </p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">İşlem Bekleyen</p>
                  </div>
                </div>
              </div>

              {/* AI Summary Card - Better Integrated */}
              {applications.length > 0 && (
                <AIApplicationSummary
                  applications={applications.map(a => {
                    const reqs = getRequirements(a.destination, a.visa_type);
                    const uploaded = appDocuments[a.id]?.length || 0;
                    return {
                      destination: a.destination,
                      visaType: a.visa_type,
                      status: a.status,
                      plan: a.plan,
                      travelDate: a.travel_date,
                      uploadedDocs: uploaded,
                      totalDocs: reqs.length,
                    };
                  })}
                  onSummaryReady={setApplicationSummary}
                />
              )}

              {applications.length > 0 && (
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-navy-dark tracking-tight">Son Başvurular</h3>
                    <Button variant="ghost" className="text-emerald-600 font-black hover:bg-emerald-50 rounded-xl px-4 py-2" onClick={() => setActiveTab('applications')}>
                      Tümünü Gör <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((app) => {
                      const StatusIcon = statusIcons[app.status] || Clock;
                      const countryData = destinations.find(d => d.key === app.destination.toLowerCase());
                      const countryFlag = countryData?.flag || "🏳️";
                      const turkishCountryName = translations.tr[`country.${app.destination.toLowerCase()}`] || app.destination;
                      const turkishVisaType = translations.tr[`visa_type.${app.visa_type.toLowerCase()}`] || app.visa_type;

                      return (
                        <div key={app.id} className="flex items-center justify-between p-6 rounded-2xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/20 hover:shadow-sm transition-all cursor-pointer group" onClick={() => { setActiveTab('applications'); setSelectedApp(app); }}>
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                              <span className="text-3xl">{countryFlag}</span>
                            </div>
                            <div>
                              <p className="font-black text-navy-dark text-xl group-hover:text-emerald-600 transition-colors tracking-tight">{turkishCountryName}</p>
                              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{turkishVisaType}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={`${statusColors[app.status] || "bg-slate-50 text-slate-600"} border-none font-black py-2 px-4 rounded-xl flex items-center gap-2 text-xs shadow-sm`}><StatusIcon size={14} />{app.status}</Badge>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                              <ArrowRight size={18} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Active Package & Danışman */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-50 flex items-center justify-center mb-4 text-slate-300 overflow-hidden border-2 border-slate-100 shadow-inner">
                  {(applications[0]?.advisorPhoto || assignedAdvisor?.avatar_url || assignedAdvisor?.photo_url) ? (
                    <img
                      src={applications[0]?.advisorPhoto || assignedAdvisor?.avatar_url || assignedAdvisor?.photo_url || ""}
                      alt="Danışman"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <h3 className="text-xl font-black text-navy-dark mb-1">Danışmanınız</h3>
                <p className="text-slate-500 font-medium mb-6">
                  {applications[0]?.advisorName || assignedAdvisor?.full_name || "Atanıyor..."}
                </p>
                {applications[0]?.advisorId || assignedAdvisor ? (
                  <div className="space-y-3">
                    <Button onClick={() => setActiveTab('messages')} className="w-full text-navy-dark bg-slate-50 font-bold h-12 rounded-xl border border-slate-100 hover:bg-slate-100 hover:border-slate-200 shadow-none transition-all">
                      <MessageSquare size={16} className="mr-2" /> Mesaj Gönder
                    </Button>
                    <Button
                      onClick={() => profile && setIsBookingOpen(true)}
                      disabled={!profile}
                      className="w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold h-12 rounded-xl transition-all shadow-none border border-emerald-100/50"
                    >
                      <CalendarIcon size={16} className="mr-2" /> Danışman Randevusu Al
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-bold p-3 bg-slate-50 rounded-xl">Başvuru sonrası danışman ataması yapılacaktır.</p>
                )}
              </div>

              {/* Upcoming Consultations — only when profile is loaded (avoids crash when profile is still null after auth) */}
              {profile ? <MyConsultations userId={profile.id} /> : (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                  <Loader2 className="animate-spin text-slate-400 mx-auto mb-2" size={24} />
                  <p className="text-sm text-slate-500 font-medium">Randevular yükleniyor...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <header className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              {selectedApp && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedApp(null)}
                  className="rounded-xl h-9 px-3 font-bold border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-navy-dark transition-colors text-xs"
                >
                  <ArrowLeft size={16} className="mr-1.5" /> Geri
                </Button>
              )}
              <h2 className="text-2xl font-black text-navy-dark tracking-tight">
                {selectedApp ? (
                  <div className="flex items-center gap-2">
                    <span>{destinations.find(d => d.key === selectedApp.destination.toLowerCase())?.flag || "🏳️"}</span>
                    <span>{translations.tr[`country.${selectedApp.destination.toLowerCase()}`] || selectedApp.destination}</span>
                    <span className="text-slate-200">/</span>
                    <span className="text-xl">{translations.tr[`visa_type.${selectedApp.visa_type.toLowerCase()}`] || selectedApp.visa_type}</span>
                  </div>
                ) : "Başvurularım"}
              </h2>
            </div>
            {!selectedApp && (
              <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-6 py-2 rounded-full font-bold">{applications.length} Kayıt</Badge>
            )}
            {selectedApp && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-1">
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-black tracking-wider shadow-sm shadow-emerald-200/50">
                    {selectedApp.plan.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REF:</span>
                    <span className="text-lg font-mono font-black text-navy-dark tracking-tighter">{selectedApp.reference_id}</span>
                  </div>
                </div>
              </div>
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
                </div>

                <div className="lg:col-span-2" id="document-checklist-section">
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full">
                    <DocumentChecklist
                      applicationId={selectedApp.id}
                      userId={user.id}
                      destination={selectedApp.destination}
                      visaType={selectedApp.visa_type}
                      status={selectedApp.status}
                      onStatusChange={(newStatus) => {
                        setSelectedApp({ ...selectedApp, status: newStatus });
                        setApplications(apps => apps.map(a => a.id === selectedApp.id ? { ...a, status: newStatus } : a));
                      }}
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
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => {
                const StatusIcon = statusIcons[app.status] || Clock;
                return (
                  <div key={app.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                          <StatusIcon size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[9px] font-black text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">{app.reference_id}</span>
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[9px] font-black h-4 px-1.5">{app.plan}</Badge>
                          </div>
                          <h3 className="text-xl font-black text-navy-dark tracking-tight">
                            {destinations.find(d => d.key === app.destination.toLowerCase())?.flag || "🏳️"} {translations.tr[`country.${app.destination.toLowerCase()}`] || app.destination} — {translations.tr[`visa_type.${app.visa_type.toLowerCase()}`] || app.visa_type}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2">
                            {app.travel_date && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                <CalendarIcon size={12} className="text-blue-500" />
                                {new Date(app.travel_date).toLocaleDateString('tr-TR')}
                              </div>
                            )}
                            {app.advisorName && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                <User size={12} className="text-emerald-500" />
                                {app.advisorName}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                              <Paperclip size={12} className="text-violet-500" />
                              {appDocuments[app.id]?.length || 0} Belge
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black ring-1 ring-inset ${statusColors[app.status] || ""}`}>
                          {app.status}
                        </span>
                        <Button
                          onClick={() => setSelectedApp(app)}
                          className="bg-navy-dark hover:bg-navy-light text-white font-black px-5 h-10 rounded-xl shadow-lg shadow-navy-dark/10 transition-all hover:-translate-y-0.5 text-xs"
                        >
                          Detaylar
                        </Button>
                      </div>
                    </div>
                    {appDocuments[app.id] && appDocuments[app.id].length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                        {appDocuments[app.id].slice(0, 3).map((doc, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100">
                            <FileText size={12} /> {doc.name}
                          </span>
                        ))}
                        {appDocuments[app.id].length > 3 && (
                          <span className="text-[10px] font-black text-slate-400 self-center">+{appDocuments[app.id].length - 3} Diğer</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!selectedApp && (
            <Link to="/apply" className="block mt-12">
              <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                  <Plus className="text-slate-400 group-hover:text-emerald-500" size={32} />
                </div>
                <p className="text-lg font-black text-slate-500 group-hover:text-emerald-600">Yeni Başvuru Oluştur</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="flex h-full w-full bg-slate-50 overflow-hidden animate-in fade-in duration-500 relative">
          {applications.length > 0 && applications[0].advisorId ? (
            <MessageCenter
              currentUserId={user!.id}
              targetUserId={applications[0].advisorId}
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
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 w-full">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                <MessageSquare size={48} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-navy-dark mb-2 tracking-tight">Mesajlara Erişilemiyor</h3>
              <p className="text-slate-500 font-medium max-w-sm">Henüz atanmış bir danışmanınız yok. Başvuru yaptığınızda sizinle buradan iletişime geçilecektir.</p>
            </div>
          )}
        </div>
      )}

      {/* AI Asistan: Her zaman mount kalır (sadece gizlenir), böylece mesaj atıp başka sekmeye geçince gelen cevap kaybolmaz */}
      <div
        className={activeTab === 'ai-assistant' ? "animate-in fade-in duration-500 flex flex-col min-h-0" : "hidden"}
        style={activeTab === 'ai-assistant' ? { height: 'calc(100svh - 2rem)', maxHeight: 'calc(100vh - 2rem)' } : undefined}
      >
        <AIDashboardChat
          isVisible={activeTab === "ai-assistant"}
          persistKey={user?.id}
          context={() => ({
            userName: displayName,
            ...(applications.length > 0 || applicationSummary ? {
              applications: applications.map((a) => ({
                referenceId: a.reference_id,
                destination: translations.tr[`country.${a.destination.toLowerCase()}`] || a.destination,
                visaType: translations.tr[`visa_type.${a.visa_type.toLowerCase()}`] || a.visa_type,
                status: a.status,
                travelDate: a.travel_date || undefined,
              })),
              destination: applications[0] ? (translations.tr[`country.${applications[0].destination.toLowerCase()}`] || applications[0].destination) : undefined,
              visaType: applications[0]?.visa_type ? (translations.tr[`visa_type.${applications[0].visa_type.toLowerCase()}`] || applications[0].visa_type) : undefined,
              status: applications[0]?.status,
              travelDate: applications[0]?.travel_date || undefined,
              summary: applicationSummary?.summary,
              nextSteps: applicationSummary?.nextSteps,
            } : {}),
          })}
        />
      </div>

      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center border border-slate-100">
                  <User size={32} className="text-slate-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy-dark">{displayName}</h2>
                  <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                </div>
              </div>
              {!isEditingProfile && (
                <Button
                  onClick={() => setIsEditingProfile(true)}
                  variant="outline"
                  className="rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none"
                >
                  Profil Düzenle
                </Button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-1 pb-4 border-b border-slate-50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ad Soyad</span>
                  <span className="text-base font-medium text-navy-dark">{displayName}</span>
                </div>
                <div className="flex flex-col gap-1 pb-4 border-b border-slate-50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telefon Numarası</span>
                  <span className="text-base font-medium text-navy-dark">{profile?.phone || "Belirtilmemiş"}</span>
                </div>
                <div className="flex flex-col gap-1 pb-4 border-b border-slate-50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">E-posta Adresi</span>
                  <span className="text-base font-medium text-navy-dark">{user.email}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const formData = new FormData(e.currentTarget);
                  const updates = {
                    full_name: formData.get('fullName') as string,
                    phone: formData.get('phone') as string,
                    updated_at: new Date().toISOString(),
                  };

                  const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('user_id', user.id);

                  if (error) throw error;
                  toast.success('Profil bilgileriniz güncellendi.');
                  setIsEditingProfile(false);
                } catch (error: any) {
                  toast.error('Hata: ' + error.message);
                }
              }} className="space-y-6">

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Ad Soyad</label>
                    <input
                      name="fullName"
                      defaultValue={displayName}
                      className="w-full h-12 rounded-xl border-slate-200 bg-white focus:bg-white transition-all text-sm font-medium px-4 border outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      placeholder="Adınız ve Soyadınız"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Telefon Numarası</label>
                    <input
                      name="phone"
                      defaultValue={profile?.phone || ""}
                      className="w-full h-12 rounded-xl border-slate-200 bg-white focus:bg-white transition-all text-sm font-medium px-4 border outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                      placeholder="+90 555 ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">E-posta Adresi</label>
                    <div className="h-12 rounded-xl border-slate-100 bg-slate-50 flex items-center px-4 text-sm font-medium text-slate-400 border cursor-not-allowed">
                      {user.email}
                    </div>
                    <p className="text-xs font-medium text-slate-400 ml-1 mt-1">E-posta adresi değiştirilemez.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 rounded-xl font-semibold h-12 border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-12 rounded-xl shadow-sm shadow-emerald-200 transition-all shadow-none"
                  >
                    Değişiklikleri Kaydet
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <BookingCalendar
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        advisorId={applications[0]?.advisorRecordId || assignedAdvisor?.id || ""}
        userId={user!.id}
        profileId={profile?.id ?? ""}
      />
    </DashboardLayout>
  );
}
