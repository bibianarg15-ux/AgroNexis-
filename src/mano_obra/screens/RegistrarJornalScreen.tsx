import { Cultivo } from '@/cultivos/cultivosRepository';
import { listarCultivosDelUsuario, obtenerCultivo } from '@/cultivos/cultivosService';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { listarTrabajadoresDelUsuario, registrarJornal, registrarTrabajador } from '../manoObraService';
import { Trabajador } from '../trabajadoresRepository';

export default function RegistrarJornalScreen() {
  const router = useRouter();
  const { cultivoId: cultivoIdParam } = useLocalSearchParams<{ cultivoId?: string }>();

  const [cultivoSeleccionado, setCultivoSeleccionado] = useState<Cultivo | null>(null);
  const [cultivosDisponibles, setCultivosDisponibles] = useState<Cultivo[]>([]);

  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorId, setTrabajadorId] = useState<string | null>(null);
  const [mostrarNuevoTrabajador, setMostrarNuevoTrabajador] = useState(false);
  const [nombreNuevoTrabajador, setNombreNuevoTrabajador] = useState('');

  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [valorJornal, setValorJornal] = useState('');
  const [observaciones, setObservaciones] = useState('');
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

      const listaTrabajadores = await listarTrabajadoresDelUsuario();
      setTrabajadores(listaTrabajadores);
    }
    cargar();
  }, [cultivoIdParam]);

  async function handleAgregarTrabajador() {
    if (!nombreNuevoTrabajador.trim()) {
      Alert.alert('Error', 'Escribe el nombre del trabajador.');
      return;
    }

    const resultado = await registrarTrabajador(nombreNuevoTrabajador);

    if (!resultado.exito || !resultado.trabajador) {
      Alert.alert('Error', resultado.error ?? 'No se pudo agregar el trabajador.');
      return;
    }

    // Actualiza la lista y selecciona el que se acaba de crear
    setTrabajadores((prev) => [...prev, resultado.trabajador!]);
    setTrabajadorId(resultado.trabajador.id);
    setNombreNuevoTrabajador('');
    setMostrarNuevoTrabajador(false);
  }

  async function handleGuardar() {
    if (!cultivoSeleccionado) {
      Alert.alert('Error', 'Elige un cultivo antes de guardar.');
      return;
    }

    setCargando(true);

    const resultado = await registrarJornal({
      cultivoId: cultivoSeleccionado.id,
      trabajadorId: trabajadorId ?? '',
      fecha: new Date(fecha).getTime(),
      valorJornal: Number(valorJornal),
      observaciones,
    });

    setCargando(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.error ?? 'No se pudo guardar el jornal.');
      return;
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader titulo="Registrar jornal" />

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

        <Text style={styles.label}>Trabajador</Text>

        {!mostrarNuevoTrabajador ? (
          <>
            <View style={styles.listaSelector}>
              {trabajadores.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.opcion,
                    trabajadorId === t.id && styles.opcionSeleccionada,
                  ]}
                  onPress={() => setTrabajadorId(t.id)}
                >
                  <Text
                    style={[
                      styles.opcionTexto,
                      trabajadorId === t.id && styles.opcionTextoSeleccionado,
                    ]}
                  >
                    {t.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.botonAgregarTrabajador}
              onPress={() => setMostrarNuevoTrabajador(true)}
            >
              <Text style={styles.botonAgregarTrabajadorTexto}>+ Agregar nuevo trabajador</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <Text style={styles.label}>Nombre del trabajador</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Natalia"
              value={nombreNuevoTrabajador}
              onChangeText={setNombreNuevoTrabajador}
            />
            <View style={styles.filaBotonesTrabajador}>
              <TouchableOpacity
                style={styles.botonCancelarTrabajador}
                onPress={() => {
                  setMostrarNuevoTrabajador(false);
                  setNombreNuevoTrabajador('');
                }}
              >
                <Text style={styles.botonCancelarTrabajadorTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonGuardarTrabajador}
                onPress={handleAgregarTrabajador}
              >
                <Text style={styles.botonGuardarTrabajadorTexto}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={fecha}
          onChangeText={setFecha}
          editable={!cargando}
        />

        <Text style={styles.label}>Valor del jornal</Text>
        <TextInput
          style={styles.input}
          placeholder="$"
          value={valorJornal}
          onChangeText={setValorJornal}
          keyboardType="numeric"
          editable={!cargando}
        />

        <Text style={styles.label}>Observaciones</Text>
        <TextInput
          style={styles.input}
          placeholder="Opcional"
          value={observaciones}
          onChangeText={setObservaciones}
          editable={!cargando}
        />

        <TouchableOpacity style={styles.boton} onPress={handleGuardar} disabled={cargando}>
          <Text style={styles.botonTexto}>
            {cargando ? 'Guardando...' : 'Guardar jornal'}
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
    justifyContent: 'center',
  },
  inputDeshabilitado: { backgroundColor: '#eee' },
  textoDeshabilitado: { fontSize: 16, color: '#666' },
  textoSeleccionado: { fontSize: 16, color: '#1A501A', fontWeight: '600' },
  listaSelector: { gap: 8 },
  opcion: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  opcionSeleccionada: { borderColor: '#1A501A', backgroundColor: '#1A501A' },
  opcionTexto: { fontSize: 15, color: '#333' },
  opcionTextoSeleccionado: { color: '#fff', fontWeight: '600' },
  botonAgregarTrabajador: { marginTop: 10, alignSelf: 'flex-start' },
  botonAgregarTrabajadorTexto: { color: '#1A501A', fontWeight: '600', fontSize: 14 },
  filaBotonesTrabajador: { flexDirection: 'row', gap: 8, marginTop: 12 },
  botonCancelarTrabajador: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  botonCancelarTrabajadorTexto: { color: '#666', fontWeight: '600' },
  botonGuardarTrabajador: {
    flex: 1,
    backgroundColor: '#1A501A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  botonGuardarTrabajadorTexto: { color: '#fff', fontWeight: '600' },
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