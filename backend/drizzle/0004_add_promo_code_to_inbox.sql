-- Migration 0004: Add promo_code and discount_percent to inbox_messages
ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "promo_code" varchar(50);
ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "discount_percent" integer DEFAULT 0;

