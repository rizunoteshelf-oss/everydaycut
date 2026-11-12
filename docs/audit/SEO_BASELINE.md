# EVERYDAYCUT — TECHNICAL SEO & DISCOVERABILITY BASELINE (2026)

**Target Domain:** `https://cut.everydaypdf.me/`  
**Audit Scope:** URL Structure, Indexability, Rendering, Metadata, Structured Data, Sitemaps & Internal Linking  
**Standard:** Current Official Google Search Central Documentation & RFC 6596  

---

## 1. Executive Summary & Critical Defect Overview

The technical SEO foundation of EverydayCut is currently **severely compromised**. Although `src/seo/seoData.ts` contains rich copy, H1s, FAQs, and keywords for all 19 tools, **the application cannot acquire organic search traffic in its current state**.

The fatal flaws are:
1. **Hash Fragment URLs (`/#/tool-slug`):** Google Search Central explicitly documents that Googlebot does not index content identified solely by URL hash fragments. To Googlebot, `https://cut.everydaypdf.me/#/background-remover` is identical to `https://cut.everydaypdf.me/`.
2. **Invalid XML Sitemap:** `public/sitemap.xml` lists 19 URLs containing `#` fragments. This violates the Sitemaps.org 0.9 schema and triggers automated errors in Google Search Console.
3. **Spammy Structured Data (Fabricated AggregateRating):** `src/seo/SEOHead.tsx` outputs hardcoded schema claiming 14,820 reviews and a 4.9 rating. This violates Google Search Essentials Spam Policies and subjects the site to algorithmic or manual demotion.
4. **Invalid Canonical Tags:** Canonical link headers specify fragment URLs (`<link rel="canonical" href="https://cut.everydaypdf.me/#/background-remover">`). RFC 6596 explicitly specifies that canonical URIs must not contain fragment identifiers.
5. **Zero Pre-Rendered HTML for Crawlers:** When any URL is requested, the server sends an empty `<div id="root"></div>`. Social media crawlers (WhatsApp, Twitter/X, LinkedIn, Facebook) that do not execute client-side JavaScript cannot render any tool preview cards.

---

## 2. Forensic Findings & Verification Register

| ID | Issue Category | Forensic Evidence / Code Reference | Status | Impact & Severity |
| :--- | :--- | :--- | :--- | :--- |
| **SEO-01** | **URL Routing Architecture** | `src/App.tsx:41-66`, `public/sitemap.xml:17-100`. Routing relies on `window.location.hash` (`/#/background-remover`). | **VERIFIED** | **P0 Critical:** 18 out of 19 tools are completely unindexed by Googlebot. |
| **SEO-02** | **Fabricated Review Schema** | `src/seo/SEOHead.tsx:94-100`. Hardcoded JSON-LD: `ratingValue: "4.9"`, `reviewCount: "14820"`. | **VERIFIED** | **P0 Critical:** High probability of Google manual action for deceptive structured markup. |
| **SEO-03** | **Invalid Sitemaps.org Protocol** | `public/sitemap.xml`. Contains `<loc>https://cut.everydaypdf.me/#/...</loc>`. | **VERIFIED** | **P0 Critical:** Invalid sitemap syntax; rejected by Search Console. |
| **SEO-04** | **Fragment in Canonical Tags** | `src/seo/SEOHead.tsx:39`. `canonicalUrl = ${siteOrigin}/#/${seo.slug}`. | **VERIFIED** | **P1 High:** Violates RFC 6596; canonical tag ignored by search engines. |
| **SEO-05** | **Lack of Pre-Rendered HTML** | `dist/index.html`. Single bundle output. Root `<title>` and `<meta name="description">` are generic. | **VERIFIED** | **P1 High:** Slow indexation; zero OpenGraph card rendering on messaging platforms. |
| **SEO-06** | **Internal Anchor Navigation** | `src/components/ui/Dropzone.tsx`, `HeaderBar.tsx`. Tool pills invoke `handleLaunchTool` via `onClick` buttons instead of `<a href="...">` crawlable links. | **VERIFIED** | **P1 High:** Search bots cannot follow internal link graph to discover tools. |
| **SEO-07** | **Thin Content / FAQ Duplication** | `src/seo/seoData.ts`. Several tools have only 1-2 generic FAQs with repetitive copy. | **VERIFIED** | **P2 Medium:** Low perceived content depth under Google's Helpful Content System. |
| **SEO-08** | **AdSense Readiness Mismatch** | AdSense script in `index.html` with invalid slot names (`data-ad-slot="leaderboard-desktop"`). | **VERIFIED** | **P1 High:** Prevents monetization and risks policy compliance review failure. |

---

## 3. Deep-Dive on Verified SEO Failures

### 3.1 Failure S-01: Hash Fragments in URLs and Sitemaps
- **Official Google Search Central Standard:**  
  > *"Googlebot generally does not follow fragment URLs (URLs with a #). If you use a hash fragment to change the page content, search engines will treat the URL as the main page and will not crawl or index the content behind the fragment."*
- **Current EverydayCut Implementation:**
  ```xml
  <!-- public/sitemap.xml lines 17-21 -->
  <url>
    <loc>https://cut.everydaypdf.me/#/background-remover</loc>
    <lastmod>2026-11-12</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  ```
- **Consequence:** Search engines strip `/#/background-remover` down to `https://cut.everydaypdf.me/`. EverydayCut effectively presents **one single indexable URL** instead of 19 high-intent landing pages.

### 3.2 Failure S-02: Fabricated Structured Data Penalty Risk
- **Official Google Structured Data Guidelines:**  
  > *"Reviews must come from genuine customers. Fabricated ratings, deceptive review counts, or unverified claims violate Google's spam policies and may result in a manual action."*
- **Current EverydayCut Implementation:**
  ```tsx
  // src/seo/SEOHead.tsx lines 94-100
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '14820',
    bestRating: '5',
    worstRating: '1',
  }
  ```
- **Consequence:** EverydayCut is a newly launched studio. Claiming 14,820 reviews with a 4.9 rating without any underlying individual user reviews or third-party verification is an immediate red flag.
- **Remediation:** Remove the entire `aggregateRating` block immediately. Retain `SoftwareApplication` / `WebApplication` with features and `FAQPage` schema.

### 3.3 Failure S-03: Invalid Canonicalization
- **RFC 6596 Section 3:**  
  > *"The target (canonical) IRI SHOULD NOT include a fragment identifier."*
- **Current EverydayCut Implementation:**
  ```tsx
  // src/seo/SEOHead.tsx line 39
  const siteOrigin = 'https://cut.everydaypdf.me';
  const canonicalUrl = `${siteOrigin}/#/${seo.slug}`;
  setLinkTag('canonical', canonicalUrl);
  ```
- **Consequence:** Canonicalization fails completely. Google ignores fragment canonicals and arbitrarily chooses the root canonical URL.

---

## 4. Remediation Plan: Clean Crawlable Architecture (Stage 1 Target)

To solve these issues permanently without discarding the SPA benefits:
1. **Clean Path Routing:**
   - Migrate URLs from `/#/tool-slug` to real paths:
     - `/background-remover`
     - `/magic-eraser`
     - `/image-upscaler`
     - `/pan-card-photo-resizer`
     - `/pan-card-signature-cropper`
     - `/passport-photo-maker`
     - `/amazon-product-photo-stager`
     - `/shopify-product-studio`
     - `/ecommerce-sales-badges`
     - `/etsy-product-stager`
     - `/profile-picture-maker`
     - `/instagram-story-resizer`
     - `/youtube-thumbnail-popout`
     - `/pinterest-pin-optimizer`
     - `/crop-image-aspect-ratio`
     - `/image-compressor-converter`
     - `/blur-background-bokeh`
     - `/studio-shadows-lighting`
     - `/batch-background-remover`
2. **Static Pre-Rendering (SSG / Pre-rendering Pipeline):**
   - Generate independent static HTML files for each of the 19 routes during `npm run build` (e.g., `dist/background-remover/index.html`).
   - Each HTML file contains distinct `<title>`, `<meta name="description">`, `<link rel="canonical">`, OpenGraph tags, semantic `<h1>`, tool descriptions, and structured FAQ schema **directly in the raw HTML payload**.
3. **Backward Compatibility for Hash Links:**
   - Add a lightweight client-side redirect script in the root HTML that immediately redirects incoming `/#/slug` visits to `/slug` via `history.replaceState`.
4. **Valid XML Sitemap:**
   - Generate `public/sitemap.xml` containing only clean canonical path URLs without any `#` characters.
5. **Crawlable Internal Anchor Links:**
   - Ensure all tool cards, selector pills, and footer menus render genuine `<a href="/tool-slug">` tags so search engine crawlers can traverse the site graph naturally.
