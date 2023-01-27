interface Env {
  HORSE: KVNamespace;
  AUTH_SECRET: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS, DELETE, PUT",
  "Access-Control-Allow-Headers": "*",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname.slice(1).startsWith("api")) {
        const token = request.headers
          .get("authorization")
          ?.replace("Bearer ", "")
          .trim();
        if (!token) {
          return new Response("Missing token", { status: 401 });
        }
        if (token !== env.AUTH_SECRET) {
          return new Response("Incorrect token", { status: 401 });
        }

        const key = url.pathname.split("/")[2];
        switch (request.method) {
          case "OPTIONS":
            return new Response("OK", { status: 200, headers: corsHeaders });
          case "GET":
            if (!key) {
              const vals = await getAll({
                keysOnly: url.search.includes("keysOnly=true"),
              });
              return new Response(JSON.stringify(vals, null, 2), {
                status: 200,
                headers: corsHeaders,
              });
            }
            const value = await env.HORSE.get(key);
            if (!value) {
              return new Response(`Key ${key} not found.`, { status: 400 });
            }
            return new Response(value, { status: 200, headers: corsHeaders });
          case "PUT":
            const body = await request.text();
            try {
              const data = JSON.parse(body);
              await env.HORSE.put(key, data.data);
              return new Response(`Set route ${key} to ${data.data}`, {
                status: 200,
                headers: corsHeaders,
              });
            } catch (err) {
              return new Response(`${err}`, { status: 500 });
            }
          case "DELETE":
            try {
              await env.HORSE.delete(key);
              return new Response(`Deleted ${key}`, {
                status: 200,
                headers: corsHeaders,
              });
            } catch (err) {
              return new Response(`${err}`, { status: 500 });
            }
          default:
            return new Response("Invalid method. Use GET or PUT", {
              status: 400,
            });
        }
      } else {
        const key = url.pathname.slice(1);
        if (request.method !== "GET") {
          return new Response(
            "The redirector is meant to be used in your browser; use GET",
            { status: 400 }
          );
        }
        const destination = await env.HORSE.get(key);
        if (destination !== null) {
          return Response.redirect(destination, 301);
        } else {
          return Response.redirect("https://purduehackers.com", 301);
        }
      }
    } catch (err) {
      return Response.redirect("https://purduehackers.com", 301);
    }

    async function getAll({ keysOnly }: { keysOnly: boolean }) {
      const vals = [];
      const data = await env.HORSE.list();
      if (keysOnly) return data.keys;
      for (const key of Object.values(data.keys)) {
        const value = await env.HORSE.get(key.name);
        if (!value) {
          continue;
        }
        vals.push({
          key: key.name,
          value,
        });
      }
      return vals;
    }
  },
};
