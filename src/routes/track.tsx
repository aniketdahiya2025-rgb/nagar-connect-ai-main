import { Link, createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabels, urgencyColors, statusColors } from "@/lib/sample-data";
import { useComplaints } from "@/lib/use-complaints";
import { useState } from "react";
import { useAuthSession } from "@/lib/auth";
import { useUserRole } from "@/lib/roles";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Clock, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Complaints — Smart Nagar Palika" },
      { name: "description", content: "Track the status of your civic complaints in real-time." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { user, loading } = useAuthSession();
  const { role } = useUserRole();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const complaints = useComplaints();

  const myComplaints = complaints.filter((c) => c.userId === user?.id);

  const filtered = myComplaints.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterUrgency !== 'all' && c.urgency !== filterUrgency) return false;
    return true;
  });

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-16">
          <Card>
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">Please login to track your complaints.</p>
              <Link to="/auth" search={{ redirect: "/track" }}>
                <Button className="w-full">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  if (!loading && (role === "department_officer" || role === "admin")) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-16">
          <Card>
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">Track Complaints is available only for citizen accounts.</p>
              <Link to="/dashboard">
                <Button className="w-full">Go to Officer Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-[var(--font-heading)] text-3xl font-bold text-foreground">Track Complaints</h1>
          <p className="mt-2 text-muted-foreground">Monitor your complaint status and authority deployment updates.</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or location..."
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none"
          >
            <option value="all">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{filtered.length} complaint{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Complaint list */}
        <div className="mt-4 space-y-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-shadow hover:shadow-navy ${expanded === c.id ? 'ring-2 ring-primary/30' : ''}`}
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{categoryLabels[c.category]?.split(' ')[0]}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-[var(--font-heading)] font-semibold text-foreground">{c.title}</h3>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === c.id ? 'rotate-90' : ''}`} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`text-[10px] ${urgencyColors[c.urgency]}`}>{c.urgency}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[c.status]}`}>{c.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>

                  {expanded === c.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-4 space-y-3 border-t border-border pt-4"
                    >
                      <p className="text-sm text-foreground">{c.description}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground">Ward</span>
                          <p className="font-medium">{c.ward}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Reported By</span>
                          <p className="font-medium">{c.reportedBy}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Assigned To</span>
                          <p className="font-medium text-primary">{c.assignedTo || 'Unassigned'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Last Updated</span>
                          <p className="font-medium">{new Date(c.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {/* Status timeline */}
                      <div className="flex items-center gap-2">
                        {['pending', 'assigned', 'in_progress', 'resolved'].map((s, idx) => {
                          const statusOrder = ['pending', 'assigned', 'in_progress', 'resolved'];
                          const currentIdx = statusOrder.indexOf(c.status);
                          const active = idx <= currentIdx;
                          return (
                            <div key={s} className="flex items-center gap-2">
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {idx + 1}
                              </div>
                              {idx < 3 && <div className={`h-0.5 w-6 ${active && idx < currentIdx ? 'bg-primary' : 'bg-muted'}`} />}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No complaints found for your account yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
