import React, { useState, useEffect } from "react";
import { Sparkles, AlertCircle, FileText, Calendar, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AppInfo {
  destination: string;
  visaType: string;
  status: string;
  plan: string;
  travelDate?: string | null;
  uploadedDocs: number;
  totalDocs: number;
}

interface NextStep {
  action: string;
  priority: "yüksek" | "orta" | "düşük";
  icon: "alert" | "document" | "calendar" | "check";
}

interface SummaryResult {
  summary: string;
  nextSteps: NextStep[];
}

const iconMap = {
  alert: AlertCircle,
  document: FileText,
  calendar: Calendar,
  check: CheckCircle,
};

const priorityColors = {
  yüksek: "bg-rose-50 text-rose-600 border-rose-100",
  orta: "bg-amber-50 text-amber-600 border-amber-100",
  düşük: "bg-blue-50 text-blue-600 border-blue-100",
};

export default function AIApplicationSummary({ applications }: { applications: AppInfo[] }) {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    if (applications.length === 0) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-application-summary", {
        body: { applications },
      });
      if (error) throw error;
      setResult(data as SummaryResult);
    } catch (e) {
      console.error("AI summary error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applications.length > 0) fetchSummary();
  }, []);

  if (applications.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-[2rem] p-6 border border-purple-100/50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-black text-navy-dark text-lg">AI Akıllı Özet</h3>
            <p className="text-xs text-slate-500 font-medium">Başvurularınızın analizi</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSummary}
          disabled={loading}
          className="text-purple-600 hover:bg-purple-50 rounded-xl h-8 w-8 p-0"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        </Button>
      </div>

      {loading && !result ? (
        <div className="flex items-center gap-3 py-4">
          <Loader2 size={16} className="animate-spin text-purple-500" />
          <span className="text-sm text-slate-500 font-medium">Başvurularınız analiz ediliyor...</span>
        </div>
      ) : result ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium leading-relaxed">{result.summary}</p>
          
          {result.nextSteps.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Sonraki Adımlar</p>
              {result.nextSteps.map((step, i) => {
                const Icon = iconMap[step.icon] || AlertCircle;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${priorityColors[step.priority]}`}>
                    <Icon size={16} className="shrink-0" />
                    <span className="text-sm font-bold">{step.action}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Özet yüklenemedi.</p>
      )}
    </div>
  );
}
