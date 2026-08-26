import { obtenerUsuario } from '@/auth/authRepository';
import { Actividad, ActividadConCultivo, actualizarActividad, crearActividad, CrearActividadInput, eliminarActividad, listarActividadesPorCultivo, listarRecordatoriosActivos, listarTodasLasActividades, obtenerActividadPorId, obtenerRegistroCosecha, RegistroCosecha, toggleRecordatorio } from './actividadesRepository';
export interface ActividadFormInput {
    cultivoId: string;
    actividad: string;
    fecha?: number;
    esCosecha?: boolean;
    crearRecordatorio?: boolean;
    diasRecordatorio?: number;
    observaciones?: string;
    categoria1Cantidad?: number;
    categoria2Cantidad?: number;
    categoria3Cantidad?: number;
}
export interface ActividadResultado {
    exito: boolean;
    error?: string;
    actividad?: Actividad;
}

export interface ActividadConCosecha extends Actividad { registroCosecha: RegistroCosecha | null;
    }

//Listar las actividades de un cultivo (ingresa desde detalle)
export async function listarActividadesDelCultivo(cultivoId: string ): Promise<Actividad[]> {
    return await listarActividadesPorCultivo(cultivoId);
}
//listar todas las actividades del usuario (ingresa desde el footer)
export async function listarTodasActividadesDelUsuario(): Promise<ActividadConCultivo[]> {
  const usuario = await obtenerUsuario();
  if (!usuario) return [];
  return await listarTodasLasActividades(usuario.id);
}
//obtiene actividad con registro de  cosecha
export async function obtenerActividadConCosecha(id: string):Promise<ActividadConCosecha | null> {
 const actividad = await obtenerActividadPorId(id);
 if(!actividad) return null;

  const registroCosecha = actividad.es_cosecha === 1 ? await obtenerRegistroCosecha(id) : null;
   return{ ...actividad, registroCosecha}
    }
 
//Lista las actividades con recordatorio activo.
export async function obtenerRecordatoriosActivos(cultivoId: string): Promise<Actividad[]>{
return await listarRecordatoriosActivos(cultivoId);
}

//Validad los datos para una nueva actividad
export async function registrarActividad(datos: ActividadFormInput): Promise<ActividadResultado> {
  if (!datos.actividad.trim()) {
    return { exito: false, error: 'Escribe qué actividad vas a registrar.' };
  }

  if (!datos.fecha) {
    return { exito: false, error: 'La fecha es obligatoria.' };
  }

  // Si es cosecha, se debe registrar al menos una cantidad.
  if (datos.esCosecha) {
    const totalCosechado =
      (datos.categoria1Cantidad ?? 0) +
      (datos.categoria2Cantidad ?? 0) +
      (datos.categoria3Cantidad ?? 0);

    if (totalCosechado <= 0) {
      return { exito: false, error: 'Registra al menos una cantidad cosechada.' };
    }
  }

  // Si activa el recordatorio, valor por defecto de 8 días 
  const diasRecordatorio = datos.crearRecordatorio
    ? (datos.diasRecordatorio ?? 8)
    : undefined;

  const input: CrearActividadInput = {
    cultivoId: datos.cultivoId,
    actividad: datos.actividad,
    fecha: datos.fecha,
    esCosecha: datos.esCosecha ? 1 : 0,
    observaciones: datos.observaciones,
    crearRecordatorio: datos.crearRecordatorio ? 1 : 0,
    diasRecordatorio,
    categoria1Cantidad: datos.categoria1Cantidad,
    categoria2Cantidad: datos.categoria2Cantidad,
    categoria3Cantidad: datos.categoria3Cantidad,
  };
  const actividad = await crearActividad(input);
  return { exito: true, actividad };
}
// Edita una actividad existente
export async function editarActividad(
  id: string,
  datos: Partial<ActividadFormInput>
): Promise<ActividadResultado> {
  if (datos.actividad !== undefined && !datos.actividad.trim()) {
    return { exito: false, error: 'Escribe qué actividad vas a registrar.' };
  }
  const diasRecordatorio = datos.crearRecordatorio
    ? (datos.diasRecordatorio ?? 8)
    : datos.crearRecordatorio === false
    ? undefined
    : datos.diasRecordatorio;
    
  await actualizarActividad(id, {
    actividad: datos.actividad,
    fecha: datos.fecha,
    observaciones: datos.observaciones,
    crearRecordatorio: datos.crearRecordatorio !== undefined
      ? (datos.crearRecordatorio ? 1 : 0)
      : undefined,
    diasRecordatorio,
    categoria1Cantidad: datos.categoria1Cantidad,
    categoria2Cantidad: datos.categoria2Cantidad,
    categoria3Cantidad: datos.categoria3Cantidad,
  });

  const actividadActualizada = await obtenerActividadPorId(id);
  return { exito: true, actividad: actividadActualizada ?? undefined };
}

//Elimina una actividad y su registro de cosecha si existe
export async function borrarActividad(id: string): Promise<ActividadResultado> {
  await eliminarActividad(id);
  return { exito: true };
}

 //Apaga o enciende el recordatorio 
export async function cambiarEstadoRecordatorio(
  id: string,
  activo: boolean
): Promise<ActividadResultado> {
  await toggleRecordatorio(id, activo);
  const actividad = await obtenerActividadPorId(id);
  return { exito: true, actividad: actividad ?? undefined };
}

