import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MapPin, Mail, Phone, Clock, MessageCircle, Send, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Contact() {
    const { t } = useLanguage();
    const [formState, setFormState] = useState<"idle" | "sending" | "sent">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState("sending");
        // Simulate send
        setTimeout(() => setFormState("sent"), 1500);
    };

    return (
        <div className="page-shell section-gradient-light">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 -left-10 w-72 h-72 bg-mint/10 rounded-full blur-3xl -z-10 animate-pulse" />
                <div className="absolute bottom-40 -right-10 w-96 h-96 bg-navy/5 rounded-full blur-3xl -z-10" />

                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        <span className="text-gradient-mint">{t("contact.title")}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t("contact.subtitle")}
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-5 md:gap-10">
                    {/* Contact Form */}
                    <motion.div
                        className="md:col-span-3 glass-effect border border-white/40 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-mint/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-500 group-hover:bg-mint/10" />

                        {formState === "sent" ? (
                            <div className="text-center py-16">
                                <motion.div
                                    className="w-20 h-20 rounded-full bg-mint/20 flex items-center justify-center mx-auto mb-6"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                >
                                    <CheckCircle size={40} className="text-mint-dark" />
                                </motion.div>
                                <motion.h3
                                    className="text-2xl font-black text-navy-dark mb-3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {t("contact.form.success")}
                                </motion.h3>
                                <motion.p
                                    className="text-muted-foreground text-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    En kısa sürede size geri dönüş yapacağız.
                                </motion.p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-light/70 uppercase tracking-wider ml-1">{t("contact.form.name")}</label>
                                        <Input
                                            required
                                            className="h-14 text-base rounded-2xl bg-white/50 border-white/60 focus:bg-white focus:border-mint transition-all duration-300 shadow-sm px-5"
                                            placeholder="Adınız Soyadınız"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-light/70 uppercase tracking-wider ml-1">{t("contact.form.email")}</label>
                                        <Input
                                            required
                                            type="email"
                                            className="h-14 text-base rounded-2xl bg-white/50 border-white/60 focus:bg-white focus:border-mint transition-all duration-300 shadow-sm px-5"
                                            placeholder="adiniz@ornek.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-navy-light/70 uppercase tracking-wider ml-1">{t("contact.form.subject")}</label>
                                    <Select defaultValue="general">
                                        <SelectTrigger className="h-14 text-base rounded-2xl bg-white/50 border-white/60 focus:bg-white focus:border-mint transition-all duration-300 shadow-sm px-5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-white/40 glass-effect">
                                            <SelectItem value="general">{t("contact.form.subject.general")}</SelectItem>
                                            <SelectItem value="visa">{t("contact.form.subject.visa")}</SelectItem>
                                            <SelectItem value="pricing">{t("contact.form.subject.pricing")}</SelectItem>
                                            <SelectItem value="technical">{t("contact.form.subject.technical")}</SelectItem>
                                            <SelectItem value="other">{t("contact.form.subject.other")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-navy-light/70 uppercase tracking-wider ml-1">{t("contact.form.message")}</label>
                                    <textarea
                                        required
                                        rows={6}
                                        className="w-full rounded-2xl border border-white/60 bg-white/50 px-5 py-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint transition-all duration-300 shadow-sm resize-none focus:bg-white"
                                        placeholder="Mesajınız..."
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={formState === "sending"}
                                    className="w-full btn-gradient text-white font-black h-16 text-xl rounded-2xl shadow-xl hover:shadow-mint/20 transition-all duration-300"
                                >
                                    {formState === "sending" ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t("contact.form.sending")}
                                        </div>
                                    ) : (
                                        <motion.div
                                            className="flex items-center gap-2"
                                            whileHover={{ gap: "12px" }}
                                        >
                                            {t("contact.form.send")} <Send size={22} />
                                        </motion.div>
                                    )}
                                </Button>
                            </form>
                        )}
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        className="md:col-span-2 space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="glass-effect border border-white/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-navy/5 rounded-full -ml-12 -mt-12 blur-xl transition-all duration-500 group-hover:bg-navy/10" />

                            <h3 className="text-xl font-black text-navy-dark mb-6 relative">{t("contact.info.title")}</h3>
                            <div className="space-y-6 relative">
                                <div className="flex items-start gap-4 p-3 rounded-2xl transition-colors hover:bg-white/50">
                                    <div className="w-12 h-12 rounded-2xl bg-mint/20 flex items-center justify-center shrink-0 shadow-sm shadow-mint/10">
                                        <MapPin size={24} className="text-mint-dark" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-navy-light/60 uppercase tracking-widest mb-1">Adres</p>
                                        <p className="text-navy-dark font-bold leading-relaxed">{t("contact.info.address")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-3 rounded-2xl transition-colors hover:bg-white/50">
                                    <div className="w-12 h-12 rounded-2xl bg-mint/20 flex items-center justify-center shrink-0 shadow-sm shadow-mint/10">
                                        <Mail size={24} className="text-mint-dark" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-navy-light/60 uppercase tracking-widest mb-1">E-posta</p>
                                        <p className="text-navy-dark font-bold">{t("contact.info.email")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-3 rounded-2xl transition-colors hover:bg-white/50">
                                    <div className="w-12 h-12 rounded-2xl bg-mint/20 flex items-center justify-center shrink-0 shadow-sm shadow-mint/10">
                                        <Phone size={24} className="text-mint-dark" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-navy-light/60 uppercase tracking-widest mb-1">Telefon</p>
                                        <p className="text-navy-dark font-bold">{t("contact.info.phone")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-3 rounded-2xl transition-colors hover:bg-white/50">
                                    <div className="w-12 h-12 rounded-2xl bg-mint/20 flex items-center justify-center shrink-0 shadow-sm shadow-mint/10">
                                        <MessageCircle size={24} className="text-mint-dark" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-navy-light/60 uppercase tracking-widest mb-1">WhatsApp</p>
                                        <p className="text-navy-dark font-bold">{t("contact.info.whatsapp")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-effect border border-white/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-mint/5 rounded-full -mr-12 -mb-12 blur-xl" />

                            <div className="flex items-center gap-4 mb-6 relative">
                                <div className="w-12 h-12 rounded-2xl bg-mint/20 flex items-center justify-center shrink-0 shadow-sm shadow-mint/10">
                                    <Clock size={24} className="text-mint-dark" />
                                </div>
                                <h3 className="text-xl font-black text-navy-dark">{t("contact.info.hours")}</h3>
                            </div>
                            <div className="space-y-3 relative">
                                <div className="flex justify-between items-center text-navy-light">
                                    <span className="font-bold">Hafta İçi</span>
                                    <span>{t("contact.info.hours.weekday").split(":")[1]}</span>
                                </div>
                                <div className="flex justify-between items-center text-navy-light">
                                    <span className="font-bold">Cumartesi</span>
                                    <span>{t("contact.info.hours.weekend").split(":")[1]}</span>
                                </div>
                                <div className="flex justify-between items-center text-navy-light">
                                    <span className="font-bold">Pazar</span>
                                    <span>{t("contact.info.hours.sunday")}</span>
                                </div>
                            </div>
                            <p className="text-base text-mint-dark font-black mt-6 relative tracking-tight">
                                {t("contact.info.support")}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
