import { Cultivo } from '@/cultivos/cultivosRepository';
import { listarCultivosDelUsuario, obtenerCultivo } from '@/cultivos/cultivosService';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { registrarFinanza } from '../finanzasService';

export default function RegistrarFinanzaScreen() {
  const router = useRouter();
  const { cultivoId: cultivoIdParam } = useLocalSearchParams<{ cultivoId?: string }>();

  const [cultivoSeleccionado, setCultivoSeleccionado] = useState<Cultivo | null>(null);
  const [cultivosDisponibles, setCultivosDisponibles] = useState<Cultivo[]>([]);
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [descripcion, setDescripcion] = useState('');
  const [valor, setValor] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    async function cargar() {
      if (cultivoIdParam) {
        const data = await obtenerCultivo(cultivoIdParam);
        setCultivoSeleccionado(data);
      } else {
        const lista = await listarCultivosDelUsuario();
        setCultivosDisponibles(lista);
      }
    }
    cargar();
  }, [cultivoIdParam]);

  async function handleGuardar() {
    if (!cultivoSeleccionado) {
      Alert.alert('Error', 'Elige un cultivo antes de guardar.');
      return;
    }

    setCargando(true);

    const resultado = await registrarFinanza({
      cultivoId: cultivoSeleccionado.id,
      tipo,
      descripcion,
      valor: Number(valor),
      fecha: new Date(fecha).getTime(),
    });

    setCargando(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.error ?? 'No se pudo guardar el movimiento.');
      return;
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader titulo="Registrar finanza" />

      <View style={styles.contenido}>
        <Text style={styles.label}>Cultivo</Text>

        {cultivoIdParam ? (
          <View style={[styles.input, styles.inputDeshabilitado]}>
            <Text style={styles.textoDeshabilitado}>
              {cultivoSeleccionado?.nombre ?? 'Cargando...'}
            </Text>
          </View>
        ) : cultivoSeleccionado ? (
          <TouchableOpacity style={styles.input} onPress={() => setCultivoSeleccionado(null)}>
            <Text style={styles.textoSeleccionado}>{cultivoSeleccionado.nombre}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.listaSelector}>
            {cultivosDisponibles.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.opcion}
                onPress={() => setCultivoSeleccionado(c)}
              >
                <Text style={styles.opcionTexto}>{c.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Tipo de movimiento</Text>
        <View style={styles.selector}>
          <TouchableOpacity
            style={[
              styles.selectorBoton,
              tipo === 'ingreso' && styles.selectorBotonIngreso,
            ]}
            onPress={() => setTipo('ingreso')}
          >
            <Text
              style={[
                styles.selectorTexto,
                tipo === 'ingreso' && styles.selectorTextoActivo,
              ]}
            >
              + Ingreso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.selectorBoton,
              tipo === 'egreso' && styles.selectorBotonEgreso,
            ]}
            onPress={() => setTipo('egreso')}
          >
            <Text
              style={[
                styles.selectorTexto,
                tipo === 'egreso' && styles.selectorTextoActivo,
              ]}
            >
              + Egreso
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Insumos"
          value={descripcion}
          onChangeText={setDescripcion}
          editable={!cargando}
        />

        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          placeholder="$ 1'000.000"
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
          editable={!cargando}
        />

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={fecha}
          onChangeText={setFecha}
          editable={!cargando}
        />

        <TouchableOpacity style={styles.boton} onPress={handleGuardar} disabled={cargando}>
          <Text style={styles.botonTexto}>
            {cargando ? 'Guardando...' : 'Guardar movimiento'}
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
    justifyContent: 'center',
  },
  inputDeshabilitado: { backgroundColor: '#eee' },
  textoDeshabilitado: { fontSize: 16, color: '#666666' },
  textoSeleccionado: { fontSize: 16, color: '#1A501A', fontWeight: '600' },
  listaSelector: { gap: 8 },
  opcion: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  opcionTexto: { fontSize: 16, color: '#333' },
  selector: { flexDirection: 'row', gap: 10 },
  selectorBoton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectorBotonIngreso: { backgroundColor: '#1A501A', borderColor: '#1A501A', height: 52, },
  selectorBotonEgreso: { backgroundColor: '#B91C1C', borderColor: '#B91C1C',height: 52,},
  selectorTexto: { color: '#333', fontWeight: '600', fontSize: 16},
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