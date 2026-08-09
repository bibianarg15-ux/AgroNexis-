import PinInput from '@/shared/components/PinInput';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { iniciarSesion } from '../authService';

export default function LoginScreen() {
  const router = useRouter();
  const [pin, setPin] = useState(['', '', '', '']);
  const [cargando, setCargando] = useState(false);

  async function validarLogin(pinCompleto: string) {
    setCargando(true);
    const resultado = await iniciarSesion(pinCompleto);
    setCargando(false);
    // Limpia el PIN tras un error para evitar confusiones.
    if (!resultado.exito) {
      Alert.alert('Error', resultado.error ?? 'No se pudo iniciar sesión.');
      setPin(['', '', '', '']);
      return;
    }
    router.replace('/(app)/cultivos'); 
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"/>
      <Text style={styles.titulo}>AgroNexis</Text>
      <Text style={styles.subtitulo}>Gestiona tus cultivos sin límites</Text>

      <Text style={styles.label}>PIN</Text>
      <PinInput
        value={pin}
        onChange={setPin}
        onCompleto={validarLogin}
        editable={!cargando}
      />

      <TouchableOpacity onPress={() => router.push('/recuperar-pin')}>
        <Text style={styles.linkBold}>¿Olvidaste tu PIN?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/registro')}>
        <Text style={styles.link}>
          ¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F7F0',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  titulo: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 40,
    color: '#1A501A',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 13,
    color: '#8B6F47',
    fontStyle: 'italic',
    marginBottom: 32,
  },
  label: {
    width:'100%',
    fontSize: 13,
    fontWeight: '600',
    color: '#8B6F47',
    marginBottom: 12,
    textAlign:'left',
  },
  link: {
    color: '#8B6F47',
    marginTop: 16,
    fontSize: 13,
  },
  linkBold: {
    color: '#1A501A',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});