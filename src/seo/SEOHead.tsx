import React, { useEffect } from 'react';
import { ToolPresetId } from '../engine/state/types.ts';
import { getSEOEntryByPreset } from './seoData.ts';

interface SEOHeadProps {
  activeToolPreset?: ToolPresetId | null;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ activeToolPreset }) => {
  const seo = getSEOEntryByPreset(activeToolPreset);

  useEffect(() => {
    // 1. Update Title
    document.title = seo.title;

    // Helper to update or create meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to update or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    const siteOrigin = 'https://cut.everydaypdf.me';
    const canonicalUrl = activeToolPreset && seo.slug ? `${siteOrigin}/${seo.slug}` : `${siteOrigin}/`;

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', seo.metaDescription);
    setMetaTag('name', 'keywords', seo.keywords.join(', '));
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large');
    setLinkTag('canonical', canonicalUrl);

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', seo.title);
    setMetaTag('property', 'og:description', seo.metaDescription);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'EverydayCut');
    setMetaTag('property', 'og:image', `${siteOrigin}/samples/portrait.jpg`);

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', seo.metaDescription);
    setMetaTag('name', 'twitter:image', `${siteOrigin}/samples/portrait.jpg`);

    // 5. Clean Schema.org JSON-LD (SoftwareApplication + FAQPage + BreadcrumbList)
    let jsonLdScript = document.getElementById('everydaycut-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'everydaycut-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          '@id': `${siteOrigin}/#software`,
          name: activeToolPreset ? `EverydayCut - ${seo.h1}` : 'EverydayCut Studio',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'All (Browser-Based WebGPU/WASM)',
          browserRequirements: 'Requires modern browser with WebAssembly / WebGPU support',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: [
            '100% In-Browser AI Background Removal',
            'Zero Cloud Uploads & Local RAM Privacy',
            'Government Official ID Presets (PAN Card 213x213 <30KB & Passport)',
            'High-Precision 4K Clarity Upscaler',
            'Fast Marching Magic Eraser Inpainting',
            'Smart Image Format & Exact KB Compressor',
            'E-Commerce 85% Rule Staging for Amazon & Shopify',
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: seo.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${siteOrigin}/`,
            },
            ...(activeToolPreset && seo.slug
              ? [
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: seo.h1,
                    item: canonicalUrl,
                  },
                ]
              : []),
          ],
        },
      ],
    };

    jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
  }, [seo, activeToolPreset]);

  return null;
};
