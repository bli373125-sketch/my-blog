import { Link } from "react-router-dom";

const MACARON_COLORS = [
  { bg: "bg-[#F5E4E0]", text: "text-[#8B6B65]" },
  { bg: "bg-[#E0ECF5]", text: "text-[#5B778B]" },
  { bg: "bg-[#F5F2E0]", text: "text-[#8B855B]" },
  { bg: "bg-[#E0F2EB]", text: "text-[#5B8B78]" },
  { bg: "bg-[#F5EBE0]", text: "text-[#8B755B]" },
];

function hashTag(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) | 0;
  return Math.abs(h) % MACARON_COLORS.length;
}

export default function ArticleCard({ article }) {
  const date = new Date(article.created_at);
  const dateStr = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dayNum = String(date.getDate()).padStart(2, "0");
  let tags = [];
  try {
    tags = JSON.parse(article.tags || "[]");
  } catch {
    tags = [];
  }

  return (
    <Link
      to={`/article/${article.id}`}
      className="group block bg-[var(--color-surface)] rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-vert-200 dark:hover:border-vert-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Hanger tag top bar */}
      <div className="h-[3px] w-full bg-vert-700 dark:bg-vert-600 group-hover:h-1 transition-all duration-300" />

      <div className="px-6 py-5">
        {/* Date row with industrial mono number */}
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs text-ink-300 dark:text-ink-600 tabular-nums">
            NO.{dayNum}
          </span>
          <span className="block h-px flex-1 bg-[var(--color-border)]" />
          <time className="text-xs text-ink-400 dark:text-ink-500 font-sans tracking-wide">
            {dateStr}
          </time>
        </div>

        <h2 className="text-xl font-serif font-bold text-ink-800 dark:text-ink-100 mb-2 group-hover:text-vert-700 dark:group-hover:text-vert-400 transition-colors">
          {article.title}
        </h2>

        {article.summary && (
          <p className="text-ink-500 dark:text-ink-400 text-sm leading-relaxed font-sans font-light mb-3 line-clamp-2">
            {article.summary}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex gap-1.5 font-sans">
            {tags.map((t) => {
              const c = MACARON_COLORS[hashTag(t)];
              return (
                <span
                  key={t}
                  className={`text-xs px-2.5 py-0.5 rounded font-medium ${c.bg} ${c.text}`}
                >
                  {t}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
