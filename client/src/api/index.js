const BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("blog_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getToken() {
  return localStorage.getItem("blog_token");
}

export async function login(password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Wrong password");
  const data = await res.json();
  localStorage.setItem("blog_token", data.token);
  return data;
}

export function logout() {
  localStorage.removeItem("blog_token");
}

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
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create article");
  return res.json();
}

export async function updateArticle(id, data) {
  const res = await fetch(`${BASE}/articles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update article");
  return res.json();
}

export async function deleteArticle(id) {
  const res = await fetch(`${BASE}/articles/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete article");
  return res.json();
}

// Comments
export async function fetchComments(articleId) {
  const res = await fetch(`${BASE}/comments/article/${articleId}`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function postComment(articleId, { author, content }) {
  const res = await fetch(`${BASE}/comments/article/${articleId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, content }),
  });
  if (!res.ok) throw new Error("Failed to post comment");
  return res.json();
}

// Profile
export async function fetchProfile() {
  const res = await fetch(`${BASE}/profile`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateProfile(data) {
  const res = await fetch(`${BASE}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

// Life Notes
export async function fetchLifeNotes({ page = 1 } = {}) {
  const params = new URLSearchParams({ page });
  const res = await fetch(`${BASE}/lifenotes?${params}`);
  if (!res.ok) throw new Error("Failed to fetch life notes");
  return res.json();
}

export async function fetchLifeNote(id) {
  const res = await fetch(`${BASE}/lifenotes/${id}`);
  if (!res.ok) throw new Error("Life note not found");
  return res.json();
}

export async function createLifeNote(data) {
  const res = await fetch(`${BASE}/lifenotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create life note");
  return res.json();
}

export async function updateLifeNote(id, data) {
  const res = await fetch(`${BASE}/lifenotes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update life note");
  return res.json();
}

export async function deleteLifeNote(id) {
  const res = await fetch(`${BASE}/lifenotes/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete life note");
  return res.json();
}

// Upload
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload image");
  return res.json();
}
