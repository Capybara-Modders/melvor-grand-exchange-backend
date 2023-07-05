import Fastify from "fastify";
import nonAuthRequiredRoutes from "./routes/openRequests/open";
import authRequiredRoutes from "./routes/user/bulkRouter";
import { migrator } from "./database/connector";

const [, , enviornment] = process.argv;
const envLogger = (env: string): any => {
  switch (env) {
    case "prod":
      return {
        file: './logging/out'
      };
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

fastify.register(nonAuthRequiredRoutes);
fastify.register(authRequiredRoutes);

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  migrator()
    .then(() => console.log("Database Migrated."))
    .catch(error => {
      fastify.log.error(error)
      console.error(error)
    });
  console.log(`Servers' ear to the stars @${address}`);
});
