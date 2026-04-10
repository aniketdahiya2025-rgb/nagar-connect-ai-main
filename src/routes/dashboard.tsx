import { Link, createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categoryLabels } from "@/lib/sample-data";
import { useComplaints } from "@/lib/use-complaints";
import { useAuthSession } from "@/lib/auth";
import { useUserRole } from "@/lib/roles";
import { useAuthorities } from "@/lib/use-authorities";
import { cancelComplaintByOfficer, deployComplaintAuthority } from "@/lib/complaints-repo";
import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Send, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Nagar Palika" },
      { name: "description", content: "Analytics and management dashboard for civic complaints." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuthSession();
  const { canAccessDashboard } = useUserRole();
  const complaints = useComplaints();
  const authorities = useAuthorities();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedAuthorities, setSelectedAuthorities] = useState<Record<string, string>>({});
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "resolved").length;
  const pending = complaints.filter(c => c.status === "pending").length;
  const assigned = complaints.filter(c => c.status === "assigned").length;
  const highUrgency = complaints.filter(c => c.urgency === 'high').length;

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please login to access the analytics dashboard.
              </p>
              <Link to="/auth" search={{ redirect: "/dashboard" }}>
                <Button className="w-full">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!loading && user && !canAccessDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Dashboard is available for Department Officer and Admin roles only. Choose officer role during signup.
              </p>
              <Link to="/auth">
                <Button className="w-full">Go to Login / Signup</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleDeploy = async (complaintId: string, category: string) => {
    const selectedId = selectedAuthorities[complaintId];
    const selected =
      (selectedId && authorities.find((a) => a.id === selectedId)) ||
      authorities.find((a) => a.category === category);
    if (!selected) {
      setActionMessage("No authority available for this category.");
      return;
    }
    const ok = await deployComplaintAuthority(complaintId, selected.name);
    setActionMessage(ok ? "Complaint deployed to authority." : "Failed to deploy complaint.");
  };

  const handleCancel = async (complaintId: string) => {
    const ok = await cancelComplaintByOfficer(complaintId);
    setActionMessage(ok ? "Complaint request cancelled." : "Failed to cancel complaint.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-[var(--font-heading)] text-3xl font-bold text-foreground">Officer Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Create authorities and deploy citizen complaints in real time.</p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock, label: "Total", value: total, color: "text-primary" },
            { icon: Clock, label: 'Pending', value: pending, color: 'text-warning' },
            { icon: Send, label: 'Assigned', value: assigned, color: 'text-accent' },
            { icon: CheckCircle, label: 'Resolved', value: resolved, color: 'text-success' },
            { icon: AlertTriangle, label: "High Urgency", value: highUrgency, color: "text-urgent" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Essential Authorities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {authorities.map((authority) => (
                  <div key={authority.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-semibold">{authority.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {authority.type} • {authority.area} • {authority.contact}
                    </p>
                    <p className="text-xs text-primary mt-1">{categoryLabels[authority.category as keyof typeof categoryLabels]}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5 text-warning" />
                  Deploy Complaints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {complaints.filter((c) => c.status === "pending").slice(0, 8).map((c) => (
                  <div key={c.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{categoryLabels[c.category]}</p>
                    <p className="text-xs text-muted-foreground mt-1">Select authority for assignment</p>
                    <select
                      value={selectedAuthorities[c.id] ?? ""}
                      onChange={(e) => setSelectedAuthorities((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Auto-select by category</option>
                      {authorities
                        .filter((a) => a.category === c.category)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                    </select>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => void handleDeploy(c.id, c.category)}>
                        Assign
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void handleCancel(c.id)}>
                        Cancel Request
                      </Button>
                    </div>
                  </div>
                ))}
                {complaints.filter((c) => c.status === "pending").length === 0 && (
                  <p className="text-sm text-muted-foreground">No pending complaints.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        {actionMessage && <p className="mt-4 text-sm text-muted-foreground">{actionMessage}</p>}
      </div>
      <Footer />
    </div>
  );
}
