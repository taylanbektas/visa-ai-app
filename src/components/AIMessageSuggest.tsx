import React, { useState } from "react";
import { Sparkles, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AIMessageSuggestProps {
  destination?: string;
  visaType?: string;
  status?: string;
  onSelect: (message: string) => void;
}

interface Suggestion {
  title: string;
  message: string;
}

const messageTypes = [
  { id: "durum", label: "Durum Sorgulama" },
  { id: "belge", label: "Belge Sorusu" },
  { id: "randevu", label: "Randevu Talebi" },
  { id: "genel", label: "Genel Soru" },
];

export default function AIMessageSuggest({ destination, visaType, status, onSelect }: AIMessageSuggestProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchSuggestions = async (messageType: string) => {
    setLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-message-suggest", {
        body: { messageType, destination, visaType, status },
      });
      if (error) throw error;
      setSuggestions(data?.suggestions || []);
    } catch (e) {
      console.error("AI suggest error:", e);
      setSuggestions([
        { title: "Durum Sorgulama", message: "Merhaba, başvurumun güncel durumu hakkında bilgi alabilir miyim?" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all"
          title="AI Mesaj Önerisi"
        >
          <Sparkles size={22} strokeWidth={2.5} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-2xl border-slate-200 shadow-xl" align="start" side="top">
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
          <h4 className="font-black text-navy-dark text-sm flex items-center gap-2">
            <Sparkles size={14} className="text-purple-500" /> AI Mesaj Önerisi
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">Mesaj türünü seçin</p>
        </div>

        {suggestions.length === 0 && !loading ? (
          <div className="p-3 space-y-1.5">
            {messageTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => fetchSuggestions(type.id)}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700 flex items-center gap-2"
              >
                <MessageSquare size={14} className="text-slate-400" />
                {type.label}
              </button>
            ))}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { onSelect(s.message); setOpen(false); setSuggestions([]); }}
                className="w-full text-left p-3 rounded-xl hover:bg-purple-50 transition-colors border border-slate-100 hover:border-purple-200"
              >
                <p className="text-xs font-black text-purple-600 mb-1">{s.title}</p>
                <p className="text-xs text-slate-600 font-medium line-clamp-2">{s.message}</p>
              </button>
            ))}
            <button
              onClick={() => setSuggestions([])}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 py-2"
            >
              ← Geri Dön
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
