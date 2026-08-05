/**
 * Build-environment flags.
 *
 * These live in a plain module on purpose. An `import.meta.env` expression in
 * the frontmatter of an `.astro` file that also carries a hoisted `<script>`
 * makes Vite's SSR transform rewrite the same span twice, and `astro dev`
 * fails to boot with "Cannot split a chunk that has already been edited".
 * Reading the flag through an import sidesteps it entirely.
 */

/** True under `astro dev`, false in the production build. */
export const isDev: boolean = import.meta.env.DEV;
