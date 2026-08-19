# Portfolio assets

One folder per category. **Drop files in and they appear** — there is no list to
update, no import to write and no build step to run beyond `npm run build`.

| Folder | Page | Drive folder it came from |
|---|---|---|
| `bodas/` | `/work/bodas/` | PORTAFOLIO BODAS |
| `food/` | `/work/food/` | FOOD PHOTOS |
| `photos/` | `/work/photos/` | PHOTOS |
| `music-videos/` | `/work/music-videos/` | MUSIC VIDEOS |
| `social-media/` | `/work/social-media/` | SOCIAL MEDIA |
| `websites/` | `/work/websites/` | — (screenshots) |

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

## What happens when a folder is empty

The page still builds and still ranks. It renders labelled empty frames instead
of photographs, so nobody mistakes a placeholder for finished work — the same
convention `src/assets/team/` uses.

## Before you load a wedding gallery

These are photographs of real, identifiable people at a private event.
**Get the couple's permission before publishing**, and keep a note of who
agreed to what. That is a legal question in some of the markets this studio
works in, not only a courteous one.
