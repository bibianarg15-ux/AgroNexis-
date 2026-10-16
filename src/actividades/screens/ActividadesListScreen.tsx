import { Cultivo } from '@/cultivos/cultivosRepository';
import { obtenerCultivo } from '@/cultivos/cultivosService';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFeedback } from '@/shared/feedback/feedbackProvider';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { BasketIcon, BellIcon, ClipboardTextIcon, DotsThreeVerticalIcon } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Actividad, ActividadConCultivo } from '../actividadesRepository';
import { borrarActividad, cambiarEstadoRecordatorio, listarActividadesDelCultivo, listarTodasActividadesDelUsuario, } from '../actividadesService';

export default function ActividadesListScreen() {
  const router = useRouter();
  const {mostrarExito, confirmar} = useFeedback();
  const { cultivoId } = useLocalSearchParams<{ cultivoId?: string }>();
  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [actividades, setActividades] = useState<(Actividad | ActividadConCultivo)[]>([]);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] =useState('');

  useFocusEffect(
    useCallback(() => {
      async function cargar() {
        setCargando(true);

        if (cultivoId) {
          // Vista de un cultivo específico
          const [cultivoData, lista] = await Promise.all([
            obtenerCultivo(cultivoId),
            listarActividadesDelCultivo(cultivoId),
          ]);
          setCultivo(cultivoData);
          setActividades(lista);
        } else {
          // Vista general: todas las actividades de todos los cultivos
          const lista = await listarTodasActividadesDelUsuario();
          setActividades(lista);
        }

        setCargando(false);
      }
      cargar();
    }, [cultivoId])
  );

  function irANuevaActividad() {

    if (cultivoId) {
      router.push(`/actividades/nueva?cultivoId=${cultivoId}`);
    } else {
      // Sin cultivo preseleccionado: el formulario pedirá elegir uno
      router.push('/actividades/nueva');
    }
  }

  function irAEditar(id: string) {
    setMenuAbierto(null);
    router.push(`/actividades/${id}/editar`);
  }

  async function handleEliminar(id: string) {
    setMenuAbierto(null);
    const confirmado = await confirmar({
      titulo:'Eliminar actividad',
      mensaje:'¿Seguro que quieres eliminarla?',
      textoConfirmar:'Eliminar' ,
      destructivo: true,
    })

    if(!confirmado) return;
          await borrarActividad(id);
          mostrarExito('Actividad eliminada')
          recargar();
        };

  //Filtrar actividades por nombre
  const actividadesFiltradas = actividades.filter((a) => 
    a.actividad.toLowerCase().includes(busqueda.toLowerCase())
  )

  async function handleToggleRecordatorio(item: Actividad) {
    setMenuAbierto(null);
    await cambiarEstadoRecordatorio(item.id, item.crear_recordatorio === 0);
    recargar();
  }

  async function recargar() {
    if (cultivoId) {
      const lista = await listarActividadesDelCultivo(cultivoId);
      setActividades(lista);
    } else {
      const lista = await listarTodasActividadesDelUsuario();
      setActividades(lista);
    }
  }

  return (
    <View style={styles.container}>
     <ScreenHeader 
     titulo={cultivoId ? cultivo?.nombre ?? 'Cargando...' : 'Actividades'} 
     mostrarFlechaAtras={true} 
     mostrarBotonAgregar={true} 
     onAgregar={irANuevaActividad}
/>
    <View style ={ styles.buscadorContainer}>
      <TextInput
      style = { styles.buscador}
      placeholder='Buscar actividad'
      value = {busqueda}
      onChangeText={setBusqueda}
      />
      </View>
    
      {!cargando && actividades.length === 0 ? (
              <View style={styles.vacioContainer}>
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.logoVacio}
                  resizeMode="contain"
                />
      
                <Text style={styles.vacioTitulo}>
                  ¡Aún no tienes actividades registradas!
                </Text>
      
                <Text style={styles.vacioSubtitulo}>
                  Registra tu primer actividad para empezar a llevar el control
                </Text>
      
                <TouchableOpacity
                  style={styles.botonPrincipal}
                  onPress={ irANuevaActividad}
                >
                  <Text style={styles.botonPrincipalTexto}>
                    + Agregar actividad
                  </Text>
                </TouchableOpacity>
              </View>
            )  : (
        <>
          <FlatList
            data={actividadesFiltradas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <View style={styles.card}>

                <View style={styles.cardHeader}>
                 {item.es_cosecha ? (
                  <BasketIcon size={24} color="#1A501A" />) : (
                  <ClipboardTextIcon size={24} color="#1A501A" />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitulo}>
                      {item.es_cosecha ? 'Cosecha' : item.actividad}
                    </Text>
                    <Text style={styles.cardFecha}>
                      {new Date(item.fecha).toLocaleDateString('es-CO')}
                      {'cultivo_nombre' in item ? ` · ${item.cultivo_nombre}` : ''}
                    </Text>
                  </View>
                  {item.crear_recordatorio === 1 && (
                    <BellIcon size={22} color="#E0BC00" weight="fill" />
                  )}
                  <TouchableOpacity
                    onPress={() => setMenuAbierto(menuAbierto === item.id ? null : item.id)}
                  >
                    <DotsThreeVerticalIcon size={24} color="#8B6F47" weight="bold" />
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
                    {item.crear_recordatorio === 1 && (
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleToggleRecordatorio(item)}
                      >
                        <Text style={styles.menuItemTexto}>Desactivar recordatorio</Text>
                      </TouchableOpacity>
                    )}
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
  vacioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logoVacio: {width: 80, height: 80, marginBottom: 16}, 
  vacioTitulo: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#000000'  },
  vacioSubtitulo: {fontSize: 16, color: "#8B6F47", textAlign: "center", marginBottom: 24},
  botonPrincipal: { backgroundColor: '#1A501A', borderRadius: 8, padding: 14, paddingHorizontal: 24 },
  botonPrincipalTexto: { color: '#ffffff', fontWeight: 'semibold' },
  lista: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  cardFecha: { fontSize: 14, color: '#8B6F47', marginTop: 2 },
  menu: { marginTop: 10, borderTopWidth: 1, paddingTop: 8 },
  menuItem: { paddingVertical: 8 },
  menuItemTexto: { fontSize: 14, color: '#333333' },
  botonAgregar: { color: '#fff', fontSize: 28, fontWeight: 'bold' },

  buscadorContainer: { paddingHorizontal: 16, paddingTop: 12 },
buscador: {
  borderWidth: 0.5,
  borderColor: '#9CA3AF',
  borderRadius: 8,
  padding: 12,
  backgroundColor: '#fff',
  fontSize: 15,
},
});