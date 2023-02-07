import { NextRequest, NextResponse } from "next/server";
import { getAll } from "@vercel/edge-config";

export default async (req: NextRequest) => {
  if (req.method === "GET") {
    const configItems = await getAll();

    let reformattedData = [];
    for (const [key, value] of Object.entries(configItems)) {
      reformattedData.push({
        route: key,
        destination: value,
      });
    }
    return NextResponse.json(reformattedData);
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
      )
        .then((r) => console.log("yay"))
        .catch((err) => console.log("err", err));
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.log(err);
    }
  }
};

export const config = {
  runtime: "experimental-edge",
};
