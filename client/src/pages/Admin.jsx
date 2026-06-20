import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  getToken, login, logout,
  fetchArticles, createArticle, updateArticle, deleteArticle,
  fetchProfile, updateProfile, uploadImage,
} from "../api";

const empty = { title: "", content: "", summary: "", tags: "" };

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState("articles");
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Profile state
  const [profile, setProfile] = useState({});
  const [profileMsg, setProfileMsg] = useState("");

  const load = () => fetchArticles().then((d) => setArticles(d.articles));
  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 2000); };

  useEffect(() => {
    if (!loggedIn) return;
    load();
    fetchProfile().then(setProfile);
  }, [loggedIn]);

  // --- Auth ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr("");
    try { await login(password); setLoggedIn(true); }
    catch { setLoginErr("Wrong password"); }
  };
  const handleLogout = () => { logout(); setLoggedIn(false); setArticles([]); };

  // --- Articles ---
  const parseTags = (raw) => raw.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    const payload = { title: form.title, content: form.content, summary: form.summary, tags: parseTags(form.tags) };
    try {
      editId ? await updateArticle(editId, payload) : await createArticle(payload);
      showMsg(editId ? "Updated!" : "Published!");
      setForm(empty); setEditId(null); load();
    } catch { showMsg("Failed, please re-login"); handleLogout(); }
  };

  const handleEdit = (a) => {
    let tagStr = "";
    try { tagStr = JSON.parse(a.tags || "[]").join(", "); } catch { tagStr = a.tags || ""; }
    setForm({ title: a.title, content: a.content, summary: a.summary || "", tags: tagStr });
    setEditId(a.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try { await deleteArticle(id); showMsg("Deleted."); if (editId === id) { setForm(empty); setEditId(null); } load(); }
    catch { showMsg("Failed, please re-login"); handleLogout(); }
  };

  // --- Image upload ---
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file);
      setForm({ ...form, content: form.content + `\n![${file.name}](${data.url})\n` });
      showMsg("Image uploaded!");
    } catch { showMsg("Upload failed"); }
    setUploading(false);
  };

  // --- Profile ---
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try { await updateProfile(profile); setProfileMsg("Saved!"); setTimeout(() => setProfileMsg(""), 2000); }
    catch { setProfileMsg("Save failed"); }
  };

  // --- Login screen ---
  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {loginErr && <p className="text-red-500 text-sm">{loginErr}</p>}
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Login</button>
        </form>
      </div>
    );
  }

  // --- Admin dashboard ---
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <button onClick={() => setTab("articles")} className={`text-lg font-semibold pb-1 border-b-2 ${tab === "articles" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>Articles</button>
          <button onClick={() => setTab("profile")} className={`text-lg font-semibold pb-1 border-b-2 ${tab === "profile" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>Profile</button>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
      </div>

      {msg && <div className="mb-4 px-4 py-2 bg-green-100 text-green-800 rounded">{msg}</div>}

      {/* ========= ARTICLES TAB ========= */}
      {tab === "articles" && (
        <div className="flex gap-6">
          {/* Editor */}
          <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-lg shadow-sm border p-6 space-y-4">
            <h2 className="font-semibold">{editId ? "Edit Article" : "New Article"}</h2>
            <input className="w-full border rounded px-3 py-2 text-lg" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="w-full border rounded px-3 py-2" placeholder="Summary (optional)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            <input className="w-full border rounded px-3 py-2" placeholder="Tags: React, Node, tutorial" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-sm px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50">
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <span className="text-xs text-gray-400">Max 5MB</span>
            </div>
            <textarea className="w-full border rounded px-3 py-2 font-mono text-sm" rows={18} placeholder="Markdown content..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{editId ? "Save" : "Publish"}</button>
              {editId && <button type="button" onClick={() => { setForm(empty); setEditId(null); }} className="px-6 py-2 border rounded text-gray-600">Cancel</button>}
            </div>
          </form>

          {/* Preview */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <h2 className="font-semibold mb-4 text-gray-400">Preview</h2>
            {form.title && <h1 className="text-2xl font-bold mb-2">{form.title}</h1>}
            {form.summary && <p className="text-gray-500 text-sm mb-4">{form.summary}</p>}
            {form.content ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{form.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-300 text-sm">Start typing to preview...</p>
            )}
          </div>
        </div>
      )}

      {/* ========= PROFILE TAB ========= */}
      {tab === "profile" && (
        <form onSubmit={handleProfileSave} className="max-w-xl bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="font-semibold mb-2">Edit Profile</h2>
          {profileMsg && <div className="px-4 py-2 bg-green-100 text-green-800 rounded text-sm">{profileMsg}</div>}
          {["name","bio","avatar","email","github","skills"].map((k) => (
            <div key={k}>
              <label className="text-xs text-gray-400 uppercase">{k}</label>
              {k === "bio" ? (
                <textarea className="w-full border rounded px-3 py-2 text-sm" rows={3} value={profile[k] || ""} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
              ) : (
                <input className="w-full border rounded px-3 py-2" value={profile[k] || ""} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
              )}
            </div>
          ))}
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Profile</button>
        </form>
      )}

      {/* ========= ARTICLE LIST ========= */}
      {tab === "articles" && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">All Articles</h2>
          {articles.length === 0 ? <p className="text-gray-500">No articles yet</p> : (
            <ul className="space-y-2">
              {articles.map((a) => (
                <li key={a.id} className="flex items-center justify-between bg-white border rounded px-4 py-3">
                  <span>{a.title}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(a)} className="text-sm text-indigo-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
