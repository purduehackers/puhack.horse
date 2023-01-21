interface Env {
  PH_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    switch (request.method) {
      case "GET":
        const data = await env.PH_KV.get(key);
        if (!data) {
          return new Response(`Key ${key} not found.`, { status: 400 });
        }
        return new Response(data);
      case "PUT":
        const body = await request.text();
        try {
          const data = JSON.parse(body);
          await env.PH_KV.put(key, data.data);
          return new Response(`Set ${data.data} to ${key}`, { status: 200 });
        } catch (err) {
          return new Response(`${err}`, { status: 500 });
        }
      case "DELETE":
        try {
          await env.PH_KV.delete(key);
          return new Response(`Deleted ${key}`, { status: 200 });
        } catch (err) {
          return new Response(`${err}`, { status: 500 });
        }
      default:
        return new Response("Invalid method. Use GET or PUT", { status: 400 });
    }
  },
};
