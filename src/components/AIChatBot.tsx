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
        { role: "bot", text: "Merhaba! 👋 Ben VisaPath AI asistanınızım. Size vize sürecinizde yardımcı olabilirim. Aşağıdaki konulardan birini seçin veya sorunuzu yazın!" }
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
        ? "fixed inset-x-3 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
        : "fixed bottom-24 right-5 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl";
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
                        <div className="btn-gradient px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base">VisaPath AI</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        <span className="text-white/80 text-xs font-medium">Çevrimiçi</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className={`${isMobile ? "flex-1 min-h-0" : "h-80"} overflow-y-auto p-4 space-y-3 bg-secondary/30`}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                                ? "btn-gradient text-white rounded-br-md"
                                                : "bg-white border border-border text-foreground rounded-bl-md shadow-sm"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                        <div className="flex gap-1.5">
                                            <span className="w-2 h-2 bg-[#00D69E] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-[#00D69E] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-[#00D69E] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        {messages.length <= 2 && (
                            <div className="border-t border-border bg-white px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                    {quickReplies.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => sendMessage(q)}
                                            className="text-xs font-semibold px-3 py-2 rounded-full border border-[#00D69E]/30 text-[#00B386] hover:bg-[#00D69E]/5 transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="border-t border-border bg-white p-3">
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
                                    placeholder="Sorunuzu yazın..."
                                    className="h-11 text-sm bg-secondary/50 border-0"
                                />
                                <Button type="submit" className="btn-gradient text-white h-11 w-11 p-0 rounded-xl shrink-0" disabled={!input.trim()}>
                                    <Send size={16} />
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
