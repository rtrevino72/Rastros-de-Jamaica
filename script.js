// <source src="https://res.cloudinary.com/losrodriguez/video/upload/v1765240683/Flores_zsohnw.mp4" type="video/mp4">

document.addEventListener("DOMContentLoaded", () => {

  const introVideo = document.querySelector(".intro-video");

  if (introVideo) {
    const markVideoLoaded = () => {
      document.body.classList.add("video-loaded");
    };

    // El evento puede dispararse antes de que el listener se registre si el video carga muy rápido.
    // Por eso escuchamos loadeddata y también comprobamos el estado actual.
    introVideo.addEventListener("loadeddata", markVideoLoaded, { once: true });

    if (introVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      markVideoLoaded();
    }
    // --- Slider de fotos (Swiper) ---
    const swiper = new Swiper(".mySwiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
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
        console.log("section closest", section)
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

  // --- Estilos dinámicos para el documental ---
  injectDocStyles();

  // --- YouTube Player API (cargar después de load para no retrasar la vista) ---
  window.addEventListener("load", loadYouTubeAPI);
});

// YouTube Player API - debe estar en scope global
let youtubePlayer = null;
const videoId = "2r1MFLReCRg"; // ID del video de YouTube

// Función que YouTube API llama cuando está lista (debe ser global)
window.onYouTubeIframeAPIReady = function () {
  youtubePlayer = new YT.Player("youtube-player", {
    videoId: videoId,
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

// Cuando el reproductor está listo
function onPlayerReady(event) {
  // El reproductor está listo, pero no se reproduce automáticamente
}

// Cuando cambia el estado del reproductor
function onPlayerStateChange(event) {
  const posterImg = document.getElementById("doc-poster");

  // Estado 1 = PLAYING (reproduciendo)
  if (event.data === YT.PlayerState.PLAYING) {
    if (posterImg) {
      posterImg.classList.add("hidden");
    }
  }
}

// Inicializar el reproductor si la API ya está cargada
function initYouTubePlayer() {
  if (typeof YT !== "undefined" && YT.Player) {
    window.onYouTubeIframeAPIReady();
  }
}

// Carga la API de YouTube de forma diferida
function loadYouTubeAPI() {
  // Si ya existe el script o la API, no volver a cargar
  if (document.getElementById("yt-iframe-api")) {
    initYouTubePlayer();
    return;
  }

  if (typeof YT !== "undefined" && YT.Player) {
    initYouTubePlayer();
    return;
  }

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.id = "yt-iframe-api";
  tag.async = true;
  document.head.appendChild(tag);
}

// Inyecta estilos dinámicos para el contenedor del documental
function injectDocStyles() {
  if (document.getElementById("doc-container-dynamic-styles")) return;

  const styleContent = `
    #doc-container img {
      transition: transform 1s ease-in-out, opacity 0.5s ease;
      pointer-events: none;
      z-index: 2;
    }
    #doc-container img.hidden {
      opacity: 0;
      pointer-events: none;
      transform: scale(.96);
    }`;

  const styleTag = document.createElement("style");
  styleTag.id = "doc-container-dynamic-styles";
  styleTag.textContent = styleContent;
  document.head.appendChild(styleTag);
}


