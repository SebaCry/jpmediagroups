# Plantilla de EmailJS — notificación de contacto

Todo lo que hay que pegar en el dashboard de EmailJS para que los briefs del
formulario lleguen a `contact@jpmediagroups.com` con formato.

> **Las variables no son negociables.** `sendForm` convierte el atributo `name`
> de cada campo de [`src/pages/contact.astro`](../src/pages/contact.astro) en
> una variable de plantilla. Si renombrás un campo allí sin renombrarlo aquí, el
> envío **sigue dando éxito** y el correo llega en blanco. Esas cinco son las
> únicas que existen:
>
> | Variable | De dónde sale |
> |---|---|
> | `{{name}}` | campo Name |
> | `{{email}}` | campo Email |
> | `{{discipline}}` | desplegable "What do you need?" |
> | `{{message}}` | textarea del brief |
> | `{{subject}}` | lo escribe el script: `New project brief — <nombre>` |

---

## 1. Ajustes de la plantilla

En **Email Templates → tu plantilla → Settings**:

| Campo | Valor |
|---|---|
| **Subject** | `{{subject}}` |
| **To Email** | `contact@jpmediagroups.com` |
| **From Name** | `{{name}} · jpmediagroups.com` |
| **From Email** | *(déjalo en el de la cuenta de Gmail conectada)* |
| **Reply To** | `{{email}}` |
| **Bcc / Cc** | vacío |

**`Reply To` es el ajuste que más importa.** Sin él, darle a Responder en Gmail
le contesta a EmailJS en vez de al cliente, y te enterás tres días tarde.

`From Name` lleva el nombre de quien escribe para que la bandeja se lea de un
vistazo: *"Ana Gómez · jpmediagroups.com"* en vez de cuarenta filas idénticas.

---

## 2. Contenido — versión HTML

En **Content**, cambiá al editor de código (`<>`) y pegá esto entero.

Está construido con tablas y estilos en línea a propósito: Outlook renderiza con
el motor de Word y no entiende flexbox, grid ni hojas de estilo externas. El
degradado de marca son cuatro celdas de color sólido por el mismo motivo — un
`linear-gradient` desaparece en Outlook y deja una banda gris.

```html
<!-- Texto de vista previa: lo que se lee en la lista antes de abrir. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">
  {{name}} — {{discipline}}
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:#edefec;margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
             style="width:100%;max-width:600px;background:#ffffff;">

        <!-- Cabecera -->
        <tr>
          <td style="background:#12232b;padding:28px 32px;">
            <p style="margin:0;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#8ba3a8;">
              Nuevo brief
            </p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:700;letter-spacing:-0.4px;color:#ffffff;">
              JP Media Groups
            </p>
          </td>
        </tr>

        <!-- El trazo de marca, en celdas sólidas para que sobreviva a Outlook -->
        <tr>
          <td style="font-size:0;line-height:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="25%" height="5" style="background:#2c6fc6;font-size:0;line-height:0;">&nbsp;</td>
                <td width="25%" height="5" style="background:#2092e1;font-size:0;line-height:0;">&nbsp;</td>
                <td width="25%" height="5" style="background:#34b4d7;font-size:0;line-height:0;">&nbsp;</td>
                <td width="25%" height="5" style="background:#a0e36b;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Quién escribe -->
        <tr>
          <td style="padding:32px 32px 0;">
            <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5c6b66;">
              De
            </p>
            <p style="margin:6px 0 0;font-size:26px;font-weight:700;letter-spacing:-0.6px;color:#12232b;">
              {{name}}
            </p>
            <p style="margin:8px 0 0;font-size:16px;">
              <a href="mailto:{{email}}" style="color:#0f6bae;text-decoration:none;">{{email}}</a>
            </p>
          </td>
        </tr>

        <!-- Qué necesita -->
        <tr>
          <td style="padding:24px 32px 0;">
            <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5c6b66;">
              Qué necesita
            </p>
            <p style="margin:8px 0 0;">
              <span style="display:inline-block;padding:7px 14px;background:#edefec;border-left:3px solid #2092e1;font-size:15px;font-weight:600;color:#12232b;">
                {{discipline}}
              </span>
            </p>
          </td>
        </tr>

        <!-- El brief -->
        <tr>
          <td style="padding:28px 32px 0;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5c6b66;">
              El proyecto
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:20px 22px;background:#fafbf9;border:1px solid #e2e6e2;">
                  <!-- pre-wrap conserva los saltos de línea que escribió el cliente.
                       Outlook de escritorio los colapsa; el resto lo respeta. -->
                  <div style="margin:0;font-size:16px;line-height:1.7;color:#12232b;white-space:pre-wrap;">{{message}}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Responder -->
        <tr>
          <td style="padding:28px 32px 36px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#12232b;">
                  <a href="mailto:{{email}}?subject=Re:%20{{subject}}"
                     style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                    Responder a {{name}}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Pie -->
        <tr>
          <td style="padding:18px 32px;background:#edefec;border-top:1px solid #e2e6e2;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#5c6b66;">
              Enviado desde el formulario de
              <a href="https://www.jpmediagroups.com/contact/" style="color:#0f6bae;text-decoration:none;">jpmediagroups.com</a>.
              Al responder este correo le escribís directamente a {{name}}.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
```

---

## 3. Contenido — versión de texto plano

Si preferís algo sin HTML, esto entra igual en el campo **Content** y llega
idéntico a cualquier cliente de correo:

```
NUEVO BRIEF — jpmediagroups.com
────────────────────────────────

De:          {{name}}
Email:       {{email}}
Qué quiere:  {{discipline}}

EL PROYECTO
{{message}}

────────────────────────────────
Respondé este correo y le llega directo a {{name}}.
```

---

## 4. Probarla

El botón **Test It** del dashboard te pide valores para las cinco variables.
Rellenalas con algo realista — sobre todo `{{message}}` con **dos o tres
párrafos**, que es donde se ve si los saltos de línea sobreviven.

Después, una prueba de verdad desde el sitio ya desplegado:

1. Enviá un brief desde `/contact/`.
2. Comprobá que llega a `contact@jpmediagroups.com`.
3. **Dale a Responder y mirá a quién va dirigido** — tiene que ser tu dirección
   de prueba, no `noreply@emailjs.com`. Si va a EmailJS, falta el `Reply To`.
4. Si cayó en Spam, marcalo como "No es spam" una vez.

---

## Pendiente relacionado

- **Falta el registro SPF del dominio.** No afecta a este formulario — EmailJS
  entrega desde su propia infraestructura — pero sí a los correos que salen
  desde `@jpmediagroups.com`, que tienen más probabilidad de caer en spam del
  lado del cliente.
- **Acuse de recibo al cliente.** Hoy quien escribe no recibe nada. Requiere una
  segunda plantilla en EmailJS y una segunda llamada en
  [`src/pages/contact.astro`](../src/pages/contact.astro); no está montado.
