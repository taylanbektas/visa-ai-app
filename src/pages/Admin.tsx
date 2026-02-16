import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Eye,
  Settings,
  Users,
} from "lucide-react";

const statusOptions = ["Alındı", "İnceleniyor", "Gönderildi", "Onaylandı", "Reddedildi", "İşlem Gerekli"];

const initialApps = [
  { id: "VP-A1B2", name: "Ayşe Karagöz", destination: "Fransa", type: "Turist", plan: "Rehber", status: "İnceleniyor", date: "2026-02-10", email: "ayse@ornek.com" },
  { id: "VP-C3D4", name: "Mehmet Yılmaz", destination: "ABD", type: "İş", plan: "VIP Concierge", status: "Gönderildi", date: "2026-02-08", email: "mehmet@ornek.com" },
  { id: "VP-E5F6", name: "Elif Demir", destination: "İngiltere", type: "Turist", plan: "Rehber", status: "Onaylandı", date: "2026-01-28", email: "elif@ornek.com" },
  { id: "VP-G7H8", name: "Ahmet Kılıç", destination: "Almanya", type: "Öğrenci", plan: "Keşfet", status: "Alındı", date: "2026-02-14", email: "ahmet@ornek.com" },
  { id: "VP-I9J0", name: "Fatma Şahin", destination: "Kanada", type: "Turist", plan: "VIP Concierge", status: "İnceleniyor", date: "2026-02-12", email: "fatma@ornek.com" },
  { id: "VP-K1L2", name: "Hasan Çelik", destination: "Avustralya", type: "İş", plan: "Rehber", status: "İşlem Gerekli", date: "2026-02-09", email: "hasan@ornek.com" },
  { id: "VP-M3N4", name: "Zeynep Aydın", destination: "Japonya", type: "Turist", plan: "Keşfet", status: "Alındı", date: "2026-02-15", email: "zeynep@ornek.com" },
  { id: "VP-O5P6", name: "Ali Özkan", destination: "BAE", type: "İş", plan: "Rehber", status: "Onaylandı", date: "2026-02-01", email: "ali@ornek.com" },
];

const statusColors: Record<string, string> = {
  "Alındı": "bg-muted text-muted-foreground",
  "İnceleniyor": "bg-gold/10 text-gold-dark",
  "Gönderildi": "bg-blue-500/10 text-blue-700",
  "Onaylandı": "bg-success/10 text-success",
  "Reddedildi": "bg-destructive/10 text-destructive",
  "İşlem Gerekli": "bg-orange-500/10 text-orange-700",
};

export default function Admin() {
  const [apps, setApps] = useState(initialApps);
  const [selectedApp, setSelectedApp] = useState<typeof initialApps[0] | null>(null);

  const updateStatus = (id: string, newStatus: string) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
            <p className="text-sm text-muted-foreground">Tüm vize başvurularını yönetin</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{apps.length} başvuru</span>
          </div>
        </motion.div>

        <motion.div
          className="bg-card border rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Ref</th>
                  <th className="text-left p-4 font-medium">Ad Soyad</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Hedef Ülke</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Tür</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Plan</th>
                  <th className="text-left p-4 font-medium">Durum</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Tarih</th>
                  <th className="text-left p-4 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs">{app.id}</td>
                    <td className="p-4 font-medium">{app.name}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{app.destination}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{app.type}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{app.plan}</td>
                    <td className="p-4">
                      <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                        <SelectTrigger className="h-7 w-[140px] text-xs">
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
                    </td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground text-xs">{app.date}</td>
                    <td className="p-4">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}>
                            <Eye size={14} />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Başvuru {app.id}</SheetTitle>
                          </SheetHeader>
                          <div className="mt-6 space-y-4">
                            {[
                              { label: "Ad Soyad", value: app.name },
                              { label: "E-posta", value: app.email },
                              { label: "Hedef Ülke", value: app.destination },
                              { label: "Vize Türü", value: app.type },
                              { label: "Plan", value: app.plan },
                              { label: "Durum", value: app.status },
                              { label: "Gönderim Tarihi", value: app.date },
                            ].map((item) => (
                              <div key={item.label}>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="text-sm font-medium">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </SheetContent>
                      </Sheet>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
