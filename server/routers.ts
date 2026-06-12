import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { makeRequest, DirectionsResult } from "./_core/map";
import { callDataApi } from "./_core/dataApi";
import { getDb } from "./db";
import { events, attendees, voiceRequests, timelineItems } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const eventRouter = router({
  // Get all events
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const result = await db.select().from(events).limit(20);
    return result;
  }),

  // Get single event
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(events).where(eq(events.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  // Get timeline for event
  timeline: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(timelineItems)
        .where(eq(timelineItems.eventId, input.eventId))
        .orderBy(timelineItems.sortOrder);
      return result;
    }),

  // Process voice query with LLM — includes speaker research capability
  processVoice: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(500),
      eventId: z.number(),
      attendeeId: z.number().optional(),
      tableNumber: z.string().optional(),
      attendeeName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Classify intent
      const q = input.query.toLowerCase();
      let intent: "informational" | "service_request" | "navigation" | "speaker_research" | "networking" | "other" = "other";

      if (q.includes("speaker") || q.includes("keynote") || q.includes("background") || q.includes("who is") || q.includes("tell me about")) {
        intent = "speaker_research";
      } else if (q.includes("connect") || q.includes("network") || q.includes("meet") || q.includes("who should")) {
        intent = "networking";
      } else if (q.includes("water") || q.includes("food") || q.includes("chair") || q.includes("clean") || q.includes("need more")) {
        intent = "service_request";
      } else if (q.includes("where") || q.includes("direction") || q.includes("find") || q.includes("location") || q.includes("restroom") || q.includes("get to") || q.includes("how do i get")) {
        intent = "navigation";
      } else if (q.includes("what time") || q.includes("when") || q.includes("schedule") || q.includes("wifi") || q.includes("password") || q.includes("table")) {
        intent = "informational";
      }

      // For speaker research, try to look up LinkedIn data
      let speakerContext = "";
      if (intent === "speaker_research") {
        try {
          // Extract speaker name from query
          const speakerNames = ["fei-fei li", "andrej karpathy", "sarah chen", "marcus rivera"];
          const matchedSpeaker = speakerNames.find(name => q.includes(name.toLowerCase()));
          if (matchedSpeaker) {
            const linkedinUsernames: Record<string, string> = {
              "fei-fei li": "faboratory",
              "andrej karpathy": "andrejkarpathy",
              "sarah chen": "sarahchen",
              "marcus rivera": "marcusrivera",
            };
            const username = linkedinUsernames[matchedSpeaker];
            if (username) {
              const profileData = await callDataApi("LinkedIn/get_user_profile_by_username", {
                query: { username },
              }) as any;
              if (profileData && !profileData.error) {
                speakerContext = `\nLinkedIn Profile Data for ${matchedSpeaker}: ${JSON.stringify(profileData).slice(0, 1500)}`;
              }
            }
          }
        } catch (e) {
          // Non-critical: continue without LinkedIn data
          console.warn("[SpeakerResearch] LinkedIn lookup failed:", e);
        }
      }

      const eventContext = `
You are EventHub AI, an intelligent assistant for TechSummit 2026 at Marina Bay Sands Expo, Singapore.
Event date: June 12, 2026, 9:00 AM – 6:00 PM.
WiFi: SSID "TechSummit_2026", Password "TS2026#Secure!".
The attendee's table number is: ${input.tableNumber ?? "A3"}.

Speakers at this event:
- Dr. Fei-Fei Li: Professor of CS at Stanford, Co-Director of Stanford HAI, pioneer in computer vision, created ImageNet.
- Andrej Karpathy: AI Researcher & Educator, former Director of AI at Tesla, key contributor to GPT research.
- Sarah Chen: Product Lead at Stripe, leading enterprise platform strategy.
- Marcus Rivera: CTO at Nexus AI, ex-Google Brain, building next-gen AI infrastructure.

Schedule:
- 9:00 AM: Registration & Welcome Coffee (Lobby)
- 10:00 AM: Opening Keynote: AI in 2026 (Main Hall) — Speaker: Dr. Fei-Fei Li
- 11:30 AM: Panel: Future of Work (Hall A) — CURRENTLY ACTIVE
- 1:00 PM: Networking Lunch (Atrium)
- 2:30 PM: Workshop: LLM Applications (Room 301) — Speaker: Andrej Karpathy
- 4:00 PM: Startup Showcase (Exhibition Floor)
- 5:30 PM: Closing Remarks & Awards (Main Hall)

Other events this week (for commute/scheduling questions):
- AI & Future of Work: Suntec City Hall 4, Jun 18, 2:00 PM
- Design Systems Workshop: The Hive Carpenter, Jun 18, 3:00 PM (overlaps with above)
- Startup Pitch Night: Block71 Singapore, Jun 20, 7:00 PM

Venue layout: Main Hall (ground floor), Hall A (level 1), Room 301 (level 3), Atrium (ground floor, east wing), Exhibition Floor (ground floor, west wing). Restrooms near every elevator bank.
${speakerContext}

Answer the attendee's question concisely and helpfully. For speaker background questions, provide detailed professional context. For networking questions, suggest relevant attendees based on shared interests. For service requests, acknowledge and confirm staff notification.
`;

      const llmResult = await invokeLLM({
        messages: [
          { role: "system", content: eventContext },
          { role: "user", content: input.query },
        ],
      });

      const rawContent = llmResult.choices?.[0]?.message?.content;
      const response = typeof rawContent === "string" ? rawContent : "I'm sorry, I couldn't process that. Please ask a staff member for help.";

      // Log the request
      try {
        const db = await getDb();
        if (db) {
          await db.insert(voiceRequests).values({
            eventId: input.eventId,
            attendeeId: input.attendeeId,
            attendeeName: input.attendeeName ?? "Guest",
            tableNumber: input.tableNumber,
            transcript: input.query,
            aiResponse: response,
            intent,
            status: intent === "service_request" ? "pending" : "answered",
          });
        }
      } catch (e) {
        console.warn("[VoiceRequest] Failed to log:", e);
      }

      return { response, intent };
    }),

  // Calculate commute between two addresses
  commute: publicProcedure
    .input(z.object({
      origin: z.string(),
      destination: z.string(),
      mode: z.enum(["driving", "transit", "walking"]).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await makeRequest<DirectionsResult>("/maps/api/directions/json", {
          origin: input.origin,
          destination: input.destination,
          mode: input.mode ?? "driving",
        });
        if (result.status === "OK" && result.routes.length > 0) {
          const leg = result.routes[0].legs[0];
          return {
            duration: leg.duration.text,
            distance: leg.distance.text,
            durationValue: leg.duration.value,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
          };
        }
        return { duration: "N/A", distance: "N/A", durationValue: 0, startAddress: "", endAddress: "" };
      } catch (e) {
        console.warn("[Commute] Directions API failed:", e);
        return { duration: "N/A", distance: "N/A", durationValue: 0, startAddress: "", endAddress: "" };
      }
    }),

  // Lookup speaker/attendee LinkedIn profile
  lookupProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      try {
        const profileData = await callDataApi("LinkedIn/get_user_profile_by_username", {
          query: { username: input.username },
        });
        return profileData;
      } catch (e) {
        console.warn("[ProfileLookup] Failed:", e);
        return null;
      }
    }),

  // Attendee check-in
  checkIn: publicProcedure
    .input(z.object({
      eventId: z.number(),
      name: z.string(),
      email: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, tableNumber: "A3", wifiSsid: "TechSummit_2026", wifiPassword: "TS2026#Secure!" };

      const existing = await db.select().from(attendees)
        .where(eq(attendees.eventId, input.eventId))
        .limit(1);

      if (existing.length > 0) {
        await db.update(attendees)
          .set({ checkInStatus: "checked_in", checkedInAt: new Date() })
          .where(eq(attendees.id, existing[0].id));
        return {
          success: true,
          tableNumber: existing[0].tableNumber ?? "A3",
          wifiSsid: "TechSummit_2026",
          wifiPassword: "TS2026#Secure!",
        };
      }

      return {
        success: true,
        tableNumber: "A3",
        wifiSsid: "TechSummit_2026",
        wifiPassword: "TS2026#Secure!",
      };
    }),

  // Organizer: get live stats
  liveStats: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { checkedIn: 0, total: 0, pendingRequests: 0 };

      const allAttendees = await db.select().from(attendees).where(eq(attendees.eventId, input.eventId));
      const checkedIn = allAttendees.filter(a => a.checkInStatus === "checked_in").length;
      const pending = await db.select().from(voiceRequests)
        .where(eq(voiceRequests.eventId, input.eventId));
      const pendingRequests = pending.filter(r => r.status === "pending").length;

      return { checkedIn, total: allAttendees.length, pendingRequests };
    }),

  // Organizer: get voice requests
  voiceRequests: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(voiceRequests)
        .where(eq(voiceRequests.eventId, input.eventId))
        .orderBy(voiceRequests.createdAt);
      return result;
    }),

  // WhatsApp forwarding: log message forwarding attempt and return wa.me deep link
  forwardToWhatsApp: publicProcedure
    .input(z.object({
      eventId: z.number(),
      attendeeName: z.string(),
      message: z.string(),
      organizerPhone: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      // Log the forwarding attempt in voice_requests as a service_request
      if (db) {
        await db.insert(voiceRequests).values({
          eventId: input.eventId,
          attendeeId: 0,
          transcript: input.message,
          intent: "service_request",
          aiResponse: `Forwarded to organizer WhatsApp: ${input.organizerPhone}`,
          status: "pending",
        });
      }
      // Build the wa.me deep link (fallback approach — no WhatsApp Business API needed)
      const encodedMsg = encodeURIComponent(`[EventFlow] ${input.attendeeName}: ${input.message}`);
      const waUrl = `https://wa.me/${input.organizerPhone}?text=${encodedMsg}`;
      return { success: true, waUrl, method: "deep_link" };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  event: eventRouter,
});

export type AppRouter = typeof appRouter;
