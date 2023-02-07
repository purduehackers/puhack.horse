import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

export async function middleware(req: NextRequest) {
  try {
    const route = req.nextUrl.pathname.slice(1);
    const destination = await get(route);
    return NextResponse.redirect(destination.destination);
  } catch (err) {
    return NextResponse.redirect("https://purduehackers.com");
  }
}

export const config = {
  runtime: "experimental-edge",
};
