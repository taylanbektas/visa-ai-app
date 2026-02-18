
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  User,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { MessageCenter } from "@/components/MessageCenter";

// Types
type Application = {
  id: string;
  applicant_name: string;
  passport_type: string;
  destination_country: string;
  visa_type: string;
  status: string;
  created_at: string;
  assigned_to?: string;
  user_id: string; // Needed for messaging
  phone?: string | null;
};

export default function AdvisorPanel() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isModerator, loading: roleLoading } = useUserRole(); // Fixed lint
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | applications | messages | profile
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    pending: 0
  });

  // Messaging state
  const [selectedChatUser, setSelectedChatUser] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    if (authLoading || roleLoading) return;

    // Redirect if not advisor or admin
    if (!user) {
      navigate("/login");
      return;
    }
    // Allow moderators (advisors) and admins
    if (!isModerator && !isAdmin) {
      navigate("/dashboard");
      return;
    }

    fetchData();
  }, [user, authLoading, roleLoading, isModerator, isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch assigned users from profiles
    const { data: assignedUsers, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("assigned_advisor_id", user?.id);

    if (assignedUsers) {
      // detailed info not in applications table anymore for strict separation? 
      // User said "vize satın almamış olsa bile". So we list USERS from profiles.
      // We map profiles to the structure we use or separate list.
      // Let's use a new state or repurpose 'applications'.
      // The previous code used 'applications' table. 
      // The requirement is: "admin panelden tüm eşleşmeleri ayarlayabilmeliyim... vize satın almamış olsa bile"
      // So Advisor should see USERS assigned to them.

      const mappedApps = assignedUsers.map(p => ({
        id: p.id,
        applicant_name: p.full_name || 'İsimsiz',
        passport_type: '-', // not in profile
        destination_country: '-',
        visa_type: '-',
        status: 'Atandı',
        created_at: p.created_at,
        user_id: p.user_id,
        phone: p.phone
      }));
      setApplications(mappedApps as any);
      setStats({
        assigned: assignedUsers.length,
        completed: 0,
        pending: assignedUsers.length
      });
    }

    setLoading(false);
  };

  const handleUpdateProfile = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {
      email: formData.get('email'),
      phone: formData.get('phone'),
      about_me: formData.get('about_me'),
      photo_url: formData.get('photo_url'),
    };

    const { error } = await supabase
      .from('advisors')
      .update(updates as any)
      .eq('user_id', user!.id);

    if (error) {
      // toast error
      alert("Hata: " + error.message);
    } else {
      alert("Profil güncellendi!");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || roleLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4 pt-8">
            <h2 className="text-xl font-bold tracking-tight text-navy-dark px-2">VisaPath <span className="text-green-600 font-normal">Advisor</span></h2>
          </SidebarHeader>
          <SidebarContent className="px-4 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">PANEL</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'dashboard'}
                      onClick={() => setActiveTab('dashboard')}
                      size="lg"
                      className="rounded-lg gap-3 font-medium transition-all hover:translate-x-1"
                    >
                      <LayoutDashboard className={activeTab === 'dashboard' ? 'text-green-600' : 'text-gray-500'} />
                      <span className={activeTab === 'dashboard' ? 'font-bold text-navy-dark' : 'text-gray-600'}>Panel Özeti</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'applications'}
                      onClick={() => setActiveTab('applications')}
                      size="lg"
                      className="rounded-lg gap-3 font-medium transition-all hover:translate-x-1"
                    >
                      <FileText className={activeTab === 'applications' ? 'text-green-600' : 'text-gray-500'} />
                      <span className={activeTab === 'applications' ? 'font-bold text-navy-dark' : 'text-gray-600'}>Atanan Başvurular</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'messages'}
                      onClick={() => setActiveTab('messages')}
                      size="lg"
                      className="rounded-lg gap-3 font-medium transition-all hover:translate-x-1"
                    >
                      <MessageSquare className={activeTab === 'messages' ? 'text-green-600' : 'text-gray-500'} />
                      <span className={activeTab === 'messages' ? 'font-bold text-navy-dark' : 'text-gray-600'}>Mesajlar</span>
                      <Badge className="ml-auto bg-green-500 hover:bg-green-600">Yeni</Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === 'profile'}
                      onClick={() => setActiveTab('profile')}
                      size="lg"
                      className="rounded-lg gap-3 font-medium transition-all hover:translate-x-1"
                    >
                      <User className={activeTab === 'profile' ? 'text-green-600' : 'text-gray-500'} />
                      <span className={activeTab === 'profile' ? 'font-bold text-navy-dark' : 'text-gray-600'}>Profilim</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="absolute bottom-8 left-4 right-4">
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 pt-24 md:pt-8 overflow-auto">
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-navy-dark">Merhaba, {user?.user_metadata?.full_name || 'Danışman'} 👋</h1>
                  <p className="text-muted-foreground mt-1">Bugün bekleyen {stats.pending} işleminiz var.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aktif Başvurular</p>
                    <p className="text-3xl font-bold text-navy-dark mt-1">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Clock size={24} />
                  </div>
                </div>
                {/* More stats */}
              </div>
            </div>
          )}

          {/* APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-navy-dark">Atanan Başvurular</h2>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başvuru No</TableHead>
                      <TableHead>Kişi</TableHead>
                      <TableHead>Ülke & Vize</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-xs">{app.id.substring(0, 8)}</TableCell>
                        <TableCell className="font-medium">{app.applicant_name}</TableCell>
                        <TableCell>
                          <div className="text-sm">{app.destination_country}</div>
                          <div className="text-xs text-muted-foreground">{app.visa_type}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{app.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => {
                            setActiveTab('messages');
                            setSelectedChatUser({ id: app.user_id, name: app.applicant_name });
                          }}>
                            Mesaj At
                          </Button>
                          {app.phone && (
                            <Button size="sm" variant="ghost" className="ml-2" onClick={() => window.open(`tel:${app.phone}`)}>
                              Tel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {activeTab === 'messages' && (
            <div className="h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border flex overflow-hidden animate-in fade-in duration-500">
              {/* Sidebar for Chat List */}
              <div className="w-1/3 border-r bg-gray-50 p-4">
                <h3 className="font-bold mb-4 text-navy-dark">Mesajlar</h3>
                <div className="space-y-2">
                  {applications.map(app => (
                    <div
                      key={app.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedChatUser?.id === app.user_id ? 'bg-white shadow-sm border border-green-200' : 'hover:bg-gray-100'}`}
                      onClick={() => setSelectedChatUser({ id: app.user_id, name: app.applicant_name })}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-light text-white flex items-center justify-center text-xs">
                          {app.applicant_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{app.applicant_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.destination_country}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {applications.length === 0 && <p className="text-xs text-muted-foreground">Aktif müşteri yok.</p>}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-white">
                {selectedChatUser ? (
                  <MessageCenter
                    currentUserId={user!.id}
                    targetUserId={selectedChatUser.id}
                    targetUserName={selectedChatUser.name}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>Mesajlaşmak için bir müşteri seçin.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
                <h2 className="text-2xl font-bold text-navy-dark">{user?.user_metadata?.full_name || 'Danışman'}</h2>
                <p className="text-muted-foreground mb-6">Profil Bilgileri</p>

                <form onSubmit={handleUpdateProfile} className="space-y-4 text-left max-w-md mx-auto">
                  <div>
                    <label className="text-sm font-medium">Fotoğraf URL</label>
                    <input name="photo_url" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email (İletişim)</label>
                    <input name="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="contact@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefon</label>
                    <input name="phone" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="+90..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hakkımda</label>
                    <textarea name="about_me" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Danışanlarınıza kendinizi tanıtın..." />
                  </div>
                  <Button type="submit" className="w-full">Kaydet</Button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </SidebarProvider>
  );
}
