import { NextRequest, NextResponse } from "next/server";

const fallback = "https://purduehackers.com";

export async function middleware(req: NextRequest) {
  const slug = req.nextUrl.pathname.replace("/", "");
  if (slug.length === 0) {
    NextResponse.redirect(fallback);
  }

  const destination = await fetch(
    `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${slug}`
  )
    .then((r) => r.text())
    .catch((err) => NextResponse.redirect(fallback));
  return NextResponse.redirect(destination as string);
}
