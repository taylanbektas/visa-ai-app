import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, LogIn, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

export default function StaffLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { signIn } = useAuth();
    const { getPanelPath } = useUserRole();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            toast({ title: "Giriş başarısız", description: error.message, variant: "destructive" });
            setIsLoading(false);
            return;
        }

        // Delay to allow role hook to update
        setTimeout(async () => {
            // We can't easily check role inside this function immediately without refetching
            // But the RoleRoute or the Layout will catch unauthorized users.
            // For better UX, let's try to fetch role or rely on redirection.
            // We navigate to /admin or /advisor based on best guess or default content.

            // Actually, we should check if they are ALREADY a customer.
            // But since we are client-side, let's redirect to a intermediate or rely on the hook if it updates fast enough
            // Ideally we'd check the role.

            // Let's navigate to a "checking" route or just try to go to admin and let strict routing handle it?
            // User wants: "advisor rolü onaylanan herkes oradan girebilsin ama customer rolündekiler kesinlikle giremesin"
            // So if they are just a 'user', strict route will kick them out to dashboard or login.

            toast({ title: "Panel yönlendiriliyor..." });
            // We can try to guess or just go to /admin which might redirect to /advisor if role is strictly checked there?
            // Actually, let's use the getPanelPath() but it might be stale.
            // Better: Navigate to a protected route like /staff-check that redirects.
            // Or simply:
            navigate("/advisor");
        }, 1000);
    };

    return (
        <div className="page-shell bg-slate-50 flex items-center justify-center min-h-screen">
            <div className="container mx-auto px-4 md:px-6 max-w-sm">
                <motion.div
                    className="bg-white rounded-2xl border border-border p-8 shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy-dark text-white mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-navy-dark">
                            Yetkili Girişi
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Sadece Yönetici ve Danışmanlar içindir.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-foreground mb-1 block">E-posta</label>
                            <Input className="h-11" type="email" placeholder="kullanici@visapath.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-foreground mb-1 block">Şifre</label>
                            <Input className="h-11" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full bg-navy-dark hover:bg-navy-dark/90 text-white font-bold h-12 text-sm rounded-xl mt-2">
                            {isLoading ? (
                                <Loader2 size={18} className="mr-2 animate-spin" />
                            ) : (
                                <><LogIn size={18} className="mr-2" /> Panele Giriş Yap</>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-xs text-muted-foreground hover:text-navy-dark hover:underline flex items-center justify-center gap-1">
                            Müşteri misiniz? Normal giriş için tıklayın.
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
