-- Refactorización v2 (cliente): 6 niveles × 4 temas, ejercicio por tema y examen final, sin XP ni racha.
-- El contenido se vuelve a sembrar completo y el avance de desarrollo se descarta (sin usuarios reales).
-- Se borran las hijas antes que las padres: con foreign_keys = ON un DROP de una tabla referenciada falla.
DROP TABLE `question_option`;--> statement-breakpoint
DROP TABLE `question`;--> statement-breakpoint
DROP TABLE `exam_attempt`;--> statement-breakpoint
DROP TABLE `xp_event`;--> statement-breakpoint
DROP TABLE `exam`;--> statement-breakpoint
DROP TABLE `daily_activity`;--> statement-breakpoint
DROP TABLE `subtopic_progress`;--> statement-breakpoint
DROP TABLE `subtopic`;--> statement-breakpoint
DROP TABLE `topic_progress`;--> statement-breakpoint
DROP TABLE `topic`;--> statement-breakpoint
DROP TABLE `level`;--> statement-breakpoint
CREATE TABLE `level` (
	`id` integer PRIMARY KEY NOT NULL,
	`sort_order` integer NOT NULL,
	`title` text NOT NULL,
	`goal` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `level_sort_order_unique` ON `level` (`sort_order`);--> statement-breakpoint
CREATE TABLE `topic` (
	`id` integer PRIMARY KEY NOT NULL,
	`level_id` integer NOT NULL,
	`sort_order` integer NOT NULL,
	`title` text NOT NULL,
	`objective` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`level_id`) REFERENCES `level`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topic_level_sort_order_unique` ON `topic` (`level_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `quiz` (
	`id` integer PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`topic_id` integer,
	`pass_mark` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "quiz_topic_matches_kind" CHECK(("quiz"."kind" = 'topic') = ("quiz"."topic_id" IS NOT NULL)),
	CONSTRAINT "quiz_pass_mark_positive" CHECK("quiz"."pass_mark" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_topic_id_unique` ON `quiz` (`topic_id`);--> statement-breakpoint
CREATE TABLE `question` (
	`id` integer PRIMARY KEY NOT NULL,
	`quiz_id` integer NOT NULL,
	`sort_order` integer NOT NULL,
	`statement` text NOT NULL,
	`feedback` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_quiz_sort_order_unique` ON `question` (`quiz_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `question_option` (
	`id` integer PRIMARY KEY NOT NULL,
	`question_id` integer NOT NULL,
	`sort_order` integer NOT NULL,
	`text` text NOT NULL,
	`is_correct` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_option_question_sort_order_unique` ON `question_option` (`question_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `quiz_progress` (
	`user_id` text NOT NULL,
	`quiz_id` integer NOT NULL,
	`passed` integer DEFAULT false NOT NULL,
	`best_score` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`passed_at` text,
	`synced_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	PRIMARY KEY(`user_id`, `quiz_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "quiz_progress_counts" CHECK("quiz_progress"."best_score" >= 0 AND "quiz_progress"."attempts" >= 0),
	CONSTRAINT "quiz_progress_passed" CHECK("quiz_progress"."passed" = 0 OR ("quiz_progress"."passed_at" IS NOT NULL AND "quiz_progress"."attempts" > 0))
);
--> statement-breakpoint
CREATE INDEX `quiz_progress_pending_idx` ON `quiz_progress` (`user_id`) WHERE "quiz_progress"."synced_at" IS NULL OR "quiz_progress"."synced_at" <> "quiz_progress"."updated_at";--> statement-breakpoint
CREATE TABLE `sync_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`generation` integer,
	`last_synced_at` text,
	`last_error` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `glossary_term` (
	`term` text PRIMARY KEY NOT NULL,
	`definition` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leaderboard_cache` (
	`user_id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`fetched_at` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- Fuerza a ContentSeeder a sembrar el contenido v3
DELETE FROM `content_meta`;
