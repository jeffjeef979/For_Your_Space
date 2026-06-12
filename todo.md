# EventHub — All-in-One Event Platform TODO

## Phase 1: Foundation
- [x] Initialize project scaffold
- [x] Create todo.md
- [x] Design system tokens (gradient, typography, colors)
- [x] Database schema: events, attendees, check_ins, voice_requests, wifi_config

## Phase 2: Dashboard Shell
- [x] Unified single-screen layout with panel navigation
- [x] Attendee view vs Organizer view role switching
- [x] Gradient title typography (purple → teal)
- [x] Floating gradient lines and soft circular background shapes

## Phase 3: Attendee Modules
- [x] Module 1: Google Maps panel with venue pin and geolocation tracking
- [x] Module 1: Directional routing to event venue
- [x] Module 2: Luma event feed (upcoming/active events, RSVP, attendee count)
- [x] Module 3: Voice recognition — mic capture, transcription, LLM response
- [x] Module 3: Voice command examples ("Where is my table?", etc.)
- [x] Module 4: Social profile panel (LinkedIn + Instagram display)
- [x] Module 4: In-event networking cards

## Phase 4: Check-in Flow & Organizer Dashboard
- [x] Check-in Step 1: Arrival confirmation
- [x] Check-in Step 2: WiFi password reveal
- [x] Check-in Step 3: Table number assignment
- [x] Check-in Step 4: Event timeline display
- [x] Organizer: Real-time attendance map
- [x] Organizer: Live check-in list
- [x] Organizer: Incoming voice/chat requests panel

## Phase 5: Backend
- [x] tRPC router: events (list, get, rsvp)
- [x] tRPC router: attendees (check-in, get status)
- [x] tRPC router: voice (transcribe, process command)
- [x] tRPC router: organizer (live stats, request list)
- [x] Database migrations pushed

## Phase 6: Polish & Delivery
- [x] Vitest tests for all routers
- [x] Responsive layout verification
- [x] Checkpoint saved

## Phase 7: New Features (Luma-inspired)
- [x] Digital name cards panel: LinkedIn-style cards for all participants with photo, role, company, LinkedIn/Instagram links
- [x] Commute planner: show travel time & distance between events using Google Maps directions
- [x] Commute planner: integrate with transit (SingaBus-style public transport routing)
- [x] AI speaker research: assistant can look up speaker backgrounds (LinkedIn, bio, expertise)
- [x] Schedule conflict helper: detect overlapping events and show commute feasibility between venues
- [x] Single shell script to install, migrate, and run the full app

## Phase 8: Smart Suggestions (LinkedIn-powered)
- [x] Smart suggestions: recommend people to connect with based on user's LinkedIn background (role, industry, skills)
- [x] Smart suggestions: recommend events/sessions to attend based on user's professional interests
- [x] AI matching logic: analyze attendee profiles vs user profile for relevance scoring

## Phase 9: Street View Approach Navigation
- [x] Add Street View panorama panel synced to user's real-time geolocation
- [x] Auto-update panorama heading/position as user moves along the route toward venue
- [x] Show approach images from Google Maps Street View at key waypoints along the route
- [x] Integrate with geolocation watchPosition for continuous tracking

## Phase 10: Major UI Redesign — iOS Liquid Glass + Phone-First + Rebrand
- [x] Rebrand to "EventFlow" with updated slogan
- [x] Redesign with iOS Liquid Glass design language (frosted glass, blur, translucent layers, depth)
- [x] Phone-first mobile-optimized layout with bottom navigation
- [x] Luma-inspired event feed cards (clean, minimal chrome, elegant)
- [x] Map as primary attendee view (full-screen map on load)
- [x] Geo-triggered wayfinding: auto-show directions when attendee is near venue
- [x] Post-registration WiFi password reveal flow
- [x] Update page title and branding to "EventFlow" (in index.html and Login page)

## Phase 11: WhatsApp Connector for Organizer Messaging
- [x] Add WhatsApp messaging integration so attendee messages reach organizer on WhatsApp (via wa.me deep links)
- [x] Backend endpoint `forwardToWhatsApp` logs forwarding attempts and returns wa.me deep link URL
- [x] Frontend UI: attendee can send message to organizer via in-app chat + dedicated WhatsApp button
- [x] wa.me deep link as primary method (no WhatsApp Business API key required)

## Phase 12: Docusaurus Documentation Site
- [x] Create docs/ folder with Docusaurus scaffold
- [x] Write architecture overview documentation
- [x] Write feature documentation for all modules
- [x] Write setup and deployment guide
- [x] Write API reference for tRPC endpoints

## Phase 13: Login Page with Demo Accounts
- [x] Create login page with two demo account options (Attendee + Organizer)
- [x] Attendee demo account shows mobile map-first view, check-in, wayfinding, networking
- [x] Organizer demo account shows dashboard with attendance, requests, WhatsApp forwarding
- [x] Role-based routing after login (attendee vs organizer view)

## Phase 14: Rebrand to EventFlow
- [x] Update all references from "Find your Space" to "EventFlow"
