import { Cultivo } from '@/cultivos/cultivosRepository';
import { obtenerCultivo } from '@/cultivos/cultivosService';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { editarActividad, obtenerActividadConCosecha } from '../actividadesService';

export default function EditarActividadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [esCosecha, setEsCosecha] = useState(false);
  const [actividad, setActividad] = useState('');
  const [fecha, setFecha] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [crearRecordatorio, setCrearRecordatorio] = useState(false);
  const [diasRecordatorio, setDiasRecordatorio] = useState('8');
  const [cantidad1, setCantidad1] = useState('');
  const [cantidad2, setCantidad2] = useState('');
  const [cantidad3, setCantidad3] = useState('');
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function cargar() {
        setCargandoDatos(true);
        const data = await obtenerActividadConCosecha(id);

        if (data) {
          setEsCosecha(data.es_cosecha === 1);
          setActividad(data.actividad);
          setFecha(new Date(data.fecha).toISOString().slice(0, 10));
          setObservaciones(data.observaciones ?? '');
          setCrearRecordatorio(data.crear_recordatorio === 1);
          setDiasRecordatorio(String(data.dias_recordatorio ?? 8));

          if (data.registroCosecha) {
            setCantidad1(String(data.registroCosecha.categoria_1_cantidad));
            setCantidad2(String(data.registroCosecha.categoria_2_cantidad));
            setCantidad3(String(data.registroCosecha.categoria_3_cantidad));
          }

          const cultivoData = await obtenerCultivo(data.cultivo_id);
          setCultivo(cultivoData);
        }
        setCargandoDatos(false);
      }
      cargar();
    }, [id])
  );

  async function handleGuardar() {
    setGuardando(true);

    const resultado = await editarActividad(id, {
      actividad: esCosecha ? 'Cosecha' : actividad,
      fecha: new Date(fecha).getTime(),
      observaciones,
      crearRecordatorio,
      diasRecordatorio: crearRecordatorio ? Number(diasRecordatorio) : undefined,
      categoria1Cantidad: cantidad1 ? Number(cantidad1) : 0,
      categoria2Cantidad: cantidad2 ? Number(cantidad2) : 0,
      categoria3Cantidad: cantidad3 ? Number(cantidad3) : 0,
    });

    setGuardando(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.error ?? 'No se pudo actualizar la actividad.');
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
      <ScreenHeader titulo="Editar actividad" />

      <View style={styles.contenido}>
        <Text style={styles.label}>Cultivo</Text>
        <View style={[styles.input, styles.inputDeshabilitado]}>
          <Text style={styles.textoDeshabilitado}>{cultivo?.nombre}</Text>
        </View>

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={fecha}
          onChangeText={setFecha}
          editable={!guardando}
        />

        {/* El tipo (Cosecha/Otra) no se puede cambiar al editar,
            porque cambiaría la estructura de datos asociada
            (crear/eliminar el registro de cosecha) */}
        {!esCosecha ? (
          <>
            <Text style={styles.label}>Actividad</Text>
            <TextInput
              style={styles.input}
              value={actividad}
              onChangeText={setActividad}
              editable={!guardando}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Cantidad por categoría</Text>
            <TextInput
              style={styles.input}
              placeholder={cultivo?.categoria_1 ?? 'Primera'}
              value={cantidad1}
              onChangeText={setCantidad1}
              keyboardType="numeric"
              editable={!guardando}
            />
            <TextInput
              style={[styles.input, styles.inputEspaciado]}
              placeholder={cultivo?.categoria_2 ?? 'Segunda'}
              value={cantidad2}
              onChangeText={setCantidad2}
              keyboardType="numeric"
              editable={!guardando}
            />
            <TextInput
              style={[styles.input, styles.inputEspaciado]}
              placeholder={cultivo?.categoria_3 ?? 'Tercera'}
              value={cantidad3}
              onChangeText={setCantidad3}
              keyboardType="numeric"
              editable={!guardando}
            />
          </>
        )}

        <View style={styles.filaToggle}>
          <Text style={styles.label}>¿Crear recordatorio?</Text>
          <Switch
            value={crearRecordatorio}
            onValueChange={setCrearRecordatorio}
            disabled={guardando}
          />
        </View>

        {crearRecordatorio && (
          <>
            <Text style={styles.label}>Repetir cada (días)</Text>
            <TextInput
              style={styles.input}
              value={diasRecordatorio}
              onChangeText={setDiasRecordatorio}
              keyboardType="numeric"
              editable={!guardando}
            />
          </>
        )}

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
  label: { fontSize: 13, fontWeight: '600', color: '#8B6F47', marginBottom: 8, marginTop: 16 },
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
  inputEspaciado: { marginTop: 8 },
  inputDeshabilitado: { backgroundColor: '#eee' },
  textoDeshabilitado: { fontSize: 16, color: '#666' },
  filaToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
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