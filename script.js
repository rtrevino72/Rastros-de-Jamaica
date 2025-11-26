// Cambia el tema del body según la sección visible
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const theme = entry.target.dataset.theme; // "red" o "cream"
          if (theme) {
            document.body.setAttribute("data-theme", theme);
          }
        }
      });
    },
    {
      threshold: 0.5, // cuando se ve ~50% de la sección
    }
  );

  sections.forEach((section) => observer.observe(section));
});
