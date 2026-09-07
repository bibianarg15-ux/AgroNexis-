import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { DotsThreeVerticalIcon } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { JornalConDetalle } from '../manoObraRepository';
import { borrarJornal, obtenerManoObraPorCultivo, obtenerTodaLaManoObra } from '../manoObraService';

export default function TrabajadorDetailScreen() {
  const router = useRouter();
  const { trabajadorId, cultivoId } = useLocalSearchParams<{
    trabajadorId: string;
    cultivoId?: string;
  }>();

  const [nombreTrabajador, setNombreTrabajador] = useState('');
  const [jornales, setJornales] = useState<JornalConDetalle[]>([]);
  const [totalAcumulado, setTotalAcumulado] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [trabajadorId, cultivoId])
  );

  async function cargar() {
    setCargando(true);
    const semanas = cultivoId
      ? await obtenerManoObraPorCultivo(cultivoId)
      : await obtenerTodaLaManoObra();

    const jornalesDelTrabajador: JornalConDetalle[] = [];
    let total = 0;

    for (const semana of semanas) {
      const trabajadorEnSemana = semana.trabajadores.find((t) => t.trabajadorId === trabajadorId);
      if (trabajadorEnSemana) {
        jornalesDelTrabajador.push(...trabajadorEnSemana.jornales);
        total += trabajadorEnSemana.totalTrabajador;
        setNombreTrabajador(trabajadorEnSemana.nombre);
      }
    }

    jornalesDelTrabajador.sort((a, b) => b.fecha - a.fecha);
    setJornales(jornalesDelTrabajador);
    setTotalAcumulado(total);
    setCargando(false);
  }

  function irAEditar(id: string) {
    setMenuAbierto(null);
    router.push(`/mano-obra/${id}/editar`);
  }

  function handleEliminar(id: string) {
    setMenuAbierto(null);
    Alert.alert('Eliminar jornal', '¿Seguro que quieres eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await borrarJornal(id);
          cargar();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>

      <ScreenHeader
        titulo={nombreTrabajador || 'Cargando...'}
        mostrarFlechaAtras
      />
      <View style={styles.resumenCard}>
        <Text style={styles.resumenLabel}>Total acumulado</Text>
        <Text style={styles.resumenValor}>${totalAcumulado.toLocaleString('es-CO')}</Text>
        <Text style={styles.resumenSubtexto}>{jornales.length} jornales</Text>
      </View>

      {!cargando && jornales.length === 0 ? (
        <Text style={styles.vacioTexto}>No hay jornales registrados.</Text>
      ) : (
        <FlatList
          data={jornales}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.jornalCard}>
              <View style={styles.jornalCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jornalFecha}>
                    {new Date(item.fecha).toLocaleDateString('es-CO')}
                  </Text>
                  {!cultivoId && (
                    <Text style={styles.jornalCultivo}>{item.cultivo_nombre}</Text>
                  )}
                </View>
                <Text style={styles.jornalValor}>
                  ${item.valor_jornal.toLocaleString('es-CO')}
                </Text>
                <TouchableOpacity
                  onPress={() => setMenuAbierto(menuAbierto === item.id ? null : item.id)}
                >
                  <DotsThreeVerticalIcon size={20} color="#8B6F47" weight="bold" />
                </TouchableOpacity>
              </View>

              {menuAbierto === item.id && (
                <View style={styles.menu}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => irAEditar(item.id)}>
                    <Text style={styles.menuItemTexto}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={() => handleEliminar(item.id)}>
                    <Text style={[styles.menuItemTexto, { color: '#B91C1C' }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7F0' },
  resumenCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, margin: 16 },
  resumenLabel: { fontSize: 14, color: '#8B6F47' },
  resumenValor: { fontSize: 26, fontWeight: 'bold', color: '#1A501A', marginTop: 4 },
  resumenSubtexto: { fontSize: 14, color: '#8B6F47', marginTop: 4 },
  vacioTexto: { textAlign: 'center', color: '#8B6F47', marginTop: 40 },
  lista: { paddingHorizontal: 16 },
  jornalCard: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 8 },
  jornalCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  jornalFecha: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  jornalCultivo: { fontSize: 14, color: '#8B6F47', marginTop: 2 },
  jornalValor: { fontSize: 18, fontWeight: 'bold', color: '#1A501A' },
  menu: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  menuItem: { paddingVertical: 8 },
  menuItemTexto: { fontSize: 16, color: '#000000' },
});
