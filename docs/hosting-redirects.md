# `vercel.json` — por qué dice lo que dice

Astro decide **qué son** las páginas. Este archivo decide **qué contesta el host**
para URLs que ya no son páginas.

> ⚠️ `vercel.json` **no admite comentarios ni propiedades extra**. Un `//`, un
> `_comment` o cualquier clave fuera del esquema hace fallar el build entero con
> `should NOT have additional property`. Por eso el razonamiento vive acá y no
> dentro del JSON. Las claves permitidas están en
> <https://vercel.com/docs/project-configuration>.

## `trailingSlash: true`

`astro.config.mjs` tiene `trailingSlash: 'always'`, pero eso solo gobierna cómo
Astro **enlaza**. Vercel seguía contestando 200 en las dos formas:

```
200  https://www.jpmediagroups.com/contact     ← no debería existir
200  https://www.jpmediagroups.com/contact/
```

Cada página del sitio existía en dos URLs. La etiqueta canónica evitaba que
compitieran entre sí, pero Search Console igual tenía que resolver un duplicado
que nunca debió ver. Con esta línea, la forma sin barra hace 308 a la canónica.

Si alguna vez se invierte el criterio, hay que cambiar **tres** cosas a la vez o
el sitio se contradice: esta línea, `trailingSlash` en `astro.config.mjs` y
`SITE_URL` en `src/lib/seo.ts`. `npm run check:seo` falla si no coinciden.

## `redirects`

El sitio que esto reemplazó era WordPress con el tema Integro, y Google todavía
tiene sus URLs indexadas. Ver [`audit-wordpress.md`](./audit-wordpress.md) §8: el
menú tenía ~50 páginas demo del tema más WooCommerce (shop, cart, checkout,
wishlist).

Solo se redirige **lo que tiene equivalente real acá**. Las páginas demo y las de
WooCommerce se dejan deliberadamente en 404: nunca tuvieron contenido de este
estudio, y redirigir en masa URLs muertas a la portada Google lo lee como *soft
404*, que es peor que el 404 que venía a arreglar.

Un 404 en una página que no debería existir **es la respuesta correcta**. No hay
que "corregirlos" todos en Search Console; Google las saca del índice solo.

### Las dos formas de cada ruta

Cada `source` está listado con barra y sin barra a propósito. Con
`trailingSlash: true`, Vercel normaliza la URL **antes** de evaluar estas reglas,
así que una regla escrita solo como `/contacts` nunca dispararía para la petición
que Google realmente hace.

### `permanent: true`

Emite un 308, que Google trata exactamente igual que un 301.

## Lo que este archivo NO puede arreglar

`http://jpmediagroups.com/` → 308 → `https://jpmediagroups.com/` → 308 →
`https://www.jpmediagroups.com/`. Esa cadena es del nivel de dominio (Vercel →
Settings → Domains), no de este archivo, y **es el estado correcto**: el apex
debe apuntar al host canónico. Search Console va a reportar esas URLs como
"Página con redirección" para siempre, y eso no es un error — es lo que se pidió
que hiciera. Validar la corrección sobre URLs del apex falla siempre.

## Cómo agregar una redirección nueva

1. Confirmá que la URL vieja realmente está indexada (Search Console →
   Indexación de páginas → exportar).
2. Preguntate a qué página de este sitio corresponde **de verdad**. Si la
   respuesta es "a ninguna, pero mandémosla al home", no la agregues.
3. Agregá las dos formas, con barra y sin barra.
4. Redeploy: `vercel.json` no hace nada hasta que haya un deploy nuevo.
