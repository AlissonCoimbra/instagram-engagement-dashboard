CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`color` varchar(7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagement_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`period` varchar(50) NOT NULL,
	`dmsReceived` int DEFAULT 0,
	`dmsResponded` int DEFAULT 0,
	`commentsReceived` int DEFAULT 0,
	`commentsResponded` int DEFAULT 0,
	`avgResponseTime` int DEFAULT 0,
	`saves` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagement_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagement_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`period` varchar(50) NOT NULL,
	`followers` int DEFAULT 0,
	`followerGrowth` int DEFAULT 0,
	`totalReach` int DEFAULT 0,
	`totalImpressions` int DEFAULT 0,
	`engagementRate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagement_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`question` text NOT NULL,
	`frequency` int DEFAULT 1,
	`categoryId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('dm','comment') NOT NULL,
	`content` text,
	`authorName` varchar(255),
	`sentiment` enum('positive','neutral','negative') DEFAULT 'neutral',
	`isResponded` int DEFAULT 0,
	`responseTime` int,
	`tags` varchar(500),
	`category` varchar(100),
	`isHighlight` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `engagement_data` ADD CONSTRAINT `engagement_data_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `engagement_metrics` ADD CONSTRAINT `engagement_metrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faqs` ADD CONSTRAINT `faqs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faqs` ADD CONSTRAINT `faqs_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interactions` ADD CONSTRAINT `interactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;