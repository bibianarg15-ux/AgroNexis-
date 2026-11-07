import { runMigrations } from '@/database/migrations';
import { FeedbackProvider } from '@/shared/feedback/feedbackProvider';
import { sincronizarNotificaciones } from '@/shared/notifications/notificacionesService';
import { useNavegacionDesdeNotificacion } from '@/shared/notifications/useNavegacionDesdeNotificacion';
import {
  Fraunces_400Regular,
  Fraunces_700Bold,
  useFonts,
} from '@expo-google-fonts/fraunces';
import { Stack, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    Fraunces_400Regular,
  });

  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const segments = useSegments();

  useNavegacionDesdeNotificacion(segments[0] === '(app)');
  useEffect(() => {
    runMigrations()
      .then(() => {
        setDbReady(true);
      })
      .catch((error) => {
        console.error('Error inicializando la base de datos:', error);
        setDbError('No se pudo inicializar la base de datos.');
      });
  }, []);

  useEffect(() => {
  if (dbReady) sincronizarNotificaciones();
}, [dbReady]);


  if (dbError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Text style={{ color: 'red', textAlign: 'center' }}>
          {dbError}
        </Text>
      </View>
    );
  }

  if (!fontsLoaded || !dbReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }


  return (
    <FeedbackProvider>
      <Stack screenOptions={{headerShown: false}}/>
      </FeedbackProvider>
  );


};