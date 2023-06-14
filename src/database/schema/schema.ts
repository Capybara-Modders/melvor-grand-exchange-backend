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
    id: integer("id").primaryKey(),
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

export const marketplace = sqliteTable(
  "marketplace",
  {
    id: integer("id").primaryKey(),
    tradingUser: integer("user_id")
      .references(() => users.id)
      .notNull(),
    requestedItemId: text("requested_item_id").notNull(),
    providingItemId: text("providing_item_id").notNull(),
    requestedItemCount: integer("requested_item_count").notNull(),
    providingItemCount: integer("providing_item_count").notNull(),
    tradingRatio: text("trading_ratio").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .defaultNow(),
  }
  // (mplace) => ({
  //   marketplaceIdx: uniqueIndex("userIdx").on(mplace.tradingUser),
  // })
);

export type User = InferModel<typeof users>;
export type UserInsert = Pick<InferModel<typeof users>, "name" | "apiKey">;
export type Marketplace = InferModel<typeof marketplace>;
export type MarketplaceInsert = Pick<
  InferModel<typeof marketplace>,
  | "providingItemCount"
  | "providingItemId"
  | "requestedItemCount"
  | "requestedItemId"
  | "tradingRatio"
  | "tradingUser"
>;
