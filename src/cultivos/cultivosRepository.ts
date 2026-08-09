import { getDatabase } from '@/database/connection';
import * as Crypto from 'expo-crypto';

export interface Cultivo {
    id: string;
    usuario_id: string;
    nombre:string;
    fecha_siembra: number;
    unidad_medida: string;
    categoria_1: string;
    categoria_2: string;
    categoria_3: string;
    fecha_cosecha_estimada: number | null;
    crear_recordatorio_cosecha: number;
    dias_anticipacion_recordatorio: number | null;
    observaciones: string |null;
    created_at: number;
    updated_at: number;
}

export interface CrearCultivoInput {
    usuarioId:string;
    nombre:string;
    fechaSiembra: number;
    unidadMedida?: string;
    categoria1?: string;
    categoria2?: string;
    categoria3?: string;
    fechaCosechaEstimada?: number | null;
    crearRecordatorioCosecha?: number;
    diasAnticipacionRecordatorio?: number | null;
    observaciones?: string |null;
}

//Lista todos los cultivos de un usuario
export async function listarCultivos(usuarioId:string): Promise<Cultivo[]> {
    const db = await getDatabase();
    const cultivos = await db.getAllAsync<Cultivo>(
        'SELECT * FROM CULTIVOS WHERE usuario_id = ?', [usuarioId]);
    return cultivos;    
}

//obtener un cultivo por su id
export async function obtenerCultivoPorId(id:string): Promise<Cultivo | null> {
    const db = await getDatabase();
    const cultivo = await db.getFirstAsync<Cultivo>(
        'SELECT * FROM CULTIVOS WHERE id = ?', [id]);
    return cultivo ?? null;
}

//Crear un nuevo cultivo
export async function crearCultivo(datos: CrearCultivoInput): Promise<Cultivo> {
    const db = await getDatabase();
    const id = Crypto.randomUUID();
    const createdAt = Date.now();
    const cultivo: Cultivo = { 
        id,
        usuario_id: datos.usuarioId,
        nombre: datos.nombre.trim(),
        fecha_siembra: datos.fechaSiembra,
        unidad_medida: datos.unidadMedida?.trim() || 'carga',
        categoria_1: datos.categoria1?.trim() || 'Primera',
        categoria_2: datos.categoria2?.trim() || 'Segunda',
        categoria_3: datos.categoria3?.trim() || 'Tercera',
        fecha_cosecha_estimada: datos.fechaCosechaEstimada ?? null,
        crear_recordatorio_cosecha: datos.crearRecordatorioCosecha? 1 : 0,
        dias_anticipacion_recordatorio: datos.diasAnticipacionRecordatorio ?? null,
        observaciones: datos.observaciones || null,
        created_at: createdAt,
        updated_at: createdAt
    };
    await db.runAsync(
        `INSERT INTO CULTIVOS (id, usuario_id, nombre, fecha_siembra, unidad_medida,
         categoria_1, categoria_2, categoria_3, fecha_cosecha_estimada, crear_recordatorio_cosecha, dias_anticipacion_recordatorio, observaciones, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
        cultivo.id,
        cultivo.usuario_id,
        cultivo.nombre,
        cultivo.fecha_siembra,
        cultivo.unidad_medida,
        cultivo.categoria_1,
        cultivo.categoria_2,
        cultivo.categoria_3,
        cultivo.fecha_cosecha_estimada,
        cultivo.crear_recordatorio_cosecha,
        cultivo.dias_anticipacion_recordatorio,
        cultivo.observaciones,
        cultivo.created_at,
        cultivo.updated_at
    ]
);
return cultivo;
}
//Actualizar un cultivo existente
export async function actualizarCultivo( id:string, datos: Partial<CrearCultivoInput>): Promise<void> {
 const db = await getDatabase();
 const actual= await obtenerCultivoPorId(id);
 const updateAt= Date.now();
 if(!actual){
    throw new Error('Cultivo no encontrado');
 }

 await db.runAsync(
    `UPDATE CULTIVOS SET nombre = ?, fecha_siembra = ?, unidad_medida = ?, categoria_1 = ?, 
    categoria_2 = ?,categoria_3 = ?, fecha_cosecha_estimada = ?, crear_recordatorio_cosecha = ?, 
    dias_anticipacion_recordatorio = ?, observaciones = ?, updated_at = ? WHERE id = ?`,
    [
        datos.nombre?.trim() || actual.nombre,
        datos.fechaSiembra ?? actual.fecha_siembra,
        datos.unidadMedida?.trim() || actual.unidad_medida,
        datos.categoria1?.trim() || actual.categoria_1,
        datos.categoria2?.trim() || actual.categoria_2,
        datos.categoria3?.trim() || actual.categoria_3,
        datos.fechaCosechaEstimada ?? actual.fecha_cosecha_estimada,
        datos.crearRecordatorioCosecha !== undefined
        ? (datos.crearRecordatorioCosecha ? 1 : 0) : actual.crear_recordatorio_cosecha,
        datos.diasAnticipacionRecordatorio ?? actual.dias_anticipacion_recordatorio,
        datos.observaciones || actual.observaciones,
        updateAt,
        id
    ]
);
}

//Eliminar un cultivo por su id
export async function eliminarCultivo(id:string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM CULTIVOS WHERE id = ?', [id]);
}
