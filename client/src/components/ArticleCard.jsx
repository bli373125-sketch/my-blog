import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  const date = new Date(article.created_at).toLocaleDateString("zh-CN");
  let tags = [];
  try {
    tags = JSON.parse(article.tags || "[]");
  } catch {
    tags = [];
  }

  return (
    <Link
      to={`/article/${article.id}`}
      className="block bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
    >
      <h2 className="text-xl font-semibold mb-2 text-indigo-700">
        {article.title}
      </h2>
      {article.summary && (
        <p className="text-gray-600 mb-3">{article.summary}</p>
      )}
      <div className="flex items-center gap-3">
        <time className="text-sm text-gray-400">{date}</time>
        {tags.length > 0 && (
          <div className="flex gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
