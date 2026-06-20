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
    <nav className="sticky top-0 z-20 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="text-lg font-serif font-bold text-[var(--color-text)] hover:text-rust-600 dark:hover:text-rust-400 transition-colors"
        >
          静思录
        </Link>
        <div className="flex items-center gap-5">
          <ul className="flex gap-5 text-sm">
            {links.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`relative pb-0.5 transition-colors ${
                    pathname === to
                      ? "text-rust-600 dark:text-rust-400 font-medium"
                      : "text-ink-400 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
                  }`}
                >
                  {label}
                  {pathname === to && (
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-rust-500 dark:bg-rust-400 rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={toggle}
            className="text-base p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
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
