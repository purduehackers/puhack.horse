import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

export async function middleware(req: NextRequest) {
  const route = req.nextUrl.pathname.slice(1);
  if (!route) {
    return NextResponse.redirect("https://purduehackers.com");
  }
  const destination = await get(route);
  if (!destination) {
    return NextResponse.redirect("https://purduehackers.com");
  }
  return NextResponse.redirect(destination);
}

export const config = {
  runtime: "experimental-edge",
};
