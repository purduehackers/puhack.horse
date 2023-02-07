import { NextRequest, NextResponse } from "next/server";
import { getAll } from "@vercel/edge-config";

export default async (req: NextRequest) => {
  const configItems = await getAll();

  let reformattedData = [];
  for (const [key, value] of Object.entries(configItems)) {
    reformattedData.push({
      route: key,
      destination: value,
    });
  }
  return NextResponse.json(reformattedData);
};

export const config = {
  runtime: "experimental-edge",
};
