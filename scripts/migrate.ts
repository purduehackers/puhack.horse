import { migrate } from "drizzle-orm/libsql/migrator";
import { connect } from "../src/db";
if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL required");
const db = connect(process.env.TURSO_DATABASE_URL, process.env.TURSO_AUTH_TOKEN);
await migrate(db, { migrationsFolder: "./migrations" });
db.$client.close();
