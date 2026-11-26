# Portafolio de Anderson Moya

Sitio estático con HTML semántico, CSS y JavaScript vanilla. Usa GSAP 3.15.1 y ScrollTrigger 3.15.1 desde `vendor/`, sin CDN. No requiere build, claves de API ni servicios externos de ejecución.

## Vista previa local

Abre `index.html` en un navegador o sirve esta carpeta:

```bash
python -m http.server 8000
```

Luego visita http://localhost:8000. Usar un servidor local permite probar también el botón de copiar enlace.

## Dirección visual B.12

- Paleta definida: negro profundo `#080a08`, blanco cálido `#f4f2e9`, grises sofisticados y acento verde ácido `#b9ff3d`. El tema claro invierte la base a `#f2f0e8` y usa `#3f5f00` como acento. Sin glow, neon excesivo, glassmorphism ni degradados decorativos.
- Tipografía editorial con tres registros: `Instrument Serif` para titulares esculturales, `DM Sans` para texto y `DM Mono` para datos, índices y etiquetas. Escalas fluidas y composiciones asimétricas en lugar de tarjetas repetidas.
- Hero de nombre protagonista con `position: sticky` natural y una única timeline `scrubbed`: la cámara, los glifos, el artefacto 3D, el suelo en perspectiva, el campo tipográfico y los módulos se recomponen juntos con el scroll. No hay `pin` ni secuestro de rueda.
- `.hero-handoff` es el último fotograma del hero y el primero de Sobre mí. Sobre mí se solapa con la escena anterior y se ensambla mientras entra, en vez de aparecer como un bloque independiente.
- Sobre mí como extensión editorial: titular a gran escala, lead en serif, dos párrafos distribuidos y datos secundarios en un plano posterior.
- Tecnologías como un sistema que se asienta durante todo el tramo: regla de medida, plano `STACK` de fondo, tarjetas con desplazamiento en X/Y/Z y rotación, y panel sticky animado. Hover y foco elevan cada tarjeta sin ocultar contenido.
- Proyectos como seis casos de estudio verticales, sin carrusel forzado: artefactos CSS originales (circuito, monitor, LCD, código y álbum) etiquetados como ilustraciones, nunca como capturas reales. Rail de progreso y enlaces a repositorios públicos verificados.
- Formación con línea y nodo progresivos; contacto como cierre narrativo con aperture, enlaces de gran formato y eco tipográfico.
- Movimiento con GSAP y ScrollTrigger locales. `perspective`, `perspective-origin`, `preserve-3d`, `translateZ`, `rotateX/Y/Z` y escala se combinan en todos los sistemas; no se usa WebGL ni Three.js. La rotación continua del artefacto la dirige el scroll, no un bucle CSS infinito.
- Las animaciones de entrada usan `play none none reverse`: el contenido permanece visible al saltar de sección o al pasar de largo, y solo se oculta al retroceder por encima del inicio del trigger.
- `prefers-reduced-motion` desactiva el sistema inmersivo y las transformaciones; si falta JavaScript o GSAP, el contenido sigue visible. Navegación con indicador activo, menú móvil accesible, foco visible y contraste AA en ambos temas.

## Verificación B.12

El informe está en `verificacion-b12/informe.md`, con `report.json` (34 comprobaciones superadas), `scroll-summary.json` y 37 capturas reales de Chromium en `1440x900`, `1024x768`, `768x1024`, `390x844` y `360x740`. El recorrido completo se midió ida y vuelta en 33 posiciones: el cambio mínimo entre fotogramas consecutivos fue 6,4 % y no hubo ningún tramo por debajo del 5 %. Incluye temas claro/oscuro, Reduced Motion, menú móvil con teclado/Escape, navegación de casos, ausencia de JavaScript, overflow, consola, recursos y 60 fps con rasterización GPU. La revisión estética final de las capturas sigue pendiente de una persona.

## Publicación

La guía completa está en [DEPLOY.md](DEPLOY.md). Resumen:

1. Entra a **Settings → Pages** del repositorio.
2. En **Build and deployment**, elige **Deploy from a branch**.
3. Selecciona la rama aprobada y la carpeta `/docs`.
4. Guarda y espera a que GitHub Pages termine el despliegue.

La dirección esperada es https://andersonmoya23.github.io/AndersonMoya23/.

## Estructura

- `index.html` — contenido, metadatos SEO/OG y secciones del portafolio.
- `styles.css` — sistema visual, tema claro/oscuro, CSS 3D y diseño responsive.
- `script.js` — tema persistente, menú, navegación activa, reveal, cámara 3D narrativa GSAP/ScrollTrigger, secuencia vertical de casos, parallax, copiar enlace y año del footer.
- `vendor/` — copias locales de GSAP y ScrollTrigger 3.15.1.
- `certificados/` — carpeta reservada para documentos públicos aprobados.
- `DEPLOY.md` — guía de publicación y comprobación de privacidad.
- `verificacion-b11/` — evidencia de la iteración anterior (insuficiente para B.12).
- `verificacion-b12/` — informe, capturas reales de Chromium por resolución/tema/movimiento, `report.json` y `scroll-summary.json`.

## Certificados

La sección de certificaciones muestra solo nombres, emisores y fechas verificados en los documentos originales. Los archivos originales, las copias, los códigos QR, los enlaces de verificación y los datos personales **no** se publican sin aprobación explícita. Consulta `certificados/README.md`.

Las duraciones de los cuatro cursos de INDOTEL permanecen omitidas hasta que puedan verificarse documentalmente.

## Mantenimiento

- Los proyectos sin repositorio público no llevan enlace individual; se usa el enlace general a los repositorios.
- El correo personal y los datos de identidad no se publican en el sitio.
- Para añadir un certificado, usa solo información pública aprobada y actualiza la sección correspondiente en `index.html`.
- No se han añadido métricas, clientes, empresas ni años de experiencia sin verificar.
