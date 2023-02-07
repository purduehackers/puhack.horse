import { KVData } from "../types/types";
import { delay, server } from "./helpers";

const url = `${server}/api/dash`;

export async function add(
  route: string,
  destination: string,
  newData: KVData[]
) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          operation: "create",
          key: route,
          value: destination,
        },
      ],
    }),
  }).catch((err) => {
    throw new Error(err);
  });

  newData.map((obj) => {
    if (obj.route === route) obj.status = "SUCCESS";
  });
  await waitForPropagation(route);
  return newData;
}

export async function del(key: string, newData: KVData[]) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          operation: "delete",
          key,
        },
      ],
    }),
  }).catch((err) => {
    throw new Error(`${err}`);
  });
  return newData;
}

export async function updateRoute(
  oldRoute: string,
  newRoute: string,
  destination: string,
  newData: KVData[]
) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          operation: "delete",
          key: oldRoute,
        },
        {
          operation: "create",
          key: newRoute,
          value: destination,
        },
      ],
    }),
  }).catch((err) => {
    throw new Error(`${err}`);
  });
  newData.map((obj) => {
    if (obj.route === newRoute) obj.status = "SUCCESS";
  });
  await waitForPropagation(newRoute);
  return newData;
}

export async function updateDestination(
  route: string,
  newDestination: string,
  newData: KVData[]
) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          operation: "update",
          key: route,
          value: newDestination,
        },
      ],
    }),
  }).catch((err) => {
    throw new Error(err);
  });

  newData.map((obj) => {
    if (obj.route === route) obj.status = "SUCCESS";
  });
  return newData;
}

async function waitForPropagation(route: string) {
  // Cloudflare Workers KV is "eventually consistent", meaning
  // changes will propagate eventually but may take up to 60 seconds.
  // list()ing after adding a new key appears to be the slowest
  // operation, taking up to 30 seconds for me while testing.
  // This was causing problems when SWR was revalidating,
  // because the new key wasn't there when it fetched the new data,
  // so the row would disappear from the table for a while
  // after the user added it.
  await delay(1000);
  let all = await fetch(url).then((r) => r.json());
  while (!all.find((el: KVData) => el.route === route)) {
    await delay(1000);
    all = await fetch(url).then((r) => r.json());
  }
}
