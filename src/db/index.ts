import { user } from "./schema/user";
import { session } from "./schema/session";
import { account } from "./schema/account";
import { verification } from "./schema/verification";
import { apikey } from "./schema/apikey";
import { link } from "./schema/link";
export const schema = { user, session, account, verification, apikey, link };
export const connect = async (url: string, authToken?: string) => {
  const { drizzle } = await (url.startsWith("file:")
    ? import("drizzle-orm/libsql")
    : import("drizzle-orm/libsql/web"));
  return drizzle({ connection: { url, authToken } });
};
export type Database = Awaited<ReturnType<typeof connect>>;
