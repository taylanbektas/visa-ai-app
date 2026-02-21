import { useEffect, useRef } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

type AppRole = "admin" | "moderator" | "user" | "agency";

interface RoleRouteProps {
    allowedRoles: AppRole[];
    /** Roles that are never allowed on this route (e.g. agency on customer dashboard). */
    blockedRoles?: AppRole[];
    redirectTo?: string;
    /** If true, on unauthorized access: sign out, show invalid credentials toast, redirect to login. */
    showInvalidCredentials?: boolean;
}

function UnauthorizedRedirect() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useLanguage();
    const done = useRef(false);

    useEffect(() => {
        if (done.current) return;
        done.current = true;
        (async () => {
            await signOut();
            toast({
                title: t("auth.login_failed"),
                description: t("auth.invalid_credentials"),
                variant: "destructive",
            });
            navigate("/login", { replace: true });
        })();
    }, [signOut, toast, navigate, t]);

    return (
        <div className="flex bg-slate-50 h-screen items-center justify-center">
            <Loader2 className="animate-spin text-navy-dark" size={32} />
        </div>
    );
}

export function RoleRoute({ allowedRoles, blockedRoles = [], redirectTo = "/", showInvalidCredentials = false }: RoleRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const { roles, loading: roleLoading } = useUserRole();

    if (authLoading || roleLoading) {
        return (
            <div className="flex bg-slate-50 h-screen items-center justify-center">
                <Loader2 className="animate-spin text-navy-dark" size={32} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const hasBlockedRole = blockedRoles.length > 0 && roles.some((r) => blockedRoles.includes(r));
    const hasAllowedRole = roles.some((r) => allowedRoles.includes(r));

    if (hasBlockedRole || !hasAllowedRole) {
        if (showInvalidCredentials) {
            return <UnauthorizedRedirect />;
        }
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}
