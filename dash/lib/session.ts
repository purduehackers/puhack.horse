import { auth } from "./auth";

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();

  return session?.user;
}
