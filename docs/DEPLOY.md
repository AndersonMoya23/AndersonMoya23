# Guía de publicación con GitHub Pages

El portafolio vive en la carpeta `docs/`. No hay dependencias, build ni servicios externos con claves privadas.

## 1. Verificar antes de publicar

- Revisa que `index.html`, `styles.css` y `script.js` estén en `docs/`.
- Confirma que no aparezcan datos de contacto privados, números de identidad ni datos personales de los certificados.
- Confirma que `certificados/` contenga únicamente archivos autorizados.
- Comprueba que las cinco certificaciones sigan mostrando solo curso, emisor y fecha, sin duraciones no verificadas.

Comprobación rápida en la raíz del repositorio; la guía se excluye para que sus propios patrones no generen falsos positivos:

```bash
git grep -n -i -E "[[:digit:]]{9,}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}" -- docs/ ':(exclude)docs/DEPLOY.md'
```

El comando no debe devolver resultados.

## 2. Comprobar la experiencia en local

Sirve la carpeta con `python -m http.server 8000` y revisa:

- Las seis secciones y sus anclas desde la navegación.
- El indicador de sección activa al desplazarse.
- El menú móvil: apertura, cierre por enlace, cierre con `Escape` y cierre al tocar fuera.
- El botón de tema y su persistencia al recargar.
- El botón de copiar enlace de GitHub.
- El hero 3D: movimiento sutil con cursor, retorno a la posición inicial al salir y sin bloqueo de la navegación.
- `prefers-reduced-motion`: el movimiento continuo y el parallax deben desactivarse.
- Resoluciones de escritorio, portátil, tablet y móvil.
- Consola del navegador sin errores.

La escultura usa CSS 3D, por lo que no depende de WebGL. Si el dispositivo no aplica transformaciones 3D, la composición permanece legible como figura estática.

## 3. Habilitar Pages

1. Abre https://github.com/AndersonMoya23/AndersonMoya23.
2. Ve a **Settings → Pages**.
3. En **Build and deployment**:
   - **Source:** Deploy from a branch.
   - **Branch:** la rama que decidas publicar (por ejemplo, `main` una vez integrado el trabajo).
   - **Folder:** `/docs`.
4. Guarda los cambios.

## 4. Verificar el despliegue

- Espera a que la pestaña Pages muestre el estado publicado.
- Abre https://andersonmoya23.github.io/AndersonMoya23/.
- Repite la comprobación de navegación, tema, menú móvil, copiar enlace y hero 3D.
- Revisa que no haya errores en la consola ni recursos relativos rotos.

## 5. Dominio propio (opcional)

No es necesario. Si se añade un dominio personalizado, configúralo desde **Settings → Pages → Custom domain** y verifica el registro DNS correspondiente.

## Notas

- No se deben modificar permisos ni ajustes de seguridad del repositorio para publicar el sitio.
- Los certificados originales no se suben sin aprobación; la carpeta `certificados/` puede permanecer vacía.
- La URL actual puede responder antes de este rediseño si Pages ya estaba habilitado desde `main`; publicar estos cambios requiere integrar primero la rama revisada.
