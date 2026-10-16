import { Cultivo } from '@/cultivos/cultivosRepository';
import { obtenerCultivo } from '@/cultivos/cultivosService';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFeedback } from '@/shared/feedback/feedbackProvider';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowDownIcon, ArrowUpIcon, DotsThreeVerticalIcon } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Finanza } from '../finanzasRepository';
import { borrarFinanza, obtenerFinanzasDelCultivo } from '../finanzasService';


export default function FinanzasCultivoScreen() {
  const router = useRouter();
  const { cultivoId } = useLocalSearchParams<{ cultivoId: string }>();

  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [movimientos, setMovimientos] = useState<Finanza[]>([]);
  const [ingresos, setIngresos] = useState(0);
  const [egresos, setEgresos] = useState(0);
  const [balance, setBalance] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todo' | 'ingreso' | 'egreso'>('todo');
  const { confirmar, mostrarExito} = useFeedback();

  useFocusEffect(
  useCallback(() => {
    if (cultivoId) {
      cargar();
    }
  }, [cultivoId])
); 

const movimientosFiltrados = movimientos.filter((m) => {
      const coincideTipo = filtroTipo === 'todo' || m.tipo === filtroTipo;
      const coincideBusqueda = m.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      return coincideTipo && coincideBusqueda;
    });

async function cargar() {
  if (!cultivoId) {
    setCargando(false);
    return;
  }

  try {
    setCargando(true);

    const [cultivoData, data] = await Promise.all([
      obtenerCultivo(cultivoId),
      obtenerFinanzasDelCultivo(cultivoId),
    ]);

    setCultivo(cultivoData);
    setMovimientos(data.movimientos);
    setIngresos(data.balance.ingresos);
    setEgresos(data.balance.egresos);
    setBalance(data.balance.balance);

  } catch (error) {
    console.error('Error al cargar finanzas:', error);
  } finally {
    setCargando(false);
  }
}
  
  function irANuevoMovimiento() {
    router.push(`/finanzas/nuevo?cultivoId=${cultivoId}`);
  }

  function irAEditar(id: string) {
    setMenuAbierto(null);
    router.push(`/finanzas/${id}/editar`);
  }

  async function handleEliminar(id: string) {
    setMenuAbierto(null);
    const confirmado = await confirmar({
      titulo: 'Eliminar movimiento',
      mensaje: '¿Seguro que quieres eliminarlo?',
      textoConfirmar: 'Eliminar',
      destructivo: true
    });

    if(!confirmado) return; 
          await borrarFinanza(id);
          mostrarExito('Movimiento eliminado');
          cargar();
        }

  return (
    <View style={styles.container}>
      <ScreenHeader titulo={cargando ? 'Cargando...' : cultivo?.nombre ?? 'Cultivo'}
     mostrarFlechaAtras={!!cultivoId}
     mostrarBotonAgregar={!!cultivoId}
     onAgregar={irANuevoMovimiento}
/>

      <View style={styles.resumenCard}>
        <View style={styles.resumenFila}>
          <View>
            <Text style={styles.resumenLabel}>Ingresos</Text>
            <Text style={[styles.resumenValor, { color: '#1A501A' }]}>
              +${ingresos.toLocaleString('es-CO')}
            </Text>
          </View>
          <View>
            <Text style={styles.resumenLabel}>Egresos</Text>
            <Text style={[styles.resumenValor, { color: '#B91C1C' }]}>
              -${egresos.toLocaleString('es-CO')}
            </Text>
          </View>
        </View>
        <View style={styles.balanceDivisor} />
        <Text style={styles.balanceLabel}>
          Balance total:{' '}
          <Text style={{ color: balance >= 0 ? '#1A501A' : '#B91C1C', fontWeight: 'bold' }}>
            {balance >= 0 ? '+' : '-'}${Math.abs(balance).toLocaleString('es-CO')}
          </Text>
        </Text>
      </View>

      <View style ={ styles.buscadorContainer}>
      <TextInput 
      style = { styles.buscador}
      placeholder="Buscar movimientos..."
      value={busqueda}
      onChangeText={setBusqueda}
    />
    </View>
    <View style = { styles.filtrosContainer}>
      <TouchableOpacity
        style={[styles.filtroBoton, filtroTipo === 'todo' && styles.filtroBotonActivo]}
        onPress={() => setFiltroTipo('todo')}
      >
        <Text style={[styles.filtroTexto, filtroTipo === 'todo' && styles.filtroTextoActivo]}>
          Todos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filtroBoton, filtroTipo === 'ingreso' && styles.filtroBotonActivo]}
        onPress={() => setFiltroTipo('ingreso')}
      >
        <Text style={[styles.filtroTexto, filtroTipo === 'ingreso' && styles.filtroTextoActivo]}>
          Ingresos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filtroBoton, filtroTipo === 'egreso' && styles.filtroBotonActivo]}
        onPress={() => setFiltroTipo('egreso')}
      >
        <Text style={[styles.filtroTexto, filtroTipo === 'egreso' && styles.filtroTextoActivo]}>
          Egresos
        </Text>
      </TouchableOpacity>
    </View>

      {!cargando && movimientos.length === 0 ? (
        <View style={styles.vacioContainer}>
          <Text style={styles.vacioTitulo}>Aún no tienes movimientos registrados</Text>
          <TouchableOpacity style={styles.botonPrincipal} onPress={irANuevoMovimiento}>
            <Text style={styles.botonPrincipalTexto}>+ Registrar movimiento</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={movimientosFiltrados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  {item.tipo === 'ingreso' ? (
                    <ArrowUpIcon size={18} color="#1A501A" weight="bold" />
                  ) : (
                    <ArrowDownIcon size={18} color="#B91C1C" weight="bold" />
                  )}
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.cardDescripcion}>{item.descripcion}</Text>
                    <Text style={styles.cardFecha}>
                      {new Date(item.fecha).toLocaleDateString('es-CO')}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.cardValor,
                      { color: item.tipo === 'ingreso' ? '#1A501A' : '#B91C1C' },
                    ]}
                  >
                    {item.tipo === 'ingreso' ? '+' : '-'}${item.valor.toLocaleString('es-CO')}
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7F0' },
  resumenCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, margin: 16 },
  resumenFila: { flexDirection: 'row', justifyContent: 'space-between' },
  resumenLabel: { fontSize: 16, color: '#8B6F47' },
  resumenValor: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  balanceDivisor: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  balanceLabel: { fontSize: 16, color: '#8B6F47' },
  vacioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  vacioTitulo: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  botonPrincipal: { backgroundColor: '#1A501A', borderRadius: 8, padding: 14, paddingHorizontal: 24 },
  botonPrincipalTexto: { color: '#fff', fontWeight: 'bold' },
  lista: { padding: 16, paddingTop: 0 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardDescripcion: { fontSize: 18, fontWeight: '600', color: '#000000' },
  cardFecha: { fontSize: 12, color: '#8B6F47', marginTop: 2 },
  cardValor: { fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  menu: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  menuItem: { paddingVertical: 8 },
  menuItemTexto: { fontSize: 14, color: '#000000' },

  buscadorContainer: { paddingHorizontal: 16, marginBottom: 10 },
buscador: {
  borderWidth: 0.5,
  borderColor: '#9CA3AF',
  borderRadius: 8,
  padding: 12,
  backgroundColor: '#fff',
  fontSize: 15,
},
filtrosContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
filtroBoton: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#9CA3AF',
  borderRadius: 8,
  padding: 8,
  alignItems: 'center',
},
filtroBotonActivo: { backgroundColor: '#1A501A', borderColor: '#1A501A' },
filtroTexto: { fontSize: 13, color: '#333' },
filtroTextoActivo: { color: '#fff', fontWeight: '600' },

});