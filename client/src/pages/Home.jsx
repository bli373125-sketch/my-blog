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
      <Helmet><title>My Blog</title></Helmet>
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Latest</h1>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input className="flex-1 border dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600">Search</button>
          {q && <button type="button" onClick={() => { setSearch(""); setQ(""); }} className="px-3 py-2 text-sm text-gray-400">Clear</button>}
        </div>
      </form>

      {tags.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => { setActiveTag(""); setPage(1); }} className={`text-sm px-3 py-1 rounded-full ${!activeTag ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>All</button>
          {tags.map((t) => (
            <button key={t} onClick={() => { setActiveTag(t === activeTag ? "" : t); setPage(1); }} className={`text-sm px-3 py-1 rounded-full ${activeTag === t ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>{t}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : articles.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-20">
          No articles yet. <Link to="/admin" className="text-indigo-600 underline">Write one</Link>
        </p>
      ) : (
        <div className="grid gap-6">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded bg-indigo-500 text-white disabled:opacity-40">Prev</button>
          <span className="flex items-center text-gray-600 dark:text-gray-400">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded bg-indigo-500 text-white disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
