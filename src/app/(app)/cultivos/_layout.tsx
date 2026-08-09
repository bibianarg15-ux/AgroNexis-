import { Stack } from 'expo-router';

export default function CultivosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nuevo" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/editar" />
    </Stack>
  );
}