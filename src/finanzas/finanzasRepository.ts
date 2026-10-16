import { getDatabase } from "@/database/connection";
import * as Crypto from 'expo-crypto';

export interface Finanza {
    id: string;
    cultivo_id: string;
    tipo:'ingreso' | 'egreso';
    descripcion: string;
    valor: number;
    fecha: number;
    created_at: number;
    updated_at: number | null;
}


export interface CrearFinanzaInput {
    cultivoId:string;
    tipo:'ingreso' | 'egreso';
    descripcion: string;
    valor: number;
    fecha: number;
}


//Listar movimientos financieros por  un cultivo
export async function listarFinanzasPorCultivo(cultivoId:string): Promise<Finanza[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Finanza>(
        'SELECT * FROM FINANZAS WHERE cultivo_id = ? ORDER BY fecha DESC' , [cultivoId]);  
}

//obtener una finanzas por su id
export async function obtenerFinanzaPorId(id:string): Promise<Finanza | null> {
    const db = await getDatabase();
    const finanza = await db.getFirstAsync<Finanza>(
        'SELECT * FROM FINANZAS WHERE id = ?', [id]);
    return finanza ?? null;
}

//sumar ingresos y egresos.
export async function sumarIngresosYEgresos(cultivoId:string): Promise<{ingresos: number, egresos: number}> {
const db = await getDatabase();
const resultado= await db.getFirstAsync<{ingresos: number, egresos: number,}>(
    `SELECT 
    COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN valor ELSE 0 END), 0) as ingresos,
    COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN valor ELSE 0 END), 0) as egresos
    FROM FINANZAS WHERE cultivo_id = ?;`,
     [cultivoId]
    );
    return resultado ?? {ingresos: 0, egresos: 0};
};

    
//Crear un movimiento financiero
export async function crearFinanza(datos: CrearFinanzaInput): Promise<Finanza> {
    const db = await getDatabase();


    const finanza: Finanza = { 
        id: Crypto.randomUUID(),
        cultivo_id: datos.cultivoId,
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        valor: datos.valor,
        fecha: datos.fecha,
        created_at: Date.now(),
        updated_at: Date.now()
    };
    await db.runAsync(
        `INSERT INTO FINANZAS (id, cultivo_id, tipo, descripcion, valor, fecha, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?)`,
    [
        finanza.id,
        finanza.cultivo_id,
        finanza.tipo,
        finanza.descripcion,
        finanza.valor,
        finanza.fecha,
        finanza.created_at,
        finanza.updated_at
    ]
);
return finanza;
}

//Actualizar una movimiento financiero existente
export async function actualizarFinanza( id: string, datos: Partial<CrearFinanzaInput>):Promise<void> {
    const db = await getDatabase();
    const actual = await obtenerFinanzaPorId(id)

    if(!actual) {
    throw new Error('Movimiento no encontrado.');
    }

  await db.runAsync(
    `UPDATE FINANZAS SET tipo = ?, descripcion = ?, 
    valor = ?, fecha = ?, updated_at = ? WHERE id = ?;`,
    [
        datos.tipo ?? actual.tipo,
        datos.descripcion ?? actual.descripcion,
        datos.valor ?? actual.valor,
        datos.fecha ?? actual.fecha,
        Date.now(),
        id
    ]
);
};

//Eliminar un movimiento financiero por su id
export async function eliminarFinanza(id:string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM FINANZAS WHERE id = ?', [id]);
};
