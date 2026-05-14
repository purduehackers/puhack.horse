import { headers } from "next/headers";
import { auth } from ".";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
