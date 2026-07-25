
import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface PinInputProps {
  value: string[];
  onChange: (nuevoPin: string[]) => void;
  onCompleto?: (pinCompleto: string) => void;
  editable?: boolean;
}

export default function PinInput({ value, onChange, onCompleto, editable = true }: PinInputProps) {
  const inputsRef = useRef<Array<TextInput | null>>([]);


  function handleCambio(texto: string, index: number) {
    const soloNumero = texto.replace(/[^0-9]/g, '');
    const nuevoPin = [...value];
    nuevoPin[index] = soloNumero.slice(-1);
    onChange(nuevoPin);

    if (soloNumero && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    const pinCompleto = nuevoPin.join('');
    if (pinCompleto.length === 4 && onCompleto) {
      onCompleto(pinCompleto);
    }
  }
  
  function handleBorrar(index: number) {
    if (!value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.container}>
      {value.map((digito, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputsRef.current[index] = ref;
          }}
          style={styles.input}
          value={digito}
          onChangeText={(texto) => handleCambio(texto, index)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') handleBorrar(index);
          }}
          keyboardType="number-pad"
          maxLength={1}
          secureTextEntry
          editable={editable}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12 },
  input: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    backgroundColor: '#ffffff',
  },
});
