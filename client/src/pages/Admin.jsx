import { useEffect, useState } from "react";
import {
  getToken,
  login,
  logout,
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../api";

const empty = { title: "", content: "", summary: "", tags: "" };

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = () => fetchArticles().then((d) => setArticles(d.articles));

  useEffect(() => {
    if (loggedIn) load();
  }, [loggedIn]);

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr("");
    try {
      await login(password);
      setLoggedIn(true);
    } catch {
      setLoginErr("密码错误");
    }
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setArticles([]);
  };

  const parseTags = (raw) =>
    raw
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const payload = {
      title: form.title,
      content: form.content,
      summary: form.summary,
      tags: parseTags(form.tags),
    };

    try {
      if (editId) {
        await updateArticle(editId, payload);
        showMsg("Updated!");
      } else {
        await createArticle(payload);
        showMsg("Published!");
      }
      setForm(empty);
      setEditId(null);
      load();
    } catch {
      showMsg("操作失败，请重新登录");
      handleLogout();
    }
  };

  const handleEdit = (a) => {
    let tagStr = "";
    try {
      tagStr = JSON.parse(a.tags || "[]").join(", ");
    } catch {
      tagStr = a.tags || "";
    }
    setForm({
      title: a.title,
      content: a.content,
      summary: a.summary || "",
      tags: tagStr,
    });
    setEditId(a.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await deleteArticle(id);
      showMsg("Deleted.");
      if (editId === id) {
        setForm(empty);
        setEditId(null);
      }
      load();
    } catch {
      showMsg("操作失败，请重新登录");
      handleLogout();
    }
  };

  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <h1 className="text-2xl font-bold mb-6 text-center">管理员登录</h1>
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-lg shadow-sm border p-6 space-y-4"
        >
          <input
            className="w-full border rounded px-3 py-2"
            type="password"
            placeholder="请输入管理密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginErr && <p className="text-red-500 text-sm">{loginErr}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            登录
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {editId ? "编辑文章" : "写文章"}
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          退出登录
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 bg-green-100 text-green-800 rounded">
          {msg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border p-6 mb-10 space-y-4"
      >
        <input
          className="w-full border rounded px-3 py-2 text-lg"
          placeholder="文章标题"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="摘要（可选）"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="标签，逗号分隔（如：React, Node, 教程）"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
        <textarea
          className="w-full border rounded px-3 py-2 font-mono text-sm"
          rows={16}
          placeholder="正文（支持 Markdown）"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {editId ? "保存修改" : "发布文章"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setForm(empty);
                setEditId(null);
              }}
              className="px-6 py-2 border rounded text-gray-600"
            >
              取消
            </button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4">所有文章</h2>
      {articles.length === 0 ? (
        <p className="text-gray-500">暂无文章</p>
      ) : (
        <ul className="space-y-2">
          {articles.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between bg-white border rounded px-4 py-3"
            >
              <span>{a.title}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(a)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
