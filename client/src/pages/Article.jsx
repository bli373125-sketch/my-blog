import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
    return <Tag id={slugify(text)}>{children}</Tag>;
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
    fetchArticle(id)
      .then(setArticle)
      .catch(() => setError(true));
    loadComments();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!cContent.trim()) return;
    try {
      await postComment(id, { author: cAuthor, content: cContent });
      setCAuthor(""); setCContent(""); setCMsg("Comment posted!");
      setTimeout(() => setCMsg(""), 2000);
      loadComments();
    } catch { setCMsg("Failed to post comment"); }
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Article not found</p>
        <Link to="/" className="text-indigo-600 underline mt-4 inline-block">Back to home</Link>
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  const date = new Date(article.created_at).toLocaleDateString("zh-CN");
  let tags = [];
  try { tags = JSON.parse(article.tags || "[]"); } catch { tags = []; }

  return (
    <div className="flex gap-8 max-w-5xl mx-auto">
      <article className="flex-1 min-w-0">
        <Link to="/" className="text-indigo-600 text-sm mb-4 inline-block">&larr; Back to home</Link>
        <h1 className="text-3xl font-bold mt-2 mb-2">{article.title}</h1>
        <div className="flex items-center gap-4 mb-8">
          <time className="text-sm text-gray-400">{date}</time>
          {tags.length > 0 && (
            <div className="flex gap-1.5">
              {tags.map((t) => (<span key={t} className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">{t}</span>))}
            </div>
          )}
        </div>
        <div className="prose prose-lg max-w-none [&_pre]:!bg-[#282c34] [&_pre]:!rounded-lg [&_pre]:!p-4 [&_code]:!text-sm [&_img]:rounded-lg">
          <ReactMarkdown
            components={{
              h1: createHeading(1), h2: createHeading(2), h3: createHeading(3),
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">{String(children).replace(/\n$/, "")}</SyntaxHighlighter>
                ) : (<code className={className} {...props}>{children}</code>);
              },
            }}
          >{article.content}</ReactMarkdown>
        </div>

        {/* Comments */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-6">Comments ({comments.length})</h2>

          {comments.map((c) => (
            <div key={c.id} className="border-b pb-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{c.author}</span>
                <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString("zh-CN")}</span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}

          <form onSubmit={handleComment} className="mt-6 space-y-3">
            <h3 className="font-semibold text-sm text-gray-500">Leave a comment</h3>
            <input className="w-full max-w-xs border rounded px-3 py-2 text-sm" placeholder="Your name (optional)" value={cAuthor} onChange={(e) => setCAuthor(e.target.value)} />
            <textarea className="w-full border rounded px-3 py-2 text-sm" rows={3} placeholder="Write a comment..." value={cContent} onChange={(e) => setCContent(e.target.value)} required />
            {cMsg && <p className="text-sm text-green-600">{cMsg}</p>}
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">Post comment</button>
          </form>
        </div>
      </article>
      <Toc content={article.content} />
    </div>
  );
}
