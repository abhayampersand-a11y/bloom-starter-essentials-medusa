import Medusa from "@medusajs/js-sdk";

declare const __BACKEND_URL__: string | undefined;

export const sdk = new Medusa({
  baseUrl: typeof __BACKEND_URL__ !== "undefined" ? __BACKEND_URL__ : "/",
  debug: true,
  auth: {
    // The admin dashboard authenticates with a session cookie, so widget
    // requests must use session auth (jwt would need its own stored token)
    type: (import.meta.env.VITE_ADMIN_AUTH_TYPE || "session") as
      | "jwt"
      | "session",
  },
});