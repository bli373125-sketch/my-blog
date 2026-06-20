import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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

  useEffect(() => { fetchTags().then(setTags); }, []);

  useEffect(() => {
    setLoading(true);
    fetchArticles({ page, tag: activeTag, q })
      .then((data) => { setArticles(data.articles); setTotalPages(data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, activeTag, q]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setQ(search); };

  return (
    <div>
      <Helmet><title>静思录</title></Helmet>

      {/* Hero */}
      <header className="mb-12 pt-4">
        <h1 className="text-3xl font-serif font-bold text-ink-800 dark:text-ink-100 mb-3 tracking-tight">
          静思录
        </h1>
        <p className="text-ink-400 dark:text-ink-500 font-sans text-sm leading-relaxed">
          用文字记录思考，让时间留下痕迹。
        </p>
      </header>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl px-5 py-3 text-sm text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 font-sans focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 focus:ring-1 focus:ring-rust-200 dark:focus:ring-rust-800 transition-all"
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-5 py-3 bg-ink-800 dark:bg-ink-200 text-white dark:text-ink-900 rounded-xl text-sm font-sans font-medium hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors"
          >
            搜索
          </button>
          {q && (
            <button
              type="button"
              onClick={() => { setSearch(""); setQ(""); }}
              className="px-4 py-3 text-sm text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 font-sans transition-colors"
            >
              清除
            </button>
          )}
        </div>
      </form>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex gap-2 mb-10 flex-wrap font-sans">
          <button
            onClick={() => { setActiveTag(""); setPage(1); }}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
              !activeTag
                ? "bg-ink-800 dark:bg-ink-200 text-white dark:text-ink-900 border-ink-800 dark:border-ink-200"
                : "bg-transparent text-ink-500 dark:text-ink-400 border-ink-200 dark:border-ink-700 hover:border-ink-400 dark:hover:border-ink-500"
            }`}
          >
            全部
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTag(t === activeTag ? "" : t); setPage(1); }}
              className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
                activeTag === t
                  ? "bg-ink-800 dark:bg-ink-200 text-white dark:text-ink-900 border-ink-800 dark:border-ink-200"
                  : "bg-transparent text-ink-500 dark:text-ink-400 border-ink-200 dark:border-ink-700 hover:border-ink-400 dark:hover:border-ink-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Articles */}
      {loading ? (
        <div className="text-center py-24 text-ink-300 dark:text-ink-600 font-serif text-sm">
          加载中...
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-ink-400 dark:text-ink-500 font-serif mb-4">
            还没有文章。
          </p>
          <Link
            to="/admin"
            className="text-rust-600 dark:text-rust-400 hover:underline font-sans text-sm"
          >
            写一篇
          </Link>
        </div>
      ) : (
        <div>
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-10 font-sans text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            &larr; 更新的文章
          </button>
          <span className="text-ink-300 dark:text-ink-600">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            更早的文章 &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
