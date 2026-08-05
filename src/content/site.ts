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

  // Two compositions of the same sentence, one per breakpoint.
  //
  // The headline size on a phone is capped by its longest line, not by taste:
  // Syne ExtraBold runs about 0.89em per character, so "Grow your Utah" (14
  // characters) cannot exceed ~28px at 390px without running off the screen.
  // The only way to set the type larger is to break it shorter — so the mobile
  // composition keeps every line at 11 characters or fewer, which lifts the cap
  // to ~35px. Bigger type, more lines. That is the trade, and it is why the two
  // lists differ.
  lines: [
    { text: 'Grow your Utah', accent: false },
    { text: 'business with', accent: false },
    { text: 'photography', accent: true },
    { text: '+ marketing', accent: true },
  ],
  linesMobile: [
    { text: 'Grow your', accent: false },
    { text: 'Utah', accent: false },
    { text: 'business', accent: false },
    { text: 'with', accent: false },
    { text: 'photography', accent: true },
    { text: '+ marketing', accent: true },
  ],

  kicker: 'That actually works',
  primaryCta: { label: 'Start a project', href: '/contact/' },
  // Points at Team while the Work section is held back — "See the work" would
  // be a dead link to a section that is not rendered. Restore it to
  // { label: 'See the work', href: '/#work' } when Work returns.
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
  // Restore alongside the <Work /> tag in index.astro — a nav item pointing at
  // a section that is not rendered is a dead link.
  // { label: 'Work', href: '/#work' },
  { label: 'Team', href: '/#team' },
  { label: 'Contact', href: '/contact/' },
];
