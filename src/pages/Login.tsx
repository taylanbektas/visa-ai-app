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
          } else if (userRoles.includes('agency')) {
            navigate('/agency');
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
              {t("login.backToLogin")}
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
              {mode === "login" ? t("login.title") : t("login.registerTitle")}
            </h1>
            <p className="text-base text-muted-foreground mt-3">
              {mode === "login"
                ? t("login.subtitle")
                : t("login.registerSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {mode === "register" && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("login.fullName")}</label>
                <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" placeholder={t("login.placeholder.fullName")} value={fullName} onChange={(e) => { e.target.setCustomValidity(""); setFullName(e.target.value); }} onInvalid={handleInvalid} required />
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("login.email")}</label>
              <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="email" placeholder={t("login.placeholder.email")} value={email} onChange={(e) => { e.target.setCustomValidity(""); setEmail(e.target.value); }} onInvalid={handleInvalid} required />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("login.password")}</label>
              <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="password" placeholder={t("login.placeholder.password")} value={password} onChange={(e) => { e.target.setCustomValidity(""); setPassword(e.target.value); }} onInvalid={handleInvalid} required />
            </div>
            {mode === "register" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("login.passwordConfirm")}</label>
                  <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="password" placeholder={t("login.placeholder.passwordConfirm")} value={confirmPassword} onChange={(e) => { e.target.setCustomValidity(""); setConfirmPassword(e.target.value); }} onInvalid={handleInvalid} required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("login.phone")}</label>
                  <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="tel" placeholder={t("login.placeholder.phone")} value={phone} onChange={(e) => { e.target.setCustomValidity(""); setPhone(e.target.value); }} onInvalid={handleInvalid} required />
                </div>
              </>
            )}

            <Button type="submit" disabled={isLoading} className="w-full btn-gradient text-white font-extrabold h-14 text-lg rounded-xl mt-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              {isLoading ? (
                <Loader2 size={24} className="mr-2 animate-spin" />
              ) : mode === "login" ? (
                <><LogIn size={20} className="mr-2" /> {t("login.submit")}</>
              ) : (
                <><User size={18} className="mr-2" /> {t("login.signUp")}</>
              )}
            </Button>
          </form>

          {/* Google Sign In Separator */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground font-medium">{t("login.or")}</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            className="w-full h-14 rounded-full font-semibold text-base mt-4 border-gray-200 hover:bg-gray-50 transition-all shadow-sm [&_svg]:size-5"
            onClick={async () => {
              setIsLoading(true);
              const result = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (result?.error) {
                toast({ title: t("login.googleFailed"), description: (result.error as Error).message, variant: "destructive" });
                setIsLoading(false);
              }
              // If redirected, page will reload; if session set, onAuthStateChange will handle
            }}
          >
            <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            {mode === "login" ? t("login.withGoogle") : t("login.withGoogleRegister")}
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            className="w-full h-14 rounded-full font-semibold text-base mt-2 bg-black text-white hover:bg-black/90 transition-all border-none [&_svg]:size-5"
            onClick={async () => {
              setIsLoading(true);
              const result = await lovable.auth.signInWithOAuth("apple", {
                redirect_uri: window.location.origin,
              });
              if (result?.error) {
                toast({ title: t("login.appleFailed"), description: (result.error as Error).message, variant: "destructive" });
                setIsLoading(false);
              }
            }}
          >
            <svg className="w-5 h-5 mr-3 mb-0 shrink-0" viewBox="0 0 384 512" fill="currentColor">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            {mode === "login" ? t("login.withApple") : t("login.withAppleRegister")}
          </Button>

          <div className="border-t border-border mt-7 pt-5 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? (
                <>{t("login.noAccountShort")}{" "}
                  <button onClick={() => setMode("register")} className="text-accent font-semibold hover:underline">{t("login.signUp")}</button>
                </>
              ) : (
                <>{t("login.alreadyHaveAccount")}{" "}
                  <button onClick={() => setMode("login")} className="text-accent font-semibold hover:underline">{t("login.submit")}</button>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <Lock size={12} className="text-accent" />
            {t("login.secureNote")}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
