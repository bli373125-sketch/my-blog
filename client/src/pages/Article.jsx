import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { fetchArticle } from "../api";
import Toc from "../components/Toc";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, "-")
    .replace(/(^-|-$)/g, "");

function createHeading(level) {
  const Tag = `h${level}`;
  return function Heading({ children }) {
    const text = String(children);
    return <Tag id={slugify(text)}>{children}</Tag>;
  };
}

export default function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchArticle(id)
      .then(setArticle)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">文章不存在</p>
        <Link to="/" className="text-indigo-600 underline mt-4 inline-block">
          返回首页
        </Link>
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  const date = new Date(article.created_at).toLocaleDateString("zh-CN");
  let tags = [];
  try {
    tags = JSON.parse(article.tags || "[]");
  } catch {
    tags = [];
  }

  return (
    <div className="flex gap-8 max-w-5xl mx-auto">
      <article className="flex-1 min-w-0">
        <Link to="/" className="text-indigo-600 text-sm mb-4 inline-block">
          &larr; 返回首页
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-2">{article.title}</h1>
        <div className="flex items-center gap-4 mb-8">
          <time className="text-sm text-gray-400">{date}</time>
          {tags.length > 0 && (
            <div className="flex gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="prose prose-lg max-w-none [&_pre]:!bg-[#282c34] [&_pre]:!rounded-lg [&_pre]:!p-4 [&_code]:!text-sm">
          <ReactMarkdown
            components={{
              h1: createHeading(1),
              h2: createHeading(2),
              h3: createHeading(3),
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
      <Toc content={article.content} />
    </div>
  );
}
