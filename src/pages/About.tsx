import { motion } from "framer-motion";
import { Shield, Users, Lightbulb, Heart } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const values = [
    { icon: Shield, color: "#00D69E" },
    { icon: Users, color: "#0EA5E9" },
    { icon: Heart, color: "#f43f5e" },
    { icon: Lightbulb, color: "#f59e0b" },
];

export default function About() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen pt-28 pb-20">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl md:text-5xl font-extrabold text-navy-dark mb-4">
                        {t("about.title")}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                        {t("about.subtitle")}
                    </p>
                </motion.div>

                {/* Story */}
                <motion.section
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-2xl md:text-3xl font-extrabold text-navy-dark mb-6">
                        {t("about.story.title")}
                    </h2>
                    <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                        <p>{t("about.story.p1")}</p>
                        <p>{t("about.story.p2")}</p>
                    </div>
                </motion.section>

                {/* Stats */}
                <motion.section
                    className="mb-16 bg-gradient-navy rounded-2xl p-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-3xl md:text-4xl font-extrabold text-gradient-mint">3.200+</p>
                            <p className="text-sm text-white/70 mt-1">{t("stats.applications")}</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-4xl font-extrabold text-gradient-mint">%96</p>
                            <p className="text-sm text-white/70 mt-1">{t("stats.approval")}</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-4xl font-extrabold text-gradient-mint">7+</p>
                            <p className="text-sm text-white/70 mt-1">{t("stats.experience")}</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-4xl font-extrabold text-gradient-mint">150+</p>
                            <p className="text-sm text-white/70 mt-1">{t("stats.countries")}</p>
                        </div>
                    </div>
                </motion.section>

                {/* Mission */}
                <motion.section
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl md:text-3xl font-extrabold text-navy-dark mb-6">
                        {t("about.mission.title")}
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {t("about.mission.text")}
                    </p>
                </motion.section>

                {/* Values */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h2 className="text-2xl md:text-3xl font-extrabold text-navy-dark mb-8">
                        {t("about.values.title")}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {values.map((val, i) => {
                            const Icon = val.icon;
                            return (
                                <div key={i} className="bg-white border border-border rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${val.color}15` }}>
                                        <Icon size={24} style={{ color: val.color }} />
                                    </div>
                                    <h3 className="text-lg font-bold text-navy-dark mb-2">
                                        {t(`about.values.${i}.title`)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {t(`about.values.${i}.desc`)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
