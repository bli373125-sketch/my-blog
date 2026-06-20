export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 text-center transition-colors">
      <div className="flex items-center justify-center gap-4 mb-4">
        <span className="block h-px w-10 bg-[var(--color-border)]" />
        <span className="w-2 h-2 rotate-45 border border-vert-700 dark:border-vert-500" />
        <span className="block h-px w-10 bg-[var(--color-border)]" />
      </div>
      <p className="text-xs text-ink-400 dark:text-ink-500 font-sans tracking-widest uppercase mb-1">
        Atelier
      </p>
      <p className="font-mono text-[10px] text-ink-300 dark:text-ink-600 tracking-wide">
        &copy; {year} NO.001
      </p>
    </footer>
  );
}
