import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Consultation {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  advisor_name: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
  confirmed: { label: "Onaylandı", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle },
  rejected: { label: "Reddedildi", color: "bg-rose-50 text-rose-600 border-rose-100", icon: XCircle },
  cancelled: { label: "İptal Edildi", color: "bg-slate-50 text-slate-500 border-slate-100", icon: XCircle },
};

export default function MyConsultations({ userId }: { userId: string }) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("consultations" as any)
        .select("id, start_time, end_time, status, advisor_id")
        .eq("customer_id", userId)
        .order("start_time", { ascending: true });

      if (!data || data.length === 0) {
        setConsultations([]);
        setLoading(false);
        return;
      }

      // Get advisor names
      const advisorIds = [...new Set((data as any[]).map((c: any) => c.advisor_id))];
      const { data: advisors } = await supabase
        .from("advisors")
        .select("id, user_id")
        .in("id", advisorIds);

      const userIds = advisors?.map((a) => a.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const advisorNameMap = new Map<string, string>();
      advisors?.forEach((a) => {
        const p = profiles?.find((pr) => pr.user_id === a.user_id);
        advisorNameMap.set(a.id, p?.full_name || "Danışman");
      });

      setConsultations(
        (data as any[]).map((c: any) => ({
          id: c.id,
          start_time: c.start_time,
          end_time: c.end_time,
          status: c.status,
          advisor_name: advisorNameMap.get(c.advisor_id) || "Danışman",
        }))
      );
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" size={24} />
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-xl">
            <CalendarIcon size={20} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-black text-navy-dark">Randevularım</h3>
        </div>
        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
          <CalendarIcon size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">Henüz planlanmış randevunuz bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-xl">
          <CalendarIcon size={20} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-navy-dark">Randevularım</h3>
        <Badge className="bg-blue-50 text-blue-600 border-blue-100 ml-auto">{consultations.length}</Badge>
      </div>
      <div className="space-y-3">
        {consultations.map((c) => {
          const cfg = statusConfig[c.status] || statusConfig.pending;
          const StatusIcon = cfg.icon;
          const startDate = new Date(c.start_time);
          const isPast = startDate < new Date();

          return (
            <div
              key={c.id}
              className={`flex items-center justify-between p-4 rounded-xl border border-slate-100 ${isPast ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-slate-500 uppercase leading-none">
                    {format(startDate, "MMM", { locale: tr })}
                  </span>
                  <span className="text-lg font-black text-navy-dark leading-none">
                    {format(startDate, "d")}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-navy-dark">{c.advisor_name}</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {format(startDate, "HH:mm")} - {format(new Date(c.end_time), "HH:mm")}
                  </p>
                </div>
              </div>
              <Badge className={`${cfg.color} border font-bold py-1.5 px-3 flex items-center gap-1.5`}>
                <StatusIcon size={14} /> {cfg.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
