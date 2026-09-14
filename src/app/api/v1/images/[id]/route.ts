import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Sirve las imágenes subidas desde el panel, guardadas en la tabla `images`.
// El id es el hash del contenido: si el archivo cambia, cambia la URL. Por eso
// la respuesta puede cachearse para siempre sin miedo a servir algo viejo.

interface Fila {
  mime: string;
  bytes: Buffer;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [fila] = await query<Fila>("select mime, bytes from images where id = $1", [id]);

  if (!fila) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(fila.bytes), {
    headers: {
      "Content-Type": fila.mime,
      "Content-Length": String(fila.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
