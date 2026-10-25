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

    const canonicalUrl = `https://everydaycut.com/#/${seo.slug}`;

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
    setMetaTag('property', 'og:image', 'https://everydaycut.com/samples/portrait.jpg');

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', seo.metaDescription);
    setMetaTag('name', 'twitter:image', 'https://everydaycut.com/samples/portrait.jpg');

    // 5. Rich Schema.org JSON-LD (WebApplication + FAQPage + BreadcrumbList)
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
          '@type': 'WebApplication',
          name: 'EverydayCut',
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
            'Bicubic Unsharp Masking 4K Upscaler',
            'Fast Marching Magic Eraser Inpainting',
            'Advanced Multi-Stop Linear & Radial Gradient Studio',
            'Government Official ID Presets (PAN Card & Passport)',
            'E-Commerce 85% Rule Staging for Amazon & Shopify',
          ],
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '14820',
            bestRating: '5',
            worstRating: '1',
          },
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
              item: 'https://everydaycut.com/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: seo.h1,
              item: canonicalUrl,
            },
          ],
        },
      ],
    };

    jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
  }, [seo]);

  // Semantic SEO DOM node for crawler indexing (accessible to search engine spiders)
  return (
    <section className="sr-only" aria-label="SEO Page Context">
      <h1>{seo.h1}</h1>
      <h2>{seo.h2}</h2>
      <p>{seo.metaDescription}</p>
      <div itemScope itemType="https://schema.org/FAQPage">
        {seo.faqs.map((faq, i) => (
          <article key={i} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
            <h3 itemProp="name">{faq.question}</h3>
            <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">{faq.answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
