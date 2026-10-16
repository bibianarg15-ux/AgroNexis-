export function parsearEntero(texto:string): number | undefined {
    const valor = parseInt(texto, 10);
    return Number.isNaN(valor) ? undefined : valor;
}