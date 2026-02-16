import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  FileText,
  User,
  Settings,
  Upload,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const applications = [
  { id: "VP-A1B2", destination: "Fransa", type: "Schengen Turist", status: "İnceleniyor", advisor: "Zeynep Kaya", date: "10 Şubat 2026" },
  { id: "VP-X9Z8", destination: "İngiltere", type: "Standart Ziyaretçi", status: "İşlem Gerekli", advisor: "Emre Aksoy", date: "25 Ocak 2026" },
];

const notifications = [
  { text: "Fransa vize başvurunuzun belgeleri incelendi.", time: "2 saat önce", type: "info" },
  { text: "İşlem gerekli: Lütfen İngiltere başvurunuz için güncel banka hesap özeti yükleyin.", time: "1 gün önce", type: "warning" },
  { text: "VisaPath'e hoş geldiniz! Hesabınız başarıyla oluşturuldu.", time: "3 gün önce", type: "success" },
];

const statusIcons: Record<string, any> = {
  "İnceleniyor": Clock,
  "Onaylandı": CheckCircle,
  "İşlem Gerekli": AlertCircle,
};

const statusColors: Record<string, string> = {
  "İnceleniyor": "bg-gold/10 text-gold-dark",
  "Onaylandı": "bg-success/10 text-success",
  "İşlem Gerekli": "bg-orange-500/10 text-orange-700",
};

export default function Dashboard() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-1">Hoş geldiniz, Ayşe</h1>
          <p className="text-muted-foreground">Vize başvurularınızın genel görünümü.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Applications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FileText size={18} /> Başvurularınız
              </h2>
              <div className="space-y-4">
                {applications.map((app) => {
                  const StatusIcon = statusIcons[app.status] || Clock;
                  return (
                    <div key={app.id} className="bg-card border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-mono text-xs text-muted-foreground">{app.id}</span>
                          <h3 className="font-semibold">{app.destination} — {app.type}</h3>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || ""}`}>
                          <StatusIcon size={12} />
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User size={14} />
                          <span>Danışman: {app.advisor}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{app.date}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link to="/track">
                          <Button size="sm" variant="outline" className="text-xs">Durumu Takip Et</Button>
                        </Link>
                        <Button size="sm" variant="ghost" className="text-xs">
                          <Upload size={12} className="mr-1" /> Belge Yükle
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Start New */}
            <Link to="/apply" className="block">
              <div className="border-2 border-dashed border-accent/20 rounded-xl p-6 text-center hover:border-accent/40 transition-colors">
                <p className="text-sm font-medium text-muted-foreground">
                  + Yeni Başvuru Oluştur
                </p>
              </div>
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Bell size={18} /> Bildirimler
              </h2>
              <div className="bg-card border rounded-xl divide-y">
                {notifications.map((n, i) => (
                  <div key={i} className="p-4">
                    <p className="text-xs leading-relaxed">{n.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Account */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Settings size={18} /> Hesap
              </h2>
              <div className="bg-card border rounded-xl p-5 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Ad Soyad</p>
                  <p className="text-sm font-medium">Ayşe Karagöz</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-posta</p>
                  <p className="text-sm font-medium">ayse@ornek.com</p>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Profili Düzenle
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
