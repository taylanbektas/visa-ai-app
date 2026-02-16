import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

/* ── Passport options ────────────────────────────────────── */
const passportOptions = [
  { code: "TR", label: "Türkiye", flag: "🇹🇷" },
  { code: "DE", label: "Almanya", flag: "🇩🇪" },
  { code: "US", label: "ABD", flag: "🇺🇸" },
  { code: "GB", label: "İngiltere", flag: "🇬🇧" },
  { code: "FR", label: "Fransa", flag: "🇫🇷" },
  { code: "NL", label: "Hollanda", flag: "🇳🇱" },
  { code: "AZ", label: "Azerbaycan", flag: "🇦🇿" },
];

const destinations = ["Almanya", "Fransa", "İtalya", "İspanya", "Hollanda", "ABD", "İngiltere", "Kanada"];
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
  const [step, setStep] = useState(1);
  const [selectedPassport, setSelectedPassport] = useState("TR");
  const [destination, setDestination] = useState("");
  const [visaType, setVisaType] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  // Quiz
  const [quizDone, setQuizDone] = useState(false);
  const [quizQ, setQuizQ] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  // Auth state (simulated)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  const currentPassport = passportOptions.find((p) => p.code === selectedPassport)!;

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

  const stepTitles = ["Seyahat Bilgileri", "Plan Seçimi", "Hesap & Ödeme"];

  return (
    <div className="min-h-screen pt-24 pb-20 section-gradient-light">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-navy-dark text-center mb-4">
          Vize <span className="text-gradient-mint">Başvurusu</span>
        </h1>
        <p className="text-center text-muted-foreground text-lg mb-12">
          <strong className="text-foreground">3 basit adımda</strong> başvurunuzu tamamlayın.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {stepTitles.map((title, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isDone ? "btn-gradient text-white" : isActive ? "btn-gradient text-white" : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {isDone ? <CheckCircle size={16} /> : stepNum}
                  </div>
                  <span className={`hidden sm:inline text-sm font-medium ${isActive ? "text-navy-dark" : "text-muted-foreground"}`}>
                    {title}
                  </span>
                </div>
                {i < 2 && <div className={`w-8 md:w-12 h-0.5 ${step > stepNum ? "btn-gradient" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* ── STEP 1: Trip Details ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-white rounded-2xl border border-border p-7 md:p-10 shadow-sm">
                <h2 className="text-xl font-extrabold text-navy-dark mb-8">Seyahat Bilgileriniz</h2>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Pasaportunuz</label>
                    <Select onValueChange={setSelectedPassport} value={selectedPassport}>
                      <SelectTrigger className="h-13 text-[15px] font-medium">
                        <SelectValue>
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{currentPassport.flag}</span>
                            <span>{currentPassport.label}</span>
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {passportOptions.map((p) => (
                          <SelectItem key={p.code} value={p.code}>
                            <span className="flex items-center gap-2">{p.flag} {p.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Hedef Ülke</label>
                    <Select onValueChange={setDestination} value={destination}>
                      <SelectTrigger className="h-13 text-[15px]">
                        <SelectValue placeholder="Ülke seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Vize Türü</label>
                    <Select onValueChange={setVisaType} value={visaType}>
                      <SelectTrigger className="h-13 text-[15px]">
                        <SelectValue placeholder="Vize türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {visaTypes.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full btn-gradient text-white font-bold h-14 text-base rounded-xl mt-8"
                  disabled={!destination || !visaType}
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
              <div className="bg-white rounded-2xl border border-border p-7 md:p-10 shadow-sm">
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
                    <div className="flex gap-3">
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
                        <div className="flex items-center justify-between">
                          <div>
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
                          <div className="text-right">
                            <span className="text-2xl font-extrabold text-navy-dark">{plan.price}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-8">
                  <Button variant="outline" className="font-semibold h-13 rounded-xl" onClick={() => setStep(1)}>
                    Geri
                  </Button>
                  <Button
                    className="flex-1 btn-gradient text-white font-bold h-14 text-base rounded-xl"
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
              <div className="bg-white rounded-2xl border border-border p-7 md:p-10 shadow-sm">
                {!isLoggedIn ? (
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
                          <label className="text-sm font-semibold text-foreground mb-2 block">Ad Soyad</label>
                          <Input className="h-13 text-[15px]" placeholder="Adınız Soyadınız" />
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">E-posta</label>
                        <Input className="h-13 text-[15px]" type="email" placeholder="ornek@email.com" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">Şifre</label>
                        <Input className="h-13 text-[15px]" type="password" placeholder="En az 8 karakter" />
                      </div>
                      {authMode === "register" && (
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">Telefon</label>
                          <Input className="h-13 text-[15px]" type="tel" placeholder="+90 5XX XXX XX XX" />
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full btn-gradient text-white font-bold h-14 text-base rounded-xl mt-8"
                      onClick={() => setIsLoggedIn(true)}
                    >
                      {authMode === "register" ? (
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
                          <span className="font-medium">{destination}</span>
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
                        <Input className="h-13 text-[15px]" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">Son Kullanma</label>
                          <Input className="h-13 text-[15px]" placeholder="AA/YY" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">CVV</label>
                          <Input className="h-13 text-[15px]" placeholder="123" />
                        </div>
                      </div>
                    </div>

                    <Button className="w-full btn-gradient text-white font-bold h-14 text-base rounded-xl mt-8">
                      <Lock size={18} className="mr-2" /> Güvenli Ödeme Yap
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground">
                      <ShieldCheck size={14} className="text-[#00D69E]" />
                      256-bit SSL ile korunmaktadır
                    </div>
                  </>
                )}

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="font-semibold h-13 rounded-xl" onClick={() => { setStep(2); setIsLoggedIn(false); }}>
                    Geri
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
