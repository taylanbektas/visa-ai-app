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
      // Default to 'user' role ONLY if they have no other roles
      if (dbRoles.length === 0) {
        dbRoles = ["user"];
      }

      setRoles(dbRoles);
      setLoading(false);
    };

    fetchRoles();
  }, [user, authLoading]);

  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator");
  const isAgency = roles.includes("agency");
  const isUser = !isAdmin && !isModerator && !isAgency;

  const getPanelPath = () => {
    if (isAdmin) return "/admin";
    if (isModerator) return "/advisor";
    if (isAgency) return "/agency";
    return "/dashboard";
  };

  return { roles, isAdmin, isModerator, isAgency, isUser, loading: loading || authLoading, getPanelPath };
}
