# Portafolio de Anderson Moya

Sitio estático con HTML semántico, CSS y JavaScript vanilla. Usa GSAP 3.15.1 y ScrollTrigger 3.15.1 desde `vendor/`, sin CDN. No requiere build, claves de API ni servicios externos de ejecución.

## Vista previa local

Abre `index.html` en un navegador o sirve esta carpeta:

```bash
python -m http.server 8000
```

Luego visita http://localhost:8000. Usar un servidor local permite probar también el botón de copiar enlace.

## Diseño

- Identidad editorial oscura como experiencia principal, con tema claro opcional y persistente.
- Tipografía protagonista: `Instrument Serif`, `DM Sans` y `DM Mono`, con fuentes del sistema como fallback.
- Hero con escultura 3D construida en CSS 3D: sin WebGL y con fallback natural.
- Movimiento inmersivo con GSAP y ScrollTrigger servidos localmente; el parallax por cursor se reserva a puntero fino.
- `prefers-reduced-motion` desactiva el sistema inmersivo, también si se activa con la página abierta; si falta JavaScript o GSAP, el contenido permanece visible.
- Secciones: Inicio, Sobre mí, Tecnologías, Proyectos, Formación y Contacto.
- Proyectos presentados como casos de estudio: problema, solución, tecnologías y estado real.
- Navegación con indicador de sección activa, menú móvil accesible y cierre por enlace, Escape o clic exterior.
- Reveal progresivo al desplazarse, microinteracciones y estados claros de hover, focus y active.

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
- `script.js` — tema persistente, menú, navegación activa, reveal, sistema inmersivo GSAP/ScrollTrigger, galería y controles, parallax 3D, copiar enlace y año del footer.
- `vendor/` — copias locales de GSAP y ScrollTrigger 3.15.1.
- `certificados/` — carpeta reservada para documentos públicos aprobados.
- `DEPLOY.md` — guía de publicación y comprobación de privacidad.

## Certificados

La sección de certificaciones muestra solo nombres, emisores y fechas verificados en los documentos originales. Los archivos originales, las copias, los códigos QR, los enlaces de verificación y los datos personales **no** se publican sin aprobación explícita. Consulta `certificados/README.md`.

Las duraciones de los cuatro cursos de INDOTEL permanecen omitidas hasta que puedan verificarse documentalmente.

## Mantenimiento

- Los proyectos sin repositorio público no llevan enlace individual; se usa el enlace general a los repositorios.
- El correo personal y los datos de identidad no se publican en el sitio.
- Para añadir un certificado, usa solo información pública aprobada y actualiza la sección correspondiente en `index.html`.
- No se han añadido métricas, clientes, empresas ni años de experiencia sin verificar.
