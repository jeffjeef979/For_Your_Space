#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# EventHub — All-in-One Event Application
# Single shell script to install, migrate, test, and run the application.
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║        EventHub — All-in-One Event Platform             ║"
echo "║        Setup & Run Script                               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# ─── Step 1: Install dependencies ────────────────────────────────────────────
echo "📦 [1/4] Installing dependencies..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
echo "✅ Dependencies installed."
echo ""

# ─── Step 2: Push database schema ────────────────────────────────────────────
echo "🗄️  [2/4] Pushing database schema..."
pnpm db:push
echo "✅ Database schema up to date."
echo ""

# ─── Step 3: Run tests ───────────────────────────────────────────────────────
echo "🧪 [3/4] Running tests..."
pnpm test
echo "✅ All tests passed."
echo ""

# ─── Step 4: Start development server ────────────────────────────────────────
echo "🚀 [4/4] Starting development server..."
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  App running at: http://localhost:3000                  ║"
echo "║                                                         ║"
echo "║  Features:                                              ║"
echo "║  • Interactive Google Maps with geolocation             ║"
echo "║  • Luma-style event feed with conflict detection        ║"
echo "║  • AI Voice Assistant with speaker research             ║"
echo "║  • Digital Name Cards (LinkedIn + Instagram)            ║"
echo "║  • Commute Planner (driving + transit)                  ║"
echo "║  • Smart Suggestions (people & events for you)          ║"
echo "║  • Attendee Check-In flow                               ║"
echo "║  • Organizer Dashboard (real-time monitoring)           ║"
echo "║                                                         ║"
echo "║  Press Ctrl+C to stop.                                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
pnpm run dev
