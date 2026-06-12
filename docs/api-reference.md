---
id: api-reference
title: API Reference
sidebar_position: 4
---

# API Reference

All API endpoints are implemented as tRPC procedures. The client consumes them via typed hooks — no manual REST calls needed.

## Authentication

All protected procedures require a valid session cookie set by the Manus OAuth flow. Use `protectedProcedure` for authenticated endpoints and `publicProcedure` for open access.

## Event Procedures

### `event.getActive`

Returns the currently active event with venue details.

```typescript
// Client usage
const { data: event } = trpc.event.getActive.useQuery();

// Response type
{
  id: number;
  title: string;
  venueName: string;
  venueAddress: string;
  venueLat: number;
  venueLng: number;
  startTime: Date;
  endTime: Date;
  wifiSsid: string | null;
  wifiPassword: string | null;
}
```

### `event.checkIn`

Records an attendee's arrival at the venue.

```typescript
// Client usage
const checkIn = trpc.event.checkIn.useMutation();
await checkIn.mutateAsync({ eventId: 1, latitude: 1.2834, longitude: 103.8607 });

// Response
{ success: true, tableNumber: 12, wifiPassword: "EventWiFi2026" }
```

### `event.getCheckIns`

Returns all check-ins for an event (organizer only).

```typescript
// Client usage (with polling)
const { data } = trpc.event.getCheckIns.useQuery(
  { eventId: 1 },
  { refetchInterval: 5000 }
);

// Response type
Array<{
  userId: number;
  userName: string;
  checkedInAt: Date;
  tableNumber: number;
  latitude: number;
  longitude: number;
}>
```

## Voice Procedures

### `voice.process`

Processes a voice transcript and returns an AI-generated response.

```typescript
// Client usage
const processVoice = trpc.voice.process.useMutation();
const result = await processVoice.mutateAsync({
  transcript: "Where is my table?",
  eventId: 1,
});

// Response
{
  intent: "table" | "navigation" | "schedule" | "speaker_research" | "networking" | "general";
  response: string;
  forwardedToWhatsApp: boolean;
}
```

## Commute Procedures

### `commute.calculate`

Calculates travel time between two locations.

```typescript
// Client usage
const { data } = trpc.commute.calculate.useQuery({
  originLat: 1.2834,
  originLng: 103.8607,
  destLat: 1.2930,
  destLng: 103.8558,
});

// Response
{
  driving: { duration: "12 min", distance: "4.2 km" };
  transit: { duration: "18 min", distance: "4.8 km" };
  walking: { duration: "25 min", distance: "2.1 km" };
}
```

## WhatsApp Procedures

### `whatsapp.sendToOrganizer`

Forwards an attendee message to the organizer's WhatsApp.

```typescript
// Client usage
const send = trpc.whatsapp.sendToOrganizer.useMutation();
await send.mutateAsync({
  message: "The projector in Room 3B isn't working",
  eventId: 1,
});

// Response
{ sent: true, method: "cloud_api" | "deep_link" | "in_app_only" }
```

## Suggestions Procedures

### `suggestions.getPeople`

Returns AI-recommended people to connect with.

```typescript
// Client usage
const { data } = trpc.suggestions.getPeople.useQuery({ eventId: 1 });

// Response type
Array<{
  userId: number;
  name: string;
  role: string;
  company: string;
  relevanceScore: number;
  reason: string;
}>
```

### `suggestions.getEvents`

Returns AI-recommended sessions to attend.

```typescript
// Client usage
const { data } = trpc.suggestions.getEvents.useQuery({ eventId: 1 });

// Response type
Array<{
  sessionId: number;
  title: string;
  relevanceScore: number;
  reason: string;
}>
```
