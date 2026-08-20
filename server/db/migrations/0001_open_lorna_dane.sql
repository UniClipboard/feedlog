CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE TABLE "post_embedding" (
	"post_id" uuid PRIMARY KEY NOT NULL,
	"embedding" vector(768) NOT NULL,
	"model" varchar(50) NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_search" (
	"post_id" uuid PRIMARY KEY NOT NULL,
	"search_text" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "type" varchar(20) DEFAULT 'comment' NOT NULL;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "merged_to" uuid;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "content_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "post_embedding" ADD CONSTRAINT "post_embedding_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_search" ADD CONSTRAINT "post_search_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_post_merged_to" ON "post" USING btree ("merged_to") WHERE "post"."merged_to" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "idx_post_embedding_hnsw" ON "post_embedding" USING hnsw ("embedding" vector_cosine_ops);
--> statement-breakpoint
CREATE INDEX "idx_post_search_trgm" ON "post_search" USING gist ("search_text" gist_trgm_ops);