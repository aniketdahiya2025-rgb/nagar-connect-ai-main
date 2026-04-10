import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal">
                <MapPin className="h-4 w-4 text-teal-foreground" />
              </div>
              <span className="font-[var(--font-heading)] font-bold">Smart Nagar Palika</span>
            </div>
            <p className="mt-3 text-sm text-navy-foreground/60">
              AI-powered civic complaint portal for Haryana smart cities.
            </p>
          </div>
          <div>
            <h4 className="font-[var(--font-heading)] font-semibold">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-foreground/60">
              <li>Report Issue</li>
              <li>Track Complaint</li>
              <li>Dashboard</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-[var(--font-heading)] font-semibold">Emergency</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-foreground/60">
              <li>Police: 100</li>
              <li>Women Helpline: 181</li>
              <li>Fire: 101</li>
              <li>Ambulance: 108</li>
            </ul>
          </div>
          <div>
            <h4 className="font-[var(--font-heading)] font-semibold">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-foreground/60">
              <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> +91-1262-234567</li>
              <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> complaints@nagarpalika.in</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-navy-foreground/10 pt-6 text-center text-xs text-navy-foreground/40">
          © 2026 Smart Nagar Palika Complaint Box — Rohtak &amp; Panipat, Haryana
        </div>
      </div>
    </footer>
  );
}
