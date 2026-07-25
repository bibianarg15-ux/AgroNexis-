import { verifyHash } from "@/shared/utils/crypto";
import { crearUsuario, existeUsuario, obtenerUsuario, Usuario } from "./authRepository";

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

//verifica si hay un usuario registrado
export async function verificarUsuarioExistente(): Promise<boolean> {
    return await existeUsuario();
}

//Registra al usuario 
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