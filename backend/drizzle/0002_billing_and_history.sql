ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "final_price" integer;--> statement-breakpoint
ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_services_cg_id" ON "services" USING btree ("cg_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_services_status" ON "services" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_service_id" ON "inbox_messages" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_technician_id" ON "inbox_messages" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_repair_status" ON "inbox_messages" USING btree ("repair_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_is_read" ON "inbox_messages" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inbox_created_at" ON "inbox_messages" USING btree ("created_at");
