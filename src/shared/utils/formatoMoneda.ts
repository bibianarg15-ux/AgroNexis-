
export function formatearMiles(valor: string): string {
  const numeros = valor.replace(/\D/g, '');

  if (!numeros) return '';

  return Number(numeros).toLocaleString('es-CO');
}

export function obtenerValorNumerico(valor: string): number {
  return Number(valor.replace(/\D/g, '')) || 0;
}
