import { StyleSheet, Text, View } from 'react-native';

export default function Finanzasplaceholder() {
    return (
        <View style={styles.container}>
            <Text>Finanzas - en construcción</Text>
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
