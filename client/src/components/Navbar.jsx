import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../useTheme";

const links = [
  { to: "/", label: "Home" },
  { to: "/life", label: "生活" },
  { to: "/about", label: "About" },
  { to: "/admin", label: "Write" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { dark, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-20 bg-[var(--color-bg)]/95 border-b border-[var(--color-border)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="tracking-widest-plus text-xs font-serif font-bold text-[var(--color-text)] hover:text-vert-700 dark:hover:text-vert-400 transition-colors uppercase"
        >
          静思录
        </Link>
        <div className="flex items-center gap-6">
          <ul className="flex gap-6">
            {links.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`text-xs tracking-widest uppercase transition-colors ${
                    pathname === to
                      ? "text-vert-700 dark:text-vert-400 font-medium"
                      : "text-ink-400 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={toggle}
            className="text-sm p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            title={dark ? "Switch to light" : "Switch to dark"}
            aria-label="Toggle theme"
          >
            {dark ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </nav>
  );
}
