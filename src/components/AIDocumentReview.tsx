import React, { useState } from "react";
import { Sparkles, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIDocumentReviewProps {
  documentName: string;
  documentType: string;
  destination: string;
  visaType: string;
  requirementId: string;
  autoStart?: boolean;
  onReviewResult?: (status: "uygun" | "kontrol_gerekli" | "uygunsuz") => void;
}

interface ReviewResult {
  status: "uygun" | "kontrol_gerekli" | "uygunsuz";
  summary: string;
  suggestions: string[];
}

const statusConfig = {
  uygun: { icon: CheckCircle, label: "Uygun", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  kontrol_gerekli: { icon: AlertTriangle, label: "Kontrol Gerekli", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  uygunsuz: { icon: XCircle, label: "Uygunsuz", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
};

export default function AIDocumentReview({ documentName, documentType, destination, visaType, requirementId, autoStart = false, onReviewResult }: AIDocumentReviewProps) {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const hasStartedRef = React.useRef(false);

  const handleReview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-document-review", {
        body: { documentName, documentType, destination, visaType },
      });
      if (error) throw error;
      const reviewResult = data as ReviewResult;
      setResult(reviewResult);
      if (onReviewResult) {
        onReviewResult(reviewResult.status);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("AI kontrolü yapılamadı: " + (e.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (autoStart && !hasStartedRef.current && !result) {
      hasStartedRef.current = true;
      handleReview();
    }
  }, [autoStart]);

  if (!result) {
    return (
      <Button
        onClick={handleReview}
        disabled={loading}
        variant="ghost"
        size="sm"
        className="text-xs font-black text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg h-9 px-4 gap-2 border border-purple-100 shadow-sm mt-2"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {loading ? "AI Belgemi İnceliyor..." : "AI Akıllı Kontrolü Başlat"}
      </Button>
    );
  }

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  return (
    <div className={`mt-4 p-5 rounded-2xl ${config.bg} border-2 ${config.border} animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm`}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <StatusIcon size={18} className={config.color} />
        <span className={`text-sm font-black uppercase tracking-wider ${config.color}`}>{config.label}</span>
      </div>
      <p className="text-sm text-slate-700 font-bold mb-3 leading-relaxed">{result.summary}</p>
      {result.suggestions.length > 0 && (
        <div className="space-y-2 mt-3 pt-3 border-t border-black/5">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">AI Önerileri</p>
          <ul className="text-sm text-slate-600 space-y-1.5 ml-4 list-disc font-medium">
            {result.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
