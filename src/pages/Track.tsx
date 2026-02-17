import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Circle,
  Clock,
  Search,
  User,
} from "lucide-react";

const mockStages = [
  { label: "Başvuru Alındı", date: "10 Şubat 2026", status: "completed" },
  { label: "Belgeler İnceleniyor", date: "12 Şubat 2026", status: "in-progress" },
  { label: "Elçiliğe Gönderildi", date: "", status: "pending" },
  { label: "Karar Beklenen Tarih: 1 Mart 2026", date: "", status: "pending" },
  { label: "Vize Kararı", date: "", status: "pending" },
];

export default function Track() {
  const [email, setEmail] = useState("");
  const [refId, setRefId] = useState("");
  const [tracked, setTracked] = useState(false);

  return (
    <div className="page-shell">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <Search size={24} className="text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Başvuru Takip</h1>
          <p className="text-muted-foreground">Başvuru durumunuzu görmek için e-posta ve referans numaranızı girin.</p>
        </motion.div>

        {!tracked ? (
          <motion.div
            className="bg-card border rounded-xl p-5 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-posta Adresi</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" type="email" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Referans Numarası</label>
                <Input value={refId} onChange={(e) => setRefId(e.target.value)} placeholder="ör. VP-A1B2" />
              </div>
              <Button
                className="w-full btn-gradient text-white h-11"
                onClick={() => setTracked(true)}
                disabled={!email || !refId}
              >
                Başvuruyu Takip Et
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-card border rounded-xl p-5 md:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">Başvuru #{refId || "VP-X1Y2"}</h2>
                  <p className="text-sm text-muted-foreground">Türkiye → Fransa · Schengen Turist Vizesi</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold-dark">İnceleniyor</span>
              </div>

              <div className="space-y-0">
                {mockStages.map((stage, i) => (
                  <div key={stage.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {stage.status === "completed" ? (
                        <CheckCircle size={20} className="text-success shrink-0" />
                      ) : stage.status === "in-progress" ? (
                        <Clock size={20} className="text-accent shrink-0 animate-pulse" />
                      ) : (
                        <Circle size={20} className="text-muted-foreground/30 shrink-0" />
                      )}
                      {i < mockStages.length - 1 && (
                        <div className={`w-px h-8 ${stage.status === "completed" ? "bg-success" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-medium ${stage.status === "pending" ? "text-muted-foreground/50" : ""}`}>
                        {stage.label}
                      </p>
                      {stage.date && (
                        <p className="text-xs text-muted-foreground">{stage.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border rounded-xl p-5 md:p-6">
              <h3 className="font-semibold mb-3 text-sm">Danışmanınız</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <User size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Zeynep Kaya</p>
                  <p className="text-xs text-muted-foreground">Kıdemli Vize Danışmanı · Rehber Planı</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
