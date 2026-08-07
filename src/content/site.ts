/* ============================================================================
   SITE CONTENT
   ============================================================================
   Every string on the site lives here, so copy changes never touch a component.

   Two groups:

     REAL     — supplied by the client or migrated verbatim from the live site.
     PENDING  — structure is built, content is still owed. Rendered with
                `data-placeholder`, which draws a badge in `astro dev` and is
                inert in production.

   Nothing from the AncoraThemes "Integro" demo survives in this file. The
   Lorem ipsum, the fictional staff member, the third-party brands, the New
   York address and the invented prices are all gone.
   ========================================================================= */

export const PENDING = 'pending' as const;

// ---------------------------------------------------------------------------
// Studio facts — drawn from the client's own "Who We Are" copy.
// These drive the wall labels, so they are stated once and reused.
// ---------------------------------------------------------------------------

export const studio = {
  years: '9+',
  countries: ['Colombia', 'United States'],
  cities: ['Miami', 'New York', 'Los Angeles', 'Utah'],
  disciplines: [
    'Audiovisual production',
    'Professional photography',
    'Music videos',
    'Branding',
    'Strategic marketing',
  ],
};

// ---------------------------------------------------------------------------
// Markets — the same four cities and two countries stated above, resolved to
// the states and countries a search actually names.
// ---------------------------------------------------------------------------
// This exists because "Los Angeles" and "California" are the same fact to the
// studio and two different searches to Google. Somebody looking for a
// marketing agency types the state, not the city, roughly as often as not, and
// a page that only ever says "Los Angeles" cannot answer them.
//
// Nothing here is a new claim. Every city listed is one the client already
// named in "Who We Are"; the state and country around it is arithmetic.
//
// ⚠️  The `lead` and `body` lines are DRAFTS. They are written strictly from
//     what the studio says it does — no market-specific client, project, award
//     or office is claimed anywhere, because none has been supplied. Read them
//     before launch and edit them here. If the studio has real work in a market,
//     naming it in that market's `body` is worth more than every meta tag on
//     the site put together.
// ---------------------------------------------------------------------------

export interface Market {
  /** URL segment. Short and clean — the title carries the keywords. */
  slug: string;
  /** How the place is named in prose and in headings. */
  name: string;
  /** ISO region for structured data. Omitted for a country-level market. */
  region?: string;
  country: 'US' | 'CO';
  /** Schema.org place type for the areaServed node. */
  kind: 'State' | 'Country';
  /** Cities inside this market that the studio already names. */
  cities: string[];
  /** The disciplines this market leads with, by `services.items` title. */
  leads: string[];
  lead: string;
  body: string[];
  /**
   * The search result's second line. Written per market, not generated — a
   * template with the place name swapped produces five descriptions that read
   * as one, and Google rewrites the ones it does not believe. Keep every one
   * of these under 160 characters or it is truncated mid-sentence.
   */
  metaDescription: string;
}

export const markets: Market[] = [
  {
    slug: 'utah',
    name: 'Utah',
    region: 'UT',
    country: 'US',
    kind: 'State',
    cities: ['Salt Lake City'],
    leads: ['Professional photography', 'Strategic marketing', 'Audiovisual production'],
    lead: 'A creative agency working in Utah across video production, professional photography and strategic marketing.',
    metaDescription:
      'Marketing agency and photography studio working in Utah. Video production, corporate and food photography, branding and social media for Salt Lake City businesses.',
    body: [
      'Utah is where the day-to-day production happens. Corporate and food photography for restaurants and local businesses, commercial video, and the social media content that has to keep running long after the shoot day is over.',
      'The studio works the way an in-house team would, without the headcount: concept, production, post and delivery handled end to end, so a Utah business gets a campaign rather than a folder of files it then has to figure out what to do with.',
      'The same team that produces music videos in Los Angeles and campaigns in Miami shoots a Salt Lake City menu. The scale of the job changes; the standard does not.',
    ],
  },
  {
    slug: 'california',
    name: 'California',
    region: 'CA',
    country: 'US',
    kind: 'State',
    cities: ['Los Angeles'],
    leads: ['Music videos', 'Audiovisual production', 'Branding'],
    lead: 'Music video, commercial and brand production in California, working out of Los Angeles.',
    metaDescription:
      'Marketing and video production in California. High-end music videos, commercials, advertising campaigns and brand photography, produced out of Los Angeles.',
    body: [
      'Los Angeles is where the music video work concentrates. High-end videos for artists, shot and finished to the standard the market expects, with the concept developed alongside the artist rather than handed to them.',
      'Alongside the music work: commercial productions, advertising campaigns and brand content for companies that need something with production value behind it, not another phone edit.',
      'California is one of four United States markets the studio works across, and the reason a Los Angeles shoot can be crewed without the client paying to build a team from scratch.',
    ],
  },
  {
    slug: 'florida',
    name: 'Florida',
    region: 'FL',
    country: 'US',
    kind: 'State',
    cities: ['Miami'],
    leads: ['Audiovisual production', 'Professional photography', 'Strategic marketing'],
    lead: 'Video production, photography and marketing in Florida, working out of Miami.',
    metaDescription:
      'Bilingual marketing agency and photography studio in Florida. Video production, restaurant and food photography, branding and social media content out of Miami.',
    body: [
      'Miami is a bilingual market and the studio works in both languages — the same team, the same standard, whether the campaign runs in English, in Spanish, or in both at once.',
      'The work here runs across restaurants and hospitality, brands, and artists: food photography that makes a menu sell, commercial production, and the social content that carries a campaign after launch.',
      'Miami is also the closest United States market to the studio’s Colombian side, which is what makes a production that spans both countries a scheduling question rather than a logistical one.',
    ],
  },
  {
    slug: 'new-york',
    name: 'New York',
    region: 'NY',
    country: 'US',
    kind: 'State',
    cities: ['New York'],
    leads: ['Branding', 'Professional photography', 'Audiovisual production'],
    lead: 'Brand campaigns, corporate photography and video production in New York.',
    metaDescription:
      'Branding, marketing and photography in New York. Visual identity, corporate photography, commercial video production and advertising campaigns, end to end.',
    body: [
      'New York work leans toward brand: visual identity that holds together everywhere a company shows up, corporate photography that makes it look credible, and the advertising campaigns built on top of both.',
      'Production is handled end to end — concept development through final delivery — so a brand gets one team accountable for the result instead of a photographer, an editor and an agency pointing at each other.',
      'One of four United States markets the studio works across, alongside Utah, California and Florida.',
    ],
  },
  {
    slug: 'colombia',
    name: 'Colombia',
    country: 'CO',
    kind: 'Country',
    cities: ['Bogotá'],
    leads: ['Music videos', 'Audiovisual production', 'Professional photography'],
    lead: 'Producción audiovisual, fotografía profesional y marketing en Colombia.',
    metaDescription:
      'Producción audiovisual, fotografía profesional y marketing en Colombia. Videos musicales, producción comercial y contenido para marcas, restaurantes y artistas.',
    body: [
      'Half of the studio’s nine years are Colombian. Music videos, commercial production and photography for artists, restaurants, businesses and marketing agencies across the country.',
      'Working in two countries is what gives the studio its perspective: a campaign built in Bogotá and a campaign built in Salt Lake City are not the same brief, and treating them as though they were is how work ends up looking like everybody else’s.',
      'Trabajamos en español y en inglés, con el mismo equipo y el mismo estándar en los dos países.',
    ],
  },
];

export const meta = {
  title: 'JP Media Groups — Creative Agency, Photography & Audiovisual Production',
  description:
    'A creative agency specializing in audiovisual production, professional photography, music videos, branding and strategic marketing. Nine years of work across Colombia and the United States.',
  locale: 'en-US',
};

// ---------------------------------------------------------------------------
// Hero — migrated verbatim from the live site.
// ---------------------------------------------------------------------------
// Note: the live headline is Utah-specific while the studio actually works
// across Miami, New York, Los Angeles and Colombia. Rather than rewrite the
// client's own headline, the reach is stated in the label beside it.

export const hero = {
  label: ['Creative agency', 'Est. 2016'],

  lines: [
    { text: 'Grow your', accent: false },
    { text: 'business with', accent: false },
    { text: 'photography', accent: true },
    { text: '+ marketing', accent: true },
  ],
  linesMobile: [
    { text: 'Grow your', accent: false },
    // { text: 'Utah', accent: false },
    { text: 'business', accent: false },
    { text: 'with', accent: false },
    { text: 'photography', accent: true },
    { text: '+ marketing', accent: true },
  ],

  kicker: 'That actually works',
  primaryCta: { label: 'Start a project', href: '/contact/' },
  secondaryCta: { label: 'Meet the team', href: '/#team' },
};

// ---------------------------------------------------------------------------
// Who We Are — supplied by the client, verbatim.
// ---------------------------------------------------------------------------

export const about = {
  label: ['Who we are', 'Studio'],
  title: 'Every brand has a story worth telling',
  titleLines: ['Every brand has', 'a story worth', 'telling'],
  accentLine: 2,
  body: [
    'At JP Media Groups, we are a creative agency specializing in audiovisual production, professional photography, music videos, branding, and strategic marketing. With over nine years of experience, we help businesses, restaurants, brands, entrepreneurs, and artists bring their vision to life through creative solutions that inspire, engage, and deliver real results.',
    'Over the years, we have produced high-end music videos, commercial productions, advertising campaigns, social media content, corporate photography, food photography, and professional audiovisual content for clients across a wide range of industries. Every project is driven by creativity, innovation, attention to detail, and a commitment to excellence.',
    'Our portfolio includes collaborations with artists, restaurants, businesses, and marketing agencies throughout Colombia and the United States, with projects in Miami, New York, Los Angeles, and Utah. These experiences have allowed us to develop a global perspective while delivering creative work tailored to each client’s unique goals.',
    'At JP Media Groups, we believe every brand has a story worth telling. That’s why we combine creativity, strategy, and technology to produce content that not only captures attention but also strengthens brand identity, builds meaningful connections with audiences, and supports long-term business growth.',
    'More than producing videos or taking photographs, we create visual experiences that leave a lasting impression. From concept development to final delivery, we work closely with our clients to ensure every detail reflects their vision and contributes to their success.',
  ],
  mission:
    'Our mission is simple: to help brands stand out, connect with their audience, and grow through powerful visual storytelling and strategic marketing.',
  closer:
    'We don’t just create content — we create experiences, build brands, and deliver results.',
  stats: [
    { value: '9+', label: 'Years' },
    { value: '2', label: 'Countries' },
    { value: '4', label: 'Cities' },
    { value: '5', label: 'Disciplines' },
  ],
};

// ---------------------------------------------------------------------------
// Services — the studio's real disciplines, described from its own copy.
// ---------------------------------------------------------------------------

export const services = {
  label: ['What we do', 'Five disciplines'],
  title: 'From concept development to final delivery',
  titleLines: ['From concept', 'to final delivery'],
  items: [
    {
      title: 'Audiovisual production',
      body: 'Commercial productions and advertising campaigns, handled end to end — concept, shoot, post and delivery.',
      plate: 'plate-signal.webp',
    },
    {
      title: 'Professional photography',
      body: 'Corporate and food photography for restaurants, brands and businesses that need to look credible.',
      plate: 'plate-mineral.webp',
    },
    {
      title: 'Music videos',
      body: 'High-end music videos for artists working across Colombia and the United States.',
      plate: 'plate-deep.webp',
    },
    {
      title: 'Branding',
      body: 'Visual identity that holds together everywhere the brand shows up, not just on the logo sheet.',
      plate: 'plate-counter.webp',
    },
    {
      title: 'Strategic marketing',
      body: 'Social media content and campaigns built to grow the business, not only the follower count.',
      plate: 'plate-horizon.webp',
    },
  ],
};

// ---------------------------------------------------------------------------
// Work — the expanding gallery. Structure is built; the cases are owed.
// ---------------------------------------------------------------------------

export const work = {
  status: PENDING,
  label: ['Selected work', 'Portfolio'],
  title: 'The work',
  titleLines: ['Selected work'],
  note: 'Six slots, ready for real case studies. Each one takes an image, a title, a discipline and a city.',
  items: [
    { title: 'Case one', discipline: 'Music video', city: 'Miami' },
    { title: 'Case two', discipline: 'Food photography', city: 'Salt Lake City' },
    { title: 'Case three', discipline: 'Brand campaign', city: 'New York' },
    { title: 'Case four', discipline: 'Corporate photography', city: 'Los Angeles' },
    { title: 'Case five', discipline: 'Audiovisual', city: 'Bogotá' },
  ],
};

// ---------------------------------------------------------------------------
// Team — four people. Photos, names and roles supplied by the client.
// ---------------------------------------------------------------------------
// ⚠️  The `bio` lines are DRAFTS, written from each person's role and from what
//     the studio says it does. They deliberately claim nothing that cannot be
//     checked — no years of experience, no schools, no awards — because these
//     are statements about real people. Have each person read and approve their
//     own line before this goes live, and edit it here.
// ---------------------------------------------------------------------------
// Drop the four portrait files into src/assets/team/ using the filenames
// below. The descriptions record which supplied photo belongs in which slot.

/**
 * `focus` is the CSS object-position for each portrait.
 *
 * The photos come from different shoots at different crops — member-1 is a
 * full-length shot at 0.56 aspect, the rest are headshots around 0.67 — and
 * they all land in the same 3:4-ish frame. Centred cover crops the head off the
 * full-length one, so each portrait states where its subject actually is.
 */
export const team = {
  status: PENDING,
  label: ['The team', 'Four people'],
  title: 'The people behind the work',
  titleLines: ['The people', 'behind the work'],
  accentLine: 1,
  members: [
    {
      slot: 'member-1',
      photo: 'member-1.jpg',
      focus: '50% 6%',
      name: 'Johan Perez',
      role: 'CEO',
      email: 'contact@jpmediagroups.com',
      bio: 'Co-founded the studio and still sets its direction. Johan makes the calls that decide where JP Media goes next, and stays close to the clients who take us there.',
    },
    {
      slot: 'member-2',
      photo: 'member-2.jpg',
      focus: '50% 20%',
      name: 'Alex Gil',
      role: 'Chief Operating Officer',
      email: 'alex@jpmediagroups.com',
      bio: 'The other half of the studio, and the reason it runs on time. Alex leads the team day to day, sharpens how the work gets made, and delivers when he says he will.',
    },
    {
      slot: 'member-3',
      photo: 'member-3.jpg',
      focus: '50% 18%',
      name: 'Valeria Martínez',
      role: 'Operations & Finance Manager',
      email: 'valeria@jpmediagroups.com',
      bio: 'Holds the line between ambition and arithmetic. Budgets, invoices, payroll, suppliers — Valeria runs the business behind the work so nothing arrives as a surprise.',
    },
    {
      slot: 'member-4',
      photo: 'member-4.jpg',
      focus: '50% 16%',
      name: 'Katherine Montoya',
      role: 'Social Media Manager',
      email: 'katherine@jpmediagroups.com',
      bio: 'Gives the brands a voice and then keeps talking. Katherine runs the channels, grows the communities, and answers every conversation a post sets off.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Testimonial — structure only.
// ---------------------------------------------------------------------------

export const testimonial = {
  status: PENDING,
  label: ['Client', 'Testimonial'],
  quote: 'Quote pending — a sentence from a real client about a real project.',
  name: 'Name pending',
  role: 'Company pending',
};

// ---------------------------------------------------------------------------
// Packages — structure only. The previous prices were theme demo values.
// ---------------------------------------------------------------------------

export const plans = {
  status: PENDING,
  label: ['Packages', 'Pricing'],
  title: 'Ways to work together',
  titleLines: ['Ways to work', 'together'],
  cta: 'Request a quote',
  items: [
    {
      title: 'Single shoot',
      summary: 'One production day. Photography or video, delivered edited.',
      price: 'Price pending',
      featured: false,
    },
    {
      title: 'Campaign',
      summary: 'Concept, production and delivery for a full campaign across channels.',
      price: 'Price pending',
      featured: true,
    },
    {
      title: 'Retainer',
      summary: 'Ongoing content and marketing, month to month.',
      price: 'Price pending',
      featured: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
// Every value the WordPress site showed here was theme demo — a New York
// address for a Utah studio, plus placeholder phone and email. Removed. Only
// the Instagram account is real.

export const contact = {
  status: PENDING,
  label: ['Get in touch', 'Contact'],
  title: 'Tell us about the project',
  titleLines: ['Tell us about', 'the project'],
  email: 'contact@jpmediagroups.com',
  phone: '+1 (385) 867-7440',
  locations: 'Colombia · United States',
};

export const socials = [
  { name: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/jpmediagroups/' },
];

export const newsletter = {
  title: 'Get new work in your inbox',
  body: 'Occasional notes on what the studio is shooting. No noise.',
};

export const search = {
  placeholder: 'Search the site',
  label: 'Search',
  closeLabel: 'Close search',
};

// ---------------------------------------------------------------------------
// Navigation — in-page destinations only. The WordPress menu's ~50 URLs were
// all theme demo pages.
// ---------------------------------------------------------------------------

// Hashes are absolute (`/#about`, not `#about`). A bare hash resolves against
// whatever page you are on, so from /contact/ the nav produced /contact/#about
// — a section that does not exist there. With the leading slash the link always
// means "the About block on the home page", and lib/motion.ts still intercepts
// it for a smooth scroll when you are already on home.
export const nav = [
  { label: 'Studio', href: '/#about' },
  { label: 'Services', href: '/#services' },
  // The block that links the five market pages. In the main nav rather than
  // only in the footer, because the market pages are the site's answer to
  // every "<service> <place>" search and a nav link is the strongest internal
  // signal the site can give them.
  { label: 'Where we work', href: '/#markets' },
  // Restore alongside the <Work /> tag in index.astro — a nav item pointing at
  // a section that is not rendered is a dead link.
  // { label: 'Work', href: '/#work' },
  { label: 'Team', href: '/#team' },
  { label: 'Contact', href: '/contact/' },
];
