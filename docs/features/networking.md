---
id: networking
title: Networking & Name Cards
sidebar_position: 5
---

# Networking & Digital Name Cards

The networking module displays LinkedIn-style digital name cards for all event participants, enabling in-event professional connections.

## Features

### Digital Name Cards
Each attendee has a profile card showing:
- Name and professional headline
- Company and role
- Industry and skills tags
- LinkedIn and Instagram links
- Mutual connections indicator

### Profile Discovery
Attendees can browse all participants, filtered by industry, company, or skills. Cards are sorted by relevance to the current user's background.

### Social Integration
Cards link directly to LinkedIn and Instagram profiles. Tapping a social icon opens the respective app or profile page for immediate connection.

### Connection Suggestions
The AI analyzes attendee profiles and suggests relevant connections based on shared interests, complementary skills, or industry overlap.

## Card Design

Cards follow the iOS Liquid Glass aesthetic:

```
┌─────────────────────────────────────┐
│  ┌───┐                              │
│  │ 👤│  Sarah Chen                   │
│  └───┘  VP Engineering · TechCorp   │
│                                     │
│  🏷️ AI · Machine Learning · Python  │
│                                     │
│  [LinkedIn]  [Instagram]            │
│                                     │
│  💡 "3 mutual connections"          │
└─────────────────────────────────────┘
```

## Privacy Considerations

- Attendees opt-in to profile visibility during registration
- Social links are only shown if the attendee has provided them
- The networking panel is only accessible to checked-in attendees
- No contact information is shared without explicit consent
