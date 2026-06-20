import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
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
  const [listPage, setListPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [profile, setProfile] = useState({});
  const [profileMsg, setProfileMsg] = useState("");

  const load = () => {
    fetchArticles({ page: listPage }).then((d) => {
      setArticles(d.articles);
      setTotalPages(d.totalPages);
    });
  };
  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 2000); };

  useEffect(() => {
    if (!loggedIn) return;
    load();
    fetchProfile().then(setProfile);
  }, [loggedIn, listPage]);

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginErr("");
    try { await login(password); setLoggedIn(true); }
    catch { setLoginErr("Wrong password"); }
  };
  const handleLogout = () => { logout(); setLoggedIn(false); setArticles([]); };

  const parseTags = (raw) => raw.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    const payload = { title: form.title, content: form.content, summary: form.summary, tags: parseTags(form.tags) };
    try {
      editId ? await updateArticle(editId, payload) : await createArticle(payload);
      showMsg(editId ? "Updated!" : "Published!");
      setForm(empty); setEditId(null); load();
    } catch { showMsg("Failed"); handleLogout(); }
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
    catch { showMsg("Failed"); handleLogout(); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const data = await uploadImage(file); setForm({ ...form, content: form.content + `\n![${file.name}](${data.url})\n` }); showMsg("Uploaded!"); }
    catch { showMsg("Upload failed"); }
    setUploading(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try { await updateProfile(profile); setProfileMsg("Saved!"); setTimeout(() => setProfileMsg(""), 2000); }
    catch { setProfileMsg("Failed"); }
  };

  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <Helmet><title>Admin Login — My Blog</title></Helmet>
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Admin Login</h1>
        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 space-y-4">
          <input className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {loginErr && <p className="text-red-500 text-sm">{loginErr}</p>}
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Helmet><title>Admin — My Blog</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <button onClick={() => setTab("articles")} className={`text-lg font-semibold pb-1 border-b-2 ${tab === "articles" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400"}`}>Articles</button>
          <button onClick={() => setTab("profile")} className={`text-lg font-semibold pb-1 border-b-2 ${tab === "profile" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400"}`}>Profile</button>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Logout</button>
      </div>

      {msg && <div className="mb-4 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">{msg}</div>}

      {tab === "articles" && (
        <div className="flex gap-6">
          <form onSubmit={handleSubmit} className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 space-y-4">
            <h2 className="font-semibold dark:text-white">{editId ? "Edit" : "New Article"}</h2>
            <input className="w-full border dark:border-gray-700 rounded px-3 py-2 text-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white" placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            <input className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white" placeholder="Tags: React, Node" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-sm px-3 py-1.5 border dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">{uploading ? "Uploading..." : "Upload Image"}</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
            <textarea className="w-full border dark:border-gray-700 rounded px-3 py-2 font-mono text-sm bg-white dark:bg-gray-700 dark:text-white" rows={18} placeholder="Markdown..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{editId ? "Save" : "Publish"}</button>
              {editId && <button type="button" onClick={() => { setForm(empty); setEditId(null); }} className="px-6 py-2 border dark:border-gray-600 rounded text-gray-600 dark:text-gray-400">Cancel</button>}
            </div>
          </form>

          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <h2 className="font-semibold mb-4 text-gray-400">Preview</h2>
            {form.title && <h1 className="text-2xl font-bold mb-2 dark:text-white">{form.title}</h1>}
            {form.summary && <p className="text-gray-500 text-sm mb-4">{form.summary}</p>}
            {form.content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{form.content}</ReactMarkdown></div>
            ) : (
              <p className="text-gray-300 text-sm">Start typing to preview...</p>
            )}
          </div>
        </div>
      )}

      {tab === "profile" && (
        <form onSubmit={handleProfileSave} className="max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 space-y-4">
          <h2 className="font-semibold mb-2 dark:text-white">Edit Profile</h2>
          {profileMsg && <div className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">{profileMsg}</div>}
          {["name","bio","avatar","email","github","skills"].map((k) => (
            <div key={k}>
              <label className="text-xs text-gray-400 uppercase">{k}</label>
              {k === "bio" ? (
                <textarea className="w-full border dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white" rows={3} value={profile[k] || ""} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
              ) : (
                <input className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white" value={profile[k] || ""} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
              )}
            </div>
          ))}
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Profile</button>
        </form>
      )}

      {tab === "articles" && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 dark:text-white">All Articles</h2>
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setListPage((p) => Math.max(1, p - 1))} disabled={listPage === 1} className="text-sm px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-30 dark:text-gray-400">Prev</button>
            <span className="text-sm text-gray-500 dark:text-gray-400">{listPage} / {totalPages}</span>
            <button onClick={() => setListPage((p) => Math.min(totalPages, p + 1))} disabled={listPage === totalPages} className="text-sm px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-30 dark:text-gray-400">Next</button>
          </div>
          {articles.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No articles</p>
          ) : (
            <ul className="space-y-2">
              {articles.map((a) => (
                <li key={a.id} className="flex items-center justify-between bg-white dark:bg-gray-800 border dark:border-gray-700 rounded px-4 py-3">
                  <span className="dark:text-gray-200">{a.title}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(a)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
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
