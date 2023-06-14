import { FastifyInstance, RouteOptions } from "fastify";
import {
  cancelMarketplaceListing,
  createMarketplaceListing,
  createUser,
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
    return { Hello: "there!" };
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
}
