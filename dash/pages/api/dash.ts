import { NextRequest, NextResponse } from "next/server";
import { getAll } from "@vercel/edge-config";

export default async (req: NextRequest) => {
  if (req.method === "GET") {
    const configItems = await getAll();
    return NextResponse.json(configItems);
  } else if (req.method === "PATCH") {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return new Response(null, {
        status: 400,
        statusText: `You need an API key to access this!!!!`,
      });
    } else if (
      authorization !== `Bearer ${process.env.NEXT_PUBLIC_HORSE_SECRET}`
    ) {
      return new Response(null, {
        status: 403,
        statusText: `Incorrect API key!!!!!!!!!!`,
      });
    }
    try {
      const data = await req.json();
      const { items } = data;

      const response = await fetch(
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
			if (!response.ok) {
				return NextResponse.json({
					ok: false,
					reason: "Vercel Edge Config API request failed",
					upstreamResponse: {
						status: response.status,
						body: await response.text(),
					},
				}, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.log(err);
    }
  }
};

export const config = {
  runtime: "edge",
};
