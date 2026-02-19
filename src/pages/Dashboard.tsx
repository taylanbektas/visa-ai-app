
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Bell, FileText, User, Settings, Upload, CheckCircle, Clock, AlertCircle, LogOut, Loader2, MessageSquare, Briefcase, Paperclip, X, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { MessageCenter } from "@/components/MessageCenter";
import { useAuth } from "@/hooks/useAuth";

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

    const { data: apps } = await supabase
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
      const { data: advisors } = await supabase
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
        }
      })
    );

    setDataLoading(false);
  };

  if (loading || !user) return null;

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Kullanıcı";

  return (
    <div className="page-shell">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-2xl font-bold mb-1">Hoş geldiniz, {displayName}</h1>
            <p className="text-muted-foreground">Vize başvurularınızın genel görünümü.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }} className="text-muted-foreground">
            <LogOut size={16} className="mr-1" /> Çıkış
          </Button>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">

            {/* Messages Section - NEW */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare size={18} /> Mesajlarınız</h2>
              <div className="h-[400px] bg-white rounded-xl border shadow-sm overflow-hidden">
                {applications.length > 0 && (applications[0].advisorId || applications[0].advisorName) ? (
                  <MessageCenter
                    currentUserId={user!.id}
                    targetUserId={applications[0].advisorId || "placeholder"}
                    targetUserName={applications[0].advisorName || "Danışman"}
                    targetUserPhoto={applications[0].advisorPhoto}
                  />
                ) : assignedAdvisor ? (
                  // If we have a global advisor but no application-specific one, show messaging with global advisor
                  <MessageCenter
                    currentUserId={user!.id}
                    targetUserId={assignedAdvisor.user_id}
                    targetUserName={assignedAdvisor.full_name}
                    targetUserPhoto={assignedAdvisor.photo_url || assignedAdvisor.avatar_url}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-6 text-muted-foreground">
                    <p>Henüz atanmış bir danışmanınız yok. Başvurunuz incelendiğinde danışman atanacaktır.</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><FileText size={18} /> Başvurularınız</h2>

              {dataLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Henüz başvurunuz bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const StatusIcon = statusIcons[app.status] || Clock;
                    return (
                      <div key={app.id} className="bg-card border rounded-xl p-5">
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">{app.reference_id}</span>
                            <h3 className="font-semibold">{app.destination} — {app.visa_type}</h3>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || ""}`}>
                            <StatusIcon size={12} /> {app.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User size={14} />
                            <span>Danışman: {app.advisorName || assignedAdvisor?.full_name || "Henüz atanmadı"}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Link to="/track"><Button size="sm" variant="outline" className="text-xs">Durumu Takip Et</Button></Link>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              disabled={uploadingAppId === app.id}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !user) return;
                                setUploadingAppId(app.id);
                                const filePath = `${user.id}/${app.id}/${Date.now()}_${file.name}`;
                                const { error } = await supabase.storage.from('documents').upload(filePath, file);
                                if (error) {
                                  toast.error("Dosya yüklenemedi: " + error.message);
                                } else {
                                  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
                                  setAppDocuments(prev => ({
                                    ...prev,
                                    [app.id]: [...(prev[app.id] || []), { name: file.name, url: publicUrl }]
                                  }));
                                  toast.success("Belge yüklendi!");
                                }
                                setUploadingAppId(null);
                              }}
                            />
                            <Button size="sm" variant="outline" className="text-xs pointer-events-none" asChild={false} tabIndex={-1}>
                              {uploadingAppId === app.id ? <Loader2 size={12} className="animate-spin mr-1" /> : <Paperclip size={12} className="mr-1" />}
                              Belge Yükle
                            </Button>
                          </label>
                        </div>
                        {appDocuments[app.id] && appDocuments[app.id].length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {appDocuments[app.id].map((doc, i) => (
                              <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80">
                                <Paperclip size={10} /> {doc.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <Link to="/apply" className="block">
              <div className="border-2 border-dashed border-accent/20 rounded-xl p-6 text-center hover:border-accent/40 transition-colors">
                <p className="text-sm font-medium text-muted-foreground">+ Yeni Başvuru Oluştur</p>
              </div>
            </Link>


          </div>

          <div className="space-y-6">

            {/* ADVISOR CARD - NEW */}
            {assignedAdvisor && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h2 className="font-semibold mb-4 flex items-center gap-2"><Briefcase size={18} /> Danışmanınız</h2>
                <div className="bg-white border rounded-xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-5">
                    <Briefcase size={80} />
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 overflow-hidden border-2 border-white shadow-md">
                      {assignedAdvisor.photo_url || assignedAdvisor.avatar_url ? (
                        <img src={assignedAdvisor.photo_url || assignedAdvisor.avatar_url} alt={assignedAdvisor.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-navy-dark">{assignedAdvisor.full_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">Vize Uzmanı</p>

                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full text-yellow-700 text-sm font-medium mb-4">
                      <span>★</span>
                      <span>{assignedAdvisor.rating?.toFixed(1) || "5.0"}</span>
                      <span className="text-yellow-700/60 text-xs">({assignedAdvisor.review_count || 12} değerlendirme)</span>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="block font-bold text-slate-700">60dk</span>
                        Ort. Yanıt
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="block font-bold text-slate-700">%98</span>
                        Başarı
                      </div>
                    </div>

                    <Button className="w-full bg-navy hover:bg-navy-light text-white" size="sm" onClick={() => {
                      // Scroll to messages or open chat
                      // For now just scroll to top where messages are
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>
                      <MessageSquare size={14} className="mr-2" /> Mesaj Gönder
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Settings size={18} /> Hesap</h2>
              <div className="bg-card border rounded-xl p-5 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Ad Soyad</p>
                  <p className="text-sm font-medium">{displayName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-posta</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
