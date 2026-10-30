ALTER TABLE "inbox_messages" DROP CONSTRAINT "inbox_messages_service_id_services_id_fk";
--> statement-breakpoint
ALTER TABLE "inbox_messages" ALTER COLUMN "service_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "technician_id" integer;--> statement-breakpoint
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_technician_id_users_u_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("u_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;