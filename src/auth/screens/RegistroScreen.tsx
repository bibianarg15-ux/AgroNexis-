import PinInput from '@/shared/components/PinInput';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { registrarAgricultor } from '../authService';

export default function RegistroScreen() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [correo, setCorreo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [pin, setPin] = useState(['','','','']);
  const [confirmarPin, setConfirmarPin] = useState(['','','','']);
  const [cargando, setCargando] = useState(false);

  async function handleCrearCuenta() {
    setCargando(true);
//Envia undefined para que el campo se guarde como NULL y no como campo vacio
    const resultado = await registrarAgricultor({
      nombreCompleto,
      correo: correo.trim() || undefined,
      municipio,
      fechaNacimiento,
      pin: pin.join(''),
      confirmarPin: confirmarPin.join(''),
    });

    setCargando(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.error ?? 'No se pudo crear la cuenta.');
      return;
    }
    router.replace('/login');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Crear cuenta</Text>

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Juan Pérez"
        value={nombreCompleto}
        onChangeText={setNombreCompleto}
        editable={!cargando}
      />

      <Text style={styles.label}>Municipio</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Marinilla"
        value={municipio}
        onChangeText={setMunicipio}
        editable={!cargando}
      />

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Opcional"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!cargando}
      />

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TextInput
        style={styles.input}
        placeholder="AAAA-MM-DD"
        value={fechaNacimiento}
        onChangeText={setFechaNacimiento}
        editable={!cargando}
      />

      <Text style={styles.label}>PIN (4 dígitos)</Text>
      <PinInput value={pin} onChange={setPin} editable={!cargando} />
      <Text style={styles.label}>Confirmar PIN</Text>
      <PinInput value={confirmarPin} onChange={setConfirmarPin} editable={!cargando} />

      <TouchableOpacity
        style={styles.boton}
        onPress={handleCrearCuenta}
        disabled={cargando}
      >
        <Text style={styles.botonTexto}>
          {cargando ? 'Creando...' : 'Crear cuenta'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F3F7F0', flexGrow: 1 },
  titulo: { fontSize: 32,fontFamily:'Fraunces_700Bold', color: '#1A501A' },
  label: { fontSize: 14, color: '#8B6F47', marginBottom: 16, marginTop: 16 },
  input: {
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
    height: 52,

  },
  boton: {
    backgroundColor: '#1A501A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    height: 52,
  },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 18
   },
});