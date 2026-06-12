import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Users, LayoutDashboard, MapPin, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

type DemoRole = "attendee" | "organizer" | null;

export default function Login() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<DemoRole>(null);

  // If already authenticated, redirect based on role
  if (isAuthenticated && user) {
    const target = user.role === "admin" ? "/organizer" : "/attendee";
    navigate(target);
    return null;
  }

  const handleDemoLogin = (role: DemoRole) => {
    setSelectedRole(role);
    // Store the selected demo role in sessionStorage for the platform to read
    sessionStorage.setItem("demo_role", role ?? "");
    navigate(role === "organizer" ? "/organizer" : "/attendee");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full opacity-20" style={{ background: "oklch(0.55 0.22 290 / 0.15)", filter: "blur(80px)" }} />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full opacity-20" style={{ background: "oklch(0.62 0.18 200 / 0.15)", filter: "blur(80px)" }} />
        <div className="absolute top-[40%] left-[50%] w-48 h-48 rounded-full opacity-10" style={{ background: "oklch(0.55 0.22 290 / 0.1)", filter: "blur(60px)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        {/* Brand */}
        <div className="text-center space-y-2">
          <h1 className="brand-title text-3xl">EventFlow</h1>
          <p className="text-muted-foreground text-sm">Navigate events effortlessly</p>
        </div>

        {/* Demo Account Cards */}
        <div className="w-full space-y-3">
          <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider">Choose your journey</p>

          {/* Attendee Card */}
          <button
            onClick={() => handleDemoLogin("attendee")}
            className={`w-full glass-card p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${selectedRole === "attendee" ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-brand)" }}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Attendee</span>
                  <span className="pill text-[10px]">Demo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Experience the event as a participant — map wayfinding, check-in, voice assistant, networking, and smart suggestions.
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Sarah Chen</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">VP Engineering</span>
                </div>
              </div>
            </div>
          </button>

          {/* Organizer Card */}
          <button
            onClick={() => handleDemoLogin("organizer")}
            className={`w-full glass-card p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${selectedRole === "organizer" ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, oklch(0.62 0.18 200), oklch(0.50 0.20 170))" }}>
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Organizer</span>
                  <span className="pill text-[10px]">Demo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Manage the event — live attendance dashboard, check-in monitoring, request queue, and WhatsApp message forwarding.
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Event Admin</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">TechSummit 2026</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* OAuth Login */}
        <Button
          variant="outline"
          className="w-full h-11 text-sm font-medium glass"
          onClick={() => { window.location.href = getLoginUrl(); }}
        >
          <Users className="w-4 h-4 mr-2" />
          Sign in with Manus Account
        </Button>

        {/* Footer */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>Powered by AI · Maps · Voice</span>
          </div>
        </div>
      </div>
    </div>
  );
}
