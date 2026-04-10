import { useEffect, useState } from "react";
import type { Authority } from "@/lib/authorities";
import { fetchAuthorities } from "@/lib/authorities-repo";

export function useAuthorities() {
  const [authorities, setAuthorities] = useState<Authority[]>([]);

  useEffect(() => {
    const load = async () => {
      const rows = await fetchAuthorities();
      setAuthorities(rows);
    };
    void load();
  }, []);

  return authorities;
}
