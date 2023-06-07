// General usage
const { build } = require("esbuild");
const esbuildPluginPino = require("esbuild-plugin-pino");

build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
}).catch(() => process.exit(1));
