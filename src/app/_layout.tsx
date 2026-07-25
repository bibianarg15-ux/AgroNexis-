import { verificarUsuarioExistente } from '@/auth/authService';
import { runMigrations } from '@/database/migrations';
import { Fraunces_400Regular, Fraunces_700Bold, useFonts } from '@expo-google-fonts/fraunces';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    Fraunces_400Regular,
  });
    const router = useRouter();
  const segments = useSegments();
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [usuarioExiste, setUsuarioExiste] = useState<boolean | null>(null);

  // inicializar la base de datos
  useEffect(() => {
    runMigrations()
      .then(() => setDbReady(true))
      .catch((error) => {
        console.error('Error inicializando la base de datos:', error);
        setDbError('No se pudo inicializar la base de datos.');
      });
  }, []);

  // Una vez la BD está lista, verificar si ya existe un usuario
  useEffect(() => {
    if (!dbReady) return;

    verificarUsuarioExistente()
      .then(setUsuarioExiste)
      .catch((error) => {
        console.error('Error verificando usuario:', error);
        setDbError('No se pudo verificar el usuario.');
      });
  }, [dbReady]);

  // Paso 3: una vez sabemos si existe usuario, navegar a la pantalla correcta
  useEffect(() => {
    if (usuarioExiste === null) return;

    const enGrupoAuth = segments[0] === '(auth)';

    if (usuarioExiste && enGrupoAuth) {
      // Ya existe usuario pero está en pantallas de auth: mándalo a login
      router.replace('/(auth)/login');
    } else if (!usuarioExiste && !enGrupoAuth) {
      // No existe usuario y no está en auth: mándalo a registro
      router.replace('/(auth)/registro');
    }
  }, [usuarioExiste, segments]);

  if (dbError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{dbError}</Text>
      </View>
    );
  }

  if (!fontsLoaded || !dbReady || usuarioExiste === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
