import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ClipboardTextIcon, CurrencyDollarIcon, PencilSimpleIcon, TrashIcon, UsersIcon } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cultivo } from '../cultivosRepository';
import { borrarCultivo, obtenerCultivo } from '../cultivosService';

export default function CultivoDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [cultivo, setCultivo] = useState<Cultivo | null>(null);
    const [cargando, setCargando] = useState(true);

    useFocusEffect(
        useCallback(() => {
    async function cargar(){
       setCargando(true);
     const data = await obtenerCultivo(id);
     setCultivo(data);
     setCargando(false);
    }
    cargar();
        }, [id])
    );

    async function handleEditar() {
        router.push(`/cultivos/${id}/editar`);
    }

    async function handleBorrar() {
        Alert.alert(
            'Eliminar Cultivo',
            `¿Estás seguro de que deseas borrar este cultivo? Esta accion eliminará 
            tambien las actividades, mano de obra y finanzas asociadas.`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await borrarCultivo(id);
                        router.back();
                    },
                },
            ]);
        }

        async function irARegistrar(tipo: 'actividad' | 'mano-obra' | 'finanzas') {
            Alert.alert('En desarrollo', `La funcionalidad de registrar ${tipo} aún no está disponible.`);
        }

        if (cargando || !cultivo) {
            return (
                <View style={styles.container}>
                    <Text>Cargando...</Text>
                </View>
            );
        } return (
         <ScrollView contentContainerStyle={styles.container}>
         <ScreenHeader titulo={cultivo.nombre} />

      <Text style={styles.fechaSiembra}>
        sembrado: {new Date(cultivo.fecha_siembra).toLocaleDateString('es-CO')}
        </Text>

         <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Balance:</Text>
          <Text style={styles.statValor}>—</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Actividades:</Text>
          <Text style={styles.statValor}>—</Text>
        </View>
      </View>

      <View style={styles.seccion}>
  <Text style={styles.seccionTitulo}>Registrar</Text>
  <View style={styles.filaBotones}>
    <TouchableOpacity
      style={styles.botonRegistrar}
      onPress={() => irARegistrar('actividad')}
    >
      <ClipboardTextIcon size={18} color="#1A501A" weight="regular" />
      <Text style={styles.botonRegistrarTexto}>Actividad</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.botonRegistrar}
      onPress={() => irARegistrar('mano-obra')}
    >
      <UsersIcon size={18} color="#1A501A" weight="regular" />
      <Text style={styles.botonRegistrarTexto}>Mano de obra</Text>
    </TouchableOpacity>
  </View>
  <TouchableOpacity
    style={[styles.botonRegistrar, styles.botonAnchoCompleto]}
    onPress={() => irARegistrar('finanzas')}
  >
    <CurrencyDollarIcon size={18} color="#1A501A" weight="regular" />
    <Text style={styles.botonRegistrarTexto}>Finanzas</Text>
  </TouchableOpacity>
  </View>
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Información</Text>
        <View style={styles.infoCard}>

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
      </View>

      <View style={styles.filaBotones}>
        <TouchableOpacity style={styles.botonEditar} onPress={handleEditar}>
           <PencilSimpleIcon size={24} color="#1A501A" weight="regular" />
          <Text style={styles.botonEditarTexto}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonEliminar} onPress={handleBorrar}>
          <TrashIcon size={24} color="#D62626" weight="regular" />
          <Text style={styles.botonEliminarTexto}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    )
    }

const styles = StyleSheet.create({
  container: { backgroundColor: '#F3F7F0', flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  flechaAtras: { fontSize: 22, color: '#1A501A' },
  tituloHeader: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 22,
    color: '#1A501A',
  },
  fechaSiembra: { fontSize: 14, color: '#8B6F47', marginBottom: 16, marginTop: 10, textAlign:'center' },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 16, paddingHorizontal: 20 },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#1A501A',
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: { fontSize: 16, color: '#8B6F47', paddingHorizontal: 20 },
  statValor: { fontSize: 18, fontWeight: 'bold', color: '#1A501A', marginTop: 4, paddingHorizontal: 20},
  seccion: { marginBottom: 20, paddingHorizontal: 20 },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', color: '#8B6F47', marginBottom: 10, paddingHorizontal: 20 },
  filaBotones: { flexDirection: 'row', gap: 8},
  botonRegistrar: {
    flex: 1,
    justifyContent:'center',
    flexDirection:'column',
    gap:6,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    backgroundColor:'#ffffff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    height: 52,
  },
  botonAnchoCompleto: { marginTop: 8, flex: undefined, paddingHorizontal: 20,height:52},
  botonRegistrarTexto: { color: '#000000', fontWeight: '600', fontSize: 16,  paddingHorizontal: 20, },
  infoCard:{ backgroundColor: '#FFFFFF',borderRadius: 8,padding: 14,},
  filaInfo: { flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',paddingVertical: 12, borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',},
  infoLabel: { flex:1, fontSize: 16, color: '#8B6F47'},
  infoValor: { flex: 1,fontSize: 16, color: '#00000', textAlign:'right', marginTop: 2 },
  botonEditar: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 20,
    borderColor: '#1A501A',
    borderWidth: 1,

  },
  botonEditarTexto: { color: '#1A501A', fontWeight: 'bold' },

  botonEliminar: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    gap:6,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 20,
    borderColor: '#DC2626',
    borderWidth: 1,
  },
  botonEliminarTexto: { color: '#DC2626', fontWeight: 'bold' },

});
