import { verifyHash } from "@/shared/utils/crypto";
import { actualizarPin, crearUsuario, existeUsuario, obtenerUsuario, Usuario, verificarDatosRecuperacion } from "./authRepository";
export interface RegistroInput {
    nombreCompleto: string;
    municipio: string;
    correo?: string;
    fechaNacimiento: string;
    pin: string;
    confirmarPin: string;
}

export interface RegistroResultado {
    exito:boolean;
    error?: string;
    usuario?: Usuario;
}

export interface LoginResultado {
    exito: boolean;
    error?: string;
    usuario?:Usuario;
}

export interface RecuperacionInput {
  nombreCompleto: string;
  municipio: string;
  fechaNacimiento: string;
}

export interface RecuperacionResultado {
  exito: boolean;
  error?: string;
}
//verifica si hay un usuario registrado
export async function verificarUsuarioExistente(): Promise<boolean> {
    return await existeUsuario();
}


export async function registrarAgricultor(datos: RegistroInput): Promise<RegistroResultado> {
  const yaExiste = await existeUsuario();
  if (yaExiste) {
    return { exito: false, error: 'Ya existe un usuario registrado en este dispositivo.' };
}

//Valida los campos obligatorios
  if (!datos.nombreCompleto.trim()) {
    return { exito: false, error: 'El nombre completo es obligatorio.' };
  }
  if (!datos.municipio.trim()) {
    return { exito: false, error: 'El municipio es obligatorio.' };
  }
  if (!datos.fechaNacimiento) {
    return { exito: false, error: 'La fecha de nacimiento es obligatoria.' };
  }
  const pinValido = /^\d{4}$/.test(datos.pin);
  if (!pinValido) {
    return { exito: false, error: 'El PIN debe tener exactamente 4 dígitos.' };
  }

  if (datos.pin !== datos.confirmarPin) {
    return { exito: false, error: 'Los PIN no coinciden.' };
  }
//Si todo es válido crear el usuario 
  const usuario = await crearUsuario({
    nombreCompleto: datos.nombreCompleto.trim(),
    correo: datos.correo,
    pin: datos.pin,
    fechaNacimiento: datos.fechaNacimiento,
    municipio: datos.municipio,
  });

  return { exito: true, usuario };
}

//verificar si el PIN pertenece al usuario registrado.
export async function iniciarSesion(pin: string): Promise<LoginResultado> {
  const usuario = await obtenerUsuario();
  if (!usuario) {
    return { exito: false, error: 'No hay ningún usuario registrado en este dispositivo.' };
  }

  const pinCorrecto = await verifyHash(pin, usuario.pin_salt, usuario.pin_hash);
  if (!pinCorrecto) {
    return { exito: false, error: 'PIN incorrecto.' };
  }

  return { exito: true, usuario };
}
//Verifica identidad
export async function verificarIdentidadRecuperacion(datos:RecuperacionInput):Promise<RecuperacionResultado>{
  if(!datos.nombreCompleto.trim() || !datos.municipio || !datos.fechaNacimiento.trim()){
    return {exito:false, error:"Completa todos los campos."};
  }
  const coincide= await verificarDatosRecuperacion(datos)

  if(!coincide){
    return {exito:false, error:"Los datos no coinciden con tu registro"}
  }
   return {exito:true}
}

//Nuevo PIN
export async function establecerNuevoPin(pin: string, confirmarPin:string): Promise<RecuperacionResultado> {
const pinValido = /^\d{4}$/.test(pin);
if(!pinValido){
  return {exito: false, error:"El PIN debe tener exactamente 4 dígitos"}
}
if(pin !== confirmarPin){
  return {exito:false, error:'Los PIN no coinciden.'};
}

await actualizarPin(pin);
return {exito: true};
}