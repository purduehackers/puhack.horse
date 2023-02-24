import { NextRequest, NextResponse } from "next/server";
import { getAll } from "@vercel/edge-config";

export default async (req: NextRequest) => {
  // const authorization = req.headers.get("Authorization");
  // if (authorization !== `Bearer ${process.env.HORSE_SECRET}`) {
  //   console.log("huh????", authorization);
  //   return new Response(null, {
  //     status: 403,
  //     statusText: `You need an API key to access this!!!!`,
  //   });
  // }
  if (req.method === "GET") {
    const configItems = await getAll();
    return NextResponse.json(Object.values(configItems));
  } else if (req.method === "PATCH") {
    try {
      const data = await req.json();
      const { items } = data;

      await fetch(
        `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?teamId=${process.env.TEAM_ID}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items,
          }),
        }
      ).catch(
        (err) =>
          new Response(null, { status: 500, statusText: `Error: ${err}` })
      );
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.log(err);
    }
  }
};

export const config = {
  runtime: "edge",
};
