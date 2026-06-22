/**
 * Configuración e instancia del servicio de almacenamiento (Supabase Storage).
 *
 * Las credenciales se leen desde variables de entorno (.env).
 * En Expo, las variables expuestas al cliente deben llevar el prefijo
 * EXPO_PUBLIC_ para estar disponibles en runtime.
 */

// Polyfill de URL requerido por @supabase/supabase-js en React Native.
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import { File } from 'expo-file-system';

export const storageConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  apiKey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',
  bucket: process.env.EXPO_PUBLIC_SUPABASE_BUCKET ?? '',
};

// Instancia del cliente de Supabase.
// No persistimos sesión porque solo usamos Storage con la clave anónima.
export const supabase = createClient(storageConfig.url, storageConfig.apiKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export type UploadInput = {
  uri: string;
  name: string;
  mimeType?: string;
};

export type UploadResult = {
  path: string;
  publicUrl: string;
};

// Genera un nombre único usando timestamp + sufijo aleatorio, conservando la
// extensión original del archivo (requisito 4.3 del enunciado).
function buildUniqueName(originalName: string): string {
  const dot = originalName.lastIndexOf('.');
  const ext = dot > -1 ? originalName.slice(dot) : '';
  const random = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${random}${ext}`;
}

/**
 * Sube un archivo local (imagen o documento) al bucket configurado.
 * Lee el archivo como base64 y lo convierte a ArrayBuffer, que es la forma
 * fiable de subir binarios desde React Native.
 */
export async function uploadToStorage(input: UploadInput): Promise<UploadResult> {
  if (!storageConfig.url || !storageConfig.apiKey || !storageConfig.bucket) {
    throw new Error(
      'Faltan credenciales de Supabase. Revisa las variables EXPO_PUBLIC_SUPABASE_* en tu archivo .env.'
    );
  }

  const base64 = await new File(input.uri).base64();
  const path = buildUniqueName(input.name);

  const { error } = await supabase.storage
    .from(storageConfig.bucket)
    .upload(path, decode(base64), {
      contentType: input.mimeType ?? 'application/octet-stream',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(storageConfig.bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
