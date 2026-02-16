import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, LogIn, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
    const [mode, setMode] = useState<"login" | "register">("login");

    return (
        <div className="min-h-screen pt-24 pb-20 section-gradient-light flex items-center justify-center">
            <div className="container mx-auto px-4 md:px-6 max-w-md">
                <motion.div
                    className="bg-white rounded-2xl border border-border p-8 md:p-10 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Logo */}
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

                    {/* Form */}
                    <div className="space-y-5">
                        {mode === "register" && (
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
                        {mode === "register" && (
                            <div>
                                <label className="text-sm font-semibold text-foreground mb-2 block">Telefon</label>
                                <Input className="h-13 text-[15px]" type="tel" placeholder="+90 5XX XXX XX XX" />
                            </div>
                        )}
                    </div>

                    <Button className="w-full btn-gradient text-white font-bold h-14 text-base rounded-xl mt-8">
                        {mode === "login" ? (
                            <>
                                <LogIn size={18} className="mr-2" /> Giriş Yap
                            </>
                        ) : (
                            <>
                                <User size={18} className="mr-2" /> Üye Ol
                            </>
                        )}
                    </Button>

                    {mode === "login" && (
                        <div className="text-center mt-4">
                            <a href="#" className="text-sm text-[#00D69E] font-medium hover:underline">
                                Şifremi Unuttum
                            </a>
                        </div>
                    )}

                    <div className="border-t border-border mt-7 pt-5 text-center">
                        <p className="text-sm text-muted-foreground">
                            {mode === "login" ? (
                                <>
                                    Hesabınız yok mu?{" "}
                                    <button onClick={() => setMode("register")} className="text-[#00D69E] font-semibold hover:underline">
                                        Üye Olun
                                    </button>
                                </>
                            ) : (
                                <>
                                    Zaten hesabınız var mı?{" "}
                                    <button onClick={() => setMode("login")} className="text-[#00D69E] font-semibold hover:underline">
                                        Giriş Yapın
                                    </button>
                                </>
                            )}
                        </p>
                    </div>

                    {/* Trust */}
                    <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
                        <Lock size={12} className="text-[#00D69E]" />
                        256-bit SSL ile korunmaktadır
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
