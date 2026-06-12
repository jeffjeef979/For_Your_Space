---
id: maps-wayfinding
title: Maps & Wayfinding
sidebar_position: 2
---

# Maps & Wayfinding

The map module is the primary view for attendees. It fills the screen and provides real-time navigation to the event venue with Street View approach imagery.

## Features

### Venue Map
The map loads centered on the event venue with an advanced marker. Attendees see the venue location immediately upon opening the app.

### Geolocation Tracking
When the attendee taps "Locate Me", the browser's Geolocation API (`watchPosition`) continuously tracks their position and displays it on the map with a blue dot.

### Directions & Routing
Tapping "Directions" calculates a walking route from the attendee's current position to the venue using the Google Maps Directions Service. The route is rendered as a polyline overlay.

### Street View Approach
Once a route is calculated, the Street View panel activates. It shows panoramic imagery at waypoints along the route, automatically advancing as the attendee moves. This helps attendees recognize landmarks and building entrances as they approach.

### Geo-Triggered Wayfinding
When the attendee's geolocation enters a configurable radius (default: 500m) of the venue, the wayfinding mode automatically activates with turn-by-turn visual guidance.

## Technical Implementation

```typescript
// Geolocation watch with high accuracy
navigator.geolocation.watchPosition(
  (pos) => {
    const { latitude, longitude } = pos.coords;
    // Update map marker and check proximity
    const distance = computeDistance(pos, venue);
    if (distance < PROXIMITY_THRESHOLD) {
      activateWayfinding();
    }
  },
  null,
  { enableHighAccuracy: true, maximumAge: 5000 }
);
```

### Street View Syncing

The Street View panorama is positioned at waypoints extracted from the route's `overview_path`. As the user moves, the closest waypoint is found and the panorama heading is calculated to face the venue.

```typescript
// Calculate heading from current position to venue
const heading = google.maps.geometry.spherical.computeHeading(
  currentLatLng,
  venueLatLng
);
streetViewPanorama.setPov({ heading, pitch: 0 });
streetViewPanorama.setPosition(closestWaypoint);
```

## Configuration

| Parameter | Default | Description |
|---|---|---|
| `PROXIMITY_THRESHOLD` | 500m | Distance to trigger auto-wayfinding |
| `STREET_VIEW_STEP_INTERVAL` | Every 3rd waypoint | How often to sample Street View images |
| `TRACKING_HIGH_ACCURACY` | `true` | Use GPS vs network location |
