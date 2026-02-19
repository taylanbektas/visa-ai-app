
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | applications | messages | profile
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    pending: 0
  });

  // Profile Form State
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    bio: "",
    photo_url: "",
    specialties: [] as string[]
  });

  const SPECIALTIES_LIST = ["Schengen", "ABD", "İngiltere", "Kanada", "Dubai", "Öğrenci Vizesi", "Turistik", "Ticari"];

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

    // 1. Get my advisor record first (to get the correct ID, not auth user_id)
    const { data: advisorData } = await supabase
      .from('advisors')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (advisorData) {
      // Pre-fill form
      setFormData({
        email: advisorData.email || "",
        phone: advisorData.phone || "",
        bio: advisorData.bio || "",
        photo_url: advisorData.photo_url || "",
        specialties: advisorData.specializations || []
      });

      // 2. Fetch assigned users from profiles using the correct advisor ID
      const { data: assignedUsers } = await supabase
        .from("profiles")
        .select("*")
        .eq("assigned_advisor_id", advisorData.id);

      if (assignedUsers) {
        const mappedApps = assignedUsers.map(p => ({
          id: p.id,
          applicant_name: p.full_name || 'İsimsiz',
          passport_type: '-',
          destination_country: '-',
          visa_type: '-',
          status: 'Atandı',
          created_at: p.created_at,
          user_id: p.user_id,
          phone: p.phone
        }));
        setApplications(mappedApps);
        setStats({
          assigned: assignedUsers.length,
          completed: 0,
          pending: assignedUsers.length
        });
      }
    }

    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `advisor-photos/${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents') // Using documents bucket as established in Dashboard.tsx
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Yükleme Hatası", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    setFormData(prev => ({ ...prev, photo_url: publicUrl }));
    setUploading(false);
    toast({ title: "Fotoğraf yüklendi", description: "Lütfen profili kaydetmeyi unutmayın." });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates = {
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      photo_url: formData.photo_url,
      specializations: formData.specialties,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('advisors')
      .update(updates)
      .eq('user_id', user!.id);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Profil bilgileriniz güncellendi." });
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => {
      const current = prev.specialties || [];
      if (current.includes(specialty)) {
        return { ...prev, specialties: current.filter(s => s !== specialty) };
      } else {
        return { ...prev, specialties: [...current, specialty] };
      }
    });
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
              <div className="bg-white rounded-xl shadow-sm border">
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

                <form onSubmit={handleUpdateProfile} className="space-y-6 text-left max-w-lg mx-auto">

                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                      {formData.photo_url ? (
                        <img src={formData.photo_url} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-slate-400 w-10 h-10" />
                      )}
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Profil fotoğrafı yüklemek için tıklayın</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">İletişim E-posta</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@visapath.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+90 555 ..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Uzmanlık Alanları</Label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTIES_LIST.map(specialty => (
                        <Badge
                          key={specialty}
                          variant={formData.specialties?.includes(specialty) ? "default" : "outline"}
                          className={`cursor-pointer ${formData.specialties?.includes(specialty) ? "bg-navy-dark hover:bg-navy-dark/90" : "hover:bg-slate-100"}`}
                          onClick={() => toggleSpecialty(specialty)}
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Hakkımda</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Danışanlarınıza kendinizi, deneyimlerinizi ve yaklaşımınızı anlatın..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-navy-dark hover:bg-navy-dark/90 text-white font-semibold h-11">
                    Değişiklikleri Kaydet
                  </Button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </SidebarProvider>
  );
}
