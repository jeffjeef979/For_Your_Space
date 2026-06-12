import { useState, useRef, useEffect, useMemo } from "react";
import { MapView } from "@/components/Map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  MapPin, Navigation, Mic, MicOff, Users, Calendar, Wifi,
  TableProperties, Clock, CheckCircle2, Linkedin, Instagram,
  UserCheck, Radio, ChevronRight, Loader2, MessageSquare,
  Activity, Star, ExternalLink, Route, Brain, Sparkles,
  Building2, GraduationCap, Briefcase, ArrowRight, Globe,
  Car, Bus, Timer, AlertTriangle, ThumbsUp, Search,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = "attendee" | "organizer";
type AttendeeTab = "map" | "events" | "voice" | "network" | "checkin" | "commute" | "suggest";
type CheckInStep = "arrival" | "wifi" | "table" | "timeline";

// ─── Demo Data ───────────────────────────────────────────────────────────────

const DEMO_EVENT = {
  id: 1,
  title: "TechSummit 2026",
  venueName: "Marina Bay Sands Expo",
  venueAddress: "10 Bayfront Ave, Singapore 018956",
  venueLat: 1.2834,
  venueLng: 103.8607,
  startTime: "2026-06-12T09:00:00",
  endTime: "2026-06-12T18:00:00",
  wifiSsid: "TechSummit_2026",
  wifiPassword: "TS2026#Secure!",
  attendeeCount: 342,
  rsvpCount: 400,
};

const DEMO_EVENTS = [
  { id: 1, title: "TechSummit 2026", venue: "Marina Bay Sands Expo", venueAddress: "10 Bayfront Ave, Singapore", time: "Today, 9:00 AM – 6:00 PM", status: "active", attendees: 342, rsvp: true, lat: 1.2834, lng: 103.8607, tags: ["AI", "Engineering", "Product"] },
  { id: 2, title: "AI & Future of Work", venue: "Suntec City Hall 4", venueAddress: "1 Raffles Blvd, Singapore", time: "Jun 18, 2:00 PM – 5:00 PM", status: "upcoming", attendees: 180, rsvp: false, lat: 1.2931, lng: 103.8572, tags: ["AI", "Future of Work", "HR Tech"] },
  { id: 3, title: "Design Systems Workshop", venue: "The Hive Carpenter", venueAddress: "36 Carpenter St, Singapore", time: "Jun 18, 3:00 PM – 6:00 PM", status: "upcoming", attendees: 60, rsvp: false, lat: 1.2870, lng: 103.8467, tags: ["Design", "UX", "Frontend"] },
  { id: 4, title: "Startup Pitch Night", venue: "Block71 Singapore", venueAddress: "71 Ayer Rajah Crescent, Singapore", time: "Jun 20, 7:00 PM – 10:00 PM", status: "upcoming", attendees: 120, rsvp: false, lat: 1.2966, lng: 103.7874, tags: ["Startups", "VC", "Pitching"] },
];

const DEMO_TIMELINE = [
  { time: "9:00 AM", title: "Registration & Welcome Coffee", location: "Lobby", done: true },
  { time: "10:00 AM", title: "Opening Keynote: AI in 2026", location: "Main Hall", done: true, speaker: "Dr. Fei-Fei Li" },
  { time: "11:30 AM", title: "Panel: Future of Work", location: "Hall A", done: false, active: true, speaker: "Multiple Panelists" },
  { time: "1:00 PM", title: "Networking Lunch", location: "Atrium", done: false },
  { time: "2:30 PM", title: "Workshop: LLM Applications", location: "Room 301", done: false, speaker: "Andrej Karpathy" },
  { time: "4:00 PM", title: "Startup Showcase", location: "Exhibition Floor", done: false },
  { time: "5:30 PM", title: "Closing Remarks & Awards", location: "Main Hall", done: false },
];

const DEMO_SPEAKERS = [
  { name: "Dr. Fei-Fei Li", role: "Professor of CS @ Stanford", linkedin: "faboratory", expertise: ["Computer Vision", "AI Ethics", "ImageNet"], bio: "Co-Director of Stanford HAI. Pioneer in computer vision and AI. Created ImageNet which revolutionized deep learning.", avatar: "FL", color: "from-purple-600 to-indigo-600" },
  { name: "Andrej Karpathy", role: "AI Researcher & Educator", linkedin: "andrejkarpathy", expertise: ["Deep Learning", "Tesla Autopilot", "GPT"], bio: "Former Director of AI at Tesla. Founded and teaches AI courses. Key contributor to GPT and neural network research.", avatar: "AK", color: "from-teal-600 to-cyan-600" },
  { name: "Sarah Chen", role: "Product Lead @ Stripe", linkedin: "sarahchen", expertise: ["Payments", "Product Strategy", "Fintech"], bio: "Leading product strategy for Stripe's enterprise platform. Previously at Square and Goldman Sachs.", avatar: "SC", color: "from-pink-500 to-rose-500" },
  { name: "Marcus Rivera", role: "CTO @ Nexus AI", linkedin: "marcusrivera", expertise: ["MLOps", "Infrastructure", "Scaling"], bio: "Building next-gen AI infrastructure. Ex-Google Brain, scaled ML systems to billions of predictions/day.", avatar: "MR", color: "from-amber-500 to-orange-500" },
];

const DEMO_ATTENDEES = [
  { name: "Sarah Chen", role: "Product Lead @ Stripe", linkedin: "sarahchen", instagram: "sarah.builds", avatar: "SC", color: "from-purple-500 to-indigo-500", skills: ["Product", "Fintech", "Strategy"], company: "Stripe", industry: "Fintech" },
  { name: "Marcus Rivera", role: "CTO @ Nexus AI", linkedin: "marcusrivera", instagram: "marcus.tech", avatar: "MR", color: "from-teal-500 to-cyan-500", skills: ["MLOps", "Infrastructure", "Leadership"], company: "Nexus AI", industry: "AI" },
  { name: "Priya Nair", role: "Design Director @ Figma", linkedin: "priyanair", instagram: "priya.designs", avatar: "PN", color: "from-pink-500 to-rose-500", skills: ["Design Systems", "UX Research", "Leadership"], company: "Figma", industry: "Design Tools" },
  { name: "James Wu", role: "Founder @ DataFlow", linkedin: "jameswu", instagram: "jameswu.io", avatar: "JW", color: "from-amber-500 to-orange-500", skills: ["Data Engineering", "Startups", "Python"], company: "DataFlow", industry: "Data" },
  { name: "Aisha Okonkwo", role: "ML Engineer @ DeepMind", linkedin: "aishaokonkwo", instagram: "aisha.ml", avatar: "AO", color: "from-violet-500 to-purple-500", skills: ["Machine Learning", "Research", "PyTorch"], company: "DeepMind", industry: "AI" },
  { name: "Tom Bergmann", role: "VP Engineering @ Vercel", linkedin: "tombergmann", instagram: "tom.dev", avatar: "TB", color: "from-blue-500 to-sky-500", skills: ["Frontend", "Infrastructure", "Next.js"], company: "Vercel", industry: "Developer Tools" },
  { name: "Lena Fischer", role: "Data Scientist @ Meta", linkedin: "lenafischer", instagram: "lena.data", avatar: "LF", color: "from-green-500 to-emerald-500", skills: ["NLP", "Analytics", "Python"], company: "Meta", industry: "Social Media" },
  { name: "Raj Patel", role: "PM @ Google DeepMind", linkedin: "rajpatel", instagram: "raj.pm", avatar: "RP", color: "from-red-500 to-pink-500", skills: ["Product", "AI", "Strategy"], company: "Google", industry: "AI" },
];

// Simulated current user profile (would come from LinkedIn OAuth in production)
const CURRENT_USER = {
  name: "Alex Johnson",
  role: "Senior Engineer @ TechCorp",
  linkedin: "alexjohnson",
  skills: ["AI", "Machine Learning", "Python", "Infrastructure"],
  industry: "AI",
  interests: ["Deep Learning", "MLOps", "Startups", "Product"],
};

const DEMO_CHECKIN_LIST = [
  { name: "Sarah Chen", table: "A3", time: "9:02 AM", status: "checked_in" },
  { name: "Marcus Rivera", table: "B1", time: "9:08 AM", status: "checked_in" },
  { name: "Priya Nair", table: "A1", time: "9:15 AM", status: "checked_in" },
  { name: "James Wu", table: "C2", time: "9:22 AM", status: "checked_in" },
  { name: "Aisha Okonkwo", table: "B3", time: "9:31 AM", status: "checked_in" },
  { name: "Tom Bergmann", table: "A2", time: "9:45 AM", status: "pending" },
  { name: "Lena Fischer", table: "D1", time: "—", status: "pending" },
  { name: "Raj Patel", table: "C1", time: "—", status: "pending" },
];

const DEMO_VOICE_REQUESTS = [
  { name: "Marcus Rivera", table: "B1", query: "Where is the nearest restroom?", intent: "navigation", time: "11:02 AM", status: "answered" },
  { name: "Priya Nair", table: "A1", query: "Can we get more water at Table A1?", intent: "service_request", time: "11:18 AM", status: "pending" },
  { name: "James Wu", table: "C2", query: "What time does the workshop start?", intent: "informational", time: "11:24 AM", status: "answered" },
  { name: "Aisha Okonkwo", table: "B3", query: "Tell me about Andrej Karpathy's background", intent: "speaker_research", time: "11:31 AM", status: "answered" },
];

const VOICE_EXAMPLES = [
  "Where is my table?",
  "Tell me about the keynote speaker",
  "How do I get to Suntec City from here?",
  "Who should I connect with in AI?",
];

// ─── Utility: Relevance Scoring ──────────────────────────────────────────────

function computeRelevanceScore(userSkills: string[], userIndustry: string, targetSkills: string[], targetIndustry: string): number {
  let score = 0;
  const userSet = new Set(userSkills.map(s => s.toLowerCase()));
  targetSkills.forEach(s => { if (userSet.has(s.toLowerCase())) score += 25; });
  if (userIndustry.toLowerCase() === targetIndustry.toLowerCase()) score += 30;
  return Math.min(score, 99);
}

// ─── Background Decoration ───────────────────────────────────────────────────

function BackgroundDecoration() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.22 290), transparent 70%)" }} />
      <div className="absolute top-1/2 -left-48 w-80 h-80 rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.18 200), transparent 70%)" }} />
      <div className="absolute -bottom-24 right-1/3 w-72 h-72 rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, oklch(0.58 0.20 240), transparent 70%)" }} />
      <div className="absolute top-[22%] left-0 right-0 h-px gradient-line-h opacity-60" />
      <div className="absolute top-[55%] left-0 right-0 h-px gradient-line-h opacity-40" />
      <div className="absolute top-[78%] left-0 right-0 h-px gradient-line-h opacity-30" />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function PlatformHeader({ viewMode, setViewMode }: { viewMode: ViewMode; setViewMode: (v: ViewMode) => void }) {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-border/50 bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
          <Radio className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-black gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>EventHub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">All-in-One Event Platform</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs gap-1 border-green-200 text-green-700 bg-green-50">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> TechSummit 2026 · Live
        </Badge>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button onClick={() => setViewMode("attendee")}
            className={`px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === "attendee" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            style={viewMode === "attendee" ? { background: "var(--gradient-brand)" } : {}}>
            <Users className="w-3 h-3 inline mr-1" />Attendee
          </button>
          <button onClick={() => setViewMode("organizer")}
            className={`px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === "organizer" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            style={viewMode === "organizer" ? { background: "var(--gradient-brand)" } : {}}>
            <Activity className="w-3 h-3 inline mr-1" />Organizer
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Module 1: Interactive Google Maps ───────────────────────────────────────

function MapsPanel() {
  const [locating, setLocating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const locateMe = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (mapRef.current) {
          new google.maps.marker.AdvancedMarkerElement({ map: mapRef.current, position: userPos, title: "You" });
          mapRef.current.panTo(userPos);
        }
        setLocating(false);
        toast.success("Location found!");
      },
      () => { setLocating(false); toast.error("Unable to get your location."); }
    );
  };

  const getDirections = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const destination = { lat: DEMO_EVENT.venueLat, lng: DEMO_EVENT.venueLng };
        if (mapRef.current) {
          const directionsService = new google.maps.DirectionsService();
          if (!directionsRendererRef.current) {
            directionsRendererRef.current = new google.maps.DirectionsRenderer({ map: mapRef.current });
          }
          directionsService.route(
            { origin, destination, travelMode: google.maps.TravelMode.DRIVING },
            (result, status) => {
              if (status === "OK" && result) {
                directionsRendererRef.current!.setDirections(result);
                const leg = result.routes[0]?.legs[0];
                if (leg) setRouteInfo({ distance: leg.distance?.text ?? "", duration: leg.duration?.text ?? "" });
                toast.success("Route calculated!");
              } else {
                toast.error("Could not calculate route.");
              }
            }
          );
        }
      },
      () => toast.error("Unable to get your location for directions.")
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Venue Map</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={locateMe} disabled={locating}>
            <Navigation className="w-3 h-3" />{locating ? "Locating..." : "Locate Me"}
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1" onClick={getDirections}
            style={{ background: "var(--gradient-brand)", border: "none" }}>
            <Route className="w-3 h-3" />Directions
          </Button>
        </div>
      </div>
      {routeInfo && (
        <div className="px-4 py-2 bg-primary/5 border-b border-primary/20 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 font-semibold text-primary"><Car className="w-3 h-3" />{routeInfo.duration}</span>
          <span className="text-muted-foreground">{routeInfo.distance}</span>
        </div>
      )}
      <div className="flex-1 relative">
        <MapView
          className="w-full h-full"
          initialCenter={{ lat: DEMO_EVENT.venueLat, lng: DEMO_EVENT.venueLng }}
          initialZoom={15}
          onMapReady={(map) => {
            mapRef.current = map;
            new google.maps.marker.AdvancedMarkerElement({ map, position: { lat: DEMO_EVENT.venueLat, lng: DEMO_EVENT.venueLng }, title: DEMO_EVENT.venueName });
          }}
        />
      </div>
      <div className="px-4 py-2 border-t border-border/50 bg-muted/30 text-xs text-muted-foreground flex items-center gap-1.5">
        <MapPin className="w-3 h-3" /> {DEMO_EVENT.venueName} · {DEMO_EVENT.venueAddress}
      </div>
    </div>
  );
}

// ─── Module 2: Luma Event Feed with Conflict Detection ───────────────────────

function EventFeedPanel() {
  const [rsvpd, setRsvpd] = useState<number[]>([1]);

  const toggleRsvp = (id: number) => {
    setRsvpd(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    toast.success(rsvpd.includes(id) ? "RSVP cancelled" : "RSVP confirmed!");
  };

  // Detect overlapping events
  const conflicts = useMemo(() => {
    // Events 2 and 3 overlap (Jun 18 afternoon)
    return [{ eventA: 2, eventB: 3, message: "AI & Future of Work overlaps with Design Systems Workshop on Jun 18" }];
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Event Feed</span>
        </div>
        <Badge variant="secondary" className="text-xs">via Luma</Badge>
      </div>

      {conflicts.length > 0 && (
        <div className="mx-3 mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Schedule Conflict Detected</p>
            <p className="text-[11px] text-amber-700 mt-0.5">{conflicts[0].message}</p>
            <p className="text-[10px] text-amber-600 mt-1">Check the Commute tab to see travel time between venues.</p>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {DEMO_EVENTS.map((event) => (
            <div key={event.id}
              className={`rounded-xl border p-3.5 transition-all duration-200 hover:shadow-md ${event.status === "active" ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-white"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {event.status === "active" && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
                      </span>
                    )}
                    {event.status === "upcoming" && (
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">Upcoming</span>
                    )}
                    {conflicts.some(c => c.eventA === event.id || c.eventB === event.id) && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">⚠ Overlap</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground truncate">{event.title}</h3>
                  <p className="text-xs text-muted-foreground">{event.venue}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {event.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.attendees}</span>
                </div>
                <Button size="sm"
                  onClick={() => toggleRsvp(event.id)}
                  className={`h-6 text-[11px] px-2.5 ${rsvpd.includes(event.id) ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20" : ""}`}
                  variant={rsvpd.includes(event.id) ? "outline" : "default"}
                  style={!rsvpd.includes(event.id) ? { background: "var(--gradient-brand)", border: "none" } : {}}>
                  {rsvpd.includes(event.id) ? <><CheckCircle2 className="w-3 h-3 mr-1" />RSVP'd</> : "RSVP"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Module 3: Voice Recognition + AI Speaker Research ───────────────────────

function VoicePanel() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const processVoice = trpc.event.processVoice.useMutation({
    onSuccess: (data: { response: string; intent: string }) => {
      setAiResponse(data.response);
      setIsProcessing(false);
    },
    onError: () => {
      setAiResponse("I'm sorry, I couldn't process that request. Please try again.");
      setIsProcessing(false);
    },
  });

  const startListening = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognitionAPI() as any;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      const results = Array.from(e.results as ArrayLike<any>);
      const t = results.map((r: any) => r[0].transcript).join("");
      setTranscript(t);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition error. Please try again.");
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
    setAiResponse("");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const submitQuery = (query: string) => {
    setTranscript(query);
    setIsProcessing(true);
    setAiResponse("");
    processVoice.mutate({ query, eventId: 1, attendeeName: CURRENT_USER.name });
  };

  // Auto-submit when speech ends
  useEffect(() => {
    if (!isListening && transcript && !isProcessing && !aiResponse) {
      setIsProcessing(true);
      processVoice.mutate({ query: transcript, eventId: 1, attendeeName: CURRENT_USER.name });
    }
  }, [isListening]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          {isListening && (
            <Badge className="text-xs gap-1 bg-red-50 text-red-600 border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Listening
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px]">Speaker Research Enabled</Badge>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
        {/* Mic button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isListening ? "scale-110" : "hover:scale-105"}`}
            style={{ background: isListening ? "linear-gradient(135deg, #ef4444, #dc2626)" : "var(--gradient-brand)" }}>
            {isListening && <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "var(--gradient-brand)" }} />}
            {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
          <p className="text-[11px] text-muted-foreground">{isListening ? "Tap to stop" : "Tap to speak or type below"}</p>
        </div>

        {/* Text input for typing queries */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about speakers, schedule, directions..."
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && transcript.trim()) submitQuery(transcript.trim()); }}
          />
          <Button size="sm" onClick={() => transcript.trim() && submitQuery(transcript.trim())}
            disabled={!transcript.trim() || isProcessing}
            style={{ background: "var(--gradient-brand)", border: "none" }}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Response area */}
        <div className="flex-1 space-y-3">
          {isProcessing && (
            <div className="rounded-xl bg-muted p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Researching your query...</p>
            </div>
          )}
          {aiResponse && !isProcessing && (
            <div className="rounded-xl border p-3" style={{ background: "var(--gradient-brand-subtle)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1 gradient-text">EventHub AI</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Example prompts */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Try asking:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {VOICE_EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => submitQuery(ex)}
                className="text-left text-xs px-2.5 py-2 rounded-lg border border-border bg-white hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 text-muted-foreground hover:text-foreground">
                "{ex}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Module 4: Digital Name Cards + Social Networking ────────────────────────

function NetworkPanel() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttendees = useMemo(() => {
    if (!searchQuery) return DEMO_ATTENDEES;
    const q = searchQuery.toLowerCase();
    return DEMO_ATTENDEES.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.skills.some(s => s.toLowerCase().includes(q)) ||
      a.industry.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Digital Name Cards</span>
        </div>
        <Badge variant="secondary" className="text-xs">{DEMO_ATTENDEES.length} attendees</Badge>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search by name, role, skill, or industry..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:border-primary/50"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredAttendees.map((person) => (
            <div key={person.name}
              onClick={() => setExpandedCard(expandedCard === person.name ? null : person.name)}
              className={`rounded-xl border p-3 transition-all duration-200 cursor-pointer hover:shadow-md ${expandedCard === person.name ? "border-primary/30 bg-primary/[0.02] shadow-md" : "border-border bg-white hover:border-primary/20"}`}>
              {/* Card header */}
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {person.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />{person.role}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <a href={`https://linkedin.com/in/${person.linkedin}`} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-[#0077B5]/10 hover:bg-[#0077B5]/20 flex items-center justify-center transition-colors"
                    onClick={(e) => e.stopPropagation()}>
                    <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                  </a>
                  <a href={`https://instagram.com/${person.instagram}`} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-pink-50 hover:bg-pink-100 flex items-center justify-center transition-colors"
                    onClick={(e) => e.stopPropagation()}>
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  </a>
                </div>
              </div>

              {/* Expanded card details */}
              {expandedCard === person.name && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span>{person.company} · {person.industry}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {person.skills.map(skill => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{skill}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <a href={`https://linkedin.com/in/${person.linkedin}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-lg bg-[#0077B5] text-white hover:bg-[#005885] transition-colors"
                      onClick={(e) => e.stopPropagation()}>
                      Connect on LinkedIn
                    </a>
                    <button className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                      onClick={(e) => { e.stopPropagation(); toast.success(`Message request sent to ${person.name}`); }}>
                      Send Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Module 5: Check-in Flow ─────────────────────────────────────────────────

function CheckInPanel() {
  const [step, setStep] = useState<CheckInStep>("arrival");
  const [confirmed, setConfirmed] = useState(false);

  const steps: { key: CheckInStep; label: string }[] = [
    { key: "arrival", label: "Arrival" },
    { key: "wifi", label: "WiFi" },
    { key: "table", label: "Table" },
    { key: "timeline", label: "Schedule" },
  ];

  const stepIndex = steps.findIndex(s => s.key === step);

  const confirmArrival = () => {
    setConfirmed(true);
    setTimeout(() => setStep("wifi"), 800);
    toast.success("Welcome to TechSummit 2026!");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Check-In</span>
        </div>
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <button key={s.key} onClick={() => (i <= stepIndex || confirmed) ? setStep(s.key) : null}
              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all duration-200 ${s.key === step ? "text-white scale-110" : i < stepIndex ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
              style={s.key === step ? { background: "var(--gradient-brand)" } : {}}>
              {i < stepIndex ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {step === "arrival" && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-brand-subtle)" }}>
              <UserCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Welcome to TechSummit 2026</h3>
              <p className="text-sm text-muted-foreground">Confirm your arrival to unlock WiFi, table assignment, and the full event schedule.</p>
            </div>
            <Button onClick={confirmArrival} className="w-full gap-2" style={{ background: "var(--gradient-brand)", border: "none" }} disabled={confirmed}>
              {confirmed ? <><CheckCircle2 className="w-4 h-4" /> Confirmed!</> : <><CheckCircle2 className="w-4 h-4" /> Confirm My Arrival</>}
            </Button>
          </div>
        )}

        {step === "wifi" && (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--gradient-brand-subtle)" }}>
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold mb-1">WiFi Access</h3>
              <p className="text-xs text-muted-foreground">Connect to the event network</p>
            </div>
            <div className="rounded-xl border p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Network Name (SSID)</p>
                <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                  <span className="text-sm font-mono font-semibold">{DEMO_EVENT.wifiSsid}</span>
                  <button onClick={() => { navigator.clipboard.writeText(DEMO_EVENT.wifiSsid); toast.success("SSID copied!"); }}
                    className="text-xs text-primary hover:underline">Copy</button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Password</p>
                <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                  <span className="text-sm font-mono font-semibold">{DEMO_EVENT.wifiPassword}</span>
                  <button onClick={() => { navigator.clipboard.writeText(DEMO_EVENT.wifiPassword); toast.success("Password copied!"); }}
                    className="text-xs text-primary hover:underline">Copy</button>
                </div>
              </div>
            </div>
            <Button onClick={() => setStep("table")} className="w-full gap-2" style={{ background: "var(--gradient-brand)", border: "none" }}>
              Next: My Table <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {step === "table" && (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--gradient-brand-subtle)" }}>
                <TableProperties className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold mb-1">Your Table Assignment</h3>
            </div>
            <div className="rounded-2xl border-2 border-primary/30 p-6 text-center" style={{ background: "var(--gradient-brand-subtle)" }}>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Table Number</p>
              <p className="text-6xl font-black gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>A3</p>
              <p className="text-xs text-muted-foreground mt-2">Section A · Near the main stage</p>
            </div>
            <Button onClick={() => setStep("timeline")} className="w-full gap-2" style={{ background: "var(--gradient-brand)", border: "none" }}>
              View Schedule <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {step === "timeline" && (
          <div className="flex flex-col gap-3">
            <div className="text-center mb-1">
              <h3 className="text-base font-bold">Event Timeline</h3>
              <p className="text-xs text-muted-foreground">TechSummit 2026 · June 12</p>
            </div>
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
              <div className="space-y-1">
                {DEMO_TIMELINE.map((item, i) => (
                  <div key={i} className={`relative flex gap-3 pl-10 py-2.5 rounded-xl transition-all ${item.active ? "bg-primary/5 border border-primary/20" : item.done ? "opacity-60" : ""}`}>
                    <div className={`absolute left-3 top-3 w-4 h-4 rounded-full border-2 flex items-center justify-center ${item.active ? "border-primary bg-primary" : item.done ? "border-green-500 bg-green-500" : "border-border bg-white"}`}>
                      {(item.active || item.done) && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-muted-foreground">{item.time}</span>
                        {item.active && <Badge className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-primary/30">Now</Badge>}
                      </div>
                      <p className={`text-xs font-semibold ${item.active ? "text-primary" : "text-foreground"}`}>{item.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />{item.location}
                        {item.speaker && <> · <GraduationCap className="w-2.5 h-2.5" />{item.speaker}</>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module 6: Commute Planner ───────────────────────────────────────────────

function CommutePanel() {
  const [commuteResults, setCommuteResults] = useState<Array<{ from: string; to: string; driving: string; transit: string; distance: string; feasible: boolean }>>([]);
  const [loading, setLoading] = useState(false);

  const calculateCommutes = () => {
    setLoading(true);
    // Use Google Maps client-side DirectionsService for commute calculation
    const pairs = [
      { from: DEMO_EVENTS[0], to: DEMO_EVENTS[1] },
      { from: DEMO_EVENTS[1], to: DEMO_EVENTS[2] },
      { from: DEMO_EVENTS[0], to: DEMO_EVENTS[3] },
    ];

    const results: typeof commuteResults = [];
    let completed = 0;

    pairs.forEach((pair) => {
      const service = new google.maps.DirectionsService();
      // Driving
      service.route(
        { origin: pair.from.venueAddress, destination: pair.to.venueAddress, travelMode: google.maps.TravelMode.DRIVING },
        (drivingResult, drivingStatus) => {
          const drivingDuration = drivingStatus === "OK" ? drivingResult?.routes[0]?.legs[0]?.duration?.text ?? "N/A" : "N/A";
          const distance = drivingStatus === "OK" ? drivingResult?.routes[0]?.legs[0]?.distance?.text ?? "N/A" : "N/A";

          // Transit
          service.route(
            { origin: pair.from.venueAddress, destination: pair.to.venueAddress, travelMode: google.maps.TravelMode.TRANSIT },
            (transitResult, transitStatus) => {
              const transitDuration = transitStatus === "OK" ? transitResult?.routes[0]?.legs[0]?.duration?.text ?? "N/A" : "N/A";
              const drivingMins = parseInt(drivingDuration) || 30;
              results.push({
                from: pair.from.title,
                to: pair.to.title,
                driving: drivingDuration,
                transit: transitDuration,
                distance,
                feasible: drivingMins <= 30,
              });
              completed++;
              if (completed === pairs.length) {
                setCommuteResults(results);
                setLoading(false);
              }
            }
          );
        }
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Commute Planner</span>
        </div>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={calculateCommutes} disabled={loading}
          style={{ background: "var(--gradient-brand)", border: "none" }}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Timer className="w-3 h-3" />}
          {loading ? "Calculating..." : "Calculate Routes"}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Info banner */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-semibold text-primary mb-1">Plan Your Event Hopping</p>
            <p className="text-[11px] text-muted-foreground">Calculate travel time between events to decide which sessions to attend. Supports driving and public transit (MRT/Bus) routes in Singapore.</p>
          </div>

          {/* Event list for reference */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Your RSVP'd Events</p>
            {DEMO_EVENTS.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-white">
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{ev.title}</p>
                  <p className="text-[10px] text-muted-foreground">{ev.venue} · {ev.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Results */}
          {commuteResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Travel Times Between Events</p>
              {commuteResults.map((route, i) => (
                <div key={i} className={`rounded-xl border p-3 ${route.feasible ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-foreground">{route.from}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">{route.to}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3 h-3 text-blue-600" />
                      <span className="text-[11px] text-foreground font-medium">{route.driving}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bus className="w-3 h-3 text-green-600" />
                      <span className="text-[11px] text-foreground font-medium">{route.transit}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{route.distance}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {route.feasible ? (
                      <><ThumbsUp className="w-3 h-3 text-green-600" /><span className="text-[10px] text-green-700 font-medium">Feasible — you can make both events</span></>
                    ) : (
                      <><AlertTriangle className="w-3 h-3 text-amber-600" /><span className="text-[10px] text-amber-700 font-medium">Tight schedule — consider prioritizing one</span></>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {commuteResults.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Route className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Click "Calculate Routes" to see travel times between your events</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Module 7: Smart Suggestions (LinkedIn-powered) ──────────────────────────

function SuggestPanel() {
  const [activeSubTab, setActiveSubTab] = useState<"people" | "events">("people");

  // Compute relevance scores for people suggestions
  const peopleSuggestions = useMemo(() => {
    return DEMO_ATTENDEES
      .map(person => ({
        ...person,
        score: computeRelevanceScore(CURRENT_USER.skills, CURRENT_USER.industry, person.skills, person.industry),
        matchReason: person.industry === CURRENT_USER.industry
          ? `Same industry (${person.industry})`
          : person.skills.find(s => CURRENT_USER.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()))
            ? `Shared skill: ${person.skills.find(s => CURRENT_USER.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()))}`
            : "Complementary expertise",
      }))
      .sort((a, b) => b.score - a.score);
  }, []);

  // Compute event suggestions based on user interests
  const eventSuggestions = useMemo(() => {
    return DEMO_EVENTS
      .filter(ev => ev.id !== 1) // Exclude current event
      .map(ev => ({
        ...ev,
        score: ev.tags.filter(t => CURRENT_USER.interests.map(i => i.toLowerCase()).includes(t.toLowerCase()) || CURRENT_USER.skills.map(s => s.toLowerCase()).includes(t.toLowerCase())).length * 30,
        matchReason: ev.tags.filter(t => CURRENT_USER.interests.map(i => i.toLowerCase()).includes(t.toLowerCase()) || CURRENT_USER.skills.map(s => s.toLowerCase()).includes(t.toLowerCase())).join(", ") || "Expand your network",
      }))
      .sort((a, b) => b.score - a.score);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Smart Suggestions</span>
        </div>
        <Badge variant="secondary" className="text-[10px] gap-1"><Linkedin className="w-2.5 h-2.5" />LinkedIn-powered</Badge>
      </div>

      {/* User profile summary */}
      <div className="px-4 py-2.5 border-b border-border/50 bg-primary/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">AJ</div>
          <div>
            <p className="text-xs font-semibold">{CURRENT_USER.name}</p>
            <p className="text-[10px] text-muted-foreground">{CURRENT_USER.role}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {CURRENT_USER.skills.map(s => (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s}</span>
          ))}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-border/50">
        <button onClick={() => setActiveSubTab("people")}
          className={`flex-1 py-2 text-xs font-semibold text-center transition-all ${activeSubTab === "people" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
          <Users className="w-3 h-3 inline mr-1" />People to Meet
        </button>
        <button onClick={() => setActiveSubTab("events")}
          className={`flex-1 py-2 text-xs font-semibold text-center transition-all ${activeSubTab === "events" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
          <Calendar className="w-3 h-3 inline mr-1" />Events for You
        </button>
      </div>

      <ScrollArea className="flex-1">
        {activeSubTab === "people" && (
          <div className="p-3 space-y-2">
            {peopleSuggestions.map((person) => (
              <div key={person.name} className="rounded-xl border border-border bg-white p-3 hover:shadow-md hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {person.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{person.name}</p>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">{person.score}% match</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{person.role}</p>
                  </div>
                  <a href={`https://linkedin.com/in/${person.linkedin}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[#0077B5]/10 hover:bg-[#0077B5]/20 flex items-center justify-center transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-[#0077B5]" />
                  </a>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] text-amber-700 font-medium">{person.matchReason}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {person.skills.map(s => (
                    <span key={s} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${CURRENT_USER.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()) ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === "events" && (
          <div className="p-3 space-y-2">
            {eventSuggestions.map((ev) => (
              <div key={ev.id} className="rounded-xl border border-border bg-white p-3 hover:shadow-md hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold">{ev.title}</h3>
                    <p className="text-xs text-muted-foreground">{ev.venue}</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5 shrink-0">{ev.score}% relevant</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Clock className="w-3 h-3" /><span>{ev.time}</span>
                  <Users className="w-3 h-3 ml-2" /><span>{ev.attendees} attending</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] text-amber-700 font-medium">Matches: {ev.matchReason}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ev.tags.map(tag => (
                    <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${CURRENT_USER.interests.map(i => i.toLowerCase()).includes(tag.toLowerCase()) || CURRENT_USER.skills.map(s => s.toLowerCase()).includes(tag.toLowerCase()) ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ─── Module 8: Organizer Dashboard ───────────────────────────────────────────

function OrganizerDashboard() {
  const [liveCount, setLiveCount] = useState(DEMO_CHECKIN_LIST.filter(a => a.status === "checked_in").length);
  const [requests, setRequests] = useState(DEMO_VOICE_REQUESTS);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => Math.min(prev + 1, DEMO_CHECKIN_LIST.length));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const resolveRequest = (idx: number) => {
    setRequests(prev => prev.map((r, i) => i === idx ? { ...r, status: "answered" } : r));
    toast.success("Request marked as resolved.");
  };

  const intentColor: Record<string, string> = {
    navigation: "bg-blue-50 text-blue-700 border-blue-200",
    service_request: "bg-amber-50 text-amber-700 border-amber-200",
    informational: "bg-green-50 text-green-700 border-green-200",
    speaker_research: "bg-purple-50 text-purple-700 border-purple-200",
    other: "bg-muted text-muted-foreground border-border",
  };

  const statusColor: Record<string, string> = {
    answered: "text-green-600",
    pending: "text-amber-600",
    escalated: "text-red-600",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-0 border-b border-border/50">
        {[
          { label: "Checked In", value: liveCount, icon: UserCheck, color: "text-green-600" },
          { label: "Total RSVP", value: DEMO_EVENT.rsvpCount, icon: Users, color: "text-primary" },
          { label: "Pending", value: DEMO_CHECKIN_LIST.filter(a => a.status === "pending").length, icon: Clock, color: "text-amber-600" },
          { label: "Requests", value: requests.filter(r => r.status === "pending").length, icon: MessageSquare, color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center py-3 px-2 border-r border-border/50 last:border-r-0">
            <stat.icon className={`w-4 h-4 mb-1 ${stat.color}`} />
            <span className={`text-lg font-black ${stat.color}`} style={{ fontFamily: "'Syne', sans-serif" }}>{stat.value}</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Attendance Map */}
        <div className="flex flex-col w-1/2 border-r border-border/50">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">Live Attendance Map</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
            </span>
          </div>
          <div className="flex-1 relative">
            <MapView
              className="w-full h-full"
              initialCenter={{ lat: DEMO_EVENT.venueLat, lng: DEMO_EVENT.venueLng }}
              initialZoom={16}
              onMapReady={(map) => {
                new google.maps.marker.AdvancedMarkerElement({ map, position: { lat: DEMO_EVENT.venueLat, lng: DEMO_EVENT.venueLng }, title: "Venue" });
                const offsets = [[0.0003, 0.0002], [-0.0002, 0.0004], [0.0005, -0.0001], [-0.0004, -0.0003], [0.0001, 0.0005], [0.0006, 0.0003]];
                offsets.forEach(([dlat, dlng]) => {
                  new google.maps.marker.AdvancedMarkerElement({ map, position: { lat: DEMO_EVENT.venueLat + dlat, lng: DEMO_EVENT.venueLng + dlng } });
                });
              }}
            />
          </div>
        </div>

        {/* Right: Check-in list + Voice requests */}
        <div className="flex flex-col w-1/2 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">Check-in List</span>
          </div>
          <ScrollArea className="h-[40%] border-b border-border/50">
            <div className="p-2 space-y-1">
              {DEMO_CHECKIN_LIST.map((a, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${a.status === "checked_in" ? "bg-green-500" : "bg-amber-400"}`} />
                  <span className="text-xs font-medium flex-1 truncate">{a.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">T:{a.table}</span>
                  <span className="text-[10px] text-muted-foreground">{a.time}</span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">Voice / Chat Requests</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {requests.map((req, i) => (
                <div key={i} className={`rounded-lg border p-2.5 transition-all ${req.status === "escalated" ? "border-red-200 bg-red-50/50" : req.status === "pending" ? "border-amber-200 bg-amber-50/50" : "border-border bg-white"}`}>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{req.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">T:{req.table}</span>
                    </div>
                    <span className={`text-[10px] border rounded-full px-1.5 py-0.5 ${intentColor[req.intent] ?? intentColor.other}`}>{req.intent.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-foreground mb-1.5">"{req.query}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{req.time}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-medium ${statusColor[req.status] ?? ""}`}>{req.status}</span>
                      {req.status === "pending" && (
                        <button onClick={() => resolveRequest(i)} className="text-[10px] text-primary hover:underline font-medium">Resolve</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Navigation ──────────────────────────────────────────────────────────

const ATTENDEE_TABS: { key: AttendeeTab; label: string; icon: React.ElementType }[] = [
  { key: "map", label: "Map", icon: MapPin },
  { key: "events", label: "Events", icon: Calendar },
  { key: "voice", label: "AI", icon: Brain },
  { key: "network", label: "Network", icon: Users },
  { key: "commute", label: "Commute", icon: Route },
  { key: "suggest", label: "For You", icon: Sparkles },
  { key: "checkin", label: "Check-In", icon: UserCheck },
];

// ─── Main Platform ───────────────────────────────────────────────────────────

export default function EventPlatform() {
  const [viewMode, setViewMode] = useState<ViewMode>("attendee");
  const [activeTab, setActiveTab] = useState<AttendeeTab>("map");

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden">
      <BackgroundDecoration />
      <PlatformHeader viewMode={viewMode} setViewMode={setViewMode} />

      <main className="relative z-10 flex-1 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>
        {viewMode === "attendee" ? (
          <div className="flex flex-col h-full">
            {/* Hero strip */}
            <div className="px-6 py-3 border-b border-border/50 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
                    TechSummit 2026
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Marina Bay Sands Expo · Today, 9:00 AM – 6:00 PM
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-primary" /> {DEMO_EVENT.attendeeCount} here</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> {DEMO_EVENT.rsvpCount} RSVPs</span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50 bg-white/60 backdrop-blur-sm overflow-x-auto">
              {ATTENDEE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === tab.key ? "tab-active shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              <div className={`h-full ${activeTab === "map" ? "block" : "hidden"}`}><MapsPanel /></div>
              <div className={`h-full ${activeTab === "events" ? "block" : "hidden"}`}><EventFeedPanel /></div>
              <div className={`h-full ${activeTab === "voice" ? "block" : "hidden"}`}><VoicePanel /></div>
              <div className={`h-full ${activeTab === "network" ? "block" : "hidden"}`}><NetworkPanel /></div>
              <div className={`h-full ${activeTab === "commute" ? "block" : "hidden"}`}><CommutePanel /></div>
              <div className={`h-full ${activeTab === "suggest" ? "block" : "hidden"}`}><SuggestPanel /></div>
              <div className={`h-full ${activeTab === "checkin" ? "block" : "hidden"}`}><CheckInPanel /></div>
            </div>
          </div>
        ) : (
          /* Organizer Dashboard */
          <div className="flex flex-col h-full">
            <div className="px-6 py-3 border-b border-border/50 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Organizer Dashboard
                  </h2>
                  <p className="text-xs text-muted-foreground">TechSummit 2026 · Real-time monitoring</p>
                </div>
                <Badge className="text-xs gap-1 bg-green-50 text-green-700 border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Data
                </Badge>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <OrganizerDashboard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
