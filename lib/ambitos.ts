/**
 * El permiso de Google Calendar, en un módulo sin dependencias para que lo puedan
 * importar tanto el servidor (`lib/auth.ts`) como el cliente sin arrastrar el uno
 * al otro.
 */
export const AMBITO_CALENDARIO = "https://www.googleapis.com/auth/calendar.events";
