import { listarActividadesConRecordatorioActivo } from '@/actividades/actividadesRepository';
import { listarCultivosConRecordatorio } from '@/cultivos/cultivosRepository';
import { Platform } from 'react-native';
import { fechaAvisoCosecha, proximasOcurrencias } from '../utils/fechasNotificacion';

type ModuloNotificaciones = typeof import('expo-notifications');
export const Notifications: ModuloNotificaciones | null = (() => {
  try {
    return require('expo-notifications') as ModuloNotificaciones;
  } catch (error) {
    console.warn('expo-notifications no está disponible en este entorno:', error);
    return null;
  }
})();

export const notificacionesDisponibles = Notifications !== null;

const CANAL_ID = 'Recordatorios';

export type EstadoPermiso = 'concedido' | 'denegado'| 'bloqueado'| 'noDisponible';

export async function prepararCanal(): Promise<void>{
    if(Platform.OS !== 'android') return;
    await Notifications?.setNotificationChannelAsync(CANAL_ID, {
    name: 'Recordatorios',
    importance: Notifications.AndroidImportance.HIGH,
    });
}

export async function tienePermisosNotificaciones(): Promise<boolean> {
    const permisos = await Notifications?.getPermissionsAsync();
        return permisos?.granted || false;
    }

//Pide permiso cuando el agricultor activa un recordatorio
export async function solicitarPermisosNotificaciones(): Promise<EstadoPermiso>{
     await  prepararCanal();   

     const actual = await Notifications?.getPermissionsAsync();
     if(actual?.granted) return 'concedido';
     if(!actual?.canAskAgain) return 'bloqueado';

     const nuevo = await Notifications?.getPermissionsAsync();
     if(nuevo?.granted) return 'concedido';
     return nuevo?.canAskAgain ? 'denegado' : 'bloqueado';
    }

    async function programar(
    identifier: string,
    titulo: string,
    cuerpo: string,
    url: string,
  fecha: Date
  ): Promise<void> {
    await Notifications?.scheduleNotificationAsync({
      identifier,
      content: { title: titulo, body: cuerpo, data: { url } },
      trigger: {
        type: Notifications?.SchedulableTriggerInputTypes.DATE,
        date: fecha,
        channelId: CANAL_ID,
      },
    });
 }

 function textoDias(dias: number): string {
  return dias === 1 ? '1 día' : `${dias} días`;
}

async function ejecutarSincronizacion(): Promise<void>{
    try  {
    await Notifications?.cancelAllScheduledNotificationsAsync();

    const actual = new Date();
    const [cultivos, actividades ] = await Promise.all([
        await listarCultivosConRecordatorio(),
        listarActividadesConRecordatorioActivo(),
    ]);

    for(const c of cultivos) {
    const aviso = fechaAvisoCosecha(
        c.fecha_cosecha_estimada!,
        c.dias_anticipacion_recordatorio!,
        actual
    );

    if(!aviso) continue;

    await programar(
        `cosecha-${c.id}`,
        `Cosecha próxima: ${c.nombre}`,
        `Faltan ${textoDias(c.dias_anticipacion_recordatorio!)} para la fecha estimada de cosecha.`,
        `/cultivos/${c.id}`,
        aviso
    );
    
}
 for (const a of actividades) {

      const fechas = proximasOcurrencias(a.fecha, a.dias_recordatorio!, actual );

      console.log( 
        'Fechas calculadas:',
        fechas.map((fecha) => new Date(fecha).toLocaleString())
      );

      for (let i = 0; i < fechas.length; i++) {
        await programar(
          `actividad-${a.id}-${i}`,
          `Recordatorio: ${a.es_cosecha ? 'Cosecha' : a.actividad}`,
          `${a.cultivo_nombre}. Se repite cada ${textoDias(a.dias_recordatorio!)}.`,
          `/actividades/cultivo/${a.cultivo_id}`,
          fechas[i]
        );
      }
    }
     } catch (error) {
    console.error('Error sincronizando notificaciones:', error);
  }
}

let cola: Promise<void> = Promise.resolve();

export function sincronizarNotificaciones(): Promise<void> {
  cola = cola.then(ejecutarSincronizacion);
  return cola;
}


// Solo para pruebas en desarrollo

export async function programarPrueba(segundos = 5): Promise<void> {
  await prepararCanal();
  await Notifications?.scheduleNotificationAsync({
    content: {
      title: 'Prueba de recordatorio',
      body: 'Toca para abrir las actividades',
      data: { url: '/actividades' },
    },
    trigger: {
      type: Notifications?.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: segundos,
      channelId: CANAL_ID,
    },
  });
}

export async function verProgramadas(): Promise<void> {
  const lista = await Notifications?.getAllScheduledNotificationsAsync();
  console.log(`Notificaciones programadas: ${lista?.length}`);
  lista?.forEach((n) => console.log(n.identifier, JSON.stringify(n.trigger)));
}