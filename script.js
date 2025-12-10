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

  let lastScrollY = window.scrollY;

  function updateThemeByCenter() {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const scrollingUp = window.scrollY < lastScrollY;

    const titleData = sections
      .map((section) => {
        const title = section.querySelector(".jamaica-title");
        const rectSource = title || section; // fallback para secciones sin título (ej. #intro)
        if (!rectSource) return null;
        return { section, rect: rectSource.getBoundingClientRect() };
      })
      .filter(Boolean);

    const fullyVisible = titleData.find(({ rect }) => {
      const fullyInsideVertical = rect.top >= 0 && rect.bottom <= viewportHeight;
      const fullyInsideHorizontal = rect.left >= 0 && rect.right <= viewportWidth;
      return fullyInsideVertical && fullyInsideHorizontal;
    });

    let target = fullyVisible;

    // Si ningún título está totalmente visible, escogemos uno parcialmente visible.
    // Al hacer scroll hacia arriba, priorizamos el que está entrando por arriba.
    if (!target) {
      const partiallyVisible = titleData.filter(({ rect }) => rect.bottom > 0 && rect.top < viewportHeight);

      if (scrollingUp) {
        const enteringFromTop = partiallyVisible
          .filter(({ rect }) => rect.top < 0) // está arriba pero alcanzando el viewport
          .sort((a, b) => b.rect.top - a.rect.top); // el más cercano al límite superior

        target = enteringFromTop[0] || partiallyVisible[0];
      } else {
        // Scroll hacia abajo: elegimos el primero que aparece dentro del viewport.
        target = partiallyVisible[0];
      }
    }

    if (target) {
      const theme = target.section.dataset.theme;
      if (theme) {
        document.body.setAttribute("data-theme", theme);
      }
    }

    lastScrollY = window.scrollY;
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

  // --- Ocultar poster inmediatamente al hacer click y reproducir video ---
  const docPoster = document.getElementById("doc-poster");
  const docContainer = document.getElementById("doc-container");
  
  if (docPoster && docContainer) {
    // Variable para rastrear si el usuario ya hizo click
    let userClicked = false;
    
    docContainer.addEventListener("click", function(e) {
      // Si el click es en la imagen o en el contenedor (pero no directamente en el iframe)
      if (e.target === docPoster || e.target === docContainer) {
        e.preventDefault();
        e.stopPropagation();
        
        // Marcar que el usuario hizo click
        userClicked = true;
        
        // Ocultar la imagen inmediatamente
        docPoster.classList.add("hidden");
        docPoster.style.pointerEvents = "none";
        
        // Intentar reproducir el video
        const iframe = docContainer.querySelector("iframe");
        if (iframe) {
          // Si la API de YouTube está disponible, usar playVideo
          if (youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
            try {
              youtubePlayer.playVideo();
            } catch (error) {
              console.log("Error al reproducir con API, usando método alternativo");
              // Si falla, usar el método del iframe
              let src = iframe.getAttribute('src');
              if (src && !src.includes('autoplay=1')) {
                src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
                iframe.setAttribute('src', src);
              }
            }
          } else {
            // Si la API no está lista, modificar el src del iframe para incluir autoplay
            let src = iframe.getAttribute('src');
            if (src && !src.includes('autoplay=1')) {
              // Agregar autoplay=1 al src si no está presente
              src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
              iframe.setAttribute('src', src);
            }
          }
        }
      }
    });
    
    // Guardar la referencia para usar en onPlayerReady
    window._userClickedDocPoster = function() {
      return userClicked;
    };
  }

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
  // Si la imagen ya está oculta (usuario hizo click antes de que cargara la API), reproducir
  const docPoster = document.getElementById("doc-poster");
  if (docPoster && (docPoster.classList.contains("hidden") || (window._userClickedDocPoster && window._userClickedDocPoster()))) {
    // El usuario ya hizo click, reproducir el video
    if (youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
      try {
        youtubePlayer.playVideo();
      } catch (error) {
        console.log("Error al reproducir video:", error);
      }
    }
  }
}

// Cuando cambia el estado del reproductor
function onPlayerStateChange(event) {
  // Ya no ocultamos la imagen aquí, se oculta inmediatamente al hacer click
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
      pointer-events: auto;
      z-index: 2;
      cursor: pointer;
    }
    #doc-container img.hidden {
      opacity: 0;
      pointer-events: none !important;
      transform: scale(.96);
      z-index: 0;
    }
    #doc-container iframe {
      position: relative;
      z-index: 1;
    }`;

  const styleTag = document.createElement("style");
  styleTag.id = "doc-container-dynamic-styles";
  styleTag.textContent = styleContent;
  document.head.appendChild(styleTag);
}


