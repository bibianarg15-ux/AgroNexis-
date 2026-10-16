import { CheckCircleIcon, WarningCircleIcon, WarningIcon } from 'phosphor-react-native';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TipoMensaje = 'error' | 'advertencia' | 'exito';

export interface MensajeToast {
  mensaje: string;
  tipo: TipoMensaje;
}

export interface OpcionesConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  destructivo?: boolean;
}

interface FeedbackContextValue {
  mostrarExito: (texto: string) => void;
  mostrarError: (texto: string) => void;
  mostrarAdvertencia: (texto: string) => void;
  confirmar: (opciones: OpcionesConfirmacion) => Promise<boolean>;
}
const FeedbackContext = createContext<FeedbackContextValue | null>(null);
const ESTILOS_TIPO = {
  exito: {
    color: '#1A501A',
    Icono: CheckCircleIcon,
  },
  advertencia: {
    color: '#B45309',
    Icono: WarningIcon,
  },
  error: {
    color: '#B91C1C',
    Icono: WarningCircleIcon,
  },
};
const DURACION_MS = 3000;

export function FeedbackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toast, setToast] = useState<MensajeToast | null>(null);
  const [confirmacion, setConfirmacion] = useState<{
    opciones: OpcionesConfirmacion;
    resolver: (resultado: boolean) => void;
  } | null>(null);

  const opacidad = useRef(new Animated.Value(0)).current;
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpia el temporizador al desmontar el Provider.
  useEffect(() => {
    return () => {
      if (temporizador.current) {
        clearTimeout(temporizador.current);
      }
    };
  }, []);

  // Oculta el mensaje con una animación.
  const ocultarToast = useCallback(() => {
    temporizador.current = null;
    Animated.timing(opacidad, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [opacidad]);

  // Muestra el mensaje y programa su desaparición.
  const mostrarToast = useCallback(
    (mensaje: string, tipo: TipoMensaje) => {
      if (temporizador.current) {
        clearTimeout(temporizador.current);
      }
      setToast({ mensaje, tipo });
      opacidad.setValue(0);

      Animated.timing(opacidad, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      temporizador.current = setTimeout(
        ocultarToast,
        DURACION_MS
      );
    },
    [ocultarToast, opacidad]
  );

  // Solicita una confirmación y espera la respuesta del usuario.
  const confirmar = useCallback(
    (opciones: OpcionesConfirmacion) => {
      if (confirmacion) {
        return Promise.resolve(false);
      }

      return new Promise<boolean>((resolver) => {
        setConfirmacion({ opciones, resolver });
      });
    },
    [confirmacion]
  );

  // Resuelve la promesa y cierra el cuadro de confirmación.
  const responder = useCallback(
    (valor: boolean) => {
      if (!confirmacion) return;

      confirmacion.resolver(valor);
      setConfirmacion(null);
    },
    [confirmacion]
  );

  // Reúne las funciones que compartirán los componentes.
  const valor = useMemo<FeedbackContextValue>(
    () => ({
      mostrarExito: (texto) => mostrarToast(texto, 'exito'),
      mostrarError: (texto) => mostrarToast(texto, 'error'),
      mostrarAdvertencia: (texto) =>
        mostrarToast(texto, 'advertencia'),
      confirmar,
    }),
    [mostrarToast, confirmar]
  );

  const estiloToast = toast
    ? ESTILOS_TIPO[toast.tipo]
    : null;

  const opcionesConf = confirmacion?.opciones;

  return (
    <FeedbackContext.Provider value={valor}>
      <View style={{ flex: 1 }}>
        {children}
        {toast && estiloToast && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.toast,
              {
                backgroundColor: '#FFFFFF',
                borderColor: estiloToast.color,
                opacity: opacidad,
              },
            ]}
          >
            <estiloToast.Icono
              size={40}
              color={estiloToast.color}
              weight="fill"
            />

            <Text style={styles.toastTexto}>
              {toast.mensaje}
            </Text>
          </Animated.View>
        )}
        <Modal
          visible={!!confirmacion}
          transparent
          animationType="fade"
          onRequestClose={() => responder(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.dialogo}>
              <Text style={styles.dialogoTitulo}>
                {opcionesConf?.titulo}
              </Text>

              <Text style={styles.dialogoMensaje}>
                {opcionesConf?.mensaje}
              </Text>

              <View style={styles.dialogoBotones}>
                <TouchableOpacity
                  style={[
                    styles.dialogoBoton,
                    styles.botonCancelar,
                  ]}
                  onPress={() => responder(false)}
                >
                  <Text style={styles.botonCancelarTexto}>
                    {opcionesConf?.textoCancelar ?? 'Cancelar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dialogoBoton,
                    {
                      backgroundColor: opcionesConf?.destructivo
                        ? '#B91C1C'
                        : '#1A501A',
                    },
                  ]}
                  onPress={() => responder(true)}
                >
                  <Text style={styles.botonConfirmarTexto}>
                    {opcionesConf?.textoConfirmar ?? 'Aceptar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </FeedbackContext.Provider>
  );
}

// Hook para utilizar el contexto desde las pantallas.
export function useFeedback(): FeedbackContextValue {
  const contexto = useContext(FeedbackContext);

  if (!contexto) {
    throw new Error(
      'useFeedback debe usarse dentro de un FeedbackProvider'
    );
  }

  return contexto;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 1000,
  },

  toastTexto: {
    flex: 1,
    color: '#1B3520',
    fontSize: 14,
    fontWeight: '600',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },

  dialogo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },

  dialogoTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A501A',
    marginBottom: 8,
  },

  dialogoMensaje: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },

  dialogoBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  dialogoBoton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },

  botonCancelar: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },

  botonCancelarTexto: {
    color: '#555555',
    fontWeight: '600',
  },

  botonConfirmarTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
