import { createClient } from "../src/client";
import { createAuthClient } from "better-auth/client";
import { apiKeyClient } from "@better-auth/api-key/client";
const auth = createAuthClient({ plugins: [apiKeyClient()] });
const form = document.querySelector<HTMLFormElement>("#create")!;
const table = document.querySelector("table")!;
const rows = document.querySelector("tbody")!;
const message = document.querySelector("#message")!;
const api = createClient(location.origin);
const report = (error: unknown) => {
  message.textContent = error instanceof Error ? error.message : JSON.stringify(error);
};
async function refresh() {
  const { data, error } = await api.links.get();
  if (error) throw error.value;
  rows.replaceChildren();
  for (const [slug, link] of Object.entries(data)) {
    const row = rows.insertRow();
    const anchor = document.createElement("a");
    anchor.href = `/${encodeURIComponent(slug)}`;
    anchor.textContent = `/${slug}`;
    row.insertCell().append(anchor);
    row.insertCell().textContent = link.d;
    const button = document.createElement("button");
    button.textContent = "Delete";
    button.onclick = async () => {
      if (!confirm(`Delete /${slug}?`)) return;
      try {
        const { error } = await api.links({ slug }).delete();
        if (error) throw error.value;
        await refresh();
      } catch (error) {
        report(error);
      }
    };
    row.insertCell().append(button);
  }
  form.hidden = table.hidden = false;
}
const login = document.querySelector<HTMLButtonElement>("#login")!;
const logout = document.querySelector<HTMLButtonElement>("#logout")!;
const keys = document.querySelector<HTMLElement>("#keys")!;
login.onclick = async () => {
  const { error } = await auth.signIn.social({
    provider: "purduehackers",
    callbackURL: "/dashboard",
  });
  if (error) report(error);
};
logout.onclick = async () => {
  await auth.signOut();
  location.reload();
};
async function refreshKeys() {
  const { data, error } = await auth.apiKey.list();
  if (error) throw error;
  const list = document.querySelector("#key-list")!;
  list.replaceChildren();
  for (const key of data.apiKeys) {
    const item = document.createElement("li");
    item.textContent = `${key.name} (${key.start ?? ""}…) `;
    const remove = document.createElement("button");
    remove.textContent = "Revoke";
    remove.onclick = async () => {
      if (!confirm(`Revoke ${key.name}?`)) return;
      const { error } = await auth.apiKey.delete({ keyId: key.id });
      if (error) report(error);
      else await refreshKeys().catch(report);
    };
    item.append(remove);
    list.append(item);
  }
}
const keyForm = document.querySelector<HTMLFormElement>("#key-create")!;
keyForm.onsubmit = async (event) => {
  event.preventDefault();
  const { data, error } = await auth.apiKey.create({
    name: String(new FormData(keyForm).get("name")),
  });
  if (error) return report(error);
  document.querySelector("#new-key")!.textContent =
    `Copy this key now; it is shown once: ${data.key}`;
  keyForm.reset();
  await refreshKeys().catch(report);
};
void auth
  .getSession()
  .then(async ({ data }) => {
    if (!data) return;
    await refresh();
    await refreshKeys();
    login.hidden = true;
    logout.hidden = keys.hidden = false;
  })
  .catch(report);
form.onsubmit = async (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  const slug = String(fields.get("slug")) || crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  // Keep this slug visible for retries, including a lost response.
  form.querySelector<HTMLInputElement>("[name=slug]")!.value = slug;
  const button = form.querySelector("button")!;
  button.disabled = true;
  try {
    const { error } = await api.links.post({
      slug,
      destination: String(fields.get("destination")),
    });
    if (error) throw error.value;
    message.textContent = `Saved /${slug}`;
    form.reset();
    await refresh();
  } catch (error) {
    report(error);
  } finally {
    button.disabled = false;
  }
};
