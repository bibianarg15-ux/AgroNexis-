import { getDatabase } from "@/database/connection";
import * as Crypto from 'expo-crypto';

export interface Actividad {
    id: string;
    cultivo_id: string;
    actividad:string;
    es_cosecha: number;
    fecha:number;
    observaciones: string | null;
    crear_recordatorio: number;
    dias_recordatorio: number | null;
    created_at: number;
    updated_at: number;
}

export interface RegistroCosecha {
    id: string;
    actividad_id: string;
    categoria_1_cantidad: number;
    categoria_2_cantidad: number;
    categoria_3_cantidad: number;
    created_at: number;
    updated_at: number | null;
}

export interface CrearActividadInput {
    cultivoId:string;
    actividad:string;
    fecha: number;
    esCosecha?: number;
    crearRecordatorio?: number;
    diasRecordatorio?: number | null;
    observaciones?: string |null;
    //si cosecha es = 1; 
    categoria1Cantidad?: number;
    categoria2Cantidad?: number;
    categoria3Cantidad?: number;
} 

export interface ActividadConCultivo extends Actividad {
  cultivo_nombre: string;
}
//Listar todas las actividades por usuario
export async function listarTodasLasActividades(usuarioId: string): Promise<ActividadConCultivo[]> {
  const db = await getDatabase();
  return await db.getAllAsync<ActividadConCultivo>(
    `SELECT A.*, C.nombre as cultivo_nombre
     FROM ACTIVIDADES A
     JOIN CULTIVOS C ON A.cultivo_id = C.id
     WHERE C.usuario_id = ?
     ORDER BY A.fecha DESC;`,
    [usuarioId]
  );
}

//Listar todas las actividades por su id.
export async function listarActividadesPorCultivo(cultivoId:string): Promise<Actividad[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Actividad>(
        'SELECT * FROM ACTIVIDADES WHERE cultivo_id = ? ORDER BY fecha DESC' , [cultivoId]);  
}

//obtener una actividad por su id
export async function obtenerActividadPorId(id:string): Promise<Actividad | null> {
    const db = await getDatabase();
    const actividad = await db.getFirstAsync<Actividad>(
        'SELECT * FROM ACTIVIDADES WHERE id = ?', [id]);
    return actividad ?? null;
}
 //obtener registro de cosecha
 export async function obtenerRegistroCosecha(actividadId:string):Promise<RegistroCosecha | null>{
    const db = await getDatabase();
    const registro = await db.getFirstAsync<RegistroCosecha>(
        'SELECT * FROM REGISTROS_COSECHA WHERE actividad_id = ? ',[actividadId]);
        return registro ?? null
 };
//Listar actividades con recordatorio activo
export async function listarRecordatoriosActivos(cultivoId:string): Promise<Actividad[]> {
    const db= await getDatabase();
    return await db.getAllAsync<Actividad>(
        'SELECT *FROM ACTIVIDADES WHERE cultivo_id = ? AND crear_recordatorio = 1 ORDER BY fecha DESC', [cultivoId]
    );
};
//Crear una nueva actividad
export async function crearActividad(datos: CrearActividadInput): Promise<Actividad> {
    const db = await getDatabase();
    const id = Crypto.randomUUID();
    const createdAt = Date.now();
    const actividad: Actividad = { 
        id,
        cultivo_id: datos.cultivoId,
        actividad: datos.actividad.trim(),
        fecha: datos.fecha,
        es_cosecha : datos.esCosecha ?? 0,
        crear_recordatorio: datos.crearRecordatorio ?? 0,
        dias_recordatorio: datos.diasRecordatorio ?? null,
        observaciones: datos.observaciones?.trim() || null,
        created_at: createdAt,
        updated_at: createdAt
    };
    await db.runAsync(
        `INSERT INTO ACTIVIDADES (id, cultivo_id, actividad, fecha, es_cosecha,
        crear_recordatorio, dias_recordatorio, observaciones, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
        actividad.id,
        actividad.cultivo_id,
        actividad.actividad,
        actividad.fecha,
        actividad.es_cosecha,
        actividad.crear_recordatorio,
        actividad.dias_recordatorio,
        actividad.observaciones,
        actividad.created_at,
        actividad.updated_at
    ]
);
//si es cosecha, crea tambien el registro de cantidades
if(actividad.es_cosecha === 1){
    const registroId = Crypto.randomUUID();
    await db.runAsync(
        `INSERT INTO REGISTROS_COSECHA (id, actividad_id, categoria_1_cantidad, 
        categoria_2_cantidad, categoria_3_cantidad, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?)`,
        [
        registroId,
        actividad.id,
        datos.categoria1Cantidad ?? 0,
        datos.categoria2Cantidad ?? 0,
        datos.categoria3Cantidad ?? 0,
        createdAt,
        createdAt,
        ]
    );
    } 
return actividad;
}

//Actualizar una actividad existente
export async function actualizarActividad( id: string, datos: Partial<CrearActividadInput>):Promise<void> {
    const db = await getDatabase();
    const actual = await obtenerActividadPorId(id)

    if(!actual) {
    throw new Error('Actividad no encontrada.');
    }

    const updatedAt = Date.now();
  await db.runAsync(
    `UPDATE ACTIVIDADES SET actividad = ?, fecha = ?, crear_recordatorio = ?, 
    dias_recordatorio = ?, observaciones = ?, updated_at = ? WHERE id = ?`,
    [
        datos.actividad?.trim() ?? actual.actividad,
        datos.fecha ?? actual.fecha,
        datos.crearRecordatorio !== undefined ? datos.crearRecordatorio : actual.crear_recordatorio,
        datos.diasRecordatorio !== undefined ? datos.diasRecordatorio : actual.dias_recordatorio,
        datos.observaciones !== undefined ? datos.observaciones?.trim() || null : actual.observaciones,
        updatedAt,
        id
    ]
);
  
    if(actual.es_cosecha === 1) {
        const registroExistente = await obtenerRegistroCosecha(id);

    if(registroExistente) {
        await db.runAsync(`UPDATE REGISTROS_COSECHA SET categoria_1_cantidad = ?, 
        categoria_2_cantidad = ? , categoria_3_cantidad = ?, updated_at = ? WHERE actividad_id = ?`,
    [
        datos.categoria1Cantidad ?? registroExistente.categoria_1_cantidad,
        datos.categoria2Cantidad ?? registroExistente.categoria_2_cantidad,
        datos.categoria3Cantidad ?? registroExistente.categoria_3_cantidad,
        updatedAt,
        id,
    ]);    
    }
    }
}

//Eliminar un actividad por su id
export async function eliminarActividad(id:string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM ACTIVIDADES WHERE id = ?', [id]);
}   

//Apagar o encender el recordatorio
export async function toggleRecordatorio(id: string, activo: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE ACTIVIDADES SET crear_recordatorio = ?, updated_at = ? WHERE id = ?;',
    [activo ? 1 : 0, Date.now(), id]
  );
}