CREATE TABLE `attendees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`tableNumber` varchar(16),
	`checkInStatus` enum('pending','confirmed','checked_in') NOT NULL DEFAULT 'pending',
	`checkedInAt` timestamp,
	`linkedinUrl` text,
	`instagramHandle` varchar(64),
	`avatarUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`venueName` varchar(255),
	`venueAddress` text,
	`venueLat` varchar(32),
	`venueLng` varchar(32),
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`status` enum('upcoming','active','ended') NOT NULL DEFAULT 'upcoming',
	`lumaEventId` varchar(128),
	`coverImageUrl` text,
	`wifiSsid` varchar(128),
	`wifiPassword` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timelineItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`location` varchar(255),
	`sortOrder` int DEFAULT 0,
	CONSTRAINT `timelineItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voiceRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`attendeeId` int,
	`attendeeName` varchar(255),
	`tableNumber` varchar(16),
	`transcript` text NOT NULL,
	`aiResponse` text,
	`intent` enum('informational','service_request','navigation','other') DEFAULT 'other',
	`status` enum('pending','answered','escalated') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voiceRequests_id` PRIMARY KEY(`id`)
);
