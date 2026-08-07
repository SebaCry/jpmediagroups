// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // MUST match what the host actually serves. jpmediagroups.com 308-redirects
  // to www.jpmediagroups.com, so www is the canonical host — and a canonical
  // tag, a sitemap entry or a schema @id pointing at a URL that redirects is a
  // signal Google has to resolve rather than trust.
  //
  // If the host is ever flipped to serve the apex instead, change this line and
  // the two below it: SITE_URL in src/lib/seo.ts and the Sitemap: line in
  // public/robots.txt. `npm run check:seo` fails if they disagree.
  site: 'https://www.jpmediagroups.com',

  // Every URL a crawler is offered ends in a slash, and every URL the sitemap
  // and the canonical tag declare must agree with that. A site that links
  // /contact/ but declares /contact canonical splits its own ranking signal.
  trailingSlash: 'always',

  integrations: [
    // Preact powers the single stateful island (the search overlay). At ~4KB gzip
    // it keeps the JS budget intact where React would have cost ~45KB on its own.
    preact(),

    sitemap({
      // The 404 is `noindex`; listing it in the sitemap contradicts that, and
      // Search Console reports the contradiction as an error.
      filter: (page) => !page.includes('/404'),

      // Priority is a hint, not an instruction, but the ordering it states
      // should match the site's own: home first, then the market pages that
      // are the answer to every "<service> <place>" search, then contact.
      serialize(item) {
        const path = new URL(item.url).pathname;
        const home = path === '/';
        const contact = path === '/contact/';
        return {
          ...item,
          changefreq: home ? 'weekly' : 'monthly',
          priority: home ? 1.0 : contact ? 0.6 : 0.9,
        };
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // NOTE: no `image.layout` / `image.responsiveStyles` here on purpose.
  // Astro's responsive layouts inject `width:100%; height:auto` onto every
  // <img>, at the same specificity as a utility class — which silently beats
  // `h-7` on the logo and `h-full object-cover` inside fixed-ratio frames.
  // Sizing on this site is owned by CSS; `widths` + `sizes` still give srcsets.

  build: {
    // Small critical CSS goes inline; the rest stays cacheable.
    inlineStylesheets: 'auto',
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
