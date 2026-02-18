
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, Clock, CheckCircle, AlertCircle, FileText, LogOut, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusOptions = ["Alındı", "İnceleniyor", "Gönderildi", "Onaylandı", "Reddedildi", "İşlem Gerekli"];

const statusColors: Record<string, string> = {
  "Alındı": "bg-muted text-muted-foreground",
  "İnceleniyor": "bg-gold/10 text-gold-dark",
  "Gönderildi": "bg-blue-500/10 text-blue-700",
  "Onaylandı": "bg-success/10 text-success",
  "Reddedildi": "bg-destructive/10 text-destructive",
  "İşlem Gerekli": "bg-orange-500/10 text-orange-700",
};

interface AssignedApplication {
  id: string;
  reference_id: string;
  destination: string;
  visa_type: string;
  plan: string;
  status: string;
  travel_date: string | null;
  notes: string | null;
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null; phone: string | null } | null;
}

export default function AdvisorPanel() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isModerator, isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [applications, setApplications] = useState<AssignedApplication[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // State for non-advisors
  const [advisorAppStatus, setAdvisorAppStatus] = useState<'none' | 'pending' | 'rejected' | 'approved'>('none');
  const [checkingApp, setCheckingApp] = useState(true);

  // Check auth
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
  }, [user, authLoading, navigate]);

  // Main Logic Split
  useEffect(() => {
    if (!user || roleLoading) return;

    const init = async () => {
      // 1. If active advisor (moderator/admin), load panel data
      if (isModerator || isAdmin) {
        setAdvisorAppStatus('approved');
        await fetchAssignedApplications();
        setCheckingApp(false);
      } else {
        // 2. If user, check if they have an advisor application
        await checkAdvisorApplication();
      }
    };

    init();
  }, [user, roleLoading, isModerator, isAdmin]);

  const checkAdvisorApplication = async () => {
    if (!user) return;
    setCheckingApp(true);
    try {
      const { data, error } = await supabase
        .from('advisor_applications')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setAdvisorAppStatus(data.status as any);
      } else {
        setAdvisorAppStatus('none');
      }
    } catch (e) {
      console.error("Error checking advisor app:", e);
      setAdvisorAppStatus('none');
    } finally {
      setCheckingApp(false);
    }
  };

  const fetchAssignedApplications = async () => {
    // ... (Existing fetch logic)
    if (!user) return;
    setDataLoading(true);

    // Get advisor record for current user
    const { data: advisor } = await supabase
      .from("advisors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!advisor) {
      setDataLoading(false);
      return; // Should theoretically not happen if isModerator is true, but safe guard
    }

    // Get assigned application IDs
    const { data: assignments } = await supabase
      .from("advisor_assignments")
      .select("application_id")
      .eq("advisor_id", advisor.id);

    if (!assignments || assignments.length === 0) {
      setApplications([]);
      setDataLoading(false);
      return;
    }

    const appIds = assignments.map((a) => a.application_id);

    // Get applications
    const { data: apps } = await supabase
      .from("applications")
      .select("*")
      .in("id", appIds)
      .order("created_at", { ascending: false });

    if (apps) {
      // Fetch profiles for each application's user
      const userIds = [...new Set(apps.map((a) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

      setApplications(
        apps.map((app) => ({
          ...app,
          profile: profileMap.get(app.user_id) ?? null,
        }))
      );
    }

    setDataLoading(false);
  };

  // ... (Existing updates)
  const updateStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", appId);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      toast({ title: "Durum güncellendi" });
    }
  };

  const updateNotes = async (appId: string, notes: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ notes })
      .eq("id", appId);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, notes } : a))
      );
      toast({ title: "Notlar kaydedildi" });
    }
  };


  // RENDER LOADING
  if (authLoading || roleLoading || (checkingApp && !isModerator && !isAdmin)) {
    return (
      <div className="page-shell flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  // RENDER NON-ADVISOR VIEWS
  if (!isModerator && !isAdmin) {
    return (
      <div className="page-shell section-gradient-light flex items-center justify-center py-20">
        <div className="max-w-xl w-full mx-auto px-4">

          {/* STATUS: NONE (Hasn't applied) */}
          {advisorAppStatus === 'none' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl border p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy-dark mb-4">Danışman Paneline Erişim</h1>
              <p className="text-muted-foreground mb-8">
                Bu alana sadece onaylı vize danışmanları erişebilir. Siz de danışman ağımıza katılmak ve gelir elde etmek ister misiniz?
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/join-advisor")} className="btn-gradient text-white h-12 text-base w-full">
                  Danışmanlık Başvurusu Yap <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="h-12 w-full">
                  Ana Sayfaya Dön
                </Button>
              </div>
            </motion.div>
          )}

          {/* STATUS: PENDING */}
          {advisorAppStatus === 'pending' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl border p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy-dark mb-4">Başvurunuz İnceleniyor</h1>
              <p className="text-muted-foreground mb-8">
                Danışmanlık başvurunuz başarıyla alındı ve ekibimiz tarafından inceleniyor. Sonuçlandığında size e-posta ile bilgi vereceğiz.
              </p>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="h-12 w-full">
                Ana Sayfaya Dön
              </Button>
            </motion.div>
          )}

          {/* STATUS: REJECTED */}
          {advisorAppStatus === 'rejected' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl border p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy-dark mb-4">Başvurunuz Onaylanmadı</h1>
              <p className="text-muted-foreground mb-8">
                Maalesef danışmanlık başvurunuz şu an için kabul edilemedi. Detaylı bilgi için destek ekibimizle iletişime geçebilirsiniz.
              </p>
              <Button variant="outline" onClick={() => navigate("/contact")} className="h-12 w-full mb-3">
                Destek ile İletişime Geç
              </Button>
              <Button variant="ghost" onClick={() => navigate("/dashboard")} className="h-12 w-full">
                Ana Sayfaya Dön
              </Button>
            </motion.div>
          )}

        </div>
      </div>
    );
  }

  // RENDER ADVISOR PANEL (Existing UI)
  return (
    <div className="page-shell">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-2xl font-bold">Danışman Paneli</h1>
            <p className="text-sm text-muted-foreground">Atanan müşterilerinizi takip edin</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <Users size={12} /> {applications.length} müşteri
            </Badge>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut size={16} className="mr-1" /> Çıkış
            </Button>
          </div>
        </motion.div>

        {applications.length === 0 ? (
          <motion.div className="text-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Henüz atanmış müşteriniz bulunmuyor.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, i) => (
              <motion.div
                key={app.id}
                className="bg-card border rounded-xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* ... existing card content ... */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">{app.reference_id}</span>
                    <h3 className="font-semibold">{app.profile?.full_name || "İsimsiz Müşteri"}</h3>
                    <p className="text-sm text-muted-foreground">{app.destination} · {app.visa_type} · {app.plan}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                      <SelectTrigger className="h-8 w-[150px] text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[app.status] || ""}`}>
                          {app.status}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm"><Eye size={14} /></Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>{app.reference_id}</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          {[
                            { label: "Müşteri", value: app.profile?.full_name || "-" },
                            { label: "Telefon", value: app.profile?.phone || "-" },
                            { label: "Hedef Ülke", value: app.destination },
                            { label: "Vize Türü", value: app.visa_type },
                            { label: "Plan", value: app.plan },
                            { label: "Durum", value: app.status },
                            { label: "Seyahat Tarihi", value: app.travel_date || "-" },
                            { label: "Oluşturulma", value: new Date(app.created_at).toLocaleDateString("tr-TR") },
                          ].map((item) => (
                            <div key={item.label}>
                              <p className="text-xs text-muted-foreground">{item.label}</p>
                              <p className="text-sm font-medium">{item.value}</p>
                            </div>
                          ))}
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Notlar</p>
                            <NotesEditor
                              initialNotes={app.notes || ""}
                              onSave={(notes) => updateNotes(app.id, notes)}
                            />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotesEditor({ initialNotes, onSave }: { initialNotes: string; onSave: (notes: string) => void }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Müşteri hakkında notlarınız..."
        rows={4}
      />
      <Button
        size="sm"
        disabled={saving || notes === initialNotes}
        onClick={async () => {
          setSaving(true);
          await onSave(notes);
          setSaving(false);
        }}
      >
        {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : null}
        Kaydet
      </Button>
    </div>
  );
}
