---
id: commute-planner
title: Commute Planner
sidebar_position: 7
---

# Commute Planner

The commute planner calculates travel time and distance between events, helping attendees plan their schedule when sessions are at different venues or when events overlap.

## Features

### Multi-Modal Travel Time
For any two events, the planner shows:
- **Driving** — estimated time by car including traffic
- **Transit** — public transport time (bus, MRT, train)
- **Walking** — pedestrian route time

### Schedule Feasibility
When an attendee has RSVPd to events at different locations, the planner automatically checks if travel between them is feasible given the gap between sessions.

### Conflict Resolution
If travel time exceeds the gap between sessions, the planner flags the conflict and suggests alternatives:
- Arrive late to the second session
- Leave early from the first session
- Skip one session (with recommendation based on preferences)

## Technical Implementation

The commute planner uses the Google Maps Directions API via the server-side proxy:

```typescript
// Server-side route calculation
const response = await makeRequest(
  `/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=transit`
);

return {
  driving: response.routes[0].legs[0].duration.text,
  transit: transitResponse.routes[0].legs[0].duration.text,
  distance: response.routes[0].legs[0].distance.text,
};
```

## UI Presentation

The commute panel shows event pairs with travel estimates:

```
┌─────────────────────────────────────┐
│ 🚗 Keynote → Workshop A            │
│    Marina Bay → Suntec City         │
│                                     │
│    🚗 12 min  🚌 18 min  🚶 25 min │
│    Gap: 30 min  ✅ Feasible         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚠️ Workshop A → Panel Discussion    │
│    Suntec City → One Raffles        │
│                                     │
│    🚗 8 min   🚌 15 min  🚶 22 min │
│    Gap: 10 min  ⚠️ Tight by transit │
└─────────────────────────────────────┘
```
