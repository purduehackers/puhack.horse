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
  } else if (req.method === "PUT") {
    const f = `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?teamId=${process.env.TEAM_ID}`;
  }
};

export const config = {
  runtime: "experimental-edge",
};
