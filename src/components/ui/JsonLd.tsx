// Renderiza datos estructurados (schema.org) en un <script type="application/ld+json">.
// Los "<" se escapan como \u003c porque dentro de un string JSON un "<" literal
// puede interpretarse como el inicio de una etiqueta <script>.
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}