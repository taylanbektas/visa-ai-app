import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
    role: "user" | "bot";
    text: string;
}

const quickReplies = [
    "Hangi belgeler gerekli?",
    "Vize ücretleri ne kadar?",
    "Başvuru ne kadar sürer?",
    "Para iade garantiniz var mı?",
];

const botResponses: Record<string, string> = {
    "Hangi belgeler gerekli?": "Genel olarak pasaport, banka hesap özeti, seyahat sigortası, otel rezervasyonu ve uçak bileti gereklidir. Ülkeye göre ek belgeler istenebilir. Detaylı bilgi için ana sayfadaki vize kontrol aracımızı kullanabilirsiniz!",
    "Vize ücretleri ne kadar?": "Danışmanlık paketlerimiz €49 (Starter), €149 (Pro) ve €349 (Elite) olarak fiyatlandırılmıştır. Bunlara ek olarak konsolosluk harçları ayrıca ödenir (Schengen için €90). Detaylar için Fiyatlar sayfamıza bakabilirsiniz!",
    "Başvuru ne kadar sürer?": "Belgelerinizi 24-48 saat içinde inceleriz. Konsolosluk işlem süreleri ülkeye göre değişir: Schengen 10-15 iş günü, ABD mülakata bağlı, İngiltere 15-20 iş günü. Pro ve Elite planlarında sizin için takip yaparız!",
    "Para iade garantiniz var mı?": "Evet! Elite planımızda vize başvurunuz reddedilirse danışmanlık ücretinin %100'ünü iade ediyoruz. Konsolosluk harçları hariçtir. Bu garanti sayesinde risk almadan başvurabilirsiniz!",
};

const defaultResponse = "Teşekkürler! Sorunuzu aldık. Daha detaylı bilgi için 7/24 destek ekibimize ulaşabilirsiniz. Ana sayfadaki vize kontrol aracımızı veya Fiyatlar sayfamızı da incelemenizi öneririz! 😊";

export function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", text: "Merhaba! 👋 Ben VisaPath AI Asistanınızım. Vize sürecinizde size rehberlik etmek için buradayım. Başlamak için bir konu seçebilir veya sorunuzu yazabilirsiniz." }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const isMobile = useIsMobile();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        setMessages((prev) => [...prev, { role: "user", text }]);
        setInput("");
        setIsTyping(true);

        // Simulate typing delay
        setTimeout(() => {
            const response = botResponses[text] || defaultResponse;
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
        ? "fixed inset-x-3 z-50 flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl"
        : "fixed bottom-24 right-5 z-50 w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl";
    const chatWindowStyle = isMobile
        ? {
            top: "calc(env(safe-area-inset-top, 0px) + 4.25rem)",
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
                        <div className="bg-gradient-to-r from-navy-dark to-navy-light px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                    <Bot size={24} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-black text-lg tracking-tight">VisaPath AI Asistanı</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50" />
                                        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Çevrimiçi</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all p-2">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className={`${isMobile ? "flex-1 min-h-0" : "h-[450px]"} overflow-y-auto p-6 space-y-4 bg-slate-50/50`}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${msg.role === "user"
                                            ? "bg-navy-dark text-white rounded-br-none"
                                            : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-5 py-3.5 shadow-sm">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        {messages.length <= 2 && (
                            <div className="border-t border-slate-100 bg-white px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                    {quickReplies.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => sendMessage(q)}
                                            className="text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border border-slate-100 text-navy-dark hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300 shadow-sm"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="border-t border-slate-100 bg-white p-4">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage(input);
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Sorunuzu buraya yazın..."
                                    className="h-12 text-sm bg-slate-50 border-none focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-4"
                                />
                                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 w-12 p-0 rounded-xl shrink-0 shadow-lg shadow-emerald-500/20 transition-all active:scale-95" disabled={!input.trim()}>
                                    <Send size={18} />
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
                            Yardıma ihtiyacınız mı var?
                        </div>
                        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-border rotate-[-45deg]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
