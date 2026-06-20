import { useEffect, useState } from "react";

export default function Toc({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const matches = [...content.matchAll(/^(#{1,3})\s+(.+)$/gm)];
    const h = matches.map((m) => {
      const level = m[1].length;
      const text = m[2];
      const id = text
        .toLowerCase()
        .replace(/[^\w一-鿿]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return { level, text, id };
    });
    setHeadings(h);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id);
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden lg:block w-52 shrink-0">
      <nav className="sticky top-20">
        <h3 className="text-[10px] font-mono font-medium text-ink-300 dark:text-ink-600 mb-4 uppercase tracking-widest">
          Index
        </h3>
        <ul className="space-y-1.5 border-l border-[var(--color-border)]">
          {headings.map((h, i) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block text-sm py-0.5 transition-colors font-sans ${
                  activeId === h.id
                    ? "text-vert-700 dark:text-vert-400 font-medium border-l-2 border-vert-700 dark:border-vert-500 -ml-px pl-3"
                    : "text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300 pl-2.5"
                }`}
                style={{
                  paddingLeft:
                    activeId === h.id ? undefined : `${h.level * 0.5 + 0.5}rem`,
                }}
              >
                <span className="font-mono text-[10px] text-ink-300 dark:text-ink-600 mr-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
