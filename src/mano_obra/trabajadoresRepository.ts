import { getDatabase } from "@/database/connection";
import * as Crypto from 'expo-crypto';

export interface Trabajador{
    id:string;
    usuario_id:string;
    nombre:string;
    created_at:number;
};
//Listar trabajadores
export async function listarTrabajadores(usuarioId:string): Promise<Trabajador[]>{
    const db = await getDatabase();
    return await db.getAllAsync<Trabajador>(
       'SELECT * FROM TRABAJADORES WHERE usuario_id = ? ORDER BY nombre ASC;',
       [usuarioId]
    );  
}

//Crear trabajador 
export async function crearTrabajador(usuarioId: string, nombre: string ): Promise<Trabajador>{
    const db = await getDatabase();

    const trabajador: Trabajador = {
    id: Crypto.randomUUID(),
    usuario_id : usuarioId,
    nombre: nombre.trim(),
    created_at: Date.now(), 
    };
    await db.runAsync(
        'INSERT INTO TRABAJADORES (id, usuario_id, nombre, created_at) VALUES(?,?,?,?)',
        [trabajador.id,
        trabajador.usuario_id,
        trabajador.nombre,
        trabajador.created_at
        ]
    );
    return trabajador;
}
    
