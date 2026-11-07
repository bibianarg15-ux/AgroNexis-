import { useCallback } from "react";
import { Linking } from "react-native";
import { useFeedback } from "../feedback/feedbackProvider";
import { solicitarPermisosNotificaciones } from "./notificacionesService";



export function usePermisoNotificaciones(){
    const{confirmar, mostrarAdvertencia } = useFeedback();

return useCallback( async() : Promise<boolean> => {
    const estado = await solicitarPermisosNotificaciones();

if(estado === 'concedido'){
    return true;
}

if(estado === 'bloqueado'){
    const abrir = await confirmar({
        titulo:'Notificaciones desactivadas',
        mensaje: 'Para recibir recordatorios,  activa las notificaciones de AgroNexis en los  ajustes del telefono.',
        textoConfirmar: 'Abrir ajustes'})
    if (abrir) Linking.openSettings();}

    if (estado === 'noDisponible') {
  mostrarAdvertencia('Los recordatorios no están disponibles en Expo Go. Funcionarán en la app instalada.');
  return false;
}
    else {
        mostrarAdvertencia('Sin el permiso de notificaciones no podremos avisarte.')
    } 
    return false;
},[confirmar, mostrarAdvertencia]);
}

    
 