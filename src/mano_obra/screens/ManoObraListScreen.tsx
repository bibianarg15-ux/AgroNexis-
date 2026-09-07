import { Cultivo } from '@/cultivos/cultivosRepository';
import { obtenerCultivo } from '@/cultivos/cultivosService';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { obtenerManoObraPorCultivo, obtenerTodaLaManoObra, SemanaAgrupada } from '../manoObraService';

export default function ManoObraListScreen() {
  const router = useRouter();
const { cultivoId } = useLocalSearchParams<{ cultivoId?: string }>();

  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [semanas, setSemanas] = useState<SemanaAgrupada[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function cargar() {
        setCargando(true);
        if (cultivoId) {
          const [cultivoData, lista] = await Promise.all([
            obtenerCultivo(cultivoId),
            obtenerManoObraPorCultivo(cultivoId),
          ]);
          setCultivo(cultivoData);
          setSemanas(lista);
        } else {
          const lista = await obtenerTodaLaManoObra();
          setSemanas(lista);
        }
        setCargando(false);
      }
      cargar();
    }, [cultivoId])
  );

  function irANuevoJornal() {
    if (cultivoId) {
      router.push(`/mano-obra/nuevo?cultivoId=${cultivoId}`);
    } else {
      router.push('/mano-obra/nuevo');
    }
  }

  function irADetalleTrabajador(trabajadorId: string) {
    const query = cultivoId ? `?cultivoId=${cultivoId}` : '';
    router.push(`/mano-obra/trabajador/${trabajadorId}${query}`);
  }

  // Filtra trabajadores por nombre.
  const semanasFiltradas = semanas
    .map((semana) => ({
      ...semana,
      trabajadores: semana.trabajadores.filter((t) =>
        t.nombre.toLowerCase().includes(busqueda.toLowerCase())
      ),
    }))
    .filter((semana) => semana.trabajadores.length > 0);

  return (
    <View style={styles.container}>
      <ScreenHeader
        titulo={cultivoId ? cultivo?.nombre ?? 'Cargando...' : 'Mano de obra'}
        mostrarFlechaAtras={!!cultivoId}
        mostrarBotonAgregar
        onAgregar={irANuevoJornal}
      />

      <View style={styles.buscadorContainer}>
        <TextInput
          style={styles.buscador}
          placeholder="Buscar trabajador"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {!cargando && semanas.length === 0 ? (
        <View style={styles.vacioContainer}>
          <Text style={styles.vacioTitulo}>Aún no tienes jornales registrados</Text>
          <TouchableOpacity style={styles.botonPrincipal} onPress={irANuevoJornal}>
            <Text style={styles.botonPrincipalTexto}>+ Registrar jornal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={semanasFiltradas}
            keyExtractor={(item) => String(item.inicio)}
            contentContainerStyle={styles.lista}
            renderItem={({ item: semana }) => (
              <View style={styles.semanaBloque}>
                <Text style={styles.semanaTitulo}>Semana {semana.textoRango}</Text>

                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Total semana</Text>
                  <Text style={styles.totalValor}>
                    ${semana.totalSemana.toLocaleString('es-CO')}
                  </Text>
                  <Text style={styles.totalSubtexto}>
                    {semana.trabajadores.length} Trabajadores · {semana.totalJornales} jornales
                  </Text>
                </View>

                {semana.trabajadores.map((t) => (
                  <TouchableOpacity
                    key={t.trabajadorId}
                    style={styles.trabajadorCard}
                    onPress={() => irADetalleTrabajador(t.trabajadorId)}
                  >
                    <View>
                      <Text style={styles.trabajadorNombre}>{t.nombre}</Text>
                      <Text style={styles.trabajadorDetalle}>
                        {t.jornales.length} jornales
                        {!cultivoId ? ` · ${t.jornales[0]?.cultivo_nombre}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.trabajadorTotal}>
                      ${t.totalTrabajador.toLocaleString('es-CO')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7F0' },
  buscadorContainer: { padding: 16, paddingBottom: 8 },
  buscador: {
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  vacioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  vacioTitulo: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  botonPrincipal: { backgroundColor: '#1A501A', borderRadius: 8, padding: 14, paddingHorizontal: 24 },
  botonPrincipalTexto: { color: '#ffffff', fontWeight: 'bold' },
  lista: { padding: 16, paddingTop: 0 },
  semanaBloque: { marginBottom: 20 },
  semanaTitulo: { fontSize: 14, color: '#8B6F47', marginBottom: 8 },
  totalCard: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 10 },
  totalLabel: { fontSize: 16, color: '#8B6F47' },
  totalValor: { fontSize: 24, fontWeight: 'bold', color: '#1A501A', marginTop: 2 },
  totalSubtexto: { fontSize: 14, color: '#8B6F47', marginTop: 4 },
  trabajadorCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trabajadorNombre: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  trabajadorDetalle: { fontSize: 14, color: '#8B6F47', marginTop: 2 },
  trabajadorTotal: { fontSize: 18, fontWeight: 'bold', color: '#1A501A' },
});