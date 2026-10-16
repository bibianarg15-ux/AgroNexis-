import { Stack } from 'expo-router';

export default function FinanzasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nuevo" />
      <Stack.Screen name="[id]/editar" />
      <Stack.Screen name="cultivo/[cultivoId]" />
    </Stack>
  );
}