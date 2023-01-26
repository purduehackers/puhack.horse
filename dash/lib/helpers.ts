import { KVData } from "../types/types";

export function deleteObject(route: string, data: KVData[]) {
  return data.filter((el) => el.key !== route);
}

export function mutateObject(
  toChange: string,
  data: KVData[],
  key: string,
  value: string
) {
  if (toChange === "value") {
    const el = data.find((el) => el.key === key);
    if (el) {
      el.value = value;
    }
  }
  return data;
}

export function truncate(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

export async function delay(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
