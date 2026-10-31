import { createClient } from "../src/client";
import type { Link } from "../src/store";
import { createAuthClient } from "better-auth/client";
import { apiKeyClient } from "@better-auth/api-key/client";

const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const auth = createAuthClient({ plugins: [apiKeyClient()] });
const api = createClient(location.origin);
const form = $<HTMLFormElement>("#create");
const search = $<HTMLInputElement>("#search");
const keys = $<HTMLDialogElement>("#keys");
const edit = $<HTMLDialogElement>("#edit");
const editForm = $<HTMLFormElement>("#edit-form");
const login = $<HTMLButtonElement>("#login");
let noticeTimer: ReturnType<typeof setTimeout>;
const notice = (text: string, error = false) => {
  clearTimeout(noticeTimer);
  for (const item of document.querySelectorAll("#message, .feedback")) item.textContent = "";
  const target = document.querySelector<HTMLElement>("dialog[open] .feedback") ?? $("#message");
  target.textContent = text;
  target.dataset.error = String(error);
  if (!error)
    noticeTimer = setTimeout(() => {
      target.textContent = "";
    }, 4500);
};
const report = (error: unknown) =>
  notice(
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String(error.message)
        : JSON.stringify(error),
    true,
  );
const loginError = new URLSearchParams(location.search).get("error");
if (loginError) notice(`Sign-in failed (${loginError}). Please try again.`, true);
let links: Record<string, Link> = {};
let editing = "";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    notice("Copied to clipboard.");
  } catch {
    notice("Couldn’t copy automatically. Select and copy the link instead.", true);
  }
}
function render() {
  const query = search.value.toLowerCase();
  const matches = Object.entries(links)
    .filter(([slug, link]) => `${slug} ${link.d}`.toLowerCase().includes(query))
    .sort(([a], [b]) => a.localeCompare(b));
  const rows = $<HTMLTableSectionElement>("tbody");
  rows.replaceChildren();
  $("#count").textContent = query
    ? `${matches.length} / ${Object.keys(links).length} links`
    : `${matches.length} links`;
  $("#empty").hidden = matches.length > 0;
  $("#empty").textContent = query
    ? "No links match that search."
    : "No links yet. Make your first one above.";
  for (const [slug, link] of matches) {
    const row = rows.insertRow();
    const anchor = document.createElement("a");
    anchor.href = `/${encodeURIComponent(slug)}`;
    anchor.textContent = `/${slug}`;
    anchor.title = `phack.rs/${slug}`;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    row.insertCell().append(anchor);
    const destination = row.insertCell();
    destination.className = "destination";
    destination.textContent = destination.title = link.d;
    const views = row.insertCell();
    views.className = "views mono";
    views.textContent = link.v.toLocaleString();
    const actions = document.createElement("div");
    actions.className = "actions";
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy";
    copyButton.setAttribute("aria-label", `Copy /${slug}`);
    copyButton.onclick = () => void copy(anchor.href);
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", `Edit /${slug}`);
    editButton.onclick = () => {
      editing = slug;
      $("#edit-title").textContent = `Edit /${slug}`;
      editForm.querySelector<HTMLInputElement>("input")!.value = link.d;
      edit.showModal();
    };
    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "danger";
    remove.setAttribute("aria-label", `Delete /${slug}`);
    remove.onclick = async () => {
      if (!confirm(`Delete /${slug}? This cannot be undone.`)) return;
      remove.disabled = true;
      try {
        const { error } = await api.links({ slug }).delete();
        if (error) throw error.value;
        await refresh();
        notice(`Deleted /${slug}.`);
      } catch (error) {
        report(error);
      } finally {
        remove.disabled = false;
      }
    };
    actions.append(copyButton, editButton, remove);
    row.insertCell().append(actions);
  }
}
async function refresh() {
  const { data, error } = await api.links.get();
  if (error) throw error.value;
  links = data;
  render();
}
search.oninput = render;
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-close]"))
  button.onclick = () => button.closest("dialog")!.close();
keys.onclose = () => {
  $("#new-key").hidden = true;
  $("#new-key code").textContent = "";
};
$("#manage-keys").onclick = () => {
  keys.showModal();
  void refreshKeys().catch(report);
};
$("#copy-key").onclick = () => void copy($("#new-key code").textContent ?? "");
login.onclick = async () => {
  login.disabled = true;
  try {
    const { error } = await auth.signIn.social({
      provider: "purduehackers",
      callbackURL: "/dashboard",
    });
    if (error) report(error);
  } catch (error) {
    report(error);
  } finally {
    login.disabled = false;
  }
};
$("#logout").onclick = async () => {
  const { error } = await auth.signOut();
  if (error) report(error);
  else location.reload();
};
async function refreshKeys() {
  const { data, error } = await auth.apiKey.list();
  if (error) throw error;
  $("#key-list").replaceChildren();
  for (const key of data.apiKeys) {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = key.name ?? "API key";
    const prefix = document.createElement("code");
    prefix.textContent = `${key.start ?? key.prefix ?? "phrs_"}…`;
    label.append(prefix);
    const remove = document.createElement("button");
    remove.textContent = "Revoke";
    remove.className = "danger";
    remove.onclick = async () => {
      if (!confirm(`Revoke ${key.name}? Any integration using it will lose access.`)) return;
      remove.disabled = true;
      try {
        const { error } = await auth.apiKey.delete({ keyId: key.id });
        if (error) throw error;
        await refreshKeys();
        notice("API key revoked.");
      } catch (error) {
        report(error);
      } finally {
        remove.disabled = false;
      }
    };
    item.append(label, remove);
    $("#key-list").append(item);
  }
}
const keyForm = $<HTMLFormElement>("#key-create");
keyForm.onsubmit = async (event) => {
  event.preventDefault();
  const button = keyForm.querySelector("button")!;
  button.disabled = true;
  try {
    const { data, error } = await auth.apiKey.create({
      name: String(new FormData(keyForm).get("name")),
    });
    if (error) throw error;
    $("#new-key code").textContent = data.key;
    $("#new-key").hidden = false;
    keyForm.reset();
    await refreshKeys();
  } catch (error) {
    report(error);
  } finally {
    button.disabled = false;
  }
};
void auth
  .getSession()
  .then(async ({ data, error }) => {
    if (error) throw error;
    if (!data) return;
    await refresh();
    $("#welcome").hidden = true;
    $("#workspace").hidden = $("#logout").hidden = $("#manage-keys").hidden = false;
  })
  .catch(report)
  .finally(() => {
    login.disabled = false;
    login.textContent = "Sign in with Purdue Hackers ID ↗";
  });
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
    form.reset();
    search.value = "";
    await refresh();
    notice(`Saved phack.rs/${slug}.`);
  } catch (error) {
    report(error);
  } finally {
    button.disabled = false;
  }
};
editForm.onsubmit = async (event) => {
  event.preventDefault();
  const button = editForm.querySelector<HTMLButtonElement>(".primary")!;
  button.disabled = true;
  try {
    const { error } = await api
      .links({ slug: editing })
      .patch({ destination: String(new FormData(editForm).get("destination")) });
    if (error) throw error.value;
    edit.close();
    await refresh();
    notice(`Updated /${editing}.`);
  } catch (error) {
    report(error);
  } finally {
    button.disabled = false;
  }
};
