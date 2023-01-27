import { KVData, KVList } from "../types/types";
import { delay } from "./helpers";

export async function put(
  url: string,
  destination: string,
  newData: KVData[],
  newKey?: boolean
) {
  await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.HORSE_SECRET}`,
    },
    body: JSON.stringify({ data: destination }),
  }).catch((err) => {
    throw new Error(`${err}`);
  });
  if (newKey) {
    await waitForPropagation(url);
  }
  const route = new URL(url).pathname.split("/")[2];
  newData.map((obj) => {
    if (obj.key === route) obj.status = "SUCCESS";
  });
  return newData;
}

export async function del(url: string, newData: KVData[]) {
  await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.HORSE_SECRET}`,
    },
  }).catch((err) => {
    throw new Error(`${err}`);
  });
  return newData;
}

async function getAllKeys(): Promise<KVList> {
  return await fetch(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev/api?keysOnly=true",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.HORSE_SECRET}`,
      },
    }
  ).then((r) => r.json());
}

async function waitForPropagation(url: string) {
  // Cloudflare Workers KV is "eventually consistent", meaning
  // changes will propagate eventually but may take up to 60 seconds.
  // list()ing after adding a new key appears to be the slowest
  // operation, taking up to 30 seconds for me while testing.
  // This was causing problems when SWR was revalidating,
  // because the new key wasn't there when it fetched the new data,
  // so the row would disappear from the table for a while
  // after the user added it.
  await delay(20000);
  let all = await getAllKeys();
  while (!all.find((el) => el.name === new URL(url).pathname.split("/")[2])) {
    await delay(10000);
    all = await getAllKeys();
  }
}

export async function delAndPut(
  urlDel: string,
  urlPut: string,
  destination: string,
  newData: KVData[]
) {
  await del(urlDel, newData).catch((err) => {
    throw new Error(`${err}`);
  });
  await put(urlPut, destination, newData, true).catch((err) => {
    throw new Error(`${err}`);
  });
  const route = new URL(urlPut).pathname.slice(1);
  newData.map((obj) => {
    if (obj.key === route) obj.status = "SUCCESS";
  });
  return newData;
}
