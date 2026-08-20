CREATE TABLE "changelog" (
	"id" uuid PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"slug" varchar(300) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"title" varchar(70) NOT NULL,
	"content" text NOT NULL,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover" text,
	"published_title" varchar(70),
	"published_content" text,
	"published_categories" jsonb,
	"published_cover" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "changelog_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "changelog_reaction" (
	"changelog_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "changelog_reaction_changelog_id_user_id_emoji_pk" PRIMARY KEY("changelog_id","user_id","emoji")
);
--> statement-breakpoint
CREATE INDEX "idx_changelog_public" ON "changelog" USING btree ("published_at" DESC,"id" DESC) WHERE "changelog"."published_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_changelog_admin" ON "changelog" USING btree ("updated_at" DESC,"id" DESC);--> statement-breakpoint
CREATE INDEX "idx_changelog_title_trgm" ON "changelog" USING gist ("title" gist_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_changelog_content_trgm" ON "changelog" USING gist ("content" gist_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_changelog_pub_title_trgm" ON "changelog" USING gist ("published_title" gist_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_changelog_pub_content_trgm" ON "changelog" USING gist ("published_content" gist_trgm_ops);