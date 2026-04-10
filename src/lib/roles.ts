import { useEffect, useState } from "react";
import { useAuthSession } from "@/lib/auth";

export type UserRole = "citizen" | "department_officer" | "admin";

const DEFAULT_ROLE: UserRole = "citizen";

export function normalizeRole(value: unknown): UserRole {
  if (value === "department_officer" || value === "admin" || value === "citizen") {
    return value;
  }
  return DEFAULT_ROLE;
}

export function useUserRole() {
  const { user, loading } = useAuthSession();
  const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);

  useEffect(() => {
    if (!user) {
      setRole(DEFAULT_ROLE);
      return;
    }
    setRole(normalizeRole(user.user_metadata?.role));
  }, [user]);

  return {
    role,
    loading,
    isAdmin: role === "admin",
    isOfficer: role === "department_officer",
    canAccessDashboard: role === "admin" || role === "department_officer",
  };
}
