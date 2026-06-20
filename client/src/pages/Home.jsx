import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArticles, fetchTags } from "../api";
import ArticleCard from "../components/ArticleCard";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchTags().then(setTags);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchArticles({ page, tag: activeTag, q }).then((data) => {
      setArticles(data.articles);
      setTotalPages(data.totalPages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, activeTag, q]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(search);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">最新文章</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-4 py-2 text-sm"
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
          >
            搜索
          </button>
          {q && (
            <button
              type="button"
              onClick={() => { setSearch(""); setQ(""); }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600"
            >
              清除
            </button>
          )}
        </div>
      </form>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => { setActiveTag(""); setPage(1); }}
            className={`text-sm px-3 py-1 rounded-full ${
              !activeTag
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTag(t === activeTag ? "" : t); setPage(1); }}
              className={`text-sm px-3 py-1 rounded-full ${
                activeTag === t
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Articles */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : articles.length === 0 ? (
        <p className="text-gray-500 text-center py-20">
          暂无文章，去<Link to="/admin" className="text-indigo-600 underline">写一篇</Link>吧
        </p>
      ) : (
        <div className="grid gap-6">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded bg-indigo-500 text-white disabled:opacity-40"
          >
            上一页
          </button>
          <span className="flex items-center text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded bg-indigo-500 text-white disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
