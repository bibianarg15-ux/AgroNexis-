import { Cultivo } from '@/cultivos/cultivosRepository';
import { listarCultivosDelUsuario, obtenerCultivo } from '@/cultivos/cultivosService';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { registrarActividad } from '../actividadesService';

export default function NuevaActividadScreen() {
  const router = useRouter();
  const { cultivoId: cultivoIdParam } = useLocalSearchParams<{ cultivoId?: string }>();

  const [cultivoSeleccionado, setCultivoSeleccionado] = useState<Cultivo | null>(null);
  const [cultivosDisponibles, setCultivosDisponibles] = useState<Cultivo[]>([]);
  const [tipo, setTipo] = useState<'cosecha' | 'otra'>('otra');
  const [actividad, setActividad] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [observaciones, setObservaciones] = useState('');
  const [crearRecordatorio, setCrearRecordatorio] = useState(false);
  const [diasRecordatorio, setDiasRecordatorio] = useState('8');
  const [cantidad1, setCantidad1] = useState('');
  const [cantidad2, setCantidad2] = useState('');
  const [cantidad3, setCantidad3] = useState('');
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

    const resultado = await registrarActividad({
      cultivoId: cultivoSeleccionado.id,
      actividad: tipo === 'cosecha' ? 'Cosecha' : actividad,
      fecha: new Date(fecha).getTime(),
      esCosecha: tipo === 'cosecha',
      observaciones,
      crearRecordatorio,
      diasRecordatorio: crearRecordatorio ? Number(diasRecordatorio) : undefined,
      categoria1Cantidad: cantidad1 ? Number(cantidad1) : 0,
      categoria2Cantidad: cantidad2 ? Number(cantidad2) : 0,
      categoria3Cantidad: cantidad3 ? Number(cantidad3) : 0,
    });

    setCargando(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.error ?? 'No se pudo guardar la actividad.');
      return;
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader titulo="Nueva actividad" />

      <View style={styles.contenido}>
        <Text style={styles.label}>Cultivo</Text>

        {cultivoIdParam ? (
          <View style={[styles.input, styles.inputDeshabilitado]}>
            <Text style={styles.textoDeshabilitado}>
              {cultivoSeleccionado?.nombre ?? 'Cargando...'}
            </Text>
          </View>
        ) : cultivoSeleccionado ? (
          <TouchableOpacity
            style={styles.input}
            onPress={() => setCultivoSeleccionado(null)}
          >
            <Text style={styles.textoSeleccionado}>{cultivoSeleccionado.nombre}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.listaSelector}>
            {cultivosDisponibles.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.opcionCultivo}
                onPress={() => setCultivoSeleccionado(c)}
              >
                <Text style={styles.opcionCultivoTexto}>{c.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
         <Text style={styles.label}>Tipo de actividad</Text>
        <View style={styles.selector}>
          <TouchableOpacity
            style={[styles.selectorBoton, tipo === 'cosecha' && styles.selectorBotonActivo]}
            onPress={() => setTipo('cosecha')}
          >
            <Text style={[styles.selectorTexto, tipo === 'cosecha' && styles.selectorTextoActivo]}>
              Cosecha
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectorBoton, tipo === 'otra' && styles.selectorBotonActivo]}
            onPress={() => setTipo('otra')}
          >
            <Text style={[styles.selectorTexto, tipo === 'otra' && styles.selectorTextoActivo]}>
              Otra actividad
            </Text>
          </TouchableOpacity>
        </View>

        {tipo === 'otra' ? (
          <>
            <Text style={styles.label}>Actividad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Fumigación"
              value={actividad}
              onChangeText={setActividad}
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
 
          </>
        ) : (
          <>
          <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={fecha}
          onChangeText={setFecha}
          editable={!cargando}/>
          
            <Text style={styles.label}>Cantidad por categoría</Text>
            <Text style={styles.label}>{cultivoSeleccionado?.categoria_1 ?? 'Primera'}</Text>
            <TextInput
              style={styles.input}
              placeholder='0'
              value={cantidad1}
              onChangeText={setCantidad1}
              keyboardType="numeric"
              editable={!cargando}
            />
             <Text style={styles.label}>{cultivoSeleccionado?.categoria_2 ?? 'Segunda'}</Text>
            <TextInput
              style={[styles.input, styles.inputEspaciado]}
              placeholder='0'
              value={cantidad2}
              onChangeText={setCantidad2}
              keyboardType="numeric"
              editable={!cargando}
            />
            <Text style={styles.label}>{cultivoSeleccionado?.categoria_3 ?? 'Tercera'}</Text> 
            <TextInput
              style={[styles.input, styles.inputEspaciado]}
              placeholder= '0'
              value={cantidad3}
              onChangeText={setCantidad3}
              keyboardType="numeric"
              editable={!cargando}
            />
          </>
      
        )}

        <View style={styles.filaToggle}>
          <Text style={styles.label}>¿Crear recordatorio?</Text>
          <Switch
            value={crearRecordatorio}
            onValueChange={setCrearRecordatorio}
            disabled={cargando}
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
              editable={!cargando}
            />
          </>
        )}

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
            {cargando ? 'Guardando...' : 'Guardar'}
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
    borderColor: '#000000',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    fontSize: 18,
    height: 52,
    justifyContent: 'center',
  },
  inputEspaciado: { marginTop: 8 },
  inputDeshabilitado: { backgroundColor: '#eeeeee' },
  textoDeshabilitado: { fontSize: 16, color: '#666666' },
  textoSeleccionado: { fontSize: 16, color: '#1A501A', fontWeight: '600' },
  listaSelector: { gap: 8 },
  opcionCultivo: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  opcionCultivoTexto: { fontSize: 15, color: '#000000' },
  selector: { flexDirection: 'row', gap: 10, marginTop: 16 },
  selectorBoton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1A501A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectorBotonActivo: { backgroundColor: '#1A501A' },
  selectorTexto: { color: '#1A501A', fontWeight: '600' },
  selectorTextoActivo: { color: '#ffffff' },
  filaToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  boton: {
    backgroundColor: '#1A501A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    height: 52,
  },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
});
