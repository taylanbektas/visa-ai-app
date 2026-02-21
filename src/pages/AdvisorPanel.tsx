import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { format, startOfDay, addDays, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout, SidebarItem } from "@/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  User,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Zap,
  Calendar,
  Plus,
  Trash2,
  Check,
  CalendarIcon,
  Search,
  ArrowRight,
  ChevronDown,
  Mail,
  Phone,
  Package,
  History,
  MapPin,
  ChevronLeft,
  Loader2,
  Upload
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
import { X } from "lucide-react";
import { MessageCenter } from "@/components/MessageCenter";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Sparkles } from "lucide-react";

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
  profile_id: string; // Needed for consultations FK
  phone?: string | null;
  plan?: string;
  applications?: Application[];
};

type Consultation = {
  id: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  customer_name?: string;
  is_advisor_request?: boolean;
};

type Availability = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
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
    pendingMessages: 0,
    totalRevenue: 0,
    withdrawableBalance: 0,
    pendingRevenue: 0,
    activeApps: 0,
    pendingConsultations: 0,
    avgResponseTime: "1.2s",
    satisfactionRate: 98,
    completionRate: 94
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
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [appDocs, setAppDocs] = useState<Record<string, any[]>>({});
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedAppForUpload, setSelectedAppForUpload] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState("");
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [expandedCustomerIds, setExpandedCustomerIds] = useState<string[]>([]);

  // Date Specific Availability State
  const [selectedAvailDate, setSelectedAvailDate] = useState<Date | undefined>(new Date());
  const [dateActive, setDateActive] = useState(false);
  const [activeSlots, setActiveSlots] = useState<string[]>([]);
  const [savingAvail, setSavingAvail] = useState(false);

  // Direct Booking State
  const [directBookOpen, setDirectBookOpen] = useState(false);
  const [directBookCustomerId, setDirectBookCustomerId] = useState<string | null>(null);

  // Customer Details View State
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // List Filters & Chart Data
  const [appSearchTerm, setAppSearchTerm] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("6months");
  const [chartData, setChartData] = useState<{ name: string, revenue: number }[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!applications.length) return;

    const transactions: any[] = [];
    const PACKAGE_PRICES: Record<string, number> = { starter: 49, pro: 149, elite: 349 };

    applications.forEach(app => {
      if (app.plan && app.created_at) {
        const price = PACKAGE_PRICES[app.plan.toLowerCase()] || 0;
        const commission = price * 0.30; // 30% hak ediş

        transactions.push({
          id: app.id,
          date: app.created_at,
          customerName: app.applicant_name,
          category: `Hak Ediş - ${app.plan.toUpperCase()} Paketi`,
          amount: commission,
        });
      }
    });

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFinancialTransactions(transactions);

  }, [applications]);

  useEffect(() => {
    if (!applications.length) return;

    const PACKAGE_PRICES: Record<string, number> = { starter: 49, pro: 149, elite: 349 };
    const months = timeFilter === "year" ? 12 : timeFilter === "3months" ? 3 : timeFilter === "all" ? 24 : 6;
    const now = new Date();
    const dataObj: Record<string, { name: string, revenue: number }> = {};

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('tr-TR', { month: 'short' });
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      dataObj[key] = { name: monthName, revenue: 0 };
    }

    const firstMonthDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    applications.forEach(app => {
      const d = new Date(app.created_at);
      const price = PACKAGE_PRICES[app.plan?.toLowerCase() || ''] || 0;
      const commission = price * 0.30; // 30% advisor commission

      if (d >= firstMonthDate) {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (dataObj[key]) {
          dataObj[key].revenue += commission;
        }
      }
    });

    setChartData(Object.values(dataObj));
  }, [applications, timeFilter]);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.applicant_name.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(appSearchTerm.toLowerCase());
    const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const customers = Array.from(new Map(applications.map(app => [app.user_id, app])).values()).map(customer => {
    // Filter actual applications for this user
    const customerApps = applications.filter(app => app.user_id === customer.user_id && !app.id.startsWith('no-app-'));
    return {
      ...customer,
      applications: customerApps
    };
  }).filter(c => {
    const matchesSearch = c.applicant_name.toLowerCase().includes(appSearchTerm.toLowerCase());
    return matchesSearch;
  });

  const toggleCustomerExpand = (customerId: string) => {
    setExpandedCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

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
    link.setAttribute("download", "musterilerim.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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

    // Subscribe to message changes (new unread messages or read status updates)
    const channel = supabase
      .channel('advisor-unread-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      setAdvisorId(advisorData.id);

      // Pre-fill form
      setFormData({
        email: advisorData.email || "",
        phone: advisorData.phone || "",
        bio: advisorData.bio || "",
        photo_url: advisorData.photo_url || "",
        specialties: advisorData.specializations || []
      });

      // 2. Fetch assigned customers from profiles
      const { data: profileCustomers } = await supabase
        .from('profiles')
        .select('*')
        .eq('assigned_advisor_id', advisorData.id);

      const customerUserIds = profileCustomers?.map(p => p.user_id) || [];

      // 3. Fetch applications assigned to this advisor OR belonging to assigned customers
      const { data: assignments } = await supabase
        .from('advisor_assignments')
        .select('application_id')
        .eq('advisor_id', advisorData.id);

      const explicitAppIds = assignments?.map(a => a.application_id) || [];

      let mappedApps: Application[] = [];
      let appIds: string[] = [];

      // Combine conditions to get all relevant applications
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*, profiles(full_name, phone)')
        .or(`id.in.(${explicitAppIds.length ? explicitAppIds.join(',') : '"00000000-0000-0000-0000-000000000000"'}),user_id.in.(${customerUserIds.length ? customerUserIds.join(',') : '"00000000-0000-0000-0000-000000000000"'})`);

      if (appsData) {
        appIds = appsData.map(a => a.id);
        mappedApps = appsData.map((app: any) => ({
          id: app.id,
          applicant_name: app.profiles?.full_name || 'İsimsiz',
          passport_type: '-',
          destination_country: app.destination,
          visa_type: app.visa_type,
          status: app.status || 'Alındı',
          created_at: app.created_at,
          user_id: app.user_id,
          profile_id: app.profiles?.id || "",
          phone: app.profiles?.phone,
          plan: app.plan
        }));
      }

      // 4. Add customers who are assigned but have no applications shown in the list
      if (profileCustomers) {
        profileCustomers.forEach((profile: any) => {
          const hasApp = mappedApps.some(app => app.user_id === profile.user_id);
          if (!hasApp) {
            mappedApps.push({
              id: `no-app-${profile.id}`,
              applicant_name: profile.full_name || 'İsimsiz',
              passport_type: '-',
              destination_country: '-',
              visa_type: 'Başvuru Yok',
              status: 'Yeni Müşteri',
              created_at: profile.created_at,
              user_id: profile.user_id,
              profile_id: profile.id,
              phone: profile.phone,
              plan: profile.active_package || '-'
            });
          }
        });
      }

      setApplications(mappedApps);

      if (mappedApps.length > 0) {
        // Optimized: Fetch count of unique senders who sent unread messages to this advisor
        const { data: unreadData } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('recipient_id', user?.id)
          .eq('read', false);

        const pendingCount = new Set(unreadData?.map(m => m.sender_id)).size;

        const appsData = mappedApps.filter(a => !a.id.startsWith('no-app-'));
        const completedApps = appsData.filter(a => a.status === 'Onaylandı' || a.status === 'Tamamlandı');

        const planPrices: Record<string, number> = {
          'starter': 49,
          'pro': 149,
          'elite': 349
        };

        const withdrawableStatuses = ['Onaylandı', 'Tamamlandı'];

        let expectedRevenue = 0;
        let withdrawableBalance = 0;
        let pendingRevenue = 0;

        appsData.forEach((app: any) => {
          const price = planPrices[app.plan?.toLowerCase()] || 0;
          const commission = price * 0.30; // Advisor commission
          expectedRevenue += commission;

          if (withdrawableStatuses.includes(app.status)) {
            withdrawableBalance += commission;
          } else {
            pendingRevenue += commission;
          }
        });

        setStats({
          assigned: profileCustomers?.length || appsData.length,
          completed: completedApps.length,
          pendingMessages: pendingCount,
          totalRevenue: expectedRevenue,
          withdrawableBalance: withdrawableBalance,
          pendingRevenue: pendingRevenue,
          activeApps: appsData.length - completedApps.length,
          pendingConsultations: 0, // Will be updated below
          avgResponseTime: "1.2s", // Simulated for now
          satisfactionRate: 98,
          completionRate: Math.round((completedApps.length / (appsData.length || 1)) * 100)
        });

        // Fetch documents for these applications
        if (appIds.length > 0) {
          const { data: docsData } = await supabase
            .from('application_documents' as any)
            .select('*')
            .in('application_id', appIds);

          if (docsData) {
            const docMap: Record<string, any[]> = {};
            docsData.forEach((d: any) => {
              if (!docMap[d.application_id]) docMap[d.application_id] = [];
              docMap[d.application_id].push(d);
            });
            setAppDocs(docMap);
          }
        }
      }

      // 3. Fetch consultations
      const { data: consData } = await supabase
        .from('consultations' as any)
        .select('*, profiles(full_name)')
        .eq('advisor_id', advisorData.id)
        .order('start_time', { ascending: true });

      if (consData) {
        setConsultations(consData.map((c: any) => ({
          ...c,
          customer_name: c.profiles?.full_name || 'Müşteri'
        })));

        const pendingCons = consData.filter((c: any) => c.status === 'pending').length;
        setStats(prev => ({ ...prev, pendingConsultations: pendingCons }));
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
      .from('documents')
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
      setIsEditingProfile(false);
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

  const handleUpdateConsultationStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('consultations' as any)
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Görüşme durumu güncellendi." });
      fetchData();
    }
  };

  const fetchDateAvailability = async (date: Date) => {
    if (!advisorId) return;
    const dayStart = startOfDay(date).toISOString();
    const nextDay = addDays(startOfDay(date), 1).toISOString();

    const { data: slots } = await supabase
      .from('advisor_blocked_slots' as any)
      .select('start_time')
      .eq('advisor_id', advisorId)
      .gte('start_time', dayStart)
      .lt('start_time', nextDay)
      .eq('reason', 'Müsait') as { data: any[] | null };

    if (slots && slots.length > 0) {
      setDateActive(true);
      setActiveSlots(slots.map(s => format(new Date(s.start_time), 'HH:mm')));
    } else {
      setDateActive(false);
      setActiveSlots([]);
    }
  };

  useEffect(() => {
    if (selectedAvailDate && advisorId) {
      fetchDateAvailability(selectedAvailDate);
    }
  }, [selectedAvailDate, advisorId]);

  const toggleAvailabilitySlot = (slotTime: string) => {
    setActiveSlots(prev => prev.includes(slotTime) ? prev.filter(s => s !== slotTime) : [...prev, slotTime]);
  };

  const handleToggleDayActive = (active: boolean) => {
    setDateActive(active);
    if (active) {
      // Default select all 08:00 to 20:00 (30 min intervals)
      const allSlots = [];
      for (let hour = 8; hour < 20; hour++) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      setActiveSlots(allSlots);
    } else {
      setActiveSlots([]);
    }
  };

  const handleSaveAvailability = async () => {
    if (!advisorId || !selectedAvailDate) return;
    setSavingAvail(true);

    const dayStart = startOfDay(selectedAvailDate).toISOString();
    const nextDay = addDays(startOfDay(selectedAvailDate), 1).toISOString();

    // First delete existing 'Müsait' records for this date
    await supabase
      .from('advisor_blocked_slots' as any)
      .delete()
      .eq('advisor_id', advisorId)
      .gte('start_time', dayStart)
      .lt('start_time', nextDay)
      .eq('reason', 'Müsait');

    // If day is active and has slots, insert them
    if (dateActive && activeSlots.length > 0) {
      const inserts = activeSlots.map(slot => {
        const [h, m] = slot.split(':').map(Number);
        const startTime = new Date(selectedAvailDate);
        startTime.setHours(h, m, 0, 0);
        const endTime = new Date(startTime.getTime() + 30 * 60000);
        return {
          advisor_id: advisorId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          reason: 'Müsait'
        };
      });

      const { error } = await supabase.from('advisor_blocked_slots' as any).insert(inserts);
      if (error) {
        toast({ title: "Hata", description: "Müsaitlik kaydedilemedi: " + error.message, variant: "destructive" });
      } else {
        toast({ title: "Başarılı", description: "Müsait saatler güncellendi." });
      }
    } else {
      toast({ title: "Başarılı", description: "Gün başarıyla kapatıldı." });
    }
    setSavingAvail(false);
  };

  const generateAllSlotsForDisplay = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const handleUpdateApplicationStatus = async (appId: string, status: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appId);

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Başvuru durumu güncellendi." });
      fetchData();
    }
  };

  const handleAdvisorUploadDocument = async (appId: string, file: File) => {
    if (!file || !newDocName) {
      toast({ title: "Uyarı", description: "Lütfen belge adı girin ve dosya seçin.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `advisor-uploads/${appId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Hata", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('application_documents' as any)
      .insert({
        application_id: appId,
        advisor_id: advisorId,
        name: newDocName,
        url: publicUrl
      });

    if (dbError) {
      toast({ title: "Veritabanı Hatası", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Belge başarıyla yüklendi." });
      setNewDocName("");
      setIsUploadDialogOpen(false);
      fetchData();
    }
    setUploading(false);
  };

  if (authLoading || roleLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const navItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Panel Özeti', icon: LayoutDashboard },
    { id: 'applications', label: 'Müşterilerim', icon: User },
    { id: 'messages', label: 'Mesajlar', icon: MessageSquare, badgeCount: stats?.pendingMessages || undefined },
    { id: 'bookings', label: 'Görüşmeler', icon: Calendar, badgeCount: consultations.filter(c => c.status === 'pending').length || undefined },
    { id: 'financials', label: 'Finansal Durum', icon: TrendingUp },
    { id: 'profile', label: 'Profilim', icon: User },
  ];

  return (
    <DashboardLayout
      titlePrefix="Danışman"
      titleSuffix="Yönetim Portalı"
      groupLabel="Yönetim Paneli"
      items={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      noPadding={activeTab === 'messages'}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-navy-dark mb-1 tracking-tight px-2">Merhaba, {user?.user_metadata?.full_name || 'Danışman'} 👋</h1>
              <p className="text-lg text-slate-500 font-medium px-2">Şu anda sistemde <strong className="text-navy-dark font-black">{stats.assigned}</strong> aktif müşteriden sorumlusunuz.</p>
            </div>
            <div className="hidden lg:flex gap-4">
              <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-center">
                <p className="text-2xl font-black text-blue-600 leading-none">{stats.activeApps}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mt-1">Süreçte</p>
              </div>
              <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 text-center">
                <p className="text-2xl font-black text-emerald-600 leading-none">{stats.completed}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Tamamlanan</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition-all cursor-default group relative overflow-hidden h-40">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
                <User size={24} />
              </div>
              <div>
                <p className="text-4xl font-black tracking-tighter text-navy-dark">{stats.assigned}</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Toplam Müşteri</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-all cursor-default group relative overflow-hidden h-40">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-4xl font-black tracking-tighter text-navy-dark">{stats.pendingMessages}</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Bekleyen Mesaj</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-violet-200 transition-all cursor-default group relative overflow-hidden h-40">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl w-fit mb-4">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-4xl font-black tracking-tighter text-navy-dark">{stats.completed}</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Tamamlanan İşlem</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-navy-dark tracking-tight">Gelir Analizi</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Hak ediş performans raporu</p>
                </div>
                <div className="flex gap-3 items-center">
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-1.5 rounded-full text-xs font-black shadow-sm tracking-wider uppercase hidden sm:flex">Yüksek Performans</Badge>
                  <select
                    className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-1.5 rounded-xl font-bold text-xs h-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:bg-slate-100 cursor-pointer"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                  >
                    <option value="3months">Son 3 Ay</option>
                    <option value="6months">Son 6 Ay</option>
                    <option value="year">Son 1 Yıl</option>
                    <option value="all">Tüm Zamanlar</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `€${val}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      formatter={(value: any) => [`€${value}`, 'Gelir']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between min-h-[400px]">
              <div>
                <h3 className="text-xl font-black text-navy-dark mb-6 tracking-tight">Performans Metrikleri</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cevap Süresi</span>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black">Mükemmel</Badge>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-navy-dark">{stats.avgResponseTime}</span>
                      <span className="text-[10px] font-bold text-slate-400 mb-1.5">Hedef: &lt; 2s</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-violet-200 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Müşteri Memnuniyeti</span>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black">Yüksek</Badge>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-navy-dark">%{stats.satisfactionRate}</span>
                      <span className="text-[10px] font-bold text-slate-400 mb-1.5">Hedef: &gt; %90</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Başarı Oranı</span>
                      <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] font-black">İyi</Badge>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-navy-dark">%{stats.completionRate}</span>
                      <span className="text-[10px] font-bold text-slate-400 mb-1.5">Hedef: &gt; %85</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-6 h-12 rounded-xl border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                Performans Detayları
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 gap-6">
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-black text-navy-dark tracking-tight">Müşterilerim</h2>
                <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-4 py-1.5 rounded-full font-bold">{filteredApplications.length} Kayıt</Badge>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Başvuru ara..."
                    className="pl-12 bg-slate-50 border-slate-100 h-12 rounded-2xl font-bold shadow-none"
                    value={appSearchTerm}
                    onChange={(e) => setAppSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-2xl font-bold text-sm h-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[160px]"
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="Alındı">Alındı</option>
                  <option value="İnceleniyor">İnceleniyor</option>
                  <option value="İşlem Gerekli">İşlem Gerekli</option>
                  <option value="Gönderildi">Gönderildi</option>
                  <option value="Onaylandı">Onaylandı</option>
                  <option value="Reddedildi">Reddedildi</option>
                </select>
                <Button variant="outline" className="h-12 rounded-2xl font-bold border-slate-200 text-slate-600 px-6 hover:bg-slate-50" onClick={handleExportAppsCSV}>
                  Dışa Aktar
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {customers.map((customer) => {
              const isExpanded = expandedCustomerIds.includes(customer.user_id);
              const hasApplications = customer.applications.length > 0;

              return (
                <div key={customer.user_id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                  <div
                    className={`p-6 cursor-pointer flex items-center justify-between transition-colors ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}
                    onClick={() => toggleCustomerExpand(customer.user_id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-navy-dark font-black text-xl">
                        {customer.applicant_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-navy-dark tracking-tight">{customer.applicant_name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Phone size={12} /> {customer.phone || '-'}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Package size={12} /> {customer.plan || 'Plan Yok'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex items-center gap-2">
                        {hasApplications ? (
                          <div className="flex items-center gap-3">
                            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3 py-1">
                              {customer.applications[0].destination_country}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
                              {customer.applications.length > 1 ? `+${customer.applications.length - 1} Başvuru` : customer.applications[0].status}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px] font-black uppercase">Başvuru Yok</Badge>
                        )}
                      </div>
                      <div className={`p-2 rounded-xl transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-navy-dark text-white' : 'bg-slate-100 text-slate-400 shadow-sm'}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 gap-3">
                        {hasApplications ? (
                          customer.applications.map((app) => (
                            <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all">
                              <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                  <MapPin size={24} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HEDEF ÜLKE</p>
                                    <h4 className="text-md font-black text-navy-dark">{app.destination_country}</h4>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">VİZE TÜRÜ</p>
                                    <p className="text-xs font-bold text-slate-600">{app.visa_type}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">REFERANS</p>
                                    <p className="text-xs font-black text-navy-dark">#{app.id.substring(0, 8).toUpperCase()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BAŞVURU DURUMU</p>
                                    <Badge className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${app.status === 'Onaylandı' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                      {app.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 flex gap-2">
                                <Button
                                  size="sm"
                                  className="h-10 px-6 bg-navy-dark hover:bg-navy-light text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-navy-dark/10"
                                  onClick={() => navigate(`/advisor/customer/${customer.profile_id}?appId=${app.id}`)}
                                >
                                  Yönet
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm font-bold text-slate-400 italic">Henüz aktif bir başvurusu bulunmuyor.</p>
                            <Button
                              variant="link"
                              className="text-blue-500 font-black text-xs uppercase mt-2"
                              onClick={() => {
                                setDirectBookCustomerId(customer.user_id);
                                setDirectBookOpen(true);
                              }}
                            >
                              Randevu Planla
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex border-t border-slate-100 pt-4 gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-slate-200 text-slate-600 font-bold h-10 px-4 text-xs hover:bg-white"
                          onClick={() => navigate(`/advisor/customer/${customer.profile_id}`)}
                        >
                          Müşteri Profili
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-slate-400 font-bold h-10 px-4 text-xs hover:text-navy-dark"
                          onClick={() => {
                            setDirectBookCustomerId(customer.user_id);
                            setDirectBookOpen(true);
                          }}
                        >
                          Görüşme Planla
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>



          {isUploadDialogOpen && selectedAppForUpload && (
            <div className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-navy-dark">Belge Yükle</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsUploadDialogOpen(false)} className="rounded-full">
                    <X size={24} />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-black text-navy-dark uppercase tracking-widest">Belge Adı</Label>
                    <Input
                      placeholder="Örn: Vize Randevu Belgesi"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold px-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-black text-navy-dark uppercase tracking-widest">Dosya Seçin</Label>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition-colors mb-3" />
                        <p className="text-sm text-slate-500 font-bold">Yüklemek için tıklayın</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAdvisorUploadDocument(selectedAppForUpload, file);
                        }}
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  {appDocs[selectedAppForUpload] && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Yüklenen Belgeler</p>
                      <div className="space-y-2">
                        {appDocs[selectedAppForUpload].map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="font-bold text-navy-dark text-sm">{doc.name}</span>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-black text-xs uppercase hover:underline">Görüntüle</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {
        activeTab === 'messages' && (
          <div className="flex h-full w-full bg-slate-50 overflow-hidden animate-in fade-in duration-500">
            {/* Chat List Sidebar (Inner) */}
            <div className="w-[350px] border-r border-slate-200 bg-white flex flex-col h-full shadow-sm z-10">
              <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-20">
                <h3 className="text-2xl font-black text-navy-dark tracking-tight">Görüşmeler</h3>
              </div>
              <div className="flex-1 overflow-y-auto w-full">
                <div className="space-y-4">
                  {applications.map(app => (
                    <div
                      key={app.id}
                      className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 ${selectedChatUser?.id === app.user_id ? 'bg-white shadow-xl shadow-slate-200/50 scale-[1.02] border border-emerald-100' : 'hover:bg-white hover:shadow-lg hover:shadow-slate-200/30'}`}
                      onClick={() => setSelectedChatUser({ id: app.user_id, name: app.applicant_name })}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-dark to-navy-light text-white flex items-center justify-center font-black text-lg">
                          {app.applicant_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-lg font-black text-navy-dark truncate">{app.applicant_name}</p>
                          <p className="text-sm font-bold text-slate-400 truncate uppercase tracking-wider">{app.destination_country}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {applications.length === 0 && <p className="text-center py-20 text-slate-400 font-bold">Aktif görüşme bulunmuyor.</p>}
                </div>
              </div>
            </div>

            {/* Active Chat Area */}
            <div className="flex-1 bg-[#E5DDD5] h-full relative flex flex-col">
              {selectedChatUser ? (
                <MessageCenter
                  currentUserId={user!.id}
                  targetUserId={selectedChatUser.id}
                  targetUserName={selectedChatUser.name}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                    <MessageSquare size={40} className="text-slate-300" />
                  </div>
                  <p className="text-xl font-bold text-slate-500">Mesajlaşmak için bir konuşma seçin</p>
                </div>
              )}
            </div>
          </div>
        )
      }

      {
        activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500"></div>

              <div className="flex items-center justify-between mb-12 flex-col md:flex-row gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-navy-dark tracking-tight">{user?.user_metadata?.full_name || 'Danışman'}</h2>
                  <p className="text-lg text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Vize Danışmanı</p>
                </div>
                {!isEditingProfile && (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    variant="outline"
                    className="rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none px-6 h-12"
                  >
                    Profil Düzenle
                  </Button>
                )}
              </div>

              {!isEditingProfile ? (
                <div className="flex flex-col md:flex-row gap-12">
                  <div className="flex flex-col items-center gap-6 w-full md:w-1/3">
                    <div className="w-48 h-48 rounded-[2.5rem] bg-slate-50 border-4 border-slate-100 flex items-center justify-center overflow-hidden relative shadow-inner">
                      {formData.photo_url ? (
                        <img src={formData.photo_url} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-slate-200 w-24 h-24" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">E-posta Adresi</span>
                        <div className="text-lg font-medium text-navy-dark py-2 px-1 border-b border-slate-50">{formData.email || "Belirtilmemiş"}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Telefon Numarası</span>
                        <div className="text-lg font-medium text-navy-dark py-2 px-1 border-b border-slate-50">{formData.phone || "Belirtilmemiş"}</div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 block mb-2">Uzmanlık Alanları</span>
                      <div className="flex flex-wrap gap-3">
                        {formData.specialties && formData.specialties.length > 0 ? (
                          formData.specialties.map(specialty => (
                            <Badge
                              key={specialty}
                              className="px-6 py-3 rounded-2xl text-sm font-bold bg-navy-dark border-transparent shadow-[0_4px_15px_rgb(0,0,0,0.1)] text-white"
                            >
                              {specialty}
                            </Badge>
                          ))
                        ) : (
                          <div className="text-slate-500 font-medium py-2 px-1">Belirtilmemiş</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 block">Hakkımda</span>
                      <div className="text-lg font-medium text-navy-dark py-2 px-1 leading-relaxed border-t border-slate-50 border-b pb-4 pt-4 whitespace-pre-wrap">{formData.bio || "Belirtilmemiş"}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-12 animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row gap-12">
                    <div className="flex flex-col items-center gap-6 w-full md:w-1/3">
                      <div className="w-48 h-48 rounded-[2.5rem] bg-slate-50 border-4 border-slate-100 flex items-center justify-center overflow-hidden relative group shadow-inner">
                        {formData.photo_url ? (
                          <img src={formData.photo_url} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                          <User className="text-slate-200 w-24 h-24" />
                        )}
                        <label className="absolute inset-0 bg-navy-dark/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                          {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white w-10 h-10" />}
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                        </label>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Profil Fotoğrafı</p>
                        <p className="text-xs text-slate-500 mt-2">Daha iyi bir izlenim için profesyonel bir fotoğraf yükleyin.</p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="text-sm font-black text-navy-dark uppercase tracking-widest ml-1">E-posta Adresi</Label>
                          <Input
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-lg font-bold px-6 border outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                            placeholder="contact@visapath.com"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-black text-navy-dark uppercase tracking-widest ml-1">Telefon Numarası</Label>
                          <Input
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-lg font-bold px-6 border outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                            placeholder="+90 555 ..."
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-black text-navy-dark uppercase tracking-widest ml-1">Uzmanlık Alanları</Label>
                        <div className="flex flex-wrap gap-3">
                          {SPECIALTIES_LIST.map(specialty => (
                            <Badge
                              key={specialty}
                              variant={formData.specialties?.includes(specialty) ? "default" : "outline"}
                              className={`px-6 py-3 rounded-2xl cursor-pointer transition-all text-sm font-bold ${formData.specialties?.includes(specialty) ? "bg-navy-dark border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-white" : "bg-white border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600"}`}
                              onClick={() => toggleSpecialty(specialty)}
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-black text-navy-dark uppercase tracking-widest ml-1">Hakkımda</Label>
                        <Textarea
                          value={formData.bio}
                          onChange={e => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Deneyimlerinizi ve danışanlarınıza yaklaşımınızı anlatın..."
                          className="min-h-[160px] rounded-[2rem] border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-lg font-medium p-8 leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)} className="flex-1 rounded-[2.5rem] font-semibold h-20 border-slate-200 text-slate-600 hover:bg-slate-50 text-xl shadow-none">
                          İptal
                        </Button>
                        <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl h-20 rounded-[2.5rem] shadow-xl shadow-emerald-200/50 transition-all active:scale-[0.99]">
                          Değişiklikleri Kaydet
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )
      }

      {
        activeTab === 'bookings' && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header section with summary */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-4xl font-black text-navy-dark tracking-tight">Randevu & Müsaitlik Yönetimi</h2>
                <p className="text-lg text-slate-500 font-medium mt-1">Görüşme taleplerini onaylayın ve çalışma saatlerinizi düzenleyin.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-center">
                  <p className="text-2xl font-black text-blue-600 leading-none">{stats.pendingConsultations}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mt-1">Bekleyen</p>
                </div>
                <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 text-center">
                  <p className="text-2xl font-black text-emerald-600 leading-none">{consultations.filter(c => c.status === 'confirmed').length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Onaylı</p>
                </div>
              </div>
            </div>

            {/* Consultation Requests & Approved Meetings - Side by Side or Vertical based on screens */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Requests */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-navy-dark tracking-tight flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <Clock size={20} />
                      </div>
                      Bekleyen Talepler
                    </h3>
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {consultations.filter(c => c.status === 'pending').map(c => (
                      <div key={c.id} className="p-6 bg-slate-50 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 hover:border-blue-200 transition-all group gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-navy-dark font-black text-lg border border-slate-100">
                            {c.customer_name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-navy-dark text-lg leading-tight">{c.customer_name}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              <span className="text-slate-500 font-bold text-sm flex items-center gap-1">
                                <Calendar size={14} /> {format(new Date(c.start_time), 'd MMMM yyyy, EEEE', { locale: tr })}
                              </span>
                              <span className="text-blue-600 font-black text-sm uppercase tracking-wider">
                                {format(new Date(c.start_time), 'HH:mm')} - {format(new Date(c.end_time), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button onClick={() => handleUpdateConsultationStatus(c.id, 'confirmed')} className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold h-12 px-6 shadow-lg shadow-emerald-500/20">Onayla</Button>
                          <Button onClick={() => handleUpdateConsultationStatus(c.id, 'rejected')} variant="outline" className="flex-1 sm:flex-none text-rose-600 border-rose-100 hover:bg-rose-50 rounded-xl font-bold h-12 px-6">Reddet</Button>
                        </div>
                      </div>
                    ))}
                    {consultations.filter(c => c.status === 'pending').length === 0 && (
                      <div className="flex flex-col items-center justify-center flex-1 py-10 opacity-30">
                        <Clock size={48} className="mb-4" />
                        <p className="font-bold">Bekleyen randevu talebi bulunmuyor.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approved Meetings (upcoming only) */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-navy-dark tracking-tight flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={20} />
                      </div>
                      Onaylanmış Görüşmeler
                    </h3>
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {consultations
                      .filter(c => c.status === 'confirmed' && new Date(c.end_time) >= new Date())
                      .map(c => (
                      <div key={c.id} className="p-6 bg-white rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 hover:shadow-md transition-all gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg border border-emerald-100">
                            <Check size={28} />
                          </div>
                          <div>
                            <p className="font-black text-navy-dark text-lg leading-tight">{c.customer_name}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              <span className="text-slate-500 font-bold text-sm flex items-center gap-1">
                                <Calendar size={14} /> {format(new Date(c.start_time), 'd MMMM yyyy, EEEE', { locale: tr })}
                              </span>
                              <span className="text-emerald-600 font-black text-sm uppercase tracking-wider">
                                {format(new Date(c.start_time), 'HH:mm')} - {format(new Date(c.end_time), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => handleUpdateConsultationStatus(c.id, 'cancelled')} variant="outline" className="text-rose-600 border-rose-100 hover:bg-rose-50 rounded-xl font-bold h-12 px-6 shrink-0">Görüşme İptal Et</Button>
                      </div>
                    ))}
                    {consultations.filter(c => c.status === 'confirmed' && new Date(c.end_time) >= new Date()).length === 0 && (
                      <div className="flex flex-col items-center justify-center flex-1 py-10 opacity-30">
                        <CheckCircle2 size={48} className="mb-4" />
                        <p className="font-bold">Yaklaşan onaylı görüşme bulunmuyor.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Geçmiş Görüşmeler */}
              {consultations.filter(c => c.status === 'confirmed' && new Date(c.end_time) < new Date()).length > 0 && (
                <div className="mt-8">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black text-navy-dark tracking-tight flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Calendar size={20} />
                      </div>
                      Geçmiş Görüşmeler
                    </h3>
                    <div className="space-y-4">
                      {consultations
                        .filter(c => c.status === 'confirmed' && new Date(c.end_time) < new Date())
                        .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())
                        .map(c => (
                          <div key={c.id} className="p-6 bg-slate-50 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 gap-4 opacity-90">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center font-black text-lg">
                                <Check size={28} />
                              </div>
                              <div>
                                <p className="font-black text-navy-dark text-lg leading-tight">{c.customer_name}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                  <span className="text-slate-500 font-bold text-sm flex items-center gap-1">
                                    <Calendar size={14} /> {format(new Date(c.start_time), 'd MMMM yyyy, EEEE', { locale: tr })}
                                  </span>
                                  <span className="text-slate-500 font-bold text-sm">
                                    {format(new Date(c.start_time), 'HH:mm')} - {format(new Date(c.end_time), 'HH:mm')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 font-bold shrink-0">Geçmiş</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Date-Specific Availability */}
              <div className="xl:col-span-12">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                  <div className="flex flex-col md:flex-row gap-10">
                    {/* Left: Calendar */}
                    <div className="w-full md:w-1/2 flex flex-col items-center border-r border-slate-100 pr-0 md:pr-10">
                      <div className="text-center md:text-left w-full mb-6">
                        <h2 className="text-3xl font-black text-navy-dark tracking-tight mb-2 flex items-center gap-3">
                          <CalendarIcon className="text-emerald-500" /> Uygunluk Takvimi
                        </h2>
                        <p className="text-slate-500 font-medium">Hangi günlerde müsait olduğunuzu seçin ve saatlerinizi belirleyin.</p>
                      </div>
                      <CalendarUI
                        mode="single"
                        selected={selectedAvailDate}
                        onSelect={(newDate) => {
                          if (newDate) setSelectedAvailDate(newDate);
                        }}
                        className="rounded-2xl border-none bg-slate-50 shadow-sm p-4 w-full flex justify-center"
                        disabled={(date) => date < startOfDay(new Date())}
                        locale={tr}
                      />
                    </div>

                    {/* Right: Slots */}
                    <div className="w-full md:w-1/2 pl-0 md:pl-10 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-navy-dark">
                          {selectedAvailDate ? format(selectedAvailDate, 'd MMMM EEEE', { locale: tr }) : 'Tarih Seçin'}
                        </h3>
                        {selectedAvailDate && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor="active-day" className="font-bold text-slate-500 cursor-pointer">Günü Aktif Et</Label>
                            <button
                              id="active-day"
                              onClick={() => handleToggleDayActive(!dateActive)}
                              className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${dateActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                              <div className={`w-6 h-6 rounded-full bg-white transition-transform ${dateActive ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        )}
                      </div>

                      {dateActive ? (
                        <div className="flex-1 min-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          <p className="text-sm text-slate-500 mb-4 font-bold">Müsait olduğunuz saatleri aşağıdan seç bırakabilirsiniz. Yeşil olanlar müşterilere açık olacaktır.</p>
                          <div className="grid grid-cols-3 gap-3">
                            {generateAllSlotsForDisplay().map(slot => {
                              const isSelected = activeSlots.includes(slot);
                              return (
                                <button
                                  key={slot}
                                  onClick={() => toggleAvailabilitySlot(slot)}
                                  className={`h-12 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center ${isSelected
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
                                    : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100"
                                    }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center p-8 opacity-50 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <CalendarIcon size={48} className="mb-4 text-slate-400" />
                          <p className="font-bold text-slate-500 text-lg">Bu gün kapalı.</p>
                          <p className="text-sm text-slate-400 mt-2">Müsaitlik eklemek için "Günü Aktif Et" butonuna tıklayın.</p>
                        </div>
                      )}

                      <div className="pt-8 border-t border-slate-100 mt-auto">
                        <Button
                          onClick={handleSaveAvailability}
                          disabled={savingAvail || !selectedAvailDate}
                          className="w-full h-16 rounded-2xl bg-navy-dark hover:bg-navy-light text-white font-black text-lg shadow-xl shadow-navy-dark/20 transition-all active:scale-[0.98]"
                        >
                          {savingAvail ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" size={20} />}
                          Müsaitliği Kaydet
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* FINANCIALS TAB (Hak Ediş) */}
      {
        activeTab === 'financials' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-navy-dark tracking-tight">Finansal Kayıtlar</h2>
                <p className="text-slate-500 font-medium mt-1">Hak ediş (komisyon) geçmişi tablosu</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition-all cursor-default group relative overflow-hidden min-h-[160px]">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={100} className="text-blue-900" />
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
                  <TrendingUp size={24} />
                </div>
                <div className="relative z-10">
                  <p className="text-4xl font-black tracking-tighter text-navy-dark">€{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Toplam Hak Ediş</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-all cursor-default group relative overflow-hidden min-h-[160px]">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={100} className="text-emerald-900" />
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
                  <TrendingUp size={24} />
                </div>
                <div className="relative z-10">
                  <p className="text-4xl font-black tracking-tighter text-navy-dark">€{stats.withdrawableBalance.toLocaleString()}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Çekilebilir Bakiye</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-amber-200 transition-all cursor-default group relative overflow-hidden min-h-[160px]">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Clock size={100} className="text-amber-900" />
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4">
                  <Clock size={24} />
                </div>
                <div className="relative z-10">
                  <p className="text-4xl font-black tracking-tighter text-navy-dark">€{stats.pendingRevenue.toLocaleString()}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Bekleyen Ödeme</p>
                </div>
              </div>
            </div>

            {/* T-Table Layout for Advisor (Only Income/Hak Ediş) */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
              <div className="flex-1 flex flex-col">
                <div className="bg-slate-50/50 p-6 border-b border-slate-100 text-center sticky top-0 z-10 flex justify-between items-center">
                  <h3 className="font-black text-navy-dark text-lg uppercase tracking-[0.2em]">HAK EDİŞ GEÇMİŞİ</h3>
                  <Badge className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-1.5 rounded-full font-bold">
                    {financialTransactions.length} Kayıt
                  </Badge>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100/50">
                        <TableHead className="font-bold text-slate-400">Tarih</TableHead>
                        <TableHead className="font-bold text-slate-400">Açıklama</TableHead>
                        <TableHead className="text-right font-bold text-slate-400">Tutar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialTransactions.map((t, idx) => (
                        <TableRow key={idx} className="border-slate-50 group hover:bg-emerald-50/20">
                          <TableCell className="text-xs font-medium text-slate-500">{new Date(t.date).toLocaleDateString('tr-TR')}</TableCell>
                          <TableCell>
                            <div className="font-black text-navy-dark text-sm">{t.category}</div>
                            <div className="text-xs font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">{t.customerName}</div>
                          </TableCell>
                          <TableCell className="text-right font-black text-emerald-600 text-base">+€{t.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {financialTransactions.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400 font-medium h-32">Herhangi bir kayıt bulunamadı.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        directBookOpen && directBookCustomerId && advisorId && (
          <BookingCalendar
            advisorId={advisorId}
            userId={directBookCustomerId} // Auth ID
            profileId={applications.find(a => a.user_id === directBookCustomerId)?.profile_id || ""} // Correct Profile ID
            isOpen={directBookOpen}
            onClose={() => {
              setDirectBookOpen(false);
              setDirectBookCustomerId(null);
              fetchData();
            }}
            isDirectBooking={true}
          />
        )
      }
    </DashboardLayout >
  );
}
