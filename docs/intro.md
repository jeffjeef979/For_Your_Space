---
id: intro
title: Getting Started
sidebar_position: 1
slug: /
---

# Find your Space

**Find your Space** is an all-in-one event experience platform that helps direct the traffic flow of people at events. It combines real-time maps, geolocation wayfinding, event feeds, voice interaction, social networking, attendee check-in, and an organizer dashboard into a single unified mobile-first application.

## The Problem

Event organizers face a recurring challenge: attendees arrive confused about where to go, miss important sessions, and have no easy way to communicate with organizers in real time. Meanwhile, organizers struggle to monitor attendance, respond to requests, and manage the flow of people — especially when messages on platforms like Luma go unread.

## The Solution

Find your Space solves this by providing:

| For Attendees | For Organizers |
|---|---|
| Real-time map with geo-triggered wayfinding | Live attendance dashboard |
| Street View approach navigation | Real-time check-in monitoring |
| Voice assistant for queries | WhatsApp message forwarding |
| Digital name cards and networking | Request management queue |
| Smart event and people suggestions | Attendee location heatmap |
| Sequential check-in flow with WiFi reveal | Analytics and insights |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/find-your-space/event-hub-app.git
cd event-hub-app

# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Demo Accounts

The platform ships with two demo accounts for testing both user journeys:

| Role | Experience |
|---|---|
| **Attendee** | Mobile map-first view, check-in flow, wayfinding, networking, voice assistant |
| **Organizer** | Dashboard with real-time attendance, request queue, WhatsApp forwarding |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS 4, Framer Motion |
| Backend | Express 4, tRPC 11, Drizzle ORM |
| Database | MySQL (TiDB) |
| Maps | Google Maps JavaScript API (full suite) |
| Voice | Web Speech API + Whisper transcription |
| AI | LLM-powered intent classification and speaker research |
| Messaging | WhatsApp Business Cloud API |
| Design | iOS Liquid Glass design language |
