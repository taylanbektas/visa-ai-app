import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const TYPING_SPEED = 4; // chars per frame (~60fps = smooth typing)

const STORAGE_KEY_PREFIX = "ai-dashboard-chat-";

export interface ApplicationContextItem {
  referenceId?: string;
  destination?: string;
  visaType?: string;
  status?: string;
  travelDate?: string;
}

export type AIDashboardChatContext = {
  userName?: string;
  destination?: string;
  visaType?: string;
  status?: string;
  travelDate?: string;
  applications?: ApplicationContextItem[];
  summary?: string;
  nextSteps?: { action: string; priority: string; icon: string }[];
  // Advisor-specific context
  role?: 'customer' | 'advisor';
  customerName?: string;
  documentsUploaded?: number;
  plan?: string;
};

interface AIDashboardChatProps {
  /** Sekme görünür mü; true iken son mesaja anında scroll yapılır */
  isVisible?: boolean;
  /** Kullanıcıya özel anahtar verilirse sohbet geçmişi localStorage'da saklanır (örn. user.id) */
  persistKey?: string;
  /** Her mesaj gönderiminde bu context (veya getter) kullanılır; getter verirsen her istekte anlık güncel veri gider, mesajlar sabit kalsa da AI güncel bağlamı görür. */
  context?: AIDashboardChatContext | (() => AIDashboardChatContext);
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

function loadPersistedMessages(persistKey: string | undefined): Msg[] {
  if (!persistKey) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + persistKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m): m is Msg => typeof m === "object" && m !== null && (m as Msg).role !== undefined && typeof (m as Msg).content === "string");
  } catch {
    return [];
  }
}

export default function AIDashboardChat({ isVisible, persistKey, context }: AIDashboardChatProps) {
  const [messages, setMessages] = useState<Msg[]>(() => loadPersistedMessages(persistKey));
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visibleLength, setVisibleLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const streamEndedRef = useRef(false);
  /** Context getter ise her send'de çağrılır (anlık güncel); obje ise ref ile son render değeri kullanılır */
  const contextRef = useRef(context);
  contextRef.current = context;

  // Sekme görünür olduğunda son mesaja anında scroll (kaydırma efekti yok)
  useEffect(() => {
    if (!isVisible || messages.length === 0) return;
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
    }
  }, [isVisible, messages.length]);

  // Yeni mesaj/typing sonrası son mesajda kal (animasyonsuz)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [messages, visibleLength]);

  // Typing effect: reveal streamed content gradually; only set loading false after catch-up
  useEffect(() => {
    const last = messages[messages.length - 1];
    const targetLen = last?.role === "assistant" ? last.content.length : 0;
    if (targetLen === 0) {
      setVisibleLength(0);
      if (streamEndedRef.current && isLoading) setIsLoading(false);
      return;
    }
    if (!isLoading) {
      setVisibleLength(targetLen);
      return;
    }
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setVisibleLength((prev) => {
        const next = Math.min(prev + TYPING_SPEED, targetLen);
        if (next >= targetLen && streamEndedRef.current) setIsLoading(false);
        if (next < targetLen) rafRef.current = requestAnimationFrame(tick);
        return next;
      });
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [messages, isLoading]);

  // Geçmiş sohbeti sakla (sayfadan çıkınca kaybolmasın)
  useEffect(() => {
    if (!persistKey || messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + persistKey, JSON.stringify(messages));
    } catch {
      // quota veya başka hata
    }
  }, [persistKey, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setVisibleLength(0);
    streamEndedRef.current = false;

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    const { data: { session } } = await supabase.auth.getSession();
    const authHeader = session?.access_token
      ? `Bearer ${session.access_token}`
      : `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

    try {
      // Her istekte güncel context: getter ise şimdi çağır (başvurular/özet/userName anlık), obje ise ref'teki son değer. Mesajlar sabit kalsa da AI her seferinde güncel bağlamı görür.
      const currentContext = typeof contextRef.current === "function" ? contextRef.current() : contextRef.current;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ messages: allMessages, context: currentContext }),
      });

      if (resp.status === 401) {
        throw new Error("Lütfen giriş yapın.");
      }
      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "AI servisi yanıt veremedi");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add placeholder assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        const lines = textBuffer.split("\n");

        // Keep the last partial line in the buffer
        textBuffer = lines.pop() || "";

        for (let line of lines) {
          line = line.trim();
          if (!line || line === ":" || !line.startsWith("data: ")) continue;

          const jsonStr = line.replace(/^data: /, "").trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const newMsg = [...prev];
                newMsg[newMsg.length - 1] = { role: "assistant", content: assistantSoFar };
                return newMsg;
              });
            }
          } catch (e) {
            console.error("JSON parse error:", e, jsonStr);
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${e.message || "Bir hata oluştu. Lütfen tekrar deneyin."}` },
      ]);
      setIsLoading(false);
      return;
    }
    streamEndedRef.current = true;
    // Split single long assistant message into multiple bubbles by [YENİ_MESAJ]
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role !== "assistant" || !last.content.includes("[YENİ_MESAJ]")) return prev;
      const parts = last.content
        .split("[YENİ_MESAJ]")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length <= 1) return prev;
      return [...prev.slice(0, -1), ...parts.map((content) => ({ role: "assistant" as const, content }))];
    });
    // isLoading is cleared by effect when visibleLength catches up (typing effect)
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-navy-dark/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>

      <div className="px-8 py-7 border-b border-slate-100 bg-white/50 backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group transition-transform hover:scale-105">
            <Bot size={28} />
          </div>
          <div>
            <h3 className="font-black text-navy-dark text-2xl tracking-tight">VisaPath AI</h3>
            <div className="flex items-center gap-2">
              <span className="block w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Yapay Zeka Destek Ünitesi</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0 bg-slate-50/20 custom-scrollbar relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 relative group">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-xl group-hover:bg-emerald-500/20 transition-all opacity-0 group-hover:opacity-100"></div>
              <Sparkles size={48} className="text-emerald-500 relative z-10" />
            </div>
            <h4 className="font-black text-navy-dark text-3xl mb-4 tracking-tight">Size Nasıl Yardımcı Olabilirim?</h4>
            <p className="text-lg text-slate-500 font-medium max-w-sm leading-relaxed mb-10">
              Vize süreçleri, belge hazırlığı veya başvuru durumunuz hakkında her şeyi sorabilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {[
                { text: "Vize türleri nelerdir?", icon: Sparkles },
                { text: "Nasıl randevu alırım?", icon: Sparkles },
                { text: "Başvurumu takip et", icon: Sparkles }
              ].map((q) => (
                <button
                  key={q.text}
                  onClick={() => { setInput(q.text); }}
                  className="group flex items-center gap-2.5 text-xs bg-white text-navy-dark px-6 py-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all font-black uppercase tracking-wider shadow-sm active:scale-95"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((msg, i) => {
            const isLastAssistant = i === messages.length - 1 && msg.role === "assistant";
            const showContent = isLastAssistant && isLoading
              ? msg.content.slice(0, visibleLength)
              : msg.content;

            return (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[85%] rounded-[2rem] px-6 py-4 shadow-sm relative ${msg.role === "user"
                  ? "bg-navy-dark text-white rounded-tr-none shadow-navy-dark/10"
                  : "bg-white text-navy-dark border border-slate-100 rounded-tl-none shadow-slate-200/50"
                  }`}>
                  {msg.role === "assistant" && (
                    <div className="absolute -left-12 bottom-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 hidden md:flex">
                      <Bot size={14} />
                    </div>
                  )}
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-1 prose-headings:my-3 prose-headings:text-navy-dark prose-headings:font-black text-[15px] font-medium leading-relaxed">
                      <ReactMarkdown>{showContent || (isLoading && isLastAssistant ? "..." : "")}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start animate-in fade-in scale-95 duration-300">
            <div className="bg-white rounded-2xl rounded-tl-sm px-6 py-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yanıt Hazırlanıyor</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-center gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/5 focus-within:border-emerald-500/20 transition-all"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mesajınızı buraya yazın..."
            className="flex-1 bg-transparent h-12 pl-4 text-[15px] font-bold outline-none"
            disabled={isLoading}
          />
          <Button
            onClick={send}
            className={`h-12 w-12 rounded-2xl p-0 font-black transition-all active:scale-95 shadow-lg flex items-center justify-center ${!input.trim() || isLoading
              ? "bg-slate-200 text-slate-400"
              : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
              }`}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Send size={22} />
            )}
          </Button>
        </form>

      </div>
    </div>
  );
}
