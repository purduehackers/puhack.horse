import { createClient } from "../src/client";
const auth = document.querySelector<HTMLFormElement>("#auth")!;
const form = document.querySelector<HTMLFormElement>("#create")!;
const table = document.querySelector("table")!;
const rows = document.querySelector("tbody")!;
const message = document.querySelector("#message")!;
let api = createClient(location.origin, "");
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
auth.onsubmit = async (event) => {
  event.preventDefault();
  api = createClient(location.origin, String(new FormData(auth).get("token")));
  try {
    await refresh();
    auth.reset();
    message.textContent = "Connected";
  } catch (error) {
    report(error);
  }
};
document.querySelector<HTMLButtonElement>("#logout")!.onclick = () => {
  api = createClient(location.origin, "");
  rows.replaceChildren();
  auth.reset();
  form.hidden = table.hidden = true;
  message.textContent = "Disconnected";
};
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
