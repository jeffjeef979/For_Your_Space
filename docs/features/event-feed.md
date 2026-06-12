---
id: event-feed
title: Event Feed
sidebar_position: 3
---

# Event Feed

The event feed displays upcoming and active sessions in a Luma-inspired card layout. It includes RSVP management, schedule conflict detection, and speaker information.

## Features

### Session Cards
Each event is displayed as a clean card showing the session title, time, speaker, location, and attendee count. Cards use the iOS Liquid Glass aesthetic with frosted backgrounds.

### RSVP Management
Attendees can RSVP to sessions directly from the feed. The RSVP state is persisted and reflected in the organizer dashboard.

### Schedule Conflict Detection
When an attendee RSVPs to overlapping sessions, the system automatically detects the conflict and displays a warning with the time overlap. Combined with the commute planner, it also shows whether travel between venues is feasible.

### Live Status Indicators
Sessions are tagged with status pills: "Live" (currently happening), "Next" (starting within 30 minutes), or time-until-start for future sessions.

## Card Layout

```
┌─────────────────────────────────────┐
│ 🟢 Live Now                         │
│                                     │
│ Keynote: Future of AI               │
│ Dr. Sarah Chen · Main Hall          │
│ 9:00 AM – 10:30 AM                 │
│                                     │
│ 👥 156 attending    ⭐ RSVP'd       │
└─────────────────────────────────────┘
```

## Integration with Luma

The event feed is designed to sync with Luma event data. When connected, it pulls:

- Event title, description, and cover image
- Session schedule and speaker details
- RSVP counts and attendee lists
- Venue and location data

For standalone use without Luma, events can be configured directly in the organizer dashboard.
