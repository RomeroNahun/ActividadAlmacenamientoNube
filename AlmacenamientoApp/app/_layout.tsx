import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Almacenamiento en la Nube' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
