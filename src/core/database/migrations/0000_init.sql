CREATE TABLE `content_meta` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	CONSTRAINT "content_meta_single_row" CHECK("content_meta"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE `daily_activity` (
	`user_id` text NOT NULL,
	`activity_date` text NOT NULL,
	`synced_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	PRIMARY KEY(`user_id`, `activity_date`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `daily_activity_pending_idx` ON `daily_activity` (`user_id`) WHERE "daily_activity"."synced_at" IS NULL;--> statement-breakpoint
CREATE TABLE `exam` (
	`id` integer PRIMARY KEY NOT NULL,
	`level_id` integer NOT NULL,
	`xp_reward` integer DEFAULT 100 NOT NULL,
	`passing_score` integer DEFAULT 70 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`level_id`) REFERENCES `level`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_level_id_unique` ON `exam` (`level_id`);--> statement-breakpoint
CREATE TABLE `exam_attempt` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`exam_id` integer NOT NULL,
	`score` integer NOT NULL,
	`taken_at` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_id`) REFERENCES `exam`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exam_attempt_user_exam_idx` ON `exam_attempt` (`user_id`,`exam_id`);--> statement-breakpoint
CREATE TABLE `level` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `level_sort_order_unique` ON `level` (`sort_order`);--> statement-breakpoint
CREATE TABLE `question` (
	`id` integer PRIMARY KEY NOT NULL,
	`exam_id` integer NOT NULL,
	`type` text NOT NULL,
	`statement` text NOT NULL,
	`sort_order` integer NOT NULL,
	`feedback` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exam`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_exam_sort_order_unique` ON `question` (`exam_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `question_option` (
	`id` integer PRIMARY KEY NOT NULL,
	`question_id` integer NOT NULL,
	`text` text NOT NULL,
	`is_correct` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subtopic` (
	`id` integer PRIMARY KEY NOT NULL,
	`topic_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subtopic_topic_sort_order_unique` ON `subtopic` (`topic_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `subtopic_progress` (
	`user_id` text NOT NULL,
	`subtopic_id` integer NOT NULL,
	`viewed_at` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	PRIMARY KEY(`user_id`, `subtopic_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subtopic_id`) REFERENCES `subtopic`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `topic` (
	`id` integer PRIMARY KEY NOT NULL,
	`level_id` integer NOT NULL,
	`title` text NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`level_id`) REFERENCES `level`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topic_level_sort_order_unique` ON `topic` (`level_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `topic_progress` (
	`user_id` text NOT NULL,
	`topic_id` integer NOT NULL,
	`completed_at` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	PRIMARY KEY(`user_id`, `topic_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`country` text NOT NULL,
	`state` text NOT NULL,
	`city` text,
	`email_verified` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `xp_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`topic_id` integer,
	`exam_id` integer,
	`points` integer NOT NULL,
	`earned_at` text NOT NULL,
	`synced_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_id`) REFERENCES `exam`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "xp_event_single_source" CHECK(("xp_event"."topic_id" IS NULL) <> ("xp_event"."exam_id" IS NULL)),
	CONSTRAINT "xp_event_positive_points" CHECK("xp_event"."points" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `xp_event_user_topic_unique` ON `xp_event` (`user_id`,`topic_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `xp_event_user_exam_unique` ON `xp_event` (`user_id`,`exam_id`);--> statement-breakpoint
CREATE INDEX `xp_event_pending_idx` ON `xp_event` (`user_id`) WHERE "xp_event"."synced_at" IS NULL;