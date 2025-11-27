document.addEventListener("DOMContentLoaded", () => {

const introVideo = document.querySelector(".intro-video");

if (introVideo) {
    introVideo.addEventListener("loadeddata", () => {
        document.body.classList.add("video-loaded");
    });
}

  const sections = Array.from(document.querySelectorAll("main .section"));

  function updateThemeByCenter() {
    const viewportCenter = window.innerHeight / 2;
    let closestSection = null;
    let closestDistance = Infinity;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestSection = section;
      }
    });

    if (closestSection) {
      const theme = closestSection.dataset.theme;
      if (theme) {
        document.body.setAttribute("data-theme", theme);
      }
    }
  }


  updateThemeByCenter();
  window.addEventListener("scroll", updateThemeByCenter);
  window.addEventListener("resize", updateThemeByCenter);



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
      { threshold: 0.3 }
    );

    navObserver.observe(introSection);
  }


  const introOverlay = document.querySelector(".intro-overlay");

  function finishIntro() {
    if (!document.body.classList.contains("intro-finished")) {
      document.body.classList.add("intro-finished");
    }
  }

  function handleScroll() {
    if (window.scrollY > 10) {
      finishIntro();
      window.removeEventListener("scroll", handleScroll);
    }
  }

  if (introOverlay) {
    window.addEventListener("scroll", handleScroll, { passive: true });
    introOverlay.addEventListener("click", finishIntro);
  }
});


var swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});