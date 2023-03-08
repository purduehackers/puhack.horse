import { NextResponse, NextFetchEvent } from "next/server";
import type { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";
import isbot from "isbot";

type ConfigData = {
  d: string;
  v: number;
};

const server =
  process.env.NODE_ENV === "production"
    ? "https://dash.puhack.horse"
    : "http://localhost:3000";

async function log(req: NextRequest, route: string, data: ConfigData) {
  if (isbot(req.headers.get("User-Agent"))) return;
  return fetch(`${server}/api/dash`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.HORSE_SECRET}`,
    },
    body: JSON.stringify({
      items: [
        {
          operation: "update",
          key: route,
          value: {
            d: data.d,
            v: data.v + 1,
          },
        },
      ],
    }),
  });
}

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  try {
    const route = req.nextUrl.pathname.slice(1);
    const data: ConfigData | undefined = await get(route);
    if (!data) return;

    ev.waitUntil(
      (async () => {
        return log(req, route, data);
      })()
    );

    return NextResponse.redirect(data.d);
  } catch (err) {
    return NextResponse.redirect("https://purduehackers.com");
  }
}

export const config = {
  runtime: "experimental-edge",
};
