CREATE TABLE `course_ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`course_id` integer NOT NULL,
	`stars` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "course_ratings_stars_check" CHECK("course_ratings"."stars" >= 1 AND "course_ratings"."stars" <= 5)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_ratings_user_id_course_id_unique` ON `course_ratings` (`user_id`,`course_id`);--> statement-breakpoint
CREATE INDEX `course_ratings_course_id_idx` ON `course_ratings` (`course_id`);