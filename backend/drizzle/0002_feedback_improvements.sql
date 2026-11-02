DO $$ BEGIN
  CREATE TYPE "public"."user_role" AS ENUM('admin', 'technician');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."repair_status" AS ENUM('pending', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'technician'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "inbox_messages" ALTER COLUMN "repair_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "inbox_messages" ALTER COLUMN "repair_status" TYPE "public"."repair_status" USING "repair_status"::"public"."repair_status";--> statement-breakpoint
ALTER TABLE "inbox_messages" ALTER COLUMN "repair_status" SET DEFAULT 'pending'::"public"."repair_status";--> statement-breakpoint
ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "final_price" integer;--> statement-breakpoint
ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_cg_id_categories_cg_id_fk";--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_cg_id_categories_cg_id_fk" FOREIGN KEY ("cg_id") REFERENCES "public"."categories"("cg_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_services_cg_id" ON "services" USING btree ("cg_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_services_status" ON "services" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_service_id" ON "inbox_messages" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_technician_id" ON "inbox_messages" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_repair_status" ON "inbox_messages" USING btree ("repair_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_is_read" ON "inbox_messages" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_created_at" ON "inbox_messages" USING btree ("created_at");

