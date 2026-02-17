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
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                {/* Header */}
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl md:text-5xl font-extrabold text-navy-dark mb-4">
                        {t("contact.title")}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                        {t("contact.subtitle")}
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-5 md:gap-10">
                    {/* Contact Form */}
                    <motion.div
                        className="md:col-span-3 bg-white border border-border rounded-2xl p-5 sm:p-7 md:p-8 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {formState === "sent" ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-[#00D69E]/10 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-[#00D69E]" />
                                </div>
                                <h3 className="text-xl font-bold text-navy-dark mb-2">✓</h3>
                                <p className="text-muted-foreground">{t("contact.form.success")}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-foreground mb-1.5 block">{t("contact.form.name")}</label>
                                        <Input required className="h-12 text-base" placeholder="Ahmet Yılmaz" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-foreground mb-1.5 block">{t("contact.form.email")}</label>
                                        <Input required type="email" className="h-12 text-base" placeholder="ahmet@mail.com" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-foreground mb-1.5 block">{t("contact.form.subject")}</label>
                                    <Select defaultValue="general">
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">{t("contact.form.subject.general")}</SelectItem>
                                            <SelectItem value="visa">{t("contact.form.subject.visa")}</SelectItem>
                                            <SelectItem value="pricing">{t("contact.form.subject.pricing")}</SelectItem>
                                            <SelectItem value="technical">{t("contact.form.subject.technical")}</SelectItem>
                                            <SelectItem value="other">{t("contact.form.subject.other")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-foreground mb-1.5 block">{t("contact.form.message")}</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                        placeholder="..."
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={formState === "sending"}
                                    className="w-full btn-gradient text-white font-bold h-14 text-lg rounded-xl"
                                >
                                    {formState === "sending" ? (
                                        t("contact.form.sending")
                                    ) : (
                                        <>{t("contact.form.send")} <Send size={18} className="ml-2" /></>
                                    )}
                                </Button>
                            </form>
                        )}
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        className="md:col-span-2 space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-white border border-border rounded-2xl p-5 sm:p-7 shadow-sm">
                            <h3 className="text-lg font-bold text-navy-dark mb-5">{t("contact.info.title")}</h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#00D69E]/10 flex items-center justify-center shrink-0">
                                        <MapPin size={20} className="text-[#00D69E]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Adres</p>
                                        <p className="text-sm text-muted-foreground">{t("contact.info.address")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#00D69E]/10 flex items-center justify-center shrink-0">
                                        <Mail size={20} className="text-[#00D69E]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">E-posta</p>
                                        <p className="text-sm text-muted-foreground">{t("contact.info.email")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#00D69E]/10 flex items-center justify-center shrink-0">
                                        <Phone size={20} className="text-[#00D69E]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Telefon</p>
                                        <p className="text-sm text-muted-foreground">{t("contact.info.phone")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#00D69E]/10 flex items-center justify-center shrink-0">
                                        <MessageCircle size={20} className="text-[#00D69E]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">WhatsApp</p>
                                        <p className="text-sm text-muted-foreground">{t("contact.info.whatsapp")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-border rounded-2xl p-5 sm:p-7 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#00D69E]/10 flex items-center justify-center shrink-0">
                                    <Clock size={20} className="text-[#00D69E]" />
                                </div>
                                <h3 className="text-lg font-bold text-navy-dark">{t("contact.info.hours")}</h3>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>{t("contact.info.hours.weekday")}</p>
                                <p>{t("contact.info.hours.weekend")}</p>
                                <p>{t("contact.info.hours.sunday")}</p>
                            </div>
                            <p className="text-sm text-[#00D69E] font-medium mt-4">{t("contact.info.support")}</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
