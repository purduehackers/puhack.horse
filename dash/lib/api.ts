export function put(url: string, data: string) {
  return fetch(url, {
    method: "PUT",
    body: JSON.stringify({ data }),
  })
    .then((r) => r.json())
    .catch((err) => {
      throw new Error(`${err}`);
    });
}

export function del(url: string) {
  return fetch(url, {
    method: "DELETE",
  })
    .then((r) => r.json())
    .catch((err) => {
      throw new Error(`${err}`);
    });
}
