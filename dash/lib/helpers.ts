import { ConfigData } from "../types/types";

const dev = process.env.NODE_ENV !== "production";
export const server = dev
  ? "http://localhost:3000"
  : "https://dash.puhack.horse";

export const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_HORSE_SECRET}`,
    },
  }).then((r) => r.json());

export function sort(data: ConfigData) {
  return Object.keys(data)
    .sort()
    .reduce((obj: ConfigData, key) => {
      obj[key] = data[key];
      return obj;
    }, {});
}

export function deleteObject(route: string, data: ConfigData) {
  delete data[route];
  return data;
}

export function mutateObject(
  toChange: string,
  data: ConfigData,
  route: string,
  destination: string
) {
  if (toChange === "destination") {
    data[route].d = destination;
    data[route].status = "PENDING";
  }
  return data;
}

export function error(data: ConfigData, route: string) {
  data[route].status = "FAIL";
  return data;
}

export async function delay(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
