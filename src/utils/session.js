/**
 * There are no accounts. Parents get in with their child's NIK/NISN plus date
 * of birth; the API answers with a token that unlocks follow-up calls. We keep
 * that token in the browser so they do not have to type the NIK again on every
 * screen — it is never shown to them.
 */
const TOKEN_KEY = "ppdb_access_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const hasToken = () => Boolean(getToken());
