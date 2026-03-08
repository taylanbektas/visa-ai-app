import React from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
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
        <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
            <div className="flex min-h-screen w-full bg-[#f8fafc]">
                <Sidebar className="border-r border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-xl" collapsible="offcanvas">
                    <SidebarHeader className="border-b border-slate-100 px-4 py-6 md:px-6 md:py-8">
                        <div className="flex flex-col gap-4 md:gap-6">
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-emerald-500/30">
                                    VS
                                </div>
                                <span className="text-xl md:text-2xl font-black tracking-tight text-navy-dark">Visa Stride</span>
                            </div>
                            {(titlePrefix || titleSuffix) && (
                                <div className="flex flex-col items-center text-center w-full bg-slate-50 py-2.5 md:py-3 rounded-2xl border border-slate-100 shadow-sm">
                                    <h2 className="text-[10px] md:text-xs font-black tracking-widest text-slate-400 uppercase mb-0.5">
                                        {titlePrefix}
                                    </h2>
                                    {titleSuffix && (
                                        <div className="text-emerald-600 font-black text-base md:text-lg tracking-tight">
                                            {titleSuffix}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="px-4 py-4 md:px-6 md:py-6 overflow-y-auto">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu className="space-y-2 md:space-y-4">
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.id}>
                                            <SidebarMenuButton
                                                isActive={activeTab === item.id}
                                                onClick={() => onTabChange(item.id)}
                                                size="lg"
                                                className="rounded-xl md:rounded-2xl h-12 md:h-16 gap-3 md:gap-4 font-bold transition-all hover:translate-x-1 relative"
                                            >
                                                <item.icon
                                                    className={
                                                        activeTab === item.id
                                                            ? "text-emerald-600 w-5 h-5 md:w-6 md:h-6"
                                                            : "text-slate-400 w-5 h-5 md:w-6 md:h-6"
                                                    }
                                                />
                                                <span
                                                    className={
                                                        activeTab === item.id
                                                            ? "text-navy-dark text-base md:text-lg"
                                                            : "text-slate-500 text-base md:text-lg"
                                                    }
                                                >
                                                    {item.label}
                                                </span>
                                                {item.badgeCount ? (
                                                    <span className="absolute right-3 md:right-4 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {item.badgeCount}
                                                    </span>
                                                ) : null}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <div className="mt-auto pt-6 md:pt-10 pb-6 md:pb-8 px-2 md:px-4 space-y-4">
                            <Button
                                variant="outline"
                                className="w-full h-12 md:h-14 justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100 shadow-sm rounded-xl md:rounded-2xl font-extrabold text-sm md:text-base transition-all active:scale-[0.98]"
                                onClick={handleSignOut}
                            >
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-rose-100/50 flex items-center justify-center mr-3 md:mr-4">
                                    <LogOut className="h-4 w-4" />
                                </div>
                                Çıkış Yap
                            </Button>
                        </div>
                    </SidebarContent>
                </Sidebar>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Mobile Header with Hamburger */}
                    <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-md shrink-0 sticky top-0 z-30">
                        <SidebarTrigger className="h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm" />
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                                VS
                            </div>
                            <span className="text-lg font-black tracking-tight text-navy-dark">Visa Stride</span>
                        </div>
                    </header>
                    <main className={`flex-1 ${noPadding ? "" : "p-4 md:p-8 lg:p-12 pt-4 md:pt-8"} overflow-auto ${noPadding ? "max-w-none" : maxWidth} mx-auto w-full`}>
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};
