/**
 * ============================================================================
 * MÓDULO DE CARRUSEL DE IMÁGENES INTERACTIVO (CAROUSEL JS)
 * Compañía de Ballet - Universidad Católica Boliviana "San Pablo"
 * 
 * Este módulo implementa un carrusel de diapositivas totalmente funcional,
 * dinámico, responsive y accesible en JavaScript Vainilla (sin librerías externas).
 * 
 * CARACTERÍSTICAS INCLUIDAS:
 * 1. Navegación manual (Botones Anterior / Siguiente).
 * 2. Indicadores directos (Puntos / Dots) con actualización de estado activo.
 * 3. Reproducción automática (Autoplay) con temporizador configurable.
 * 4. Pausa automática al interactuar (Mouseenter / Focus) para mejor usabilidad.
 * 5. Soporte para eventos táctiles (Swipe en dispositivos móviles).
 * 6. Navegación por teclado (Flechas Izquierda / Derecha).
 * 7. Accesibilidad ARIA (aria-hidden, aria-selected, aria-label).
 * ============================================================================
 */

class BalletCarousel {
  /**
   * Constructor de la clase BalletCarousel.
   * @param {string} containerSelector - Selector CSS del contenedor principal del carrusel.
   * @param {Object} options - Configuración opcional del carrusel.
   * @param {number} options.autoplayInterval - Tiempo en milisegundos entre diapositivas (por defecto: 5000ms).
   * @param {boolean} options.loop - Indica si el carrusel es circular (por defecto: true).
   */
  constructor(containerSelector, options = {}) {
    // 1. OBTENCIÓN DEL CONTENEDOR PRINCIPAL
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.warn(`[BalletCarousel] No se encontró el contenedor: ${containerSelector}`);
      return;
    }

    // 2. CONFIGURACIÓN E INICIALIZACIÓN DE VALORES POR DEFECTO
    this.options = Object.assign({
      autoplayInterval: 5000, // 5 segundos por cambio de imagen
      loop: true
    }, options);

    // 3. SELECCIÓN DE ELEMENTOS DEL DOM INTERNOS
    this.slidesTrack = this.container.querySelector('.carousel-track');
    this.slides = Array.from(this.container.querySelectorAll('.carousel-slide'));
    this.prevBtn = this.container.querySelector('.carousel-btn-prev');
    this.nextBtn = this.container.querySelector('.carousel-btn-next');
    this.dotsContainer = this.container.querySelector('.carousel-dots');
    this.counterElement = this.container.querySelector('.carousel-counter');
    this.playPauseBtn = this.container.querySelector('.carousel-play-pause');

    // 4. ESTADO INTERNO DEL CARRUSEL
    this.currentIndex = 0;             // Índice de la diapositiva activa actual (0..N-1)
    this.totalSlides = this.slides.length; // Cantidad total de imágenes
    this.autoplayTimer = null;         // Referencia al temporizador setInterval
    this.isPlaying = true;             // Estado de reproducción automática
    this.touchStartX = 0;              // Coordenada X inicial para gestos táctiles
    this.touchEndX = 0;                // Coordenada X final para gestos táctiles

    // Si no existen diapositivas, cancelar la ejecución
    if (this.totalSlides === 0) {
      console.warn('[BalletCarousel] No hay diapositivas (.carousel-slide) dentro del contenedor.');
      return;
    }

    // 5. ARRANCAR EL COMPONENTE
    this.init();
  }

  /**
   * Método de Inicialización: Configura la estructura, eventos y arranca la primera vista.
   */
  init() {
    this.createDots();         // Generar dinámicamente los puntos de navegación si no existen
    this.updateCarousel();      // Renderizar el estado inicial (slide 0)
    this.bindEvents();          // Asignar escuchadores de eventos a los botones e interactividad
    this.startAutoplay();       // Iniciar la reproducción automática
  }

  /**
   * Crea dinámicamente los botones de puntos (dots) en base al número de diapositivas.
   */
  createDots() {
    if (!this.dotsContainer) return;
    
    // Limpiar contenido previo por seguridad
    this.dotsContainer.innerHTML = '';

    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', `Ir a la diapositiva ${index + 1}`);
      dot.setAttribute('data-index', index);
      
      if (index === 0) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.setAttribute('aria-selected', 'false');
      }

      this.dotsContainer.appendChild(dot);
    });

    this.dots = Array.from(this.dotsContainer.querySelectorAll('.carousel-dot'));
  }

  /**
   * Asigna todos los controladores de eventos (clicks, teclado, mouseover, gestos táctiles).
   */
  bindEvents() {
    // Evento: Botón Anterior
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prevSlide();
        this.resetAutoplayTimer(); // Reiniciar el temporizador tras interacción manual
      });
    }

    // Evento: Botón Siguiente
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.nextSlide();
        this.resetAutoplayTimer();
      });
    }

    // Evento: Clic en Puntos Indicadores (Delegación de eventos)
    if (this.dotsContainer) {
      this.dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.carousel-dot');
        if (dot) {
          const index = parseInt(dot.getAttribute('data-index'), 10);
          this.goToSlide(index);
          this.resetAutoplayTimer();
        }
      });
    }

    // Evento: Botón Reproducir / Pausar
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => {
        this.toggleAutoplay();
      });
    }

    // Evento: Pausar autoplay cuando el mouse se posiciona sobre el carrusel (Hover)
    this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.container.addEventListener('mouseleave', () => {
      if (this.isPlaying) this.startAutoplay();
    });

    // Evento: Navegación mediante teclado (Flecha Izquierda y Derecha)
    this.container.setAttribute('tabindex', '0'); // Permitir foco en el contenedor
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
        this.resetAutoplayTimer();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
        this.resetAutoplayTimer();
      }
    });

    // Eventos: Gestos Táctiles en Celulares y Tablets (Swipe Horizontal)
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }

  /**
   * Determina si el gesto de deslizamiento del usuario fue a la izquierda o derecha.
   */
  handleSwipe() {
    const swipeThreshold = 50; // Distancia mínima en píxeles para detectar el deslizamiento
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Deslizamiento hacia la izquierda -> Siguiente diapositiva
        this.nextSlide();
      } else {
        // Deslizamiento hacia la derecha -> Diapositiva anterior
        this.prevSlide();
      }
      this.resetAutoplayTimer();
    }
  }

  /**
   * Actualiza la posición visual, estilos activos, contador y atributos accesibles ARIA.
   */
  updateCarousel() {
    // 1. Mover la pista de diapositivas mediante transformación CSS (GPU acelerado)
    if (this.slidesTrack) {
      this.slidesTrack.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }

    // 2. Actualizar clases y atributos de visibilidad en cada diapositiva
    this.slides.forEach((slide, index) => {
      const isActive = index === this.currentIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', (!isActive).toString());
    });

    // 3. Actualizar puntos indicadores (Dots)
    if (this.dots) {
      this.dots.forEach((dot, index) => {
        const isActive = index === this.currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive.toString());
      });
    }

    // 4. Actualizar el indicador numérico de página (ej. "1 / 4")
    if (this.counterElement) {
      this.counterElement.textContent = `${this.currentIndex + 1} / ${this.totalSlides}`;
    }
  }

  /**
   * Avanza a la siguiente diapositiva. Si llega al final, regresa al inicio.
   */
  nextSlide() {
    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex++;
    } else if (this.options.loop) {
      this.currentIndex = 0; // Reiniciar al inicio si loop está activo
    }
    this.updateCarousel();
  }

  /**
   * Retrocede a la diapositiva anterior. Si está al inicio, salta a la última.
   */
  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.options.loop) {
      this.currentIndex = this.totalSlides - 1; // Ir al final
    }
    this.updateCarousel();
  }

  /**
   * Salta directamente a un índice específico de diapositiva.
   * @param {number} index - Índice numérico (0 a N-1).
   */
  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentIndex = index;
      this.updateCarousel();
    }
  }

  /**
   * Inicia el temporizador de reproducción automática.
   */
  startAutoplay() {
    this.pauseAutoplay(); // Limpiar cualquier temporizador activo previo
    this.autoplayTimer = setInterval(() => {
      this.nextSlide();
    }, this.options.autoplayInterval);

    this.updatePlayPauseUI(true);
  }

  /**
   * Detiene temporalmente la reproducción automática.
   */
  pauseAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
    this.updatePlayPauseUI(false);
  }

  /**
   * Alterna entre reproducir y pausar el carrusel.
   */
  toggleAutoplay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startAutoplay();
    } else {
      this.pauseAutoplay();
    }
  }

  /**
   * Reinicia el temporizador cuando el usuario realiza una acción manual.
   */
  resetAutoplayTimer() {
    if (this.isPlaying) {
      this.startAutoplay();
    }
  }

  /**
   * Actualiza el icono y texto del botón de reproducción / pausa.
   * @param {boolean} active - Estado de reproducción.
   */
  updatePlayPauseUI(active) {
    if (!this.playPauseBtn) return;
    const iconSpan = this.playPauseBtn.querySelector('.play-pause-icon');
    const textSpan = this.playPauseBtn.querySelector('.play-pause-text');

    if (active) {
      if (iconSpan) iconSpan.textContent = '⏸';
      if (textSpan) textSpan.textContent = 'Pausar';
      this.playPauseBtn.setAttribute('aria-label', 'Pausar reproducción automática');
    } else {
      if (iconSpan) iconSpan.textContent = '▶';
      if (textSpan) textSpan.textContent = 'Reproducir';
      this.playPauseBtn.setAttribute('aria-label', 'Iniciar reproducción automática');
    }
  }
}

// Exportar la clase globalmente para ser instanciada en main.js u otros scripts
window.BalletCarousel = BalletCarousel;
