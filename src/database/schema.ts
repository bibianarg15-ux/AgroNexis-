export const CREATE_TABLES = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS USUARIOS (
 id TEXT PRIMARY KEY,
 nombre_completo TEXT NOT null,
 correo TEXT,
 pin_hash TEXT NOT null,
 pin_salt TEXT NOT null,
 fecha_nacimiento_hash TEXT NOT null,
 municipio_hash TEXT NOT null,
 created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS CULTIVOS (
id TEXT PRIMARY KEY,
usuario_id TEXT NOT NULL,
nombre TEXT NOT NULL,
fecha_siembra INTEGER NOT NULL,
unidad_medida TEXT NOT NULL DEFAULT 'carga',
categoria_1 TEXT NOT NULL DEFAULT 'Primera',
categoria_2 TEXT NOT NULL DEFAULT 'Segunda',
categoria_3 TEXT NOT NULL DEFAULT 'Tercera',
fecha_cosecha_estimada INTEGER,
crear_recordatorio_cosecha INTEGER NOT NULL DEFAULT 0,
dias_anticipacion_recordatorio INTEGER,
observaciones TEXT,
created_at INTEGER NOT NULL,
updated_at INTEGER NOT NULL,
FOREIGN KEY(usuario_id) REFERENCES USUARIOS(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ACTIVIDADES (
id TEXT PRIMARY KEY,
cultivo_id TEXT NOT NULL,
actividad TEXT NOT NULL,
es_cosecha INTEGER NOT NULL DEFAULT 0,
fecha INTEGER NOT NULL,
observaciones TEXT,
crear_recordatorio INTEGER NOT NULL DEFAULT 0,
dias_recordatorio INTEGER,
created_at INTEGER NOT NULL ,
updated_at INTEGER,
FOREIGN KEY(cultivo_id) REFERENCES CULTIVOS(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS REGISTROS_COSECHA (
id TEXT PRIMARY KEY,
actividad_id TEXT NOT NULL UNIQUE,
categoria_1_cantidad REAL NOT NULL DEFAULT 0,
categoria_2_cantidad REAL NOT NULL DEFAULT 0,
categoria_3_cantidad REAL NOT NULL DEFAULT 0, 
created_at INTEGER NOT NULL,
updated_at INTEGER,
FOREIGN KEY(actividad_id) REFERENCES ACTIVIDADES(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS TRABAJADORES (
id TEXT PRIMARY KEY,
nombre TEXT NOT NULL,
usuario_id TEXT NOT NULL,
created_at INTEGER NOT NULL,
FOREIGN KEY(usuario_id) REFERENCES USUARIOS(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MANO_OBRA(
id TEXT PRIMARY KEY,
cultivo_id TEXT NOT NULL,
trabajador_id TEXT NOT NULL,
fecha INTEGER NOT NULL,
valor_jornal REAL NOT NULL,
observaciones TEXT,
created_at INTEGER NOT NULL,
updated_at INTEGER,
FOREIGN KEY(cultivo_id) REFERENCES CULTIVOS(id) ON DELETE CASCADE,
FOREIGN KEY(trabajador_id) REFERENCES TRABAJADORES(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS FINANZAS(
id TEXT PRIMARY KEY,
cultivo_id TEXT NOT NULL,
tipo TEXT NOT NULL CHECK(tipo IN ('ingreso', 'egreso')),
descripcion TEXT NOT NULL,
valor REAL NOT NULL,
fecha INTEGER NOT NULL,
created_at INTEGER NOT NULL,
updated_at INTEGER,
FOREIGN KEY(cultivo_id)REFERENCES CULTIVOS(id) ON DELETE CASCADE
);

`;