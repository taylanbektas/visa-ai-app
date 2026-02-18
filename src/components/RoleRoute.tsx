import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface RoleRouteProps {
    allowedRoles: ("admin" | "moderator" | "user")[];
    redirectTo?: string;
}

export function RoleRoute({ allowedRoles, redirectTo = "/" }: RoleRouteProps) {
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

    // If user has NO role (or role not loaded yet effectively), treat as 'user' usually, but here we check strictly.
    // Our hook returns 'user' by default if no role found in DB? Let's check hook logic if possible, assuming 'user' is default.
    // If allowedRoles includes the user's role, render outlet.

    // Note: 'moderator' in DB is often mapped to 'Advisor' in UI terms.

    // Check if any of the user's roles are in the allowedRoles list
    const hasAllowedRole = roles.some(r => allowedRoles.includes(r));

    if (hasAllowedRole) {
        return <Outlet />;
    }

    return <Navigate to={redirectTo} replace />;
}
