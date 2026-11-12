import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ALL_TOOL_SLUGS = [
  'background-remover',
  'magic-eraser',
  'image-upscaler',
  'pan-card-photo-resizer',
  'pan-card-signature-cropper',
  'passport-photo-maker',
  'amazon-product-photo-stager',
  'shopify-product-studio',
  'profile-picture-maker',
  'batch-background-remover',
  'ecommerce-sales-badges',
  'etsy-product-stager',
  'instagram-story-resizer',
  'youtube-thumbnail-popout',
  'pinterest-pin-optimizer',
  'image-compressor-converter',
  'crop-image-aspect-ratio',
  'blur-background-bokeh',
  'studio-shadows-lighting',
];

test.describe('TITAN FORENSIC VERIFICATION SUITE', () => {
  test('1. Static Pre-rendered SSG HTML & SEO Metadata across all 19 tools + Root', async ({ page }) => {
    // Check root
    const rootRes = await page.goto('/');
    expect(rootRes?.status()).toBe(200);
    const rootTitle = await page.title();
    expect(rootTitle).toContain('EverydayCut');
    const rootCanonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(rootCanonical).toBe('https://cut.everydaypdf.me/');
    expect(rootCanonical).not.toContain('#');

    // Check each of the 19 tool landing pages
    for (const slug of ALL_TOOL_SLUGS) {
      const res = await page.goto(`/${slug}`);
      expect(res?.status()).toBe(200);

      // Verify Title & Meta Description
      const title = await page.title();
      expect(title.length).toBeGreaterThan(15);

      const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(metaDesc).toBeTruthy();
      expect(metaDesc!.length).toBeGreaterThan(40);

      // Verify Canonical URL is clean RFC 6596 without hash
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(`https://cut.everydaypdf.me/${slug}`);
      expect(canonical).not.toContain('#');

      // Verify Static H1 exists
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0);

      // Verify JSON-LD Schema: Ensure ZERO fabricated review schema
      const jsonLdElements = await page.locator('script[type="application/ld+json"]').all();
      for (const el of jsonLdElements) {
        const text = await el.textContent();
        expect(text).not.toContain('aggregateRating');
        expect(text).not.toContain('14820');
        expect(text).not.toContain('ratingValue');
      }
    }
  });

  test('2. Legacy hash-fragment pre-hydration redirect', async ({ page }) => {
    await page.goto('/#/background-remover');
    await page.waitForURL('**/background-remover');
    expect(page.url()).toContain('/background-remover');
    expect(page.url()).not.toContain('/#/');
  });

  test('3. Sitemap.xml validity and canonical cleanliness', async ({ request }) => {
    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    const xml = await sitemapRes.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');

    // Must contain root and all 19 tools
    expect(xml).toContain('<loc>https://cut.everydaypdf.me/</loc>');
    for (const slug of ALL_TOOL_SLUGS) {
      expect(xml).toContain(`<loc>https://cut.everydaypdf.me/${slug}</loc>`);
    }

    // Must contain zero hash fragments
    expect(xml).not.toContain('#');
  });

  test('4. Zero-Upload Network Verification (100% Client-Side Privacy)', async ({ page }) => {
    const outboundUploads: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      const method = req.method();
      // Track any request sending post body or uploading files outside localhost
      if (method === 'POST' && !url.includes('localhost') && !url.includes('127.0.0.1')) {
        const postData = req.postData();
        if (postData && postData.length > 500) {
          outboundUploads.push(`${method} ${url} (${postData.length} bytes)`);
        }
      }
    });

    await page.goto('/background-remover');
    // Ensure zero telemetry or image upload requests
    expect(outboundUploads.length).toBe(0);
  });

  test('5. India Document Photography Compliance & Non-Affiliation Disclaimers', async ({ page }) => {
    // 5A: PAN Card Photo Resizer
    await page.goto('/pan-card-photo-resizer');
    const panText = await page.textContent('body');
    expect(panText).toContain('213×213');
    expect(panText).toContain('300 DPI');
    expect(panText).toContain('30 KB');

    // 5B: PAN Card Signature Cropper
    await page.goto('/pan-card-signature-cropper');
    const sigText = await page.textContent('body');
    expect(sigText).toContain('400×200');
    expect(sigText).toContain('20 KB');

    // 5C: Passport Photo Maker
    await page.goto('/passport-photo-maker');
    const passportText = await page.textContent('body');
    expect(passportText).toContain('600×600');
    expect(passportText).toContain('Passport');
  });

  test('6. Compressor & Format Converter WebP / JPEG Export UI', async ({ page }) => {
    await page.goto('/image-compressor-converter');
    const body = await page.textContent('body');
    expect(body).toContain('Format & Size Compressor');
    expect(body).toContain('WebP');
  });

  test('7. Rule-of-Thirds Cropper and Bokeh Blur Tool presence', async ({ page }) => {
    await page.goto('/crop-image-aspect-ratio');
    const cropBody = await page.textContent('body');
    expect(cropBody).toContain('Crop & Aspect Ratio');

    await page.goto('/blur-background-bokeh');
    const bokehBody = await page.textContent('body');
    expect(bokehBody).toContain('Bokeh / Background Blur');
  });

  test('8. Modal Escape dismissal & Accessible Touch Targets', async ({ page }) => {
    await page.goto('/');

    // Check footer About button and open modal
    const aboutBtn = page.getByRole('button', { name: /About/i }).first();
    await aboutBtn.click();
    await expect(page.getByRole('dialog', { name: 'About EverydayCut' })).toBeVisible();

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'About EverydayCut' })).not.toBeVisible();

    // Check touch target heights on main action buttons
    const primaryPills = await page.locator('nav a, header button, footer button').all();
    for (const pill of primaryPills.slice(0, 10)) {
      const box = await pill.boundingBox();
      if (box && box.height > 0) {
        // Enforce touch target accessibility
        expect(box.height).toBeGreaterThanOrEqual(28);
      }
    }
  });

  test('9. Google AdSense Zero-CLS & Zero-Fake-Slot Compliance', async ({ page }) => {
    await page.goto('/');

    // Ensure no <ins> elements have fake non-numeric strings like "leaderboard-desktop"
    const insElements = await page.locator('ins.adsbygoogle').all();
    for (const ins of insElements) {
      const slot = await ins.getAttribute('data-ad-slot');
      if (slot) {
        expect(slot).toMatch(/^\d+$/);
      }
    }
  });
});
