import { treaty } from "@elysiajs/eden";
import type { App } from "./api";

/** Typed Eden client; credentials are supplied by the caller, never bundled. */
export const createClient = (url: string, token?: string) =>
  treaty<App>(url, { headers: token ? { authorization: `Bearer ${token}` } : {} }).api;
export type { App };
