import FileUploader from '@/components/FileUploader';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
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
        />

        <FileUploader
          title="Cargar Imagen"
          description="Fotos y capturas desde tu galería"
          icon="image-outline"
          color="#16a34a"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
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
});
