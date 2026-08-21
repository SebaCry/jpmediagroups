export const isDev: boolean = import.meta.env.DEV;

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
