/**
 * Resolves assets by filename so content files can reference plain strings
 * ("plate-signal.webp") instead of import paths.
 *
 * The globs are eager and build-time only. Everything returned goes through
 * `astro:assets`, which handles the WebP/AVIF conversion and the responsive
 * srcsets.
 */

const images = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/images/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

const plates = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/plates/*.webp",
  {
    eager: true,
  },
);

/**
 * Team portraits. This folder is empty until the client supplies the photos,
 * so lookups return `null` rather than throwing — the Team section renders an
 * empty frame in the meantime instead of failing the build.
 */
const portraits = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/team/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

/**
 * Client logos. Like the portraits, lookups return `null` rather than throwing:
 * a mistyped filename in the content file should leave one empty tile on the
 * wall, not take the whole build down.
 *
 * `.jfif` is absent from the pattern on purpose - Astro's image pipeline goes
 * by extension and does not know it, so a `.jfif` here would resolve to a plain
 * URL string and blow up inside <Image>. It is ordinary JPEG data; rename it.
 */
const logos = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/companies/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

function lookup(
  map: Record<string, { default: ImageMetadata }>,
  dir: string,
  file: string,
): ImageMetadata | null {
  return map[`../assets/${dir}/${file}`]?.default ?? null;
}

function required(
  map: Record<string, { default: ImageMetadata }>,
  dir: string,
  file: string,
): ImageMetadata {
  const found = lookup(map, dir, file);
  if (!found) {
    const available =
      Object.keys(map)
        .map((k) => k.split("/").pop())
        .join(", ") || "(none)";
    throw new Error(
      `Asset "${file}" not found in src/assets/${dir}. Available: ${available}`,
    );
  }
  return found;
}

export const img = (file: string) => required(images, "images", file);
export const plate = (file: string) => required(plates, "plates", file);

/** Returns `null` when the portrait has not been supplied yet. */
export const portrait = (file: string) => lookup(portraits, "team", file);

/** A client logo. Returns `null` when the file named in site.ts is not there. */
export const logo = (file: string) => lookup(logos, "companies", file);

const workFiles = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/work/**/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

export interface WorkImage {
  /** Bare filename, used for the alt fallback and the empty-slot label. */
  file: string;
  image: ImageMetadata;
}

/**
 * Everything filed under one category, ordered by filename.
 *
 * Sorted with `numeric` so `2.jpg` comes before `10.jpg`. A plain string sort
 * puts 10 first, which silently reorders any gallery named 1..n.
 *
 * The match is on the path PREFIX, so a category split into subfolders still
 * returns all of its photographs from one call - which is what keeps the count,
 * the schema and `cover()` correct whether or not a category has chapters. The
 * subfolders sort among themselves, so `01-fine-dining/01.jpg` is the first
 * frame of /work/food/ and therefore the cover of the category.
 */
export function gallery(category: string): WorkImage[] {
  const prefix = `../assets/work/${category}/`;
  return Object.entries(workFiles)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true }))
    .map(([path, mod]) => ({
      file: path.slice(prefix.length),
      image: mod.default,
    }));
}

/** How many photographs a category has. Drives the wall labels and the schema. */
export const galleryCount = (category: string) => gallery(category).length;

/**
 * One chapter of a split category — src/assets/work/<category>/<dir>/.
 *
 * Same rules as `gallery()`: drop a file in the folder and it appears, named
 * 01.jpg, 02.jpg … to order it. Moving a photograph between chapters is a move
 * between folders and nothing else; there is no list anywhere that has to agree.
 */
export const gallerySection = (category: string, dir: string): WorkImage[] =>
  gallery(`${category}/${dir}`);

/**
 * One named screenshot, for the website cards. Returns `null` when it has not
 * been supplied, so the card renders a frame rather than failing the build.
 */
export function shot(slug: string): ImageMetadata | null {
  const prefix = "../assets/work/websites/";
  const hit = Object.entries(workFiles).find(
    ([path]) =>
      path.startsWith(prefix) &&
      path.slice(prefix.length).replace(/\.\w+$/, "") === slug,
  );
  return hit?.[1].default ?? null;
}

/**
 * The cover for a category — its first photograph, or `null`.
 * Used by the /work/ index and by the home page teaser.
 */
export const cover = (category: string): ImageMetadata | null =>
  gallery(category)[0]?.image ?? null;
