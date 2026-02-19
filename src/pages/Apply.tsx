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
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  passportOptions as rawPassportOptions,
  destinations as rawDestinations,
  visaFreeMap as sharedVisaFreeMap,
} from "@/data/countries";

type ApplyDraft = {
  step: number;
  selectedPassport: string;
  destination: string;
  visaType: string;
  selectedPlan: string;
  quizDone: boolean;
  quizQ: number;
  quizAnswers: string[];
  recommendation: string | null;
  authMode: "login" | "register";
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
  { id: "starter", name: "Starter", price: "€49", desc: "Dijital rehber + AI kontrol" },
  { id: "pro", name: "Pro", price: "€149", desc: "Uzman inceleme + randevu desteği", popular: true },
  { id: "elite", name: "Elite", price: "€349", desc: "VIP hizmet + %100 iade garantisi" },
];

function getRecommendation(answers: string[]): string {
  const noCount = answers.filter((a) => a === "no").length;
  if (noCount <= 1) return "starter";
  if (noCount === 2) return "pro";
  return "elite";
}

export default function Apply() {
  const { t } = useLanguage();
  const location = useLocation();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Map data to include translated labels, compatible with existing logic
  const passportOptions = rawPassportOptions.map(p => ({
    ...p,
    label: t(p.labelKey)
  }));

  const destinations = rawDestinations.map(d => ({
    ...d,
    label: t("country." + d.key)
  }));


  const preselectedDestination = location.state?.destination as string | undefined;
  const preselectedPassport = location.state?.passport as string | undefined; // Read passport from state
  const preselectedPlan = location.state?.plan as string | undefined;

  const [step, setStep] = useState(1);
  const [selectedPassport, setSelectedPassport] = useState(preselectedPassport || "TR"); // Use state or default to TR
  const preselectedLabel = preselectedDestination
    ? destinations.find(d => d.key === preselectedDestination)?.label || preselectedDestination
    : "";
  const [destination, setDestination] = useState(preselectedLabel);
  const [visaType, setVisaType] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan || "");

  // Quiz
  const [quizDone, setQuizDone] = useState(false);
  const [quizQ, setQuizQ] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  // Auth local state
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    const rawDraft = localStorage.getItem(APPLY_DRAFT_KEY);
    if (!rawDraft) return;

    try {
      const draft: Partial<ApplyDraft> = JSON.parse(rawDraft);
      const validPassport = passportOptions.some((p) => p.code === draft.selectedPassport)
        ? draft.selectedPassport!
        : (preselectedPassport || "TR");
      const preselected = preselectedDestination
        ? destinations.find(d => d.key === preselectedDestination)?.label || preselectedDestination
        : "";
      const draftDest = preselected || draft.destination || "";
      const visaFree = sharedVisaFreeMap[validPassport] || [];
      const destObj = destinations.find((d) => d.label === draftDest);
      const destAllowed = !draftDest || !destObj || !visaFree.includes(destObj.key);
      const hasOverrides = !!preselectedDestination || !!preselectedPassport || !!preselectedPlan;

      setStep(hasOverrides ? 1 : (draft.step ?? 1));
      setSelectedPassport(validPassport);
      setDestination(destAllowed ? draftDest : "");
      setVisaType(draft.visaType ?? "");
      setSelectedPlan(preselectedPlan || draft.selectedPlan || "");
      setQuizDone(Boolean(draft.quizDone));
      setQuizQ(draft.quizQ ?? 0);
      setQuizAnswers(draft.quizAnswers ?? []);
      setRecommendation(draft.recommendation ?? null);
      setAuthMode(draft.authMode === "login" ? "login" : "register");
    } catch {
      localStorage.removeItem(APPLY_DRAFT_KEY);
    }
  }, [preselectedDestination]);

  useEffect(() => {
    const visaFree = sharedVisaFreeMap[selectedPassport] || [];
    const currentDest = destinations.find((d) => d.label === destination);
    if (currentDest && visaFree.includes(currentDest.key)) {
      setDestination("");
    }
  }, [selectedPassport]);

  useEffect(() => {
    const draft: ApplyDraft = {
      step,
      selectedPassport,
      destination,
      visaType,
      selectedPlan,
      quizDone,
      quizQ,
      quizAnswers,
      recommendation,
      authMode,
    };
    localStorage.setItem(APPLY_DRAFT_KEY, JSON.stringify(draft));
  }, [
    step,
    selectedPassport,
    destination,
    visaType,
    selectedPlan,
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
    d.key.toUpperCase() !== selectedPassport // Filter out own country
  );
  const selectedDestination = destinations.find((d) => d.label === destination);
  const isDestinationStillAvailable = selectedDestination != null && availableDestinations.some((d) => d.label === destination);

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
    if (authMode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Giriş başarısız", description: (error as Error).message, variant: "destructive" });
      } else {
        toast({ title: "Giriş yapıldı" });
        // User state will update automatically via useAuth, causing re-render and showing payment
      }
    } else {
      // Registration Validation
      if (!fullName.trim() || !phone.trim()) {
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

      const { error } = await signUp(email, password, fullName, phone);
      if (error) {
        toast({ title: "Kayıt başarısız", description: (error as Error).message, variant: "destructive" });
      } else {
        // Show verification screen
        setShowEmailVerification(true);
      }
    }
    setIsLoading(false);
  };

  const stepTitles = ["Seyahat Bilgileri", "Plan Seçimi", "Hesap & Ödeme"];

  return (
    <div className="page-shell section-gradient-light">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-navy-dark text-center mb-4">
          Vize <span className="text-gradient-mint">Başvurusu</span>
        </h1>
        <p className="text-center text-muted-foreground text-lg mb-12">
          <strong className="text-foreground">3 basit adımda</strong> başvurunuzu tamamlayın.
        </p>
        <p className="mb-8 text-center text-xs font-medium text-muted-foreground">
          İlerlemeniz otomatik kaydedilir, istediğiniz zaman kaldığınız yerden devam edebilirsiniz.
        </p>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="grid grid-cols-3 gap-2">
            {stepTitles.map((title, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              return (
                <div
                  key={i}
                  className={`rounded-xl border px-3 py-3 md:py-4 text-center transition-colors ${isActive || isDone ? "border-accent/30 bg-accent/5" : "border-border bg-white"
                    } ${isDone ? "cursor-pointer hover:bg-accent/10" : ""}`}
                  onClick={() => {
                    if (isDone) setStep(stepNum);
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className={`flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full text-sm md:text-base font-bold transition-colors ${isDone || isActive ? "btn-gradient text-white" : "bg-secondary text-muted-foreground"
                        }`}
                    >
                      {isDone ? <CheckCircle size={18} /> : stepNum}
                    </div>
                    <span
                      className={`text-sm md:text-base font-bold leading-tight ${isActive ? "text-navy-dark" : "text-muted-foreground"
                        }`}
                    >
                      {title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-gradient-mint transition-all duration-300"
              style={{ width: `${(step / stepTitles.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* ── STEP 1: Trip Details ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl border border-border p-5 sm:p-7 md:p-10 shadow-sm min-h-[400px] flex flex-col justify-center">
                <h2 className="text-xl md:text-2xl font-extrabold text-navy-dark mb-8">Seyahat Bilgileriniz</h2>

                <div className="space-y-6">
                  <div>
                    <label className="text-[15px] font-bold text-foreground mb-2 block">Pasaportunuz</label>
                    <Select onValueChange={setSelectedPassport} value={selectedPassport}>
                      <SelectTrigger className="h-14 text-lg font-bold text-foreground">
                        <SelectValue>
                          <span className="flex items-center gap-3">
                            <span className="text-2xl">{currentPassport.flag}</span>
                            <span>{currentPassport.label}</span>
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[280px]">
                        {passportOptions.map((p) => (
                          <SelectItem key={p.code} value={p.code} className="py-3 text-lg font-bold cursor-pointer">
                            <span className="flex items-center gap-3">
                              <span className="text-2xl">{p.flag}</span>
                              <span>{p.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[15px] font-bold text-foreground mb-2 block">Hedef Ülke</label>
                    <Select
                      onValueChange={setDestination}
                      value={isDestinationStillAvailable ? destination : ""}
                    >
                      <SelectTrigger className="h-14 text-lg font-bold text-foreground">
                        <SelectValue placeholder={availableDestinations.length === 0 ? "Pasaportunuzla vize gerektiren ülke yok" : "Ülke seçin"}>
                          {selectedDestination && isDestinationStillAvailable ? (
                            <span className="flex items-center gap-3">
                              <span className="text-2xl">{selectedDestination.flag}</span>
                              <span>{selectedDestination.label}</span>
                            </span>
                          ) : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[280px]">
                        {availableDestinations.length === 0 ? (
                          <div className="py-6 px-4 text-center text-sm text-muted-foreground">
                            Seçtiğiniz pasaportla vize gerektiren hedef ülke bulunmuyor. Vizesiz seyahat edebilirsiniz.
                          </div>
                        ) : (
                          availableDestinations.map((c) => (
                            <SelectItem key={c.label} value={c.label} className="py-3 text-lg font-bold cursor-pointer">
                              <span className="flex items-center gap-3">
                                <span className="text-2xl">{c.flag}</span>
                                <span>{c.label}</span>
                              </span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[15px] font-bold text-foreground mb-2 block">Vize Türü</label>
                    <Select onValueChange={setVisaType} value={visaType}>
                      <SelectTrigger className="h-14 text-lg font-bold text-foreground">
                        <SelectValue placeholder="Vize türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {visaTypes.map((v) => (
                          <SelectItem key={v} value={v} className="py-3 text-lg font-bold cursor-pointer">{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full btn-gradient text-white font-bold h-14 text-base rounded-xl mt-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!destination || !visaType || !isDestinationStillAvailable}
                  onClick={() => setStep(2)}
                >
                  Devam Et <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Plan Selection ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl border border-border p-5 sm:p-7 md:p-10 shadow-sm">
                <h2 className="text-xl font-extrabold text-navy-dark mb-8">Planınızı Seçin</h2>

                {/* Quiz */}
                {!quizDone && (
                  <div className="bg-secondary/50 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={18} className="text-[#00D69E]" />
                      <span className="font-bold text-[15px]">Size uygun planı bulalım</span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Soru {quizQ + 1} / {questions.length}
                    </p>
                    <p className="font-semibold text-[15px] mb-4">{questions[quizQ].q}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {questions[quizQ].options.map((opt) => (
                        <Button
                          key={opt.value}
                          variant="outline"
                          className="flex-1 h-12 font-semibold text-[15px] hover:bg-[#00D69E]/5 hover:border-[#00D69E] rounded-xl"
                          onClick={() => handleQuizAnswer(opt.value)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {quizDone && recommendation && (
                  <div className="bg-[#00D69E]/5 border border-[#00D69E]/20 rounded-xl p-5 mb-8">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-[#00D69E]" />
                      <span className="font-bold text-[15px]">
                        Size önerimiz: <span className="text-[#00D69E] capitalize">{recommendation === "starter" ? "Starter" : recommendation === "pro" ? "Pro" : "Elite"}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Plan Cards */}
                <div className="space-y-3">
                  {plans.map((plan) => {
                    const isRecommended = recommendation === plan.id;
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all ${isSelected
                          ? "border-[#00D69E] bg-[#00D69E]/5"
                          : "border-border hover:border-[#00D69E]/30"
                          }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base">{plan.name}</span>
                              {plan.popular && (
                                <span className="text-xs font-bold text-[#00D69E] bg-[#00D69E]/10 px-2 py-0.5 rounded-full">Popüler</span>
                              )}
                              {isRecommended && (
                                <span className="text-xs font-bold text-white bg-navy-dark px-2 py-0.5 rounded-full">Önerildi</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{plan.desc}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-2xl font-extrabold text-navy-dark">{plan.price}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
                  <Button variant="outline" className="font-bold h-14 rounded-xl sm:w-32" onClick={() => setStep(1)}>
                    Geri
                  </Button>
                  <Button
                    className="flex-1 btn-gradient text-white font-bold h-14 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={!selectedPlan}
                    onClick={() => setStep(3)}
                  >
                    Devam Et <ArrowRight size={18} className="ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Account & Payment ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl border border-border p-5 sm:p-7 md:p-10 shadow-sm">
                {!user ? (
                  showEmailVerification ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-navy-dark mb-4">E-postanızı Kontrol Edin</h2>
                      <p className="text-muted-foreground mb-8">
                        Kayıt işlemini tamamlamak için <strong>{email}</strong> adresine gönderdiğimiz doğrulama bağlantısına tıklayın.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Doğruladıktan sonra <button onClick={() => setAuthMode("login")} className="text-accent font-semibold hover:underline">Giriş Yapın</button> ve başvurunuza devam edin.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-extrabold text-navy-dark mb-2">
                        {authMode === "register" ? "Hesap Oluşturun" : "Giriş Yapın"}
                      </h2>
                      <p className="text-[15px] text-muted-foreground mb-8">
                        {authMode === "register"
                          ? "Başvurunuzu takip edebilmek ve belgelerinizi güvenle yükleyebilmek için hesap oluşturun."
                          : "Mevcut hesabınızla giriş yapın."}
                      </p>

                      <div className="space-y-5">
                        {authMode === "register" && (
                          <div>
                            <label className="text-sm font-semibold text-foreground mb-1 block">Ad Soyad</label>
                            <Input className="h-12 text-[15px]" placeholder="Adınız Soyadınız" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-1 block">E-posta</label>
                          <Input className="h-12 text-[15px]" type="email" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-1 block">Şifre</label>
                          <Input className="h-12 text-[15px]" type="password" placeholder="En az 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        {authMode === "register" && (
                          <>
                            <div>
                              <label className="text-sm font-semibold text-foreground mb-1 block">Şifre Tekrar</label>
                              <Input className="h-12 text-[15px]" type="password" placeholder="Şifrenizi doğrulayın" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-foreground mb-1 block">Telefon</label>
                              <Input className="h-12 text-[15px]" type="tel" placeholder="+90 5XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            </div>
                          </>
                        )}
                      </div>

                      <Button
                        className="w-full btn-gradient text-white font-bold h-14 text-base rounded-xl mt-8"
                        onClick={handleAuthSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 size={18} className="mr-2 animate-spin" />
                        ) : authMode === "register" ? (
                          <><User size={18} className="mr-2" /> Hesap Oluştur ve Ödemeye Geç</>
                        ) : (
                          <><LogIn size={18} className="mr-2" /> Giriş Yap ve Ödemeye Geç</>
                        )}
                      </Button>

                      <p className="text-center text-sm text-muted-foreground mt-5">
                        {authMode === "register" ? (
                          <>Zaten hesabınız var mı? <button onClick={() => setAuthMode("login")} className="text-[#00D69E] font-semibold hover:underline">Giriş Yapın</button></>
                        ) : (
                          <>Hesabınız yok mu? <button onClick={() => setAuthMode("register")} className="text-[#00D69E] font-semibold hover:underline">Üye Olun</button></>
                        )}
                      </p>
                    </>
                  )
                ) : (
                  <>
                    <h2 className="text-xl font-extrabold text-navy-dark mb-8">Ödeme Bilgileri</h2>

                    {/* Order Summary */}
                    <div className="bg-secondary/50 rounded-xl p-5 mb-8">
                      <h3 className="font-bold text-[15px] mb-4">Sipariş Özeti</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pasaport</span>
                          <span className="font-medium">{currentPassport.flag} {currentPassport.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hedef</span>
                          <span className="font-semibold text-foreground">
                            {selectedDestination != null ? `${selectedDestination.flag} ${selectedDestination.label}` : destination || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vize Türü</span>
                          <span className="font-medium">{visaType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan</span>
                          <span className="font-medium capitalize">{selectedPlan}</span>
                        </div>
                        <div className="border-t border-border pt-2 mt-2 flex justify-between">
                          <span className="font-bold">Toplam</span>
                          <span className="font-extrabold text-navy-dark text-lg">
                            {selectedPlan === "starter" ? "€49" : selectedPlan === "pro" ? "€149" : "€349"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Fields */}
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">Kart Numarası</label>
                        <Input className="h-12 text-[15px]" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">Son Kullanma</label>
                          <Input className="h-12 text-[15px]" placeholder="AA/YY" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">CVV</label>
                          <Input className="h-12 text-[15px]" placeholder="123" />
                        </div>
                      </div>
                    </div>

                    <Button className="w-full btn-gradient text-white font-bold h-14 text-base rounded-xl mt-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <Lock size={18} className="mr-2" /> Güvenli Ödeme Yap
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground">
                      <ShieldCheck size={14} className="text-[#00D69E]" />
                      256-bit SSL ile korunmaktadır
                    </div>
                  </>
                )}

                <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                  <Button variant="outline" className="font-bold h-14 rounded-xl sm:w-32" onClick={() => {
                    setStep(2);
                  }}>
                    Geri
                  </Button>
                  {/* Keep alignment with full width if there was a continue button here, but since this is payment, the secure payment button is above. We just align the back button nicely. */}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
