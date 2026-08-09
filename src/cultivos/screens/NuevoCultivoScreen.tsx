import ScreenHeader from '@/shared/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registraCultivo } from '../cultivosService';

export default function NuevoCultivoScreen() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [fechaSiembra, setFechaSiembra] = useState(new Date().toISOString().slice(0, 10));
    const [unidadMedida, setUnidadMedida] = useState('carga');
    const [categoria1, setCategoria1] =useState('Primera');
    const [categoria2, setCategoria2] = useState('Segunda');
    const [categoria3, setCategoria3] = useState('Tercera');
    const [fechaCosechaEstimada, setFechaCosechaEstimada] = useState('');
    const [crearRecordatorio, setCrearRecordatorio] = useState(false);
    const [observaciones, setObservaciones] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleGuardar = async () => {
        setCargando(true);
        const resultado = await registraCultivo({
            nombre,
            fechaSiembra: new Date(fechaSiembra).getTime(),
            unidadMedida,
            categoria1,
            categoria2,
            categoria3,
            fechaCosechaEstimada: fechaCosechaEstimada ? new Date(fechaCosechaEstimada).getTime() : undefined,
            crearRecordatorioCosecha: crearRecordatorio,
            observaciones,
        });
        setCargando(false);       
        if (!resultado.exito) {
            Alert.alert('Error', resultado.error ?? 'No se pudo registrar el cultivo');
            return;
        }
        router.back();
    }
return (
  <ScrollView contentContainerStyle={styles.container}>
  <ScreenHeader titulo="Nuevo cultivo" />
      <Text style={styles.label}>Nombre</Text>
        <Text style={styles.label}>Nombre del cultivo:</Text>
        <TextInput
            style={styles.input}
            value={nombre}
            placeholder="Zanahoria"
            onChangeText={setNombre}
            editable={!cargando}/>

        <Text style={styles.label}>Fecha de siembra:</Text>
        <TextInput
            style={styles.input}
            value={fechaSiembra}
            placeholder="YYYY-MM-DD"
            onChangeText={setFechaSiembra}
            editable={!cargando}/>

        <Text style={styles.label}>Unidad de medida:</Text>
        <TextInput
            style={styles.input}
            value={unidadMedida}
            placeholder="Ej:Carga"
            onChangeText={setUnidadMedida}
            editable={!cargando}/>

             <Text style={styles.label}>Categorías de calidad</Text>
      <TextInput
        style={styles.input}
        value={categoria1}
        onChangeText={setCategoria1}
        editable={!cargando}
      />
      <TextInput
        style={[styles.input, styles.inputEspaciado]}
        value={categoria2}
        onChangeText={setCategoria2}
        editable={!cargando}
      />
      <TextInput
        style={[styles.input, styles.inputEspaciado]}
        value={categoria3}
        onChangeText={setCategoria3}
        editable={!cargando}
      />

      <Text style={styles.label}>Fecha estimada de cosecha</Text>
      <TextInput
        style={styles.input}
        placeholder="Opcional"
        value={fechaCosechaEstimada}
        onChangeText={setFechaCosechaEstimada}
        editable={!cargando}
      />

       <View style={styles.filaToggle}>
        <Text style={styles.label}>¿Crear recordatorio?</Text>
        <Switch
          value={crearRecordatorio}
          onValueChange={setCrearRecordatorio}
          disabled={cargando}
        />
      </View>

      <Text style={styles.label}>Observaciones</Text>
      <TextInput
        style={styles.input}
        placeholder="Opcional"
        value={observaciones}
        onChangeText={setObservaciones}
        editable={!cargando}
      />

      <TouchableOpacity
        style={styles.boton}
        onPress={handleGuardar}
        disabled={cargando}
      >
        <Text style={styles.botonTexto}>
          {cargando ? 'Guardando...' : 'Guardar'}
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
    paddingHorizontal: 20,
  },
  flechaAtras: { fontSize: 48, color: '#ffffff' },
  tituloHeader: {
    fontFamily: 'Fraunces_400semiBold',
    fontSize: 48,
    color: '#ffffff',
   paddingHorizontal: 20,},
  
  titulo: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 22,
    color: '#1A501A',
    marginBottom: 16,
   paddingHorizontal: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B6F47',
    marginBottom: 8,
    marginTop: 16,
     paddingHorizontal: 20,
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
     paddingHorizontal: 20,
  },
  boton: {
    backgroundColor: '#1A501A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    height: 52,
    paddingHorizontal: 20,

  },
  botonTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 18, paddingHorizontal: 20, },

});


