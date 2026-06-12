---
id: whatsapp-connector
title: WhatsApp Connector
sidebar_position: 9
---

# WhatsApp Connector

The WhatsApp connector solves the core problem: **organizers don't read messages on Luma**. By forwarding attendee messages directly to the organizer's WhatsApp, urgent requests get immediate attention.

## Problem Statement

Event platforms like Luma have built-in messaging, but organizers rarely check these during live events. They're busy managing logistics and their phone is their primary communication device. WhatsApp is where they actually respond.

## Solution Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐
│ Attendee │────▶│  Server  │────▶│  WhatsApp    │────▶│Organizer │
│  (Chat)  │     │  (tRPC)  │     │  Cloud API   │     │ (Phone)  │
└──────────┘     └──────────┘     └──────────────┘     └──────────┘
```

## Implementation Options

### Option A: WhatsApp Business Cloud API (Full Integration)

Requires a Meta Business account and WhatsApp Business API access:

```typescript
// Server-side: Forward message to organizer
const response = await fetch(
  `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: ORGANIZER_PHONE,
      type: 'text',
      text: {
        body: `[EventFlow] ${attendeeName}: ${message}`
      }
    })
  }
);
```

### Option B: wa.me Deep Link (Zero-Config Fallback)

No API setup required — opens WhatsApp directly on the attendee's device:

```typescript
// Client-side: Open WhatsApp with pre-filled message
const waLink = `https://wa.me/${organizerPhone}?text=${encodeURIComponent(message)}`;
window.open(waLink, '_blank');
```

## Configuration

| Setting | Description | Required |
|---|---|---|
| `WHATSAPP_TOKEN` | Meta Cloud API access token | Option A only |
| `WHATSAPP_PHONE_NUMBER_ID` | Business phone number ID | Option A only |
| `ORGANIZER_PHONE` | Organizer's WhatsApp number (with country code) | Both options |

## Message Format

Messages forwarded to the organizer include context:

```
[EventFlow] 🎫 TechSummit 2026
From: Sarah Chen (Table 12)
Time: 2:34 PM

"Hi, the projector in Room 3B isn't working.
Can someone help?"

---
Reply here or in the app dashboard.
```

## Fallback Strategy

The system uses a tiered approach:

1. **Try Cloud API** — If configured, send via WhatsApp Business API
2. **Fallback to wa.me** — If API fails or isn't configured, open deep link
3. **In-app notification** — Always log the message in the organizer dashboard regardless
