import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, LogIn, Lock, Loader2, Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { lovable } from "@/integrations/lovable/index";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const { signIn, signUp } = useAuth();
  const { getPanelPath, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleInvalid = (e: any) => {
    e.target.setCustomValidity("");
    if (!e.target.validity.valid) {
      if (e.target.validity.valueMissing) {
        e.target.setCustomValidity(t("auth.required_field"));
      } else if (e.target.validity.typeMismatch && e.target.type === 'email') {
        e.target.setCustomValidity(t("auth.invalid_email"));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === "login") {
      const { data: { session }, error } = await signIn(email, password);
      if (error) {
        toast({ title: t("auth.login_failed"), description: t("auth.invalid_credentials"), variant: "destructive" });
      } else {

        if (session?.user) {
          const [{ data: roles }, { data: profile }] = await Promise.all([
            supabase.from('user_roles').select('role').eq('user_id', session.user.id),
            supabase.from('profiles').select('is_suspended').eq('id', session.user.id).single()
          ]);

          if ((profile as any)?.is_suspended) {
            await supabase.auth.signOut();
            toast({
              title: t("auth.login_failed"),
              description: t("auth.account_suspended"),
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }

          const userRoles = roles?.map(r => r.role) || [];

          if (userRoles.includes('admin') || userRoles.includes('moderator')) {
            await supabase.auth.signOut();
            toast({ title: t("auth.login_failed"), description: t("auth.invalid_credentials"), variant: "destructive" });
          } else {
            navigate('/dashboard');
          }
        }
      }
    } else {
      // Registration Validation
      if (!fullName.trim() || !phone.trim()) {
        toast({ title: t("auth.login_failed"), description: t("auth.missing_info"), variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (password.length < 8) {
        toast({ title: t("auth.login_failed"), description: t("auth.weak_password"), variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: t("auth.login_failed"), description: t("auth.passwords_not_match"), variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const { error } = await signUp(email, password, fullName, phone);
      if (error) {
        toast({ title: t("auth.login_failed"), description: (error as Error).message, variant: "destructive" });
      } else {
        // Show email verification screen instead of auto-login
        setShowEmailVerification(true);
      }
    }
    setIsLoading(false);
  };

  if (showEmailVerification) {
    return (
      <div className="page-shell section-gradient-light flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 max-w-md">
          <motion.div
            className="bg-white rounded-2xl border border-border p-6 sm:p-8 md:p-10 shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-dark mb-4">E-postanızı Kontrol Edin</h1>
            <p className="text-muted-foreground mb-8">
              Kayıt işlemini tamamlamak için <strong>{email}</strong> adresine gönderdiğimiz doğrulama bağlantısına tıklayın.
            </p>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl font-semibold"
              onClick={() => {
                setShowEmailVerification(false);
                setMode("login");
              }}
            >
              Giriş Ekranına Dön
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell section-gradient-light flex items-center justify-center">
      <div className="container mx-auto px-4 md:px-6 max-w-lg">
        <motion.div
          className="bg-white rounded-3xl border border-border p-8 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 -m-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -m-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:scale-105 transition-transform duration-200">
              <span className="text-3xl">✈️</span>
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-navy-dark">Visa</span>
                <span className="text-gradient-mint">Path</span>
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold text-navy-dark tracking-tight">
              {mode === "login" ? "Giriş Yapın" : "Hesap Oluşturun"}
            </h1>
            <p className="text-base text-muted-foreground mt-3">
              {mode === "login"
                ? "Başvurularınızı takip edin ve belgelerinizi yönetin."
                : "Hızlı ve güvenli bir şekilde hesabınızı oluşturun."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {mode === "register" && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Ad Soyad</label>
                <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" placeholder="Adınız Soyadınız" value={fullName} onChange={(e) => { e.target.setCustomValidity(""); setFullName(e.target.value); }} onInvalid={handleInvalid} required />
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">E-posta</label>
              <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="email" placeholder="ornek@email.com" value={email} onChange={(e) => { e.target.setCustomValidity(""); setEmail(e.target.value); }} onInvalid={handleInvalid} required />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Şifre</label>
              <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="password" placeholder="En az 8 karakter" value={password} onChange={(e) => { e.target.setCustomValidity(""); setPassword(e.target.value); }} onInvalid={handleInvalid} required />
            </div>
            {mode === "register" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Şifre Tekrar</label>
                  <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="password" placeholder="Şifrenizi doğrulayın" value={confirmPassword} onChange={(e) => { e.target.setCustomValidity(""); setConfirmPassword(e.target.value); }} onInvalid={handleInvalid} required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Telefon</label>
                  <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="tel" placeholder="+90 5XX XXX XX XX" value={phone} onChange={(e) => { e.target.setCustomValidity(""); setPhone(e.target.value); }} onInvalid={handleInvalid} required />
                </div>
              </>
            )}

            <Button type="submit" disabled={isLoading} className="w-full btn-gradient text-white font-extrabold h-14 text-lg rounded-xl mt-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              {isLoading ? (
                <Loader2 size={24} className="mr-2 animate-spin" />
              ) : mode === "login" ? (
                <><LogIn size={20} className="mr-2" /> Giriş Yap</>
              ) : (
                <><User size={18} className="mr-2" /> Üye Ol</>
              )}
            </Button>
          </form>

          {/* Google Sign In Separator */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground font-medium">veya</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            className="w-full h-14 rounded-xl font-semibold text-base mt-4 border-gray-200 hover:bg-gray-50 transition-all"
            onClick={async () => {
              setIsLoading(true);
              const result = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (result?.error) {
                toast({ title: "Google ile giriş başarısız", description: (result.error as Error).message, variant: "destructive" });
                setIsLoading(false);
              }
              // If redirected, page will reload; if session set, onAuthStateChange will handle
            }}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile {mode === "login" ? "Giriş Yap" : "Kaydol"}
          </Button>

          <div className="border-t border-border mt-7 pt-5 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? (
                <>Hesabınız yok mu?{" "}
                  <button onClick={() => setMode("register")} className="text-accent font-semibold hover:underline">Üye Olun</button>
                </>
              ) : (
                <>Zaten hesabınız var mı?{" "}
                  <button onClick={() => setMode("login")} className="text-accent font-semibold hover:underline">Giriş Yapın</button>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <Lock size={12} className="text-accent" />
            256-bit SSL ile korunmaktadır
          </div>
        </motion.div>
      </div>
    </div>
  );
}
