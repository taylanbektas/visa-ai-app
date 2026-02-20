import React from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export interface SidebarItem {
    id: string;
    label: string;
    icon: LucideIcon;
    badgeCount?: number;
}

interface DashboardLayoutProps {
    titlePrefix?: string;
    titleSuffix?: string;
    groupLabel?: string;
    items: SidebarItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
    children: React.ReactNode;
    maxWidth?: string;
    noPadding?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    titlePrefix,
    titleSuffix,
    groupLabel = "Gezinti",
    items,
    activeTab,
    onTabChange,
    children,
    maxWidth = "max-w-[1800px]",
    noPadding = false,
}) => {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <SidebarProvider style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
            <div className="flex min-h-screen w-full bg-[#f8fafc]">
                {/* Unified Sidebar */}
                <Sidebar className="border-r border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-xl">
                    <SidebarHeader className="border-b border-slate-100 px-6 py-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-500/30">
                                    VS
                                </div>
                                <span className="text-2xl font-black tracking-tight text-navy-dark">Visa Stride</span>
                            </div>
                            {(titlePrefix || titleSuffix) && (
                                <div className="flex flex-col items-center text-center w-full bg-slate-50 py-3 rounded-2xl border border-slate-100 shadow-sm">
                                    <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-0.5">
                                        {titlePrefix}
                                    </h2>
                                    {titleSuffix && (
                                        <div className="text-emerald-600 font-black text-lg tracking-tight">
                                            {titleSuffix}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="px-6 py-6 overflow-y-auto">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu className="space-y-4">
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.id}>
                                            <SidebarMenuButton
                                                isActive={activeTab === item.id}
                                                onClick={() => onTabChange(item.id)}
                                                size="lg"
                                                className="rounded-2xl h-16 gap-4 font-bold transition-all hover:translate-x-1 relative"
                                            >
                                                <item.icon
                                                    className={
                                                        activeTab === item.id
                                                            ? "text-emerald-600 w-6 h-6"
                                                            : "text-slate-400 w-6 h-6"
                                                    }
                                                />
                                                <span
                                                    className={
                                                        activeTab === item.id
                                                            ? "text-navy-dark text-lg"
                                                            : "text-slate-500 text-lg"
                                                    }
                                                >
                                                    {item.label}
                                                </span>
                                                {item.badgeCount ? (
                                                    <span className="absolute right-4 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {item.badgeCount}
                                                    </span>
                                                ) : null}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <div className="mt-auto pt-10 pb-8 px-4 space-y-4">

                            <Button
                                variant="outline"
                                className="w-full h-14 justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100 shadow-sm rounded-2xl font-extrabold text-base transition-all active:scale-[0.98]"
                                onClick={handleSignOut}
                            >
                                <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center mr-4">
                                    <LogOut className="h-4 w-4" />
                                </div>
                                Çıkış Yap
                            </Button>
                        </div>
                    </SidebarContent>
                </Sidebar>

                {/* Main Content Area */}
                <main className={`flex-1 ${noPadding ? "" : "p-8 lg:p-12 pt-8"} overflow-auto ${noPadding ? "max-w-none" : maxWidth} mx-auto w-full h-screen`}>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
};
