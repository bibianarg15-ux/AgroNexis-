import DateInput from '@/shared/components/DateInput';
import PinInput from '@/shared/components/PinInput';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFeedback } from '@/shared/feedback/feedbackProvider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { establecerNuevoPin, verificarIdentidadRecuperacion } from '../authService';


export default function RecuperarPinScreen() {
   const router = useRouter();
  const [paso, setPaso] = useState<'verificar' | 'nuevoPin'>('verificar');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [pin, setPin] = useState(['','','','']);
  const [confirmarPin, setConfirmarPin] = useState(['','','','']);
  const [cargando, setCargando] = useState(false); 
  const {mostrarError, mostrarExito} = useFeedback();
async function handleVerificar() {
    setCargando(true);
    const resultado = await verificarIdentidadRecuperacion({
      nombreCompleto,
      fechaNacimiento,
      municipio
    });
    setCargando(false);
        if (!resultado.exito) {
          mostrarError(resultado.error ?? 'No se pudo verificar tu identidad.');
          return;
    }
    setPaso('nuevoPin') 
}

async function handleGuardarNuevoPin() {
  setCargando(true);
  const resultado=  await establecerNuevoPin(pin.join(''), confirmarPin.join(''))
  setCargando(false);
  if(!resultado.exito){
    mostrarError(resultado.error ?? 'No se pudo actualizar el PIN.')
    return
  }
  mostrarExito('Tu PIN se actualizó correctamente.');
     router.replace('/login');
}

if (paso === 'nuevoPin') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader titulo="Nuevo PIN" />
        <Text style={styles.subtitulo}>Identidad verificada. Crea tu nuevo PIN.</Text>

        <Text style={styles.label}>PIN (4 dígitos)</Text>
        <PinInput value={pin} onChange={setPin} editable={!cargando} />

        <Text style={styles.label}>Confirmar PIN</Text>
        <PinInput value={confirmarPin} onChange={setConfirmarPin} editable={!cargando} />

        <TouchableOpacity
          style={styles.boton}
          onPress={handleGuardarNuevoPin}
          disabled={cargando}
        >
          <Text style={styles.botonTexto}>
            {cargando ? 'Guardando...' : 'Guardar nuevo PIN'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader titulo="Recuperar PIN" />
      <Text style={styles.subtitulo}>Verifica tu identidad para crear un PIN nuevo.</Text>

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Juan Pérez"
        value={nombreCompleto}
        onChangeText={setNombreCompleto}
        editable={!cargando}
      />

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <DateInput
        value={fechaNacimiento}
        onChange={setFechaNacimiento}
        editable={!cargando}
        maximumDate={new Date()}
      />

      <Text style={styles.label}>Municipio</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Marinilla"
        value={municipio}
        onChangeText={setMunicipio}
        editable={!cargando}
      />

      <Text style={styles.nota}>Estos datos deben coincidir con tu registro</Text>

      <TouchableOpacity style={styles.boton} onPress={handleVerificar} disabled={cargando}>
        <Text style={styles.botonTexto}>
          {cargando ? 'Verificando...' : 'Verificar identidad'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F3F7F0', flexGrow: 1 },
  subtitulo: { fontSize: 13, color: '#8B6F47', margin: 20, marginBottom: 0 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B6F47',
    marginBottom: 8,
    marginTop: 16,
    marginHorizontal: 20,
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    height: 52,
    marginHorizontal: 20,
  },
  nota: { fontSize: 12, color: '#8B6F47', marginHorizontal: 20, marginTop: 8 },
  boton: {
    backgroundColor: '#1A501A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 20,
    height: 52,
  },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});