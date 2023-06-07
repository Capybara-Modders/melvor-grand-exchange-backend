import Fastify from "fastify";

import userRoute from "./routes/user/userRoute";
const [, , enviornment] = process.argv;
console.log(process.argv);
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

fastify.register(userRoute);

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Servers' ear to the stars @${address}`);
});
