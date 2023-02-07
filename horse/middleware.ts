import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

export async function middleware(req: NextRequest) {
  try {
    const route = req.nextUrl.pathname.slice(1);
    const data = await get(route);
    fetch("http://localhost:3000/api/dash", {
      method: "PATCH",
      body: JSON.stringify({
        items: [
          {
            operation: "update",
            key: route,
            value: {
              route,
              destination: data.destination,
              visits: data.visits + 1,
            },
          },
        ],
      }),
    });
    return NextResponse.redirect(data.destination);
  } catch (err) {
    return NextResponse.redirect("https://purduehackers.com");
  }
}

export const config = {
  runtime: "experimental-edge",
};
