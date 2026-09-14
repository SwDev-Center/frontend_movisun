import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Por defecto son 1 MB y no alcanza para subir la foto de un producto.
      // Se deja algo de aire sobre el máximo de 5 MB que valida el panel
      // (TAMANO_MAX_IMAGEN), porque multipart/form-data agrega sus propios bytes.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
