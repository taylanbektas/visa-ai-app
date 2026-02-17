import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Clock,
  ArrowRight,
  Globe,
  CheckCircle,
} from "lucide-react";

/* ── Visa data ───────────────────────────────────────────── */
const visaData: Record<string, { type: string; docs: string[]; duration: string; fee: string; visa: string }> = {
  "Almanya": { type: "Schengen", visa: "Gerekli", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Otel rezervasyonu", "Uçak bileti"], duration: "10-15 iş günü", fee: "€90" },
  "Fransa": { type: "Schengen", visa: "Gerekli", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Konaklama belgesi", "Uçak bileti"], duration: "10-15 iş günü", fee: "€90" },
  "İtalya": { type: "Schengen", visa: "Gerekli", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Otel rezervasyonu"], duration: "10-15 iş günü", fee: "€90" },
  "İspanya": { type: "Schengen", visa: "Gerekli", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Konaklama belgesi"], duration: "10-15 iş günü", fee: "€90" },
  "Hollanda": { type: "Schengen", visa: "Gerekli", docs: ["Pasaport", "Banka hesap özeti", "Seyahat sigortası", "Davet mektubu veya otel"], duration: "10-15 iş günü", fee: "€90" },
  "ABD": { type: "B1/B2", visa: "Gerekli", docs: ["Pasaport", "DS-160 Formu", "Banka hesap özeti", "İş/Okul belgesi"], duration: "Mülakat sonrası 5-10 gün", fee: "$185" },
  "İngiltere": { type: "Standard Visitor", visa: "Gerekli", docs: ["Pasaport", "Banka hesap özeti", "Konaklama belgesi", "Seyahat planı"], duration: "15-20 iş günü", fee: "£115" },
  "Kanada": { type: "TRV", visa: "Gerekli", docs: ["Pasaport", "Banka hesap özeti", "Seyahat geçmişi", "Davet mektubu (varsa)"], duration: "20-30 iş günü", fee: "CAD $100" },
  "Gürcistan": { type: "Vizesiz", visa: "Gerekli Değil", docs: ["Geçerli pasaport"], duration: "-", fee: "Ücretsiz" },
  "Sırbistan": { type: "Vizesiz", visa: "Gerekli Değil", docs: ["Geçerli pasaport"], duration: "-", fee: "Ücretsiz" },
  "Katar": { type: "Vizesiz", visa: "Gerekli Değil", docs: ["Geçerli pasaport"], duration: "-", fee: "Ücretsiz" },
};

export default function VisaChecker() {
  const [destination, setDestination] = useState("");

  const result = destination ? visaData[destination] : null;

  return (
    <div className="page-shell section-gradient-light">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#00D69E]/10 flex items-center justify-center mx-auto mb-4">
            <Globe size={28} className="text-[#00D69E]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-dark mb-2">Vize Gereksinimi Kontrol</h1>
          <p className="text-muted-foreground text-sm">Hedef ülkenizi seçin, 30 saniyede vize gereksinimlerini öğrenin.</p>
        </motion.div>

        {/* Checker Widget */}
        <motion.div
          className="bg-white border border-border rounded-2xl p-5 md:p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Passport — locked */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pasaportunuz</label>
              <div className="flex items-center gap-2 h-11 px-3 rounded-lg bg-secondary border border-border text-sm font-medium">
                <span>🇹🇷</span><span>Türkiye</span>
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nereye Gidiyorsunuz?</label>
              <Select onValueChange={setDestination} value={destination}>
                <SelectTrigger className="h-11 text-sm">
                  <SelectValue placeholder="Ülke seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(visaData).map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-border rounded-2xl p-5 md:p-6 space-y-6 shadow-sm"
            >
              {/* Status */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-navy-dark">{destination}</h2>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${result.visa === "Gerekli"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                  }`}>
                  {result.visa === "Gerekli" ? `Vize ${result.visa}` : "Vizesiz Giriş 🎉"}
                </span>
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Vize Türü</p>
                  <p className="text-sm font-semibold">{result.type}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tahmini Süre</p>
                  <p className="text-sm font-semibold">{result.duration}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Konsolosluk Ücreti</p>
                  <p className="text-sm font-semibold">{result.fee}</p>
                </div>
              </div>

              {/* Docs */}
              {result.visa === "Gerekli" && (
                <div>
                  <h3 className="text-sm font-semibold text-navy-dark mb-3 flex items-center gap-2">
                    <FileText size={16} /> Gerekli Belgeler
                  </h3>
                  <div className="space-y-2">
                    {result.docs.map((doc) => (
                      <div key={doc} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle size={14} className="text-[#00D69E] shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {result.visa === "Gerekli" && (
                <Link to="/apply">
                  <Button className="w-full btn-gradient text-white font-semibold h-12 rounded-lg">
                    Başvuruya Başla <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
