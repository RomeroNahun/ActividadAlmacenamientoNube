import FileUploader from '@/components/FileUploader';
import { uploadToStorage, type UploadInput } from '@/lib/storageClient';
import { Image } from 'expo-image';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SelectedAsset = UploadInput;

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

export default function HomeScreen() {
  const [image, setImage] = useState<SelectedAsset | null>(null);
  const [file, setFile] = useState<SelectedAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  // Selección de imagen desde la galería con expo-image-picker.
  async function pickImage() {
    setStatus(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setStatus({
        type: 'error',
        text: 'Se necesita permiso para acceder a la galería.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setImage({
      uri: asset.uri,
      name: asset.fileName ?? `imagen-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
  }

  // Selección de un archivo arbitrario con expo-document-picker.
  async function pickFile() {
    setStatus(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'application/octet-stream',
    });
  }

  // Subida asíncrona al servicio con manejo de errores (try/catch).
  async function handleUpload() {
    if (!image && !file) {
      setStatus({ type: 'error', text: 'Selecciona una imagen o un archivo primero.' });
      return;
    }

    setUploading(true);
    setStatus(null);

    try {
      const pending = [image, file].filter(Boolean) as SelectedAsset[];
      for (const asset of pending) {
        await uploadToStorage(asset);
      }
      setStatus({
        type: 'success',
        text: `Subida exitosa de ${pending.length} elemento(s) al almacenamiento en la nube.`,
      });
      setImage(null);
      setFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al subir.';
      setStatus({ type: 'error', text: `Error: ${message}` });
    } finally {
      setUploading(false);
    }
  }

  const canUpload = !!(image || file) && !uploading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.heading}>Sube tu contenido</Text>
          <Text style={styles.subheading}>
            Elige qué deseas almacenar en la nube
          </Text>
        </View>

        <View style={styles.options}>
          <FileUploader
            title="Cargar Archivo"
            description="Documentos, PDF, audio y más"
            icon="document-text-outline"
            color="#2563eb"
            onPress={pickFile}
          />
          {file && (
            <Text style={styles.selected} numberOfLines={1}>
              Archivo: {file.name}
            </Text>
          )}

          <FileUploader
            title="Cargar Imagen"
            description="Fotos y capturas desde tu galería"
            icon="image-outline"
            color="#16a34a"
            onPress={pickImage}
          />
          {image && (
            <View style={styles.preview}>
              <Image source={{ uri: image.uri }} style={styles.thumbnail} contentFit="cover" />
              <Text style={styles.selected} numberOfLines={1}>
                {image.name}
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={handleUpload}
          disabled={!canUpload}
          style={({ pressed }) => [
            styles.uploadButton,
            !canUpload && styles.uploadButtonDisabled,
            pressed && canUpload && styles.uploadButtonPressed,
          ]}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadText}>Subir al servicio</Text>
          )}
        </Pressable>

        {status && (
          <Text
            style={[
              styles.status,
              status.type === 'success' ? styles.statusSuccess : styles.statusError,
            ]}>
            {status.text}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 24,
    marginBottom: 28,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  subheading: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 6,
  },
  options: {
    gap: 16,
  },
  selected: {
    fontSize: 13,
    color: '#374151',
    paddingHorizontal: 4,
  },
  preview: {
    alignItems: 'center',
    gap: 8,
  },
  thumbnail: {
    width: 140,
    height: 140,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },
  uploadButton: {
    marginTop: 28,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  uploadButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  uploadButtonPressed: {
    opacity: 0.85,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    marginTop: 18,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  statusSuccess: {
    color: '#16a34a',
  },
  statusError: {
    color: '#dc2626',
  },
});
