import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Your table is A3, located in Section A near the main stage." } }],
  }),
}));

// Mock the map module
vi.mock("./_core/map", () => ({
  makeRequest: vi.fn().mockResolvedValue({
    status: "OK",
    routes: [{
      legs: [{
        duration: { text: "15 mins", value: 900 },
        distance: { text: "8.2 km", value: 8200 },
        start_address: "Marina Bay Sands, Singapore",
        end_address: "Suntec City, Singapore",
      }],
    }],
  }),
}));

// Mock the dataApi module
vi.mock("./_core/dataApi", () => ({
  callDataApi: vi.fn().mockResolvedValue({
    name: "Andrej Karpathy",
    headline: "AI Researcher & Educator",
    summary: "Former Director of AI at Tesla",
  }),
}));

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("event router", () => {
  describe("event.list", () => {
    it("returns an empty array when database is not available", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.list();
      expect(result).toEqual([]);
    });
  });

  describe("event.get", () => {
    it("returns null when database is not available", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.get({ id: 1 });
      expect(result).toBeNull();
    });
  });

  describe("event.timeline", () => {
    it("returns an empty array when database is not available", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.timeline({ eventId: 1 });
      expect(result).toEqual([]);
    });
  });

  describe("event.processVoice", () => {
    it("processes a voice query and returns a response with intent classification", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.processVoice({
        query: "Where is my table?",
        eventId: 1,
        tableNumber: "A3",
        attendeeName: "Test User",
      });

      expect(result).toHaveProperty("response");
      expect(result).toHaveProperty("intent");
      expect(typeof result.response).toBe("string");
      expect(result.response.length).toBeGreaterThan(0);
      expect(result.intent).toBe("navigation");
    });

    it("classifies service requests correctly", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.processVoice({
        query: "Can we get more water at Table B1?",
        eventId: 1,
      });
      expect(result.intent).toBe("service_request");
    });

    it("classifies informational queries correctly", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.processVoice({
        query: "What time does the workshop start?",
        eventId: 1,
      });
      expect(result.intent).toBe("informational");
    });

    it("classifies speaker research queries correctly", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.processVoice({
        query: "Tell me about the keynote speaker",
        eventId: 1,
      });
      expect(result.intent).toBe("speaker_research");
    });

    it("classifies networking queries correctly", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.processVoice({
        query: "Who should I connect with in AI?",
        eventId: 1,
      });
      expect(result.intent).toBe("networking");
    });

    it("defaults to 'other' for unclassified queries", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.processVoice({
        query: "Hello there",
        eventId: 1,
      });
      expect(result.intent).toBe("other");
    });
  });

  describe("event.commute", () => {
    it("calculates commute between two addresses", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.commute({
        origin: "Marina Bay Sands, Singapore",
        destination: "Suntec City, Singapore",
        mode: "driving",
      });

      expect(result).toHaveProperty("duration");
      expect(result).toHaveProperty("distance");
      expect(result).toHaveProperty("durationValue");
      expect(result.duration).toBe("15 mins");
      expect(result.distance).toBe("8.2 km");
      expect(result.durationValue).toBe(900);
    });

    it("defaults to driving mode when mode is not specified", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.commute({
        origin: "Marina Bay Sands, Singapore",
        destination: "Suntec City, Singapore",
      });

      expect(result.duration).toBe("15 mins");
    });
  });

  describe("event.lookupProfile", () => {
    it("looks up a LinkedIn profile by username", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.lookupProfile({
        username: "andrejkarpathy",
      });

      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("headline");
      expect((result as any).name).toBe("Andrej Karpathy");
    });
  });

  describe("event.checkIn", () => {
    it("returns check-in data with table and wifi info when db is unavailable", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.checkIn({
        eventId: 1,
        name: "Test User",
        email: "test@example.com",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("tableNumber");
      expect(result).toHaveProperty("wifiSsid");
      expect(result).toHaveProperty("wifiPassword");
      expect(result.wifiSsid).toBe("TechSummit_2026");
      expect(result.wifiPassword).toBe("TS2026#Secure!");
    });
  });

  describe("event.liveStats", () => {
    it("returns zero counts when database is not available", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.liveStats({ eventId: 1 });
      expect(result).toEqual({ checkedIn: 0, total: 0, pendingRequests: 0 });
    });
  });

  describe("event.voiceRequests", () => {
    it("returns empty array when database is not available", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.event.voiceRequests({ eventId: 1 });
      expect(result).toEqual([]);
    });
  });
});
