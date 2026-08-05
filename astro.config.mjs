// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://jpmediagroups.com',

  // Preact powers the single stateful island (the search overlay). At ~4KB gzip it
  // keeps the JS budget intact where React would have cost ~45KB on its own.
  integrations: [preact()],

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
