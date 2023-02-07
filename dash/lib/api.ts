import { KVData, KVList } from "../types/types";

const url = `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?teamId=${process.env.TEAM_ID}`;

export async function add(
  route: string,
  destination: string,
  newData: KVData[]
) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
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
  return newData;
}

export async function del(key: string, newData: KVData[]) {
  await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
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
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
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
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
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
