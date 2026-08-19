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
 * EmailJS — the contact form's delivery route.
 *
 * Three identifiers, all three `PUBLIC_`. That prefix is required (Astro only
 * exposes prefixed variables to browser code) and it is also accurate: EmailJS
 * is a client-side service, so all three values are readable in the page source
 * of any site that uses it, exactly like a reCAPTCHA site key. None of them
 * grants access to past submissions.
 *
 * They still live in environment variables rather than in the source, so they
 * can be rotated without a code change and so a fork of this repository does not
 * inherit the studio's inbox.
 *
 * ── THE ONE THING THAT ACTUALLY PROTECTS THESE ────────────────────────────
 * Because the keys are public, the only thing stopping somebody pasting them
 * into their own page and sending mail through this account is the domain
 * allowlist. In the EmailJS dashboard, under Account → Security, switch on
 * "Use Allowed List" and add `jpmediagroups.com`. Without that, the quota is
 * open to anyone who views source.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Set them in two places:
 *   - locally, in `.env`               (see .env.example)
 *   - in production, Vercel → Settings → Environment Variables
 *
 * Any one of them missing is a supported state: the form then refuses to
 * pretend it sent anything, which is what it did before a route existed.
 */
export const emailjs = {
  serviceId: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
} as const;

/** True only when all three identifiers are present. */
export const emailjsReady: boolean =
  emailjs.serviceId.length > 0 &&
  emailjs.templateId.length > 0 &&
  emailjs.publicKey.length > 0;
