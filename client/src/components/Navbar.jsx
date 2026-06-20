import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../useTheme";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/admin", label: "Write" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { dark, toggle } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          My Blog
        </Link>
        <div className="flex items-center gap-4">
          <ul className="flex gap-6">
            {links.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={
                    pathname === to
                      ? "text-indigo-600 dark:text-indigo-400 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={toggle}
            className="text-lg p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title={dark ? "Switch to light" : "Switch to dark"}
          >
            {dark ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </nav>
  );
}
