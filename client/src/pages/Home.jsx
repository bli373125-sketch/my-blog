import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchArticles, fetchTags } from "../api";
import ArticleCard from "../components/ArticleCard";

const MACARON_COLORS = [
  { bg: "bg-[#F5E4E0]", text: "text-[#8B6B65]", activeBg: "bg-[#E8CFC8]" },
  { bg: "bg-[#E0ECF5]", text: "text-[#5B778B]", activeBg: "bg-[#C8DDF0]" },
  { bg: "bg-[#F5F2E0]", text: "text-[#8B855B]", activeBg: "bg-[#EDE8C8]" },
  { bg: "bg-[#E0F2EB]", text: "text-[#5B8B78]", activeBg: "bg-[#C8E8DA]" },
  { bg: "bg-[#F5EBE0]", text: "text-[#8B755B]", activeBg: "bg-[#EDDEC8]" },
];

function hashTag(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) | 0;
  return Math.abs(h) % MACARON_COLORS.length;
}

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
    fetchArticles({ page, tag: activeTag, q })
      .then((data) => {
        setArticles(data.articles);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, activeTag, q]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(search);
  };

  return (
    <div>
      <Helmet>
        <title>静思录</title>
      </Helmet>

      {/* Hero */}
      <header className="mb-14 pt-6 animate-fade-up">
        <p className="font-script text-3xl text-vert-700 dark:text-vert-400 mb-2">
          Atelier
        </p>
        <h1 className="text-4xl font-serif font-bold text-[var(--color-text)] mb-4 tracking-widest-plus uppercase">
          静思录
        </h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="block h-px w-8 bg-vert-700 dark:bg-vert-500" />
          <span className="w-1.5 h-1.5 rotate-45 border border-vert-700 dark:border-vert-500" />
          <span className="block h-px w-8 bg-vert-700 dark:bg-vert-500" />
        </div>
        <p className="text-ink-400 dark:text-ink-500 font-sans font-light text-sm leading-relaxed max-w-md">
          用文字记录思考，让时间留下痕迹。
        </p>
      </header>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-10 animate-fade-up animate-delay-1">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] px-5 py-3 text-sm text-[var(--color-text)] placeholder:text-ink-300 dark:placeholder:text-ink-600 font-sans font-light focus:outline-none focus:border-vert-500 dark:focus:border-vert-600 focus:ring-1 focus:ring-vert-200 dark:focus:ring-vert-800 transition-all"
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-vert-700 dark:bg-vert-600 text-white text-sm font-sans font-medium hover:bg-vert-800 dark:hover:bg-vert-500 transition-colors uppercase tracking-widest"
          >
            Search
          </button>
          {q && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setQ("");
              }}
              className="px-4 py-3 text-sm text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 font-sans transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex gap-2 mb-12 flex-wrap font-sans animate-fade-up animate-delay-2">
          <button
            onClick={() => {
              setActiveTag("");
              setPage(1);
            }}
            className={`text-xs px-4 py-1.5 rounded-full border transition-all uppercase tracking-widest ${
              !activeTag
                ? "bg-vert-700 dark:bg-vert-600 text-white border-vert-700 dark:border-vert-600"
                : "bg-transparent text-ink-400 dark:text-ink-500 border-[var(--color-border)] hover:border-vert-400"
            }`}
          >
            All
          </button>
          {tags.map((t) => {
            const c = MACARON_COLORS[hashTag(t)];
            const isActive = activeTag === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setActiveTag(isActive ? "" : t);
                  setPage(1);
                }}
                className={`text-xs px-4 py-1.5 rounded-full transition-all ${
                  isActive
                    ? `${c.activeBg} ${c.text} font-medium`
                    : `text-ink-400 dark:text-ink-500 hover:${c.bg} hover:${c.text} border border-[var(--color-border)]`
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}

      {/* Articles */}
      {loading ? (
        <div className="text-center py-24 text-ink-300 dark:text-ink-600 font-serif text-sm">
          Loading...
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-ink-400 dark:text-ink-500 font-serif mb-4">
            还没有文章。
          </p>
          <Link
            to="/admin"
            className="text-vert-700 dark:text-vert-400 hover:underline font-sans text-sm"
          >
            写一篇
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((a, i) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-12 font-sans text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-ink-400 dark:text-ink-500 hover:text-vert-700 dark:hover:text-vert-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase tracking-widest text-xs"
          >
            &larr; Newer
          </button>
          <span className="font-mono text-xs text-ink-300 dark:text-ink-600 tabular-nums">
            {String(page).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-ink-400 dark:text-ink-500 hover:text-vert-700 dark:hover:text-vert-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase tracking-widest text-xs"
          >
            Older &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
