# Web09 - Landing Page del Ballet UCB (Portal Animado)

Landing page para el Ballet de la Universidad Católica Boliviana, modelada en los contenidos de `web04` y con las librerías vistas en `web08`.

## Estructura
```
web09/
├── index.html        # Landing completa
├── css/              # Estilos heredados de web04 + landing.css
├── js/
│   ├── carousel.js   # Carrusel JS vanilla (web04)
│   └── main.js       # Lógica: tema, AOS, Anime.js, GSAP, Day.js, Chart.js, Axios, Leaflet, DataTables, Lodash, Validator.js, EmailJS
└── assets/           # Imágenes, audio, video (web04) + eventos.json
```

## Librerías de web08 empleadas
Anime.js (intro hero), AOS (scroll), GSAP (contadores), Day.js (countdown y fechas), Chart.js (asistencia), Axios (eventos.json + API Open-Meteo), DataTables (tabla de funciones), Leaflet (mapa), Lodash (buscador con debounce), Flowbite (popover), Validator.js (formulario), EmailJS (envío de correo).

## Correo con EmailJS
Edita las constantes `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID` y `EMAILJS_TEMPLATE_ID` en `index.html` con tus credenciales de https://www.emailjs.com/.

## Uso
Abre `index.html` o sirve con `python -m http.server 8000` dentro de `web09`.
