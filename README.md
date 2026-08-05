# JP Media Groups — Astro

Sitio de JP Media Groups: agencia creativa de producción audiovisual,
fotografía profesional, videoclips, branding y marketing estratégico.

Sustituye a la landing de WordPress. **No conserva su diseño**: el sitio
anterior era el tema *Integro* de AncoraThemes con el contenido de demo casi
intacto, así que la migración se rehízo con identidad propia, partiendo del
logo real del cliente.

- Auditoría del WordPress original: [`docs/audit-wordpress.md`](docs/audit-wordpress.md)
- Fotos del equipo: [`src/assets/team/README.md`](src/assets/team/README.md)

---

## Arranque rápido

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro build + índice de Pagefind
npm run preview    # sirve dist/ tal y como se desplegará
npm run assets     # regenera las imágenes abstractas
```

> **El buscador solo funciona sobre el build.** Pagefind genera el índice a
> partir del HTML de `dist/`. En `npm run dev` el overlay se abre y responde,
> pero cae en el estado *error* con un mensaje que lo explica.

---

## Dirección de diseño — "Salt & Signal"

La página está colgada **como una pared de galería**: clara, espaciada, con el
color racionado para que la fotografía del cliente sea lo único que grita.

### Color

Los acentos no están inventados. Están muestreados píxel a píxel del degradado
del logo real:

```
#2C6FC6  →  #2092E1  →  #34B4D7  →  #A0E36B
 abyss       signal       cyan        verde
```

Los neutros vienen de las salinas: un off-white mineral y frío, no un crema,
para que la identidad azul-verde se mantenga limpia encima.

| Token | Hex | Uso |
|---|---|---|
| `salt` | `#EDEFEC` | Fondo de página |
| `chalk` | `#FAFBF9` | Superficies elevadas |
| `ink` | `#12232B` | Texto y bandas invertidas |
| `muted` | `#5C6B66` | Texto secundario — 4.9:1 sobre salt |
| `signal-deep` | `#0F6BAE` | Enlaces sobre claro — 4.6:1 |
| `verde` | `#A0E36B` | Acento sobre oscuro |
| `counter` | `#D9576B` | Contraacento. Aparece dos veces en toda la página |

**Una regla que conviene conocer: azul sobre claro, verde sobre oscuro.**
`verde` tiene ~1.4:1 de contraste sobre `salt` y ~9:1 sobre `ink`, así que solo
vive en las bandas oscuras. Es el mismo viaje que hace el logo, de azul profundo
a verde brillante.

### Tipografía

| Rol | Familia | Por qué |
|---|---|---|
| Display | **Syne** 700/800 | Dibujada para un centro de arte. Ancha, con carácter, y nada que ver con la Bebas Neue condensada del tema |
| Cuerpo | **Archivo** 300–700 | Neutra y legible, deja hablar a la display |
| Utilidad | **DM Mono** 400 | Solo etiquetas y datos, donde una mono hace trabajo real |

### La firma: la etiqueta de museo

Una galería cuelga cada obra con una cartela: qué es, de qué medio, de dónde.
Este estudio trabaja en cinco disciplinas y cuatro ciudades, así que cada bloque
de la página lleva la suya, en mono.

**No van numeradas.** Las secciones no son una secuencia, y numerarlas sería un
recurso fingiendo que transporta información.

El otro elemento recurrente es el **trazo de marca**: el degradado del logo,
usado como filete que se dibuja bajo los enlaces, bajo los campos de formulario
y a lo ancho de la cabecera como indicador de lectura. El logo es un trazo
continuo; la página usa el mismo gesto en todas partes.

---

## Estructura

```
src/
├── assets/
│   ├── images/     logo-lockup · logo-lockup-inverse · logo-mark
│   ├── plates/     5 campos de color generados por scripts/
│   ├── icons/      6 SVG propios
│   └── team/       ← suelta aquí los retratos
├── components/
│   ├── WallLabel.astro      ← la firma
│   ├── Header · Footer · Icon
│   ├── SearchOverlay.tsx    ← la única isla (Preact)
│   └── sections/   Hero · Marquee · About · Services · Work ·
│                   Team · Testimonial · Plans · Newsletter
├── content/site.ts          todo el copy, REAL vs PENDING
├── lib/            motion.ts · images.ts · env.ts
├── pages/          index · contact · 404
└── styles/         theme.css ← los tokens (= tailwind.config)
                    ui.css · search.css · global.css
```

### Dónde está el `tailwind.config`

En Tailwind 4 la configuración vive en CSS. **`src/styles/theme.css` es el
`tailwind.config` de este proyecto.** No existe `tailwind.config.ts` porque
sería un archivo vacío al lado del que de verdad configura el proyecto.

---

## Imágenes: cero licencias de terceros

Todas las imágenes del tema se eliminaron. Lo que queda:

- **El logo real del cliente** — tres variantes, ver más abajo.
- **Cinco "plates"**: campos de color abstractos generados en
  [`scripts/generate-assets.mjs`](scripts/generate-assets.mjs) a partir del
  degradado del logo, con dos octavas de ruido de valor y grano de película.
  Cada píxel se calcula en el repo, así que no hay nada licenciado de nadie.
  Se leen como color abstracto, no como fotografía falsa, y sostienen el layout
  hasta que llegue el trabajo real.

`npm run assets` los regenera. El generador es determinista (semilla fija), así
que dos ejecuciones dan el mismo resultado.

---

## ⚠️ El logo que servía la web NO era de JP Media Groups

`new-logo-white-global.png`, el archivo que `jpmediagroups.com` sirve hoy como
logo, es el wordmark **INTEGRO** — el logo del tema de AncoraThemes. La web en
vivo lleva la marca del tema en la cabecera y en los dos pies de página.

El logo real sí estaba subido al WordPress, con nombres de exportación de
Illustrator. Recuperado y renombrado:

| Antes | Ahora | Qué es |
|---|---|---|
| `Recurso-8.png` | `logo-lockup.png` | Logo completo, texto oscuro — **para fondo claro** |
| `Recurso-9.png` | `logo-lockup-inverse.png` | Versión para fondo oscuro |
| `Recurso-10.png` | `logo-mark.png` | Solo el isotipo JP |

Conviene pedir al cliente los **originales vectoriales (SVG o AI)**: lo que hay
son PNG y el lockup se usa a tamaños pequeños en la cabecera.

---

## Rendimiento

Medido sobre el build de producción, gzip:

| | Medido | Objetivo |
|---|---|---|
| **JS inicial en `/`** | **56.5 KB gz** | < 100 KB |
| CSS | 11.0 KB gz | — |
| HTML de la home | 10.6 KB gz | — |
| Fuentes | 82.4 KB (3 archivos) | — |
| Plates | 138 KB (5 archivos, WebP) | — |

De referencia: el WordPress carga **65 hojas de estilo y 27 scripts**, con
jQuery + Elementor + Slider Revolution. Solo `plugins.css` pesa 1.35 MB.

Decisiones que sostienen el presupuesto: fuentes self-hosted en subset `latin`
(Syne y Archivo son variables, una familia = un archivo), iconos SVG inline
—se eliminan las 5 webfonts de iconos del original—, una sola isla (Preact,
~4 KB gz, con `client:idle`), y Pagefind cargado bajo demanda al abrir el
buscador.

**El LCP no está medido en un navegador real**: este entorno no tiene uno. Pasa
Lighthouse sobre el dominio ya desplegado antes de dar el visto bueno.

---

## Movimiento

Todo en [`src/lib/motion.ts`](src/lib/motion.ts), con tres reglas:

1. **Los estados ocultos los pone JS, nunca el CSS.** Si el módulo falla, la
   página se ve completa. Nada queda atrapado en invisible.
2. **`prefers-reduced-motion` sale antes de crear un solo tween.** La
   alternativa estática es la página terminada, no una degradada.
3. **Las curvas salen de tokens.** `ease-in-out` no aparece en ningún sitio.

La curva base, `cubic-bezier(.65, 0, .35, 1)`, se midió del WordPress original
—era el easing de su galería— y se conservó: es lo único del sitio viejo que
valía la pena heredar.

### Catálogo

| Efecto | Dónde |
|---|---|
| **Cortina de entrada** | Panel oscuro con el logo y el trazo de marca dibujándose; se levanta y entrega directamente al hero. Una vez por sesión |
| **Recorrido fijado** | La sección de equipo se ancla y los retratos se desplazan lateralmente con el scroll |
| **Corte de banda** | Las bandas oscuras se abren desde su línea central |
| **Cartelas que decodifican** | Las etiquetas mono se resuelven carácter a carácter |
| **Foco que sigue al puntero** | Luz de marca sobre las bandas oscuras |
| **Inclinación por velocidad** | El contenido se inclina con la velocidad de scroll (máx. 3°) y se asienta al parar |
| **Placas flotantes** | Campos de color a la deriva detrás de las secciones claras |
| Reveal por carácter | Titular del hero |
| Reveals con clip-path y máscara de línea | Titulares e imágenes |
| Parallax por capas | En móvil se reduce al 45 %, no se apaga |
| Marquee | Acelera y se inclina con la velocidad de scroll |
| Trazo de marca | Indicador de lectura en la cabecera |
| Barrido de luz | Retratos del equipo y tarjetas |
| Atracción magnética | Botones — nunca en táctil |

**La cortina tiene red de seguridad**: el script en línea que la activa arma
también un temporizador que la retira a los 3.2 s pase lo que pase. Si el módulo
de animación no llegara a cargar, la página no se queda detrás de un panel negro.

### Encuadre de los retratos

Las fotos del equipo vienen de sesiones distintas y con recortes distintos —
una es plano entero a 0.56 de proporción, el resto son primeros planos sobre
0.67 — y todas caen en el mismo marco. Por eso cada persona declara su
`object-position` en el campo `focus` de
[`src/content/site.ts`](src/content/site.ts). Si algún encuadre no te convence,
se ajusta ahí y nada más.

---

## Accesibilidad

- Skip link como primera parada de tabulación; foco visible siempre (el anillo
  cambia a verde sobre las bandas oscuras).
- Overlays con `role="dialog"`, `aria-modal`, trampa de foco, `Escape` y
  devolución del foco.
- La galería de trabajo y la lista de servicios responden **también al teclado**:
  el foco activa la tarjeta, y el control de la galería es un `<button>` con
  `aria-expanded`.
- El titular del hero se parte en caracteres, así que la versión visual se oculta
  a lectores de pantalla y la frase se expone limpia aparte.
- Jerarquía de encabezados sin saltos, verificada sobre el HTML generado.
- `prefers-reduced-motion` entrega la página completa y quieta.

---

## Contenido pendiente

Marcado con `data-placeholder`, que en `astro dev` dibuja un contorno magenta
con la etiqueta **PENDIENTE**. En producción es inerte.

- [ ] **Equipo** — nombres, roles y bios de las 4 personas + los 4 retratos.
      Ver [`src/assets/team/README.md`](src/assets/team/README.md).
- [ ] **Trabajo** — 5 huecos listos. Cada caso necesita imagen, título,
      disciplina y ciudad.
- [ ] **Testimonio** — una frase de un cliente real, con nombre y empresa.
- [ ] **Paquetes** — los tres tienen estructura y descripción; faltan precios.
- [ ] **Contacto** — email y teléfono. Los que había eran de demo del tema
      (`info@example.com`, `+1 840 841 25 69`) y una dirección en Nueva York.
- [ ] **Logo vectorial** — ver arriba.
- [ ] **Titular del hero** — dice *"Grow your Utah business"*, pero el "Who We
      Are" que enviaste describe trabajo en Miami, Nueva York, Los Ángeles y
      Colombia. Se mantuvo el titular en vivo tal cual y el alcance real se
      declara en la cartela de al lado, pero vale la pena alinearlos.

### Lo que sí es contenido real

El texto **Who We Are** completo, las cinco disciplinas, los nueve años, las
cuatro ciudades, los dos países, el Instagram y el titular del hero.

---

## Formularios

Ninguno tiene backend: el original usaba MetForm, un plugin de WordPress. La
validación y los estados de error **ya están escritos**; solo falta apuntar el
`action`:

- **Contacto** — `src/pages/contact.astro`, `<form data-contact action="#">`
- **Newsletter** — `src/components/sections/Newsletter.astro`

Opciones sin servidor: Formspree, Netlify Forms, Web3Forms o un Worker de
Cloudflare. Mientras `action` siga en `#`, ambos muestran *"endpoint not
configured yet"* en vez de fingir que envían.

---

## Despliegue

```bash
npm run build     # genera dist/ + dist/pagefind/
```

**Usa `npm run build`, no `astro build`**: el script encadena
`pagefind --site dist`. Si te saltas ese paso, el buscador se despliega sin
índice.

| Host | Build command | Publish directory |
|---|---|---|
| Netlify | `npm run build` | `dist` |
| Vercel | `npm run build` | `dist` |
| Cloudflare Pages | `npm run build` | `dist` |

Ajusta `site` en [`astro.config.mjs`](astro.config.mjs) si el dominio final no
es `https://jpmediagroups.com` — de ahí salen las canónicas y las Open Graph.

**Nota sobre el dominio actual:** `jpmediagroups.com` está detrás de **Sucuri
Firewall**, que devuelve un interstitial con challenge JS a cualquier petición
sin cookie. Si el sitio nuevo se publica ahí, revisa que el firewall no bloquee
el despliegue ni a los bots de indexación.

---

## Alcance

**Migrado:** la home completa, `/contact/` y una 404.

**Por qué solo eso:** se auditaron las 7 páginas internas del menú (about-us,
our-services, contact-us, our-team, faqs, pricing, get-a-quote) y **ninguna
contenía contenido del cliente** — cero menciones de JP Media Groups,
fotografía o sus ciudades. "About Us" hablaba de *"A Multifaceted AI Network
Fostering Innovation"*. Eran páginas de demo del tema sin tocar.

**Eliminado en el rediseño:** la sección Workflow, los logos de clientes de
demo, el testimonio de "Regina Moore", el portfolio con Cartier e Iherb, los
precios inventados, la dirección de Nueva York, el crédito "AncoraThemes ©
2026", los tres perfiles sociales del autor del tema, las 5 webfonts de iconos y
las 26 imágenes con sufijo `-copyright`.

**Fuera de alcance:** WooCommerce (shop, cart, checkout, wishlist) necesita un
backend de comercio aparte.
