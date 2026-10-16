import { getDatabase } from '@/database/connection';
import { generateSalt, hashWithSalt } from '@/shared/utils/crypto';
import * as Crypto from 'expo-crypto';

export interface Usuario {
    id: string;
    nombre_completo: string;
    correo: string | null;
    pin_hash: string;
    pin_salt: string;
    fecha_nacimiento_hash: string;
    municipio_hash: string;
    created_at: number
};

//Verifica si existe un usuario registrado 
export async function existeUsuario():Promise <boolean> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{count:number}> (
    'SELECT COUNT(*) AS count FROM USUARIOS;');
    return (result?.count ?? 0)> 0
};

//Obtener el usuario registrado.
export async function obtenerUsuario(): Promise <Usuario|null> {
    const db = await getDatabase();
    const usuario = await db.getFirstAsync<Usuario>(
       'SELECT * FROM USUARIOS LIMIT 1;' );
       return usuario ?? null
};

//Crea el usuario en el registro inicial.
export async function crearUsuario (datos: {
    nombreCompleto: string;
    correo?: string;
    pin: string;
    fechaNacimiento: string;
    municipio: string
}) : Promise<Usuario> {
    const  db = await getDatabase();
    const id = Crypto.randomUUID();
    const pinSalt = await generateSalt();
    const pinHash = await hashWithSalt(datos.pin, pinSalt);
    const fechaNacimientoHash = await hashWithSalt(datos.fechaNacimiento, pinSalt);
    const municipioHash= await hashWithSalt(datos.municipio.toLowerCase().trim(), pinSalt);
    const createdAt = Date.now()
    

    await db.runAsync(
        `INSERT INTO USUARIOS
        (id, nombre_completo, correo,pin_hash, pin_salt, fecha_nacimiento_hash,municipio_hash ,created_at)
        VALUES(?,?,?,?,?,?,?,?);`,
        [id,datos.nombreCompleto, datos.correo ?? null, pinHash, pinSalt, fechaNacimientoHash, municipioHash, createdAt]);

        return {
        id,
        nombre_completo:datos.nombreCompleto,
        correo: datos.correo ?? null,
        pin_hash : pinHash,
        pin_salt: pinSalt,
        fecha_nacimiento_hash: fechaNacimientoHash,
        municipio_hash: municipioHash,
        created_at: createdAt,
        };
}

//Verificar los datos de recuperación 
export async function verificarDatosRecuperacion(datos: {
  nombreCompleto: string;
  fechaNacimiento: string;
  municipio: string;
}): Promise<boolean> {
     const usuario = await obtenerUsuario();
  if (!usuario) return false;

     const nombreCoincide =
    usuario.nombre_completo.trim().toLowerCase() === datos.nombreCompleto.trim().toLowerCase();

     const fechaHashCalculado = await hashWithSalt(datos.fechaNacimiento, usuario.pin_salt);
     const municipioHashCalculado = await hashWithSalt( datos.municipio.toLowerCase().trim(), usuario.pin_salt);
     const fechaCoincide = fechaHashCalculado === usuario.fecha_nacimiento_hash;
  const municipioCoincide = municipioHashCalculado === usuario.municipio_hash;

  return nombreCoincide && fechaCoincide && municipioCoincide;
}
//Nuevo PIN
export async function actualizarPin(pinNuevo: string): Promise<void> {
    const db = await getDatabase();
   const usuario = await obtenerUsuario();
  if (!usuario) throw new Error('No hay usuario registrado.');

   const nuevoSalt = await generateSalt();
   const nuevoHash = await hashWithSalt(pinNuevo, nuevoSalt);
  await db.runAsync(
    'UPDATE USUARIOS SET pin_hash = ?, pin_salt = ? WHERE id = ?;',
    [nuevoHash, nuevoSalt, usuario.id]
  );
}