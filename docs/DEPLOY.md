# Guía de publicación con GitHub Pages

El portafolio vive en la carpeta `docs/`. No hay dependencias ni pasos de compilación.

## 1. Verificar antes de publicar

- Revisa que `index.html`, `styles.css` y `script.js` estén en `docs/`.
- Confirma que no aparezcan el correo personal, la cédula ni datos privados.
- Confirma que `certificados/` contenga únicamente archivos autorizados.

Comprobación rápida en la raíz del repositorio:

```bash
git grep -n -i -E "[[:digit:]]{9,}|@[a-z]+\.(com|net|org)|c[oé]dula|verificaci[oó]n" -- docs/
```

El comando no debe devolver resultados.

## 2. Habilitar Pages

1. Abre https://github.com/AndersonMoya23/AndersonMoya23.
2. Ve a **Settings → Pages**.
3. En **Build and deployment**:
   - **Source:** Deploy from a branch.
   - **Branch:** la rama que decidas publicar (por ejemplo, `main` una vez integrado el trabajo).
   - **Folder:** `/docs`.
4. Guarda los cambios.

## 3. Verificar el despliegue

- Espera a que la pestaña Pages muestre el estado publicado.
- Abre https://andersonmoya23.github.io/AndersonMoya23/.
- Comprueba el tema claro/oscuro, el menú en móvil y los anclas de navegación.

## 4. Dominio propio (opcional)

No es necesario. Si se añade un dominio personalizado, configúralo desde **Settings → Pages → Custom domain** y verifica el registro DNS correspondiente.

## Notas

- No se deben modificar permisos ni ajustes de seguridad del repositorio para publicar el sitio.
- Los certificados originales no se suben sin aprobación; la carpeta `certificados/` puede permanecer vacía.
