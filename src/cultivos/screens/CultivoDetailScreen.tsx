import { Actividad, listarActividadesPorCultivo } from '@/actividades/actividadesRepository';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Cultivo } from '../cultivosRepository';
import { borrarCultivo, obtenerCultivo } from '../cultivosService';

export default function CultivoDetailScreen() {
const router = useRouter();

const { id } = useLocalSearchParams<{ id: string }>();
const [cultivo, setCultivo] = useState <Cultivo | null>(null);
const [cargando, setCargando] = useState(true);
const [actividades, setActividades] = useState<Actividad[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function cargar() {
        setCargando(true);
        const data = await obtenerCultivo(id);
        setCultivo(data);
        setCargando(false);
      }
      cargar();
    }, [id])
  );

  useFocusEffect(
  useCallback(() => {
    async function cargarActividades() {
      const resultado = await listarActividadesPorCultivo(id);
      setActividades(resultado);
    }

    cargarActividades();
  }, [id])
);

  function handleEditar() {
    router.push(`/cultivos/${id}/editar`);
  }

  function handleEliminar() {
    Alert.alert(
      'Eliminar cultivo',
      '¿Seguro que quieres eliminar este cultivo? Esta acción también eliminará sus actividades, mano de obra y finanzas asociadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await borrarCultivo(id);
            router.back();
          },
        },
      ]
    );
  }

  function irARegistrar(tipo: 'actividad' | 'mano-obra' | 'finanzas') {
    if(!cultivo) return;

  if (tipo === 'actividad') {
    router.push(`/actividades/cultivo/${cultivo.id}`);
    return;
  }
  Alert.alert(`El registro de ${tipo} estará disponible pronto.`);
}

  if (cargando || !cultivo) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
      titulo={cultivo.nombre}
      mostrarFlechaAtras={true}
      />
    <ScrollView contentContainerStyle={styles.contenido}>
      <Text style={styles.fechaSiembra}>
        Sembrado: {new Date(cultivo.fecha_siembra).toLocaleDateString('es-CO')}
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Balance:</Text>
          <Text style={styles.statValor}>—</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Actividades:</Text>
         <Text style={styles.statValor}>{actividades.length}</Text>
        </View>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Registrar</Text>
        <View style={styles.filaBotones}>
          <TouchableOpacity
            style={styles.botonRegistrar}
            onPress={() => irARegistrar('actividad')}
          >
            <Text style={styles.botonRegistrarTexto}>Actividad</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botonRegistrar}
            onPress={() => irARegistrar('mano-obra')}
          >
            <Text style={styles.botonRegistrarTexto}>Mano de obra</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.botonRegistrar, styles.botonAnchoCompleto]}
          onPress={() => irARegistrar('finanzas')}
        >
          <Text style={styles.botonRegistrarTexto}>Finanzas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Información</Text>

        <View style={styles.filaInfo}>
          <Text style={styles.infoLabel}>Unidad de medida:</Text>
          <Text style={styles.infoValor}>{cultivo.unidad_medida}</Text>
        </View>

        <View style={styles.filaInfo}>
          <Text style={styles.infoLabel}>Categorías de calidad:</Text>
          <Text style={styles.infoValor}>
            {cultivo.categoria_1}, {cultivo.categoria_2}, {cultivo.categoria_3}
          </Text>
        </View>

        {cultivo.observaciones ? (
          <View style={styles.filaInfo}>
            <Text style={styles.infoLabel}>Observaciones:</Text>
            <Text style={styles.infoValor}>{cultivo.observaciones}</Text>
          </View>
        ) : null}
      </View>
      
      <View style={styles.filaBotones}>
        <TouchableOpacity style={styles.botonEditar} onPress={handleEditar}>
          <Text style={styles.botonEditarTexto}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonEliminar} onPress={handleEliminar}>
          <Text style={styles.botonEliminarTexto}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F3F7F0', flexGrow: 1 },
   contenido: {padding: 20, flexGrow: 1},
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  flechaAtras: { fontSize: 22, color: '#1A501A' },
  tituloHeader: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 22,
    color: '#1A501A',
  },
  fechaSiembra: { fontSize: 12, color: '#8B6F47', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  statLabel: { fontSize: 12, color: '#8B6F47' },
  statValor: { fontSize: 18, fontWeight: 'bold', color: '#1A501A', marginTop: 4 },
  seccion: { marginBottom: 20 },
  seccionTitulo: { fontSize: 15, fontWeight: 'bold', color: '#1A501A', marginBottom: 10 },
  filaBotones: { flexDirection: 'row', gap: 8 },
  botonRegistrar: {flex: 1, borderWidth: 1, borderColor: '#1A501A', borderRadius: 8, padding: 12, alignItems: 'center'},

  botonAnchoCompleto: { marginTop: 8, flex: undefined },
  botonRegistrarTexto: { color: '#1A501A', fontWeight: '600', fontSize: 13 },
  filaInfo: { marginBottom: 12 },
  infoLabel: { fontSize: 12, color: '#8B6F47' },
  infoValor: { fontSize: 14, color: '#333', marginTop: 2 },
  botonEditar: {
    flex: 1,
    backgroundColor: '#1A501A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center'},

  botonEditarTexto: { color: '#fff', fontWeight: 'bold' },
  botonEliminar: {
    flex: 1,
    backgroundColor: '#B91C1C',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center'
  },

  botonEliminarTexto: { color: '#fff', fontWeight: 'bold' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
}
);