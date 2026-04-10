import { useMemo } from "react";
import { useAuthSession } from "@/lib/auth";

export type ProfileMetadata = {
  role?: "citizen" | "department_officer" | "admin";
  officer_id?: string;
  department_name?: string;
  full_name?: string;
  phone?: string;
  city?: string;
  address?: string;
  ward?: string;
  preferred_language?: "en" | "hi";
};

export function isProfileComplete(meta?: ProfileMetadata | null): boolean {
  if (!meta) return false;
  return Boolean(
    meta.full_name?.trim() &&
      meta.phone?.trim() &&
      meta.city?.trim() &&
      meta.address?.trim() &&
      meta.ward?.trim() &&
      meta.preferred_language
  );
}

export function useProfileStatus() {
  const { user } = useAuthSession();
  const metadata = (user?.user_metadata ?? {}) as ProfileMetadata;

  return useMemo(
    () => ({
      metadata,
      profileComplete: isProfileComplete(metadata),
    }),
    [metadata]
  );
}
