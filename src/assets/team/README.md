# Fotos del equipo

Suelta aquí los cuatro retratos con **exactamente** estos nombres. La sección
Team los recoge sola: mientras falte un archivo, ese hueco muestra un marco
vacío en vez de una cara de relleno, y el build no se rompe.

| Archivo | Foto que va aquí |
|---|---|
| `member-1.jpg` | Retrato en color · pelo castaño rojizo, blazer negro, fondo blanco de estudio |
| `member-2.jpg` | Retrato en color · camisa blanca, de pie en la cubierta de un barco, agua al fondo |
| `member-3.jpg` | Retrato en color · sentado, camisa blanca abotonada, fondo beige |
| `member-4.jpg` | Retrato en blanco y negro · brazos cruzados, blazer sobre camisa blanca |

Sirve `.jpg`, `.jpeg`, `.png`, `.webp` o `.avif` — solo hay que mantener el
nombre base (`member-1`, `member-2`…). Astro los convierte a WebP/AVIF y genera
los `srcset` en el build, así que **sube el original a máxima resolución**, sin
comprimir ni recortar.

Encuadre: los retratos se muestran en formato **3:4 vertical** con `object-fit:
cover`, centrados. Si alguna cara queda mal recortada, dímelo y ajusto el
`object-position` de esa persona.

Al reposo todos se ven en blanco y negro para que la fila lea como una sola
serie —vienen de sesiones distintas— y cada foto recupera su color al pasar el
ratón por encima.

## Lo que falta además de las fotos

En [`src/content/site.ts`](../../content/site.ts), objeto `team`: cada persona
necesita **nombre**, **rol** y **bio**. Ahora mismo dicen "pending" y salen
marcados en `astro dev` con la etiqueta magenta.
