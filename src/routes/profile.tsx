import { Link, createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useProfileStatus } from "@/lib/profile";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuthSession();
  const { metadata, profileComplete } = useProfileStatus();
  const [address, setAddress] = useState("");
  const [ward, setWard] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "hi">("en");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    setAddress(metadata.address ?? "");
    setWard(metadata.ward ?? "");
    setPreferredLanguage((metadata.preferred_language as "en" | "hi") ?? "en");
  }, [metadata]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileMessage(null);
    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        address: address.trim(),
        ward: ward.trim(),
        preferred_language: preferredLanguage,
      },
    });
    if (error) {
      setProfileMessage(error.message);
    } else {
      setProfileMessage("Profile updated successfully.");
    }
    setSavingProfile(false);
  };

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
              <p className="text-sm text-muted-foreground">Please login to view and update your profile.</p>
              <Link to="/auth" search={{ redirect: "/profile" }}>
                <Button className="w-full">Go to Login</Button>
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
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
            <p className="text-muted-foreground pt-2">Full Name</p>
            <p className="font-medium">{metadata.full_name || "Not set"}</p>
            <p className="text-muted-foreground pt-2">Phone</p>
            <p className="font-medium">{metadata.phone || "Not set"}</p>
            <p className="text-muted-foreground pt-2">City</p>
            <p className="font-medium">{metadata.city || "Not set"}</p>
            <p className="text-muted-foreground pt-2">Role</p>
            <p className="font-medium">{metadata.role || "citizen"}</p>
            {(metadata.role === "department_officer" || metadata.role === "admin") && (
              <>
                <p className="text-muted-foreground pt-2">Officer ID</p>
                <p className="font-medium">{metadata.officer_id || "Not set"}</p>
                <p className="text-muted-foreground pt-2">Department</p>
                <p className="font-medium">{metadata.department_name || "Not set"}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complete Profile (Required to File Complaints)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="House / street / landmark"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Ward</label>
              <input
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Ward 8"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Preferred Language</label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={preferredLanguage === "en" ? "default" : "outline"} onClick={() => setPreferredLanguage("en")}>
                  English
                </Button>
                <Button variant={preferredLanguage === "hi" ? "default" : "outline"} onClick={() => setPreferredLanguage("hi")}>
                  Hindi
                </Button>
              </div>
            </div>
            <Button onClick={saveProfile} disabled={savingProfile} className="w-full">
              {savingProfile ? "Saving..." : "Save Profile Details"}
            </Button>
            {profileMessage && <p className="text-sm text-muted-foreground">{profileMessage}</p>}
            <div className="rounded-lg border border-border p-3 text-sm">
              Profile Completion:{" "}
              <span className={`font-semibold ${profileComplete ? "text-success" : "text-warning"}`}>
                {profileComplete ? "Complete" : "Incomplete"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Based Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Role is assigned during signup and cannot be toggled here.</p>
            <div className="rounded-lg border border-border p-3 text-sm">
              Current Role: <span className="font-semibold">{metadata.role || "citizen"}</span>
              <div className="mt-1 text-muted-foreground">
                Dashboard Access: {(metadata.role === "department_officer" || metadata.role === "admin") ? "Allowed" : "Not allowed"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
