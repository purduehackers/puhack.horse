import { drizzle } from "drizzle-orm/libsql";
import { user } from "./schema/user";
import { session } from "./schema/session";
import { account } from "./schema/account";
import { verification } from "./schema/verification";
import { apikey } from "./schema/apikey";
import { link } from "./schema/link";
export const schema = { user, session, account, verification, apikey, link };
export const connect = (url: string, authToken?: string) =>
  drizzle({ connection: { url, authToken } });
export type Database = ReturnType<typeof connect>;
