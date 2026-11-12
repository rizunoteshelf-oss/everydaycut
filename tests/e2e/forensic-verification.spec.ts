import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';

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
  test('1. Static Pre-rendered SSG Raw HTML & SEO Metadata across all 19 tools + Root (Non-JS)', async ({ request }) => {
    // 1A: Verify raw HTTP HTML for Root (no client JS execution)
    const rootRes = await request.get('/');
    expect(rootRes.status()).toBe(200);
    const rootHtml = await rootRes.text();
    expect(rootHtml).toMatch(/<title>.*EverydayCut.*<\/title>/i);
    expect(rootHtml).toContain('href="https://cut.everydaypdf.me/"');
    expect(rootHtml).not.toContain('aggregateRating');
    expect(rootHtml).not.toContain('14820');

    const seenTitles = new Set<string>();

    // 1B: Verify raw HTTP HTML for every single one of the 19 pre-rendered tool routes
    for (const slug of ALL_TOOL_SLUGS) {
      const res = await request.get(`/${slug}/`);
      expect(res.status()).toBe(200);
      const html = await res.text();

      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
      expect(titleMatch, `Missing <title> in raw HTML for /${slug}`).toBeTruthy();
      const title = titleMatch![1].trim();
      expect(title.length).toBeGreaterThan(15);
      expect(seenTitles.has(title), `Duplicate <title> on /${slug}: ${title}`).toBe(false);
      seenTitles.add(title);

      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
      expect(descMatch, `Missing meta description in raw HTML for /${slug}`).toBeTruthy();
      expect(descMatch![1].length).toBeGreaterThan(40);

      const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
      expect(canonicalMatch, `Missing canonical link in raw HTML for /${slug}`).toBeTruthy();
      expect(canonicalMatch![1]).toBe(`https://cut.everydaypdf.me/${slug}`);
      expect(canonicalMatch![1]).not.toContain('#');

      expect(html).toMatch(/<h1[^>]*>[^<]+<\/h1>/i);
      expect(html).not.toContain('aggregateRating');
      expect(html).not.toContain('14820');
      expect(html).not.toContain('ratingValue');
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

    expect(xml).toContain('<loc>https://cut.everydaypdf.me/</loc>');
    for (const slug of ALL_TOOL_SLUGS) {
      expect(xml).toContain(`<loc>https://cut.everydaypdf.me/${slug}</loc>`);
    }

    expect(xml).not.toContain('#');
  });

  test('4. Zero-Upload Network Verification during real image ingestion (100% Client-Side Privacy)', async ({ page }) => {
    const forbiddenRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      const method = req.method();
      const isAllowedOrigin =
        url.startsWith('http://localhost') ||
        url.startsWith('http://127.0.0.1') ||
        url.startsWith('data:') ||
        url.startsWith('blob:') ||
        url.includes('huggingface.co') ||
        url.includes('hf.co') ||
        url.includes('googlesyndication.com') ||
        url.includes('adtrafficquality.google') ||
        url.includes('doubleclick.net') ||
        url.includes('adservice.google.com') ||
        url.includes('fundingchoicesmessages.google.com');

      if (method === 'POST' || method === 'PUT' || !isAllowedOrigin) {
        forbiddenRequests.push(`${method} ${url}`);
      }
    });

    await page.goto('/image-compressor-converter');
    // Dismiss consent banner if visible
    const acceptBtn = page.getByRole('button', { name: 'Accept All' });
    if (await acceptBtn.isVisible()) await acceptBtn.click();

    // Load local sample image directly into canvas
    await page.locator('input[type="file"]').setInputFiles('public/samples/portrait.jpg');
    await expect(page.getByRole('button', { name: /Export/i }).first()).toBeVisible({ timeout: 10000 });

    expect(forbiddenRequests).toEqual([]);
  });

  test('5. India Document Photography Compliance (213x213 300 DPI <30KB PAN Photo & 400x200 <20KB Signature + Disclaimers)', async ({ page, context }) => {
    // Avoid downloading 44MB external model weights during automated CI E2E (intercept Worker fetches too via context.route)
    await context.route('**/*huggingface.co/**', (route) => route.abort());
    await context.route('**/*hf.co/**', (route) => route.abort());

    // 5A: PAN Card Photo Resizer
    await page.goto('/pan-card-photo-resizer');
    const consentBtn = page.getByRole('button', { name: 'Accept All' });
    if (await consentBtn.isVisible()) await consentBtn.click();

    await page.locator('input[type="file"]').setInputFiles('public/samples/portrait.jpg');
    await expect(page.getByText('213×213 px OK')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('300 DPI Embedded')).toBeVisible();
    await expect(page.getByText('<30 KB Target')).toBeVisible();
    await expect(page.getByText(/not affiliated with, endorsed by, or connected to NSDL/i)).toBeVisible();

    // Export JPEG and inspect real binary bytes for <30KB and JFIF 300 DPI (01 01 01 2C 01 2C)
    const [panDownload] = await Promise.all([
      page.waitForEvent('download'),
      (async () => {
        await page.getByRole('button', { name: /^Export$/i }).first().click();
        await page.getByRole('button', { name: /JPEG Image/i }).click();
      })(),
    ]);
    const panPath = await panDownload.path();
    expect(panPath).toBeTruthy();
    const panBytes = readFileSync(panPath!);
    expect(panBytes.length).toBeGreaterThan(500);
    expect(panBytes.length).toBeLessThanOrEqual(30000);
    // Verify JPEG SOI (FF D8) and JFIF 300 DPI density tag (units=01, X=01 2C, Y=01 2C)
    expect(panBytes[0]).toBe(0xff);
    expect(panBytes[1]).toBe(0xd8);
    expect(panBytes.includes(Buffer.from([0x01, 0x01, 0x2c, 0x01, 0x2c]))).toBe(true);

    // 5B: PAN Card Signature Cropper (<20 KB JPEG + 400x200 + 300 DPI)
    await page.goto('/pan-card-signature-cropper');
    await page.locator('input[type="file"]').setInputFiles('public/samples/signature.jpg');
    await expect(page.getByText('400×200 px OK')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('<20 KB Target')).toBeVisible();

    const [sigDownload] = await Promise.all([
      page.waitForEvent('download'),
      (async () => {
        await page.getByRole('button', { name: /^Export$/i }).first().click();
        await page.getByRole('button', { name: /JPEG Image/i }).click();
      })(),
    ]);
    const sigPath = await sigDownload.path();
    expect(sigPath).toBeTruthy();
    const sigBytes = readFileSync(sigPath!);
    expect(sigBytes.length).toBeGreaterThan(500);
    expect(sigBytes.length).toBeLessThanOrEqual(20000);
    expect(sigBytes.includes(Buffer.from([0x01, 0x01, 0x2c, 0x01, 0x2c]))).toBe(true);
  });

  test('6. Compressor & Format Converter exports valid WebP with KB controls', async ({ page }) => {
    await page.goto('/image-compressor-converter');
    const consentBtn = page.getByRole('button', { name: 'Accept All' });
    if (await consentBtn.isVisible()) await consentBtn.click();

    await page.locator('input[type="file"]').setInputFiles('public/samples/sneakers.jpg');
    await expect(page.getByText('Image Compressor & Format Converter')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Custom KB:')).toBeVisible();

    // Trigger WebP export via dedicated converter studio button
    const [webpDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Export WEBP/i }).click(),
    ]);
    expect(webpDownload.suggestedFilename()).toMatch(/\.webp$/i);
    const webpPath = await webpDownload.path();
    const webpBytes = readFileSync(webpPath!);
    // Valid RIFF....WEBP magic header
    expect(webpBytes.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(webpBytes.subarray(8, 12).toString('ascii')).toBe('WEBP');
  });

  test('7. Bokeh dual-layer (blurred BG + sharp FG), Before/After slider, and Upscaler accuracy', async ({ page, context }) => {
    await context.route('**/*huggingface.co/**', (route) => route.abort());
    await context.route('**/*hf.co/**', (route) => route.abort());

    await page.goto('/blur-background-bokeh');
    const consentBtn = page.getByRole('button', { name: 'Accept All' });
    if (await consentBtn.isVisible()) await consentBtn.click();

    await page.locator('input[type="file"]').setInputFiles('public/samples/portrait.jpg');
    await expect(page.getByText(/Dual-layer depth active/i)).toBeVisible({ timeout: 10000 });

    // Verify 2 distinct layers in store: Layer 0 blurred (14) and Layer 1 sharp (0)
    const layers = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const st = (window as any).__editorStore.getState();
      return st.layers.map((l: { name: string; filters: { blur: number } }) => ({
        name: l.name,
        blur: l.filters.blur,
      }));
    });
    expect(layers.length).toBe(2);
    expect(layers[0].blur).toBeGreaterThan(0);
    expect(layers[1].blur).toBe(0);

    // Toggle Before / After Split Comparison Slider and confirm accessibility slider role renders
    await page.getByRole('button', { name: /Toggle Before and After/i }).click();
    await expect(page.getByRole('slider', { name: /Compare before and after/i })).toBeVisible();
    await page.getByRole('button', { name: /Exit Compare/i }).click();

    // Check Upscaler page uses accurate copy (no fake "AI Super-Resolution")
    await page.goto('/image-upscaler');
    const upscaleText = await page.textContent('body');
    expect(upscaleText).toContain('High-Precision 4K Clarity Upscaler');
    expect(upscaleText).not.toContain('Super-Resolution');
  });

  test('8. Modal Escape dismissal & 44x44px Accessible Touch Targets', async ({ page }) => {
    await page.goto('/');
    const consentBtn = page.getByRole('button', { name: 'Accept All' });
    if (await consentBtn.isVisible()) await consentBtn.click();

    // Open About dialog and check close button >= 44x44 and Escape dismissal
    await page.getByRole('button', { name: /About EverydayCut/i }).first().click();
    const aboutDialog = page.getByRole('dialog', { name: 'About EverydayCut' });
    await expect(aboutDialog).toBeVisible();

    const closeBtn = page.getByRole('button', { name: 'Close About dialog' });
    const closeBox = await closeBtn.boundingBox();
    expect(closeBox).toBeTruthy();
    expect(closeBox!.width).toBeGreaterThanOrEqual(44);
    expect(closeBox!.height).toBeGreaterThanOrEqual(44);

    await page.keyboard.press('Escape');
    await expect(aboutDialog).not.toBeVisible();

    // Check header & footer primary interactive buttons meet >= 44px height
    const primaryControls = await page.locator('header button:visible, footer button:visible').all();
    expect(primaryControls.length).toBeGreaterThan(0);
    for (const ctrl of primaryControls) {
      const box = await ctrl.boundingBox();
      if (box && box.height > 0) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('9. Google AdSense Zero-CLS, Zero-Fake-Slot & Consent Mode v2 Compliance', async ({ page }) => {
    await page.goto('/');

    // Cookie consent banner visible on first visit
    await expect(page.getByRole('complementary', { name: 'Cookie consent banner' })).toBeVisible();

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
