import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Camera, Mic, FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroCityImg from "@/assets/hero-city.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient px-4 py-20 lg:py-28">
      {/* Background image */}
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <img src={heroCityImg} alt="" className="h-full w-full object-cover" width={1920} height={800} />
      </div>
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-sm font-medium text-teal">
              🏛️ Haryana Smart City Initiative
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-3xl font-[var(--font-heading)] text-4xl font-bold leading-tight text-navy-foreground sm:text-5xl lg:text-6xl"
          >
            Your City, Your Voice.{" "}
            <span className="text-teal">Report. Track. Resolve.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-navy-foreground/70"
          >
            AI-powered civic complaint portal for Rohtak, Panipat & Haryana towns. Report potholes, stray animals, safety concerns — get instant routing to the right authority.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/report">
              <Button variant="hero" size="xl" className="gap-2">
                <Camera className="h-5 w-5" />
                Report an Issue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/track">
              <Button variant="outline" size="lg" className="border-navy-foreground/20 text-navy-foreground hover:bg-navy-foreground/10">
                Track Complaints
              </Button>
            </Link>
          </motion.div>

          {/* Quick action cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-14 grid w-full max-w-2xl grid-cols-3 gap-3"
          >
            {[
              { icon: Camera, label: "Photo Report", desc: "Snap & submit" },
              { icon: Mic, label: "Voice Report", desc: "Speak in Hindi/English" },
              { icon: FileText, label: "Scan Paper", desc: "OCR survey forms" },
            ].map((item) => (
              <Link to="/report" key={item.label}>
                <div className="glass-card group cursor-pointer rounded-xl p-4 text-center transition-all hover:bg-navy-foreground/10">
                  <item.icon className="mx-auto h-8 w-8 text-teal transition-transform group-hover:scale-110" />
                  <p className="mt-2 font-[var(--font-heading)] text-sm font-semibold text-navy-foreground">{item.label}</p>
                  <p className="text-xs text-navy-foreground/60">{item.desc}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
