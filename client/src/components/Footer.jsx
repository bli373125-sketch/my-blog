export default function Footer() {
  return (
    <footer className="border-t dark:border-gray-800 py-6 text-center text-gray-500 dark:text-gray-500 text-sm transition-colors">
      &copy; {new Date().getFullYear()} My Blog. Built with React + Express.
    </footer>
  );
}
