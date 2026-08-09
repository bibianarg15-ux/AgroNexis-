import { StyleSheet, Text, View } from 'react-native';

export default function Actividadesplaceholder() {
    return (
        <View style={styles.container}>
            <Text>Actividades - en construcción</Text>
        </View>
    );
} 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});
