import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScreenHeaderProps {
  titulo: string;
  mostrarFlechaAtras?: boolean;
}

export default function ScreenHeader({ titulo, mostrarFlechaAtras = true }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {mostrarFlechaAtras && (
        <TouchableOpacity onPress={() => router.back()}> <ArrowLeftIcon size={22} color="#ffffff" />
        </TouchableOpacity>
      )}
      <Text style={styles.titulo}>{titulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
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
    fontSize: 22,
    color: '#ffffff',
  },
});