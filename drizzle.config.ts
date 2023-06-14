import type { Config } from "drizzle-kit";

export default {
  schema: "./src/database/schema/schema.ts",
  out: "./drizzle",
  breakpoints: true,
} satisfies Config;
