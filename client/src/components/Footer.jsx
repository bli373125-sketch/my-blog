export default function Footer() {
  return (
    <footer className="border-t py-6 text-center text-gray-500 text-sm">
      &copy; {new Date().getFullYear()} My Blog. Built with React + Express.
    </footer>
  );
}
