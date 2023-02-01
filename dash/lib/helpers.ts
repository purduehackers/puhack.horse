import { KVData } from "../types/types";

export const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.HORSE_SECRET}`,
    },
  }).then((r) => r.json());

export function deleteObject(route: string, data: KVData[]) {
  return data.filter((el) => el.key !== route);
}

export function mutateObject(
  toChange: string,
  data: KVData[],
  route: string,
  destination: string
) {
  if (toChange === "value") {
    data.map((obj) => {
      if (obj.key === route) {
        obj.value = destination;
        obj.status = "PENDING";
      }
    });
  }
  return data;
}

export function error(data: KVData[], route: string) {
  data.map((obj) => {
    if (obj.key === route) obj.status = "FAIL";
  });
  return data;
}

export async function delay(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
