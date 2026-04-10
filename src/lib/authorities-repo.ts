import { supabase } from "@/integrations/supabase/client";
import { ESSENTIAL_AUTHORITIES, type Authority } from "@/lib/authorities";

export async function fetchAuthorities(): Promise<Authority[]> {
  try {
    const client = supabase as any;
    const { data } = await client.from("authorities").select("*").order("created_at", { ascending: false });
    if (!data || data.length === 0) return ESSENTIAL_AUTHORITIES;
    return data as Authority[];
  } catch {
    return ESSENTIAL_AUTHORITIES;
  }
}

export async function createAuthority(input: Omit<Authority, "id">): Promise<Authority | null> {
  void input;
  return null;
}
