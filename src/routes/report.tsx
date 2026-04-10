import { Link, createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { Camera, Mic, FileText, MapPin, Send, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { categoryLabels, type ComplaintCategory, type UrgencyLevel } from "@/lib/sample-data";
import { getIssueAssistantAnalysis, type OutputLanguage } from "@/lib/issue-assistant";
import { createComplaintRecord } from "@/lib/complaints-repo";
import { useAuthSession } from "@/lib/auth";
import { useProfileStatus } from "@/lib/profile";
import { useAuthorities } from "@/lib/use-authorities";
import { useUserRole } from "@/lib/roles";

const categoryOptions: { value: ComplaintCategory; label: string; keywords: string[] }[] = [
  { value: 'pothole', label: '🛣️ Road/Pothole', keywords: ['pothole', 'road', 'broken', 'crack', 'divider', 'सड़क', 'गड्ढा'] },
  { value: 'stray_dogs', label: '🐕 Stray Animals', keywords: ['dog', 'kutta', 'cattle', 'cow', 'animal', 'कुत्ता', 'गाय', 'जानवर'] },
  { value: 'gender_violence', label: '🛡️ Gender Safety', keywords: ['harassment', 'eve', 'violence', 'unsafe', 'women', 'छेड़छाड़', 'महिला'] },
  { value: 'food_scarcity', label: '🍚 Food Scarcity', keywords: ['food', 'ration', 'hunger', 'wheat', 'राशन', 'खाना', 'भूख'] },
  { value: 'water', label: '💧 Water Supply', keywords: ['water', 'tap', 'contaminated', 'पानी', 'नल'] },
  { value: 'sanitation', label: '🧹 Sanitation', keywords: ['garbage', 'drain', 'sewage', 'smell', 'कूड़ा', 'नाला', 'सफाई'] },
  { value: 'electricity', label: '💡 Electricity', keywords: ['light', 'electricity', 'power', 'बिजली', 'लाइट'] },
  { value: 'other', label: '📋 Other', keywords: [] },
];

function classifyText(text: string): { category: ComplaintCategory; urgency: UrgencyLevel } {
  const lower = text.toLowerCase();
  let matched: ComplaintCategory = 'other';
  for (const opt of categoryOptions) {
    if (opt.keywords.some(kw => lower.includes(kw))) {
      matched = opt.value;
      break;
    }
  }
  const highKeywords = [
    'attack', 'dangerous', 'accident', 'injury', 'emergency', 'harassment', 'violence', 'unsafe', 'critical',
    'contaminated', 'overflow', 'aggressive', 'shock', 'fire', 'electrocution', 'collapsed', 'main road',
    'हमला', 'खतरनाक', 'आपात', 'हादसा', 'करंट', 'आग', 'गंभीर', 'दुर्घटना', 'असुरक्षित',
  ];
  const mediumKeywords = [
    'broken', 'not working', 'blocked', 'leakage', 'sewage', 'pothole', 'street light', 'water logging',
    'टूटा', 'बंद', 'रिसाव', 'नहीं चल', 'गड्ढा', 'जाम',
  ];
  const urgency: UrgencyLevel = highKeywords.some(kw => lower.includes(kw))
    ? 'high'
    : mediumKeywords.some(kw => lower.includes(kw))
      ? 'medium'
      : 'low';
  return { category: matched, urgency };
}

type AiResult = {
  category: ComplaintCategory;
  urgency: UrgencyLevel;
  normalizedTitle: string;
  normalizedDescription: string;
  translatedTitle: string;
  translatedDescription: string;
  detectedLanguage: string;
  confidence: number;
};

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report Issue — Smart Nagar Palika Complaint Box" },
      { name: "description", content: "Submit a civic complaint with photo, voice, or text. AI auto-categorizes and routes to the right authority." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { user, loading } = useAuthSession();
  const { profileComplete } = useProfileStatus();
  const { role } = useUserRole();
  const authorities = useAuthorities();
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | ''>('');
  const [location, setLocation] = useState('');
  const [ward, setWard] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>("en");
  const [aiError, setAiError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
                Please login to submit complaints and use AI-powered reporting.
              </p>
              <Link to="/auth" search={{ redirect: "/report" }}>
                <Button className="w-full">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  if (!loading && user && !profileComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Complete Profile Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please complete your profile details before filing a complaint.
              </p>
              <Link to="/profile">
                <Button className="w-full">Open Profile</Button>
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
            <CardHeader>
              <CardTitle>Citizen Feature Only</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Report Issue is available only for citizen accounts.
              </p>
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser. Try Chrome.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = outputLanguage === "hi" ? "hi-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmit = async () => {
    if (!title && !description) return;
    setStep('analyzing');
    setAiError(null);
    const text = `${title} ${description}`;
    try {
      const result = await getIssueAssistantAnalysis({
        title,
        description,
        outputLanguage,
      });
      setAiResult(result);
      if (!selectedCategory) setSelectedCategory(result.category);
      setStep('result');
    } catch (error) {
      const result = classifyText(text);
      setAiResult({
        ...result,
        normalizedTitle: title,
        normalizedDescription: description,
        translatedTitle: title,
        translatedDescription: description,
        detectedLanguage: "unknown",
        confidence: 0.4,
      });
      if (!selectedCategory) setSelectedCategory(result.category);
      if (import.meta.env.DEV) {
        const reason = error instanceof Error ? error.message : "AI request failed";
        setAiError(`AI fallback used in dev mode: ${reason}`);
      } else {
        setAiError("AI is temporarily unavailable. We used smart local analysis for now.");
      }
      setStep('result');
    }
  };

  const handleFinalSubmit = async () => {
    if (!aiResult) return;
    const created = await createComplaintRecord({
      title: aiResult.normalizedTitle || title,
      description: aiResult.normalizedDescription || description,
      category: selectedCategory || aiResult.category,
      urgency: aiResult.urgency,
      location,
      ward,
      userId: user?.id ?? "",
      reportedBy: user?.email ?? "Citizen",
    });
    alert(`Complaint submitted successfully! Track ID: ${created.id}`);
    setStep('input');
    setTitle('');
    setDescription('');
    setSelectedCategory('');
    setLocation('');
    setWard('');
    setPhoto(null);
    setAiResult(null);
    setAiError(null);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
        () => setLocation('Rohtak, Haryana')
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-[var(--font-heading)] text-3xl font-bold text-foreground">Report an Issue</h1>
          <p className="mt-2 text-muted-foreground">AI will auto-categorize and route your complaint to the right authority.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 space-y-6">
              {/* Upload actions */}
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => fileRef.current?.click()}>
                  <Camera className="h-6 w-6 text-primary" />
                  <span className="text-xs">Photo</span>
                </Button>
                <Button variant="outline" className={`h-20 flex-col gap-2 ${isListening ? 'border-urgent text-urgent' : ''}`} onClick={handleVoice}>
                  <Mic className={`h-6 w-6 ${isListening ? 'text-urgent animate-pulse' : 'text-primary'}`} />
                  <span className="text-xs">{isListening ? 'Listening...' : 'Voice'}</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => fileRef.current?.click()}>
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="text-xs">Scan Paper</span>
                </Button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

              {photo && (
                <div className="overflow-hidden rounded-xl border border-border">
                  <img src={photo} alt="Uploaded" className="h-48 w-full object-cover" />
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Issue Title</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Large pothole on main road"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail (Hindi or English)..."
                    rows={4}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Preferred Output Language</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOutputLanguage("en")}
                      className={`rounded-lg border p-2 text-sm transition-colors ${outputLanguage === "en" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground hover:bg-muted/50"}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setOutputLanguage("hi")}
                      className={`rounded-lg border p-2 text-sm transition-colors ${outputLanguage === "hi" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground hover:bg-muted/50"}`}
                    >
                      Hindi
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Location</label>
                    <div className="flex gap-2">
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Area / Landmark"
                        className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                      <Button variant="outline" size="icon" onClick={getLocation} title="Use GPS">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Ward</label>
                    <select
                      value={ward}
                      onChange={e => setWard(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <option value="">Select Ward</option>
                      {Array.from({ length: 20 }, (_, i) => (
                        <option key={i} value={`Ward ${i + 1}`}>Ward {i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Category (optional — AI will suggest)</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {categoryOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedCategory(opt.value)}
                        className={`rounded-lg border p-2 text-center text-xs transition-colors ${selectedCategory === opt.value ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border text-muted-foreground hover:bg-muted/50'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleSubmit} size="lg" className="w-full gap-2" disabled={!title && !description}>
                <Send className="h-4 w-4" />
                Submit, Analyze & Translate with AI
              </Button>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
              <p className="mt-6 font-[var(--font-heading)] text-xl font-semibold text-foreground">AI is analyzing your complaint...</p>
              <p className="mt-2 text-sm text-muted-foreground">Classifying category, urgency, and finding the right authority</p>
            </motion.div>
          )}

          {step === 'result' && aiResult && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8">
              <Card className="border-success/30 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    AI Analysis Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiError && (
                    <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground">
                      {aiError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Detected Category</p>
                      <p className="mt-1 text-lg font-semibold">{categoryLabels[aiResult.category]}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Urgency Level</p>
                      <div className="mt-1 flex items-center gap-2">
                        {aiResult.urgency === 'high' && <AlertTriangle className="h-5 w-5 text-urgent" />}
                        <span className={`text-lg font-semibold capitalize ${aiResult.urgency === 'high' ? 'text-urgent' : aiResult.urgency === 'medium' ? 'text-warning' : 'text-muted-foreground'}`}>{aiResult.urgency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">AI Normalized Complaint</p>
                    <p className="mt-1 font-semibold text-foreground">{aiResult.normalizedTitle || "Untitled issue"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{aiResult.normalizedDescription}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">
                      Translated ({outputLanguage === "hi" ? "Hindi" : "English"}) • Detected Language: {aiResult.detectedLanguage} • Confidence: {(aiResult.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="mt-1 font-semibold text-foreground">{aiResult.translatedTitle || "Untitled issue"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{aiResult.translatedDescription}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Auto-Assigned Authority</p>
                    {authorities.filter((a) => a.category === (selectedCategory || aiResult.category)).length > 0 ? (
                      <>
                        <p className="mt-1 font-semibold text-primary">
                          {authorities.find((a) => a.category === (selectedCategory || aiResult.category))?.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {authorities.find((a) => a.category === (selectedCategory || aiResult.category))?.contact}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">
                        No authority deployed yet for this category. Officer will deploy from dashboard.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleFinalSubmit} className="flex-1 gap-2" variant="hero" size="lg">
                      <CheckCircle className="h-4 w-4" />
                      Confirm & Submit
                    </Button>
                    <Button onClick={() => setStep('input')} variant="outline" size="lg">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
