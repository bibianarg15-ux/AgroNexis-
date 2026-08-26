import { Stack } from 'expo-router';

export default function ActividadesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nueva" />
      <Stack.Screen name="[id]/editar" />
      <Stack.Screen name="cultivo/[cultivoId]" />
    </Stack>
  );
}