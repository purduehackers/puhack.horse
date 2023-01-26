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

export async function delAndPut(urlDel: string, urlPut: string, data: string) {
  await del(urlDel).catch((err) => {
    throw new Error(`${err}`);
  });
  return await put(urlPut, data).catch((err) => {
    throw new Error(`${err}`);
  });
}
