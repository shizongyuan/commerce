/**
 * Cookie utility functions
 * Shared between auth.tsx and api-client.ts
 */

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

/**
 * Set a cookie with options
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    httponly?: boolean;
    samesite?: "strict" | "lax" | "none";
    secure?: boolean;
  } = {}
): void {
  if (typeof document === "undefined") return;

  const {
    maxAge = 7 * 24 * 60 * 60,
    path = "/",
    httponly = false,
    samesite = "lax",
    secure = false,
  } = options;

  let cookieString = `${name}=${value}; path=${path}; max-age=${maxAge}`;

  if (httponly) cookieString += "; httponly";
  if (secure) cookieString += "; secure";
  cookieString += `; samesite=${samesite}`;

  document.cookie = cookieString;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}