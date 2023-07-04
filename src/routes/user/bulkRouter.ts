import {
  FastifyError,
  FastifyInstance,
  RouteOptions,
} from "fastify";
import {
  acceptUserMail,
  cancelMarketplaceListing,
  createMarketplaceListing,
  fetchUserMailbox,
  getApiKeys,
  getUserByApiKey,
  getUsers,
  returnAllMarketplaceListings,
  tradeMarketplaceListing,
} from "../../database/connector";
import { v4 } from "uuid";
import { MarketplaceInsert } from "../../database/schema/schema";

export default async function routes(
  fastify: FastifyInstance,
  options: RouteOptions,
  done: (error: FastifyError) => void
) {
  fastify.addHook("preHandler", (request, reply, done) => {
    if (!request.headers.authorization) {
      reply.code(403).send("No auth code.");
      return;
    }
    const [, token] = request.headers.authorization.split("Bearer ");
    getApiKeys()
      .then((keys) => {
        if (!keys.includes(token)) {
          reply.code(403).send("Wrong auth code, or you're not a user.");
          return;
        }
        done();
      })
      .catch(() => {
        reply.code(403).send("Wrong auth code. You're not a user.");
        return;
      });
  });

  // fastify.get("/", async (request, reply) => {
  //   console.log(request.body);
  //   return { Hello: "there!" };
  // });
  // fastify.post("/", async (request, reply) => {
  //   console.log("Had a body", request.body);
  //   return "Nice";
  // });

  /**------------------------------------------------------------------------
   * *                         User Endpoints
   *------------------------------------------------------------------------**/
  fastify.get(
    "/getUsers",
    // { preHandler: [bearerMid] },
    async (request, reply) => {
      try {
        return getUsers();
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue fetching users.");
        return;
      }
    }
  );
  fastify.get(
    "/user",
    async (request, reply) => {
      try {
        return getUserByApiKey(request.headers.authorization?.split("Bearer ")[1]!);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue fetching users.");
      }
    }
  );
  /**------------------------------------------------------------------------
   * *                         Marketplace Functions
   *------------------------------------------------------------------------**/
  fastify.post<{ Body: MarketplaceInsert }>(
    "/createListing",
    async (request, reply) => {
      console.log(Object.values(request.body))
      if (
        !request.body ||
        Object.values(request.body).some((value) => !value)
      ) {
        //TODO to map the null values so we can return what is missing. Should be easy with a .filter fn
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
  fastify.delete<{ Params: { listingId: string } }>(
    "/deleteListing/:listingId",
    async (request, reply) => {
      try {
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
  fastify.post<{
    Body: { listingId: string; amountToTrade: number; buyingUserId: string };
  }>("/marketplaceTrade", async (request, reply) => {
    if (
      !request.body.listingId ||
      !request.body.amountToTrade ||
      !request.body.buyingUserId
    ) {
      reply.code(500).send("You're missing one of the 3 datapoints.");
      return;
    }
    try {
      return tradeMarketplaceListing(
        request.body.buyingUserId,
        request.body.listingId,
        request.body.amountToTrade
      );
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send("Issue making marketplace trade.");
      return;
    }
  });
  /**------------------------------------------------------------------------
   * *                         Mailbox Functions
   *------------------------------------------------------------------------**/
  fastify.get<{ Params: { userId: string } }>(
    "/userMailbox/:userId",
    async (request, reply) => {
      if (!request.params.userId) {
        reply
          .code(500)
          .send("A valid user id must be provided to make this request");
        return;
      }
      try {
        return fetchUserMailbox(request.params.userId);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue fetching mailbox listings.");
        return;
      }
    }
  );
  fastify.delete<{ Params: { mailItemId: string } }>(
    "/mailItem/:mailItemId",
    // { preHandler: [bearerMid] },
    async (request, reply) => {
      if (!request.params.mailItemId) {
        console.log(`Constellation, "_narva", annoying poop smeller`);
        reply
          .code(500)
          .send("A valid mail ID must be passed to make this request");
        return;
      }
      try {
        await acceptUserMail(request.params.mailItemId);
        return true
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue deleting mailbox listings.");
        return;
      }
    }
  );
}
