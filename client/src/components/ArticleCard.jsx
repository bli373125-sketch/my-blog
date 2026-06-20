import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  const date = new Date(article.created_at);
  const dateStr = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  let tags = [];
  try { tags = JSON.parse(article.tags || "[]"); } catch { tags = []; }

  return (
    <Link
      to={`/article/${article.id}`}
      className="group block py-7 border-b border-ink-100 dark:border-ink-800 last:border-b-0 transition-colors hover:translate-x-1 duration-200"
    >
      <time className="block text-xs text-ink-400 dark:text-ink-500 mb-2 font-sans tracking-wide">
        {dateStr}
      </time>
      <h2 className="text-xl font-serif font-bold text-ink-800 dark:text-ink-100 mb-2 group-hover:text-rust-600 dark:group-hover:text-rust-400 transition-colors">
        {article.title}
      </h2>
      {article.summary && (
        <p className="text-ink-500 dark:text-ink-400 text-sm leading-relaxed font-serif mb-3 line-clamp-2">
          {article.summary}
        </p>
      )}
      {tags.length > 0 && (
        <div className="flex gap-1.5 font-sans">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-0.5 rounded-full bg-rust-50 dark:bg-rust-900/40 text-rust-600 dark:text-rust-400"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
