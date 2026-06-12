---
id: check-in
title: Check-In Flow
sidebar_position: 6
---

# Attendee Check-In Flow

The check-in module provides a sequential reveal experience after an attendee confirms their arrival at the venue.

## Flow Sequence

The check-in follows a strict sequential order — each step unlocks only after the previous is completed:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Arrival    │────▶│    WiFi      │────▶│    Table     │────▶│   Timeline   │
│ Confirmation │     │   Password   │     │   Number     │     │   Display    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Step 1: Arrival Confirmation
The attendee taps "I'm Here" to confirm their physical presence. This can optionally be gated by geolocation proximity (must be within 200m of venue).

### Step 2: WiFi Password Reveal
Once checked in, the WiFi network name and password are revealed. A "Copy" button allows one-tap copying to clipboard.

### Step 3: Table Number
The attendee's assigned table number is displayed with a visual indicator. For events without fixed seating, this step shows the designated area or zone.

### Step 4: Event Timeline
A compact timeline of the day's schedule is shown, highlighting the current and next sessions. This remains accessible throughout the event.

## Organizer Configuration

Organizers configure check-in parameters in the dashboard:

| Setting | Description |
|---|---|
| WiFi SSID | Network name to display |
| WiFi Password | Password to reveal after check-in |
| Table Assignments | CSV upload or manual assignment |
| Geo-Gate | Require proximity for check-in (optional) |
| Timeline | Event schedule with times and locations |

## Real-Time Dashboard Update

Each check-in immediately updates the organizer dashboard:
- Attendance count increments
- Attendee appears on the live map
- Check-in timestamp is logged
- Table occupancy updates
