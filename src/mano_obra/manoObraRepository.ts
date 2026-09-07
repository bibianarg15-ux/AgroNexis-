import { getDatabase } from "@/database/connection";
import * as Crypto from "expo-crypto";

export interface Jornal {
id: string;
cultivo_id: string;
trabajador_id: string;
fecha: number;
valor_jornal: number;
observaciones: string | null;
created_at: number;
updated_at: number;
}

export interface JornalConDetalle extends Jornal{
    trabajador_nombre:string;
    cultivo_nombre:string;
}

export interface CrearJornalInput{
    cultivoId: string;
    trabajadorId: string;
    fecha: number;
    valorJornal: number;
    observaciones?: string;
}


//Listar jornales por cultivo (vista desde detalles del cultivo).
export async function listarJornalesPorCultivo(cultivoId:string): Promise<JornalConDetalle[]> {
    const db = await getDatabase();
    return await db.getAllAsync<JornalConDetalle>(
        `SELECT M.*, 
        T.nombre as trabajador_nombre,
        C.nombre as cultivo_nombre
        FROM MANO_OBRA M
        JOIN TRABAJADORES T ON M.trabajador_id = T.id
        JOIN CULTIVOS C ON  M.cultivo_id = C.id
        WHERE M.cultivo_id = ?
        ORDER BY M.fecha DESC;`,
        [cultivoId]
     );
    }

//Listar jornales general (vista desde footer).
export async function listarTodosLosJornales(usuarioId:string): Promise<JornalConDetalle[]> {
    const db = await getDatabase();
    return await db.getAllAsync<JornalConDetalle>(
        `SELECT M.*, 
        T.nombre as trabajador_nombre,
        C.nombre as cultivo_nombre
        FROM MANO_OBRA M
        JOIN TRABAJADORES T ON M.trabajador_id = T.id
        JOIN CULTIVOS C ON  M.cultivo_id = C.id
        WHERE C.usuario_id = ?
        ORDER BY M.fecha DESC;`,
        [usuarioId]
     );
    }
//Registrar un nuevo jornal
    export async function crearJornal(datos: CrearJornalInput): Promise<Jornal> {
  const db = await getDatabase();
  const jornal: Jornal = {
    id: Crypto.randomUUID(),
    cultivo_id: datos.cultivoId,
    trabajador_id: datos.trabajadorId,
    fecha: datos.fecha,
    valor_jornal: datos.valorJornal,
    observaciones: datos.observaciones?.trim() || null,
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  await db.runAsync(
    `INSERT INTO MANO_OBRA 
      (id, cultivo_id, trabajador_id, fecha, valor_jornal, observaciones, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      jornal.id,
      jornal.cultivo_id,
      jornal.trabajador_id,
      jornal.fecha,
      jornal.valor_jornal,
      jornal.observaciones,
      jornal.created_at,
      jornal.updated_at,
    ]);
  return jornal;
}

export async function obtenerJornalPorId(id: string): Promise<Jornal | null> {
  const db = await getDatabase();
  const jornal = await db.getFirstAsync<Jornal>('SELECT * FROM MANO_OBRA WHERE id = ?;', [id]);
  return jornal ?? null;
}

export async function actualizarJornal(
  id: string,
  datos: { fecha?: number; valorJornal?: number; observaciones?: string }
): Promise<void> {
  const db = await getDatabase();
  const actual = await obtenerJornalPorId(id);
  if (!actual) throw new Error('Jornal no encontrado.');

  await db.runAsync(
    `UPDATE MANO_OBRA SET fecha = ?, valor_jornal = ?, observaciones = ?, updated_at = ? WHERE id = ?;`,
    [
      datos.fecha ?? actual.fecha,
      datos.valorJornal ?? actual.valor_jornal,
      datos.observaciones !== undefined ? datos.observaciones?.trim() || null : actual.observaciones,
      Date.now(),
      id,
    ]
  );
}

//Elimina un jornal.
export async function eliminarJornal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM MANO_OBRA WHERE id = ?;', [id]);
}