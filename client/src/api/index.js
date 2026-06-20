const BASE = "/api";

export async function fetchArticles({ page = 1, tag = "", q = "" } = {}) {
  const params = new URLSearchParams({ page });
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const res = await fetch(`${BASE}/articles?${params}`);
  if (!res.ok) throw new Error("Failed to fetch articles");
  return res.json();
}

export async function fetchTags() {
  const res = await fetch(`${BASE}/articles/tags/all`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}

export async function fetchArticle(id) {
  const res = await fetch(`${BASE}/articles/${id}`);
  if (!res.ok) throw new Error("Article not found");
  return res.json();
}

export async function createArticle(data) {
  const res = await fetch(`${BASE}/articles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create article");
  return res.json();
}

export async function updateArticle(id, data) {
  const res = await fetch(`${BASE}/articles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update article");
  return res.json();
}

export async function deleteArticle(id) {
  const res = await fetch(`${BASE}/articles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete article");
  return res.json();
}
