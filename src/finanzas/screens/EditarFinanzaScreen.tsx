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
import { editarFinanza, ObtenerFinanza, } from '../finanzasService';

export default function EditarFinanzaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'> ('ingreso');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [valor, setValor] = useState('');
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function cargar() {
        setCargandoDatos(true);
        const finanza = await ObtenerFinanza(id);

        if (finanza) {
          setTipo(finanza.tipo);
          setDescripcion(finanza.descripcion);
          setValor(String(finanza.valor));
          setFecha(new Date(finanza.fecha).toISOString().slice(0, 10));
    }
        setCargandoDatos(false);
      }
      cargar();
    }, [id])
  );
  async function handleGuardar() {
    setGuardando(true);

    const resultado = await editarFinanza(id, {
      tipo,
      descripcion,
      fecha: new Date(fecha).getTime(),
      valor: Number(valor),
    });

    setGuardando(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.error ?? 'No se pudo actualizar el movimiento.');
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
      <ScreenHeader titulo="Editar movimiento" />

      <View style={styles.contenido}>
      <Text style={styles.label}>Tipo de movimiento</Text>
        <View style={styles.selector}>
          <TouchableOpacity
            style={[styles.selectorBoton, tipo === 'ingreso' && styles.selectorBotonIngreso]}
            onPress={() => setTipo('ingreso')}
          >
            <Text style={[styles.selectorTexto, tipo === 'ingreso' && styles.selectorTextoActivo]}>
              + Ingreso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectorBoton, tipo === 'egreso' && styles.selectorBotonEgreso]}
            onPress={() => setTipo('egreso')}
          >
            <Text style={[styles.selectorTexto, tipo === 'egreso' && styles.selectorTextoActivo]}>
              - Egreso
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          value={descripcion}
          onChangeText={setDescripcion}
          editable={!guardando}
        />

        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
          editable={!guardando}
        />

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="DD-MM-AAAA"
          value={fecha}
          onChangeText={setFecha}
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
  label: { fontSize: 14, fontWeight: '600', color: '#8B6F47', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    height: 52,
  },
  selector: { flexDirection: 'row', gap: 10 },
  selectorBoton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectorBotonIngreso: { backgroundColor: '#1A501A', borderColor: '#1A501A', height: 52,},
  selectorBotonEgreso: { backgroundColor: '#B91C1C', borderColor: '#B91C1C',  height: 52, },
  selectorTexto: { color: '#333', fontWeight: '600' },
  selectorTextoActivo: { color: '#fff' },
  boton: {
    backgroundColor: '#1A501A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    height: 52,
  },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});