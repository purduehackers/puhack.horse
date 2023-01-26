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
  const d = await del(urlDel).catch((err) => {
    throw new Error(`${err}`);
  });
  const p = await put(urlPut, data).catch((err) => {
    throw new Error(`${err}`);
  });
  console.log("p", p, urlPut, data);
  // console.log("d", d, urlDel);
  return p;
}
