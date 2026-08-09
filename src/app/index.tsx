import { verificarUsuarioExistente } from "@/auth/authService";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function decidirPantalla() {
      const existe = await verificarUsuarioExistente();

      if (existe) {
        router.replace('/login');
      } else {
        router.replace('/registro');
      }
    }

    decidirPantalla();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1A501A" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F7F0",
  },
});