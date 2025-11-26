document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section");

  const themeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const theme = entry.target.dataset.theme;
          if (theme) {
            document.body.setAttribute("data-theme", theme);
          }
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  sections.forEach((section) => themeObserver.observe(section));

  const introSection = document.querySelector("#intro");

  if (introSection) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.body.classList.add("nav-visible");
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    navObserver.observe(introSection);
  }
});
