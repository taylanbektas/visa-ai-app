import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, X, Bot, User, MessageSquare, Zap, ArrowRight, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

type Msg = { role: "user" | "assistant"; content: string };

interface AIDashboardChatProps {
  context?: {
    destination?: string;
    visaType?: string;
    status?: string;
    travelDate?: string;
  };
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export default function AIDashboardChat({ context }: AIDashboardChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, context }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "AI servisi yanıt veremedi");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${e.message || "Bir hata oluştu. Lütfen tekrar deneyin."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-navy-dark/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>

      {/* Header */}
      <div className="px-8 py-7 border-b border-slate-100 bg-white/50 backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group transition-transform hover:scale-105">
            <Sparkles size={28} />
          </div>
          <div>
            <h3 className="font-black text-navy-dark text-2xl tracking-tight">VisaPath AI Asistanı</h3>
            <div className="flex items-center gap-2">
              <span className="block w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">7/24 Akıllı Destek Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0 bg-slate-50/30 custom-scrollbar relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 relative group">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-xl group-hover:bg-emerald-500/20 transition-all opacity-0 group-hover:opacity-100"></div>
              <Bot size={48} className="text-emerald-500 relative z-10" />
            </div>
            <h4 className="font-black text-navy-dark text-3xl mb-4 tracking-tight">Merhaba! 👋</h4>
            <p className="text-lg text-slate-500 font-medium max-w-sm leading-relaxed mb-10">
              Vize süreçleri, belge gereksinimleri ve başvuru durumunuz hakkında sorularınızı anında yanıtlayabilirim.
            </p>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {[
                { text: "Hangi belgeler gerekli?", icon: Paperclip },
                { text: "Başvurum ne durumda?", icon: Zap },
                { text: "Süreç nasıl işliyor?", icon: MessageSquare }
              ].map((q) => (
                <button
                  key={q.text}
                  onClick={() => { setInput(q.text); }}
                  className="group flex items-center gap-2.5 text-xs bg-white text-navy-dark px-6 py-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all font-black uppercase tracking-wider shadow-sm"
                >
                  <q.icon size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-[2rem] px-7 py-5 shadow-sm relative ${msg.role === "user"
                ? "bg-navy-dark text-white rounded-tr-none shadow-navy-dark/10"
                : "bg-white text-navy-dark border border-slate-100 rounded-tl-none shadow-slate-200/50"
                }`}>
                {msg.role === "assistant" && (
                  <div className="absolute -left-12 bottom-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 hidden md:flex">
                    <Sparkles size={14} />
                  </div>
                )}
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-1 prose-headings:my-3 prose-headings:text-navy-dark prose-headings:font-black text-[15px] font-medium leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-[15px] font-bold leading-relaxed">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white rounded-2xl rounded-tl-sm px-6 py-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Düşünüyor</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-slate-100 relative z-10 box-shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-center gap-4"
        >
          <div className="flex-1 relative group">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sorunuzu buraya yazın..."
              className="w-full bg-slate-50 rounded-2xl h-14 pl-6 pr-12 text-[15px] font-bold border-2 border-transparent focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
              disabled={isLoading}
            />
            {!input && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:opacity-0 transition-opacity">
                <Zap size={20} />
              </div>
            )}
          </div>
          <Button
            onClick={send}
            className={`h-14 px-8 rounded-2xl font-black transition-all active:scale-95 shadow-lg ${!input.trim() || isLoading
              ? "bg-slate-100 text-slate-400"
              : "bg-navy-dark text-white hover:bg-navy-light shadow-navy-dark/20"
              }`}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <span>GÖNDER</span>
                <ArrowRight size={18} />
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
