# 15 años / Quinceañera

Soltá aquí las fotos y ya está — la página [`/work/15th-birthday/`](../../../pages/work/%5Bcategory%5D/index.astro)
las recoge sola. No hay lista que actualizar ni import que escribir.

```
src/assets/work/15th-birthday/01.jpg
src/assets/work/15th-birthday/02.jpg
…
```

- **El orden es el del nombre**, así que numeralas `01`, `02`, `03`… El sort es
  numérico, o sea que `2.jpg` va antes que `10.jpg`, pero el cero delante deja
  la carpeta legible.
- **La primera foto es la portada** de la categoría en `/work/` y en la home.
  Si querés una en concreto, nombrala `00.jpg` y corré
  `npm run work:order 15th-birthday -- --apply`.
- Sirven `.jpg` `.jpeg` `.png` `.webp` `.avif`. **No** `.jfif`.
- **No las comprimas ni las achiques.** Astro genera el WebP/AVIF y todos los
  tamaños responsive en el build: dale el original más grande que tengas.

Mientras la carpeta esté vacía la página se construye igual y sigue
posicionando — muestra el texto y salta la galería, sin marcos rotos.

## Antes de publicar

Son fotos de una menor de edad identificable en un evento privado. **Pedí
permiso por escrito a la familia** antes de subirlas, y dejá anotado quién
autorizó qué. En varios de los mercados donde trabaja el estudio eso es una
cuestión legal, no solo de cortesía.

El texto de la sección (título, `lead`, los tres párrafos y la
`metaDescription`) está en [`src/content/site.ts`](../../../content/site.ts),
en `workCategories`, entrada `15th-birthday`.
