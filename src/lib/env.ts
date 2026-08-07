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

/**
 * Web3Forms access key — the contact form's delivery endpoint.
 *
 * `PUBLIC_` because this value is read in the browser, and Astro only exposes
 * prefixed variables there. That is not a leak: Web3Forms access keys are
 * designed to be public, exactly like a reCAPTCHA site key. The key does not
 * grant access to submissions — it only says which inbox a POST is addressed
 * to, and Web3Forms will not deliver to any address other than the one the key
 * was created for.
 *
 * It still lives in an environment variable rather than in the source so it can
 * be rotated without a code change, and so a fork of this repository does not
 * inherit the studio's inbox.
 *
 * Set it in two places:
 *   - locally, in `.env`               (see .env.example)
 *   - in production, Vercel → Settings → Environment Variables
 *
 * Empty is a supported state: the form then refuses to pretend it sent
 * anything, which is what it did before an endpoint existed at all.
 */
export const web3formsKey: string = import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '';
