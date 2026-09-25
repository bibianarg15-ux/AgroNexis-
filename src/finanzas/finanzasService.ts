import { Cultivo } from '@/cultivos/cultivosRepository';
import { listarCultivosDelUsuario } from '@/cultivos/cultivosService';
import { sumarJornalesPorCultivo } from '@/mano_obra/manoObraRepository';
import { actualizarFinanza, crearFinanza, CrearFinanzaInput, eliminarFinanza, Finanza, listarFinanzasPorCultivo, obtenerFinanzaPorId, sumarIngresosYEgresos } from './finanzasRepository';

export interface FinanzaFormInput {
    cultivoId: string;
    tipo: 'ingreso' | 'egreso';
    descripcion: string;
    valor: number;
    fecha: number;
}

export interface BalanceCultivo{
    ingresos: number;
    egresos: number;
    gastoManoObra: number;
    balance: number;
}

export interface CultivoConBalance{
    cultivo: Cultivo;
    balance: BalanceCultivo;
}

export interface FinanzaResultado {
    exito: boolean;
    error?: string;
    finanza?: Finanza;
}

//Balance de un cultivo combinando finanzas y mano de obra
export async function calcularBalanceCultivo(cultivoId: string ): Promise<BalanceCultivo> {
  const [{ingresos, egresos: egresosFinanzas}, gastoManoObra] = await Promise.all([
    sumarIngresosYEgresos(cultivoId),
    sumarJornalesPorCultivo(cultivoId)
  ]);
  const egresos = egresosFinanzas + gastoManoObra;
  return {
    ingresos,
    egresos,
    gastoManoObra: gastoManoObra,
    balance: ingresos - egresos
  };
}

//listar todos los cultivos de un usuario con su balance
export async function obtenerBalanceGeneral():Promise<CultivoConBalance[]> {
 const cultivos = await listarCultivosDelUsuario();

  const resultado = await Promise.all(cultivos.map(async (cultivo) => ({
    cultivo,
    balance: await calcularBalanceCultivo(cultivo.id)
  })));
  return resultado;
};

//Listar todas las finanzas de un cultivo
export async function obtenerFinanzasDelCultivo(cultivoId: string): Promise<{
movimientos: Finanza[]; 
balance: BalanceCultivo;}>{
    
    const [movimientos, balance] = await Promise.all([
      listarFinanzasPorCultivo(cultivoId),
      calcularBalanceCultivo(cultivoId)
    ]);
 return {movimientos, balance};
  };

  //Registrar un nuevo movimiento financiero
export async function registrarFinanza(datos: FinanzaFormInput): Promise<FinanzaResultado> {
  if (!datos.descripcion.trim()) {
    return { exito: false, error: 'Escribe una descripción del movimiento' };
  };

  if(!datos. valor || datos.valor <= 0 ){
    return { exito: false, error: 'El valor del movimiento debe ser mayor a cero' };
  };

  const fecha = datos.fecha ?? Date.now();
  if(fecha > Date.now()) {
    return { exito: false, error: 'La fecha del movimiento no puede ser posterior a la fecha actual' };
  };

  const input: CrearFinanzaInput = {
    cultivoId: datos.cultivoId,
    tipo: datos.tipo,
    descripcion: datos.descripcion,
    valor: datos.valor,
    fecha: fecha
  };

  await crearFinanza(input);
  return { exito: true };
};

//Editar un movimiento financiero existente
export async function editarFinanza(id:string, datos: Partial<FinanzaFormInput>): Promise<FinanzaResultado> {

  if(datos.descripcion !== undefined && !datos.descripcion.trim()){
    return { exito: false, error: 'Escribe una descripción del movimiento' };
  };

  if (datos.valor !== undefined && datos.valor <= 0){
    return { exito: false, error: 'El valor del movimiento debe ser mayor a cero' };
  };

  await actualizarFinanza(id, datos);
  return {exito : true };
};

//Eliminar un movimiento financiero
export async function borrarFinanza(id:string): Promise<FinanzaResultado>{
  await eliminarFinanza(id);
  return{exito: true}
};

//Obtener finanza
export async function ObtenerFinanza(id:string): Promise<Finanza | null> {
 return await obtenerFinanzaPorId(id);
};