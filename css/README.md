# Arquitectura de Hojas de Estilo CSS3 - Ballet UCB

Este directorio almacena la arquitectura **CSS3 modular y adaptable** desarrollada para la Landing Page Definitiva y las páginas del **Ballet de la Universidad Católica Boliviana "San Pablo"**.

---

## 📂 Archivos y Módulos Implementados

| Archivo | Descripción / Responsabilidad Técnica |
| :--- | :--- |
| **`variables.css`** | **Tokens de diseño**: Custom Properties (`:root` y `[data-theme="light"]`) con los colores borgoña (`#800020`), oro (`#D4AF37`), rosa zapatillas, tipografías (*Cinzel* y *Plus Jakarta Sans*), sombras y tiempos de transición. |
| **`base.css`** | **Reset & Tipografía Global**: Resets modernos, `box-sizing`, scrollbars personalizados y estilizado de etiquetas semánticas (`<mark>`, `<abbr>`, `<blockquote>`, `<cite>`, `<time>`). |
| **`layout.css`** | **Estructura Responsiva**: Cabecera fija (`position: sticky`, `backdrop-filter`), menú de navegación con estado activo (`aria-current="page"`), maquetación **CSS Grid** y `@media queries`. |
| **`components.css`** | **Componentes Nativos y Landing Page**: <br> • **Hero Banner**: Imagen de fondo dramática con gradiente de superposición y botones CTA animados.<br> • **Carrusel de Imágenes JS**: Pista deslizante GPU acelerada (`transform: translateX`), botones flotantes de cristal (*glassmorphism*), puntos indicadores, contador numérico y badge de etiquetas.<br> • **Banner de Estadísticas**: Grid de métricas institucionales.<br> • **Banner CTA Audiciones**: Cinta con gradiente radial y llamado a la acción.<br> • **Tablas, Forms & Modales**: Estilos para `<dialog>`, `<progress>`, `<meter>`, `<details>` y formularios. |
| **`animations.css`** | **Keyframes & Micro-interacciones**: Animaciones `@keyframes` (`fadeIn`, `modalPop`, `pulseGlow`, `goldShimmer`) para transiciones fluidas. |
| **`styles.css`** | **Punto de Entrada Unificado**: Importación de todos los módulos vía `@import`. |

---

## 🎨 Paleta de Colores Teatral

- `--color-primary`: `#800020` (Borgoña / Crimson)
- `--color-gold`: `#D4AF37` (Oro de Telón)
- `--color-rose`: `#E6B8C8` (Rosa Zapatillas)
- `--bg-body`: `#0A0D14` (Modo Oscuro) / `#F8FAFC` (Modo Claro)
- `--font-title`: `'Cinzel', serif`
- `--font-body`: `'Plus Jakarta Sans', sans-serif`
