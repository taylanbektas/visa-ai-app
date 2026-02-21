import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/i18n/LanguageContext";

interface Message {
    role: "user" | "bot";
    text: string;
}

const QUICK_REPLY_KEYS = ["chat.quick.documents", "chat.quick.fees", "chat.quick.duration", "chat.quick.refund"];

export function AIChatBot() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: "" }]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const isMobile = useIsMobile();

    useEffect(() => {
        setMessages((prev) =>
            prev.length === 1 && prev[0].role === "bot"
                ? [{ role: "bot", text: t("chat.greeting") }]
                : prev
        );
    }, [t]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (textOrKey: string) => {
        if (!textOrKey.trim()) return;

        setMessages((prev) => [...prev, { role: "user", text: textOrKey }]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            const responseKey = textOrKey.startsWith("chat.quick.")
                ? textOrKey.replace("chat.quick.", "chat.response.")
                : null;
            const response = responseKey ? t(responseKey) : t("chat.response.default");
            setMessages((prev) => [...prev, { role: "bot", text: response }]);
            setIsTyping(false);
        }, 800 + Math.random() * 600);
    };

    const hasMobileBottomNav =
        isMobile &&
        !["/login", "/admin", "/dashboard"].some((prefix) =>
            location.pathname.startsWith(prefix)
        );
    const mobileBottomOffset = hasMobileBottomNav
        ? "calc(env(safe-area-inset-bottom, 0px) + 5.2rem)"
        : "calc(env(safe-area-inset-bottom, 0px) + 1rem)";
    const chatWindowClass = isMobile
        ? "fixed inset-x-3 z-[60] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/95 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]"
        : "fixed bottom-24 right-5 z-[60] w-[420px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/95 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]";
    const chatWindowStyle = isMobile
        ? {
            top: "calc(env(safe-area-inset-top, 0px) + 1rem)",
            bottom: mobileBottomOffset,
        }
        : undefined;

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={chatWindowClass}
                        style={chatWindowStyle}
                    >
                        {/* Header */}
                        <div className="bg-navy-dark px-8 py-7 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center border border-white/20 shadow-inner group transition-transform hover:scale-105">
                                    <Sparkles size={24} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-black text-xl tracking-tight">VisaPath AI</p>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <span className="block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                        </div>
                                        <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">{t("chat.online")}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-[1.25rem] transition-all p-3 hover:rotate-90 duration-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className={`${isMobile ? "flex-1 min-h-0" : "h-[480px]"} overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar`}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div
                                        className={`max-w-[85%] px-6 py-4 rounded-[1.5rem] text-sm font-bold leading-relaxed shadow-sm ${msg.role === "user"
                                            ? "bg-navy-dark text-white rounded-br-none shadow-navy-dark/10"
                                            : "bg-white border border-slate-100 text-navy-dark rounded-bl-none shadow-slate-200/50"
                                            }`}
                                    >
                                        {msg.role === "user" && msg.text.startsWith("chat.quick.") ? t(msg.text) : msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 rounded-[1.5rem] rounded-bl-none px-6 py-4 shadow-sm">
                                        <div className="flex gap-2">
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        {messages.length <= 2 && (
                            <div className="bg-white px-8 py-5 border-t border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4 ml-1">Önerilen Başlıklar</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {QUICK_REPLY_KEYS.map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => sendMessage(key)}
                                            className="text-xs font-bold px-5 py-3 rounded-2xl border border-slate-100 text-navy-dark hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 shadow-sm bg-white"
                                        >
                                            {t(key)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="bg-white p-6 border-t border-slate-100">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage(input);
                                }}
                                className="flex gap-3 items-center"
                            >
                                <div className="flex-1 relative">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={t("chat.placeholder")}
                                        className="h-14 text-sm font-bold bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl px-5 transition-all outline-none md:text-base"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-navy-dark hover:bg-navy-light text-white h-14 w-14 p-0 rounded-2xl shrink-0 shadow-lg shadow-navy-dark/10 transition-all active:scale-90 hover:-translate-y-1"
                                    disabled={!input.trim()}
                                >
                                    <Send size={20} className="ml-1" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all md:h-16 md:w-16 md:right-5 ${isOpen ? "bg-secondary text-foreground/70" : "btn-gradient text-white"
                    }`}
                style={{
                    bottom: isMobile ? mobileBottomOffset : "1.25rem",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="relative">
                            <MessageCircle size={26} />
                            <Sparkles size={12} className="absolute -top-1 -right-1 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Tooltip when closed */}
            <AnimatePresence>
                {!isOpen && !isMobile && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: 2 }}
                        className="fixed bottom-8 right-24 z-40 bg-white border border-border rounded-xl shadow-lg px-4 py-2.5 text-sm font-medium text-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <Bot size={16} className="text-[#00D69E]" />
                            {t("chat.needHelp")}
                        </div>
                        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-border rotate-[-45deg]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
