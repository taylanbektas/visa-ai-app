import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  FileText,
  Users,
  UserCheck,
  Link2,
  Eye,
  LogOut,
  Loader2,
  Plus,
  Shield,
} from "lucide-react";

type AdminTab = "overview" | "applications" | "advisors" | "assignments" | "users";

const statusOptions = ["Alındı", "İnceleniyor", "Gönderildi", "Onaylandı", "Reddedildi", "İşlem Gerekli"];
const statusColors: Record<string, string> = {
  "Alındı": "bg-muted text-muted-foreground",
  "İnceleniyor": "bg-gold/10 text-gold-dark",
  "Gönderildi": "bg-blue-500/10 text-blue-700",
  "Onaylandı": "bg-success/10 text-success",
  "Reddedildi": "bg-destructive/10 text-destructive",
  "İşlem Gerekli": "bg-orange-500/10 text-orange-700",
};

const sidebarItems = [
  { title: "Genel Bakış", value: "overview" as AdminTab, icon: BarChart3 },
  { title: "Başvurular", value: "applications" as AdminTab, icon: FileText },
  { title: "Danışmanlar", value: "advisors" as AdminTab, icon: UserCheck },
  { title: "Atamalar", value: "assignments" as AdminTab, icon: Link2 },
  { title: "Kullanıcılar", value: "users" as AdminTab, icon: Users },
];

export default function Admin() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [applications, setApplications] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) { navigate("/login"); return; }
    if (!isAdmin) { navigate("/dashboard"); return; }
  }, [user, authLoading, roleLoading, isAdmin, navigate]);

  const fetchData = useCallback(async () => {
    if (!user || !isAdmin) return;
    setDataLoading(true);

    const [appsRes, advisorsRes, assignmentsRes, profilesRes, rolesRes] = await Promise.all([
      supabase.from("applications").select("*").order("created_at", { ascending: false }),
      supabase.from("advisors").select("*").order("created_at", { ascending: false }),
      supabase.from("advisor_assignments").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("*"),
    ]);

    const profiles = profilesRes.data ?? [];
    const roles = rolesRes.data ?? [];
    const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
    const roleMap = new Map<string, string[]>();
    roles.forEach((r) => {
      const existing = roleMap.get(r.user_id) ?? [];
      existing.push(r.role);
      roleMap.set(r.user_id, existing);
    });

    setApplications(
      (appsRes.data ?? []).map((app) => ({
        ...app,
        profile: profileMap.get(app.user_id),
      }))
    );

    setAdvisors(
      (advisorsRes.data ?? []).map((adv) => ({
        ...adv,
        profile: profileMap.get(adv.user_id),
      }))
    );

    setAssignments(assignmentsRes.data ?? []);

    // Build user list from profiles
    setAllUsers(
      profiles.map((p) => ({
        ...p,
        roles: roleMap.get(p.user_id) ?? [],
      }))
    );

    setDataLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    if (isAdmin && user) fetchData();
  }, [isAdmin, user, fetchData]);

  const updateAppStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    }
  };

  const assignAdvisor = async (applicationId: string, advisorId: string) => {
    // Upsert: remove existing then insert
    await supabase.from("advisor_assignments").delete().eq("application_id", applicationId);
    const { error } = await supabase.from("advisor_assignments").insert({
      application_id: applicationId,
      advisor_id: advisorId,
      assigned_by: user!.id,
    });
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Danışman atandı" });
      fetchData();
    }
  };

  const toggleAdvisorActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("advisors").update({ is_active: !isActive }).eq("id", id);
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      fetchData();
    }
  };

  const createAdvisorFromUser = async (userId: string) => {
    // Add moderator role
    const { error: roleError } = await supabase.from("user_roles").insert({ user_id: userId, role: "moderator" as any });
    if (roleError && !roleError.message.includes("duplicate")) {
      toast({ title: "Hata", description: roleError.message, variant: "destructive" });
      return;
    }
    // Create advisor record
    const { error } = await supabase.from("advisors").insert({ user_id: userId });
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Danışman oluşturuldu" });
      fetchData();
    }
  };

  const setUserRole = async (userId: string, role: string) => {
    if (role === "user") {
      // Remove all roles
      await supabase.from("user_roles").delete().eq("user_id", userId);
    } else {
      // Remove existing, add new
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      if (error) {
        toast({ title: "Hata", description: error.message, variant: "destructive" });
        return;
      }
      // If moderator, also create advisor record if not exists
      if (role === "moderator") {
        const { data: existing } = await supabase.from("advisors").select("id").eq("user_id", userId).single();
        if (!existing) {
          await supabase.from("advisors").insert({ user_id: userId });
        }
      }
    }
    toast({ title: "Rol güncellendi" });
    fetchData();
  };

  if (authLoading || roleLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const unassignedApps = applications.filter(
    (app) => !assignments.find((a) => a.application_id === app.id)
  );
  const activeAdvisors = advisors.filter((a) => a.is_active);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full pt-16 md:pt-20">
        <Sidebar className="top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]" collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Yönetim</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton
                        isActive={tab === item.value}
                        onClick={() => setTab(item.value)}
                        tooltip={item.title}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-bold">
                {sidebarItems.find((s) => s.value === tab)?.title}
              </h1>
            </div>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut size={16} className="mr-1" /> Çıkış
            </Button>
          </div>

          {dataLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Toplam Başvuru", value: applications.length, icon: FileText },
                    { label: "Aktif Danışman", value: activeAdvisors.length, icon: UserCheck },
                    { label: "Bekleyen Atama", value: unassignedApps.length, icon: Link2 },
                    { label: "Toplam Kullanıcı", value: allUsers.length, icon: Users },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-card border rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <stat.icon size={18} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === "applications" && (
                <div className="space-y-3">
                  {applications.map((app) => {
                    const assignment = assignments.find((a) => a.application_id === app.id);
                    const advisor = assignment ? advisors.find((adv) => adv.id === assignment.advisor_id) : null;
                    return (
                      <div key={app.id} className="bg-card border rounded-xl p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">{app.reference_id}</span>
                            <h3 className="font-semibold text-sm">{app.profile?.full_name || "İsimsiz"}</h3>
                            <p className="text-xs text-muted-foreground">{app.destination} · {app.visa_type} · {app.plan}</p>
                            {advisor && (
                              <p className="text-xs text-accent mt-1">Danışman: {advisor.profile?.full_name || "-"}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Select value={app.status} onValueChange={(v) => updateAppStatus(app.id, v)}>
                              <SelectTrigger className="h-8 w-[140px] text-xs">
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
                                <SheetHeader><SheetTitle>{app.reference_id}</SheetTitle></SheetHeader>
                                <div className="mt-6 space-y-4">
                                  {[
                                    { label: "Müşteri", value: app.profile?.full_name || "-" },
                                    { label: "Hedef Ülke", value: app.destination },
                                    { label: "Vize Türü", value: app.visa_type },
                                    { label: "Plan", value: app.plan },
                                    { label: "Durum", value: app.status },
                                    { label: "Seyahat Tarihi", value: app.travel_date || "-" },
                                    { label: "Notlar", value: app.notes || "-" },
                                    { label: "Danışman", value: advisor?.profile?.full_name || "Atanmadı" },
                                  ].map((item) => (
                                    <div key={item.label}>
                                      <p className="text-xs text-muted-foreground">{item.label}</p>
                                      <p className="text-sm font-medium">{item.value}</p>
                                    </div>
                                  ))}
                                </div>
                              </SheetContent>
                            </Sheet>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {applications.length === 0 && (
                    <p className="text-center py-10 text-muted-foreground">Henüz başvuru yok.</p>
                  )}
                </div>
              )}

              {tab === "advisors" && (
                <div className="space-y-3">
                  {advisors.map((adv) => {
                    const assignedCount = assignments.filter((a) => a.advisor_id === adv.id).length;
                    return (
                      <div key={adv.id} className="bg-card border rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{adv.profile?.full_name || "İsimsiz"}</h3>
                          <p className="text-xs text-muted-foreground">
                            {assignedCount} müşteri · Maks: {adv.max_clients}
                          </p>
                          {adv.specializations?.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {adv.specializations.map((s: string) => (
                                <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={adv.is_active ? "default" : "secondary"}>
                            {adv.is_active ? "Aktif" : "Pasif"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAdvisorActive(adv.id, adv.is_active)}
                          >
                            {adv.is_active ? "Pasife Al" : "Aktifleştir"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {advisors.length === 0 && (
                    <p className="text-center py-10 text-muted-foreground">Henüz danışman yok.</p>
                  )}
                </div>
              )}

              {tab === "assignments" && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground">Atama Bekleyen Başvurular</h2>
                  {unassignedApps.length === 0 ? (
                    <p className="text-center py-10 text-muted-foreground">Tüm başvurulara danışman atanmış.</p>
                  ) : (
                    unassignedApps.map((app) => (
                      <div key={app.id} className="bg-card border rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <span className="font-mono text-xs text-muted-foreground">{app.reference_id}</span>
                          <h3 className="font-semibold text-sm">{app.profile?.full_name || "İsimsiz"}</h3>
                          <p className="text-xs text-muted-foreground">{app.destination} · {app.visa_type}</p>
                        </div>
                        <Select onValueChange={(advisorId) => assignAdvisor(app.id, advisorId)}>
                          <SelectTrigger className="h-9 w-[200px] text-xs">
                            <SelectValue placeholder="Danışman seç..." />
                          </SelectTrigger>
                          <SelectContent>
                            {activeAdvisors.map((adv) => (
                              <SelectItem key={adv.id} value={adv.id}>
                                {adv.profile?.full_name || "İsimsiz"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))
                  )}

                  <h2 className="text-sm font-semibold text-muted-foreground mt-8">Atanmış Başvurular</h2>
                  {assignments.map((asgn) => {
                    const app = applications.find((a) => a.id === asgn.application_id);
                    const adv = advisors.find((a) => a.id === asgn.advisor_id);
                    if (!app) return null;
                    return (
                      <div key={asgn.id} className="bg-card border rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <span className="font-mono text-xs text-muted-foreground">{app.reference_id}</span>
                          <h3 className="font-semibold text-sm">{app.profile?.full_name || "İsimsiz"}</h3>
                          <p className="text-xs text-accent">→ {adv?.profile?.full_name || "İsimsiz Danışman"}</p>
                        </div>
                        <Select
                          value={asgn.advisor_id}
                          onValueChange={(advisorId) => assignAdvisor(app.id, advisorId)}
                        >
                          <SelectTrigger className="h-9 w-[200px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {activeAdvisors.map((adv) => (
                              <SelectItem key={adv.id} value={adv.id}>
                                {adv.profile?.full_name || "İsimsiz"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "users" && (
                <div className="space-y-3">
                  {allUsers.map((u) => (
                    <div key={u.user_id} className="bg-card border rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{u.full_name || "İsimsiz"}</h3>
                        <p className="text-xs text-muted-foreground">{u.phone || "-"}</p>
                        <div className="flex gap-1 mt-1">
                          {u.roles.length > 0 ? (
                            u.roles.map((r: string) => (
                              <Badge key={r} variant="secondary" className="text-[10px]">
                                <Shield size={8} className="mr-0.5" /> {r}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-[10px]">user</Badge>
                          )}
                        </div>
                      </div>
                      <Select
                        value={u.roles[0] || "user"}
                        onValueChange={(role) => setUserRole(u.user_id, role)}
                      >
                        <SelectTrigger className="h-9 w-[150px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Kullanıcı</SelectItem>
                          <SelectItem value="moderator">Danışman</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
