CREATE TABLE "categories" (
	"cg_id" serial PRIMARY KEY NOT NULL,
	"cg_name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbox_messages" (
	"cm_id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"cm_username" varchar(100) NOT NULL,
	"cm_cel" varchar(15) NOT NULL,
	"cm_email" varchar(100) NOT NULL,
	"cm_symptom" varchar(500) NOT NULL,
	"cm_image" varchar(255),
	"is_read" boolean DEFAULT false NOT NULL,
	"repair_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"comment" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"cg_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"detail" varchar(500) NOT NULL,
	"price" integer NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"service_image" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"u_id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"pwd" varchar(255) NOT NULL,
	"u_name" varchar(50) NOT NULL,
	"u_surname" varchar(50) NOT NULL,
	"role" varchar(20) DEFAULT 'technician' NOT NULL,
	"cel" varchar(15) NOT NULL,
	"email" varchar(100) NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_cg_id_categories_cg_id_fk" FOREIGN KEY ("cg_id") REFERENCES "public"."categories"("cg_id") ON DELETE cascade ON UPDATE no action;