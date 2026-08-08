CREATE TABLE "werft_app" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"stack" jsonb NOT NULL,
	"url" text NOT NULL,
	"tags" jsonb NOT NULL,
	"status" text NOT NULL,
	"private" boolean NOT NULL,
	"repo_url" text NOT NULL,
	"last_deploy_at" timestamp with time zone DEFAULT now() NOT NULL,
	"health" text DEFAULT 'unknown' NOT NULL,
	"health_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "werft_app_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX "werft_app_status_idx" ON "werft_app" USING btree ("status");