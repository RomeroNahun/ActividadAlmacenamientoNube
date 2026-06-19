/**
 * Configuración e instancia del servicio de almacenamiento.
 *
 * Las credenciales se leen desde variables de entorno (.env).
 * En Expo, las variables expuestas al cliente deben llevar el prefijo
 * EXPO_PUBLIC_ para estar disponibles en runtime.
 *
 * NOTA: Aún sin lógica de carga. Solo configuración base.
 */

export const storageConfig = {
  url: process.env.EXPO_PUBLIC_STORAGE_URL ?? '',
  apiKey: process.env.EXPO_PUBLIC_STORAGE_KEY ?? '',
  bucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET ?? '',
};

// Aquí se creará e inicializará la instancia del cliente del servicio
// (por ejemplo Supabase, Firebase, S3, etc.) cuando se implemente la lógica.
export const storageClient = null;
