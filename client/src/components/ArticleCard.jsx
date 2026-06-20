import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  const date = new Date(article.created_at).toLocaleDateString("zh-CN");
  let tags = [];
  try { tags = JSON.parse(article.tags || "[]"); } catch { tags = []; }

  return (
    <Link
      to={`/article/${article.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <h2 className="text-xl font-semibold mb-2 text-indigo-700 dark:text-indigo-400">
        {article.title}
      </h2>
      {article.summary && (
        <p className="text-gray-600 dark:text-gray-400 mb-3">{article.summary}</p>
      )}
      <div className="flex items-center gap-3">
        <time className="text-sm text-gray-400 dark:text-gray-500">{date}</time>
        {tags.length > 0 && (
          <div className="flex gap-1">
            {tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
