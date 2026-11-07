import { Notifications, notificacionesDisponibles } from '@/shared/notifications/notificacionesService';

import { Href, useRouter } from 'expo-router';
import { useEffect } from 'react';

export function useNavegacionDesdeNotificacion(appLista: boolean) {
  const router = useRouter();

  

  const respuesta = notificacionesDisponibles
    ? Notifications?.useLastNotificationResponse()
    : undefined;

  useEffect(() => {
    if (!notificacionesDisponibles || !appLista || !respuesta) return;

    if (
      respuesta.actionIdentifier !==
      Notifications?.DEFAULT_ACTION_IDENTIFIER
    ) return;

    const url = respuesta.notification.request.content.data?.url;

    if (typeof url === 'string') {
      router.push(url as Href);
    }

    Notifications?.clearLastNotificationResponse();
  }, [appLista, respuesta, router]);
}