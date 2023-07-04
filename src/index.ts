import Fastify from "fastify";
import nonAuthRequiredRoutes from "./routes/openRequests/open"
import authRequiredRoutes from "./routes/user/bulkRouter";
import { migrator } from "./database/connector";
import cors from "@fastify/cors"

const [, , enviornment] = process.argv;
// console.log(process.argv);
const envLogger = (env: string): any => {
  switch (env) {
    case "prod":
      return true;
    default:
      return {
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
      };
  }
};

const fastify = Fastify({
  logger: envLogger(enviornment),
});

// fastify.register(cors, {
//   origin: "*"
// })
fastify.register(nonAuthRequiredRoutes)
fastify.register(authRequiredRoutes);

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  migrator()
    .then((data) => console.log("Database Migrated.", data))
    .catch(console.error);
  console.log(`Servers' ear to the stars @${address}`);
});
