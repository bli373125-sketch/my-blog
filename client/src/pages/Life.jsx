import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { fetchLifeNotes } from "../api";

const MOOD_COLORS = {
  bg: ["bg-[#F5E4E0]", "bg-[#E0ECF5]", "bg-[#F5F2E0]", "bg-[#E0F2EB]", "bg-[#F5EBE0]"],
};

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
      <Helmet>
        <title>生活趣事 — 静思录</title>
      </Helmet>

      <header className="mb-14 pt-4 animate-fade-up">
        <p className="font-script text-3xl text-vert-700 dark:text-vert-400 mb-2">
          Moments
        </p>
        <h1 className="text-4xl font-serif font-bold text-[var(--color-text)] mb-4 tracking-widest-plus uppercase">
          生活趣事
        </h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="block h-px w-8 bg-vert-700 dark:bg-vert-500" />
          <span className="w-1.5 h-1.5 rotate-45 border border-vert-700 dark:border-vert-500" />
          <span className="block h-px w-8 bg-vert-700 dark:bg-vert-500" />
        </div>
        <p className="text-ink-400 dark:text-ink-500 font-sans font-light text-sm leading-relaxed max-w-md">
          记录生活中的点滴趣事，留住那些值得回味的瞬间。
        </p>
      </header>

      {loading ? (
        <div className="text-center py-24 text-ink-300 dark:text-ink-600 font-serif text-sm">
          Loading...
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-ink-400 dark:text-ink-500 font-serif mb-4">
            还没有趣事记录。
          </p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Timeline stitch line */}
          <div className="absolute left-0 top-2 bottom-2 w-px border-l border-dashed border-[var(--color-border)]" />

          <div className="space-y-8">
            {notes.map((note, i) => {
              const date = new Date(note.created_at);
              const num = String(i + 1 + (page - 1) * 10).padStart(2, "0");

              return (
                <article
                  key={note.id}
                  className="relative bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-vert-200 dark:hover:border-vert-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Hanger tag top bar */}
                  <div className="h-[3px] w-full bg-vert-700 dark:bg-vert-600 rounded-t-xl" />

                  {/* Timeline dot */}
                  <div className="absolute -left-[2.15rem] top-5 w-2.5 h-2.5 rounded-full bg-vert-700 dark:bg-vert-500 ring-2 ring-[var(--color-bg)]" />

                  <div className="px-6 py-5">
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-xs text-ink-300 dark:text-ink-600 tabular-nums">
                        NO.{num}
                      </span>
                      <span className="block h-px flex-1 bg-[var(--color-border)]" />
                      <time className="text-xs text-ink-400 dark:text-ink-500 font-sans tracking-wide">
                        {date.toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                      {note.mood && (
                        <span className="text-sm" title={note.mood}>
                          {note.mood}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-serif font-bold text-[var(--color-text)] mb-3">
                      {note.title}
                    </h2>

                    {note.image_url && (
                      <img
                        src={note.image_url}
                        alt={note.title}
                        className="rounded-lg mb-4 max-w-full max-h-80 object-cover"
                      />
                    )}

                    <div className="prose prose-sm dark:prose-invert max-w-none font-serif text-ink-600 dark:text-ink-300 font-light">
                      <ReactMarkdown>{note.content}</ReactMarkdown>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

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
