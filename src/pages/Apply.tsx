import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  Lock,
  ShieldCheck,
  User,
  LogIn,
  Mail,
  Loader2,
  Clock,
  Briefcase,
  CreditCard
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  passportOptions as rawPassportOptions,
  destinations as rawDestinations,
  visaFreeMap as sharedVisaFreeMap,
} from "@/data/countries";
import { supabase } from "@/integrations/supabase/client";

type TravelerConfig = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  wantsUpdates: boolean;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  addPassportLater: boolean;
};

type ApplyDraft = {
  step: number;
  selectedPassport: string;
  destination: string;
  visaType: string;
  travelerCount: string;
  selectedPlan: string;
  travelers: TravelerConfig[];
  processingTime: string;
  quizDone: boolean;
  quizQ: number;
  quizAnswers: string[];
  recommendation: string | null;
  authMode: "login" | "register";
  isSuccess: boolean;
  referenceId: string | null;
};

const APPLY_DRAFT_KEY = "visapath.apply-draft.v1";

const visaTypes = ["Turist Vizesi", "İş Vizesi", "Öğrenci Vizesi", "Aile Birleşim Vizesi"];

/* ── Quiz ──────────────────────────────────────────────── */
const questions = [
  { q: "Daha önce Schengen vizesi aldınız mı?", options: [{ label: "Evet", value: "yes" }, { label: "Hayır", value: "no" }] },
  { q: "Belge hazırlamayı kendiniz yapmak ister misiniz?", options: [{ label: "Evet", value: "yes" }, { label: "Hayır", value: "no" }] },
  { q: "Randevu ve takip desteği ister misiniz?", options: [{ label: "Evet", value: "yes" }, { label: "Hayır", value: "no" }] },
];

const plans = [
  { id: "starter", name: "Starter", price: "49", desc: "Dijital rehber + AI kontrol", basePrice: 49 },
  { id: "pro", name: "Pro", price: "149", desc: "Uzman inceleme + randevu desteği", popular: true, basePrice: 149 },
  { id: "elite", name: "Elite", price: "349", desc: "VIP hizmet + %100 iade garantisi", basePrice: 349 },
];

const processingSpeeds = [
  { id: 'standard', name: 'Standart', title: 'Tahmini 2-4 Gün', desc: 'Aciliyeti olmayanlar için ideal', price: 0 },
  { id: 'rush', name: 'Hızlı', title: '24 Saat İçinde', desc: 'Hızlı işlem uzman önceliği', price: 40 },
  { id: 'super_rush', name: 'Süper Hızlı', title: '14 Saat İçinde', desc: 'En hızlı işlem garantisi', price: 80 }
];

function getRecommendation(answers: string[]): string {
  // If the user said "yes" to absolutely everything (they want to do it all themselves)
  const isStarter = answers.every((a) => a === "yes");
  if (isStarter) return "starter";

  // If they said "no" to both document prep and appointment tracking, it's elite
  const noCount = answers.filter((a) => a === "no").length;
  if (noCount >= 2) return "elite";

  // Otherwise default to pro
  return "pro";
}

type ApplyProps = {
  embedded?: boolean;
  preselectedPlan?: string;
  onComplete?: () => void;
};

export default function Apply({ embedded, preselectedPlan: embeddedPlan, onComplete }: ApplyProps = {}) {
  const { t } = useLanguage();
  const location = useLocation();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const passportOptions = rawPassportOptions.map(p => ({
    ...p,
    label: t(p.labelKey)
  }));

  const destinations = rawDestinations.map(d => ({
    ...d,
    label: t("country." + d.key)
  }));

  const preselectedDestination = location.state?.destination as string | undefined;
  const preselectedPassport = location.state?.passport as string | undefined;
  const preselectedPlan = embeddedPlan || location.state?.plan as string | undefined;

  const [step, setStep] = useState(1);
  const [selectedPassport, setSelectedPassport] = useState(preselectedPassport || "TR");
  const [destination, setDestination] = useState(preselectedDestination || "");
  const [visaType, setVisaType] = useState("");
  const [travelerCount, setTravelerCount] = useState("1");
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan || "");
  const [processingTime, setProcessingTime] = useState("standard");
  const [travelers, setTravelers] = useState<TravelerConfig[]>([]);
  const [hasScrolledToFocus, setHasScrolledToFocus] = useState(false);

  // Quiz
  const [quizDone, setQuizDone] = useState(false);
  const [quizQ, setQuizQ] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  // Auth local state
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [activeProfilePackage, setActiveProfilePackage] = useState<string | null>(null);
  const [assignedAdvisorId, setAssignedAdvisorId] = useState<string | null>(null);
  const [userPackages, setUserPackages] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setActiveProfilePackage(null);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('active_package, assigned_advisor_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        const profileData = data as any;
        setActiveProfilePackage(profileData.active_package);
        if (profileData.active_package && !selectedPlan) {
          setSelectedPlan(profileData.active_package);
        }
        if (profileData.assigned_advisor_id) {
          setAssignedAdvisorId(profileData.assigned_advisor_id);
        }
      }

      // Fetch specific customer packages
      const { data: packages, error: pkgError } = await (supabase as any)
        .from('customer_packages')
        .select('*')
        .eq('user_id', user.id)
        .gt('remaining_count', 0);


      if (!pkgError && packages) {
        setUserPackages(packages);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const rawDraft = localStorage.getItem(APPLY_DRAFT_KEY);
    if (!rawDraft) return;

    try {
      const draft: Partial<ApplyDraft> = JSON.parse(rawDraft);
      const validPassport = preselectedPassport || draft.selectedPassport || "TR";
      const validDest = preselectedDestination || draft.destination || "";

      // Verify availability
      const visaFree = sharedVisaFreeMap[validPassport] || [];
      const destAllowed = !validDest || !visaFree.includes(validDest);
      const hasOverrides = !!preselectedDestination || !!preselectedPassport || !!preselectedPlan;

      setStep(hasOverrides ? 1 : (draft.step ?? 1));
      setSelectedPassport(validPassport);
      setDestination(destAllowed ? validDest : "");
      setVisaType(draft.visaType ?? "");
      setTravelerCount(draft.travelerCount ?? "1");
      setSelectedPlan(preselectedPlan || draft.selectedPlan || "");
      if (draft.travelers && draft.travelers.length > 0) {
        setTravelers(draft.travelers);
      }
      setProcessingTime(draft.processingTime ?? "standard");
      setQuizDone(Boolean(draft.quizDone));
      setQuizQ(draft.quizQ ?? 0);
      setQuizAnswers(draft.quizAnswers ?? []);
      setRecommendation(draft.recommendation ?? null);
      setAuthMode(draft.authMode === "login" ? "login" : "register");

      // Remove automatic scrolling on mount when coming from homepage
      // if (hasOverrides && !hasScrolledToFocus) {
      //   setHasScrolledToFocus(true);
      //   setTimeout(() => {
      //     const el = document.getElementById("apply-step-1-focus");
      //     if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      //   }, 300);
      // }
    } catch {
      localStorage.removeItem(APPLY_DRAFT_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedDestination]);

  useEffect(() => {
    const visaFree = sharedVisaFreeMap[selectedPassport] || [];
    if (destination && visaFree.includes(destination)) {
      setDestination("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPassport]);

  // Adjust travelers array length based on count
  useEffect(() => {
    const num = parseInt(travelerCount, 10) || 1;
    setTravelers((prev) => {
      if (prev.length === num) return prev;
      const newTravelers = [...prev];
      while (newTravelers.length < num) {
        newTravelers.push({
          id: Math.random().toString(36).substring(7),
          firstName: "",
          lastName: "",
          dob: "",
          email: "",
          wantsUpdates: true,
          passportNumber: "",
          passportCountry: selectedPassport,
          passportExpiry: "",
          addPassportLater: false,
        });
      }
      return newTravelers.slice(0, num);
    });
  }, [travelerCount, selectedPassport]);

  useEffect(() => {
    const draft: ApplyDraft = {
      step,
      selectedPassport,
      destination,
      visaType,
      travelerCount,
      selectedPlan,
      travelers,
      processingTime,
      quizDone,
      quizQ,
      quizAnswers,
      recommendation,
      authMode,
      isSuccess,
      referenceId,
    };
    localStorage.setItem(APPLY_DRAFT_KEY, JSON.stringify(draft));
  }, [
    step,
    selectedPassport,
    destination,
    visaType,
    travelerCount,
    selectedPlan,
    travelers,
    processingTime,
    quizDone,
    quizQ,
    quizAnswers,
    recommendation,
    authMode,
  ]);

  const currentPassport = passportOptions.find((p) => p.code === selectedPassport) ?? passportOptions[0];
  const visaFreeForPassport = sharedVisaFreeMap[selectedPassport] || [];
  const availableDestinations = destinations.filter((d) =>
    !visaFreeForPassport.includes(d.key) &&
    d.key.toUpperCase() !== selectedPassport
  );
  const selectedDestination = destinations.find((d) => d.key === destination);
  const isDestinationStillAvailable = selectedDestination != null && availableDestinations.some((d) => d.key === destination);

  const tCount = parseInt(travelerCount, 10) || 1;
  const basePricePerPerson = plans.find(p => p.id === selectedPlan)?.basePrice || 0;
  const procPricePerPerson = processingSpeeds.find(s => s.id === processingTime)?.price || 0;
  // Assumed realistic government fee
  const governmentFeePerPerson = destination ? 50 : 0;
  const totalBasePrice = basePricePerPerson * tCount;
  const totalProcPrice = procPricePerPerson * tCount;
  const totalGovFee = governmentFeePerPerson * tCount;

  const isPackageAssigned = activeProfilePackage && selectedPlan === activeProfilePackage;

  // Find if user has a specific package they can use for this plan
  const matchingPackage = userPackages.find(p => p.package_type === selectedPlan);
  const canUsePackage = isPackageAssigned || (matchingPackage && matchingPackage.remaining_count > 0);

  const finalTotal = (isPackageAssigned || canUsePackage) ? 0 : (totalBasePrice + totalProcPrice + totalGovFee);
  const autoAssignAdvisor = async (userId: string) => {
    try {
      // 1. Fetch all advisors
      const { data: advisors, error: advError } = await supabase
        .from('advisors')
        .select('id');

      if (advError || !advisors || advisors.length === 0) {
        console.error("No advisors found for auto-assignment");
        return null;
      }

      // 2. Fetch all profiles to count assignments
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('assigned_advisor_id');

      if (profError) {
        console.error("Error fetching profiles for advisor counting:", profError);
        return advisors[0].id;
      }

      const counts: Record<string, number> = {};
      advisors.forEach(a => counts[a.id] = 0);
      profiles.forEach(p => {
        if (p.assigned_advisor_id && counts[p.assigned_advisor_id] !== undefined) {
          counts[p.assigned_advisor_id]++;
        }
      });

      // 3. Find advisor with minimum count
      let minCount = Infinity;
      let selectedAdvisorId = advisors[0].id;

      advisors.forEach(a => {
        if (counts[a.id] < minCount) {
          minCount = counts[a.id];
          selectedAdvisorId = a.id;
        }
      });

      // 4. Update profile (profiles match by user_id, not id)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ assigned_advisor_id: selectedAdvisorId } as any)
        .eq('user_id', userId);

      if (updateError) {
        console.error("Error updating profile with assigned advisor:", updateError);
      }

      return selectedAdvisorId;
    } catch (err) {
      console.error("Unexpected error in autoAssignAdvisor:", err);
      return null;
    }
  };

  const handleCompleteApplication = async (usePackageId?: string) => {
    if (!user) return;
    setIsLoading(true);

    if (!usePackageId && !isPackageAssigned) {
      // Mock card payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const refId = `VP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data: newApp, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        reference_id: refId,
        destination: destination,
        visa_type: visaType,
        plan: selectedPlan,
        status: "Alındı",
        payment_status: "paid",
        used_package_id: usePackageId || null
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Hata", description: "Başvuru oluşturulurken bir hata oluştu.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (usePackageId) {
      // Decrement package count
      await (supabase as any)
        .from('customer_packages')
        .update({ remaining_count: matchingPackage.remaining_count - 1 })
        .eq('id', usePackageId);
    } else if (isPackageAssigned) {
      // Clear active_package
      await supabase
        .from('profiles')
        .update({ active_package: null } as any)
        .eq('user_id', user.id);
    }

    let currentAdvisorId = assignedAdvisorId;
    if (!currentAdvisorId) {
      currentAdvisorId = await autoAssignAdvisor(user.id);
    }

    if (currentAdvisorId) {
      const { error: assignError } = await supabase.from('advisor_assignments').insert({
        application_id: newApp.id,
        advisor_id: currentAdvisorId
      });
      if (assignError) {
        console.error("Danışman ataması yapılamadı:", assignError);
        toast({ title: "Uyarı", description: "Başvuru oluşturuldu ancak danışman ataması kaydedilemedi. Destek ile iletişime geçin.", variant: "destructive" });
      }
    }

    setReferenceId(refId);
    // Redirect to the new success page instead of inline state
    window.location.href = `/success/${refId}`;
    setIsLoading(false);
    toast({ title: "Başvuru Alındı", description: "Ödemeniz onaylandı ve başvurunuz başarıyla oluşturuldu." });
  };

  const handleQuizAnswer = (value: string) => {
    const newAnswers = [...quizAnswers, value];
    setQuizAnswers(newAnswers);
    if (quizQ < questions.length - 1) {
      setQuizQ(quizQ + 1);
    } else {
      const rec = getRecommendation(newAnswers);
      setRecommendation(rec);
      setSelectedPlan(rec);
      setQuizDone(true);
    }
  };

  const handleAuthSubmit = async () => {
    setIsLoading(true);
    const primaryEmail = travelers[0]?.email;
    const primaryName = `${travelers[0]?.firstName} ${travelers[0]?.lastName}`.trim();

    if (authMode === "login") {
      if (!primaryEmail || !password) {
        toast({ title: "Hatali Giriş", description: "Lütfen email ve şifre giriniz.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      const { error } = await signIn(primaryEmail, password);
      if (error) {
        toast({ title: "Giriş başarısız", description: (error as Error).message, variant: "destructive" });
      } else {
        toast({ title: "Giriş yapıldı" });
      }
    } else {
      if (!primaryName || !primaryEmail || !phone.trim()) {
        toast({ title: "Eksik Bilgi", description: "Lütfen tüm alanları doldurun.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (password.length < 8) {
        toast({ title: "Zayıf Şifre", description: "Şifre en az 8 karakter olmalıdır.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Hata", description: "Şifreler eşleşmiyor.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const { error } = await signUp(primaryEmail, password, primaryName, phone);
      if (error) {
        toast({ title: "Kayıt başarısız", description: (error as Error).message, variant: "destructive" });
      } else {
        setShowEmailVerification(true);
      }
    }
    setIsLoading(false);
  };

  const stepTitles = ["Seyahat", "Plan", "Yolcular", "Ödeme"];

  return (
    <div className="page-shell section-gradient-light min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl lg:max-w-6xl pb-24">

        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy-dark mb-3">
            Vize <span className="text-gradient-mint">Başvurusu</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            <strong className="text-foreground">4 basit adımda</strong> işlemlerinizi tamamlayın. Kaldığınız yerden devam edebilirsiniz.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start relative">

          {/* Main Content Area */}
          <div className="flex-1 w-full max-w-3xl mx-auto lg:mx-0">
            {/* Progress Steps */}
            <div className="mb-10">
              <div className="grid grid-cols-4 gap-2">
                {stepTitles.map((title, i) => {
                  const stepNum = i + 1;
                  const isActive = step === stepNum;
                  const isDone = step > stepNum;
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border px-2 py-3 md:py-4 text-center transition-colors ${isActive || isDone ? "border-accent/30 bg-accent/5 backdrop-blur-sm" : "border-border bg-white"
                        } ${isDone ? "cursor-pointer hover:bg-accent/10" : ""}`}
                      onClick={() => {
                        if (isDone) setStep(stepNum);
                      }}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
                        <div
                          className={`flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full text-xs md:text-sm font-bold transition-colors ${isDone || isActive ? "btn-gradient text-white shadow-sm" : "bg-secondary text-muted-foreground"
                            }`}
                        >
                          {isDone ? <CheckCircle size={16} /> : stepNum}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs md:text-sm font-bold leading-tight ${isActive ? "text-navy-dark" : "text-muted-foreground"
                            }`}
                        >
                          {title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-mint transition-all duration-500 ease-out"
                  style={{ width: `${(step / stepTitles.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">

              {/* ── STEP 5: Success ── */}
              {isSuccess && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <div className="bg-white rounded-2xl border border-border p-8 md:p-12 shadow-xl text-center">
                    <div className="w-20 h-20 bg-[#00D69E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-[#00D69E]" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-navy-dark mb-4">Tebrikler!</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      Vize başvurunuz başarıyla oluşturuldu. <br />
                      Referans Numaranız: <span className="text-navy-dark font-mono font-bold">{referenceId}</span>
                    </p>
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 inline-block text-left max-w-md w-full border border-gray-100">
                      <h3 className="font-bold text-navy-dark mb-3 flex items-center gap-2">
                        <ArrowRight size={18} className="text-[#00D69E]" /> Sırada Ne Var?
                      </h3>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#00D69E] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                          <span>Panelinize giderek <strong>{selectedDestination?.label} {visaType}</strong> başvurunuzu görüntüleyin.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#00D69E] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                          <span>Gerekli vize belgelerini yüklemek için alanlar aktif hale geldi.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#00D69E] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                          <span>Danışmanınız belgelerinizi inceleyip sizinle iletişime geçecektir.</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <Button
                        onClick={() => window.location.href = "/dashboard"}
                        className="btn-gradient text-white font-extrabold h-14 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Panelime Git <ArrowRight size={20} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 1: Trip Details ── */}
              {step === 1 && !isSuccess && (
                <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl border border-border p-6 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-extrabold text-navy-dark mb-8">Nereye seyahat ediyorsunuz?</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[15px] font-bold text-foreground mb-2 block">Pasaportunuz</label>
                        <Combobox
                          options={passportOptions.map((p) => ({ value: p.code, label: p.label, flag: p.flag }))}
                          value={selectedPassport}
                          onChange={setSelectedPassport}
                          placeholder="Pasaport ülkesini arayın..."
                        />
                      </div>

                      <div>
                        <label className="text-[15px] font-bold text-foreground mb-2 block">Hedef Ülke</label>
                        {availableDestinations.length === 0 ? (
                          <div className="h-14 rounded-xl border border-input bg-secondary/50 flex items-center px-4 text-[15px] text-muted-foreground font-medium">
                            Seçtiğiniz pasaportla vize gerektiren ülke bulunmuyor.
                          </div>
                        ) : (
                          <Combobox
                            options={availableDestinations.map(c => ({ value: c.key, label: c.label, flag: c.flag }))}
                            value={isDestinationStillAvailable ? destination : ""}
                            onChange={setDestination}
                            placeholder="Gideceğiniz ülkeyi arayın..."
                            disabled={availableDestinations.length === 0}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[15px] font-bold text-foreground mb-2 block">Vize Türü</label>
                          <Select onValueChange={setVisaType} value={visaType}>
                            <SelectTrigger className="h-14 text-lg font-bold text-foreground bg-white rounded-xl">
                              <SelectValue placeholder="Seçiniz..." />
                            </SelectTrigger>
                            <SelectContent>
                              {visaTypes.map((v) => (
                                <SelectItem key={v} value={v} className="py-3 text-base font-bold cursor-pointer">{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[15px] font-bold text-foreground mb-2 block">Kişi Sayısı</label>
                          <Select onValueChange={setTravelerCount} value={travelerCount || "1"}>
                            <SelectTrigger className="h-14 text-lg font-bold text-foreground bg-white rounded-xl">
                              <SelectValue placeholder="1 Yolcu" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <SelectItem key={num} value={num.toString()} className="py-3 text-base font-bold cursor-pointer">
                                  {num} Yolcu
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Button
                      id="apply-step-1-focus"
                      className="w-full btn-gradient text-white font-bold h-14 text-lg rounded-xl mt-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                      disabled={!destination || !visaType || !isDestinationStillAvailable}
                      onClick={() => {
                        if (!destination || !visaType) {
                          toast({ title: "Eksik Bilgi", description: "Lütfen hedef ülke ve vize türünü seçiniz.", variant: "destructive" });
                          return;
                        }
                        setStep(2);
                      }}
                    >
                      Devam Et <ArrowRight size={20} className="ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Plan Selection ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl border border-border p-6 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-extrabold text-navy-dark mb-8">Planınızı Seçin</h2>

                    {!quizDone && (
                      <div className="bg-secondary/40 rounded-2xl p-6 mb-8 border border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles size={20} className="text-[#00D69E]" />
                          <span className="font-extrabold text-lg text-navy-dark">Size uygun planı bulalım</span>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                          Soru {quizQ + 1} / {questions.length}
                        </p>
                        <p className="font-bold text-[15px] mb-5 text-foreground">{questions[quizQ].q}</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {questions[quizQ].options.map((opt) => (
                            <Button
                              key={opt.value}
                              variant="outline"
                              className="h-12 font-bold text-[15px] hover:bg-[#00D69E]/5 hover:border-[#00D69E] hover:text-[#00B386] rounded-xl transition-colors"
                              onClick={() => handleQuizAnswer(opt.value)}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {quizDone && recommendation && (
                      <div className="bg-[#00D69E]/10 border-2 border-[#00D69E]/30 rounded-2xl p-5 mb-8 flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle size={24} className="text-[#00D69E] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-navy-dark text-[15px]">
                              Önerimiz: <span className="text-[#00B386] capitalize">{recommendation} Plan</span>
                            </p>
                            <p className="text-sm text-foreground/80 mt-1">Verdiğiniz cevaplara göre bu plan sizin için en uygunudur.</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-bold text-navy-dark/60 hover:text-[#00B386]"
                          onClick={() => {
                            setQuizDone(false);
                            setQuizQ(0);
                            setQuizAnswers([]);
                            setRecommendation(null);
                          }}
                        >
                          Tekrar Dene
                        </Button>
                      </div>
                    )}

                    <div className="space-y-4">
                      {plans.map((plan) => {
                        const isRecommended = recommendation === plan.id;
                        const isSelected = selectedPlan === plan.id;
                        return (
                          <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${isSelected
                              ? "border-[#00D69E] bg-[#00D69E]/5 ring-4 ring-[#00D69E]/10"
                              : "border-border hover:border-[#00D69E]/40"
                              }`}
                          >
                            {plan.popular && (
                              <div className="absolute top-0 right-0 bg-[#00D69E] text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-bl-xl">POPÜLER</div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-extrabold text-xl text-navy-dark">{plan.name}</span>
                                  {isRecommended && (
                                    <span className="text-xs font-bold text-white bg-navy-dark px-2 py-0.5 rounded-full">✨ Öneri</span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">{plan.desc}</p>
                              </div>
                              <div className="text-left sm:text-right shrink-0">
                                <span className="text-3xl font-black text-navy-dark">€{plan.price}</span>
                                <span className="text-sm text-muted-foreground block sm:inline sm:ml-1 font-medium">/Kişi</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-10 flex flex-col-reverse sm:flex-row gap-4">
                      <Button variant="outline" className="font-bold h-14 rounded-xl sm:w-32 bg-white" onClick={() => setStep(1)}>
                        Geri Yön
                      </Button>
                      <Button
                        className="flex-1 btn-gradient text-white font-bold h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                        disabled={!selectedPlan}
                        onClick={() => setStep(3)}
                      >
                        Yolcu Bilgilerine Geç <ArrowRight size={20} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Traveler Details ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl border border-border p-6 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-extrabold text-navy-dark mb-2">Yolcu Bilgileri</h2>
                    <p className="text-muted-foreground text-[15px] mb-8">Devlet makamlarına iletilecek resmi bilgilerinizi pasaportunuzdaki gibi giriniz.</p>

                    <div className="space-y-8">
                      {travelers.map((traveler, index) => (
                        <div key={traveler.id} className="p-6 border-2 border-border/60 hover:border-accent/30 transition-colors rounded-2xl relative shadow-sm">
                          <div className="absolute -top-3 left-6 bg-[#00D69E] text-white px-4 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                            <User size={14} /> {index + 1}. Yolcu
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                            <div>
                              <label className="text-sm font-bold text-navy-dark mb-1.5 block">Ad (Pasaporttaki gibi)</label>
                              <Input
                                value={traveler.firstName}
                                onChange={(e) => setTravelers(prev => prev.map((t, i) => i === index ? { ...t, firstName: e.target.value } : t))}
                                className="h-12 bg-secondary/20" placeholder="Örn: AHMET"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-navy-dark mb-1.5 block">Soyad (Pasaporttaki gibi)</label>
                              <Input
                                value={traveler.lastName}
                                onChange={(e) => setTravelers(prev => prev.map((t, i) => i === index ? { ...t, lastName: e.target.value } : t))}
                                className="h-12 bg-secondary/20" placeholder="Örn: YILMAZ"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-navy-dark mb-1.5 block">Doğum Tarihi</label>
                              <Input
                                type="date"
                                value={traveler.dob}
                                onChange={(e) => setTravelers(prev => prev.map((t, i) => i === index ? { ...t, dob: e.target.value } : t))}
                                className="h-12 bg-secondary/20"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-navy-dark mb-1.5 block">E-posta</label>
                              <Input
                                type="email"
                                value={traveler.email}
                                onChange={(e) => setTravelers(prev => prev.map((t, i) => i === index ? { ...t, email: e.target.value } : t))}
                                className="h-12 bg-secondary/20" placeholder="ornek@email.com"
                              />
                            </div>
                          </div>

                          {index === 0 && (
                            <label className="flex items-start gap-3 mt-4 cursor-pointer p-3 bg-[#00D69E]/5 rounded-xl border border-[#00D69E]/20">
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-gray-300 text-[#00D69E] focus:ring-[#00D69E] mt-0.5"
                                checked={traveler.wantsUpdates}
                                onChange={(e) => setTravelers(prev => prev.map((t, i) => i === index ? { ...t, wantsUpdates: e.target.checked } : t))}
                              />
                              <span className="text-sm text-foreground/80 leading-snug">VisaPath'ten güncellemeleri, ürün lansmanlarını ve kişiselleştirilmiş teklifleri almak istiyorum. İstediğim zaman çıkabilirim.</span>
                            </label>
                          )}

                          <div className="mt-8 border-t border-border/80 pt-6">
                            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                              <h4 className="text-[15px] font-extrabold text-navy-dark flex items-center gap-2">
                                <Briefcase size={18} className="text-accent" /> Pasaport Detayları
                              </h4>
                              <label className="flex items-center gap-2 cursor-pointer bg-secondary/50 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                                  checked={traveler.addPassportLater}
                                  onChange={(e) => setTravelers(prev => prev.map((t, i) => i === index ? { ...t, addPassportLater: e.target.checked } : t))}
                                />
                                <span className="text-[13px] font-bold text-muted-foreground select-none">Bilgileri sonra ekleyeceğim</span>
                              </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              <div className="sm:col-span-2 lg:col-span-1">
                                <label className="text-sm font-bold text-navy-dark mb-1.5 block">Pasaport Ülkesi <span className="text-red-500">*</span></label>
                                <Combobox
                                  options={passportOptions.map((p) => ({ value: p.code, label: p.label, flag: p.flag }))}
                                  value={traveler.passportCountry}
                                  onChange={(val) => setTravelers(prev => prev.map((t, i) => i === index ? { ...t, passportCountry: val } : t))}
                                  placeholder="Ülke"
                                />
                              </div>

                              {!traveler.addPassportLater && (
                                <>
                                  <div>
                                    <label className="text-sm font-bold text-navy-dark mb-1.5 block">Pasaport Numarası <span className="text-red-500">*</span></label>
                                    <Input
                                      value={traveler.passportNumber}
                                      onChange={(e) => setTravelers(prev => prev.map((t, i) => i === index ? { ...t, passportNumber: e.target.value } : t))}
                                      className="h-12 bg-secondary/20" placeholder="Örn: U1234567"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-bold text-navy-dark mb-1.5 block">Geçerlilik Tarihi <span className="text-red-500">*</span></label>
                                    <Input
                                      type="date"
                                      value={traveler.passportExpiry}
                                      onChange={(e) => setTravelers(prev => prev.map((t, i) => i === index ? { ...t, passportExpiry: e.target.value } : t))}
                                      className="h-12 bg-secondary/20"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-10 flex flex-col-reverse sm:flex-row gap-4">
                      <Button variant="outline" className="font-bold h-14 rounded-xl sm:w-32 bg-white" onClick={() => setStep(2)}>
                        Geri Dön
                      </Button>
                      <Button
                        className="flex-1 btn-gradient text-white font-bold h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                        disabled={travelers.some(t =>
                          !t.firstName.trim() ||
                          !t.lastName.trim() ||
                          !t.dob ||
                          !t.email.trim() ||
                          !t.passportCountry ||
                          (!t.addPassportLater && (!t.passportNumber.trim() || !t.passportExpiry))
                        ) || travelers.length === 0}
                        onClick={() => {
                          const invalid = travelers.find(t =>
                            !t.firstName.trim() ||
                            !t.lastName.trim() ||
                            !t.dob ||
                            !t.email.trim() ||
                            !t.passportCountry ||
                            (!t.addPassportLater && (!t.passportNumber.trim() || !t.passportExpiry))
                          );
                          if (invalid) {
                            toast({ title: "Eksik Bilgi", description: "Lütfen tüm yolcuların zorunlu alanlarını doldurun.", variant: "destructive" });
                            return;
                          }
                          setStep(4)
                        }}
                      >
                        Kaydet ve İlerle <ArrowRight size={20} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 4: Checkout & Payment ── */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                  {/* Processing Time Selection */}
                  <div className="bg-white rounded-2xl border border-border p-6 md:p-10 shadow-sm mb-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Clock size={24} className="text-accent" />
                      <h2 className="text-2xl font-extrabold text-navy-dark">Vize İşlem Süresi</h2>
                    </div>

                    <div className="grid sm:grid-cols-1 gap-4">
                      {processingSpeeds.map((speed) => (
                        <button
                          key={speed.id}
                          onClick={() => setProcessingTime(speed.id)}
                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${processingTime === speed.id ? "border-[#00D69E] bg-[#00D69E]/5" : "border-border hover:border-[#00D69E]/30"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${processingTime === speed.id ? "border-[#00D69E]" : "border-muted"}`}>
                              {processingTime === speed.id && <div className="w-3 h-3 bg-[#00D69E] rounded-full" />}
                            </div>
                            <div>
                              <div className="font-extrabold text-lg text-navy-dark">{speed.title}</div>
                              <div className="text-sm font-medium text-muted-foreground">{speed.name} İşlem Önceliği</div>
                              {speed.id !== 'standard' && <div className="text-xs text-[#00B386] font-bold mt-1 bg-[#00D69E]/10 inline-block px-2 py-0.5 rounded-full">{speed.desc}</div>}
                            </div>
                          </div>
                          <div className="font-extrabold text-xl text-navy-dark sm:text-right w-full sm:w-auto pl-10 sm:pl-0">
                            {speed.price === 0 ? "Fiyata Dahil" : `+€${speed.price}`}
                            {speed.price !== 0 && <span className="text-xs font-semibold text-muted-foreground block">/kişi</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auth / Payment */}
                  <div className="bg-white rounded-2xl border border-border p-6 md:p-10 shadow-sm">
                    {!user ? (
                      showEmailVerification ? (
                        <div className="text-center py-10">
                          <div className="w-20 h-20 bg-[#00D69E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-10 h-10 text-[#00D69E]" />
                          </div>
                          <h2 className="text-2xl font-extrabold text-navy-dark mb-4">E-postanızı Kontrol Edin</h2>
                          <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed max-w-md mx-auto">
                            Kayıt işlemini tamamlamak için <strong>{travelers[0]?.email}</strong> adresine gönderdiğimiz doğrulama bağlantısına tıklayın.
                          </p>
                          <Button onClick={() => setAuthMode("login")} variant="outline" className="font-bold h-12 px-8 rounded-xl">
                            Doğruladım, Giriş Yap
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            <Lock size={24} className="text-navy-dark" />
                            <h2 className="text-2xl font-extrabold text-navy-dark">
                              {authMode === "register" ? "Hesabınızı Koruyun" : "Giriş Yapın"}
                            </h2>
                          </div>
                          <p className="text-[15px] text-muted-foreground mb-8 font-medium">
                            {authMode === "register"
                              ? `Başvurunuzu takip etmek için ${travelers[0]?.email} adresiyle hesap oluşturuyoruz. Lütfen bir şifre belirleyin.`
                              : `${travelers[0]?.email} hesabınıza giriş yapın.`}
                          </p>

                          <div className="space-y-5 bg-secondary/30 p-6 rounded-2xl border border-border/50">
                            <div>
                              <label className="text-sm font-bold text-navy-dark mb-1.5 block">Şifre</label>
                              <Input className="h-12 bg-white" type="password" placeholder="En az 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            {authMode === "register" && (
                              <>
                                <div>
                                  <label className="text-sm font-bold text-navy-dark mb-1.5 block">Şifre Tekrar</label>
                                  <Input className="h-12 bg-white" type="password" placeholder="Şifrenizi doğrulayın" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                                <div>
                                  <label className="text-sm font-bold text-navy-dark mb-1.5 block">Telefon (Acil iletişim için)</label>
                                  <Input className="h-12 bg-white" type="tel" placeholder="+90 5XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </div>
                              </>
                            )}
                          </div>

                          <Button
                            className="w-full btn-gradient text-white font-bold h-14 text-lg rounded-xl mt-8 shadow-md"
                            onClick={handleAuthSubmit}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 size={20} className="mr-2 animate-spin" />
                            ) : authMode === "register" ? (
                              <><User size={20} className="mr-2" /> Hesabı Koru ve Ödemeye Geç</>
                            ) : (
                              <><LogIn size={20} className="mr-2" /> Giriş Yap ve Ödemeye Geç</>
                            )}
                          </Button>

                          <div className="text-center mt-6">
                            {authMode === "register" ? (
                              <button onClick={() => setAuthMode("login")} className="text-sm font-bold text-muted-foreground hover:text-accent transition-colors">Zaten bir hesabınız var mı? Giriş Yapın</button>
                            ) : (
                              <button onClick={() => setAuthMode("register")} className="text-sm font-bold text-muted-foreground hover:text-accent transition-colors">Şifreniz yok mu? Hesap Oluşturun</button>
                            )}
                          </div>
                        </>
                      )
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-8">
                          <CreditCard size={28} className="text-navy-dark" />
                          <h2 className="text-2xl font-extrabold text-navy-dark">Ödeme Detayları</h2>
                        </div>

                        {/* Payment Fields */}
                        <div className="space-y-5">
                          <div>
                            <label className="text-sm font-bold text-navy-dark mb-2 block">Kart Numarası</label>
                            <Input className="h-14 lg:text-lg font-medium tracking-widest bg-secondary/20" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div className="grid grid-cols-2 gap-5">
                            <div>
                              <label className="text-sm font-bold text-navy-dark mb-2 block">Son Kullanma</label>
                              <Input className="h-14 lg:text-lg text-center font-medium bg-secondary/20" placeholder="AA/YY" />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-navy-dark mb-2 block">CVV</label>
                              <Input className="h-14 lg:text-lg text-center font-medium bg-secondary/20" placeholder="123" type="password" maxLength={4} />
                            </div>
                          </div>
                        </div>

                        {canUsePackage ? (
                          <div className="mt-10 bg-blue-50 border border-blue-200 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3">
                              <Sparkles className="text-blue-600" size={24} />
                              <h3 className="font-bold text-blue-900">Tanımlı Paketiniz Mevcut</h3>
                            </div>
                            <p className="text-blue-800 text-sm mb-6 leading-relaxed">
                              {matchingPackage
                                ? `Hesabınıza tanımlanmış ${matchingPackage.remaining_count} adet `
                                : "Hesabınıza tanımlanmış "
                              }
                              <span className="font-bold underline uppercase">{selectedPlan}</span> paketiniz bulunmaktadır.
                              Ödeme yapmanıza gerek yoktur, doğrudan başvurunuzu tamamlayabilirsiniz.
                            </p>
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold h-16 text-lg rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                              disabled={isLoading}
                              onClick={() => handleCompleteApplication(matchingPackage?.id)}
                            >
                              {isLoading ? <Loader2 size={24} className="animate-spin" /> : (
                                <>
                                  <Sparkles size={20} />
                                  Paket Hakkımı Kullan ve Başlat
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              className="w-full btn-gradient text-white font-extrabold h-16 text-lg rounded-2xl mt-10 shadow-[0_8px_30px_rgb(0,214,158,0.3)] hover:shadow-[0_8px_30px_rgb(0,214,158,0.5)] transition-all duration-300 hover:scale-[1.02]"
                              disabled={isLoading}
                              onClick={() => handleCompleteApplication()}
                            >
                              {isLoading ? <Loader2 size={24} className="animate-spin" /> : `€${finalTotal} Öde ve Başvuruyu Tamamla`}
                            </Button>

                            <div className="flex items-center justify-center gap-2 mt-6 text-xs font-bold text-muted-foreground bg-green-50/50 py-3 rounded-xl border border-green-100">
                              <ShieldCheck size={16} className="text-green-600" />
                              <span className="text-green-800">256-bit banka seviyesinde şifrelenmiş güvenli ödeme</span>
                            </div>
                          </>
                        )}

                      </>
                    )}

                    <div className="mt-8 flex gap-3">
                      <Button variant="outline" className="font-bold h-12 rounded-xl px-8 bg-white" onClick={() => setStep(3)}>
                        Adımlara Dön
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Rail Order Summary */}
          {step > 1 && (
            <div className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-24 mt-8 lg:mt-0 order-first lg:order-last">
              <div className="bg-white rounded-3xl border border-border p-6 shadow-xl shadow-black/5 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-mint"></div>
                <h3 className="font-extrabold text-navbar-text text-xl mb-6">Başvuru Özeti</h3>

                <div className="space-y-5 text-[15px] mb-8">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="font-medium">Pasaport</span>
                    <span className="font-bold text-navbar-text flex items-center gap-2">{currentPassport.flag} {currentPassport.label}</span>
                  </div>

                  <div className="flex justify-between items-start text-muted-foreground">
                    <span className="font-medium">Hedef Ülke</span>
                    <span className="font-bold text-navbar-text flex items-center gap-2 text-right">
                      {selectedDestination?.label} {selectedDestination?.flag}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="font-medium">Vize Türü</span>
                    <span className="font-bold text-navbar-text">{visaType}</span>
                  </div>

                  {step > 2 && (
                    <div className="pt-5 border-t border-border/60">
                      <div className="flex justify-between items-center text-muted-foreground mb-3">
                        <span className="font-medium">Yolcular</span>
                        <span className="font-bold text-navbar-text">{travelerCount} Kişi</span>
                      </div>
                      <div className="text-sm font-medium text-navbar-text">
                        {travelers.map((t, idx) => (
                          <div key={idx} className="flex justify-between py-1 bg-secondary/20 px-3 rounded-md mb-1">
                            <span className="truncate pr-2">{t.firstName || "İsimsiz"} {t.lastName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-5 border-t border-border/60">
                    <div className="flex justify-between text-muted-foreground mb-2">
                      <span className="font-medium">Plan ({selectedPlan || "Seçilmedi"})</span>
                      <span className="font-bold text-navbar-text">€{totalBasePrice}</span>
                    </div>
                    {processingTime !== 'standard' && (
                      <div className="flex justify-between text-muted-foreground mb-2">
                        <span className="font-medium">İşlem Hızı ({processingSpeeds.find(s => s.id === processingTime)?.name})</span>
                        <span className="font-bold text-navbar-text">€{totalProcPrice}</span>
                      </div>
                    )}
                    {selectedPlan && (
                      <div className="flex justify-between text-muted-foreground">
                        <span className="font-medium">Devlet Harçları ({tCount}x)</span>
                        <span className="font-bold text-navbar-text">€{totalGovFee}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/80 pt-5 bg-secondary/10 -mx-6 px-6 -mb-6 pb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground font-bold">Toplam Tutar</span>
                    <span className="font-black text-3xl text-navbar-text">
                      €{selectedPlan ? finalTotal : 0}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-muted-foreground/60 text-right mt-1 uppercase tracking-wider">Tüm vergiler dahildir</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
