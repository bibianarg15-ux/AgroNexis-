import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

export interface DateInputProps {
    value: string;
    onChange: (value: string) => void;
    editable?: boolean;
    maximumDate?: Date;
    minimumDate?: Date;
}

// Convertir de date a string
const formatearFecha = (fecha: Date): string => {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
};

export default function DateInput({
  value,
  onChange,
  editable = true,
  maximumDate,
  minimumDate,
}: DateInputProps) {
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const fechaActual = value ? new Date(value) : new Date();

  function handleCambio(evento:{type: string}, fechaSeleccionada?: Date) {
    setMostrarPicker(Platform.OS === 'ios');

    if(evento.type === 'dismissed') return;

    if (fechaSeleccionada) {
      onChange(formatearFecha(fechaSeleccionada));
    }
  }

  return (
    <>
      <TouchableOpacity
        style={styles.input}
        onPress={() => editable && setMostrarPicker(true)}
        disabled={!editable}
      >
        <Text style={value ? styles.textoValor : styles.textoPlaceholder}>
          {value || 'AAAA-MM-DD'}
        </Text>
      </TouchableOpacity>

      {mostrarPicker && (
        <DateTimePicker
          value={fechaActual}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleCambio}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    height: 52,
    justifyContent: 'center',
  },
  textoValor: { fontSize: 16, color: '#333' },
  textoPlaceholder: { fontSize: 16, color: '#9CA3AF' },
});
