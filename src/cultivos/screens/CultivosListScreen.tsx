import { obtenerUsuario } from "@/auth/authRepository";
import { useFocusEffect, useRouter } from "expo-router";
import { EyeIcon, PencilSimpleIcon } from "phosphor-react-native";
import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Cultivo } from "../cultivosRepository";
import { listarCultivosDelUsuario } from "../cultivosService";

export default function CultivosListScreen() {
  const router = useRouter();

  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function cargarDatos() {
        setCargando(true);

        const [listaCultivos, usuario] = await Promise.all([
          listarCultivosDelUsuario(),
          obtenerUsuario(),
        ]);

        setCultivos(listaCultivos);
        setNombreUsuario(usuario?.nombre_completo ?? "");
        setCargando(false);
      }

      cargarDatos();
    }, [])
  );
  function irADetalle(id: string) {
    router.push(`/cultivos/${id}`);
  }
  function irAEditar(id: string) {
    router.push(`/cultivos/${id}/editar`);
  }
  function irANuevoCultivo() {
    router.push("/cultivos/nuevo");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.saludo}>AgroNexis</Text>

        <TouchableOpacity onPress={irANuevoCultivo}>
          <Text style={styles.botonAgregar}>+</Text>
        </TouchableOpacity>
      </View>
      {!cargando && cultivos.length === 0 ? (
        <View style={styles.vacioContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoVacio}
            resizeMode="contain"
          />

          <Text style={styles.vacioTitulo}>
            ¡Aún no tienes cultivos registrados!
          </Text>

          <Text style={styles.vacioSubtitulo}>
            Registra tu primer cultivo para empezar a llevar el control
          </Text>

          <TouchableOpacity
            style={styles.botonPrincipal}
            onPress={irANuevoCultivo}
          >
            <Text style={styles.botonPrincipalTexto}>
              + Agregar cultivo
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cultivos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardNombre}>{item.nombre}</Text>

              <Text style={styles.cardFecha}>
                Sembrado:{" "}
                {new Date(item.fecha_siembra).toLocaleDateString("es-CO")}
              </Text>

              <View style={styles.cardBotones}>

                <TouchableOpacity
                  style={styles.botonVerDetalles}
                  onPress={() => irADetalle(item.id)}
                >
                  <View style={styles.contenidoBoton}>
                    <EyeIcon
                      size={16}
                      color="#FFFFFF"
                      weight="regular"
                    />

                    <Text style={styles.botonVerDetallesTexto}>
                      Ver detalles
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonEditar}
                  onPress={() => irAEditar(item.id)}
                >
                  <View style={styles.contenidoBoton}>
                    <PencilSimpleIcon
                      size={16}
                      color="#1A501A"
                      weight="regular"
                    />

                    <Text style={styles.botonEditarTexto}>
                      Editar
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7F0",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A501A",
    padding: 16,
    paddingTop: 48,
  },

  saludo: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Fraunces_400Regular",
  },

  botonAgregar: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },

  vacioContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  logoVacio: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },

  vacioTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  vacioSubtitulo: {
    fontSize: 16,
    color: "#8B6F47",
    textAlign: "center",
    marginBottom: 24,
  },

  botonPrincipal: {
    backgroundColor: "#1A501A",
    borderRadius: 8,
    width: "80%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },

  botonPrincipalTexto: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  lista: {
    padding: 16,
  },
card: {
  backgroundColor: '#FFFFFF',

  borderRadius: 8,

  borderWidth: 1,
  borderColor: '#C8D8C3',

  padding: 18,
  marginBottom: 16,

  shadowColor: '#2E6B2E',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.08,
  shadowRadius: 6,

  elevation: 3,
},

  cardNombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },

  cardFecha: {
    fontSize: 14,
    color: "#8B6F47",
    marginTop: 4,
    marginBottom: 12,
  },

  cardBotones: {
    flexDirection: "row",
    gap: 8,
  },

  contenidoBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  botonVerDetalles: {
    flex: 1,
    backgroundColor: "#1A501A",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  botonVerDetallesTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  botonEditar: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#1A501A",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  botonEditarTexto: {
    color: "#1A501A",
    fontSize: 13,
    fontWeight: "600",
  },
});