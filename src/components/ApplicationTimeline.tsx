
import React from "react";
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Stage {
    id: string;
    label: string;
    description: string;
    status: "completed" | "in-progress" | "pending" | "action-required";
    date?: string;
}

interface ApplicationTimelineProps {
    currentStatus: string;
    createdAt: string;
}

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ currentStatus, createdAt }) => {
    const getStages = (status: string): Stage[] => {
        const baseStages: Stage[] = [
            { id: "received", label: "Başvuru Alındı", description: "Başvurunuz sisteme başarıyla kaydedildi.", status: "completed", date: new Date(createdAt).toLocaleDateString("tr-TR") },
            { id: "advisor_assigned", label: "Danışman Atandı", description: "Uzman danışmanınız atandı, belgelerinizi yüklemeniz bekleniyor.", status: "completed" },
            { id: "documents", label: "Belgeler İnceleniyor", description: "Yüklediğiniz belgeler kontrol ediliyor.", status: "pending" },
            { id: "submission", label: "Elçiliğe Gönderildi", description: "Başvurunuz yetkili makamlara iletildi.", status: "pending" },
            { id: "result", label: "Vize Kararı", description: "Süreç tamamlandı, sonuç bekleniyor.", status: "pending" },
        ];

        // Status mapping logic
        const statusMap: Record<string, number> = {
            "Alındı": 1,
            "Başvuru Alındı": 1,
            "pending_documents": 1,
            "İnceleniyor": 2,
            "İncelemede": 2,
            "pending_review": 2,
            "İşlem Gerekli": 2,
            "Gönderildi": 3,
            "submitted": 3,
            "Onaylandı": 4,
            "completed": 4,
            "Reddedildi": 4,
            "rejected": 4,
        };

        const currentStep = statusMap[status] || 0;

        return baseStages.map((stage, index) => {
            let stageStatus: Stage["status"] = "pending";
            if (index < currentStep) stageStatus = "completed";
            else if (index === currentStep) {
                stageStatus = status === "İşlem Gerekli" ? "action-required" : "in-progress";
            }

            return { ...stage, status: stageStatus };
        });
    };

    const stages = getStages(currentStatus);

    return (
        <div className="space-y-0 relative">
            <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-slate-100"></div>
            {stages.map((stage, i) => {
                const Icon = stage.status === "completed" ? CheckCircle :
                    stage.status === "in-progress" ? Clock :
                        stage.status === "action-required" ? AlertCircle : Circle;

                const colorClass = stage.status === "completed" ? "text-emerald-500" :
                    stage.status === "in-progress" ? "text-blue-500" :
                        stage.status === "action-required" ? "text-rose-500" : "text-slate-300";

                const bgClass = stage.status === "completed" ? "bg-emerald-50" :
                    stage.status === "in-progress" ? "bg-blue-50" :
                        stage.status === "action-required" ? "bg-rose-50" : "bg-white";

                return (
                    <motion.div
                        key={stage.id}
                        className="flex gap-6 pb-10 relative z-10"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-4 ring-slate-50 ${bgClass} ${colorClass} shrink-0`}>
                            <Icon size={20} className={stage.status === "in-progress" ? "animate-pulse" : ""} />
                        </div>
                        <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-bold transition-colors ${stage.status === "pending" ? "text-slate-400" : "text-navy-dark"}`}>
                                    {stage.label}
                                </h4>
                                {stage.date && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stage.date}</span>}
                            </div>
                            <p className={`text-sm font-medium leading-relaxed ${stage.status === "pending" ? "text-slate-300" : "text-slate-500"}`}>
                                {stage.description}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ApplicationTimeline;
