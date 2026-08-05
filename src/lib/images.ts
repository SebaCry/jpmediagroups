/**
 * Resolves assets by filename so content files can reference plain strings
 * ("plate-signal.webp") instead of import paths.
 *
 * The globs are eager and build-time only. Everything returned goes through
 * `astro:assets`, which handles the WebP/AVIF conversion and the responsive
 * srcsets.
 */

const images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const plates = import.meta.glob<{ default: ImageMetadata }>('../assets/plates/*.webp', {
  eager: true,
});

/**
 * Team portraits. This folder is empty until the client supplies the photos,
 * so lookups return `null` rather than throwing — the Team section renders an
 * empty frame in the meantime instead of failing the build.
 */
const portraits = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/team/*.{jpg,jpeg,png,webp,avif}',
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
    const available = Object.keys(map).map((k) => k.split('/').pop()).join(', ') || '(none)';
    throw new Error(`Asset "${file}" not found in src/assets/${dir}. Available: ${available}`);
  }
  return found;
}

export const img = (file: string) => required(images, 'images', file);
export const plate = (file: string) => required(plates, 'plates', file);

/** Returns `null` when the portrait has not been supplied yet. */
export const portrait = (file: string) => lookup(portraits, 'team', file);
