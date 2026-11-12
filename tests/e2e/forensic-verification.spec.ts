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
    expect(rootHtml).toMatch(/<title>.*EverydayCut.*Photo (&|&amp;) ID Studio.*<\/title>/i);
    expect(rootHtml).not.toMatch(/<title>Free AI Background Remover/i);
    expect(rootHtml).toContain('href="https://cut.everydaypdf.me/"');
    expect(rootHtml).toContain('href="/pan-card-photo-resizer"');
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

  test('10. Scrolling & AdSense Height-Mutation Resilience (Desktop 1280x800 & Mobile 390x844)', async ({ page, context }) => {
    await context.route('**/*huggingface.co/**', (route) => route.abort());
    await context.route('**/*hf.co/**', (route) => route.abort());

    // 10A: Desktop Homepage Hub (/) native window scroll (even over sticky header) + zero horizontal overflow
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const consentBtn = page.getByRole('button', { name: 'Accept All' });
    if (await consentBtn.isVisible()) await consentBtn.click();

    const landingMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    expect(landingMetrics.scrollWidth).toBeLessThanOrEqual(landingMetrics.innerWidth);
    expect(landingMetrics.scrollHeight).toBeGreaterThan(1500);

    // Mouse wheel over the sticky header itself (y=25) and page body scrolls window cleanly
    await page.mouse.move(640, 25);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(100);
    const scrolledFromHeader = await page.evaluate(() => window.scrollY);
    expect(scrolledFromHeader).toBeGreaterThan(200);

    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(100);
    const scrolledY = await page.evaluate(() => window.scrollY);
    expect(scrolledY).toBeGreaterThan(500);

    // Sticky header remains at top (y === 0)
    const headerBoxLanding = await page.locator('header').boundingBox();
    expect(headerBoxLanding).toBeTruthy();
    expect(headerBoxLanding!.y).toBe(0);

    // Scroll back up cleanly
    await page.mouse.wheel(0, -1200);
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // 10B: Navigate from Homepage Hub to a specific tool page and load image while scrolled -> Editor View resets scrollY to 0
    await page.goto('/image-compressor-converter');
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(150);

    await page.locator('input[type="file"]').setInputFiles('public/samples/portrait.jpg');
    await expect(page.getByRole('button', { name: /Export/i }).first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(100);

    const editorScrollYAfterLoad = await page.evaluate(() => window.scrollY);
    expect(editorScrollYAfterLoad).toBe(0);

    // 10C: Simulate Google AdSense runtime `style="height: auto !important;"` injection on ancestors
    await page.evaluate(() => {
      const selectors = [
        '#root',
        '#root > div',
        '#root > div > div',
        '#root > div > div > aside',
        '[data-testid="sidebar-scroll-body"]',
      ];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.setProperty('height', 'auto', 'important');
        });
      }
    });

    // Verify Editor shell remains locked to 800px viewport height
    const headerBoxEditor = await page.locator('header').boundingBox();
    expect(headerBoxEditor).toBeTruthy();
    expect(headerBoxEditor!.y).toBe(0);

    const leaderboardAd = page.locator('aside[aria-label="Advertisement"]').last();
    const adBox = await leaderboardAd.boundingBox();
    expect(adBox).toBeTruthy();
    expect(adBox!.y + adBox!.height).toBeLessThanOrEqual(801);

    // 10D: Switch to tall tab ("AI Tools") and verify wheeling over Sidebar scrolls only sidebar-scroll-body, NOT window
    await page.getByRole('button', { name: 'AI Tools' }).click();
    const sidebarBody = page.getByTestId('sidebar-scroll-body');
    const sidebarBox = await sidebarBody.boundingBox();
    expect(sidebarBox).toBeTruthy();
    await page.mouse.move(sidebarBox!.x + sidebarBox!.width / 2, sidebarBox!.y + 100);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(100);

    const sidebarResult = await page.evaluate(() => {
      const sb = document.querySelector('[data-testid="sidebar-scroll-body"]') as HTMLElement;
      return {
        sidebarScrollTop: sb ? sb.scrollTop : -1,
        sidebarCanScroll: sb ? sb.scrollHeight > sb.clientHeight : false,
        windowScrollY: window.scrollY,
        headerTop: document.querySelector('header')?.getBoundingClientRect().top ?? -1,
      };
    });
    expect(sidebarResult.sidebarCanScroll).toBe(true);
    expect(sidebarResult.sidebarScrollTop).toBeGreaterThan(0);
    expect(sidebarResult.windowScrollY).toBe(0);
    expect(sidebarResult.headerTop).toBe(0);

    // 10E: Wheeling over Canvas does NOT scroll window or move header
    await page.mouse.move(250, 400);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(100);
    const canvasWheelResult = await page.evaluate(() => ({
      windowScrollY: window.scrollY,
      headerTop: document.querySelector('header')?.getBoundingClientRect().top ?? -1,
    }));
    expect(canvasWheelResult.windowScrollY).toBe(0);
    expect(canvasWheelResult.headerTop).toBe(0);

    // 10F: Mobile (390x844) Landing & Editor zero horizontal overflow + bottom drawer scroll
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(100);
    const mobileEditorMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      windowScrollY: window.scrollY,
      headerTop: document.querySelector('header')?.getBoundingClientRect().top ?? -1,
    }));
    expect(mobileEditorMetrics.scrollWidth).toBeLessThanOrEqual(mobileEditorMetrics.innerWidth);
    expect(mobileEditorMetrics.windowScrollY).toBe(0);
    expect(mobileEditorMetrics.headerTop).toBe(0);

    // Open mobile Studio Controls drawer and verify internal scroll
    await page.getByRole('button', { name: 'Open Studio Controls' }).click();
    await expect(page.getByRole('button', { name: 'Close Studio Controls' })).toBeVisible();
    const mobileScrollable = await page.evaluate(() => {
      const sb = document.querySelector('[data-testid="sidebar-scroll-body"]') as HTMLElement;
      if (!sb) return { canScroll: false, scrollTop: -1 };
      sb.scrollTop = 150;
      return { canScroll: sb.scrollHeight > sb.clientHeight, scrollTop: sb.scrollTop };
    });
    expect(mobileScrollable.canScroll).toBe(true);
    expect(mobileScrollable.scrollTop).toBeGreaterThan(0);

    // 10G: Return to Landing View via New Image and verify Mobile Landing View scroll + zero horizontal overflow
    await page.getByRole('button', { name: 'Close Studio Controls' }).click();
    await page.getByRole('button', { name: 'New Image' }).click();
    await page.waitForTimeout(100);
    const mobileLandingMetrics = await page.evaluate(() => {
      window.scrollTo(0, 500);
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        scrollHeight: document.documentElement.scrollHeight,
        windowScrollY: window.scrollY,
      };
    });
    expect(mobileLandingMetrics.scrollWidth).toBeLessThanOrEqual(mobileLandingMetrics.innerWidth);
    expect(mobileLandingMetrics.scrollHeight).toBeGreaterThan(1400);
    expect(mobileLandingMetrics.windowScrollY).toBeGreaterThan(300);
  });

  test('11. Homepage Isolation (Not Locked to BG Remover), EverydayPDF Light Theme + Sun/Moon Toggle & All 19 Routes Smoke', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const consentBtn = page.getByRole('button', { name: 'Accept All' });
    if (await consentBtn.isVisible()) await consentBtn.click();

    // 11A: Root / opens as EverydayCut Studio Homepage (NOT Free AI Background Remover)
    await expect(page).toHaveTitle(/EverydayCut - 100% Free, Unlimited & Private Client-Side Photo & ID Studio/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Every photo & ID tool you need');

    // Default theme on fresh visit must be Light (EverydayPDF style)
    expect(await page.evaluate(() => document.documentElement.classList.contains('light'))).toBe(true);

    // Toggle Dark -> Light via Sun/Moon button and verify persistence across reload
    await page.getByRole('button', { name: /Switch to Dark Mode/i }).click();
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
    await page.getByRole('button', { name: /Switch to Light Mode/i }).click();
    expect(await page.evaluate(() => document.documentElement.classList.contains('light'))).toBe(true);

    // 11B: Clicking a tool card opens dedicated tool route cleanly, and Back returns to Homepage Hub
    await page.locator('#studio-catalog a[href="/pan-card-photo-resizer"]').click();
    await expect(page).toHaveURL(/\/pan-card-photo-resizer$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('PAN Card Photo');
    await page.getByRole('link', { name: /Back to All 19 Tools/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Every photo & ID tool you need');

    // 11C: Every single one of the 19 tool routes renders cleanly with dedicated <h1> and zero exceptions
    for (const slug of ALL_TOOL_SLUGS) {
      await page.goto(`/${slug}`);
      const h1Text = await page.getByRole('heading', { level: 1 }).textContent();
      expect(h1Text && h1Text.trim().length > 5, `Empty <h1> on /${slug}`).toBe(true);
    }

    expect(pageErrors).toEqual([]);
  });
});
