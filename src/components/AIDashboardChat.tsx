import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const TYPING_SPEED = 4; // chars per frame (~60fps = smooth typing)

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
  const [visibleLength, setVisibleLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const streamEndedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
          <Sparkles size={22} />
        </div>
        <div>
          <h3 className="font-black text-navy-dark text-2xl">AI Vize Asistanı</h3>
          <p className="text-base text-slate-500 font-medium">Vize süreçleriniz hakkında sorular sorun</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-full text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
              <Bot size={40} className="text-emerald-500" />
            </div>
            <h4 className="font-black text-navy-dark text-2xl mb-3">Merhaba! 👋</h4>
            <p className="text-lg text-slate-500 font-medium max-w-md leading-relaxed">
              Vize süreçleri, belge gereksinimleri ve başvuru durumunuz hakkında sorularınızı yanıtlayabilirim.
            </p>
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              {["Hangi belgeler gerekli?", "Başvurum ne durumda?", "Vize süreci nasıl işliyor?"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-base bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all font-bold"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastAssistant = i === messages.length - 1 && msg.role === "assistant";
          const showContent = isLastAssistant && isLoading
            ? msg.content.slice(0, visibleLength)
            : msg.content;
          return (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                msg.role === "user"
                  ? "bg-emerald-500 text-white rounded-tr-sm"
                  : "bg-slate-50 text-navy-dark border border-slate-100 rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-lg max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-headings:my-3 prose-headings:font-bold text-lg leading-relaxed">
                    <ReactMarkdown>{showContent}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-lg font-medium leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100">
              <Loader2 size={20} className="animate-spin text-emerald-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - at bottom, always visible */}
      <div className="pt-3 px-4 pb-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-100 flex items-center gap-3 shrink-0 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Sorunuzu yazın..."
          className="flex-1 bg-slate-50 rounded-xl h-14 px-4 text-lg font-medium border-none outline-none focus:ring-1 focus:ring-emerald-500/30 placeholder:text-slate-400"
          disabled={isLoading}
        />
        <Button
          onClick={send}
          size="icon"
          className="h-14 w-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
        </Button>
      </div>
    </div>
  );
}
