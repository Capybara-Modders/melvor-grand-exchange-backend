import { FastifyInstance, RouteOptions } from "fastify";

export default async function routes(
  fastify: FastifyInstance,
  options: RouteOptions
) {
  fastify.get("/", async (request, reply) => {
    return { its: "WORKING!" };
  });
}
