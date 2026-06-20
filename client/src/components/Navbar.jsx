import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "首页" },
  { to: "/about", label: "关于" },
  { to: "/admin", label: "写作" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          My Blog
        </Link>
        <ul className="flex gap-6">
          {links.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={
                  pathname === to
                    ? "text-indigo-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
