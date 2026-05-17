'use client';

import { useEffect } from 'react';

/**
 * JsonLd — Injects schema.org structured data into the page <head>.
 *
 * Use this component inside page components to add per-page JSON-LD
 * that search engines and AI crawlers (ChatGPT, Claude, Gemini,
 * Perplexity) use to understand and surface your content.
 *
 * Example usage:
 * ```tsx
 * <JsonLd schema={buildPersonSchema({ name: 'Dr. Smith', ... })} />
 * <JsonLd schema={buildBreadcrumbSchema([...])} />
 * <JsonLd schema={buildFAQSchema([...])} />
 * ```
 *
 * Multiple <JsonLd> components can be used on the same page.
 * Each one creates a separate <script type="application/ld+json"> tag.
 */
export default function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  useEffect(() => {
    // Create the script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [schema]);

  return null;
}
