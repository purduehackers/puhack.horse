export type Link = { d: string; v: number };
export interface Store {
  list(): Promise<Record<string, Link>>;
  get(slug: string): Promise<Link | undefined>;
  create(slug: string, destination: string): Promise<void>;
  delete(slug: string): Promise<void>;
}

/** The management API is authoritative, including after uncertain writes. */
export function vercelStore(token: string, id: string, team: string): Store {
  async function request(path: string, items?: object[]) {
    const response = await fetch(
      `https://api.vercel.com/v1/global-config/${encodeURIComponent(id)}/${path}?teamId=${encodeURIComponent(team)}`,
      {
        method: items ? "PATCH" : "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: items ? JSON.stringify({ items }) : undefined,
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (response.status === 404 && !items) return undefined;
    if (!response.ok) throw new Error(`Link store returned ${response.status}`);
    return response.json();
  }
  return {
    async list() {
      const items = await request("items");
      if (!Array.isArray(items)) throw new Error("Link store unavailable");
      return Object.fromEntries(items.map((item) => [item.key, item.value]));
    },
    async get(slug) {
      return (await request(`item/${encodeURIComponent(slug)}`))?.value;
    },
    async create(key, d) {
      await request("items", [{ operation: "create", key, value: { d, v: 0 } }]);
    },
    async delete(key) {
      await request("items", [{ operation: "delete", key }]);
    },
  };
}
