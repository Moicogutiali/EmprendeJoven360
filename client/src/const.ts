export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  // Usar ruta de acceso directo interna en lugar de proveedor externo
  return `${window.location.origin}/api/oauth/bypass`;
};
