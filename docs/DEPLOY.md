# Guía de publicación con GitHub Pages

El portafolio vive en la carpeta `docs/`. No hay build, servicios externos con claves privadas ni dependencias instaladas en tiempo de publicación. GSAP y ScrollTrigger se sirven como archivos estáticos desde `docs/vendor/`.

## 1. Verificar antes de publicar

- Revisa que `index.html`, `styles.css`, `script.js` y `vendor/` estén en `docs/`.
- Confirma que `vendor/gsap.min.js` y `vendor/ScrollTrigger.min.js` correspondan a GSAP 3.15.1.
- Confirma que no aparezcan datos de contacto privados, números de identidad ni datos personales de los certificados.
- Confirma que `certificados/` contenga únicamente archivos autorizados.
- Comprueba que las cinco certificaciones sigan mostrando solo curso, emisor y fecha, sin duraciones no verificadas.
- Comprueba que las ilustraciones de proyectos sigan etiquetadas como ilustraciones y no como capturas reales.

Comprobación rápida en la raíz del repositorio; se excluyen las guías y los archivos vendor para evitar falsos positivos de texto documental o minificado:

```bash
git grep -n -i -E "[[:digit:]]{9,}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}" -- docs/ \
  ':(exclude)docs/DEPLOY.md' ':(exclude)docs/README.md' ':(exclude)docs/vendor/*'
```

El comando no debe devolver resultados.

## 2. Comprobar la experiencia en local

Sirve la carpeta con `python -m http.server 8000` y revisa:

- Las seis secciones y sus anclas desde la navegación.
- El indicador de sección activa al desplazarse.
- El menú móvil: apertura, cierre por enlace, cierre con `Escape` y cierre al tocar fuera.
- El botón de tema y su persistencia al recargar.
- El botón de copiar enlace de GitHub; debe mostrar "Enlace copiado." en contexto seguro.
- Hero: la escultura rota, cambia de escala y se desplaza con el scroll; al volver arriba recupera su estado inicial.
- Transiciones entre Sobre mí, Tecnologías, Formación y Contacto sin saltos de layout.
- Galería de proyectos:
  - En 1440×900 y 1366×768, desplazamiento horizontal sincronizado con el scroll vertical.
  - Contador `01 / 05` → `05 / 05`, botones deshabilitados en los extremos.
  - `ArrowRight`, `ArrowLeft`, botón anterior y botón siguiente.
  - En 1024×768, 768×1024, 390×844 y 360×800, presentación vertical sin scroll horizontal accidental.
- Tema claro y oscuro en todas las resoluciones, sin desbordamiento horizontal.
- `prefers-reduced-motion`: no se crean ScrollTriggers, no hay parallax ni animaciones continuas y el contenido queda visible.
- Ausencia de errores de consola, errores de página, peticiones fallidas y recursos 404.
- Resoluciones validadas: 1440×900, 1366×768, 1024×768, 768×1024, 390×844 y 360×800.

La escultura usa CSS 3D, por lo que no depende de WebGL. Si el dispositivo no aplica transformaciones 3D, la composición permanece legible como figura estática.

### Capturas de verificación

Las capturas reales se generan fuera de `docs/` con Playwright/Chromium e incluyen: hero inicial, hero durante el scroll, Sobre mí, Tecnologías, galería en tres posiciones, Formación, Contacto, móvil y menú móvil. No se publican en el repositorio.

## 3. Habilitar Pages

1. Abre https://github.com/AndersonMoya23/AndersonMoya23.
2. Ve a **Settings → Pages**.
3. En **Build and deployment**:
   - **Source:** Deploy from a branch.
   - **Branch:** la rama que decidas publicar (por ejemplo, `main` una vez integrado el trabajo).
   - **Folder:** `/docs`.
4. Guarda los cambios.

No hace falta cambiar el directorio de publicación: sigue siendo `docs/`. Todos los recursos son relativos, incluidos `vendor/gsap.min.js` y `vendor/ScrollTrigger.min.js`, por lo que funcionan bajo la ruta `/AndersonMoya23/`.

## 4. Verificar el despliegue

- Espera a que la pestaña Pages muestre el estado publicado.
- Abre https://andersonmoya23.github.io/AndersonMoya23/.
- Repite la comprobación de navegación, tema, menú móvil, copiar enlace, hero, galería y reduced motion.
- Revisa que no haya errores en la consola ni recursos relativos rotos, especialmente `vendor/`.
- Verifica que los enlaces externos respondan: perfil de GitHub, repositorios, `roadmap-retos-programacion` y `retos-programacion-2023`.

## 5. Dominio propio (opcional)

No es necesario. Si se añade un dominio personalizado, configúralo desde **Settings → Pages → Custom domain** y verifica el registro DNS correspondiente.

## Notas

- No se deben modificar permisos ni ajustes de seguridad del repositorio para publicar el sitio.
- Los certificados originales no se suben sin aprobación; la carpeta `certificados/` puede permanecer vacía.
- La URL actual puede responder antes de este rediseño si Pages ya estaba habilitado desde `main`; publicar estos cambios requiere integrar primero la rama revisada.
- No se ha fusionado ni publicado automáticamente ningún cambio de esta rama.
