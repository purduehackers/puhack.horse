import { treaty, type Treaty } from "@elysiajs/eden";
import type { App } from "./api.js";

/** Typed Eden client; credentials are supplied by the caller, never bundled. */
export const createClient = (url: string, token?: string): Treaty.Create<App>["api"] =>
  treaty<App>(url, { headers: token ? { authorization: `Bearer ${token}` } : {} }).api;
export type { App };
