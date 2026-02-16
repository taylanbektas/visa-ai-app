import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  FileText,
  User,
  Plane,
  History,
  CreditCard,
  Star,
  Crown,
  Zap,
  Shield,
  CheckCircle,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const totalSteps = 7;

const nationalities = [
  "Turkey", "Germany", "France", "United Kingdom", "India", "Pakistan",
  "Nigeria", "Egypt", "Iran", "Morocco", "Brazil", "China", "Philippines",
];
const destinations = [
  "France", "Germany", "United States", "United Kingdom", "Canada",
  "Australia", "UAE", "Japan", "Italy", "Spain",
];
const visaTypes = ["Tourist", "Business", "Student", "Transit"];

const stepLabels = [
  "Trip Details",
  "Personal Info",
  "Travel History",
  "Documents",
  "Plan",
  "Review",
  "Payment",
];
const stepIcons = [Plane, User, History, FileText, CreditCard, Check, Shield];

export default function Apply() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const [form, setForm] = useState({
    nationality: "",
    destination: "",
    visaType: "",
    departureDate: "",
    returnDate: "",
    travelers: 1,
    fullName: "",
    dob: "",
    gender: "",
    passportNumber: "",
    passportIssue: "",
    passportExpiry: "",
    countryOfResidence: "",
    visitedBefore: false,
    refusedBefore: false,
    refusalDetails: "",
    countriesVisited: "",
    selectedPlan: "",
    termsAccepted: false,
  });

  const [uploads, setUploads] = useState<Record<string, boolean>>({});

  const updateForm = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFakeUpload = (docType: string) => {
    setUploads((p) => ({ ...p, [docType]: true }));
    toast({ title: "File uploaded", description: `${docType} uploaded successfully.` });
  };

  const handleSubmit = () => {
    const refId = `VP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setStep(8);
    updateForm("refId" as any, refId);
    toast({ title: "Application submitted!", description: `Reference: #${refId}` });
  };

  const plans = [
    { id: "pathfinder", name: "Pathfinder", price: 49, icon: Zap, desc: "Self-guided" },
    { id: "navigator", name: "Navigator", price: 129, icon: Star, desc: "Most popular", popular: true },
    { id: "concierge", name: "Concierge", price: 249, icon: Crown, desc: "Full-service" },
  ];

  const docs = [
    "Passport bio page",
    "Passport photo (biometric)",
    "Bank statements",
    "Proof of accommodation",
    "Flight itinerary",
    "Travel insurance",
  ];

  if (step === 8) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Application Received!</h1>
          <p className="text-muted-foreground mb-4">
            Your reference ID: <span className="font-mono font-bold text-foreground">#{(form as any).refId}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            We'll review your application and send you updates via email. You can also track your status anytime.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/track">
              <Button variant="outline">Track Application</Button>
            </Link>
            <Link to="/">
              <Button className="bg-accent text-accent-foreground hover:bg-gold-dark">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{stepLabels[step - 1]}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {stepLabels.map((label, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={label} className={`flex flex-col items-center gap-1 ${i + 1 <= step ? "text-accent" : "text-muted-foreground/30"}`}>
                  <Icon size={14} />
                  <span className="text-[10px] hidden md:block">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div
          key={step}
          className="bg-card border rounded-xl p-6 md:p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Trip Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nationality</label>
                  <Select value={form.nationality} onValueChange={(v) => updateForm("nationality", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{nationalities.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Destination</label>
                  <Select value={form.destination} onValueChange={(v) => updateForm("destination", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{destinations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Visa Type</label>
                  <Select value={form.visaType} onValueChange={(v) => updateForm("visaType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{visaTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Travelers</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateForm("travelers", n)}
                        className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${form.travelers === n ? "bg-accent text-accent-foreground border-accent" : "hover:bg-muted"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Departure Date</label>
                  <Input type="date" value={form.departureDate} onChange={(e) => updateForm("departureDate", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Return Date</label>
                  <Input type="date" value={form.returnDate} onChange={(e) => updateForm("returnDate", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <Input value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} placeholder="As shown on passport" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Date of Birth</label>
                  <Input type="date" value={form.dob} onChange={(e) => updateForm("dob", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Gender</label>
                  <Select value={form.gender} onValueChange={(v) => updateForm("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Passport Number</label>
                  <Input value={form.passportNumber} onChange={(e) => updateForm("passportNumber", e.target.value)} placeholder="e.g. U12345678" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Country of Residence</label>
                  <Select value={form.countryOfResidence} onValueChange={(v) => updateForm("countryOfResidence", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{nationalities.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Passport Issue Date</label>
                  <Input type="date" value={form.passportIssue} onChange={(e) => updateForm("passportIssue", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Passport Expiry Date</label>
                  <Input type="date" value={form.passportExpiry} onChange={(e) => updateForm("passportExpiry", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Travel History</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Have you visited {form.destination || "this country"} before?</span>
                  <div className="flex gap-2">
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        onClick={() => updateForm("visitedBefore", v)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.visitedBefore === v ? "bg-accent text-accent-foreground border-accent" : "hover:bg-muted"}`}
                      >
                        {v ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Have you been refused a visa before?</span>
                  <div className="flex gap-2">
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        onClick={() => updateForm("refusedBefore", v)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.refusedBefore === v ? "bg-accent text-accent-foreground border-accent" : "hover:bg-muted"}`}
                      >
                        {v ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
                {form.refusedBefore && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Please provide details</label>
                    <Input value={form.refusalDetails} onChange={(e) => updateForm("refusalDetails", e.target.value)} placeholder="Country, year, and reason if known" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Countries visited in the last 5 years</label>
                  <Input value={form.countriesVisited} onChange={(e) => updateForm("countriesVisited", e.target.value)} placeholder="e.g. Germany, France, Italy" />
                  <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Document Upload</h2>
              <p className="text-sm text-muted-foreground">Upload the following documents. Accepted formats: PDF, JPG, PNG (max 5MB each).</p>
              <div className="grid gap-3">
                {docs.map((doc) => (
                  <div
                    key={doc}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 border-dashed transition-colors ${
                      uploads[doc] ? "border-success/30 bg-success/5" : "border-border hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {uploads[doc] ? (
                        <CheckCircle size={18} className="text-success" />
                      ) : (
                        <Upload size={18} className="text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{doc}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={uploads[doc] ? "ghost" : "outline"}
                      onClick={() => handleFakeUpload(doc)}
                    >
                      {uploads[doc] ? "Replace" : "Upload"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Select Your Plan</h2>
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => updateForm("selectedPlan", plan.id)}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                      form.selectedPlan === plan.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${form.selectedPlan === plan.id ? "bg-accent/20" : "bg-muted"}`}>
                      <plan.icon size={22} className={form.selectedPlan === plan.id ? "text-accent" : "text-muted-foreground"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] px-2 py-0.5 bg-accent text-accent-foreground rounded-full font-medium">Popular</span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{plan.desc}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">${plan.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Review & Confirm</h2>
              <div className="space-y-4">
                {[
                  { title: "Trip", items: [`${form.nationality} → ${form.destination}`, `${form.visaType} visa`, `${form.travelers} traveler(s)`] },
                  { title: "Personal", items: [form.fullName, `Passport: ${form.passportNumber}`] },
                  { title: "Documents", items: [`${Object.keys(uploads).length}/${docs.length} uploaded`] },
                  { title: "Plan", items: [plans.find((p) => p.id === form.selectedPlan)?.name || "Not selected", `$${plans.find((p) => p.id === form.selectedPlan)?.price || 0}`] },
                ].map((section) => (
                  <div key={section.title} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">{section.title}</h3>
                      <button onClick={() => setStep(section.title === "Trip" ? 1 : section.title === "Personal" ? 2 : section.title === "Documents" ? 4 : 5)} className="text-xs text-accent hover:underline">Edit</button>
                    </div>
                    {section.items.map((item) => (
                      <p key={item} className="text-sm text-muted-foreground">{item}</p>
                    ))}
                  </div>
                ))}
                <div className="flex items-start gap-2 pt-2">
                  <Checkbox
                    checked={form.termsAccepted}
                    onCheckedChange={(v) => updateForm("termsAccepted", !!v)}
                  />
                  <label className="text-sm text-muted-foreground">
                    I agree to the Terms of Service and Privacy Policy. I understand VisaPath is not a government agency.
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Payment</h2>
              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Card Number</label>
                    <Input placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Expiry</label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">CVC</label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield size={14} />
                    <span>Secure payment via Stripe — your data is encrypted</span>
                  </div>
                </div>
                <div className="md:col-span-2 p-4 rounded-lg bg-muted/50">
                  <h3 className="text-sm font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{plans.find((p) => p.id === form.selectedPlan)?.name} Plan</span>
                      <span className="font-medium">${plans.find((p) => p.id === form.selectedPlan)?.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Travelers</span>
                      <span>×{form.travelers}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${(plans.find((p) => p.id === form.selectedPlan)?.price || 0) * form.travelers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Nav Buttons */}
        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          {step < 7 ? (
            <Button onClick={handleNext} className="bg-accent text-accent-foreground hover:bg-gold-dark">
              Continue <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-accent text-accent-foreground hover:bg-gold-dark">
              Pay & Submit <Shield size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
