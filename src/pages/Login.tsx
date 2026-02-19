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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === "login") {
      const { data: { session }, error } = await signIn(email, password);
      if (error) {
        toast({ title: "Giriş başarısız", description: (error as Error).message, variant: "destructive" });
      } else {

        if (session?.user) {
          const [{ data: roles }, { data: profile }] = await Promise.all([
            supabase.from('user_roles').select('role').eq('user_id', session.user.id),
            supabase.from('profiles').select('is_suspended').eq('id', session.user.id).single()
          ]);

          if ((profile as any)?.is_suspended) {
            await supabase.auth.signOut();
            toast({
              title: "Hesap Askıya Alındı",
              description: "Hesabınız yönetici tarafından askıya alınmıştır. Giriş yapamazsınız.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }

          const userRoles = roles?.map(r => r.role) || [];

          if (userRoles.includes('admin')) navigate('/admin');
          else if (userRoles.includes('moderator')) navigate('/advisor');
          else navigate('/dashboard');
        }
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
                <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" placeholder="Adınız Soyadınız" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">E-posta</label>
              <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="email" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Şifre</label>
              <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="password" placeholder="En az 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {mode === "register" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Şifre Tekrar</label>
                  <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="password" placeholder="Şifrenizi doğrulayın" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Telefon</label>
                  <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="tel" placeholder="+90 5XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
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
