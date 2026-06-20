import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import {
  getToken, login, logout,
  fetchArticles, createArticle, updateArticle, deleteArticle,
  fetchProfile, updateProfile, uploadImage,
  fetchLifeNotes, createLifeNote, updateLifeNote, deleteLifeNote,
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
  const lnFileRef = useRef(null);
  const [profile, setProfile] = useState({});
  const [profileMsg, setProfileMsg] = useState("");
  const [LNForm, setLNForm] = useState({ title: "", content: "", mood: "", image_url: "" });
  const [editLNId, setEditLNId] = useState(null);
  const [LNList, setLNList] = useState([]);
  const [LNPage, setLNPage] = useState(1);
  const [LNTotalPages, setLNTotalPages] = useState(1);
  const [LNMsg, setLNMsg] = useState("");

  const load = () => {
    fetchArticles({ page: listPage }).then((d) => {
      setArticles(d.articles);
      setTotalPages(d.totalPages);
    });
  };
  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2000);
  };
  const showLNMsg = (text) => {
    setLNMsg(text);
    setTimeout(() => setLNMsg(""), 2000);
  };
  const loadLN = () => {
    fetchLifeNotes({ page: LNPage }).then((d) => {
      setLNList(d.notes);
      setLNTotalPages(d.totalPages);
    });
  };

  useEffect(() => {
    if (!loggedIn) return;
    load();
    fetchProfile().then(setProfile);
  }, [loggedIn, listPage]);

  useEffect(() => {
    if (!loggedIn || tab !== "lifenotes") return;
    loadLN();
  }, [loggedIn, tab, LNPage]);

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
    raw.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean);

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
      editId
        ? await updateArticle(editId, payload)
        : await createArticle(payload);
      showMsg(editId ? "已更新!" : "已发布!");
      setForm(empty);
      setEditId(null);
      load();
    } catch {
      showMsg("操作失败");
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
    if (!window.confirm("确认删除?")) return;
    try {
      await deleteArticle(id);
      showMsg("已删除。");
      if (editId === id) {
        setForm(empty);
        setEditId(null);
      }
      load();
    } catch {
      showMsg("操作失败");
      handleLogout();
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file);
      setForm({
        ...form,
        content: form.content + `\n![${file.name}](${data.url})\n`,
      });
      showMsg("上传成功!");
    } catch {
      showMsg("上传失败");
    }
    setUploading(false);
  };

  const handleLNSubmit = async (e) => {
    e.preventDefault();
    if (!LNForm.title.trim() || !LNForm.content.trim()) return;
    const payload = { title: LNForm.title, content: LNForm.content, mood: LNForm.mood, image_url: LNForm.image_url };
    try {
      editLNId
        ? await updateLifeNote(editLNId, payload)
        : await createLifeNote(payload);
      showLNMsg(editLNId ? "已更新!" : "已发布!");
      setLNForm({ title: "", content: "", mood: "", image_url: "" });
      setEditLNId(null);
      loadLN();
    } catch {
      showLNMsg("操作失败");
      handleLogout();
    }
  };

  const handleLNEdit = (n) => {
    setLNForm({ title: n.title, content: n.content, mood: n.mood || "", image_url: n.image_url || "" });
    setEditLNId(n.id);
  };

  const handleLNDelete = async (id) => {
    if (!window.confirm("确认删除?")) return;
    try {
      await deleteLifeNote(id);
      showLNMsg("已删除。");
      if (editLNId === id) {
        setLNForm({ title: "", content: "", mood: "", image_url: "" });
        setEditLNId(null);
      }
      loadLN();
    } catch {
      showLNMsg("操作失败");
      handleLogout();
    }
  };

  const handleLNImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file);
      setLNForm({ ...LNForm, image_url: data.url });
      showLNMsg("上传成功!");
    } catch {
      showLNMsg("上传失败");
    }
    setUploading(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile);
      setProfileMsg("已保存!");
      setTimeout(() => setProfileMsg(""), 2000);
    } catch {
      setProfileMsg("保存失败");
    }
  };

  // 登录表单
  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto mt-16">
        <Helmet><title>管理登录 — 静思录</title></Helmet>
        <h1 className="text-2xl font-serif font-bold mb-8 text-center text-ink-800 dark:text-ink-100">
          管理登录
        </h1>
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 p-6 space-y-4"
        >
          <input
            className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-3 bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 font-sans focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginErr && (
            <p className="text-red-500 text-sm font-sans">{loginErr}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-ink-800 dark:bg-ink-200 text-white dark:text-ink-900 font-sans font-medium rounded-xl hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors"
          >
            登录
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Helmet><title>管理 — 静思录</title></Helmet>

      {/* 顶部 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-6 font-sans">
          <button
            onClick={() => setTab("articles")}
            className={`text-lg font-medium pb-1.5 border-b-2 transition-colors ${
              tab === "articles"
                ? "border-rust-500 text-rust-600 dark:text-rust-400"
                : "border-transparent text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300"
            }`}
          >
            文章
          </button>
          <button
            onClick={() => setTab("lifenotes")}
            className={`text-lg font-medium pb-1.5 border-b-2 transition-colors ${
              tab === "lifenotes"
                ? "border-rust-500 text-rust-600 dark:text-rust-400"
                : "border-transparent text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300"
            }`}
          >
            趣事
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`text-lg font-medium pb-1.5 border-b-2 transition-colors ${
              tab === "profile"
                ? "border-rust-500 text-rust-600 dark:text-rust-400"
                : "border-transparent text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300"
            }`}
          >
            个人信息
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300 font-sans transition-colors"
        >
          退出登录
        </button>
      </div>

      {msg && (
        <div className="mb-6 px-4 py-3 bg-rust-50 dark:bg-rust-900/30 text-rust-700 dark:text-rust-300 rounded-xl text-sm font-sans">
          {msg}
        </div>
      )}

      {/* 文章管理 */}
      {tab === "articles" && (
        <div className="flex gap-6">
          {/* 编辑器 */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 p-6 space-y-4"
          >
            <h2 className="font-serif font-semibold text-ink-800 dark:text-ink-100">
              {editId ? "编辑文章" : "新建文章"}
            </h2>
            <input
              className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-2.5 text-lg bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 font-serif focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
              placeholder="标题"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-2.5 bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 font-sans focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
              placeholder="摘要"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
            <input
              className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-2.5 bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 font-sans focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
              placeholder="标签: React, Node"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-sm px-3 py-2 border border-ink-200 dark:border-ink-700 rounded-xl text-ink-500 dark:text-ink-400 font-sans hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors disabled:opacity-50"
              >
                {uploading ? "上传中..." : "上传图片"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
            <textarea
              className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-3 font-mono text-sm bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
              rows={18}
              placeholder="Markdown 内容..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-ink-800 dark:bg-ink-200 text-white dark:text-ink-900 font-sans font-medium rounded-xl hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors"
              >
                {editId ? "保存" : "发布"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(empty);
                    setEditId(null);
                  }}
                  className="px-6 py-2.5 border border-ink-200 dark:border-ink-700 rounded-xl text-ink-500 dark:text-ink-400 font-sans hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
                >
                  取消
                </button>
              )}
            </div>
          </form>

          {/* 预览 */}
          <div className="flex-1 bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <h2 className="font-sans font-medium mb-4 text-ink-300 dark:text-ink-600 text-sm uppercase tracking-wider">
              预览
            </h2>
            {form.title && (
              <h1 className="text-2xl font-serif font-bold mb-2 text-ink-800 dark:text-ink-100">
                {form.title}
              </h1>
            )}
            {form.summary && (
              <p className="text-ink-400 dark:text-ink-500 text-sm font-sans mb-4">
                {form.summary}
              </p>
            )}
            {form.content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none font-serif">
                <ReactMarkdown>{form.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-ink-200 dark:text-ink-700 text-sm font-serif">
                开始输入以预览...
              </p>
            )}
          </div>
        </div>
      )}

      {/* 趣事管理 */}
      {tab === "lifenotes" && (
        <div className="flex gap-6">
          {/* 编辑器 */}
          <form
            onSubmit={handleLNSubmit}
            className="flex-1 bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 p-6 space-y-4"
          >
            <h2 className="font-serif font-semibold text-ink-800 dark:text-ink-100">
              {editLNId ? "编辑趣事" : "新建趣事"}
            </h2>
            <input
              className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-2.5 text-lg bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 font-serif focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
              placeholder="标题"
              value={LNForm.title}
              onChange={(e) => setLNForm({ ...LNForm, title: e.target.value })}
            />
            <input
              className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-2.5 bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 font-sans focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
              placeholder="心情 (如 😄😢🤔)"
              value={LNForm.mood}
              onChange={(e) => setLNForm({ ...LNForm, mood: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => lnFileRef.current?.click()}
                disabled={uploading}
                className="text-sm px-3 py-2 border border-ink-200 dark:border-ink-700 rounded-xl text-ink-500 dark:text-ink-400 font-sans hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors disabled:opacity-50"
              >
                {uploading ? "上传中..." : "上传图片"}
              </button>
              {LNForm.image_url && (
                <span className="text-xs text-ink-400 dark:text-ink-500 font-sans truncate max-w-[200px]">
                  已选图片
                </span>
              )}
              <input
                ref={lnFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLNImageUpload}
              />
            </div>
            <textarea
              className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-3 font-mono text-sm bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
              rows={14}
              placeholder="Markdown 内容..."
              value={LNForm.content}
              onChange={(e) => setLNForm({ ...LNForm, content: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-ink-800 dark:bg-ink-200 text-white dark:text-ink-900 font-sans font-medium rounded-xl hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors"
              >
                {editLNId ? "保存" : "发布"}
              </button>
              {editLNId && (
                <button
                  type="button"
                  onClick={() => {
                    setLNForm({ title: "", content: "", mood: "", image_url: "" });
                    setEditLNId(null);
                  }}
                  className="px-6 py-2.5 border border-ink-200 dark:border-ink-700 rounded-xl text-ink-500 dark:text-ink-400 font-sans hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
                >
                  取消
                </button>
              )}
            </div>
          </form>

          {/* 预览 */}
          <div className="flex-1 bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <h2 className="font-sans font-medium mb-4 text-ink-300 dark:text-ink-600 text-sm uppercase tracking-wider">
              预览
            </h2>
            {LNForm.title && (
              <div>
                <div className="flex items-center gap-2 mb-2 font-sans text-xs text-ink-400 dark:text-ink-500">
                  <span>预览日期</span>
                  {LNForm.mood && <span>{LNForm.mood}</span>}
                </div>
                <h1 className="text-2xl font-serif font-bold mb-3 text-ink-800 dark:text-ink-100">
                  {LNForm.title}
                </h1>
                {LNForm.image_url && (
                  <img src={LNForm.image_url} alt="" className="rounded-lg mb-3 max-w-full max-h-48 object-cover" />
                )}
              </div>
            )}
            {LNForm.content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none font-serif">
                <ReactMarkdown>{LNForm.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-ink-200 dark:text-ink-700 text-sm font-serif">
                开始输入以预览...
              </p>
            )}
          </div>
        </div>
      )}

      {/* 趣事列表 */}
      {tab === "lifenotes" && (
        <div className="mt-12">
          <h2 className="text-xl font-serif font-bold mb-5 text-ink-800 dark:text-ink-100">
            所有趣事
          </h2>
          {LNMsg && (
            <div className="mb-4 px-4 py-3 bg-rust-50 dark:bg-rust-900/30 text-rust-700 dark:text-rust-300 rounded-xl text-sm font-sans">
              {LNMsg}
            </div>
          )}
          <div className="flex items-center gap-4 mb-5 font-sans">
            <button
              onClick={() => setLNPage((p) => Math.max(1, p - 1))}
              disabled={LNPage === 1}
              className="text-sm px-3 py-1.5 border border-ink-200 dark:border-ink-700 rounded-xl disabled:opacity-30 text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            >
              上一页
            </button>
            <span className="text-sm text-ink-400 dark:text-ink-500">
              {LNPage} / {LNTotalPages}
            </span>
            <button
              onClick={() => setLNPage((p) => Math.min(LNTotalPages, p + 1))}
              disabled={LNPage === LNTotalPages}
              className="text-sm px-3 py-1.5 border border-ink-200 dark:border-ink-700 rounded-xl disabled:opacity-30 text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            >
              下一页
            </button>
          </div>
          {LNList.length === 0 ? (
            <p className="text-ink-400 dark:text-ink-500 font-serif">
              暂无趣事
            </p>
          ) : (
            <ul className="space-y-2">
              {LNList.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-xl px-5 py-3.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-ink-700 dark:text-ink-200 font-sans">
                      {n.title}
                    </span>
                    {n.mood && <span className="text-sm">{n.mood}</span>}
                  </div>
                  <div className="flex gap-3 font-sans">
                    <button
                      onClick={() => handleLNEdit(n)}
                      className="text-sm text-rust-600 dark:text-rust-400 hover:underline"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleLNDelete(n.id)}
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
      )}

      {/* 个人信息 */}
      {tab === "profile" && (
        <form
          onSubmit={handleProfileSave}
          className="max-w-xl bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 p-8 space-y-4"
        >
          <h2 className="font-serif font-semibold mb-2 text-ink-800 dark:text-ink-100">
            编辑个人信息
          </h2>
          {profileMsg && (
            <div className="px-4 py-3 bg-rust-50 dark:bg-rust-900/30 text-rust-700 dark:text-rust-300 rounded-xl text-sm font-sans">
              {profileMsg}
            </div>
          )}
          {["name", "bio", "avatar", "email", "github", "skills"].map((k) => (
            <div key={k}>
              <label className="text-xs text-ink-300 dark:text-ink-600 uppercase tracking-wider font-sans">
                {k}
              </label>
              {k === "bio" ? (
                <textarea
                  className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 font-sans focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors resize-y"
                  rows={3}
                  value={profile[k] || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, [k]: e.target.value })
                  }
                />
              ) : (
                <input
                  className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-2.5 bg-white dark:bg-ink-700 text-ink-800 dark:text-ink-200 font-sans focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
                  value={profile[k] || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, [k]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="px-6 py-2.5 bg-ink-800 dark:bg-ink-200 text-white dark:text-ink-900 font-sans font-medium rounded-xl hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors"
          >
            保存信息
          </button>
        </form>
      )}

      {/* 文章列表 */}
      {tab === "articles" && (
        <div className="mt-12">
          <h2 className="text-xl font-serif font-bold mb-5 text-ink-800 dark:text-ink-100">
            所有文章
          </h2>
          <div className="flex items-center gap-4 mb-5 font-sans">
            <button
              onClick={() => setListPage((p) => Math.max(1, p - 1))}
              disabled={listPage === 1}
              className="text-sm px-3 py-1.5 border border-ink-200 dark:border-ink-700 rounded-xl disabled:opacity-30 text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            >
              上一页
            </button>
            <span className="text-sm text-ink-400 dark:text-ink-500">
              {listPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setListPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={listPage === totalPages}
              className="text-sm px-3 py-1.5 border border-ink-200 dark:border-ink-700 rounded-xl disabled:opacity-30 text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            >
              下一页
            </button>
          </div>
          {articles.length === 0 ? (
            <p className="text-ink-400 dark:text-ink-500 font-serif">
              暂无文章
            </p>
          ) : (
            <ul className="space-y-2">
              {articles.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-xl px-5 py-3.5"
                >
                  <span className="text-ink-700 dark:text-ink-200 font-sans">
                    {a.title}
                  </span>
                  <div className="flex gap-3 font-sans">
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-sm text-rust-600 dark:text-rust-400 hover:underline"
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
      )}
    </div>
  );
}
