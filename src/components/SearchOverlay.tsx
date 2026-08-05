/* ============================================================================
   SEARCH OVERLAY
   ============================================================================
   Replicates the theme's `search_modern` widget — a full-screen panel opened
   from the header magnifier — and adds what the WordPress version never had.

   Today the live site is a plain `GET` form that reloads WordPress at `/?s=`,
   so there is no in-page feedback at all. This island runs the search against a
   Pagefind index built at deploy time and drives five explicit states:

     idle     — panel open, field empty. Shows the prompt.
     typing   — a query is in flight (debounced). Shows the progress glyph.
     results  — hits found. Rendered with a staggered mask reveal.
     empty    — query ran, zero hits.
     error    — the index failed to load or the query threw.

   The whole thing is the only component framework island on the site: it is
   genuinely stateful, and Preact costs ~4KB gzip.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

type Status = 'idle' | 'typing' | 'results' | 'empty' | 'error';

interface Hit {
  id: string;
  url: string;
  title: string;
  excerpt: string;
}

interface Props {
  placeholder: string;
  closeLabel: string;
}

const DEBOUNCE_MS = 220;
const MAX_RESULTS = 6;

/** Pagefind is generated into `dist/pagefind/` by the build script. */
type PagefindModule = {
  options?: (o: Record<string, unknown>) => Promise<void>;
  search: (q: string) => Promise<{ results: { id: string; data: () => Promise<any> }[] }>;
};

let pagefind: PagefindModule | null = null;
let pagefindError = false;

/**
 * Path to the built index.
 *
 * Deliberately a plain literal. Combining `import.meta.env` with a dynamic
 * `import()` in this module makes Vite's SSR transform rewrite the same span
 * twice and the dev server dies with "Cannot split a chunk that has already
 * been edited". If the site ever moves under a base path, change this string
 * and `base` in astro.config.mjs together.
 */
const PAGEFIND_URL = '/pagefind/pagefind.js';

async function loadPagefind(): Promise<PagefindModule | null> {
  if (pagefind || pagefindError) return pagefind;
  try {
    // Built asset, absent from the dev server — resolved at runtime, not by Vite.
    const mod = (await import(/* @vite-ignore */ PAGEFIND_URL)) as PagefindModule;
    await mod.options?.({ excerptLength: 24 });
    pagefind = mod;
    return mod;
  } catch {
    pagefindError = true;
    return null;
  }
}

export default function SearchOverlay({ placeholder, closeLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [hits, setHits] = useState<Hit[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const timer = useRef<number | undefined>(undefined);

  /* --- open / close -------------------------------------------------- */

  const close = useCallback(() => {
    setOpen(false);
    document.documentElement.removeAttribute('data-overlay-open');
    document.body.style.overflow = '';
    document.dispatchEvent(new CustomEvent('overlay:close'));
    lastFocused.current?.focus();
  }, []);

  useEffect(() => {
    const onOpen = () => {
      lastFocused.current = document.activeElement as HTMLElement;
      setOpen(true);
      document.documentElement.setAttribute('data-overlay-open', 'search');
      document.body.style.overflow = 'hidden';
      document.dispatchEvent(new CustomEvent('overlay:open'));
      // Warm the index while the panel animates in.
      void loadPagefind();
    };

    const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-search-open]'));
    triggers.forEach((t) => t.addEventListener('click', onOpen));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) close();
      // `/` focuses search, the convention users already expect.
      if (e.key === '/' && !open && !/^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        onOpen();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      triggers.forEach((t) => t.removeEventListener('click', onOpen));
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 260);
  }, [open]);

  /* --- focus trap ----------------------------------------------------- */

  const onPanelKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input'),
    ).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* --- querying ------------------------------------------------------- */

  const run = useCallback(async (q: string) => {
    const pf = await loadPagefind();
    if (!pf) {
      setStatus('error');
      return;
    }
    try {
      const { results } = await pf.search(q);
      const top = await Promise.all(results.slice(0, MAX_RESULTS).map((r) => r.data()));
      const mapped: Hit[] = top.map((d, i) => ({
        id: results[i].id,
        url: d.url,
        title: d.meta?.title ?? d.url,
        excerpt: d.excerpt ?? '',
      }));
      setHits(mapped);
      setStatus(mapped.length ? 'results' : 'empty');
    } catch {
      setStatus('error');
    }
  }, []);

  const onInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);
    window.clearTimeout(timer.current);

    if (!value.trim()) {
      setHits([]);
      setStatus('idle');
      return;
    }

    setStatus('typing');
    timer.current = window.setTimeout(() => void run(value.trim()), DEBOUNCE_MS);
  };

  /* --- render --------------------------------------------------------- */

  return (
    <div class={`search-overlay${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div class="search-overlay__scrim" onClick={close} />

      <div
        class="search-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        ref={panelRef}
        onKeyDown={onPanelKeyDown}
      >
        <button type="button" class="search-overlay__close" onClick={close} aria-label={closeLabel}>
          <span />
          <span />
        </button>

        <form
          class="search-overlay__form"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) void run(query.trim());
          }}
        >
          <label class="sr-only" for="site-search">
            Search this site
          </label>
          <input
            id="site-search"
            ref={inputRef}
            type="search"
            name="s"
            class="search-overlay__field"
            placeholder={placeholder}
            value={query}
            onInput={onInput}
            autocomplete="off"
            spellcheck={false}
          />
          <span class="search-overlay__rule" aria-hidden="true" />
        </form>

        {/* Live region: state changes are announced, not just shown. */}
        <div class="search-overlay__status" role="status" aria-live="polite">
          {status === 'idle' && <p class="search-overlay__hint">Start typing to search.</p>}

          {status === 'typing' && (
            <p class="search-overlay__hint search-overlay__hint--busy">
              <span class="search-spinner" aria-hidden="true" />
              Searching…
            </p>
          )}

          {status === 'empty' && (
            <p class="search-overlay__hint">
              No matches for <strong>“{query}”</strong>. Try a broader term.
            </p>
          )}

          {status === 'error' && (
            <p class="search-overlay__hint search-overlay__hint--error">
              Search is unavailable right now. The index is generated at build time —
              run <code>npm run build</code> and preview the built site.
            </p>
          )}
        </div>

        {status === 'results' && (
          <ul class="search-overlay__results">
            {hits.map((hit, i) => (
              <li key={hit.id} class="search-result" style={{ '--i': i } as never}>
                <a href={hit.url} class="search-result__link" onClick={close}>
                  <span class="search-result__title">{hit.title}</span>
                  <span
                    class="search-result__excerpt"
                    dangerouslySetInnerHTML={{ __html: hit.excerpt }}
                  />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
