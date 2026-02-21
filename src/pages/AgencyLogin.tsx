
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, LogIn, Loader2, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AgencyLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { signIn } = useAuth();
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

        const { data: { session }, error } = await signIn(email, password);

        if (error) {
            toast({ title: t("auth.login_failed"), description: t("auth.invalid_credentials"), variant: "destructive" });
            setIsLoading(false);
            return;
        }

        if (session?.user) {
            // Fetch roles immediately to decide where to go
            const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id);

            const userRoles = roles?.map(r => r.role) || [];

            if (userRoles.includes('agency') || userRoles.includes('admin')) {
                toast({ title: "Acenta paneline yönlendiriliyor..." });
                navigate('/agency');
            } else {
                // Not authorized for agency panel
                await supabase.auth.signOut();
                toast({
                    title: t("auth.login_failed"),
                    description: "Bu hesap ile acenta paneline giriş yetkiniz bulunmamaktadır.",
                    variant: "destructive"
                });
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="page-shell section-gradient-light flex items-center justify-center min-h-screen">
            <div className="container mx-auto px-4 md:px-6 max-w-md">
                <motion.div
                    className="bg-white rounded-3xl border border-border p-8 sm:p-12 shadow-2xl relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Subtle background glow effect */}
                    <div className="absolute top-0 right-0 -m-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="text-center mb-10 relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-6 shadow-sm">
                            <Briefcase size={28} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-navy-dark tracking-tight">
                            Acenta Girişi
                        </h1>
                        <p className="text-base text-muted-foreground mt-3">
                            Acenta yönetim paneline erişmek için giriş yapın.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div>
                            <label className="text-sm font-semibold text-foreground mb-1.5 block">E-posta</label>
                            <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="email" placeholder="acenta@visapath.com" value={email} onChange={(e) => { e.target.setCustomValidity(""); setEmail(e.target.value); }} onInvalid={handleInvalid} required />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-foreground mb-1.5 block">Şifre</label>
                            <Input className="h-14 text-base rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-colors" type="password" placeholder="••••••••" value={password} onChange={(e) => { e.target.setCustomValidity(""); setPassword(e.target.value); }} onInvalid={handleInvalid} required />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold h-14 text-lg rounded-xl mt-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                            {isLoading ? (
                                <Loader2 size={24} className="mr-2 animate-spin" />
                            ) : (
                                <><LogIn size={20} className="mr-2" /> Giriş Yap</>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center relative z-10">
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-navy-dark hover:underline flex items-center justify-center gap-1 font-medium">
                            Müşteri misiniz? Normal giriş için tıklayın.
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
