import { useState } from "react";
import { motion } from "framer-motion";
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
  CheckCircle,
  Clock,
  Building2,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Search,
} from "lucide-react";

const nationalities = [
  "Turkey", "Germany", "France", "United Kingdom", "India", "Pakistan",
  "Nigeria", "Egypt", "Iran", "Morocco", "Algeria", "Brazil",
  "China", "Philippines", "Indonesia",
];

const destinations = [
  "France", "Germany", "United States", "United Kingdom", "Canada",
  "Australia", "UAE", "Japan", "Italy", "Spain",
];

type VisaResult = {
  status: "required" | "on-arrival" | "visa-free";
  processingTime: string;
  appointmentRequired: boolean;
  govFee: string;
  notes: string;
};

const visaData: Record<string, Record<string, VisaResult>> = {
  Turkey: {
    France: { status: "required", processingTime: "10-15 business days", appointmentRequired: true, govFee: "€80", notes: "Schengen visa required. Apply through French consulate." },
    Germany: { status: "required", processingTime: "10-15 business days", appointmentRequired: true, govFee: "€80", notes: "Schengen visa required. Apply through German consulate." },
    "United States": { status: "required", processingTime: "3-6 weeks (interview dependent)", appointmentRequired: true, govFee: "$185", notes: "B1/B2 visa. DS-160 form and consular interview required." },
    "United Kingdom": { status: "required", processingTime: "3-6 weeks", appointmentRequired: true, govFee: "£115", notes: "Standard Visitor Visa. Apply online via UKVI." },
    Canada: { status: "required", processingTime: "4-8 weeks", appointmentRequired: true, govFee: "CAD $100", notes: "Temporary Resident Visa or eTA depending on status." },
    Australia: { status: "required", processingTime: "2-4 weeks", appointmentRequired: false, govFee: "AUD $190", notes: "ETA or Visitor visa (subclass 600). Online application." },
    UAE: { status: "on-arrival", processingTime: "On arrival", appointmentRequired: false, govFee: "Free", notes: "30-day visa on arrival for Turkish passport holders." },
    Japan: { status: "required", processingTime: "5-7 business days", appointmentRequired: true, govFee: "Free", notes: "Single/multiple entry tourist visa through Japanese embassy." },
    Italy: { status: "required", processingTime: "10-15 business days", appointmentRequired: true, govFee: "€80", notes: "Schengen visa required. Apply through Italian consulate." },
    Spain: { status: "required", processingTime: "10-15 business days", appointmentRequired: true, govFee: "€80", notes: "Schengen visa required. Apply through Spanish consulate." },
  },
  Germany: {
    "United States": { status: "visa-free", processingTime: "N/A", appointmentRequired: false, govFee: "$21 (ESTA)", notes: "ESTA authorization required. Valid for 90 days." },
    "United Kingdom": { status: "visa-free", processingTime: "N/A", appointmentRequired: false, govFee: "Free", notes: "No visa required for stays up to 6 months." },
    Japan: { status: "visa-free", processingTime: "N/A", appointmentRequired: false, govFee: "Free", notes: "No visa required for stays up to 90 days." },
    Canada: { status: "visa-free", processingTime: "N/A", appointmentRequired: false, govFee: "CAD $7 (eTA)", notes: "eTA required. Apply online before travel." },
    Australia: { status: "visa-free", processingTime: "N/A", appointmentRequired: false, govFee: "AUD $20 (ETA)", notes: "ETA required. Quick online application." },
    UAE: { status: "visa-free", processingTime: "N/A", appointmentRequired: false, govFee: "Free", notes: "No visa required for stays up to 90 days." },
  },
};

const statusConfig = {
  required: { label: "Visa Required", icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  "on-arrival": { label: "Visa on Arrival", icon: CheckCircle, color: "text-gold", bg: "bg-gold/10" },
  "visa-free": { label: "Visa Free", icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
};

export default function VisaChecker() {
  const [nationality, setNationality] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState<VisaResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleCheck = () => {
    setSearched(true);
    const data = visaData[nationality]?.[destination];
    setResult(data || null);
  };

  const statusInfo = result ? statusConfig[result.status] : null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <Search size={24} className="text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Visa Checker</h1>
          <p className="text-muted-foreground text-lg">
            Instantly check visa requirements for your destination
          </p>
        </motion.div>

        <motion.div
          className="bg-card border rounded-xl p-6 md:p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Nationality</label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger><SelectValue placeholder="Select nationality" /></SelectTrigger>
                <SelectContent>
                  {nationalities.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Destination Country</label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>
                  {destinations.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleCheck}
            disabled={!nationality || !destination}
            className="w-full bg-accent text-accent-foreground hover:bg-gold-dark h-11"
          >
            Check Requirements
          </Button>
        </motion.div>

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {result ? (
              <div className="bg-card border rounded-xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">
                    {nationality} → {destination}
                  </h2>
                  {statusInfo && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                      <statusInfo.icon size={14} />
                      {statusInfo.label}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Clock size={18} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Processing Time</p>
                      <p className="text-sm font-medium">{result.processingTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Building2 size={18} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Appointment</p>
                      <p className="text-sm font-medium">{result.appointmentRequired ? "Required" : "Not Required"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 col-span-2">
                    <DollarSign size={18} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Government Fee</p>
                      <p className="text-sm font-medium">{result.govFee}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 mb-6">
                  <p className="text-sm text-muted-foreground">{result.notes}</p>
                </div>

                {result.status === "required" && (
                  <Link to="/apply">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-gold-dark h-11">
                      Start Application
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-card border rounded-xl p-8 text-center">
                <AlertCircle size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">No Data Available</p>
                <p className="text-sm text-muted-foreground">
                  We don't have visa requirement data for this combination yet. Please contact our support team for assistance.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
