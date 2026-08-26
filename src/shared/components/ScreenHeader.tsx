import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScreenHeaderProps {
  titulo: string;
  mostrarFlechaAtras?: boolean;
  mostrarBotonAgregar?: boolean;
  onAgregar?: () => void;
}

export default function ScreenHeader({
  titulo,
  mostrarFlechaAtras = true,
  mostrarBotonAgregar = false,
  onAgregar,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {mostrarFlechaAtras ? (
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon size={22} color="#ffffff" />
        </TouchableOpacity>
      ) : null}

      <Text style={styles.titulo}>{titulo}</Text>

      {mostrarBotonAgregar && onAgregar ? (
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={onAgregar}
        >
          <Text style={styles.botonAgregarTexto}>+</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
header: {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  backgroundColor: '#1A501A',
  padding: 16,
    paddingTop: 48,
  },
  flechaAtras: { fontSize: 22, color: '#ffffff' },
  titulo: {
fontFamily: 'Fraunces_400Regular',
    fontSize: 24,
    color: '#ffffff',
  },

botonAgregar: {
  marginLeft: 'auto',
  padding: 4,
},

botonAgregarTexto: {
  color: '#fff',
  fontSize: 28,
  fontWeight: 'bold',
},
});