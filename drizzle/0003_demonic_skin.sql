CREATE TABLE `tags_to_transactions` (
	`tag_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	PRIMARY KEY(`transaction_id`, `tag_id`),
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`value` integer NOT NULL,
	`description` text(120) NOT NULL,
	`observation` text(180),
	`date` integer NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`updated_at` integer,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `expenses`;--> statement-breakpoint
DROP TABLE `incomes`;--> statement-breakpoint
DROP TABLE `tags_to_expenses`;--> statement-breakpoint
DROP TABLE `tags_to_incomes`;