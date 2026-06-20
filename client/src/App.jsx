import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Article from "./pages/Article";
import About from "./pages/About";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] transition-colors duration-300">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
