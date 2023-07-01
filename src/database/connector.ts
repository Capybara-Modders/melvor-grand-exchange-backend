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
import { v4 } from "uuid";
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
export async function deleteUserById(userId: string) {
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
  return db
    .insert(marketplace)
    .values({
      ...marketplaceInsert,
      id: v4(),
    })
    .returning()
    .get();
}
export async function cancelMarketplaceListing(passedId: string) {
  await db.delete(marketplace).where(eq(marketplace.id, passedId)).run()
  return true;
}
export async function returnAllMarketplaceListings() {
  const {
    id,

    listingCreatorUserId,

    listedItemId,
    listedItemBaseCount,

    buyingItemId,
    buyingItemBaseCount,

    totalTrades,
    totalTradesRemaining,
    createdAt,
  } = marketplace;
  return db
    .select({
      userName: users.name,
      listingId: id,

      listingCreatorUserId,

      listedItemId,
      listedItemBaseCount,

      buyingItemId,
      buyingItemBaseCount,

      totalTrades,
      totalTradesRemaining,
      createdAt: createdAt,
    })
    .from(users)
    .rightJoin(marketplace, eq(users.id, listingCreatorUserId))
    .all()
    // .filter(each => each.listingId);
}
/**
 *
 * @param buyingUserId The ID of the user who is making a purcahse on this listing
 * @param listingId The id of the listing the buyer wants to buy from
 * @param amountToTrade The amount of trades the buyer wants to make.
 * @returns
 */
export async function tradeMarketplaceListing(
  buyingUserId: string,
  listingId: string,
  amountToTrade: number
) {
  const targetListing = await db.query.marketplace.findFirst({
    where: eq(marketplace.id, listingId),
  });
  if (!targetListing) throw Error("No listing found.");
  /**
   * This is a server side check to see if the requested items are still in stock based on the amount
   * the buying user wants to buy.
   *
   */
  // if (targetListing.listedItemBaseCount * amountToTrade < amountToTrade)
  if (targetListing.totalTradesRemaining < amountToTrade)
    throw Error("Not enough to trade.");
  //Successful Trades below.
  if (targetListing.totalTradesRemaining == amountToTrade) {
    //? Proceed with trade and delete record as it's been bought out.
    await cancelMarketplaceListing(listingId);
    //Create a trade listing for the user making the trade.
    await createUserMailItem({
      deliveredItem: targetListing.listedItemId,
      deliveredItemCount: amountToTrade * targetListing.listedItemBaseCount,
      ownedUserId: buyingUserId,
      id: v4(),
    });
    //Create a listing for the user who owns the trade
    // const [, requestedRatioMultiplier] = parseTradeRatio(targetListing.tradingRatio)
    await createUserMailItem({
      deliveredItem: targetListing.buyingItemId,
      deliveredItemCount: targetListing.buyingItemBaseCount * amountToTrade,
      ownedUserId: targetListing.listingCreatorUserId,
      id: v4(),
    });
    return true;
  }
  console.log("we're trying to update");
  await db
    .update(marketplace)
    .set({
      ...targetListing,
      totalTradesRemaining: targetListing.totalTradesRemaining - amountToTrade,
    })
    .where(eq(marketplace.id, targetListing.id))
    .run();
  console.log("we've made it to the update");
  //Create a trade listing for the user making the trade.
  await createUserMailItem({
    deliveredItem: targetListing.listedItemId,
    deliveredItemCount: amountToTrade * targetListing.listedItemBaseCount,
    ownedUserId: buyingUserId,
    id: v4(),
  });
  //Create a listing for the user who owns the trade
  // const [, requestedRatioMultiplier] = parseTradeRatio(targetListing.tradingRatio)
  await createUserMailItem({
    deliveredItem: targetListing.buyingItemId,
    deliveredItemCount: amountToTrade * targetListing.buyingItemBaseCount,
    ownedUserId: targetListing.listingCreatorUserId,
    id: v4(),
  });
  return true;
}
/**------------------------------------------------------------------------
 * *                         Mailbox Functions
 * So this group of functions should handle the creation and "acceptance" of mail
 *------------------------------------------------------------------------**/
export async function fetchUserMailbox(userId: string) {
  return db.query.mailbox.findMany({ where: eq(mailbox.ownedUserId, userId) });
}
export async function acceptUserMail(mailItem: string) {
  return db.delete(mailbox).where(eq(mailbox.id, mailItem)).run();
}
export async function createUserMailItem(mailboxInsert: MailboxInsert) {
  return db.insert(mailbox).values(mailboxInsert).run();
}

//? Utility
export function parseTradeRatio(tradeRatio: string): [number, number] {
  const [first, second] = tradeRatio.split(",").map((each) => parseInt(each));
  return [first, second];
}
export function stringifiyTradeRatio(tradeRatio: [number, number]): string {
  return `${tradeRatio[0]},${tradeRatio[1]}`;
}
