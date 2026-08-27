/* ============================================================================
   i18n — el emparejamiento de URLs entre los dos idiomas
   ============================================================================
   Esto es lo único que hreflang necesita saber: qué URL en inglés corresponde a
   qué URL en español. Todo lo demás — las etiquetas, el `<html lang>`, el
   selector de idioma, el sitemap — se deriva de este mapa.

   ── POR QUÉ SUBCARPETA Y NO SUBDOMINIO ─────────────────────────────────────
   `/es/` consolida la autoridad del dominio en un solo sitio.
   `es.jpmediagroups.com` la parte en dos y obliga a construir la del subdominio
   desde cero, que para un estudio con un puñado de enlaces es empezar de nuevo.

   ── POR QUÉ LOS SLUGS ESTÁN TRADUCIDOS ─────────────────────────────────────
   `/es/trabajo/fotografia-de-quinceanera/` en vez de `/es/work/15th-birthday/`.
   El slug es de las pocas partes de una URL que Google lee como texto, y la
   palabra que la gente escribe es «quinceañera», no «15th birthday». La URL en
   inglés ya está gastada y no se toca; la nueva no tiene por qué heredarla.

   ── LA REGLA DE HREFLANG QUE MÁS SE ROMPE ──────────────────────────────────
   Las referencias tienen que ser RECÍPROCAS. Si /work/food/ apunta a
   /es/trabajo/fotografia-gastronomica/, esa página tiene que apuntar de vuelta,
   y las dos tienen que declararse a sí mismas. Google descarta en silencio los
   conjuntos que no cierran, y no avisa. Por eso el mapa vive en un solo lugar y
   las dos direcciones se generan de él en vez de escribirse a mano.

   Una página sin contrapartida NO lleva hreflang. Declarar un alternativo que
   no existe es peor que no declarar ninguno.
   ========================================================================= */

import { workCategories } from '../content/site';
import { esCategories } from '../content/site.es';

export type Locale = 'en' | 'es';

export const LOCALES: Locale[] = ['en', 'es'];
export const DEFAULT_LOCALE: Locale = 'en';

/** El código completo que va en `og:locale` y en `hreflang`. */
export const LOCALE_TAG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
};

export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_CO',
};

export const LOCALE_NAME: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

/**
 * Cada par de páginas equivalentes, en inglés → español.
 *
 * Las páginas que todavía no tienen versión en español simplemente no están
 * acá: /licensing/ y las cinco de mercado. Cuando se traduzcan, se agregan y el
 * hreflang aparece solo en las dos direcciones.
 */
const PAIRS: Array<[string, string]> = [
  ['/', '/es/'],
  ['/work/', '/es/trabajo/'],
  ['/contact/', '/es/contacto/'],
  ...workCategories
    .filter((c) => esCategories[c.slug])
    .map(
      (c) =>
        [`/work/${c.slug}/`, `/es/trabajo/${esCategories[c.slug].slug}/`] as [
          string,
          string,
        ],
    ),
];

const EN_TO_ES = new Map(PAIRS);
const ES_TO_EN = new Map(PAIRS.map(([en, es]) => [es, en]));

/** Normaliza a la forma con barra final, que es la que el sitio sirve. */
export const normalise = (path: string) => {
  const clean = path.replace(/\/+$/, '');
  return clean === '' ? '/' : `${clean}/`;
};

/** El idioma de una ruta, leído de la propia ruta. */
export const localeOf = (path: string): Locale =>
  path === '/es' || path.startsWith('/es/') ? 'es' : 'en';

/**
 * El par completo de una ruta, o `null` si esta página no tiene contrapartida.
 *
 * Devuelve las DOS entradas, incluida la de la propia página: un conjunto
 * hreflang tiene que incluirse a sí mismo o Google lo ignora entero.
 */
export function alternatesFor(
  path: string,
): Array<{ locale: Locale; path: string }> | null {
  const here = normalise(path);
  const lang = localeOf(here);
  const en = lang === 'en' ? here : ES_TO_EN.get(here);
  const es = lang === 'es' ? here : EN_TO_ES.get(here);
  if (!en || !es) return null;
  return [
    { locale: 'en', path: en },
    { locale: 'es', path: es },
  ];
}

/** La misma página en el otro idioma, para el selector del header. */
export function counterpart(path: string): { locale: Locale; path: string } | null {
  const alts = alternatesFor(path);
  if (!alts) return null;
  const here = localeOf(normalise(path));
  return alts.find((a) => a.locale !== here) ?? null;
}

/** La ruta en español de una categoría, sin repetir la construcción. */
export const esCategoryPath = (slug: string) => {
  const es = esCategories[slug];
  return es ? `/es/trabajo/${es.slug}/` : null;
};
