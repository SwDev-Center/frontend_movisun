import { Pool, type QueryResultRow } from "pg";

// Cliente de PostgreSQL. Solo se usa desde el servidor: DATABASE_URL nunca
// lleva el prefijo NEXT_PUBLIC_, así que jamás llega al navegador.

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Falta DATABASE_URL. Copiá .env.example a .env.local y poné la cadena de conexión de Supabase."
  );
}

// TLS: Supabase presenta un certificado firmado por una CA propia, que no está
// en el almacén de certificados del sistema. rejectUnauthorized:false mantiene
// la conexión CIFRADA pero NO verifica la identidad del servidor.
// Es el equivalente a sslmode=require de libpq y lo que usa la mayoría de los
// proyectos con Supabase. Para verificación completa hay que descargar la CA de
// Supabase y pasarla en la opción `ca`.
// Sin esto la conexión viajaría en texto plano: node-postgres no activa TLS por
// defecto y la URL del pooler no trae sslmode.
const ssl = { rejectUnauthorized: false };

// Next reinicia los módulos en cada recompilación en desarrollo; sin esta caché
// cada cambio de archivo abriría un pool nuevo hasta agotar las conexiones.
const globalForDb = globalThis as unknown as { movisunPool?: Pool };

export const pool =
  globalForDb.movisunPool ??
  new Pool({
    connectionString,
    ssl,
    // El pooler de Supabase en modo transacción (puerto 6543) ya multiplexa;
    // este pool solo evita reconectar en cada consulta.
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.movisunPool = pool;

/** Ejecuta una consulta y devuelve las filas ya tipadas. */
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await pool.query<T>(text, params);
  return res.rows;
}

/** Ejecuta varias consultas dentro de una transacción. */
export async function transaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}
