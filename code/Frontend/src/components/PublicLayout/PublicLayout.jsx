import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { useTheme } from "../../context/ThemeContext";

function PublicLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme } = useTheme();

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on route change or scroll to anchor
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    const elementId = location.hash.replace("#", "");

    requestAnimationFrame(() => {
      const target = document.getElementById(elementId);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, [location.pathname, location.hash]);

  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200"
      data-theme={resolvedTheme}
    >
      {!hideNavbar && <Navbar scrolled={scrolled} />}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;