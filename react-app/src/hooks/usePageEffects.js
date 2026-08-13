import { useEffect } from "react";

export default function usePageEffects() {
  useEffect(() => {
    const nav = document.getElementById("siteNav");
    const scrollTop = document.getElementById("scrollTop");

    const onScroll = () => {
      nav && nav.classList.toggle("scrolled", window.scrollY > 20);
      scrollTop && scrollTop.classList.toggle("visible", window.scrollY > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    scrollTop &&
      scrollTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".ma-reveal").forEach((el) => revealObserver.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTop) scrollTop.removeEventListener("click", onScroll);
      revealObserver.disconnect();
    };
  }, []);
}
