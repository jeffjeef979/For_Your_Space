---
id: architecture
title: Architecture
sidebar_position: 2
---

# System Architecture

Find your Space follows a full-stack serverless-ready architecture designed for real-time event experiences with minimal latency.

## High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React 19)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Map View │ │Event Feed│ │Voice/Chat│ │  Network   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│       │             │            │              │         │
│       └─────────────┴────────────┴──────────────┘         │
│                         │ tRPC                            │
└─────────────────────────┼─────────────────────────────────┘
                          │
┌─────────────────────────┼─────────────────────────────────┐
│                   Server (Express + tRPC)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐   │
│  │  Auth    │ │  Events  │ │   Voice  │ │  WhatsApp  │   │
│  │  Router  │ │  Router  │ │  Router  │ │  Router    │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘   │
│       │             │            │              │          │
│  ┌────┴─────────────┴────────────┴──────────────┴─────┐   │
│  │              Drizzle ORM + MySQL (TiDB)            │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Mobile-First, Phone-Optimized

The entire UI is designed for the 375–430px viewport. The map fills the screen as the primary view because attendees use the app while walking to and navigating within the venue. Bottom navigation follows iOS conventions.

### iOS Liquid Glass Design Language

All panels use frosted glass (`backdrop-filter: blur`) with translucent layers, creating depth without visual clutter. This matches the aesthetic of iOS 18+ and feels native on mobile Safari.

### tRPC End-to-End Type Safety

Every API call from client to server is fully typed. Procedures are defined once in `server/routers.ts` and consumed via `trpc.*` hooks in React — no REST routes, no Axios, no shared contract files.

### Role-Based Access

| Role | Access |
|---|---|
| `user` (Attendee) | Map, events, check-in, voice, networking, commute planner |
| `admin` (Organizer) | All attendee features + dashboard, request queue, WhatsApp forwarding |

Roles are stored in the `users` table and checked via `ctx.user.role` in protected procedures.

### Real-Time Without WebSockets (Phase 1)

The initial implementation uses tRPC query polling (refetch every 5–10s) for the organizer dashboard. This keeps the architecture simple while still providing near-real-time updates. WebSocket upgrade is planned for Phase 2.

## Data Flow

### Attendee Check-In Flow

```
1. Attendee opens app → sees map with venue marker
2. Geolocation detects proximity → wayfinding auto-activates
3. Attendee taps "I'm Here" → check-in recorded in DB
4. Sequential reveal: WiFi password → table number → event timeline
5. Organizer dashboard updates in real-time
```

### Voice Command Flow

```
1. Attendee taps mic → Web Speech API captures audio
2. Transcript sent to server via tRPC mutation
3. LLM classifies intent (navigation, table, schedule, speaker_research, networking)
4. Response generated and returned to client
5. If organizer-relevant → forwarded to WhatsApp
```

### WhatsApp Message Flow

```
1. Attendee sends message via in-app chat
2. Server receives via tRPC mutation
3. Message formatted and sent to organizer's WhatsApp via Cloud API
4. Organizer responds on WhatsApp → webhook receives reply
5. Reply displayed in attendee's chat (or via wa.me deep link fallback)
```

## File Structure

```
event-hub-app/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Login/landing page
│   │   │   ├── EventPlatform.tsx # Main unified dashboard
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   ├── Map.tsx           # Google Maps integration
│   │   │   ├── AIChatBox.tsx     # Chat interface
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── index.css            # iOS Liquid Glass tokens
│   │   └── App.tsx              # Routes & layout
├── server/
│   ├── routers.ts               # tRPC procedures
│   ├── db.ts                    # Database helpers
│   └── _core/                   # Framework internals
├── drizzle/
│   └── schema.ts               # Database schema
└── docs/                        # This documentation (Docusaurus)
```

## External Integrations

| Service | Purpose | Authentication |
|---|---|---|
| Google Maps JS API | Maps, directions, Street View, geocoding | Manus proxy (automatic) |
| WhatsApp Cloud API | Organizer message forwarding | Business API token |
| Whisper API | Voice transcription | Built-in Forge API |
| LLM (Claude/GPT) | Intent classification, speaker research | Built-in Forge API |
| Manus OAuth | User authentication | Platform-managed |
