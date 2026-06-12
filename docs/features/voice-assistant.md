---
id: voice-assistant
title: Voice Assistant
sidebar_position: 4
---

# Voice Assistant

The AI-powered voice assistant allows attendees to speak natural language queries about the event. It transcribes speech in real time, classifies intent, and returns contextual responses.

## Features

### Tap-to-Speak
Attendees tap the microphone button to start recording. The Web Speech API provides real-time transcription displayed as the user speaks.

### Intent Classification
The LLM classifies each query into one of these intents:

| Intent | Example Query | Response Type |
|---|---|---|
| `navigation` | "Where is the main hall?" | Directions + map highlight |
| `table` | "What's my table number?" | Table assignment lookup |
| `schedule` | "When is the next session?" | Timeline with upcoming events |
| `speaker_research` | "Tell me about Dr. Chen" | LinkedIn/bio summary |
| `networking` | "Who should I meet here?" | Smart suggestions |
| `general` | "What's the WiFi password?" | Direct answer |

### Speaker Research
When an attendee asks about a speaker, the AI searches for their professional background (LinkedIn, company, expertise) and provides a concise summary to help attendees decide which sessions to attend.

### WhatsApp Escalation
If the AI cannot resolve a query or the attendee explicitly requests organizer help, the message is forwarded to the organizer's WhatsApp with context about who is asking and what they need.

## Technical Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Speech  │───▶│Transcribe│───▶│ Classify │───▶│ Respond  │
│  Input   │    │ (Whisper)│    │  (LLM)   │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  If urgent → │
                              │  WhatsApp    │
                              └──────────────┘
```

## Voice Commands Reference

Example commands attendees can use:

- "Where is my table?"
- "How do I get to Room 3B?"
- "What's happening next?"
- "Tell me about the keynote speaker"
- "Who here works in AI?"
- "I need help from the organizer"
- "What's the WiFi password?"
