# Portfolio assets

One folder per category. **Drop files in and they appear** — there is no list to
update, no import to write and no build step to run beyond `npm run build`.

| Folder | Page | Drive folder it came from |
|---|---|---|
| `bodas/` | `/work/bodas/` | PORTAFOLIO BODAS |
| `food/` | `/work/food/` | FOOD PHOTOS |
| `photos/` | `/work/photos/` | PHOTOS |
| `15th-birthday/` | `/work/15th-birthday/` | 15 AÑOS |
| `music-videos/` | `/work/music-videos/` | MUSIC VIDEOS |
| `social-media/` | `/work/social-media/` | SOCIAL MEDIA |
| `websites/` | `/work/websites/` | — (screenshots) |

> **El nombre de la carpeta tiene que ser igual al `slug`** de la categoría en
> [`src/content/site.ts`](../../content/site.ts). Por eso `15/` pasó a llamarse
> `15th-birthday/`: la galería se busca por slug, y con la carpeta llamada `15`
> la página salía vacía sin dar ningún error.

## De dónde salen los archivos

Si las fotos están en el cPanel de BanaHosting (`/home/hrwldnzb/jpmediagroups.com/images/…`),
**hay que bajarlas, no enlazarlas**. Dos motivos:

1. `jpmediagroups.com` apunta a **Vercel**, no a BanaHosting, así que esos
   archivos no son alcanzables desde internet — devuelven 404.
2. Aunque lo fueran, un JPEG directo de cámara pesa entre 5 y 15 MB. Astro
   convierte a WebP/AVIF y genera cada tamaño responsive en el build; servir el
   original crudo arruinaría la carga y el posicionamiento.

En el File Manager: entrá a la carpeta → **Select All** → **Compress** → zip →
**Download**, y descomprimí dentro de la carpeta que corresponda aquí. Para
muchos archivos es más rápido por FTP (FileZilla) con las credenciales del
mismo cPanel.

## Naming

Files are sorted by name, so **name them `01.jpg`, `02.jpg`, `03.jpg`** to
control the order. The sort is numeric-aware, so `2.jpg` still comes before
`10.jpg`, but zero-padding keeps the folder readable.

Accepted: `.jpg` `.jpeg` `.png` `.webp` `.avif`

Do **not** pre-compress or resize. Astro generates the WebP/AVIF versions and
every responsive size at build time — give it the largest file you have. A
2400px-wide original is ideal; anything under 1200px will look soft on a retina
screen.

`websites/` is the exception: name each screenshot after its project slug in
`content/site.ts` (`project-one.jpg`), not with a number.

### Renombrar sin hacerlo a mano

Los nombres de cámara (`_MG_0328.jpg`) ordenan cronológicamente, que sirve para
una boda y no para el resto — **el primer archivo de la carpeta es la portada**
de la categoría en `/work/` y en la home, y la mejor foto rara vez es la primera
que se disparó.

```bash
npm run work:order bodas            # muestra el plan, no toca nada
npm run work:order bodas -- --apply # renombra a 01, 02, 03…
```

Para poner una foto concreta de portada, renombrala a `00.jpg` antes de aplicar:
ordena delante de todo y pasa a ser `01`.

## What happens when a folder is empty

The page still builds and still ranks. It renders labelled empty frames instead
of photographs, so nobody mistakes a placeholder for finished work — the same
convention `src/assets/team/` uses.

## Before you load a wedding gallery

These are photographs of real, identifiable people at a private event.
**Get the couple's permission before publishing**, and keep a note of who
agreed to what. That is a legal question in some of the markets this studio
works in, not only a courteous one.
