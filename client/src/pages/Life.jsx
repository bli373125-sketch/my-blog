import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { fetchLifeNotes } from "../api";

export default function Life() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchLifeNotes({ page })
      .then((data) => {
        setNotes(data.notes);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <Helmet><title>生活趣事 — 静思录</title></Helmet>

      <header className="mb-10 pt-4">
        <h1 className="text-3xl font-serif font-bold text-ink-800 dark:text-ink-100 mb-3 tracking-tight">
          生活趣事
        </h1>
        <p className="text-ink-400 dark:text-ink-500 font-sans text-sm leading-relaxed">
          记录生活中的点滴趣事，留住那些值得回味的瞬间。
        </p>
      </header>

      {loading ? (
        <div className="text-center py-24 text-ink-300 dark:text-ink-600 font-serif text-sm">
          加载中...
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-ink-400 dark:text-ink-500 font-serif mb-4">
            还没有趣事记录。
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {notes.map((note) => (
            <article
              key={note.id}
              className="bg-white dark:bg-ink-800 rounded-xl shadow-sm border border-ink-100 dark:border-ink-700 p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <time className="text-xs text-ink-400 dark:text-ink-500 font-sans tracking-wide">
                  {new Date(note.created_at).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {note.mood && (
                  <span className="text-lg" title={note.mood}>
                    {note.mood}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-serif font-bold text-ink-800 dark:text-ink-100 mb-3">
                {note.title}
              </h2>

              {note.image_url && (
                <img
                  src={note.image_url}
                  alt={note.title}
                  className="rounded-lg mb-4 max-w-full max-h-80 object-cover"
                />
              )}

              <div className="prose prose-sm dark:prose-invert max-w-none font-serif text-ink-600 dark:text-ink-300">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10 font-sans text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200 hover:border-ink-400 dark:hover:border-ink-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            &larr; 更新的趣事
          </button>
          <span className="text-ink-300 dark:text-ink-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200 hover:border-ink-400 dark:hover:border-ink-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            更早的趣事 &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
