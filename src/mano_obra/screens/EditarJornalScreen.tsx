import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { obtenerJornalPorId } from '../manoObraRepository';
import { editarJornal } from '../manoObraService';

export default function EditarJornalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [fecha, setFecha] = useState('');
  const [valorJornal, setValorJornal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function cargar() {
        setCargandoDatos(true);
        const jornal = await obtenerJornalPorId(id);

        if (jornal) {
          setFecha(new Date(jornal.fecha).toISOString().slice(0, 10));
          setValorJornal(String(jornal.valor_jornal));
          setObservaciones(jornal.observaciones ?? '');
        }
        setCargandoDatos(false);
      }
      cargar();
    }, [id])
  );

  async function handleGuardar() {
    setGuardando(true);

    const resultado = await editarJornal(id, {
      fecha: new Date(fecha).getTime(),
      valorJornal: Number(valorJornal),
      observaciones,
    });

    setGuardando(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.error ?? 'No se pudo actualizar el jornal.');
      return;
    }

    router.back();
  }

  if (cargandoDatos) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader titulo="Editar jornal" />

      <View style={styles.contenido}>

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={fecha}
          onChangeText={setFecha}
          editable={!guardando}
        />

        <Text style={styles.label}>Valor del jornal</Text>
        <TextInput
          style={styles.input}
          placeholder="$"
          value={valorJornal}
          onChangeText={setValorJornal}
          keyboardType="numeric"
          editable={!guardando}
        />

        <Text style={styles.label}>Observaciones</Text>
        <TextInput
          style={styles.input}
          placeholder="Opcional"
          value={observaciones}
          onChangeText={setObservaciones}
          editable={!guardando}
        />

        <TouchableOpacity style={styles.boton} onPress={handleGuardar} disabled={guardando}>
          <Text style={styles.botonTexto}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F3F7F0', flexGrow: 1 },
  contenido: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#8B6F47', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    fontSize: 18,
    height: 52,
  },
  boton: {
    backgroundColor: '#1A501A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    height: 52,
  },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});