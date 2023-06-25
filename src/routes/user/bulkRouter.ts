import { FastifyInstance, RouteOptions } from "fastify";
import {
  acceptUserMail,
  cancelMarketplaceListing,
  createMarketplaceListing,
  createUser,
  fetchUserMailbox,
  getUsers,
  returnAllMarketplaceListings,
} from "../../database/connector";
import { v4 } from "uuid";
import { MarketplaceInsert } from "../../database/schema/schema";

export default async function routes(
  fastify: FastifyInstance,
  options: RouteOptions
) {
  fastify.get("/", async (request, reply) => {
    console.log(request.body);
    return { Hello: "there!" };
  });
  fastify.post("/", async (request, reply) => {
    console.log("Had a body", request.body);
    return "Nice";
  });

  /**------------------------------------------------------------------------
   * *                         User Endpoints
   *------------------------------------------------------------------------**/
  fastify.post<{ Params: { username: string } }>(
    "/newUser/:username",
    async (request, reply) => {
      if (!request.params.username) {
        reply.code(500).send("We require a username.");
        return;
      }
      try {
        return createUser({ name: request.params.username, apiKey: v4() });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue creating user.");
        return;
      }
    }
  );
  fastify.get("/getUsers", async (request, reply) => {
    try {
      return getUsers();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send("Issue fetching users.");
      return;
    }
  });
  /**------------------------------------------------------------------------
   * *                         Marketplace Functions
   *------------------------------------------------------------------------**/
  fastify.post<{ Body: MarketplaceInsert }>(
    "/createListing",
    async (request, reply) => {
      if (!request.body) {
        reply.code(500).send("You must pass listing data");
        return;
      }
      try {
        fastify.log.info(request.body);
        return createMarketplaceListing(request.body);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue creating listing.");
        return;
      }
    }
  );
  fastify.delete<{ Params: { listingId: number } }>(
    "/deleteListing/:listingId",
    async (request, reply) => {
      try {
        fastify.log.info(request.body);
        return cancelMarketplaceListing(request.params.listingId);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue deleting users.");
        return;
      }
    }
  );
  fastify.get("/marketplaceListings", async (request, reply) => {
    try {
      return returnAllMarketplaceListings();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send("Issue fetching marketplace listings.");
      return;
    }
  });
  fastify.post<{ Body: { listingId: number; tradeAmount: number } }>(
    "/marketplaceTrade",
    async (request, reply) => {
      try {
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue making marketplace trade.");
        return;
      }
    }
  );
  /**------------------------------------------------------------------------
   * *                         Mailbox Functions
   *------------------------------------------------------------------------**/
  fastify.get<{ Params: { userId: number } }>(
    "/userMailbox/:userId",
    async (request, reply) => {
      try {
        return fetchUserMailbox(request.params.userId);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue fetching mailbox listings.");
        return;
      }
    }
  );
  fastify.delete<{ Params: { mailitemId: number } }>(
    "/mailItem/:mailItemId",
    async (request, reply) => {
      try {
        return acceptUserMail(request.params.mailitemId);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue deleting mailbox listings.");
        return;
      }
    }
  );
}
