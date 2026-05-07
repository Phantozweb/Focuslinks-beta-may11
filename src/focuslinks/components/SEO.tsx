'use client';

import { useEffect } from 'react';

const SITE_NAME = 'FocusLinks';
const DEFAULT_TITLE = "FocusLinks | World's First Global Platform for Optometrists";
const DEFAULT_DESCRIPTION = 'FocusLinks is the premier global network for eye care professionals, students, and organizations to collaborate, learn, and grow.';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({ title, description, keywords, image, type = 'website' }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to set/update a meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard meta tags
    setMeta('name', 'description', desc);
    if (keywords) setMeta('name', 'keywords', keywords);

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    if (image) setMeta('property', 'og:image', image);

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    if (image) setMeta('name', 'twitter:image', image);

    return () => {
      // Cleanup: restore defaults on unmount
      document.title = DEFAULT_TITLE;
      setMeta('name', 'description', DEFAULT_DESCRIPTION);
    };
  }, [fullTitle, desc, keywords, image, type]);

  return null;
}
