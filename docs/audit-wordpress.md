# Auditoría — jpmediagroups.com (WordPress) → Astro

> **Estado:** este documento describe el sitio de WordPress **tal y como estaba**.
> Sigue siendo la referencia de qué había y de dónde salió cada dato, pero el
> proyecto ya **no** conserva su identidad visual: se rehízo con paleta,
> tipografía y estructura propias. Ver el README para la dirección actual.
>
> **Dos hallazgos posteriores a esta auditoría, importantes:**
>
> 1. El archivo que la web sirve como logo (`new-logo-white-global.png`) es el
>    wordmark **INTEGRO**, el logo del tema. El logo real de JP Media Groups
>    estaba subido con nombres de exportación de Illustrator (`Recurso-8/9/10`).
> 2. Del degradado de ese logo real salen los colores de marca:
>    `#2C6FC6 → #2092E1 → #34B4D7 → #A0E36B`. La paleta oscura documentada en
>    §3 es la del tema Integro, no la del cliente.

Fecha: 2026-08-04
Fuente: HTML renderizado de `https://jpmediagroups.com/` + CSS/JS del tema, obtenidos
resolviendo el challenge JS del firewall Sucuri que protege el dominio.

---

## 0. Cómo se obtuvo (y qué NO se pudo inspeccionar)

El dominio está detrás de **Sucuri Firewall**: cualquier petición sin cookie recibe un
interstitial de 11 KB ("One moment, please…") con un challenge JS ofuscado. Se resolvió
ejecutando ese script en un DOM falso para extraer la cookie `wssplashchk`, y con ella se
descargaron el HTML real (270 KB) y las hojas de estilo del tema.

**No verificado — declarado, no asumido:**

- **No hay render visual.** No hay navegador headless en este entorno, así que no hay
  capturas. Todo lo de abajo sale del HTML y del CSS, no de ver la página.
- **Feature "texto con brillo en hover que se mueve"**: hay dos candidatos en el CSS y sin
  ver la página no puedo confirmar cuál es. Ver §6.4.
- **Slider Revolution (hero)**: el contenido se arma por JS desde atributos `data-frame_*`.
  Se extrajo el copy y el timing base, pero la coreografía completa de cada capa no se
  reconstruyó al 100%.
- **Solo se auditó la home.** El menú enlaza ~50 URLs más (about, services, portfolio, blog,
  shop, cart, checkout, wishlist) que no se inspeccionaron.
- **Sin acceso al admin de WordPress**, así que no hay export de contenido, ni originales de
  imagen, ni la config de los widgets.

---

## 1. Stack actual

| Capa | Detalle |
|---|---|
| CMS | WordPress 6.9.1 |
| Page builder | Elementor 3.35.6 |
| Tema | **Integro** (AncoraThemes) + child theme `integro-child` |
| Framework del tema | `trx_addons` + addon `qw-extension` |
| Hero | Slider Revolution 6.7.57 |
| Comercio | WooCommerce 10.8.1 + TI WooCommerce Wishlist |
| Otros | Instagram Feed (Smash Balloon), Advanced Popups, MetForm, Header Footer Elementor |
| Animación existente | GSAP 3.12.2 (ya lo carga el tema) |
| Esquema de color activo | `scheme_marketing-dark` (clase en `<body>`) |

**Coste actual:** 65 hojas de estilo + 27 scripts, con jQuery + jQuery Migrate + Elementor
frontend + Slider Revolution. `plugins.css` por sí solo pesa 1.35 MB sin comprimir y
`trx_addons/css/__styles.css` 397 KB. Es exactamente el peso que la migración elimina.

---

## 2. Tipografía

Dos familias, ambas desde Google Fonts, ambas con `display=swap`.

- **Bebas Neue** — 400 (único peso real). Todos los títulos, botones, menú y logo.
- **Roboto** — 100/300/400/500/700/900 + itálicas. Body, inputs, submenús.
- *Roboto Slab* se encola pero no se usa en ninguna declaración.

### Escala exacta (de `--theme-font-*`, base `1rem`)

| Rol | Familia | Tamaño | Peso | Line-height | Tracking | Transform |
|---|---|---|---|---|---|---|
| h1 | Bebas Neue | 3.353em | 400 | 1em | 0px | uppercase |
| h2 | Bebas Neue | 2.765em | 400 | 1.021em | 0.75px | uppercase |
| h3 | Bebas Neue | 2.059em | 400 | 1.086em | 0.5px | uppercase |
| h4 | Bebas Neue | 1.647em | 400 | 1.214em | 0.55px | uppercase |
| h5 | Bebas Neue | 1.412em | 400 | 1.208em | 0.58px | uppercase |
| h6 | Bebas Neue | 1.118em | 400 | 1.474em | 0.35px | uppercase |
| p | Roboto | 1rem | 400 | 1.7em | 0px | none |
| button | Bebas Neue | 18px | 400 | 22px | 0px | uppercase |
| menu | Bebas Neue | 18px | 400 | 1.5em | 0px | uppercase |
| submenu | Roboto | 14px | 400 | 1.5em | 0px | none |
| input | Roboto | 14px | 400 | 1.5em | 0px | none |
| info | inherit | 13px | 400 | 1.5em | 0px | none |
| logo | Bebas Neue | 1.5em | 400 | 1.25em | 0px | none |

Márgenes verticales por nivel (se conservan): h1 `1.14em / 0.38em`, h2 `0.84em / 0.4em`,
h3 `1.18em / 0.55em`, h4 `1.45em / 0.58em`, h5 `1.57em / 0.75em`, h6 `2.4em / 1.1em`,
p `0 / 1.8em`.

---

## 3. Paleta completa (`scheme_marketing-dark`)

Concepto oscuro con acentos **lima ácido + magenta + violeta**. No se corrigen.

### Superficies
| Token | Hex | Uso |
|---|---|---|
| `bg_color` | `#151414` | Fondo base |
| `alter_bg_color` | `#242222` | Superficie alterna |
| `alter_bg_hover` | `#2E2D2D` | Hover de superficie |
| `extra_bg_color` | `#231F1F` | Superficie extra |
| `bd_color` / `alter_bd_color` | `#3E3E3E` | Bordes |
| `alter_bd_hover` | `#5B5B5A` | Borde hover |

### Texto
| Token | Hex |
|---|---|
| `text` | `#CCCCCC` |
| `text_light` | `#A2A2A2` |
| `text_dark` | `#FFFFFF` |

### Acentos (los tres pares link/hover)
| Token | Hex | Nota |
|---|---|---|
| `text_link` | `#97B100` | **Lima ácido — acento primario** |
| `text_hover` | `#ACC903` | Hover del primario |
| `text_link2` | `#DE60CA` | **Magenta — acento secundario** |
| `text_hover2` | `#C22BAA` | Hover del secundario |
| `text_link3` | `#9476EC` | **Violeta — acento terciario** |
| `text_hover3` | `#704CDB` | Hover del terciario |
| `text_link_blend` | `#9CBD0A` | Variante de mezcla del lima |

### Inverso / inputs
`inverse_text` `#FFFFFF` · `inverse_dark` `#231F1F` · `inverse_bd_color` `#A2A2A2` ·
`input_bd_color` `#3E3E3E` · `input_bd_hover` `#FFFFFF` · `input_text` `#CCCCCC` ·
fondo de input transparente.

### Alphas usados por el tema (se replican como tokens)
`bg_color` al 0 / .2 / .7 / .8 / .9 · `alter_bg_color` al 0 / .2 / .4 / .7 ·
`text_dark` (blanco) al .03 / .05 / .08 / .15 / .2 / .3 / .5 / .7 / .8 ·
`text_link` (lima) al .07 / .2 / .3 / .4 / .5 / .7 ·
`text_link2` (magenta) al .07 / .2 / .3 / .5 / .8 ·
`text_link3` (violeta) al .07 / .2 / .3.

> Los `#ff6900`, `#0693e3`, `#9b51e0` etc. del HTML son la paleta por defecto del editor de
> bloques de WordPress. **No son marca** y no se migran.

---

## 4. Inventario de secciones (orden real del DOM)

1. **Header sticky** (`header_position_over`, sobre el hero) — logo, menú horizontal
   (`menu_hover_zoom_line`), buscador, icono extra.
2. **Header móvil** — logo, buscador, botón burger; el panel lateral incluye
   `Have a Project? / info@website.com`, `Want to Work With Us? / Send Brief`,
   `Want to see what we do? / View Portfolio` y los 4 iconos sociales.
3. **Hero — Slider Revolution** + 4 imágenes en `position:absolute` con
   `_animation: fadeIn` y delays 500/1000/1200/1300 ms.
   Copy: *"Grow Your Utah / business with / Photography + Marketing / That Actually Works"*.
4. **Spacer**
5. **Intro** — eyebrow `What We do` + h1
   *"Marketing & Photography Services for Utah Businesses"*.
6. **Bloque testimonio/CEO** — texto, imagen, `Regina Moore / CEO director`, 2 bloques de texto.
7. **Expertise** — `trx_sc_services` variante `sc_services_fashion`, `color_style_link3`
   (violeta), 4 columnas: `01. Project management`, `02. Design`, `03. Development`,
   `04. Marketing`; cada card con imagen de fondo y subtítulo `Our expertise`.
8. **Why JP Media Groups** — párrafo real del cliente + `From Salt Lake City to Provo,`.
9. **Portfolio "our cases"** — h1 `Completed projects`, widget `sc_portfolio_qw-case`
   con 5 items (Packaging design, Cyber games, Digital lenses, Iherb, Cartier).
10. **Sección con imagen en parallax** (`--trx-addons-parallax-*`).
11. **Sección con marquee de fondo** — `bg_text: "Your Startup Adventure Begins"`,
    velocidad 11, sin efecto.
12. **Pricing "our Plans"** — h1 `Completed projects` (sic, repetido), 3 planes:
    Silver `$55.55`, Gold `$75.75`, Bronze `$30.50`, todos "Per month" + botón `Get Now`.
13. **Workflow** — eyebrow `our workflow`, h1 *"This is how we approach every single
    project"*, widget `sc_services_qw-nodes` con timeline de 7 pasos: Introduction,
    Strategy & intake, Meeting, Goals & KPI, Scope of work, Ad types, Budget outline.
14. **Imágenes decorativas absolutas** (2)
15. **Logos de clientes** — 6 imágenes + h6 `Check our top clients and partners`.
16. **Footer superior** (`scheme_marketing-dark`) — h2 *"Results-driven online marketing
    agency"*, bloque `Address`, sociales, bloque `Say Hello`, teléfono.
17. **Divider**
18. **Footer menú** — Blog / Contacts + copyright.
19. **Footer inferior** — logo, sociales, teléfono, email.
20. **Newsletter** — h2 `Subscribe for the updates!` + shortcode de formulario.

---

## 5. Iconos

Cinco fuentes de iconos conviven. Origen y uso real:

| Set | Origen | Uso en la home |
|---|---|---|
| **Fontello** (custom del tema) | `themes/integro/skins/default/css/font-icons/css/fontello.css` | `icon-facebook-1`, `icon-dribble-new`, `icon-instagram`, `icon-go-serv-1/3/4/5/7/9`, `icon-go-integro-4` |
| **trx_addons icons** | `plugins/trx_addons/css/font-icons/` | `trx_addons_icon-twitter-x`, `trx_addons_icon-menu` |
| Font Awesome 5.15.3 | Elementor (brands, solid) | encolado, sin uso visible en la home |
| eicons 5.34/5.47 | Elementor | interno del builder |
| qw_extension_icons | addon qw-extension | encolado |

En la práctica **solo hacen falta Fontello + trx_addons** — unos 11 glifos. Se extraen a SVG
inline y se eliminan las 5 fuentes de iconos.

---

## 6. Funcionalidades a replicar

### 6.1 Buscador animado
Markup `sc_layouts_search > .search_modern`:
- `.search_submit` (lupa) → abre `.search_wrap.scheme_dark` a pantalla completa,
  con `.search_overlay` de fondo.
- El panel contiene el logo blanco, un `.search_close` y el form.
- Form: `<form role="search" method="get" action="https://jpmediagroups.com/">`
  con `input[name=s]`, placeholder **"Type words and hit enter"**, un `input[name=post_types]`
  oculto y un botón submit.

**Importante:** hoy **no hay resultados en vivo**. Es un GET a WordPress que recarga a la
página de resultados. Los estados *escribiendo / resultados / vacío / error* que se piden
no existen actualmente — hay que construirlos (ver pregunta 2).

### 6.2 Sociales del header
Mismo bloque en header móvil y en los dos footers:

| Icono | URL actual |
|---|---|
| Facebook | `https://www.facebook.com/AncoraThemes/` |
| Twitter/X | `https://twitter.com/ancora_themes` |
| Dribbble | `https://dribbble.com/AncoraThemes` |
| Instagram | `https://www.instagram.com/jpmediagroups/` |

Tres de cuatro apuntan al autor del tema, no al cliente (ver §8).

### 6.3 Carruseles
- **Hero**: Slider Revolution, 1 slide, animación por caracteres
  (`data-frame_0_chars: d:5; y:50%; o:0; rZ:-5deg` → `data-frame_1_chars: e:power4.out; d:3`).
  Es un reveal por letra con rotación, easing `power4.out`, duración 1200 ms, delay 490 ms.
- **Logos de clientes**: 6 imágenes en fila.
- **Portfolio**: ver 6.6.

### 6.4 Texto con "brillo" + movimiento en hover
Dos candidatos en el CSS; sin render no puedo confirmar cuál viste:

- **(a) Cards de expertise** (`sc_services_fashion`) — al hover, el overlay
  `rgba(0,0,0,0.3)` pasa a **lima `#97B100` al 0.9**, el número sube
  `translateY(-15px) → 0` con opacidad `0 → 1`, y el bloque título+subtítulo sube
  `translateY(30px) → 0`. Todo a `0.3s ease-out`. Encaja bien con "brilla y se mueve".
- **(b) Menú del header** — clase `menu_hover_zoom_line` (efecto de línea + zoom).

Se replican **las dos**, con easing custom en vez del `ease-out` actual.

### 6.5 Carrusel de letras
`trx_addons_marquee` sobre `.trx_addons_bg_text`. Texto:
**"Your Startup Adventure Begins"**, velocidad `11`, `bg_text_effect: none`,
padding `50px` entre repeticiones, soporta dirección invertida
(`.trx_addons_marquee_reverse`) y pausa en hover (`bg_text_marquee_hover`).

### 6.6 Galería que se expande en hover ✔ confirmado
`sc_portfolio_qw-case`. Mecánica exacta:
- `.sc_portfolio_content` es un **flex row**; cada item vale `width: 45%`.
- Al hover el item crece con `transition: width 0.6s cubic-bezier(0.65, 0, 0.35, 1)`.
- La imagen está en `transform: scale(1.06)` con `transition: transform 0.8s` mismo easing.
- El título parte de `top: 1.3em` y sube a 0 con `transition: top 0.6s` mismo easing,
  con `line-clamp: 1` y `overflow: hidden` en el contenedor (efecto máscara).
- Altura fija `620px`.

**El easing `cubic-bezier(0.65, 0, 0.35, 1)` ya es la firma de movimiento del sitio.**
Es un buen punto de partida para la curva base del sistema de animación nuevo.

### 6.7 Imágenes que se mueven con el scroll
Parallax propio del tema vía custom properties
`--trx-addons-parallax-x-anchor` / `--trx-addons-parallax-y-anchor` (valor `center`),
sobre widgets de imagen en `position: absolute` con offsets negativos
(p. ej. `right: -360px; top: 110px`). Se reemplaza por ScrollTrigger.

---

## 7. Imágenes

Todas bajo `https://jpmediagroups.com/wp-content/uploads/`.

**Contenido / portfolio**
- `2020/05/img-1-copyright-890x664.jpg` → Packaging design
- `2020/05/img-2-copyright-890x664.jpg` → Cyber games
- `2024/01/img-36-copyright-890x664.jpg` → Digital lenses
- `2020/05/img-4-copyright-890x664.jpg` → Iherb
- `2020/05/img-5-copyright-890x664.jpg` → Cartier

**Cards de expertise (background-image)**
- `2020/04/img-47-copyright-840x471.jpg` → Project management
- `2020/05/img-48-copyright-840x560.jpg` → Design
- `2020/05/img-49-copyright-840x473.jpg` → Development
- `2024/01/img-50-copyright-840x607.jpg` → Marketing

**Fondos y decorativas**
- `2026/06/marketing-agency-main-bg-copyright.jpg` (fondo del hero)
- `2020/06/img-76-copyright.jpg`
- `2023/12/bg-gr-1-marketing.png`, `bg-gr-2-marketing.png`, `bg-gr-3-marketing.png`
- `2026/06/Recurso-8.png`, `2026/06/Recurso-9.png`, `2023/11/Recurso-10.png`
- `2026/06/marketing-background-jpmediagroup-500x500.png`
- `2026/06/ai-bg-screw-copyright-300x300.webp` y `-500x500.webp`
- `2024/01/img-80-copyright-150x150.jpg` (avatar Regina Moore)
- `2023/11/go-for-bg-text.svg`

**Logos de clientes** — `2023/11/client-white-{1..6}-copyright.png`

**Logo** — `2023/11/new-logo-white-global.png` (185×46) + variante `-2x.png`

> El sufijo **`-copyright`** en casi todas es la convención de AncoraThemes para las imágenes
> de demo del tema. Ver pregunta 4.

---

## 8. Hallazgo crítico: el contenido es mayoritariamente demo del tema

Esto cambia el significado de "se conserva todo el copy", así que lo dejo explícito.

**Copy real del cliente (5 bloques):**
- `<title>`: *JP Media Groups – Utah Marketing Agency & Professional Photography*
- Hero: *Grow Your Utah business with Photography + Marketing That Actually Works*
- H1: *Marketing & Photography Services for Utah Businesses*
- *Why JP Media Groups* → *"JP Media Groups combines professional photography and digital
  marketing under one roof so your brand looks credible, gets found on Google, and converts
  followers into paying customers."*
- *From Salt Lake City to Provo,*
- Instagram: `instagram.com/jpmediagroups`

**Contenido de demo sin tocar:**
- Lorem ipsum en los 7 pasos del workflow y en los 3 planes de pricing.
- "Consectetur adipiscing elit…" en el bloque de intro y testimonio.
- Persona ficticia **Regina Moore / CEO director**.
- Portfolio con marcas ajenas: **Cartier, Iherb, Cyber games, Digital lenses, Packaging
  design** — todas en categoría "Branding".
- Precios ficticios `$55.55 / $75.75 / $30.50`.
- Dirección **United States — 2586 Broadway, New York, NY 10025** (el cliente es de Utah).
- Teléfono `+1 840 841 25 69`, emails `info@example.com`, `info@website.com`, `info@email.com`.
- Footer: **"AncoraThemes © 2026. All Rights Reserved."**
- 3 de 4 redes sociales apuntan a AncoraThemes.
- Menú con ~50 páginas de demo (Home AI Technologies, Home Helpdesk, Portfolio Squash,
  Typography, 404 Page, Shop, Cart, Checkout, Wishlist…).
- Marquee: *"Your Startup Adventure Begins"* (texto de demo de otro nicho).
- Un h1 repetido: *"Completed projects"* aparece tanto en portfolio como en pricing.

Migrar esto literalmente publica Lorem ipsum, marcas de terceros y datos de contacto falsos
en producción. Es una decisión del cliente, no mía — está en la pregunta 1.

---

## 9. Base para los tokens de diseño

Lo que sale directo de la auditoría hacia `tailwind.config` / CSS custom properties:

- **Superficies:** `#151414`, `#242222`, `#231F1F`, `#2E2D2D`
- **Bordes:** `#3E3E3E`, `#5B5B5A`
- **Texto:** `#FFFFFF`, `#CCCCCC`, `#A2A2A2`
- **Acentos:** lima `#97B100`/`#ACC903`, magenta `#DE60CA`/`#C22BAA`, violeta `#9476EC`/`#704CDB`
- **Familias:** display = Bebas Neue 400; body = Roboto 300/400/500/700
- **Escala:** la tabla de §2, portada a `rem` con `clamp()` para fluidez
- **Easing base heredado:** `cubic-bezier(0.65, 0, 0.35, 1)`
- **Duraciones observadas:** 300 ms (microinteracción), 600 ms (layout/width),
  800 ms (imagen/scale), 1200 ms (reveal de hero)
