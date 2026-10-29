import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// ==========================================
// 1. Table: Categories (หมวดหมู่บริการ)
// ==========================================
export const categories = pgTable('categories', {
  cg_id: serial('cg_id').primaryKey(),
  cg_name: varchar('cg_name', { length: 50 }).notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
}));

// ==========================================
// 2. Table: Services (รายการบริการซ่อม)
// ==========================================
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  cg_id: integer('cg_id')
    .notNull()
    .references(() => categories.cg_id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  detail: varchar('detail', { length: 500 }).notNull(),
  price: integer('price').notNull(),
  status: boolean('status').default(true).notNull(),
  service_image: varchar('service_image', { length: 255 }).notNull(),
});

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, {
    fields: [services.cg_id],
    references: [categories.cg_id],
  }),
  inboxMessages: many(inboxMessages),
}));

// ==========================================
// 3. Table: Users (ผู้ใช้งานระบบหลังบ้าน)
// ==========================================
export const users = pgTable('users', {
  u_id: serial('u_id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  pwd: varchar('pwd', { length: 255 }).notNull(),
  u_name: varchar('u_name', { length: 50 }).notNull(),
  u_surname: varchar('u_surname', { length: 50 }).notNull(),
  role: varchar('role', { length: 20 }).default('technician').notNull(), // 'admin' | 'technician'
  cel: varchar('cel', { length: 15 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
});

// ==========================================
// 4. Table: Inbox_Messages (กล่องข้อความและรายการแจ้งซ่อม)
// ==========================================
export const inboxMessages = pgTable('inbox_messages', {
  cm_id: serial('cm_id').primaryKey(),
  service_id: integer('service_id')
    .references(() => services.id, { onDelete: 'set null' }),
  technician_id: integer('technician_id')
    .references(() => users.u_id, { onDelete: 'set null' }), // Nullable foreign key to users.u_id
  cm_username: varchar('cm_username', { length: 100 }).notNull(),
  cm_cel: varchar('cm_cel', { length: 15 }).notNull(),
  cm_email: varchar('cm_email', { length: 100 }).notNull(),
  cm_symptom: varchar('cm_symptom', { length: 500 }).notNull(),
  cm_image: varchar('cm_image', { length: 255 }), // Nullable
  is_read: boolean('is_read').default(false).notNull(),
  repair_status: varchar('repair_status', { length: 20 }).default('pending').notNull(), // 'pending' | 'completed'
  comment: varchar('comment', { length: 500 }), // Nullable
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const inboxMessagesRelations = relations(inboxMessages, ({ one }) => ({
  service: one(services, {
    fields: [inboxMessages.service_id],
    references: [services.id],
  }),
  technician: one(users, {
    fields: [inboxMessages.technician_id],
    references: [users.u_id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  assignedMessages: many(inboxMessages),
}));

// ==========================================
// TypeScript Inferred Types
// ==========================================
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type InboxMessage = typeof inboxMessages.$inferSelect;
export type NewInboxMessage = typeof inboxMessages.$inferInsert;
