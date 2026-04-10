import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { NewsTicker } from "@/components/NewsTicker";
import { StatsGrid } from "@/components/StatsGrid";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Nagar Palika Complaint Box — Rohtak & Panipat" },
      { name: "description", content: "AI-powered civic complaint portal for Haryana smart cities. Report potholes, stray animals, safety issues and track resolution in real-time." },
      { property: "og:title", content: "Smart Nagar Palika Complaint Box" },
      { property: "og:description", content: "AI-powered civic complaint portal for Haryana smart cities." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <NewsTicker />
      <HeroSection />
      <StatsGrid />
      <Footer />
    </div>
  );
}
