document.addEventListener('DOMContentLoaded', () => {
  const $ = (s) => document.querySelector(s);

  // 0. Aviso amistoso de conexión inestable / servicios no disponibles
  const aviso = document.createElement('div');
  aviso.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:2000;max-width:90%;padding:.7rem 1.2rem;border-radius:10px;background:rgba(128,0,32,.95);color:#f5e9d0;font-size:.9rem;box-shadow:0 8px 24px rgba(0,0,0,.4);display:none;border:1px solid rgba(212,175,55,.5)';
  document.body.appendChild(aviso);
  const notificar = (msg) => { aviso.textContent = msg; aviso.style.display = 'block'; clearTimeout(aviso._t); aviso._t = setTimeout(() => aviso.style.display = 'none', 8000); };
  window.addEventListener('offline', () => notificar('Parece que no hay conexión a internet. Algunas funciones (como el clima o la tabla de eventos) pueden no estar disponibles.'));
  window.addEventListener('online', () => notificar('¡Conexión restablecida! Recargando datos…') );
  window.addEventListener('online', () => setTimeout(() => location.reload(), 1500));
  const libsFaltantes = ['anime', 'gsap', 'Chart', 'axios', 'L', '_', 'dayjs', 'AOS'].filter((k) => !window[k]);
  if (libsFaltantes.length) notificar('Algunas librerías no pudieron cargarse (¿sin internet?). La página seguirá funcionando de forma básica.');

  // 1. Tema claro/oscuro con persistencia
  const html = document.documentElement;
  const themeBtn = $('#theme-toggle');
  const applyTheme = (t) => {
    if (t === 'light') html.setAttribute('data-theme', 'light');
    else html.removeAttribute('data-theme');
    localStorage.setItem('ballet_theme', t);
  };
  applyTheme(localStorage.getItem('ballet_theme') || 'dark');
  themeBtn && themeBtn.addEventListener('click', () =>
    applyTheme(html.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));

  // 2. Carrusel (modulo de web04)
  if ($('#ballet-carousel') && window.BalletCarousel) {
    window.mainCarousel = new window.BalletCarousel('#ballet-carousel', { autoplayInterval: 4500, loop: true });
  }

  // 2b. Popover aviso de audiciones (propio, sin depender de Flowbite/Tailwind)
  const btnAviso = $('#btn-popover-aviso');
  const popoverAviso = $('#popover-aviso');
  if (btnAviso && popoverAviso) {
    btnAviso.addEventListener('click', () => popoverAviso.classList.toggle('show'));
  }

  // 2c. Menú responsive (hamburguesa)
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav[aria-label="Navegación principal del sitio"]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => { nav.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false'); }));
  }

  // 3. Anime.js: intro del hero
  if (window.anime) {
    anime({ targets: '.hero-title', translateY: [40, 0], opacity: [0, 1], duration: 1200, easing: 'easeOutExpo' });
    anime({ targets: '.hero-subtitle', translateY: [30, 0], opacity: [0, 1], duration: 1200, delay: 300, easing: 'easeOutExpo' });
    anime({ targets: '.hero-actions .btn-hero-primary, .hero-actions .btn-hero-secondary', scale: [.8, 1], opacity: [0, 1], delay: anime.stagger(150, { start: 600 }), easing: 'easeOutBack' });
  }

  // 4. AOS: animaciones al hacer scroll
  window.AOS && AOS.init({ duration: 800, once: true });

  // 5. GSAP: contadores de estadisticas
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target = parseInt(el.textContent, 10) || 0;
    const hasPlus = el.textContent.includes('+');
    if (window.gsap) {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 2, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v) + (hasPlus ? '+' : ''); }
      });
    }
  });

  // 6. Day.js: cuenta regresiva a Audiciones 2026
  const cd = $('#countdown');
  if (window.dayjs && window.dayjs_plugin_relativeTime) {
  dayjs.extend(dayjs_plugin_relativeTime);
  dayjs.locale('es');
  const objetivo = dayjs('2026-10-20T09:00:00');
  setInterval(() => {
    const diff = objetivo.diff(dayjs(), 'second');
    if (diff <= 0) { cd && (cd.innerHTML = '<strong>¡Las audiciones han comenzado!</strong>'); return; }
    const d = Math.floor(diff / 86400), h = Math.floor(diff % 86400 / 3600), m = Math.floor(diff % 3600 / 60), s = diff % 60;
    cd && (cd.innerHTML =
      `<span>${d}<small>dias</small></span><span>${h}<small>horas</small></span><span>${m}<small>min</small></span><span>${s}<small>seg</small></span>`);
  }, 1000);
  } else { cd && (cd.textContent = 'Cuenta regresiva no disponible sin conexión.'); }

  // 7. Chart.js: asistencia por obra
  const ctx = $('#grafico-asistencia');
  if (ctx && window.Chart) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['El Lago de los Cisnes', 'Ecos del Silencio', 'Suite de Cuecas', 'Caporales', 'Soles de Primavera'],
        datasets: [{ label: 'Espectadores', data: [850, 420, 610, 1200, 980], backgroundColor: 'rgba(128,0,32,.75)', borderColor: '#D4AF37', borderWidth: 1 }]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#e8e6df' } } }, scales: { x: { ticks: { color: '#ccc' } }, y: { ticks: { color: '#ccc' } } } }
    });
  }

  // 8. Axios: tabla de eventos (API local) + clima (API publica Open-Meteo, La Paz)
  if (!window.axios) notificar('No se pudo cargar la librería de datos. Los widgets de eventos y clima estarán vacíos.');
  if (window.axios) {
    axios.get('assets/eventos.json').then(({ data }) => {
      const jq = window.jQuery;
      const init = () => {
        if (jq && jq.fn.DataTable) {
          jq('#tabla-eventos').DataTable({
            data,
            columns: [
              { data: 'obra', title: 'Obra' },
              { data: 'fecha', title: 'Fecha' },
              { data: 'lugar', title: 'Lugar' },
              { data: 'estado', title: 'Estado' },
              { data: 'asistencia', title: 'Asistencia' }
            ],
            language: {
              url: 'https://cdn.datatables.net/plug-ins/2.0.8/i18n/es-ES.json'
            }
          });
        } else {
          setTimeout(init, 50); // espera a que DataTables cargue
        }
      };

      init();
    }).catch(() => {
      const t = document.querySelector('#tabla-eventos');
      if (t) t.outerHTML = '<p style="color:#e0b0b0">No pudimos cargar los eventos. Revisa tu conexión e inténtalo más tarde.</p>';
      notificar('No se pudo cargar la tabla de eventos. ¿Tienes conexión a internet?');
    });

    axios.get('https://api.open-meteo.com/v1/forecast?latitude=-16.5&longitude=-68.15&current=temperature_2m,wind_speed_10m')
      .then(({ data }) => {
        const c = data.current;
        $('#clima') && ($('#clima').innerHTML =
          `<strong>La Paz, Bolivia</strong><br><span class="temp">${c.temperature_2m} °C</span> · Viento ${c.wind_speed_10m} km/h<br><em>${window.dayjs ? dayjs().format('dddd D [de] MMMM YYYY') : new Date().toLocaleDateString('es-BO')}</em>`);
      })
      .catch(() => { $('#clima') && ($('#clima').innerHTML = 'No pudimos obtener el clima. Revisa tu conexión e inténtalo más tarde.'); });
  }

  // 9. Leaflet: mapa de ubicacion
  if (window.L && $('#mapa')) {
    const map = L.map('mapa').setView([-16.5226665, -68.1115232], 15);

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap'
    }).addTo(map);

    L.marker([-16.5226665, -68.1115232])
      .addTo(map)
      .bindPopup('Campus San Pablo, UCB — Salón de Danza')
      .openPopup();
  }


  // 10. Lodash: buscador con debounce sobre repertorio
  const buscador = $('#buscador-repertorio');
  if (buscador && window._) {
    buscador.addEventListener('input', _.debounce((e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#repertorio-destacado .card').forEach((c) => {
        c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    }, 350));
  }

  // 11. Validator.js + EmailJS: formulario de registro con envio de correo
  const form = document.getElementById('form-registro');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      let ok = true;

      // limpiar errores
      form.querySelectorAll('.error').forEach((n) => n.remove());

      const err = (input, msg) => {
        ok = false;
        input.insertAdjacentHTML('afterend', `<div class="error">${msg}</div>`);
      };

      // Validaciones
      if (!(window.validator ? validator.isLength(nombre, { min: 3 }) : nombre.length >= 3)) err(form.nombre, 'Nombre demasiado corto.');
      if (!(window.validator ? validator.isEmail(email) : /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) err(form.email, 'Correo inválido.');
      if (!document.getElementById('acepta').checked)
        err(document.getElementById('acepta'), 'Debes aceptar el reglamento.');

      if (!ok) return;

      const msg = document.getElementById('registro-msg');

      // Envío EmailJS
      if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'TU_PUBLIC_KEY') {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: nombre,
          reply_to: email,
          obra: form.obra.value
        }).then(
          () => msg.textContent = '¡Registro enviado! Revisa tu correo.',
          () => msg.textContent = 'Error al enviar. Intenta más tarde.'
        );
      } else {
        msg.textContent = 'Registro validado. (Configura EmailJS para enviar el correo real.)';
      }
    });
  }
});
