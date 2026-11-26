# Verificación B.12 — reconstrucción del recorrido visual

**Rama:** `portfolio/b11-visual-rebuild` · **PR:** #7 (abierto, sin fusionar) · **Fecha:** 2026-11-26
**Base analizada:** `431d783` + cambios de trabajo B.12 · **Publicación:** no publicado en GitHub Pages.

## Qué se reconstruyó

B.12 no es un cambio de colores ni una capa de animaciones de entrada. Se modificó la estructura del recorrido:

- Se eliminó el `pin` del hero. Ahora usa `position: sticky` natural y una timeline `scrubbed` que mueve cámara, tipografía, artefacto, plano de suelo, campo tipográfico y módulos como un solo sistema.
- Se añadió `.hero-handoff` como último fotograma del hero y primer fotograma de Sobre mí. El panel entra desde fuera del viewport y desaparece cuando la escena siguiente toma el relevo. Ya no queda un panel fijo y vacío en el centro del recorrido.
- `#sobre-mi` se solapa con el hero (`margin-top: -56vh`) y su escena se compone con el scroll, en lugar de aparecer como un bloque nuevo más abajo.
- Tecnologías pasó de revelarse pronto a ensamblarse durante todo el tramo: regla de medida, plano de fondo, tarjetas con desplazamiento en X/Y/Z y rotación, con el panel sticky también animado.
- Proyectos dejó de ser una galería horizontal forzada. Ahora son seis casos verticales con arte original y un rail de progreso. El caso `instante` enlaza a su repositorio público verificado.
- Formación y Contacto conservan su línea de tiempo y su cierre, con el mismo criterio de movimiento continuo.
- Se eliminó la órbita CSS infinita del artefacto: duplicaba la rotación que ya dirige el scroll y encarecía cada frame. La rotación 3D restante depende solo del desplazamiento.

## Medición del scroll real

Se capturó Chromium a `1440x900` en 33 posiciones desde `y=0` hasta `y=9577`, con Paso de 300 px, primero hacia adelante y después hacia atrás. Se compararon fotogramas consecutivos redimensionados a 360x225 y se contaron píxeles con diferencia mayor a 12 por canal. Los estados del DOM (posiciones, opacidades y transformaciones) están en el directorio temporal de diagnóstico; el resumen agregado se guarda en `scroll-summary.json`.

| Dirección | Transiciones | Cambio mínimo | Cambio medio | Cambio máximo | Tramos < 5 % |
| --- | --- | --- | --- | --- | --- |
| Ida | 32 | 6,4 % | 13,14 % | 20,8 % | 0 |
| Vuelta | 32 | 6,4 % | 13,55 % | 20,8 % | 0 |

**Reversibilidad:** comparando ida y vuelta en la misma posición de scroll, la diferencia media es 0,66 % de píxeles (máximo 11,2 % en los puntos donde la inercia de `scrub: 1` aún se asentaba). Ningún tramo queda congelado en ambas direcciones.

**Errores de página durante el recorrido:** 0.

Dos hallazgos reales corregidos durante esta medición:

1. `y=1200 → y=1500` tenía un 0,1 % de cambio: el relevo ya se había detenido y Sobre mí todavía no entraba. Se amplió la duración del `.hero-handoff` de 0,35 a 0,63 de la timeline para que siga moviéndose hasta el final del tramo sticky. Pasó a 7,2 %.
2. `y=3600 → y=3900` tenía un 4,4 % de cambio: el panel sticky de Tecnologías mantenía el contenido casi inmóvil. Se le dio movimiento propio (`y` y rotación) sincronizado con el resto de la escena. Pasó a 9,2 %.

## Suite de verificación

`report.json` contiene 34 comprobaciones, todas superadas, y 37 capturas reales de Chromium.

| Ámbito | Resultado |
| --- | --- |
| Estructura | Seis secciones (`inicio`, `sobre-mi`, `tecnologias`, `proyectos`, `formacion`, `contacto`) y seis casos de estudio. |
| Contenido | Nombre protagonista legible como «Anderson Moya.»; 7 enlaces con `href` real, incluidos `instante` y los repositorios de ejercicios. |
| Scroll | `wheel` no se intercepta (`defaultPrevented=false`); sin tramos por debajo del 5 % de cambio. |
| Rendimiento | 60 fps, 0 frames largos en un recorrido de 2,2 s con rasterización GPU activada. Sin esas flags, el renderizador headless por software da 22–31 fps; es una limitación del entorno de prueba, no del sitio. |
| Consola y recursos | 0 errores de página y 0 fallos de recursos locales en todos los escenarios. |
| Temas | Tema oscuro y claro aplicados, sin overflow horizontal en `1440x900`. |
| Responsive | Sin overflow horizontal y seis casos en flujo vertical en `1024x768`, `768x1024`, `390x844` y `360x740`. |
| Reduced Motion | Sistema inmersivo desactivado, los cinco bloques `.reveal` visibles, handoff oculto y enlaces de contacto utilizables. |
| Teclado | Primer foco en el skip link; las flechas avanzan entre casos (03/06 → 04/06, caso destino a 59 px del borde superior); el menú móvil abre y Escape lo cierra. |
| Sin JS | Hero y Sobre mí permanecen visibles. |

## Capturas

Las capturas están en esta misma carpeta:

- `b12-1440-dark-01-hero.png` … `b12-1440-dark-10-contact.png`: recorrido completo en escritorio, incluidos los cuatro estados del hero y el handoff.
- `b12-1440-light-*.png`: hero, Sobre mí, proyecto y contacto en tema claro.
- `b12-tablet-1024-*.png`, `b12-tablet-768-*.png`, `b12-mobile-390-*.png`, `b12-mobile-360-*.png`: hero, Sobre mí, Tecnologías, proyecto y contacto por breakpoints.
- `b12-1440-reduced-*.png`: estado sin movimiento.
- `b12-1440-nojs-hero.png`: estado sin JavaScript.

## Límite de esta verificación

Las comprobaciones anteriores son objetivas (DOM, métricas de píxel, consola, recursos, teclado y fps), pero **esta sesión no puede visualizar las imágenes**. La confirmación estética final —que el resultado se perciba como un portafolio profesional y no como una sucesión de efectos— sigue requiriendo revisión humana de las capturas y del recorrido en un navegador real. No se debe dar el trabajo por terminado sin esa revisión.

## Estado y pendientes

- [x] Scroll continuo, reversible y perceptible en ida y vuelta.
- [x] Transición hero → Sobre mí sin tramo congelado.
- [x] Casos de estudio verticales con arte original y enlaces públicos verificados.
- [x] Responsive, ambos temas, Reduced Motion, teclado, consola, recursos y rendimiento.
- [ ] Revisión humana de las capturas y del recorrido.
- [ ] Actualizar el PR #7 con el commit de B.12.
- [ ] **No fusionar ni publicar** sin aprobación explícita.
