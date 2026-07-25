import { getDatabase } from "./connection";
import { CREATE_TABLES } from "./schema";

const CURRENT_VERSION = 1;

export async function runMigrations(): Promise <void> {
    const db = await getDatabase();

    const result = await db.getFirstAsync <{user_version:number}>
        ('PRAGMA user_version;')

        const currentVersion = result?.user_version??0;

    if(currentVersion === 0){
        await db.execAsync(CREATE_TABLES);
        await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION};`);
        console.log('Migración inicial completada');
    return;
    };

    if (currentVersion < CURRENT_VERSION) {
      await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION};`);
      console.log(`Migración de versión ${currentVersion} a ${CURRENT_VERSION}`);
    }
}
