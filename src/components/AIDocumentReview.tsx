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

export default function AIDocumentReview({ documentName, documentType, destination, visaType, requirementId }: AIDocumentReviewProps) {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-document-review", {
        body: { documentName, documentType, destination, visaType },
      });
      if (error) throw error;
      setResult(data as ReviewResult);
    } catch (e: any) {
      console.error(e);
      toast.error("AI kontrolü yapılamadı: " + (e.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <Button
        onClick={handleReview}
        disabled={loading}
        variant="ghost"
        size="sm"
        className="text-xs font-bold text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg h-8 px-3 gap-1.5"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
        {loading ? "Kontrol ediliyor..." : "AI Kontrol"}
      </Button>
    );
  }

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  return (
    <div className={`mt-3 p-3 rounded-xl ${config.bg} border ${config.border} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className="flex items-center gap-2 mb-1.5">
        <StatusIcon size={14} className={config.color} />
        <span className={`text-xs font-black ${config.color}`}>{config.label}</span>
      </div>
      <p className="text-xs text-slate-700 font-medium mb-1">{result.summary}</p>
      {result.suggestions.length > 0 && (
        <ul className="text-xs text-slate-500 space-y-0.5 ml-4 list-disc">
          {result.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
