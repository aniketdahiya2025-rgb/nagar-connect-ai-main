import { useEffect, useState } from "react";
import { getComplaints } from "@/lib/complaints-store";
import { fetchComplaints } from "@/lib/complaints-repo";
import type { Complaint } from "@/lib/sample-data";
import { useAuthSession } from "@/lib/auth";
import { useUserRole } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";

export function useComplaints(): Complaint[] {
  const { user } = useAuthSession();
  const { canAccessDashboard } = useUserRole();
  const [complaints, setComplaints] = useState<Complaint[]>(() => getComplaints());

  useEffect(() => {
    const refresh = async () => {
      const next = await fetchComplaints(user?.id, canAccessDashboard);
      setComplaints(next.length ? next : getComplaints());
    };
    void refresh();

    const suffix =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    const channel = supabase
      .channel(`complaints-realtime-${user?.id ?? "guest"}-${canAccessDashboard ? "officer" : "citizen"}-${suffix}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => {
          void refresh();
        }
      )
      .subscribe();

    window.addEventListener("complaints:updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      void supabase.removeChannel(channel);
      window.removeEventListener("complaints:updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [user?.id, canAccessDashboard]);

  return complaints;
}
