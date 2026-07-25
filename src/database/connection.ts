import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES } from './schema';

//Nombre del archivo de la base de datos SQLite
const DATABASE_NAME = 'agronexis.db';

let db: SQLite.SQLiteDatabase | null = null;

// Conexión con la base de datos.
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) {
        return db;
    }

    db= await SQLite.openDatabaseAsync(DATABASE_NAME);

    await db.execAsync('PRAGMA foreign_keys = ON;');
        return db;
}
//Inicializa la base de datos con las tablas necesarias
export async function initDatabase(): Promise <void> {
    const database = await getDatabase();
    await database.execAsync(CREATE_TABLES);
    console.log('Base de datos inicializada correctamente');
}