# Portafolio de Anderson Moya

Sitio estático con HTML semántico, CSS y JavaScript sin dependencias. No requiere build ni instalación.

## Vista previa local

Abre `index.html` en un navegador o sirve esta carpeta:

```bash
python -m http.server 8000
```

Luego visita http://localhost:8000.

## Publicación

La guía completa está en [DEPLOY.md](DEPLOY.md). Resumen:

1. Entra a **Settings → Pages** del repositorio.
2. En **Build and deployment**, elige **Deploy from a branch**.
3. Selecciona la rama aprobada y la carpeta `/docs`.
4. Guarda y espera a que GitHub Pages termine el despliegue.

La dirección esperada es https://andersonmoya23.github.io/AndersonMoya23/.

## Estructura

- `index.html` — contenido y secciones del portafolio.
- `styles.css` — tema claro/oscuro y diseño responsive.
- `script.js` — cambio de tema, menú móvil y año del footer.
- `certificados/` — carpeta reservada para documentos públicos aprobados.
- `DEPLOY.md` — guía de publicación.

## Certificados

La sección de certificaciones muestra solo nombres, emisores y fechas verificados en los PDF originales. Los archivos originales, las copias y los enlaces de verificación **no** se publican sin aprobación explícita. Consulta `certificados/README.md`.

## Mantenimiento

- Los proyectos sin repositorio público no llevan enlace individual; se usa el enlace general a los repositorios.
- El correo personal no se publica en el sitio.
- Para añadir un certificado, coloca el PDF aprobado en `certificados/` y actualiza la sección correspondiente en `index.html`.
