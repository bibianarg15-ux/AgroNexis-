import { StyleSheet, Text, View } from 'react-native';

export default function ManoObraplaceholder() {
    return (
        <View style={styles.container}>
            <Text>Mano de Obra - en construcción</Text>
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