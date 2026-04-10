import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/lib/auth";
import { useUserRole } from "@/lib/roles";
import { useComplaints } from "@/lib/use-complaints";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useAuthSession();
  const { canAccessDashboard, role } = useUserRole();
  const complaints = useComplaints();

  const notifications = useMemo(() => {
    if (!user) return [];
    if (role === "department_officer" || role === "admin") {
      return complaints
        .filter((c) => c.status === "pending")
        .slice(0, 8)
        .map((c) => `New complaint: ${c.title}`);
    }
    return complaints
      .filter((c) => c.status !== "pending" || Boolean(c.assignedTo))
      .slice(0, 8)
      .map((c) => {
        if (c.status === "cancelled") {
          return `Update on ${c.id}: cancelled by officer`;
        }
        return `Update on ${c.id}: ${c.status.replace("_", " ")}${c.assignedTo ? ` • ${c.assignedTo}` : ""}`;
      });
  }, [complaints, role, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="font-[var(--font-heading)] text-lg font-bold text-foreground">Smart Nagar Palika</span>
            <span className="ml-1 text-xs text-muted-foreground">Complaint Box</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground bg-muted" }}>Home</Link>
          {role === "citizen" && (
            <Link to="/report" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground bg-muted" }}>Report Issue</Link>
          )}
          {role === "citizen" && (
            <Link to="/track" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground bg-muted" }}>Track</Link>
          )}
          {canAccessDashboard && (
            <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground bg-muted" }}>Dashboard</Link>
          )}
          {user && (
            <Link to="/profile" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground bg-muted" }}>Profile</Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            {lang === 'en' ? 'हिंदी' : 'ENG'}
          </button>
          <Button variant="ghost" size="icon" className="relative" onClick={() => setNotificationsOpen((v) => !v)}>
            <Bell className="h-4 w-4" />
            {user && notifications.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-urgent text-[10px] text-urgent-foreground">
                {Math.min(notifications.length, 9)}
              </span>
            )}
          </Button>
          {notificationsOpen && (
            <div className="absolute right-4 top-14 z-50 w-80 rounded-lg border border-border bg-background p-3 shadow-lg">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                {role === "department_officer" || role === "admin" ? "New complaints" : "Complaint updates"}
              </p>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No new notifications.</p>
                ) : (
                  notifications.map((note, idx) => (
                    <p key={`${idx}-${note}`} className="rounded-md border border-border p-2 text-xs text-foreground">
                      {note}
                    </p>
                  ))
                )}
              </div>
            </div>
          )}
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-40 truncate text-xs text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Login
              </Button>
            </Link>
          )}
          {role === "citizen" && (
            <Link to="/report">
              <Button variant="hero" size="sm" className="hidden sm:flex">
                Report Issue
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link to="/" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Home</Link>
            {role === "citizen" && (
              <Link to="/report" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Report Issue</Link>
            )}
            {role === "citizen" && (
              <Link to="/track" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Track</Link>
            )}
            {canAccessDashboard && (
              <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
            {user && (
              <Link to="/profile" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Profile</Link>
            )}
            {user ? (
              <button
                onClick={async () => {
                  await handleLogout();
                  setMobileOpen(false);
                }}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted"
              >
                Logout
              </button>
            ) : (
              <Link to="/auth" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
