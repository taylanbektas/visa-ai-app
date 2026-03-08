import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  FileText,
  Bot,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Loader2,
  Upload,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Save,
  History,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AIApplicationSummary from "@/components/AIApplicationSummary";
import AIDocumentReview from "@/components/AIDocumentReview";
import AIDashboardChat from "@/components/AIDashboardChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Application = {
  id: string;
  reference_id: string;
  destination: string;
  visa_type: string;
  status: string;
  created_at: string;
  user_id: string;
  plan: string;
  notes: string | null;
  travel_date: string | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  user_id: string;
  active_package: string | null;
  notes?: string | null;
};

export default function AgencyApplicationDetail() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<any[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (appId && user) fetchData();
  }, [appId, user]);

  const fetchData = async () => {
    if (!appId || !user) return;
    setLoading(true);
    try {
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select("*")
        .eq("id", appId)
        .single();

      if (appError || !appData) {
        toast({ title: "Başvuru bulunamadı", variant: "destructive" });
        navigate("/agency");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", appData.user_id)
        .eq("agency_id", user.id)
        .single();

      if (profileError || !profileData) {
        toast({ title: "Bu başvuruya erişim yetkiniz yok.", variant: "destructive" });
        navigate("/agency");
        return;
      }

      setProfile(profileData as any);
      setCustomerNotes((profileData as any).notes || "");
      setApplication({
        ...appData,
        destination: appData.destination,
      });

      const { data: docsData } = await supabase
        .from("application_documents")
        .select("*")
        .eq("application_id", appData.id);
      setDocs(docsData || []);
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
      navigate("/agency");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!application) return;
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", application.id);
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Başarılı", description: "Durum güncellendi." });
      setApplication({ ...application, status });
    }
  };

  const handleSaveNotes = async () => {
    if (!profile) return;
    setSavingNotes(true);
    const { error } = await supabase.from("profiles").update({ notes: customerNotes }).eq("id", profile.id);
    if (error) toast({ title: "Hata", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Notlar kaydedildi." });
      setProfile({ ...profile, notes: customerNotes });
    }
    setSavingNotes(false);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !user || !newDocName) return;
    const fileInput = document.getElementById("agency-doc-upload") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      toast({ title: "Dosya seçin", variant: "destructive" });
      return;
    }
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `agency-uploads/${user.id}/${application.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file);
    if (uploadError) {
      toast({ title: "Yükleme hatası", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(filePath);
    const { error: dbError } = await supabase.from("application_documents").insert({
      application_id: application.id,
      advisor_id: null,
      name: newDocName,
      url: publicUrl,
    });
    if (dbError) toast({ title: "Kayıt hatası", description: dbError.message, variant: "destructive" });
    else {
      toast({ title: "Belge yüklendi." });
      setNewDocName("");
      setIsUploadDialogOpen(false);
      fetchData();
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }
  if (!profile || !application) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header - panel ile uyumlu */}
      <div className="bg-navy-dark pt-10 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              className="bg-white/5 text-white hover:bg-white/10 rounded-xl p-0 h-12 w-12 border border-white/10"
              onClick={() => navigate("/agency")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center font-black text-2xl text-white backdrop-blur-md border border-white/20">
                {profile.full_name?.substring(0, 2).toUpperCase() || "??"}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-0.5">
                  <h1 className="text-3xl font-black text-white tracking-tight">{profile.full_name || "İsimsiz Müşteri"}</h1>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-none px-2 py-0.5 rounded-lg text-[9px] uppercase font-black">Acente Başvurusu</Badge>
                </div>
                <div className="flex items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Phone size={12} /> {profile.phone || "-"}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(application.created_at).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <div className="px-5 py-2">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Durum</p>
              <select
                className="bg-transparent text-white font-black text-sm focus:outline-none cursor-pointer p-0 appearance-none"
                value={application.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
              >
                <option className="text-navy-dark" value="Alındı">Alındı</option>
                <option className="text-navy-dark" value="İnceleniyor">İnceleniyor</option>
                <option className="text-navy-dark" value="İşlem Gerekli">İşlem Gerekli</option>
                <option className="text-navy-dark" value="Gönderildi">Gönderildi</option>
                <option className="text-navy-dark" value="Onaylandı">Onaylandı</option>
                <option className="text-navy-dark" value="Reddedildi">Reddedildi</option>
              </select>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${application.status === "Onaylandı" ? "bg-emerald-500" : application.status === "İşlem Gerekli" ? "bg-amber-500" : "bg-blue-500"}`}>
              {application.status === "Onaylandı" ? <CheckCircle2 size={24} className="text-white" /> : <Clock size={24} className="text-white" />}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-navy-dark border border-slate-100">
                  <MapPin size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-navy-dark tracking-tight">{application.destination}</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{application.visa_type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:flex gap-6 md:gap-10">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Referans</p>
                  <p className="text-lg font-black text-navy-dark">#{application.reference_id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Paket</p>
                  <Badge className="bg-blue-50 text-blue-600 border-none font-black px-3 py-1 text-xs">{application.plan}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                    <Bot size={22} />
                  </div>
                  <h3 className="text-sm font-black text-navy-dark uppercase tracking-widest">AI Başvuru Özeti</h3>
                </div>
                <AIApplicationSummary
                  applications={[{
                    destination: application.destination,
                    visaType: application.visa_type,
                    status: application.status,
                    plan: application.plan,
                    travelDate: application.travel_date,
                    uploadedDocs: docs.length,
                    totalDocs: docs.length + 2,
                  }]}
                />
              </div>

              <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100">
                <h3 className="text-sm font-black text-navy-dark uppercase tracking-widest flex items-center gap-3 mb-6">
                  <Sparkles size={20} className="text-emerald-500" /> AI Asistan
                </h3>
                <div className="h-64 overflow-hidden relative rounded-[2rem] border border-white bg-white shadow-sm">
                  <AIDashboardChat
                    context={{ destination: application.destination, visaType: application.visa_type, status: application.status }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-navy-dark tracking-tight">Belge Merkezi</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{docs.length} belge</p>
                </div>
              </div>
              <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-black px-6 shadow-lg">
                <Upload size={16} className="mr-2" /> Belge Yükle
              </Button>
            </div>
            {docs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {docs.map((doc: any, idx: number) => (
                  <div key={idx} className="group bg-slate-50/50 hover:bg-white rounded-3xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl shadow-sm flex items-center justify-center">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-navy-dark text-lg">{doc.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <History size={10} /> {doc.created_at ? new Date(doc.created_at).toLocaleDateString("tr-TR") : "-"}
                          </span>
                        </div>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="h-10 rounded-xl font-black text-[10px] uppercase px-5">Görüntüle</Button>
                      </a>
                    </div>
                    <div className="bg-white rounded-2xl p-2 border border-slate-50">
                      <AIDocumentReview
                        documentName={doc.name}
                        documentType={doc.name?.includes("Pasaport") ? "Pasaport" : "Belge"}
                        destination={application.destination}
                        visaType={application.visa_type}
                        requirementId={doc.id || idx.toString()}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <FileText size={40} className="mx-auto text-slate-200 mb-6" />
                <p className="text-slate-400 font-bold text-lg">Henüz belge yok.</p>
                <p className="text-slate-300 text-sm">Belge Yükle ile ekleyebilirsiniz.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <h3 className="text-xl font-black text-navy-dark mb-8 tracking-tight">İletişim</h3>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Phone size={10} /> Telefon</p>
                <p className="text-lg font-black text-navy-dark">{profile.phone || "-"}</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CreditCard size={10} /> Paket</p>
                <p className="text-lg font-black text-navy-dark">{profile.active_package || "Yok"}</p>
              </div>
            </div>
            <Button className="w-full mt-8 bg-navy-dark hover:bg-slate-800 text-white h-16 rounded-[1.2rem] font-black" onClick={() => navigate("/agency", { state: { tab: "messages" } })}>
              <MessageSquare size={20} className="mr-3" /> Mesajlar
            </Button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-navy-dark tracking-tight">Notlar</h3>
              <Button size="sm" variant="ghost" className="rounded-xl h-10 w-10 p-0" onClick={handleSaveNotes} disabled={savingNotes}>
                {savingNotes ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              </Button>
            </div>
            <Textarea
              placeholder="Müşteri notları..."
              className="min-h-[200px] rounded-3xl bg-slate-50/50 border-slate-100 p-6 font-bold text-sm"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-navy-dark">Belge Yükle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadDocument} className="space-y-6">
            <div>
              <Label className="text-xs font-black text-slate-400 uppercase">Belge adı</Label>
              <Input placeholder="Örn: Pasaport kopyası" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} className="h-12 rounded-xl mt-1" />
            </div>
            <div>
              <Label className="text-xs font-black text-slate-400 uppercase">Dosya</Label>
              <Input id="agency-doc-upload" type="file" className="mt-1 rounded-xl" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsUploadDialogOpen(false)}>İptal</Button>
              <Button type="submit" className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-black" disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />} Yükle
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
