import { KVData } from "../types/types";

export async function put(url: string, data: string) {
  return await fetch(url, {
    method: "PUT",
    body: JSON.stringify({ data }),
  })
    .then((r) => r.json())
    .catch((err) => {
      throw new Error(`${err}`);
    });
}

export async function del(url: string) {
  return await fetch(url, {
    method: "DELETE",
  })
    .then((r) => r.json())
    .catch((err) => {
      throw new Error(`${err}`);
    });
}

async function getAll(): Promise<KVData[]> {
  return await fetch("https://puhack-dot-horse.sparklesrocketeye.workers.dev", {
    method: "GET",
  }).then((r) => r.json());
}

export async function delAndPut(urlDel: string, urlPut: string, data: string) {
  await del(urlDel).catch((err) => {
    throw new Error(`${err}`);
  });
  await put(urlPut, data).catch((err) => {
    throw new Error(`${err}`);
  });

  // When a new key is PUT into KV, it's not immediately available in the
  // `getAll()` function called within the worker. This was causing issues
  // where it would disappear from the dashboard after being added
  // until SWR revalidated again. This ensures that the data we expect
  // to be there is there before returning data to the SWR mutation.
  let all = await getAll();
  while (!all.find((el) => el.key === urlPut.split("/")[1])) {
    all = await getAll();
  }
  return all;
}
