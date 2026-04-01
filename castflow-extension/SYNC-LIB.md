# Sincronización de la librería CastFlow en la extensión

## Contexto

La extensión Chrome incluye una **copia local** de `castflow.js` y `castflow.css` en la carpeta `lib/`. Esta copia se inyecta en las páginas web mediante `chrome.scripting.executeScript` con `world: 'MAIN'`.

La librería principal (`../castflow/castflow.js`) usa un **wrapper UMD** estándar que detecta AMD (`define.amd`), CommonJS (`module.exports`) o global (`window`). Esto es correcto para uso general, pero **causa problemas en la extensión**: páginas como Azure Portal cargan RequireJS, y el wrapper UMD registra CastFlow como módulo AMD en vez de asignarlo a `window.CastFlow`. El resultado es un `ReferenceError: CastFlow is not defined` al intentar iniciar el tour.

## Solución

La copia dentro de `lib/` usa un wrapper simplificado que **siempre** asigna al global:

```js
// Wrapper original (UMD completo — en ../castflow/castflow.js):
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);            // ← problema en páginas con RequireJS
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CastFlow = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

// Wrapper parcheado (solo global — en lib/castflow.js):
(function (root, factory) {
  root.CastFlow = factory();        // ← siempre disponible como window.CastFlow
}(typeof self !== 'undefined' ? self : this, function () {
```

## Cómo sincronizar

Cada vez que se actualice la librería principal, hay que copiar los archivos y re-aplicar el parche. El script `sync-lib.ps1` automatiza ambos pasos.

### Uso

```powershell
cd castflow-extension
.\sync-lib.ps1
```

### Qué hace el script

1. **Copia** `castflow.js` y `castflow.css` desde `../castflow/` a `./lib/`.
2. **Busca** el wrapper UMD estándar en el JS copiado.
3. **Reemplaza** el wrapper por la versión de solo-global.
4. **Informa** del resultado:
   - `✓ Copied and patched castflow.js` — copia exitosa con parche aplicado.
   - `✓ Copied castflow.js (already patched or UMD not found)` — el wrapper UMD no se encontró (ya estaba parcheado o el código fuente cambió).
   - `✓ Copied castflow.css` — CSS copiado (no necesita parches).

### Cuándo ejecutarlo

- Después de cualquier cambio en `../castflow/castflow.js` o `../castflow/castflow.css`.
- Antes de empaquetar o distribuir la extensión.

## Importante

- **No editar manualmente** `lib/castflow.js` ni `lib/castflow.css`. Cualquier cambio se perderá en la siguiente sincronización.
- **No hacer `Copy-Item` directo** sin ejecutar el script; se perdería el parche UMD.
- Si el wrapper UMD de la librería principal cambia de formato, hay que actualizar la variable `$umd` en `sync-lib.ps1` para que coincida con el nuevo texto.

## Estructura de archivos

```
castflow/                      ← Librería principal (fuente)
  castflow.js                  ← UMD completo (AMD + CJS + global)
  castflow.css

castflow-extension/            ← Extensión Chrome
  lib/
    castflow.js                ← Copia parcheada (solo global)
    castflow.css               ← Copia directa (sin cambios)
  sync-lib.ps1                 ← Script de sincronización + parche
  SYNC-LIB.md                 ← Este documento
  background.js
  manifest.json
  ...
```

## Por qué no parchear la librería principal

El wrapper UMD de `castflow.js` es el estándar correcto para una librería distribuible:

- Permite `<script src="castflow.js">` → `window.CastFlow`
- Permite `require('castflow')` en Node/bundlers
- Permite `define(['castflow'], ...)` con RequireJS intencionalmente

El parche solo es necesario en el contexto de inyección de la extensión, donde no controlamos qué module loaders tiene la página destino y necesitamos que `window.CastFlow` exista siempre.
