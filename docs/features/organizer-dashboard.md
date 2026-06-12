---
id: organizer-dashboard
title: Organizer Dashboard
sidebar_position: 10
---

# Organizer Dashboard

The organizer dashboard is a distinct role-based view that provides real-time operational visibility into the event. It displays live attendance data, incoming requests, and communication tools.

## Features

### Real-Time Attendance Map
A Google Maps view showing the geolocation of checked-in attendees as markers. The map updates as new attendees check in, giving organizers a visual sense of crowd density and flow.

### Check-In List
A live-updating table showing:
- Attendee name and profile
- Check-in timestamp
- Assigned table number
- Current status (checked in, in session, left)

### Request Queue
All incoming voice commands, chat messages, and escalated queries appear in a prioritized queue. Each request shows:
- Attendee name and location
- Message content
- Timestamp
- Status (new, in progress, resolved)

### WhatsApp Integration
Requests that require immediate attention are automatically forwarded to the organizer's WhatsApp. The dashboard shows the sync status of each forwarded message.

## Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  EventFlow — Organizer Dashboard              │
│  TechSummit 2026 · 342/400 checked in              │
├─────────────────────────┬───────────────────────────┤
│                         │  Recent Check-Ins         │
│    Attendance Map       │  ┌─────────────────────┐  │
│    (Google Maps with    │  │ Sarah C. · 2:31 PM  │  │
│     attendee markers)   │  │ Alex K.  · 2:28 PM  │  │
│                         │  │ Mike T.  · 2:25 PM  │  │
│                         │  └─────────────────────┘  │
├─────────────────────────┴───────────────────────────┤
│  Incoming Requests                                   │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 🔴 NEW  Sarah: "Projector not working Room 3B" │ │
│  │ 🟡 ...  Alex: "Where is the lunch area?"       │ │
│  │ 🟢 Done Mike: "Need extra chair at Table 5"    │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Access Control

The organizer dashboard is only accessible to users with the `admin` role. The role is assigned:
- Automatically to the project owner (first user)
- Manually via database update for additional organizers
- Via the admin panel in future versions

## Real-Time Updates

The dashboard polls for updates every 5 seconds using tRPC query refetching. This provides near-real-time visibility without the complexity of WebSocket infrastructure.

```typescript
// Auto-refresh every 5 seconds
const { data: checkIns } = trpc.event.getCheckIns.useQuery(
  { eventId },
  { refetchInterval: 5000 }
);
```
