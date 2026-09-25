import ScreenHeader from "@/shared/components/ScreenHeader";
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CultivoConBalance, obtenerBalanceGeneral } from "../finanzasService";



export default function BalanceGeneralScreen() {
  const router = useRouter();
  const [cultivosConBalance, setCultivosConBalance] = useState<CultivoConBalance[]>([]);
  const [cargando, setCargando] = useState(true);

   useFocusEffect(
      useCallback(() => {
        async function cargar() {

          setCargando(true);
            const data = await obtenerBalanceGeneral();
            setCultivosConBalance(data);
          setCargando(false);
        }
        cargar();
      }, [])
    );

    const rentabilidadTotal = cultivosConBalance.reduce((acc, c) => acc + c.balance.balance, 0);
    const totalIngresos = cultivosConBalance.reduce((acc, c ) => acc + c.balance.ingresos, 0);
    const totalEgresos = cultivosConBalance.reduce((acc, c ) => acc + c.balance.egresos, 0);

    
    function irAFinanzasDelCultivo(cultivoId: string) {
      router.push(`/finanzas/cultivo/${cultivoId}`);
    }


    function formatoMoneda(valor : number): string {
      const signo = valor < 0 ? '-' : '+';
      return `${signo} $ ${Math.abs(valor).toLocaleString( 'es-CO')}`;
    }
  
    return (
    <View style={styles.container}>
      <ScreenHeader titulo="Balance general"
       mostrarFlechaAtras={false} 
       mostrarBotonAgregar={true}
       onAgregar={() => router.push('/finanzas/nuevo')} />

      {!cargando && cultivosConBalance.length === 0 ? (
        <View style={styles.vacioContainer}>
          <Text style={styles.vacioTitulo}>Aún no tienes cultivos registrados</Text>
        </View>
      ) : (
        <FlatList
          data={cultivosConBalance}
          keyExtractor={(item) => item.cultivo.id}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={
            <View style={styles.resumenCard}>
              <Text style={styles.resumenLabel}>Rentabilidad total</Text>
              <Text
                style={[
                  styles.resumenValor,
                  { color: rentabilidadTotal >= 0 ? '#1A501A' : '#B91C1C' },
                ]}
              >
                {formatoMoneda(rentabilidadTotal)}
              </Text>
              <Text style={styles.resumenSubtexto}>
                {cultivosConBalance.length} cultivos registrados
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cultivoCard}
              onPress={() => irAFinanzasDelCultivo(item.cultivo.id)}
            >
              <Text style={styles.cultivoNombre}>{item.cultivo.nombre}</Text>
              <Text
                style={[
                  styles.cultivoBalance,
                  { color: item.balance.balance >= 0 ? '#1A501A' : '#B91C1C' },
                ]}
              >
                {formatoMoneda(item.balance.balance)}
              </Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={styles.totalesCard}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total ingresos</Text>
                <Text style={[styles.totalValor, { color: '#1A501A' }]}>
                +${totalIngresos.toLocaleString('es-CO')}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total egresos</Text>
                <Text style={[styles.totalValor, { color: '#B91C1C' }]}>
                  -${totalEgresos.toLocaleString('es-CO')}
                </Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F7F0' },
  vacioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  vacioTitulo: { fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  lista: { padding: 16 },
  resumenCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 },
  resumenLabel: { fontSize: 16, color: '#8B6F47' },
  resumenValor: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  resumenSubtexto: { fontSize: 16, color: '#8B6F47', marginTop: 4 },
  cultivoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cultivoNombre: { fontSize: 18, fontWeight: '600', color: '#000000' },
  cultivoBalance: { fontSize: 16, fontWeight: 'bold' },
  totalesCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  totalItem: { alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#8B6F47' },
  totalValor: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
});