/**
 * Reusable JSON-LD script tag renderer.
 * Escapes < to prevent XSS via dangerouslySetInnerHTML.
 * Use in Server Components only.
 */

type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export function JsonLdScript({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
