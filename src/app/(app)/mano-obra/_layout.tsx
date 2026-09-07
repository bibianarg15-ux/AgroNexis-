import { Stack } from 'expo-router';

export default function ManoObraLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nuevo" />
      <Stack.Screen name="trabajador/[trabajadorId]" />
      <Stack.Screen name="cultivo/[cultivoId]" />
      <Stack.Screen name="[id]/editar" />
    </Stack>
  );
}