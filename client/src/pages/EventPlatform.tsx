import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { MapView, loadMapScript } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  MapPin, Calendar, Mic, Users, Sparkles, Navigation, Eye, Camera,
  CheckCircle2, Wifi, Hash, Clock, Send, Phone, MessageCircle,
  ChevronRight, Star, AlertTriangle, Car, Bus, Footprints, X,
  LayoutDashboard, UserCheck, Bell
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface DemoEvent {
  id: number;
  title: string;
  venueName: string;
  venueAddress: string;
  venueLat: number;
  venueLng: number;
  startTime: string;
  endTime: string;
  wifiSsid: string;
  wifiPassword: string;
  totalRsvps: number;
  checkedIn: number;
}

interface Attendee {
  id: number;
  name: string;
  role: string;
  company: string;
  industry: string;
  skills: string[];
  linkedin?: string;
  instagram?: string;
  checkedInAt?: string;
  tableNumber?: number;
  lat?: number;
  lng?: number;
}

interface Session {
  id: number;
  title: string;
  speaker: string;
  time: string;
  location: string;
  attendees: number;
  status: "live" | "next" | "upcoming";
}

// ─── Demo Data ──────────────────────────────────────────────────────────────────

const DEMO_EVENT: DemoEvent = {
  id: 1,
  title: "TechSummit 2026",
  venueName: "Marina Bay Sands Expo",
  venueAddress: "10 Bayfront Ave, Singapore 018956",
  venueLat: 1.2834,
  venueLng: 103.8607,
  startTime: "9:00 AM",
  endTime: "6:00 PM",
  wifiSsid: "TechSummit-Guest",
  wifiPassword: "TS2026!Connect",
  totalRsvps: 400,
  checkedIn: 342,
};

const DEMO_ATTENDEES: Attendee[] = [
  { id: 1, name: "Sarah Chen", role: "VP Engineering", company: "TechCorp", industry: "Technology", skills: ["AI", "ML", "Python"], linkedin: "linkedin.com/in/sarahchen", instagram: "@sarahchen_tech", checkedInAt: "2:31 PM", tableNumber: 12, lat: 1.2836, lng: 103.8609 },
  { id: 2, name: "Alex Kim", role: "Product Lead", company: "Stripe", industry: "Fintech", skills: ["Product", "APIs", "Growth"], linkedin: "linkedin.com/in/alexkim", checkedInAt: "2:28 PM", tableNumber: 8, lat: 1.2832, lng: 103.8605 },
  { id: 3, name: "Mike Torres", role: "Design Director", company: "Figma", industry: "Design", skills: ["UX", "Systems", "Prototyping"], linkedin: "linkedin.com/in/miketorres", instagram: "@mikedesigns", checkedInAt: "2:25 PM", tableNumber: 5, lat: 1.2838, lng: 103.8611 },
  { id: 4, name: "Priya Sharma", role: "CTO", company: "DataFlow", industry: "Data", skills: ["Big Data", "Spark", "Architecture"], linkedin: "linkedin.com/in/priyasharma", checkedInAt: "2:20 PM", tableNumber: 3, lat: 1.2830, lng: 103.8603 },
  { id: 5, name: "James Liu", role: "Founder", company: "NeuralAI", industry: "AI", skills: ["Deep Learning", "NLP", "Startups"], linkedin: "linkedin.com/in/jamesliu", instagram: "@jamesliu_ai", checkedInAt: "2:15 PM", tableNumber: 15, lat: 1.2835, lng: 103.8608 },
];

const DEMO_SESSIONS: Session[] = [
  { id: 1, title: "Keynote: Future of AI", speaker: "Dr. Sarah Chen", time: "9:00 AM – 10:30 AM", location: "Main Hall", attendees: 156, status: "live" },
  { id: 2, title: "Workshop: Building with LLMs", speaker: "Alex Kim", time: "11:00 AM – 12:30 PM", location: "Room 3B", attendees: 48, status: "next" },
  { id: 3, title: "Panel: Design Systems at Scale", speaker: "Mike Torres + Panel", time: "2:00 PM – 3:00 PM", location: "Room 2A", attendees: 72, status: "upcoming" },
  { id: 4, title: "Networking: AI & Fintech", speaker: "Community", time: "3:30 PM – 4:30 PM", location: "Lounge", attendees: 35, status: "upcoming" },
];

const ORGANIZER_PHONE = "6591234567";

// ─── Main Platform Component ────────────────────────────────────────────────────

export default function EventPlatform() {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const isOrganizer = location === "/organizer" || sessionStorage.getItem("demo_role") === "organizer";
  const [activeTab, setActiveTab] = useState(isOrganizer ? "dashboard" : "map");

  const attendeeTabs = [
    { id: "map", icon: MapPin, label: "Map" },
    { id: "events", icon: Calendar, label: "Events" },
    { id: "ai", icon: Mic, label: "AI" },
    { id: "network", icon: Users, label: "People" },
    { id: "checkin", icon: CheckCircle2, label: "Check-In" },
  ];

  const organizerTabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "checkins", icon: UserCheck, label: "Check-Ins" },
    { id: "requests", icon: Bell, label: "Requests" },
    { id: "map", icon: MapPin, label: "Map" },
  ];

  const tabs = isOrganizer ? organizerTabs : attendeeTabs;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="glass-heavy px-4 py-3 flex items-center justify-between shrink-0 z-30 relative">
        <div className="flex items-center gap-2.5">
          <h1 className="brand-title text-lg leading-none">EventFlow</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill pill-live text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-soft" />
            Live
          </span>
          <button
            onClick={() => { sessionStorage.removeItem("demo_role"); navigate("/"); }}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Event Info Bar */}
      <div className="px-4 py-2 border-b border-border/30 bg-muted/30 flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs font-semibold">{DEMO_EVENT.title}</p>
          <p className="text-[10px] text-muted-foreground">{DEMO_EVENT.venueName} · Today, {DEMO_EVENT.startTime} – {DEMO_EVENT.endTime}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium">{DEMO_EVENT.checkedIn}/{DEMO_EVENT.totalRsvps}</p>
          <p className="text-[9px] text-muted-foreground">checked in</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === "map" && <MapsPanel />}
        {activeTab === "events" && <EventsPanel />}
        {activeTab === "ai" && <AIPanel />}
        {activeTab === "network" && <NetworkPanel />}
        {activeTab === "checkin" && <CheckInPanel />}
        {activeTab === "dashboard" && <OrganizerDashboard />}
        {activeTab === "checkins" && <CheckInListPanel />}
        {activeTab === "requests" && <RequestsPanel />}
      </main>

      {/* Bottom Navigation - in flow, not fixed */}
      <nav className="shrink-0 border-t border-border/30 bg-white/85 backdrop-blur-xl" style={{ zIndex: 9999 }}>
        <div className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─── Maps Panel (Primary Attendee View) ─────────────────────────────────────────

function MapsPanel() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const routePathRef = useRef<google.maps.LatLng[]>([]);
  const [showStreetView, setShowStreetView] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [approachStep, setApproachStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const streetViewPanoRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const autoWayfindTriggered = useRef(false);

  // Geo-triggered auto-wayfinding: when user is within 2km of venue, auto-show directions
  useEffect(() => {
    if (!navigator.geolocation) return;
    const geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (autoWayfindTriggered.current) return;
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const venueLat = DEMO_EVENT.venueLat;
        const venueLng = DEMO_EVENT.venueLng;
        // Haversine approximation for distance in km
        const R = 6371;
        const dLat = ((venueLat - userLat) * Math.PI) / 180;
        const dLng = ((venueLng - userLng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos((userLat * Math.PI) / 180) * Math.cos((venueLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (dist <= 2) {
          autoWayfindTriggered.current = true;
          toast.info("You're nearby! Showing directions to the venue.");
          getDirections();
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(geoWatchId);
  }, []);

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
            { origin, destination, travelMode: google.maps.TravelMode.WALKING },
            (result, status) => {
              if (status === "OK" && result) {
                directionsRendererRef.current!.setDirections(result);
                const leg = result.routes[0]?.legs[0];
                if (leg) {
                  setRouteInfo({ distance: leg.distance?.text ?? "", duration: leg.duration?.text ?? "" });
                  const path = result.routes[0].overview_path;
                  routePathRef.current = path;
                  setTotalSteps(path.length);
                }
                toast.success("Route calculated!");
                setShowStreetView(true);
              } else {
                toast.error("Could not calculate route.");
              }
            }
          );
        }
      },
      () => toast.error("Unable to get your location.")
    );
  };

  const initStreetView = useCallback(() => {
    if (!streetViewRef.current || streetViewPanoRef.current) return;
    loadMapScript().then(() => {
      const pano = new google.maps.StreetViewPanorama(streetViewRef.current!, {
        position: { lat: DEMO_EVENT.venueLat, lng: DEMO_EVENT.venueLng },
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        disableDefaultUI: true,
        showRoadLabels: false,
      });
      streetViewPanoRef.current = pano;
    });
  }, []);

  useEffect(() => {
    if (showStreetView) initStreetView();
  }, [showStreetView, initStreetView]);

  const startTracking = () => {
    if (!navigator.geolocation) return;
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const userPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        const path = routePathRef.current;
        if (path.length === 0) return;
        let minDist = Infinity;
        let closestIdx = 0;
        path.forEach((pt, i) => {
          const d = google.maps.geometry.spherical.computeDistanceBetween(userPos, pt);
          if (d < minDist) { minDist = d; closestIdx = i; }
        });
        setApproachStep(closestIdx);
        if (streetViewPanoRef.current && path[closestIdx]) {
          const heading = google.maps.geometry.spherical.computeHeading(
            path[closestIdx],
            new google.maps.LatLng(DEMO_EVENT.venueLat, DEMO_EVENT.venueLng)
          );
          streetViewPanoRef.current.setPosition(path[closestIdx]);
          streetViewPanoRef.current.setPov({ heading, pitch: 0 });
        }
      },
      null,
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
  };

  const stopTracking = () => {
    setTracking(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Street View Approach */}
      {showStreetView && (
        <div className="shrink-0 border-b border-border/30 animate-slide-up">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold">Approach View</span>
              {tracking && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
            </div>
            <div className="flex items-center gap-1.5">
              {!tracking ? (
                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 px-2" onClick={startTracking}>
                  <Navigation className="w-2.5 h-2.5" />Live
                </Button>
              ) : (
                <Button size="sm" variant="destructive" className="h-6 text-[10px] gap-1 px-2" onClick={stopTracking}>
                  Stop
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowStreetView(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div ref={streetViewRef} className="w-full h-[160px] bg-muted" />
          {totalSteps > 0 && (
            <div className="px-4 py-1.5 bg-muted/30 flex items-center gap-2">
              <Eye className="w-2.5 h-2.5 text-muted-foreground" />
              <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(approachStep / Math.max(totalSteps, 1)) * 100}%`, background: "var(--gradient-brand)" }} />
              </div>
              <span className="text-[9px] text-muted-foreground">{Math.round((approachStep / Math.max(totalSteps, 1)) * 100)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          className="w-full h-full"
          initialCenter={{ lat: DEMO_EVENT.venueLat, lng: DEMO_EVENT.venueLng }}
          initialZoom={16}
          onMapReady={(map) => {
            mapRef.current = map;
            new google.maps.marker.AdvancedMarkerElement({
              map,
              position: { lat: DEMO_EVENT.venueLat, lng: DEMO_EVENT.venueLng },
              title: DEMO_EVENT.venueName,
            });
          }}
        />

        {/* Floating action buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button onClick={getDirections} className="glass-heavy w-11 h-11 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Navigation className="w-5 h-5 text-primary" />
          </button>
          <button onClick={() => setShowStreetView(!showStreetView)} className="glass-heavy w-11 h-11 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Eye className="w-5 h-5 text-accent" />
          </button>
        </div>

        {/* Route info overlay */}
        {routeInfo && (
          <div className="absolute top-4 left-4 glass-card px-3 py-2 animate-slide-up">
            <p className="text-xs font-semibold">{routeInfo.duration}</p>
            <p className="text-[10px] text-muted-foreground">{routeInfo.distance} walking</p>
          </div>
        )}
      </div>

      {/* Venue footer */}
      <div className="px-4 py-2.5 glass-heavy border-t border-border/30 flex items-center gap-2 shrink-0">
        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{DEMO_EVENT.venueName}</p>
          <p className="text-[10px] text-muted-foreground truncate">{DEMO_EVENT.venueAddress}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Events Panel ───────────────────────────────────────────────────────────────

function EventsPanel() {
  const [rsvpd, setRsvpd] = useState<number[]>([1]);

  const toggleRsvp = (id: number) => {
    setRsvpd(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    toast.success(rsvpd.includes(id) ? "RSVP cancelled" : "RSVP confirmed!");
  };

  const statusColors: Record<string, string> = {
    live: "pill-live",
    next: "bg-amber-50 text-amber-700 border-amber-200",
    upcoming: "",
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 py-4 space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Today's Schedule</h2>
        <span className="text-[10px] text-muted-foreground">{DEMO_SESSIONS.length} sessions</span>
      </div>

      {DEMO_SESSIONS.map((session, i) => (
        <div key={session.id} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {session.status !== "upcoming" && (
                  <span className={`pill text-[9px] ${statusColors[session.status]}`}>
                    {session.status === "live" && <span className="w-1 h-1 rounded-full bg-green-500" />}
                    {session.status === "live" ? "Live" : "Next"}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold leading-tight">{session.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{session.speaker}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{session.location}</span>
              </div>
            </div>
            <button
              onClick={() => toggleRsvp(session.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all active:scale-95 ${
                rsvpd.includes(session.id)
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {rsvpd.includes(session.id) ? "RSVP'd" : "RSVP"}
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border/30">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{session.attendees} attending</span>
          </div>
        </div>
      ))}

      {/* Conflict Warning */}
      <div className="glass-card p-3 border-amber-200/50 bg-amber-50/30 animate-slide-up" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-800 font-medium">Schedule Conflict Detected</p>
        </div>
        <p className="text-[10px] text-amber-700/80 mt-1 ml-5.5">Workshop A and Panel Discussion overlap by 30 min. Commute between venues: 8 min by car.</p>
      </div>
    </div>
  );
}

// ─── AI Voice Panel ─────────────────────────────────────────────────────────────

function AIPanel() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    { role: "ai", text: "Hi! I'm your event assistant. Ask me anything — \"Where is my table?\", \"Tell me about the keynote speaker\", or \"I need help from the organizer\"." },
  ]);
  const [inputText, setInputText] = useState("");
  const recognitionRef = useRef<any>(null);

  const processMessage = (text: string) => {
    setMessages(prev => [...prev, { role: "user", text }]);
    // Simulate AI response
    setTimeout(() => {
      let response = "";
      const lower = text.toLowerCase();
      if (lower.includes("table")) {
        response = "You're assigned to Table 12 in the Main Hall. It's on the left side as you enter through the main doors.";
      } else if (lower.includes("wifi") || lower.includes("password")) {
        response = `WiFi Network: ${DEMO_EVENT.wifiSsid}\nPassword: ${DEMO_EVENT.wifiPassword}`;
      } else if (lower.includes("speaker") || lower.includes("sarah") || lower.includes("chen")) {
        response = "Dr. Sarah Chen is VP of Engineering at TechCorp. She specializes in AI/ML systems and has published 12 papers on large language models. She previously led the ML platform team at Google.";
      } else if (lower.includes("next") || lower.includes("schedule")) {
        response = "Next up: Workshop: Building with LLMs by Alex Kim at 11:00 AM in Room 3B. 48 people attending.";
      } else if (lower.includes("organizer") || lower.includes("help")) {
        response = "I've forwarded your message to the organizer via WhatsApp. They'll get back to you shortly!";
        // Trigger WhatsApp deep link
        const waUrl = `https://wa.me/${ORGANIZER_PHONE}?text=${encodeURIComponent(`[EventFlow] Attendee request: ${text}`)}`;
        window.open(waUrl, "_blank");
      } else {
        response = "I can help with directions, your table number, the schedule, speaker info, or connecting you with the organizer. What would you like to know?";
      }
      setMessages(prev => [...prev, { role: "ai", text: response }]);
    }, 800);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Voice not supported in this browser."); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setTranscript(text);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (transcript.trim()) processMessage(transcript.trim());
      setTranscript("");
    };
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    processMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-white rounded-br-md"
                : "glass-card rounded-bl-md"
            }`}>
              {msg.text.split("\n").map((line, j) => <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>)}
            </div>
          </div>
        ))}
        {transcript && (
          <div className="flex justify-end animate-fade-in">
            <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs bg-primary/10 text-primary rounded-br-md italic">
              {transcript}...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-4 py-3 glass-heavy border-t border-border/30">
        <div className="flex items-center gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-primary text-white"
            }`}
          >
            <Mic className="w-4.5 h-4.5" />
          </button>
          <div className="flex-1 flex items-center gap-2 glass rounded-full px-3.5 py-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <button onClick={handleSend} className="text-primary hover:text-primary/80 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
          {/* WhatsApp direct */}
          <button
            onClick={() => {
              const waUrl = `https://wa.me/${ORGANIZER_PHONE}?text=${encodeURIComponent("[EventFlow] I need help from the organizer")}`;
              window.open(waUrl, "_blank");
              toast.success("Opening WhatsApp to contact organizer...");
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-green-500 text-white active:scale-90 transition-transform"
          >
            <Phone className="w-4.5 h-4.5" />
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-2">Tap mic to speak · Green button for WhatsApp to organizer</p>
      </div>
    </div>
  );
}

// ─── Network Panel ──────────────────────────────────────────────────────────────

function NetworkPanel() {
  const [filter, setFilter] = useState<"all" | "suggested">("all");

  const suggestions = useMemo(() => {
    return DEMO_ATTENDEES.map(a => ({
      ...a,
      score: Math.floor(Math.random() * 30) + 70,
      reason: a.industry === "Technology" ? "Same industry, complementary skills" :
              a.industry === "AI" ? "Shared interest in AI/ML" :
              "Potential collaboration opportunity"
    })).sort((a, b) => b.score - a.score);
  }, []);

  const displayList = filter === "suggested" ? suggestions : DEMO_ATTENDEES;

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 py-4 space-y-3 pb-24">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${filter === "all" ? "bg-primary text-white" : "glass"}`}
        >
          All People
        </button>
        <button
          onClick={() => setFilter("suggested")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${filter === "suggested" ? "bg-primary text-white" : "glass"}`}
        >
          <Sparkles className="w-3 h-3" />For You
        </button>
      </div>

      {/* People Cards */}
      {displayList.map((person, i) => (
        <div key={person.id} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary">{person.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{person.name}</p>
                {filter === "suggested" && "score" in person && (
                  <span className="pill text-[9px] text-primary bg-primary/5 border-primary/20">
                    {(person as any).score}% match
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{person.role} · {person.company}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {person.skills.map(s => (
                  <span key={s} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-md">{s}</span>
                ))}
              </div>
              {filter === "suggested" && "reason" in person && (
                <p className="text-[10px] text-primary/80 mt-1.5 italic">{(person as any).reason}</p>
              )}
              <div className="flex items-center gap-2 mt-2.5">
                {person.linkedin && (
                  <a href={`https://${person.linkedin}`} target="_blank" rel="noopener" className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5">
                    LinkedIn <ChevronRight className="w-2.5 h-2.5" />
                  </a>
                )}
                {person.instagram && (
                  <a href={`https://instagram.com/${person.instagram.replace("@", "")}`} target="_blank" rel="noopener" className="text-[10px] text-pink-600 hover:underline flex items-center gap-0.5">
                    Instagram <ChevronRight className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Check-In Panel ─────────────────────────────────────────────────────────────

function CheckInPanel() {
  const [step, setStep] = useState(0); // 0=not checked in, 1=wifi, 2=table, 3=timeline

  const handleCheckIn = () => {
    toast.success("Welcome! You're checked in.");
    setStep(1);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 py-6 pb-24">
      <div className="max-w-sm mx-auto space-y-4">
        {/* Progress */}
        <div className="flex items-center gap-1 justify-center mb-6">
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s <= step ? "w-8" : "w-4"}`}
              style={{ background: s <= step ? "var(--gradient-brand)" : "var(--color-border)" }} />
          ))}
        </div>

        {/* Step 0: Check In */}
        {step === 0 && (
          <div className="glass-card p-6 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Confirm Arrival</h3>
            <p className="text-xs text-muted-foreground mt-1">Tap below to check in to {DEMO_EVENT.title}</p>
            <Button onClick={handleCheckIn} className="mt-5 w-full h-11 rounded-full text-sm font-medium" style={{ background: "var(--gradient-brand)" }}>
              I'm Here
            </Button>
          </div>
        )}

        {/* Step 1: WiFi */}
        {step >= 1 && (
          <div className="glass-card p-5 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Wifi className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold">WiFi Access</p>
                <p className="text-[10px] text-muted-foreground">Connect to the event network</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Network</span>
                <span className="text-xs font-medium">{DEMO_EVENT.wifiSsid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Password</span>
                <button onClick={() => { navigator.clipboard.writeText(DEMO_EVENT.wifiPassword); toast.success("Copied!"); }}
                  className="text-xs font-mono font-medium text-primary hover:underline">{DEMO_EVENT.wifiPassword}</button>
              </div>
            </div>
            {step === 1 && (
              <Button onClick={() => setStep(2)} variant="outline" className="mt-3 w-full h-9 text-[11px] rounded-full">
                Next: Your Table <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Table */}
        {step >= 2 && (
          <div className="glass-card p-5 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Hash className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold">Your Table</p>
                <p className="text-[10px] text-muted-foreground">Main Hall, left side</p>
              </div>
            </div>
            <div className="text-center py-3">
              <span className="text-4xl font-bold gradient-text">12</span>
              <p className="text-[10px] text-muted-foreground mt-1">Near the stage, row B</p>
            </div>
            {step === 2 && (
              <Button onClick={() => setStep(3)} variant="outline" className="mt-3 w-full h-9 text-[11px] rounded-full">
                Next: Today's Schedule <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Step 3: Timeline */}
        {step >= 3 && (
          <div className="glass-card p-5 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs font-semibold">Event Timeline</p>
                <p className="text-[10px] text-muted-foreground">Today's schedule</p>
              </div>
            </div>
            <div className="space-y-2.5 mt-2">
              {DEMO_SESSIONS.map((s) => (
                <div key={s.id} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{
                    background: s.status === "live" ? "oklch(0.55 0.22 150)" : s.status === "next" ? "oklch(0.65 0.18 80)" : "var(--color-border)"
                  }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{s.title}</p>
                    <p className="text-[9px] text-muted-foreground">{s.time} · {s.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Organizer: Dashboard ───────────────────────────────────────────────────────

function OrganizerDashboard() {
  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 py-4 space-y-4 pb-24">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold gradient-text">{DEMO_EVENT.checkedIn}</p>
          <p className="text-[9px] text-muted-foreground">Checked In</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold">{DEMO_EVENT.totalRsvps}</p>
          <p className="text-[9px] text-muted-foreground">Total RSVPs</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold text-amber-600">3</p>
          <p className="text-[9px] text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Attendance Rate */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold">Attendance Rate</p>
          <p className="text-xs font-bold gradient-text">{Math.round((DEMO_EVENT.checkedIn / DEMO_EVENT.totalRsvps) * 100)}%</p>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(DEMO_EVENT.checkedIn / DEMO_EVENT.totalRsvps) * 100}%`, background: "var(--gradient-brand)" }} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold mb-3">Recent Activity</p>
        <div className="space-y-2.5">
          {DEMO_ATTENDEES.slice(0, 4).map((a, i) => (
            <div key={a.id} className="flex items-center gap-2.5 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-primary">{a.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate">{a.name}</p>
                <p className="text-[9px] text-muted-foreground">{a.role} · Table {a.tableNumber}</p>
              </div>
              <span className="text-[9px] text-muted-foreground shrink-0">{a.checkedInAt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Status */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-3.5 h-3.5 text-green-600" />
          <p className="text-xs font-semibold">WhatsApp Connector</p>
          <span className="pill pill-live text-[9px] ml-auto">Active</span>
        </div>
        <p className="text-[10px] text-muted-foreground">Messages from attendees are forwarded to your WhatsApp. 3 messages received today.</p>
      </div>
    </div>
  );
}

// ─── Organizer: Check-In List ───────────────────────────────────────────────────

function CheckInListPanel() {
  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 py-4 space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Check-In List</h2>
        <span className="pill text-[10px]">{DEMO_ATTENDEES.length} total</span>
      </div>
      {DEMO_ATTENDEES.map((a, i) => (
        <div key={a.id} className="glass-card p-3 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">{a.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{a.name}</p>
            <p className="text-[10px] text-muted-foreground">{a.role} · {a.company}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-medium">Table {a.tableNumber}</p>
            <p className="text-[9px] text-muted-foreground">{a.checkedInAt}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Organizer: Requests Panel ──────────────────────────────────────────────────

function RequestsPanel() {
  const requests = [
    { id: 1, from: "Sarah Chen", message: "The projector in Room 3B isn't working", time: "2:34 PM", status: "new" as const, table: 12 },
    { id: 2, from: "Alex Kim", message: "Where is the lunch area?", time: "2:28 PM", status: "resolved" as const, table: 8 },
    { id: 3, from: "Mike Torres", message: "Need extra chair at Table 5", time: "2:20 PM", status: "in_progress" as const, table: 5 },
  ];

  const statusBadge: Record<string, string> = {
    new: "bg-red-50 text-red-700 border-red-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 py-4 space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Attendee Requests</h2>
        <span className="pill text-[10px] bg-red-50 text-red-700 border-red-200">1 new</span>
      </div>
      {requests.map((req, i) => (
        <div key={req.id} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`pill text-[9px] ${statusBadge[req.status]}`}>
                  {req.status === "new" ? "New" : req.status === "in_progress" ? "In Progress" : "Resolved"}
                </span>
                <span className="text-[9px] text-muted-foreground">{req.time}</span>
              </div>
              <p className="text-xs font-semibold">{req.from}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Table {req.table} · "{req.message}"</p>
            </div>
            {req.status === "new" && (
              <button
                onClick={() => {
                  const waUrl = `https://wa.me/${ORGANIZER_PHONE}?text=${encodeURIComponent(`Reply to ${req.from}: ${req.message}`)}`;
                  window.open(waUrl, "_blank");
                }}
                className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* WhatsApp forwarding info */}
      <div className="glass-card p-3 bg-green-50/30 border-green-200/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-green-600" />
          <p className="text-[10px] text-green-800">All new requests are automatically forwarded to your WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
