import { user } from "./schema/user.js";
import { session } from "./schema/session.js";
import { account } from "./schema/account.js";
import { verification } from "./schema/verification.js";
import { apikey } from "./schema/apikey.js";
import { link } from "./schema/link.js";
export const schema = { user, session, account, verification, apikey, link };
export const connect = async (url: string, authToken?: string) => {
  const { drizzle } = await (url.startsWith("file:")
    ? import("drizzle-orm/libsql")
    : import("drizzle-orm/libsql/web"));
  return drizzle({ connection: { url, authToken } });
};
export type Database = Awaited<ReturnType<typeof connect>>;
