import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";

// Sesión del panel de administración.
//
// No hay tabla de usuarios: una sola contraseña en ADMIN_PASSWORD y una cookie
// firmada con HMAC-SHA256 usando ADMIN_SESSION_SECRET. La cookie no guarda
// datos, solo una fecha de vencimiento firmada: sin el secreto no se puede
// fabricar una válida.

const COOKIE = "movisun_admin";
const DURACION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function leerEnv(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta ${nombre} en .env.local. El panel de administración no puede funcionar sin esa variable.`
    );
  }
  return valor;
}

function firmar(payload: string): string {
  return createHmac("sha256", leerEnv("ADMIN_SESSION_SECRET")).update(payload).digest("base64url");
}

/** Comparación en tiempo constante: no filtra información por cuánto tarda. */
function igualesSeguro(a: string, b: string): boolean {
  // Se comparan los hashes y no los textos para que ambos lados midan lo mismo;
  // timingSafeEqual exige longitudes iguales.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function crearToken(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + DURACION_MS })).toString(
    "base64url"
  );
  return `${payload}.${firmar(payload)}`;
}

function tokenValido(token: string): boolean {
  const [payload, firma] = token.split(".");
  if (!payload || !firma) return false;

  // Primero la firma: si no es nuestra, el contenido no se mira siquiera.
  if (!igualesSeguro(firma, firmar(payload))) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

// ─── Freno al ensayo de contraseñas ─────────────────────────────────────────
// Retraso creciente por IP tras cada fallo. No bloquea la cuenta a propósito:
// un bloqueo se puede usar para dejar afuera al dueño del sitio.
// Vive en memoria del proceso, así que se reinicia con el servidor y no se
// comparte entre instancias; frena un ataque casero, no uno distribuido.
const fallos = new Map<string, { n: number; ultimo: number }>();
const VENTANA_MS = 15 * 60 * 1000;

async function ipDelCliente(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "desconocida").trim();
}

async function esperarPorFallos(ip: string): Promise<void> {
  const registro = fallos.get(ip);
  if (!registro || Date.now() - registro.ultimo > VENTANA_MS) return;
  const espera = Math.min(registro.n, 5) * 400;
  await new Promise((r) => setTimeout(r, espera));
}

// ─── API pública ────────────────────────────────────────────────────────────

/** true si la petición actual trae una cookie de sesión válida. */
export async function haySesion(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? tokenValido(token) : false;
}

/** Verifica la contraseña y, si es correcta, deja la cookie de sesión. */
export async function iniciarSesion(password: string): Promise<boolean> {
  const ip = await ipDelCliente();
  await esperarPorFallos(ip);

  if (!password || !igualesSeguro(password, leerEnv("ADMIN_PASSWORD"))) {
    const previo = fallos.get(ip);
    const dentroDeVentana = previo && Date.now() - previo.ultimo <= VENTANA_MS;
    fallos.set(ip, { n: (dentroDeVentana ? previo.n : 0) + 1, ultimo: Date.now() });
    return false;
  }

  fallos.delete(ip);
  (await cookies()).set(COOKIE, crearToken(), {
    httpOnly: true, // el JavaScript de la página no puede leerla
    sameSite: "lax", // no viaja en peticiones de otros sitios
    secure: process.env.NODE_ENV === "production", // en local no hay HTTPS
    path: "/",
    maxAge: DURACION_MS / 1000,
  });
  return true;
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/**
 * Corta la ejecución si no hay sesión. Va al principio de CADA Server Action
 * que escriba: el guardia del layout solo protege el renderizado de las
 * páginas, y una acción se puede invocar sin haber pasado por ellas.
 */
export async function exigirSesion(): Promise<void> {
  if (!(await haySesion())) {
    throw new Error("No autorizado: la sesión venció o no iniciaste sesión.");
  }
}
