import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEO_TOOL_REGISTRY_DATA } from '../src/seo/seoRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const siteOrigin = 'https://cut.everydaypdf.me';
const gscToken = (process.env.VITE_GSC_VERIFICATION || '').trim();
const gscMetaTag = gscToken ? `<meta name="google-site-verification" content="${gscToken}" />\n    ` : '';

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

if (!fs.existsSync(distDir)) {
  console.error('[Prerender] dist directory not found! Run vite build first.');
  process.exit(1);
}

const templatePath = path.resolve(distDir, 'index.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

console.log('[Prerender] Pre-rendering 19 static tool routes for Cloudflare Pages & Googlebot...');

const tools = Object.values(SEO_TOOL_REGISTRY_DATA);

// 1. Pre-render each tool route
for (const tool of tools) {
  const toolDir = path.resolve(distDir, tool.slug);
  fs.mkdirSync(toolDir, { recursive: true });

  const canonicalUrl = `${siteOrigin}/${tool.slug}`;

  // Structured Data (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteOrigin}/#software`,
        name: `EverydayCut - ${tool.h1}`,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All (Browser-Based WebGPU/WASM)',
        browserRequirements: 'Requires modern browser with WebAssembly / WebGPU support',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          '100% In-Browser Local Processing',
          'Zero Cloud Uploads & Local RAM Privacy',
          tool.h1,
          tool.h2,
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
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
          {
            '@type': 'ListItem',
            position: 2,
            name: tool.h1,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  const schemaScript = `<script type="application/ld+json" id="everydaycut-jsonld">${JSON.stringify(structuredData, null, 2)}</script>`;

  // Semantic Crawlable HTML Content for Googlebot, X, LinkedIn, WhatsApp
  const semanticContent = `
    <header class="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 text-white">
      <a href="/" class="font-bold text-lg text-emerald-400">EverydayCut Studio</a>
      <nav class="flex gap-4 text-xs text-zinc-300">
        <a href="/background-remover">Background Remover</a>
        <a href="/magic-eraser">Magic Eraser</a>
        <a href="/image-upscaler">4K Upscaler</a>
        <a href="/pan-card-photo-resizer">PAN Photo</a>
        <a href="/passport-photo-maker">Passport Photo</a>
        <a href="/image-compressor-converter">Compressor</a>
      </nav>
    </header>
    <main class="max-w-4xl mx-auto p-6 space-y-8 text-zinc-200">
      <div>
        <h1 class="text-3xl font-extrabold text-white">${tool.h1}</h1>
        <h2 class="text-lg text-emerald-400 font-semibold mt-1">${tool.h2}</h2>
        <p class="text-sm leading-relaxed text-zinc-300 mt-3">${tool.metaDescription}</p>
      </div>

      <section class="space-y-3 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800">
        <h3 class="text-base font-bold text-white uppercase tracking-wider text-xs">How to Use ${tool.h1}</h3>
        <ol class="list-decimal pl-5 space-y-2 text-sm text-zinc-300">
          ${tool.howToSteps.map((step) => `<li>${step}</li>`).join('')}
        </ol>
      </section>

      <section class="space-y-3 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800">
        <h3 class="text-base font-bold text-white uppercase tracking-wider text-xs">Technical Specifications</h3>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          ${Object.entries(tool.specs)
            .map(
              ([key, val]) =>
                `<div><dt class="font-bold text-zinc-400">${key}:</dt><dd class="text-zinc-200 mt-0.5">${val}</dd></div>`
            )
            .join('')}
        </dl>
      </section>

      <section class="space-y-4">
        <h3 class="text-lg font-bold text-white">Frequently Asked Questions</h3>
        <div class="space-y-3">
          ${tool.faqs
            .map(
              (f) =>
                `<article class="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80"><h4 class="font-semibold text-white text-sm">${f.question}</h4><p class="text-zinc-400 text-xs mt-1.5 leading-relaxed">${f.answer}</p></article>`
            )
            .join('')}
        </div>
      </section>

      <footer class="pt-6 border-t border-zinc-800 text-xs space-y-3">
        <div>
          <span class="font-bold text-zinc-400">Related EverydayCut Tools: </span>
          <span class="inline-flex flex-wrap gap-2 mt-1">
            ${tool.relatedTools
              .map((t) => `<a href="/${t.slug}" class="text-emerald-400 hover:underline">${t.name}</a>`)
              .join(' &bull; ')}
          </span>
        </div>
        ${
          tool.relatedPdfTools && tool.relatedPdfTools.length > 0
            ? `<div>
                <span class="font-bold text-zinc-400">Related EverydayPDF Tools: </span>
                <span class="inline-flex flex-wrap gap-2 mt-1">
                  ${tool.relatedPdfTools
                    .map(
                      (p) =>
                        `<a href="${p.url}" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline">${p.name}</a>`
                    )
                    .join(' &bull; ')}
                </span>
              </div>`
            : ''
        }
      </footer>
    </main>
  `;

  let html = templateHtml;

  // Replace Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(tool.title)}</title>`);

  // Replace or inject Description
  if (/<meta\s+name=["']description["']/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeHtml(tool.metaDescription)}" />`
    );
  }

  // Inject Canonical Link & OpenGraph Tags before </head>
  const headInject = `
    ${gscMetaTag}<link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(tool.title)}" />
    <meta property="og:description" content="${escapeHtml(tool.metaDescription)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="EverydayCut" />
    <meta property="og:image" content="${siteOrigin}/samples/portrait.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(tool.title)}" />
    <meta name="twitter:description" content="${escapeHtml(tool.metaDescription)}" />
    <meta name="twitter:image" content="${siteOrigin}/samples/portrait.jpg" />
    ${schemaScript}
  `;

  html = html.replace('</head>', `${headInject}\n  </head>`);

  // Inject semantic fallback HTML inside <div id="root">
  html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);

  fs.writeFileSync(path.resolve(toolDir, 'index.html'), html, 'utf8');
  console.log(`  ✓ Pre-rendered /${tool.slug} -> dist/${tool.slug}/index.html`);
}

// 2. Pre-render root dist/index.html with clean EverydayCut Studio Hub HTML, canonical & root schema
{
  const rootCanonical = `${siteOrigin}/`;
  const rootTitle = 'EverydayCut - 100% Free, Unlimited & Private Client-Side Photo & ID Studio';
  const rootDescription =
    'Every photo, cutout, and government ID resize tool inside your browser. Free PAN photo cropper (<30 KB), passport photo maker, AI background remover, magic eraser & compressor with zero server uploads.';

  const rootStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteOrigin}/#software`,
        name: 'EverydayCut Studio',
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
          'Batch Background Removal with ZIP Export',
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: rootCanonical,
          },
        ],
      },
    ],
  };

  const rootSchemaScript = `<script type="application/ld+json" id="everydaycut-jsonld">${JSON.stringify(rootStructuredData, null, 2)}</script>`;

  const rootSemanticContent = `
    <header class="p-4 border-b border-zinc-200 flex justify-between items-center bg-white text-slate-900">
      <a href="/" class="font-bold text-lg text-emerald-600">EverydayCut Studio</a>
      <nav class="flex flex-wrap gap-4 text-xs text-slate-600">
        <a href="/pan-card-photo-resizer">PAN Photo</a>
        <a href="/background-remover">BG Remover</a>
        <a href="/magic-eraser">Magic Eraser</a>
        <a href="/image-compressor-converter">Compressor</a>
        <a href="https://everydaypdf.me" target="_blank" rel="noopener noreferrer">EverydayPDF.me</a>
      </nav>
    </header>
    <main class="max-w-5xl mx-auto p-6 space-y-8 text-slate-800">
      <div class="text-center space-y-3">
        <h1 class="text-3xl font-extrabold text-slate-900">Every photo &amp; ID tool you need, 100% inside your browser.</h1>
        <h2 class="text-base font-semibold text-emerald-600">Zero Server Uploads &bull; 100% Private On-Device WebGPU &amp; WebAssembly Creative Suite</h2>
        <p class="text-sm text-slate-600 max-w-2xl mx-auto">${escapeHtml(rootDescription)}</p>
      </div>
      <section class="space-y-4">
        <h3 class="text-lg font-bold text-slate-900">All ${tools.length} Free Client-Side Tools</h3>
        <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          ${tools
            .map(
              (t) =>
                `<li class="p-3 rounded-xl border border-zinc-200 bg-white"><a href="/${t.slug}" class="font-bold text-emerald-700 hover:underline">${escapeHtml(t.h1)}</a><p class="text-slate-600 mt-1">${escapeHtml(t.metaDescription)}</p></li>`
            )
            .join('')}
        </ul>
      </section>
      <footer class="pt-6 border-t border-zinc-200 text-xs text-slate-500">
        <a href="https://everydaypdf.me" target="_blank" rel="noopener noreferrer">Need PDF tools? 52+ free client-side tools at EverydayPDF.me</a>
      </footer>
    </main>
  `;

  let rootHtml = templateHtml;
  const rootHeadInject = `
    ${gscMetaTag}<link rel="canonical" href="${rootCanonical}" />
    <meta property="og:title" content="${rootTitle}" />
    <meta property="og:description" content="${escapeHtml(rootDescription)}" />
    <meta property="og:url" content="${rootCanonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="EverydayCut" />
    <meta property="og:image" content="${siteOrigin}/samples/portrait.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${rootTitle}" />
    <meta name="twitter:description" content="${escapeHtml(rootDescription)}" />
    <meta name="twitter:image" content="${siteOrigin}/samples/portrait.jpg" />
    ${rootSchemaScript}
  `;
  rootHtml = rootHtml.replace('</head>', `${rootHeadInject}\n  </head>`);
  rootHtml = rootHtml.replace('<div id="root"></div>', `<div id="root">${rootSemanticContent}</div>`);
  fs.writeFileSync(templatePath, rootHtml, 'utf8');
  console.log(`  ✓ Pre-rendered root hub HTML, canonical & schema -> dist/index.html`);
}

// 3. Generate Clean XML Sitemap with 0 '#' characters
{
  const sitemapUrls = [
    `  <url>\n    <loc>${siteOrigin}/</loc>\n    <lastmod>2026-11-12</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...tools.map(
      (t) =>
        `  <url>\n    <loc>${siteOrigin}/${t.slug}</loc>\n    <lastmod>2026-11-12</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${
          t.presetId === 'cutout' || t.presetId === 'pan_photo' ? '0.95' : '0.9'
        }</priority>\n  </url>`
    ),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${sitemapUrls.join('\n\n')}
</urlset>
`;

  fs.writeFileSync(path.resolve(rootDir, 'public', 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log(`  ✓ Generated clean XML sitemap with ${tools.length + 1} URLs -> dist/sitemap.xml & public/sitemap.xml`);
}

console.log('[Prerender] All 19 routes and sitemap pre-rendered successfully!');
