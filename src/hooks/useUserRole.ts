import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      let dbRoles = data?.map((r) => r.role) ?? [];
      // Default to 'user' role if authenticated
      if (!dbRoles.includes("admin") && !dbRoles.includes("moderator") && !dbRoles.includes("user")) {
        dbRoles = [...dbRoles, "user"];
      }

      setRoles(dbRoles);
      setLoading(false);
    };

    fetchRoles();
  }, [user, authLoading]);

  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator");
  const isUser = !isAdmin && !isModerator;

  const getPanelPath = () => {
    if (isAdmin) return "/admin";
    if (isModerator) return "/advisor";
    return "/dashboard";
  };

  return { roles, isAdmin, isModerator, isUser, loading: loading || authLoading, getPanelPath };
}
