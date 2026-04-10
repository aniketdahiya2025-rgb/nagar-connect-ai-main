import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/lib/auth";
import type { UserRole } from "@/lib/roles";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Rohtak");
  const [role, setRole] = useState<UserRole>("citizen");
  const [officerId, setOfficerId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { session, loading } = useAuthSession();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();

  const redirectTo = useMemo(() => {
    if (!redirect || !redirect.startsWith("/")) return "/";
    return redirect;
  }, [redirect]);

  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: redirectTo as "/" });
    }
  }, [loading, session, navigate, redirectTo]);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        setMessage("Login successful.");
        void navigate({ to: redirectTo as "/" });
      }
    } else {
      if (!fullName.trim() || !phone.trim() || !city.trim()) {
        setError("Please add full name, phone, and city.");
        setBusy(false);
        return;
      }
      if (role === "department_officer" && (!officerId.trim() || !departmentName.trim())) {
        setError("Officer signup requires Officer ID and Department Name.");
        setBusy(false);
        return;
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            city: city.trim(),
            role,
            officer_id: role === "department_officer" ? officerId.trim() : undefined,
            department_name: role === "department_officer" ? departmentName.trim() : undefined,
          },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage("Account created. If email confirmation is enabled, verify your email first.");
      }
    }

    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>{mode === "login" ? "Login to Nagar Connect" : "Create your account"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>
                Login
              </Button>
              <Button variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>
                Sign Up
              </Button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="At least 6 characters"
              />
            </div>
            {mode === "signup" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Signup As</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={role === "citizen" ? "default" : "outline"} onClick={() => setRole("citizen")}>
                      Citizen
                    </Button>
                    <Button variant={role === "department_officer" ? "default" : "outline"} onClick={() => setRole("department_officer")}>
                      Officer
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="+91..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Rohtak / Panipat"
                  />
                </div>
                {role === "department_officer" && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Officer ID</label>
                      <input
                        value={officerId}
                        onChange={(e) => setOfficerId(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        placeholder="Official employee / officer ID"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Department Name</label>
                      <input
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        placeholder="Municipal / PHED / Electricity etc."
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            {message && <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">{message}</div>}

            <Button onClick={handleSubmit} className="w-full" disabled={busy || !email || !password}>
              {busy ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
