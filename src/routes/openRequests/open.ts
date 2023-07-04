import {
  FastifyError,
  FastifyInstance,
  RouteOptions,
} from "fastify";
import {
  createUser,
} from "../../database/connector";
import { v4 } from "uuid";

export default async function routes(
  fastify: FastifyInstance,
  options: RouteOptions,
  done: (error: FastifyError) => void
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
  fastify.get<{ Params: { username: string } }>(
    "/newUser/:username",
    async (request, reply) => {
      if (!request.params.username) {
        reply.code(500).send("We require a username.");
        return;
      }
      try {
        return createUser({
          name: request.params.username,
          apiKey: v4(),
          id: v4(),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send("Issue creating user.");
        return;
      }
    }
  );
}