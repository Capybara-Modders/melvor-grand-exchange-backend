import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { InferModel } from "drizzle-orm";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    apiKey: text("api_key").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .defaultNow(),
  },
  (user) => ({
    nameIdx: uniqueIndex("nameIdx").on(user.name),
  })
);

export const marketplace = sqliteTable("marketplace", {
  id: text("id").primaryKey(),
  listingCreatorUserId: text("listing_creator_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  listedItemId: text("listed_item_id").notNull(),
  listedItemBaseCount: integer("listed_item_base_count").notNull(),
  buyingItemId: text("buying_item_id").notNull(),
  buyingItemBaseCount: integer("buying_item_base_count").notNull(),
  totalTrades: integer("total_trades").notNull(),
  totalTradesRemaining: integer("total_trades_remaining").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .defaultNow(),
});

export const mailbox = sqliteTable("mailbox", {
  id: text("id").primaryKey(),
  ownedUserId: text("owned_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deliveredItem: text("delivered_item").notNull(),
  deliveredItemCount: integer("delivered_item_count").notNull(),
});

export type Mailbox = InferModel<typeof mailbox>;
export type User = InferModel<typeof users>;
export type UserInsert = Pick<
  InferModel<typeof users>,
  "name" | "apiKey" | "id"
>;
export type Marketplace = InferModel<typeof marketplace>;
export type MarketplaceInsert = Pick<
  InferModel<typeof marketplace>,
  | "listingCreatorUserId"
  | "listedItemId"
  | "listedItemBaseCount"
  | "buyingItemId"
  | "buyingItemBaseCount"
  | "totalTrades"
  | "totalTradesRemaining"
>;
export type MailboxInsert = Pick<
  InferModel<typeof mailbox>,
  "ownedUserId" | "deliveredItem" | "deliveredItemCount" | "id"
>;
