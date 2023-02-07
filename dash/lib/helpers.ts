import { KVData } from "../types/types";

const dev = process.env.NODE_ENV !== "production";
export const server = dev
  ? "http://localhost:3000"
  : "https://dash.puhack.horse";

export const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.HORSE_SECRET}`,
    },
  }).then((r) => r.json());

export function deleteObject(route: string, data: KVData[]) {
  return data.filter((el) => el.route !== route);
}

export function mutateObject(
  toChange: string,
  data: KVData[],
  route: string,
  destination: string
) {
  if (toChange === "destination") {
    data.map((obj) => {
      if (obj.route === route) {
        obj.destination = destination;
        obj.status = "PENDING";
      }
    });
  }
  return data;
}

export function error(data: KVData[], route: string) {
  data.map((obj) => {
    if (obj.route === route) obj.status = "FAIL";
  });
  return data;
}

export async function delay(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
