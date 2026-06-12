---
id: smart-suggestions
title: Smart Suggestions
sidebar_position: 8
---

# Smart Suggestions

The "For You" module uses AI to recommend events and people to connect with based on the attendee's professional background, interests, and LinkedIn profile.

## Features

### People Recommendations
The AI analyzes the attendee's profile (role, industry, skills) against all other participants and surfaces the most relevant connections:
- Complementary skills (e.g., a designer matched with a developer)
- Same industry but different company (potential collaborators)
- Shared interests or projects
- Speakers whose topics align with the attendee's work

### Event Recommendations
Based on the attendee's background, the AI suggests sessions they would find most valuable:
- Sessions matching their industry or expertise
- Workshops that develop skills they're interested in
- Panels featuring speakers from their network

### Relevance Scoring
Each suggestion includes a relevance score (0–100) explaining why the match was made:

```
┌─────────────────────────────────────┐
│ 🎯 92% Match                        │
│                                     │
│ Alex Kim — Product Lead, Stripe     │
│ "Both work in fintech, Alex spoke   │
│  at your previous event on APIs"    │
│                                     │
│ [View Profile]  [Connect]           │
└─────────────────────────────────────┘
```

## How It Works

1. **Profile Ingestion** — User's LinkedIn data (role, company, skills, industry) is extracted during registration
2. **Embedding Generation** — Professional profiles are converted to vector embeddings
3. **Similarity Matching** — Cosine similarity finds the closest matches
4. **LLM Explanation** — The AI generates a human-readable reason for each suggestion
5. **Ranking** — Results are sorted by relevance score and displayed in the "For You" tab

## Privacy

- Suggestions are computed server-side; raw profile data is never exposed to other attendees
- Attendees can opt out of appearing in others' suggestions
- The matching algorithm does not use personal contact information
