
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { DashboardLayout, SidebarItem } from "@/components/layout/DashboardLayout";
import {
    LayoutDashboard,
    FileText,
    TrendingUp,
    Settings,
    Users,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

// Mock Data
const MOCK_STATS = [
    { id: 'total-apps', labelKey: 'agency.totalApplications', value: '1,284', trend: '+12.5%', isUp: true },
    { id: 'pending', labelKey: 'agency.pendingReview', value: '42', trend: '-2.4%', isUp: false },
    { id: 'success', labelKey: 'agency.completedVisas', value: '%98.2', trend: '+0.5%', isUp: true },
    { id: 'commission', labelKey: 'agency.totalCommission', value: '€14,250', trend: '+18.2%', isUp: true },
];

const MOCK_CHART_DATA = [
    { name: 'Ocak', value: 400 },
    { name: 'Şubat', value: 300 },
    { name: 'Mart', value: 600 },
    { name: 'Nisan', value: 800 },
    { name: 'Mayıs', value: 500 },
    { name: 'Haziran', value: 900 },
    { name: 'Temmuz', value: 1100 },
];

const MOCK_APPS = [
    { id: 'VP-A1B2', name: 'Ahmet Yılmaz', destination: 'Almanya', type: 'Schengen Turistik', status: 'approved', date: '2024-02-20' },
    { id: 'VP-C3D4', name: 'Ayşe Kaya', destination: 'Fransa', type: 'Schengen Öğrenci', status: 'pending', date: '2024-02-21' },
    { id: 'VP-E5F6', name: 'Mehmet Demir', destination: 'İtalya', type: 'Schengen Ticari', status: 'approved', date: '2024-02-19' },
    { id: 'VP-G7H8', name: 'Zeynep Çelik', destination: 'Yunanistan', type: 'Schengen Turistik', status: 'rejected', date: '2024-02-18' },
];

export default function AgencyPanel() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login");
        }
    }, [user, authLoading, navigate]);

    const navItems: SidebarItem[] = [
        { id: 'dashboard', label: t('agency.dashboard'), icon: LayoutDashboard },
        { id: 'applications', label: t('agency.allApps'), icon: FileText },
        { id: 'analytics', label: t('agency.analytics'), icon: TrendingUp },
        { id: 'settings', label: t('agency.settings'), icon: Settings },
    ];

    if (authLoading) return null;

    return (
        <DashboardLayout
            titlePrefix="Kurumsal"
            titleSuffix="Acenta Paneli"
            items={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            maxWidth="max-w-[1600px]"
        >
            <div className="space-y-8 animate-in fade-in duration-500 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-navy-dark">
                            {t('agency.dashboard')}
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Hoş geldiniz. Acentanızın performansını ve başvurularını buradan yönetebilirsiniz.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="rounded-2xl h-14 px-8 font-black bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all active:scale-[0.98]">
                            Yeni Başvuru Oluştur
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_STATS.map((stat) => (
                        <div key={stat.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                {stat.id === 'total-apps' && <FileText size={80} />}
                                {stat.id === 'pending' && <Users size={80} />}
                                {stat.id === 'success' && <TrendingUp size={80} />}
                                {stat.id === 'commission' && <Briefcase size={80} />}
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t(stat.labelKey)}</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-navy-dark tracking-tighter">{stat.value}</p>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.trend}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts & Secondary Info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Chart */}
                    <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-[450px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-navy-dark">Başvuru Trendi</h3>
                                <p className="text-sm text-slate-400 font-bold">Son 7 ayın başvuru yoğunluğu</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="rounded-xl px-4 py-2 border-slate-100 text-slate-500 font-bold">2024 Yılı</Badge>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                                        labelStyle={{ fontWeight: 900, marginBottom: '0.5rem', color: '#1e293b' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Stats list */}
                    <div className="lg:col-span-4 bg-navy-dark p-8 rounded-[2.5rem] text-white shadow-xl shadow-navy-dark/20 flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2">Hızlı Özet</h3>
                            <p className="text-slate-400 font-bold text-sm">Bugünkü operasyonel durum</p>
                        </div>

                        <div className="space-y-6 my-8 relative z-10">
                            <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black">1</div>
                                    <span className="font-bold">Yeni Randevu</span>
                                </div>
                                <ArrowUpRight className="text-emerald-400" />
                            </div>
                            <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-black">12</div>
                                    <span className="font-bold">Bekleyen Evrak</span>
                                </div>
                                <ArrowDownRight className="text-blue-400" />
                            </div>
                            <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-black">3</div>
                                    <span className="font-bold">Eksik Dosya</span>
                                </div>
                                <Users size={18} className="text-orange-400" />
                            </div>
                        </div>

                        <Button className="w-full rounded-2xl h-14 font-black border-white/20 bg-white/10 hover:bg-white/20 transition-all active:scale-[0.98] relative z-10">
                            Raporu Görüntüle
                        </Button>
                    </div>
                </div>

                {/* Applications List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black text-navy-dark">{t('agency.recentApps')}</h3>
                            <p className="text-sm text-slate-400 font-bold">En son oluşturulan başvurular listesi</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                                <Input
                                    placeholder={t('agency.searchPlaceholder')}
                                    className="pl-12 h-12 w-full sm:w-[300px] rounded-2xl border-slate-100 font-bold focus-visible:ring-emerald-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-slate-100 gap-2">
                                <Filter size={18} />
                                Filtrele
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-none">
                                    <TableHead className="py-6 px-8 font-black text-slate-400 text-xs uppercase tracking-widest">Başvuru NO</TableHead>
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-widest">Başvuru Sahibi</TableHead>
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-widest">Hedef</TableHead>
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-widest">Vize Türü</TableHead>
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-widest">Durum</TableHead>
                                    <TableHead className="font-black text-slate-400 text-xs uppercase tracking-widest text-right px-8">Tarih</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_APPS.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase())).map((app) => (
                                    <TableRow key={app.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                                        <TableCell className="py-6 px-8 font-black text-navy-dark">{app.id}</TableCell>
                                        <TableCell className="font-bold text-slate-600">{app.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="rounded-xl border-slate-200 font-bold px-3 py-1">{app.destination}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-400">{app.type}</TableCell>
                                        <TableCell>
                                            <Badge className={`rounded-full px-4 py-1.5 font-black text-xs uppercase ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-none' :
                                                    app.status === 'pending' ? 'bg-blue-50 text-blue-600 border-none' :
                                                        'bg-rose-50 text-rose-600 border-none'
                                                }`}>
                                                {app.status === 'approved' ? 'Onaylandı' : app.status === 'pending' ? 'Beklemede' : 'Reddedildi'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-8 font-bold text-slate-400">{app.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="p-8 bg-slate-50/30 flex justify-center border-t border-slate-50">
                        <Button variant="ghost" className="text-emerald-600 font-black hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl">
                            {t('agency.allApps')} →
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
