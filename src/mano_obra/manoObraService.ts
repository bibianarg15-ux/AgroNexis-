import { obtenerUsuario } from '@/auth/authRepository';
import { formatearRangoSemana, obtenerRangoSemana } from '@/shared/utils/fechas';
import {
  actualizarJornal,
  crearJornal,
  CrearJornalInput,
  eliminarJornal,
  JornalConDetalle,
  listarJornalesPorCultivo,
  listarTodosLosJornales,
} from './manoObraRepository';
import { crearTrabajador, listarTrabajadores, Trabajador } from './trabajadoresRepository';

export interface JornalFormInput {
  cultivoId: string;
  trabajadorId: string;
  fecha?: number;
  valorJornal: number;
  observaciones?: string;
}

export interface JornalResultado {
  exito: boolean;
  error?: string;
}

export interface TrabajadorConJornales {
  trabajadorId: string;
  nombre: string;
  jornales: JornalConDetalle[];
  totalTrabajador: number;
}

export interface SemanaAgrupada {
  inicio: number;
  fin: number;
  textoRango: string;
  trabajadores: TrabajadorConJornales[];
  totalSemana: number;
  totalJornales: number;
}

//Agrupa una lista de jornales por semana y, dentro de cada semana por trabajador. 
function agruparPorSemanaYTrabajador(jornales: JornalConDetalle[]): SemanaAgrupada[] {
  const semanasMap = new Map<string, SemanaAgrupada>();

  for (const jornal of jornales) {
    const { inicio, fin } = obtenerRangoSemana(jornal.fecha);
    const claveSemana = `${inicio}`;

    if (!semanasMap.has(claveSemana)) {
      semanasMap.set(claveSemana, {
        inicio,
        fin,
        textoRango: formatearRangoSemana(inicio, fin),
        trabajadores: [],
        totalSemana: 0,
        totalJornales: 0,
      });
    }

    const semana = semanasMap.get(claveSemana)!;
    let trabajadorEntry = semana.trabajadores.find((t) => t.trabajadorId === jornal.trabajador_id);

    if (!trabajadorEntry) {
      trabajadorEntry = {
        trabajadorId: jornal.trabajador_id,
        nombre: jornal.trabajador_nombre,
        jornales: [],
        totalTrabajador: 0,
      };
      semana.trabajadores.push(trabajadorEntry);
    }

    trabajadorEntry.jornales.push(jornal);
    trabajadorEntry.totalTrabajador += jornal.valor_jornal;
    semana.totalSemana += jornal.valor_jornal;
    semana.totalJornales += 1;
  }

  // Ordena las semanas de más reciente a más antigua
  return Array.from(semanasMap.values()).sort((a, b) => b.inicio - a.inicio);
}

//Obtiene los jornales de un cultivo específico (vista desde detalles del cultivo).
export async function obtenerManoObraPorCultivo(cultivoId: string): Promise<SemanaAgrupada[]> {
  const jornales = await listarJornalesPorCultivo(cultivoId);
  return agruparPorSemanaYTrabajador(jornales);
}

// Obtiene todos los jornales del agricultor(vista desde el footer).
export async function obtenerTodaLaManoObra(): Promise<SemanaAgrupada[]> {
  const usuario = await obtenerUsuario();
  if (!usuario) return [];
  const jornales = await listarTodosLosJornales(usuario.id);
  return agruparPorSemanaYTrabajador(jornales);
}

//Lista los trabajadores disponibles para el selector del formulario.
export async function listarTrabajadoresDelUsuario(): Promise<Trabajador[]> {
  const usuario = await obtenerUsuario();
  if (!usuario) return [];
  return await listarTrabajadores(usuario.id);
}

//Registra un nuevo trabajador desde el botón "+ Agregar nuevo trabajador".
export async function registrarTrabajador(nombre: string): Promise<{ exito: boolean; error?: string; trabajador?: Trabajador }> {
  const usuario = await obtenerUsuario();
  if (!usuario) {
    return { exito: false, error: 'No hay ningún usuario registrado en este dispositivo.' };
  }

  if (!nombre.trim()) {
    return { exito: false, error: 'El nombre del trabajador es obligatorio.' };
  }

  const trabajador = await crearTrabajador(usuario.id, nombre);
  return { exito: true, trabajador };
}

//Registra un nuevo jornal, validando los datos antes de guardarlo.
export async function registrarJornal(datos: JornalFormInput): Promise<JornalResultado> {
  if (!datos.trabajadorId) {
    return { exito: false, error: 'Selecciona un trabajador.' };
  }

 const fecha= datos.fecha ?? Date.now();

  if (!datos.valorJornal || datos.valorJornal <= 0) {
    return { exito: false, error: 'El valor del jornal debe ser mayor a cero.' };
  }

  const input: CrearJornalInput = {
    cultivoId: datos.cultivoId,
    trabajadorId: datos.trabajadorId,
    fecha,
    valorJornal: datos.valorJornal,
    observaciones: datos.observaciones,
  };
  await crearJornal(input);
  return { exito: true };
}
//Editar un jornal
export async function editarJornal(
  id: string,
  datos: { fecha?: number; valorJornal?: number; observaciones?: string }
): Promise<JornalResultado> {
  if (datos.valorJornal !== undefined && datos.valorJornal <= 0) {
    return { exito: false, error: 'El valor del jornal debe ser mayor a cero.' };
  }

  await actualizarJornal(id, datos);
  return { exito: true };
}

 //Eliminar jornal.
export async function borrarJornal(id: string): Promise<JornalResultado> {
  await eliminarJornal(id);
  return { exito: true };
}