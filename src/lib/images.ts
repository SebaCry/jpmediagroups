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
