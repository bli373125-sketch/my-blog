import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { fetchArticle, fetchComments, postComment } from "../api";
import Toc from "../components/Toc";

const slugify = (text) =>
  text.toLowerCase().replace(/[^\w一-鿿]+/g, "-").replace(/(^-|-$)/g, "");

function createHeading(level) {
  const Tag = `h${level}`;
  return function Heading({ children }) {
    const text = String(children);
    return <Tag id={slugify(text)} className="font-serif">{children}</Tag>;
  };
}

export default function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(false);
  const [comments, setComments] = useState([]);
  const [cAuthor, setCAuthor] = useState("");
  const [cContent, setCContent] = useState("");
  const [cMsg, setCMsg] = useState("");

  const loadComments = () => {
    fetchComments(id).then(setComments).catch(() => {});
  };

  useEffect(() => {
    fetchArticle(id).then(setArticle).catch(() => setError(true));
    loadComments();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!cContent.trim()) return;
    try {
      await postComment(id, { author: cAuthor, content: cContent });
      setCAuthor("");
      setCContent("");
      setCMsg("评论已发布!");
      setTimeout(() => setCMsg(""), 2000);
      loadComments();
    } catch {
      setCMsg("发布失败");
    }
  };

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-ink-500 dark:text-ink-400 font-serif text-lg">
          文章未找到
        </p>
        <Link
          to="/"
          className="text-rust-600 dark:text-rust-400 hover:underline mt-4 inline-block font-sans text-sm"
        >
          &larr; 返回首页
        </Link>
      </div>
    );
  }
  if (!article)
    return (
      <div className="text-center py-24 text-ink-300 dark:text-ink-600 font-serif">
        加载中...
      </div>
    );

  const date = new Date(article.created_at).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  let tags = [];
  try {
    tags = JSON.parse(article.tags || "[]");
  } catch {
    tags = [];
  }

  return (
    <div className="flex gap-8">
      <Helmet>
        <title>{article.title} — 静思录</title>
        <meta name="description" content={article.summary || article.title} />
      </Helmet>

      <article className="flex-1 min-w-0">
        <Link
          to="/"
          className="text-ink-400 dark:text-ink-500 hover:text-rust-600 dark:hover:text-rust-400 text-sm mb-6 inline-block font-sans transition-colors"
        >
          &larr; 返回
        </Link>

        <h1 className="text-3xl font-serif font-bold mt-2 mb-3 text-ink-800 dark:text-ink-100 leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 mb-10 font-sans">
          <time className="text-sm text-ink-400 dark:text-ink-500">
            {date}
          </time>
          {tags.length > 0 && (
            <div className="flex gap-1.5">
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
        </div>

        <div className="prose-warm font-serif">
          <ReactMarkdown
            components={{
              h1: createHeading(1),
              h2: createHeading(2),
              h3: createHeading(3),
              code({ inline, className, children, ...props }) {
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

        {/* Comments */}
        <div className="mt-14 border-t border-ink-100 dark:border-ink-800 pt-10">
          <h2 className="text-xl font-serif font-bold mb-8 text-ink-800 dark:text-ink-100">
            评论 ({comments.length})
          </h2>

          {comments.map((c) => (
            <div
              key={c.id}
              className="border-b border-ink-50 dark:border-ink-800 pb-5 mb-5 last:border-0"
            >
              <div className="flex items-center gap-2 mb-1.5 font-sans">
                <span className="font-medium text-sm text-ink-700 dark:text-ink-200">
                  {c.author || "匿名"}
                </span>
                <span className="text-xs text-ink-300 dark:text-ink-600">
                  {new Date(c.created_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <p className="text-ink-600 dark:text-ink-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {c.content}
              </p>
            </div>
          ))}

          <form onSubmit={handleComment} className="mt-8 space-y-3">
            <h3 className="font-sans font-medium text-sm text-ink-500 dark:text-ink-400">
              发表评论
            </h3>
            <input
              className="w-full max-w-xs border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 font-sans focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors"
              placeholder="昵称（可选）"
              value={cAuthor}
              onChange={(e) => setCAuthor(e.target.value)}
            />
            <textarea
              className="w-full border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-200 placeholder:text-ink-300 dark:placeholder:text-ink-600 font-sans focus:outline-none focus:border-rust-400 dark:focus:border-rust-600 transition-colors resize-y"
              rows={3}
              placeholder="写下你的想法..."
              value={cContent}
              onChange={(e) => setCContent(e.target.value)}
              required
            />
            {cMsg && (
              <p className={`text-sm font-sans ${cMsg.includes("失败") ? "text-red-500" : "text-rust-600 dark:text-rust-400"}`}>
                {cMsg}
              </p>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-ink-800 dark:bg-ink-200 text-white dark:text-ink-900 text-sm font-sans font-medium rounded-xl hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors"
            >
              发布评论
            </button>
          </form>
        </div>
      </article>

      <Toc content={article.content} />
    </div>
  );
}
