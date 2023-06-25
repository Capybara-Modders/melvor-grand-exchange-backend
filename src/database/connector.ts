import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import Database from "better-sqlite3";

import * as schema from "./schema/schema";
import {
  Marketplace,
  MarketplaceInsert,
  User,
  UserInsert,
  marketplace,
  users,
  mailbox,
  MailboxInsert,
} from "./schema/schema";

import { migrate } from "drizzle-orm/better-sqlite3/migrator";
const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite, { schema: schema });

/**========================================================================
 *!                          Migration Function.
 *========================================================================**/
export async function migrator() {
  await migrate(db, { migrationsFolder: "./drizzle" });
}
/**========================================================================
 *!                          Admin Functions.
 *========================================================================**/
export async function getApiKeys(): Promise<String[]> {
  //? Internal use only. Returns all api keys in the database.
  return db.query.users.findMany().map((each) => each.apiKey);
}
export async function deleteUserById(userId: number) {
  return db.delete(users).where(eq(users.id, userId)).returning().get();
}
/**------------------------------------------------------------------------
 * *                         User Functions
 *------------------------------------------------------------------------**/
export async function createUser(userInsert: UserInsert): Promise<User> {
  //? Only user who does not currently exist may query. Validate on API key.
  return db.insert(users).values(userInsert).returning().get();
}
export async function getUserByName(name: string): Promise<User | undefined> {
  //? Only admin and user that owns this record may query. Validate on API key.
  return db.query.users.findFirst({ where: eq(users.name, name) });
}
export async function getUsers(): Promise<
  Pick<User, "createdAt" | "id" | "name">[]
> {
  //? Only admin and user that owns this record may query. Validate on API key.
  return db.query.users.findMany().map((user) => ({
    name: user.name,
    id: user.id,
    createdAt: user.createdAt,
  }));
}
/**------------------------------------------------------------------------
 * *                         Marketplace Functions
 *------------------------------------------------------------------------**/
export async function createMarketplaceListing(
  marketplaceInsert: MarketplaceInsert
): Promise<Marketplace> {
  //? Only existing users may create a marketplace listing. Validate on API key.
  return db.insert(marketplace).values(marketplaceInsert).returning().get();
}
export async function cancelMarketplaceListing(passedId: number) {
  const test = await db
    .delete(marketplace)
    .where(eq(marketplace.id, passedId))
    .run();
  console.log(test);
  return returnAllMarketplaceListings();
}
export async function returnAllMarketplaceListings() {
  return db
    .select({
      userName: users.name,
      listingId: marketplace.id,
      tradingUser: marketplace.tradingUser,
      requestedItemid: marketplace.requestedItemId,
      providingItemId: marketplace.providingItemId,
      requestedItemCount: marketplace.requestedItemCount,
      providingItemCount: marketplace.providingItemCount,
      tradingRatio: marketplace.tradingRatio,
      createdAt: marketplace.createdAt,
    })
    .from(users)
    .fullJoin(marketplace, eq(users.id, marketplace.tradingUser))
    .all();
}
export async function tradeMarketplaceListing(
  tradingUserId: number,
  listingId: number,
  amountToTrade: number
) {
  const targetListing = await db.query.marketplace.findFirst({
    where: eq(marketplace.id, listingId),
  });
  if (!targetListing) throw Error("No listing found.");
  if (targetListing.providingItemCount < amountToTrade)
    throw Error("Not enough to trade.");
  //Successful Trades below.
  if (targetListing.providingItemCount == amountToTrade) {
    //? Proceed with trade and delete record as it's been bought out.
    await cancelMarketplaceListing(listingId);
    //Create a trade listing for the user making the trade.
    await createUserMailItem({
      deliveredItem: targetListing.providingItemId,
      deliveredItemCount: amountToTrade,
      ownedUserId: tradingUserId,
    });
    //Create a listing for the user who owns the trade
    const [, requestedRatioMultiplier] = parseTradeRatio(targetListing.tradingRatio)
    await createUserMailItem({
      deliveredItem:  targetListing.requestedItemId,
      deliveredItemCount: targetListing.requestedItemCount * requestedRatioMultiplier,
      ownedUserId: targetListing.tradingUser
    })
    return {
      itemId: targetListing.providingItemId,
      itemCount: targetListing.providingItemCount,
    };
  }
  const updatedRecord = await db.update(marketplace).set({
    ...targetListing,
    providingItemCount: targetListing.providingItemCount - amountToTrade,
  });
  //Create a trade listing for the user making the trade.
  await createUserMailItem({
    deliveredItem: targetListing.providingItemId,
    deliveredItemCount: amountToTrade,
    ownedUserId: tradingUserId,
  });
  //Create a listing for the user who owns the trade
  const [, requestedRatioMultiplier] = parseTradeRatio(targetListing.tradingRatio)
  await createUserMailItem({
    deliveredItem:  targetListing.requestedItemId,
    deliveredItemCount: targetListing.requestedItemCount * requestedRatioMultiplier,
    ownedUserId: targetListing.tradingUser
  })
  return updatedRecord;
}
/**------------------------------------------------------------------------
 * *                         Mailbox Functions
 * So this group of functions should handle the creation and "acceptance" of mail
 *------------------------------------------------------------------------**/
export async function fetchUserMailbox(userId: number) {
  return db.query.mailbox.findMany({ where: eq(mailbox.ownedUserId, userId) });
}
export async function acceptUserMail(mailItem: number) {
  return db.delete(mailbox).where(eq(mailbox.id, mailItem)).run();
}
export async function createUserMailItem(mailboxInsert: MailboxInsert) {
  return db.insert(mailbox).values(mailboxInsert).get();
}


//? Utility
export function parseTradeRatio(tradeRatio: string): [number, number] {
  const [first, second] = tradeRatio.split(',').map(each => parseInt(each))
  return [first, second]
}
export function stringifiyTradeRatio(tradeRatio: [number, number]): string {
  return `${tradeRatio[0]},${tradeRatio[1]}`
}