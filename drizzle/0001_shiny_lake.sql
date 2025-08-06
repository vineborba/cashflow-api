CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` integer,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	`bank` text(100) NOT NULL,
	`bank_code` text(4) NOT NULL,
	`description` text(250),
	`type` text(40) NOT NULL,
	`balance` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `banks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `expenses` ADD `account_id` text NOT NULL REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `incomes` ADD `account_id` text NOT NULL REFERENCES accounts(id);