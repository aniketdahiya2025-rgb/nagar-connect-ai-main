import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryLabels, urgencyColors, statusColors, type Complaint } from "@/lib/sample-data";
import { useComplaints } from "@/lib/use-complaints";
import { useAuthorities } from "@/lib/use-authorities";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Building2 } from "lucide-react";

function StatCard({ icon: Icon, label, value, trend, delay }: { icon: React.ElementType; label: string; value: string | number; trend?: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="group transition-shadow hover:shadow-navy">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {trend && <p className="text-xs text-success">{trend}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RecentIssueRow({ complaint }: { complaint: Complaint }) {
  return (
    <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
      <span className="text-xl">{categoryLabels[complaint.category]?.split(' ')[0]}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{complaint.title}</p>
        <p className="text-xs text-muted-foreground">{complaint.location}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge className={`text-[10px] ${urgencyColors[complaint.urgency]}`}>{complaint.urgency}</Badge>
        <Badge variant="outline" className={`text-[10px] ${statusColors[complaint.status]}`}>{complaint.status.replace('_', ' ')}</Badge>
      </div>
    </div>
  );
}

export function StatsGrid() {
  const complaints = useComplaints();
  const authorities = useAuthorities();
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const highUrgency = complaints.filter(c => c.urgency === 'high').length;
  const pending = complaints.filter(c => c.status === 'pending').length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
        <h2 className="font-[var(--font-heading)] text-3xl font-bold text-foreground">Live City Dashboard</h2>
        <p className="mt-2 text-muted-foreground">Real-time civic issue tracking for Rohtak & Panipat</p>
      </motion.div>

      {/* Bento Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={AlertTriangle} label="Total Reports" value={total} trend="+12% this week" delay={0.1} />
        <StatCard icon={CheckCircle} label="Resolved" value={resolved} delay={0.15} />
        <StatCard icon={Clock} label="Pending" value={pending} delay={0.2} />
        <StatCard icon={TrendingUp} label="High Urgency" value={highUrgency} delay={0.25} />
      </div>

      {/* Bento: Recent + NGOs */}
      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-[var(--font-heading)] text-lg font-semibold">Recent Issues</h3>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              <div className="space-y-1">
                {complaints.slice(0, 5).map(c => (
                  <RecentIssueRow key={c.id} complaint={c} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-[var(--font-heading)] text-lg font-semibold">Partner Agencies</h3>
              </div>
              <div className="space-y-3">
                {authorities.slice(0, 6).map((authority) => (
                  <div key={authority.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{authority.name}</p>
                      <p className="text-xs text-muted-foreground">{authority.area}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-primary">{authority.contact}</p>
                      <p className="text-[10px] text-muted-foreground">{authority.type}</p>
                    </div>
                  </div>
                ))}
                {authorities.length === 0 && <p className="text-sm text-muted-foreground">No authorities deployed yet.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category breakdown bento */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 font-[var(--font-heading)] text-lg font-semibold">Issues by Category</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(Object.entries(categoryLabels) as [string, string][]).map(([key, label]) => {
                const count = complaints.filter(c => c.category === key).length;
                return (
                  <div key={key} className="rounded-xl border border-border p-4 text-center transition-colors hover:bg-muted/50">
                    <span className="text-2xl">{label.split(' ')[0]}</span>
                    <p className="mt-1 text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{label.split(' ').slice(1).join(' ')}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
