/* ============================================================================
   ESPAÑOL
   ============================================================================
   El sitio se construyó en inglés y el estudio trabaja en dos idiomas. Este
   archivo es la mitad que faltaba.

   ── POR QUÉ EXISTE ─────────────────────────────────────────────────────────
   `seo.ts` ya declaraba `es_CO` como locale alternativo, el copy de
   quinceañeras dice textualmente que se trabaja de forma bilingüe y Colombia
   tiene página propia — escrita en inglés. De catorce páginas indexables,
   cero estaban en español y no había una sola etiqueta `hreflang`.

   «Fotógrafo de quinceañeras en Utah» y «fotografía gastronómica Bogotá» son
   búsquedas distintas de sus equivalentes en inglés, con menos competencia y
   más intención de compra. El sitio no podía aparecer en ninguna.

   ── DOS REGLAS QUE ESTE ARCHIVO SIGUE ──────────────────────────────────────
   1. Está ESCRITO, no traducido. Una traducción literal del inglés produce
      páginas que Google reconoce como duplicados traducidos y que un lector
      nativo abandona. Los títulos, los leads y las meta descriptions se
      redactaron desde cero contra los términos que se buscan en español.

   2. No dice nada que el sitio en inglés no diga ya. Ningún cliente nuevo,
      ningún precio, ninguna promesa que no esté en `site.ts`. Si un hecho no
      está allí, tampoco está acá.

   ⚠️  ESTE COPY NECESITA REVISIÓN DEL ESTUDIO ANTES DE PUBLICARSE. Está escrito
       en un español neutro que funciona en Utah y en Bogotá, pero el estudio es
       colombiano y sabe cómo habla su clientela mejor que yo. Léanlo y edítenlo
       acá; es el único lugar donde vive.
   ========================================================================= */

import { PENDING } from './site';

/** El segmento `/es/` y los slugs por página. Cambiarlos rompe URLs vivas. */
export const ES_PREFIX = '/es';

export interface EsSection {
  dir: string;
  title: string;
  titleAlt: string;
  kicker: string;
  lead: string;
}

export interface EsCategory {
  /** Slug en español, bajo /es/trabajo/. Cargado de término de búsqueda. */
  slug: string;
  name: string;
  short: string;
  lead: string;
  metaDescription: string;
  title: string;
  body: string[];
  sections?: EsSection[];
}

/**
 * Las cinco categorías, en español.
 *
 * Los slugs no son transliteraciones del inglés: son el término que la gente
 * escribe. Por eso `15th-birthday` es `fotografia-de-quinceanera` — la palabra
 * que se busca, en los dos mercados del estudio, es «quinceañera».
 *
 * Sin eñe ni tildes en el slug a propósito. Una URL con caracteres acentuados
 * se percent-encodea al copiarse y termina ilegible en un mensaje de WhatsApp,
 * que es exactamente por donde se comparte este trabajo.
 */
export const esCategories: Record<string, EsCategory> = {
  'social-media': {
    slug: 'contenido-para-redes-sociales',
    name: 'Contenido para redes sociales',
    short: 'Redes sociales',
    title: 'Contenido para Redes Sociales | JP Media Groups',
    lead: 'Contenido hecho para durar: video vertical, fotos y campañas que siguen rindiendo después del día del lanzamiento.',
    metaDescription:
      'Producción de contenido para redes sociales. Video vertical, fotografía y campañas para marcas, restaurantes y artistas en Estados Unidos y Colombia.',
    body: [
      'Redes es la única disciplina donde una sola foto excelente vale menos que treinta buenas que llegan a tiempo. El trabajo está armado alrededor de eso: un día de rodaje produce un mes de contenido, no una publicación.',
      'Video vertical, fotos, cortes y los textos que los acompañan, formateados para donde de verdad van a salir — no recortados de algo que se hizo para otra pantalla.',
    ],
  },

  food: {
    slug: 'fotografia-gastronomica',
    name: 'Fotografía gastronómica',
    short: 'Gastronomía',
    title: 'Fotografía Gastronómica y de Restaurantes | JP Media Groups',
    lead: 'Fotografía de comida hecha para vender: del menú de degustación a la vitrina de una hamburguesería.',
    metaDescription:
      'Fotografía gastronómica y de restaurantes. Alta cocina, emplatados, menús y fotos para apps de domicilios en Utah, Miami y Colombia.',
    body: [
      'Un plato tiene alrededor de un segundo para hacer su trabajo en una app de domicilios, y más o menos lo mismo en una carta. La fotografía de comida es un oficio comercial antes que estético: la foto logra que alguien pida, o no lo logra.',
      'Se fotografía en el lugar, con la cocina emplatando como emplata para un cliente. La idea no es un plato producido que llega distinto a la mesa: es el real, iluminado para que se vea como lo que el cocinero ya hizo.',
      'Dos cocinas, dos trabajos. Un menú de degustación se fotografía para el salón donde se sirve; una hamburguesa se fotografía para una pantalla de celular a las once de la noche. Se iluminan, se encuadran y se colorizan distinto a propósito, y por eso la galería está en dos partes.',
    ],
    sections: [
      {
        dir: '01-fine-dining',
        title: 'Comida elegante',
        titleAlt: 'Fine dining',
        kicker: 'Capítulo 01',
        lead: 'Platos emplatados, menús de degustación y la cerámica en la que llegan. Para restaurantes que venden un salón, no solo un plato.',
      },
      {
        dir: '02-fast-casual',
        title: 'Comida rápida',
        titleAlt: 'Fast & casual',
        kicker: 'Capítulo 02',
        lead: 'Hamburguesas, sándwiches y comida de mostrador, iluminados para la app de domicilios, la carta y la vitrina. El antojo primero.',
      },
    ],
  },

  bodas: {
    slug: 'fotografia-de-bodas',
    name: 'Fotografía de bodas',
    short: 'Bodas',
    title: 'Fotografía de Bodas | JP Media Groups',
    lead: 'Bodas fotografiadas como de verdad pasaron: el salón, la luz, la gente y el medio segundo que nadie posó.',
    metaDescription:
      'Fotografía de bodas en Utah, California, Florida, Nueva York y Colombia. Cobertura de ceremonia, retratos y fiesta, en español y en inglés.',
    body: [
      'Una boda es el único trabajo que no se puede repetir. No hay segunda toma de los votos y no se vuelve atrás por la luz de las seis. Por eso el día se planea antes de empezar, y por eso nunca hay una sola cámara en el salón.',
      'La cobertura va desde los preparativos hasta la fiesta: la ceremonia, los retratos, los detalles que costaron meses de decidir, y las horas después de la cena cuando la gente se olvida de que hay un fotógrafo. De ahí suelen salir las fotos que la familia se queda.',
      'Se trabaja en español y en inglés. En una boda familiar eso no es una comodidad: hablarle a la gente en su idioma es la diferencia entre una foto posada y una real.',
    ],
  },

  photos: {
    slug: 'fotografia-corporativa',
    name: 'Fotografía corporativa',
    short: 'Corporativa',
    title: 'Fotografía Corporativa y de Marca | JP Media Groups',
    lead: 'Fotografía corporativa, de marca y de retrato para empresas que necesitan verse creíbles.',
    metaDescription:
      'Fotografía corporativa, de producto y de marca para empresas en Estados Unidos y Colombia. Retratos de equipo, prensa y catálogo, listos para usar.',
    body: [
      'Las fotos con las que funciona una empresa: la página del equipo, la foto de prensa, el producto contra un fondo limpio, el fundador que necesita un buen retrato en vez de una foto recortada de la boda de otro.',
      'Todo se fotografía para ser usado, lo que significa que se entrega en los recortes y tamaños que la web, la presentación y las redes de verdad necesitan — no como una carpeta de archivos crudos que después alguien tiene que resolver.',
    ],
  },

  '15th-birthday': {
    slug: 'fotografia-de-quinceanera',
    name: 'Fotografía de quinceañera',
    short: 'Quinceañera',
    title: 'Fotografía de Quinceañeras | JP Media Groups',
    lead: 'Quinceañeras fotografiadas como el evento que son: el vestido, el vals, la familia y las horas que nadie planea.',
    metaDescription:
      'Fotografía de quinceañeras en Utah, California, Florida, Nueva York y Colombia. Sesión de retrato, ceremonia y fiesta, con equipo bilingüe.',
    body: [
      'Una quinceañera son dos trabajos en uno: una sesión de retrato armada por completo alrededor de la quinceañera y el vestido, y después una fiesta que ocurre una sola vez. Se fotografían distinto a propósito — la primera se dirige, la segunda se deja en paz.',
      'La cobertura va toda la noche: la entrada, el vals, el brindis, el cambio de zapatos, y la parte después de los formalismos, cuando el salón por fin se relaja. Esa última hora suele ser de donde salen las fotos que la familia se queda.',
      'Se trabaja en español, que acá pesa más que en cualquier otra categoría: la gente que se está fotografiando es familia, y que les hablen en su idioma es la diferencia entre una foto posada y una real.',
    ],
  },
};

/** La página /es/trabajo/. */
export const esWork = {
  title: 'Portafolio — Fotografía y Video | JP Media Groups',
  metaDescription:
    'Portafolio de JP Media Groups: fotografía de bodas, quinceañeras, gastronómica y corporativa, y contenido para redes sociales.',
  crumb: 'Trabajo',
  h1: ['Bodas, comida,', 'quinceañeras', 'y marcas'],
  lead: 'Nueve años de fotografía, cine y diseño en Estados Unidos y Colombia. Elige una disciplina.',
  label: ['Trabajo seleccionado', 'Portafolio'],
  driveCta: 'Portafolio completo en Drive',
};

/** La home en español. */
export const esHome = {
  title: 'Fotografía, Video y Marketing | JP Media Groups',
  metaDescription:
    'Agencia creativa de producción audiovisual, fotografía profesional, videos musicales y marketing. Nueve años de trabajo en Colombia y Estados Unidos.',
  heroLabel: ['Agencia creativa', 'Desde 2016'],
  heroLines: [
    { text: 'Haz crecer', accent: false },
    { text: 'tu negocio con', accent: false },
    { text: 'fotografía', accent: true },
    { text: '+ marketing', accent: true },
  ],
  heroKicker: 'Que de verdad funciona',
  primaryCta: { label: 'Empezar un proyecto', href: '/es/contacto/' },
  secondaryCta: { label: 'Ver el portafolio', href: '/es/trabajo/' },

  aboutLabel: ['Quiénes somos', 'Estudio'],
  aboutTitleLines: ['Toda marca tiene', 'una historia que', 'vale contarse'],
  aboutBody: [
    'En JP Media Groups somos una agencia creativa especializada en producción audiovisual, fotografía profesional, videos musicales, branding y marketing estratégico. Con más de nueve años de experiencia, ayudamos a empresas, restaurantes, marcas, emprendedores y artistas a llevar su visión a algo concreto.',
    'Hemos producido videos musicales, producciones comerciales, campañas publicitarias, contenido para redes, fotografía corporativa y fotografía gastronómica para clientes de industrias muy distintas. Cada proyecto se trabaja con criterio, atención al detalle y la intención de que sirva para algo.',
    'El portafolio incluye colaboraciones con artistas, restaurantes, negocios y agencias de marketing en Colombia y Estados Unidos, con proyectos en Miami, Nueva York, Los Ángeles y Utah.',
  ],
  aboutMission:
    'Nuestra misión es simple: que las marcas se destaquen, conecten con su público y crezcan, a través de narrativa visual y marketing con estrategia detrás.',
  aboutCloser:
    'No solo hacemos contenido: construimos marcas y entregamos resultados.',
  aboutAccentLine: 2,
  aboutStats: [
    { value: '9+', label: 'Años' },
    { value: '2', label: 'Países' },
    { value: '4', label: 'Ciudades' },
    { value: '5', label: 'Disciplinas' },
  ],

  servicesLabel: ['Qué hacemos', 'Cinco disciplinas'],
  servicesTitleLines: ['Del concepto', 'a la entrega final'],
  services: [
    {
      title: 'Producción audiovisual',
      body: 'Producciones comerciales y campañas publicitarias, de punta a punta: concepto, rodaje, post y entrega.',
    },
    {
      title: 'Fotografía profesional',
      body: 'Fotografía corporativa y gastronómica para restaurantes, marcas y negocios que necesitan verse creíbles.',
    },
    {
      title: 'Videos musicales',
      body: 'Videos musicales de alto nivel para artistas que trabajan en Colombia y Estados Unidos.',
    },
    {
      title: 'Branding',
      body: 'Identidad visual que se sostiene en todos los lugares donde aparece la marca, no solo en la hoja del logo.',
    },
    {
      title: 'Marketing estratégico',
      body: 'Contenido y campañas para redes, armados para hacer crecer el negocio y no solo el número de seguidores.',
    },
  ],

  workLabel: ['Trabajo seleccionado', 'Portafolio'],
  workTitle: 'El trabajo',
  workCta: 'Ver todo el trabajo',
};

/** La página /es/contacto/. */
export const esContact = {
  status: PENDING,
  title: 'Contacto — Empieza un Proyecto | JP Media Groups',
  metaDescription:
    'Cuéntale tu proyecto a JP Media Groups. Producción de video, fotografía, videos musicales, branding y marketing en Utah, Miami, Nueva York y Colombia.',
  crumb: 'Contacto',
  label: ['Hablemos', 'Contacto'],
  titleLines: ['Cuéntanos', 'el proyecto'],
  form: {
    name: 'Nombre',
    email: 'Email',
    discipline: 'Qué necesitás',
    disciplinePlaceholder: 'Elige una disciplina',
    message: 'Cuéntanos el proyecto',
    submit: 'Enviar',
    sending: 'Enviando…',
    sent: 'Enviado. Te respondemos pronto.',
    error: 'No se pudo enviar. Escríbenos directo a ' /* + contact.email */,
  },
  emailLabel: 'Email',
  phoneLabel: 'Teléfono',
  fromLabel: 'Trabajamos desde',
  disciplinesLabel: 'Disciplinas',
};

/**
 * Las preguntas frecuentes, en español.
 *
 * ⚠️  Google eliminó el rich result de FAQ en mayo de 2026. Esto NO produce el
 *     desplegable en el resultado de búsqueda, y no hay que escribirlo como si
 *     lo fuera. Está por el contenido — «¿trabajan en español?» es una búsqueda
 *     real con intención de compra detrás — y porque `FAQPage` sigue siendo un
 *     tipo válido que leen los sistemas de recuperación detrás de las
 *     respuestas de IA.
 *
 *     Cada respuesta repite algo que el sitio ya dice en otro lado. Ninguna
 *     inventa nada.
 */
export const esFaq = {
  label: ['Antes de escribir', 'Preguntas'],
  title: 'Las que nos hacen siempre',
  items: [
    {
      q: '¿Dónde trabaja JP Media Groups?',
      a: 'En cinco mercados de dos países: Utah, California, Florida y Nueva York en Estados Unidos, y Colombia. Las ciudades que el estudio nombra como propias son Salt Lake City, Los Ángeles, Miami, Nueva York y Bogotá. Viajar fuera de ellas es una cuestión de agenda, no una negativa — pregúntanos.',
    },
    {
      q: '¿Trabajan en español?',
      a: 'Sí. El estudio trabaja en español y en inglés, con el mismo equipo y el mismo estándar en los dos países. En una quinceañera o en una boda familiar eso no es una comodidad: que le hablen a la gente en su idioma es la diferencia entre una foto posada y una real.',
    },
    {
      q: '¿Qué hace el estudio exactamente?',
      a: 'Cinco disciplinas: producción audiovisual, fotografía profesional, videos musicales, branding y marketing estratégico. La mayoría de los proyectos usa más de una — un restaurante que contrata fotografía de comida casi siempre necesita el contenido de redes que corre encima.',
    },
    {
      q: '¿Qué incluye la cobertura de una boda?',
      a: 'Desde los preparativos hasta la fiesta: la ceremonia, los retratos, los detalles que costaron meses de decidir, y las horas después de la cena cuando la gente se olvida de que hay un fotógrafo. Nunca hay una sola cámara en el salón, porque una boda es el único trabajo que no se puede repetir.',
    },
    {
      q: '¿Cómo se entregan las fotos?',
      a: 'En los recortes y tamaños que la web, la presentación y las redes de verdad necesitan — no como una carpeta de archivos crudos que después alguien tiene que resolver. Todo se fotografía para ser usado.',
    },
    {
      q: '¿Puedo ver más trabajo del que está en la web?',
      a: 'Sí. El sitio lleva una selección de alrededor de dos docenas de fotos por categoría; el archivo completo son cientos de tomas y vive en Google Drive. Cada página de categoría enlaza ahí, y el índice del portafolio también.',
    },
    {
      q: '¿Hace cuánto trabaja el estudio?',
      a: 'JP Media Groups se fundó en 2016 — más de nueve años de trabajo en Colombia y Estados Unidos, para artistas, restaurantes, negocios y agencias de marketing.',
    },
  ],
};

/** El chrome compartido: navegación, pie, botones. */
export const esUi = {
  nav: [
    { label: 'Estudio', href: '/es/#about' },
    { label: 'Trabajo', href: '/es/trabajo/' },
    { label: 'Servicios', href: '/es/#services' },
    { label: 'Contacto', href: '/es/contacto/' },
  ],
  home: 'Inicio',
  skipLink: 'Saltar al contenido',
  searchPlaceholder: 'Buscar en el sitio',
  search: 'Buscar',
  closeSearch: 'Cerrar búsqueda',
  startProject: 'Empezar un proyecto',
  moreWork: 'Más trabajo',
  startAProject: 'Empieza un proyecto',
  tellUsAboutIt: 'Cuéntanos',
  fullGallery: 'La galería completa',
  fullPortfolio: 'Ver el portafolio completo',
  photographs: 'fotografías',
  pieces: 'piezas',
  imageLicensing: 'Licencia de imágenes',
  whereWeWork: 'Dónde trabajamos',
  work: 'Trabajo',
  marketingIn: 'Marketing y fotografía en',
  openImage: 'Abrir imagen',
  of: 'de',
  previousImage: 'Imagen anterior',
  nextImage: 'Imagen siguiente',
  close: 'Cerrar',
  imageViewer: 'visor de imágenes',
  breadcrumb: 'Ruta de navegación',
  archiveNote: (n: number, cat: string) =>
    `${n} acá. El archivo completo de ${cat} vive en Drive.`,
};
