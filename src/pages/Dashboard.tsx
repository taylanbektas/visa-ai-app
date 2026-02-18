
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Bell, FileText, User, Settings, Upload, CheckCircle, Clock, AlertCircle, LogOut, Loader2, MessageSquare, Briefcase, type LucideIcon,
} from "lucide-react";
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

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AppWithAdvisor[]>([]);
  const [assignedAdvisor, setAssignedAdvisor] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchApplications();
  }, [user]);

  useEffect(() => {
    const fetchAdvisor = async () => {
      const advisorId = (profile as any)?.assigned_advisor_id;
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
            .select('full_name, avatar_url')
            .eq('user_id', advisorData.user_id)
            .single();

          setAssignedAdvisor({
            ...advisorData,
            full_name: userData?.full_name || 'Danışman',
            avatar_url: userData?.avatar_url,
            rating: advisorData.rating || 5.0,
            review_count: advisorData.review_count || 0
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
    let advisorMap = new Map<string, string>(); // advisor.id -> advisor name
    let advisorUserMap = new Map<string, string>(); // advisor.id -> advisor.user_id (for messaging)
    let advisorPhotoMap = new Map<string, string>(); // advisor.id -> photo_url

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
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <Link to="/track"><Button size="sm" variant="outline" className="text-xs">Durumu Takip Et</Button></Link>
                        </div>
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

            {/* Developer Tools for Testing */}
            <div className="pt-8 border-t mt-8">
              <h3 className="text-sm font-mono font-bold text-muted-foreground mb-4">Geliştirici Araçları (Test)</h3>
              <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                <p className="text-xs font-mono mb-2 text-muted-foreground">User ID: {user.id}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-200"
                    onClick={async () => {
                      try {
                        const { error } = await supabase.from('user_roles').insert({
                          user_id: user.id,
                          role: 'admin'
                        });
                        if (error) throw error;
                        alert("Admin rolü başarıyla atandı! Sayfayı yenileyin.");
                        window.location.reload();
                      } catch (e: any) {
                        console.error(e);
                        alert("Hata: " + (e.message || "Bilinmeyen hata") + "\n\nBu hatayı alıyorsanız, Supabase panelinden SQL editörüne gidip şunu çalıştırın:\n\nINSERT INTO user_roles (user_id, role) VALUES ('" + user.id + "', 'admin');");
                      }
                    }}
                  >
                    Admin Yap
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-200"
                    onClick={async () => {
                      try {
                        // First role
                        const { error: roleError } = await supabase.from('user_roles').insert({
                          user_id: user.id,
                          role: 'moderator'
                        });
                        if (roleError && !roleError.message.includes('duplicate')) throw roleError;

                        // Then advisor record
                        const { error: advError } = await supabase.from('advisors').insert({
                          user_id: user.id
                        });
                        if (advError && !advError.message.includes('duplicate')) throw advError;

                        alert("Danışman rolü başarıyla atandı! Sayfayı yenileyin.");
                        window.location.reload();
                      } catch (e: any) {
                        console.error(e);
                        alert("Hata: " + (e.message || "Bilinmeyen hata") + "\n\nBu hatayı alıyorsanız, Supabase panelinden SQL editörüne gidip şunu çalıştırın:\n\nINSERT INTO user_roles (user_id, role) VALUES ('" + user.id + "', 'moderator');\nINSERT INTO advisors (user_id) VALUES ('" + user.id + "');");
                      }
                    }}
                  >
                    Danışman Yap
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(`INSERT INTO user_roles (user_id, role) VALUES ('${user.id}', 'admin');`);
                      alert("SQL kopyalandı!");
                    }}
                  >
                    SQL Kopyala
                  </Button>
                </div>
              </div>
            </div>
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
