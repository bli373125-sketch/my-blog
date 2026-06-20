import { useEffect, useState } from "react";

export default function Toc({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const matches = [...content.matchAll(/^(#{1,3})\s+(.+)$/gm)];
    const h = matches.map((m) => {
      const level = m[1].length;
      const text = m[2];
      const id = text.toLowerCase().replace(/[^\w一-鿿]+/g, "-").replace(/(^-|-$)/g, "");
      return { level, text, id };
    });
    setHeadings(h);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { for (const e of entries) { if (e.isIntersecting) setActiveId(e.target.id); } },
      { rootMargin: "-80px 0px -80% 0px" }
    );
    headings.forEach((h) => { const el = document.getElementById(h.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <nav className="sticky top-20">
        <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wide">TOC</h3>
        <ul className="space-y-1.5 border-l-2 border-gray-100 dark:border-gray-800">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block text-sm py-0.5 transition-colors ${activeId === h.id ? "text-indigo-600 dark:text-indigo-400 font-medium border-l-2 border-indigo-600 dark:border-indigo-400 -ml-0.5 pl-3" : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 pl-2.5"}`}
                style={{ paddingLeft: activeId === h.id ? undefined : `${h.level * 0.5 + 0.5}rem` }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
