import { obtenerUsuario } from "../auth/authRepository";
import { actualizarCultivo, crearCultivo, CrearCultivoInput, Cultivo, eliminarCultivo, listarCultivos, obtenerCultivoPorId } from "./cultivosRepository";
export interface CultivoFormInput {
    nombre: string;
    fechaSiembra?: number;
    unidadMedida?: string;
    categoria1?: string;
    categoria2?: string;
    categoria3?: string;
    fechaCosechaEstimada?: number;
    crearRecordatorioCosecha?: boolean;
    diasAnticipacionRecordatorio?: number;
    observaciones?: string;
}

export interface CultivoResultado {
    exito: boolean;
    error?: string;
    cultivo?: Cultivo;
}
//lista todos los cultivos de un usuario
export async function listarCultivosDelUsuario(): Promise<Cultivo[]> {
    const usuario = await obtenerUsuario();
    if (!usuario) return [];
    return await listarCultivos(usuario.id);
    }
//obtener un cultivo por su id
export async function obtenerCultivo(id:string): Promise<Cultivo | null> {
    return await obtenerCultivoPorId(id);
}
//Crear un nuevo cultivo
export async function registraCultivo(datos: CultivoFormInput): Promise<CultivoResultado> {
    const usuario = await obtenerUsuario();
    if (!usuario) {
        return { exito: false, error: 'No hay ningun usuario registrado en este dispositivo' };
    }
    if (!datos.nombre.trim()) {
    return { exito: false, error: 'El nombre del cultivo es obligatorio' };
    }
    const fechaSiembra = datos.fechaSiembra ?? Date.now();

    if(fechaSiembra > Date.now()) {
        return { exito: false, error: 'La fecha de siembra no puede ser posterior a la fecha actual' };
    } 
    if(datos.fechaCosechaEstimada && datos.fechaCosechaEstimada <= fechaSiembra) {
        return { exito: false, error: 'La fecha de cosecha estimada debe ser posterior a la fecha de siembra' };
    }
    const diasAnticipacion = datos.crearRecordatorioCosecha
  ? (datos.diasAnticipacionRecordatorio ?? 3)
  : undefined;
 

  const cultivo = await crearCultivo({
    usuarioId: usuario.id,
    nombre:datos.nombre,
    fechaSiembra,
    unidadMedida: datos.unidadMedida,
    categoria1: datos.categoria1,
    categoria2: datos.categoria2,
    categoria3: datos.categoria3,
    fechaCosechaEstimada: datos.fechaCosechaEstimada,
    crearRecordatorioCosecha: datos.crearRecordatorioCosecha ? 1: 0,
    diasAnticipacionRecordatorio: diasAnticipacion,
    observaciones: datos.observaciones,
});
  return { exito: true, cultivo };
}

//editar un cultivo existente
export async function editarCultivo(id:string, datos: Partial<CultivoFormInput>): Promise<CultivoResultado> {
    if (datos.nombre !== undefined && !datos.nombre.trim()) {
        return { exito: false, error: 'El nombre del cultivo es obligatorio' };
    }  
    
    if( datos.fechaSiembra !== undefined && datos.fechaSiembra > Date.now()) {
        return { exito: false, error: 'La fecha de siembra no puede ser posterior a la fecha actual' };
    }
    await actualizarCultivo(id, datos as Partial<CrearCultivoInput>);
    const cultivoActualizado = await obtenerCultivoPorId(id);
    return { exito: true, cultivo: cultivoActualizado ?? undefined };
}

//eliminar un cultivo existente
export async function borrarCultivo(id: string): Promise<CultivoResultado> {
  await eliminarCultivo(id);
  return { exito: true };
}