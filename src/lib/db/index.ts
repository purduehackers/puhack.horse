import { drizzle } from "drizzle-orm/libsql/http";
import { env } from "@/env";

import { accounts } from "./schema/accounts";
import { apikeys } from "./schema/apikeys";
import { campaigns } from "./schema/campaigns";
import { clicks } from "./schema/clicks";
import { links } from "./schema/links";
import { sessions } from "./schema/sessions";
import { users } from "./schema/users";
import { verifications } from "./schema/verifications";
import * as relations from "./schema/relations";

export const schema = {
  accounts,
  apikeys,
  campaigns,
  clicks,
  links,
  sessions,
  users,
  verifications,
  ...relations,
};

export const db = drizzle({
  connection: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  schema,
});
