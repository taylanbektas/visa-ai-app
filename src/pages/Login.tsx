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
        toast({ title: "Giriş başarısız", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Hoş geldiniz!" });

        if (session?.user) {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);

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
        toast({ title: "Kayıt başarısız", description: error.message, variant: "destructive" });
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
      <div className="container mx-auto px-4 md:px-6 max-w-md">
        <motion.div
          className="bg-white rounded-2xl border border-border p-6 sm:p-8 md:p-10 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl">✈️</span>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-navy-dark">Visa</span>
                <span className="text-gradient-mint">Path</span>
              </span>
            </Link>
            <h1 className="text-2xl font-extrabold text-navy-dark">
              {mode === "login" ? "Giriş Yapın" : "Hesap Oluşturun"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {mode === "login"
                ? "Başvurularınızı takip edin ve belgelerinizi yönetin."
                : "Hızlı ve güvenli bir şekilde hesabınızı oluşturun."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Ad Soyad</label>
                <Input className="h-11 text-[15px]" placeholder="Adınız Soyadınız" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">E-posta</label>
              <Input className="h-11 text-[15px]" type="email" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Şifre</label>
              <Input className="h-11 text-[15px]" type="password" placeholder="En az 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {mode === "register" && (
              <>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Şifre Tekrar</label>
                  <Input className="h-11 text-[15px]" type="password" placeholder="Şifrenizi doğrulayın" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Telefon</label>
                  <Input className="h-11 text-[15px]" type="tel" placeholder="+90 5XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </>
            )}

            <Button type="submit" disabled={isLoading} className="w-full btn-gradient text-white font-bold h-14 text-base rounded-xl mt-4">
              {isLoading ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : mode === "login" ? (
                <><LogIn size={18} className="mr-2" /> Giriş Yap</>
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
