import ScreenHeader from '@/shared/components/ScreenHeader';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { editarCultivo, obtenerCultivo } from '../cultivosService';
export default function EditarCultivoScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [nombre, setNombre] = useState('');
    const [fechaSiembra, setFechaSiembra] = useState('');
    const [unidadMedida, setUnidadMedida] = useState('');
    const [categoria1, setCategoria1] =useState('');
    const [categoria2, setCategoria2] = useState('');
    const [categoria3, setCategoria3] = useState('');
    const [fechaCosechaEstimada, setFechaCosechaEstimada] = useState('');
    const [crearRecordatorio, setCrearRecordatorio] = useState(false);
    const [observaciones, setObservaciones] = useState('');
    const [cargandoDatos, setCargandoDatos] = useState(false);
    const [guardando, setGuardando] = useState(false);


useFocusEffect(
        useCallback(() => {
    async function cargar(){
       setCargandoDatos(true);
       const cultivo = await obtenerCultivo(id);
    
    if(cultivo) {
        setNombre(cultivo.nombre);
        setFechaSiembra(new Date(cultivo.fecha_siembra).toISOString().slice(0, 10));
        setUnidadMedida(cultivo.unidad_medida);
        setCategoria1(cultivo.categoria_1);
        setCategoria2(cultivo.categoria_2);
        setCategoria3(cultivo.categoria_3);
        setFechaCosechaEstimada
        (cultivo.fecha_cosecha_estimada? new Date(cultivo.fecha_cosecha_estimada).toISOString().slice(0, 10): '');
        setCrearRecordatorio(cultivo.crear_recordatorio_cosecha === 1);
        setObservaciones(cultivo.observaciones ?? '');
    }
        setCargandoDatos(false);
    }
    cargar();
        }, [id])
    );
    async function handleGuardar() {
        setGuardando(true);
        const resultado =  await editarCultivo(id, {
            nombre,
            fechaSiembra:new Date(fechaSiembra).getTime(),
            unidadMedida,
            categoria1,
            categoria2,
            categoria3,
            fechaCosechaEstimada: fechaCosechaEstimada ? new Date(fechaCosechaEstimada).getTime()
            : undefined,
            crearRecordatorioCosecha: crearRecordatorio,
            observaciones,
        });
        setGuardando(false);
        if(!resultado.exito) {
            Alert.alert('Error', resultado.error ?? 'No se pudo actualizar el cultivo.');
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
      <ScreenHeader titulo="Editar cultivo" />

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        editable={!guardando}
      />

      <Text style={styles.label}>Fecha de siembra</Text>
      <TextInput
        style={styles.input}
        placeholder="AAAA-MM-DD"
        value={fechaSiembra}
        onChangeText={setFechaSiembra}
        editable={!guardando}
      />

      <Text style={styles.label}>Unidad de medida</Text>
      <TextInput
        style={styles.input}
        value={unidadMedida}
        onChangeText={setUnidadMedida}
        editable={!guardando}
      />

      <Text style={styles.label}>Categorías de calidad</Text>
      <TextInput
        style={styles.input}
        value={categoria1}
        onChangeText={setCategoria1}
        editable={!guardando}
      />
      <TextInput
        style={[styles.input, styles.inputEspaciado]}
        value={categoria2}
        onChangeText={setCategoria2}
        editable={!guardando}
      />
      <TextInput
        style={[styles.input, styles.inputEspaciado]}
        value={categoria3}
        onChangeText={setCategoria3}
        editable={!guardando}
      />

      <Text style={styles.label}>Fecha estimada de cosecha</Text>
      <TextInput
        style={styles.input}
        placeholder="Opcional"
        value={fechaCosechaEstimada}
        onChangeText={setFechaCosechaEstimada}
        editable={!guardando}
      />

      <View style={styles.filaToggle}>
        <Text style={styles.label}>¿Crear recordatorio?</Text>
        <Switch
          value={crearRecordatorio}
          onValueChange={setCrearRecordatorio}
          disabled={guardando}
        />
      </View>

      <Text style={styles.label}>Observaciones</Text>
      <TextInput
        style={styles.input}
        placeholder="Opcional"
        value={observaciones}
        onChangeText={setObservaciones}
        editable={!guardando}
      />

      <TouchableOpacity
        style={styles.boton}
        onPress={handleGuardar}
        disabled={guardando}
      >
        <Text style={styles.botonTexto}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F3F7F0', flexGrow: 1 },

   header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A501A',
    padding: 16,
    paddingTop: 48,
  },
  flechaAtras: { fontSize: 48, color: '#1A501A' },
  tituloHeader: {
    fontFamily: 'Fraunces_400semiBold',
    fontSize: 48,
    color: '#1A501A',
   },
  

  titulo: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B6F47',
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal:20,
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
    height: 52,
    paddingHorizontal: 20,
  },
  inputEspaciado: { marginTop: 8 },
  filaToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal:20,
  },
  boton: {
    backgroundColor: '#1A501A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    height: 52,
    paddingHorizontal:20,
  },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
});