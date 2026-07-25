import * as Crypto from 'expo-crypto';

//Genera el salt aleatorio
export  async function generateSalt ():Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
     return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2,'0'))
    .join('');
}

// Genera el hash SHA-256 + salt.
export async function hashWithSalt(text:string, salt:string): Promise<string> {
    const combined = `${text}${salt}`;
    return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256, 
    combined);
}
// verifica si texto plano cohincide con un hash + salt guardados.
export async function verifyHash(
    plainText:string,
    salt:string,
    storedHash:string
): Promise <boolean> {
    const  computedHash = await hashWithSalt(plainText, salt);
    return computedHash === storedHash;
}