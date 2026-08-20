CREATE TABLE "organization_sso" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"secret" text NOT NULL,
	"label" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "sso_org_id" text;--> statement-breakpoint
ALTER TABLE "organization_sso" ADD CONSTRAINT "organization_sso_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_organization_sso_org" ON "organization_sso" USING btree ("org_id");