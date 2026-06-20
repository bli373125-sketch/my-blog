export default function Footer() {
  return (
    <footer className="py-10 text-center text-ink-400 dark:text-ink-500 text-xs font-sans transition-colors">
      <div className="flex items-center justify-center gap-4 mb-3">
        <span className="block h-px w-12 bg-ink-200 dark:bg-ink-700" />
        <span className="text-ink-300 dark:text-ink-600">✦</span>
        <span className="block h-px w-12 bg-ink-200 dark:bg-ink-700" />
      </div>
      <p>&copy; {new Date().getFullYear()} 静思录 &mdash; Built with React + Express</p>
    </footer>
  );
}
