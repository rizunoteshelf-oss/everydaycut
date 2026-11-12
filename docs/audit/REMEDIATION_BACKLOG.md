# EVERYDAYCUT — REMEDIATION BACKLOG & EXECUTION ROADMAP (2026)

**Mission:** Full-Stack Forensic Hardening, Technical SEO, AI Quality Assurance & AdSense Readiness  
**Target Domain:** `https://cut.everydaypdf.me/`  
**Baseline Date:** November 12, 2026  
**Status:** PROPOSED & STAGED (Awaiting Checkpoint Approval)  

---

## 1. Prioritization Matrix

- **P0 (Critical / Release Blocker):** Must be resolved before any traffic acquisition or monetization. Prevents indexing penalties and broken core flows.
- **P1 (High Priority):** Direct functional defect or significant UX/monetization compliance gap.
- **P2 (Medium Priority):** Enhancement, competitive feature, or secondary optimization.
- **P3 (Low Priority):** Minor cosmetic polish or documentation refinement.

---

## 2. Stage-by-Stage Remediation Backlog

### STAGE 1 — Critical Routing and Search Discoverability
- [ ] **[P0] ROUTE-01: Implement Clean Path Routing**
  - Migrate from hash fragments (`/#/background-remover`) to real path routes (`/background-remover`, etc.).
  - Implement client-side compatibility redirect from legacy hash links (`/#/slug` $\to$ `/slug`).
- [ ] **[P0] ROUTE-02: Static Pre-Rendering (SSG) for All 19 Tool Routes**
  - Create build script to generate independent static HTML entry points (`dist/<slug>/index.html`) for each tool.
  - Inject unique page-specific `<title>`, `<meta name="description">`, canonical `<link>`, and semantic `<h1>` directly into raw HTML.
- [ ] **[P0] ROUTE-03: XML Sitemap & Canonical Sanitization**
  - Regenerate `public/sitemap.xml` with clean canonical path URLs (no `#` characters).
  - Update `SEOHead.tsx` canonical link generator to emit clean RFC 6596-compliant URLs.
- [ ] **[P0] ROUTE-04: Purge Fabricated Review Schema**
  - Remove `aggregateRating` (`ratingValue: 4.9`, `reviewCount: 14820`) from `src/seo/SEOHead.tsx`.
  - Retain valid `WebApplication` and `FAQPage` structured data.
- [ ] **[P1] ROUTE-05: Crawlable Anchor Links**
  - Update `Dropzone.tsx` and `HeaderBar.tsx` tool cards and selector pills to render standard `<a href="/slug">` tags for crawler discoverability.

---

### STAGE 2 — All 19 Tools: Functional & Scientific-Quality Audit
- [ ] **[P0] TOOL-01: Fix Inverted Bokeh / Background Blur Logic (`blur_bokeh`)**
  - Implement dual-layer canvas architecture: Keep original photo on blurred background layer; overlay sharp cutout on foreground layer.
- [ ] **[P1] TOOL-02: Implement Dedicated UI for Image Compressor & Converter (`converter`)**
  - Add WebP export option to `imageExport.ts`.
  - Build dedicated compression control panel with format switcher (PNG, JPEG, WebP), quality slider, and target KB budget selector (<20KB, <30KB, <50KB, <100KB, Custom).
- [ ] **[P1] TOOL-03: Rectify Misleading "AI Super-Resolution" Marketing (`upscale`)**
  - Rebrand upscaler copy from "AI Neural Super-Resolution" to "High-Precision 4K Clarity Upscaler & Sharpness Enhancer" to reflect actual bicubic unsharp masking implementation.
- [ ] **[P1] TOOL-04: Implement True Blurred Background Padding for Instagram Story (`instagram_story`)**
  - Create dual-layer setup for 9:16 vertical canvas: Blurred scaled source image on background layer, centered crisp image on foreground layer.
- [ ] **[P2] TOOL-05: Lossless Cropper Dedicated Overlay Grid (`crop`)**
  - Add Rule-of-Thirds overlay grid when `activePreset === 'crop'`.

---

### STAGE 3 — India-Specific Document Photography
- [ ] **[P0] DOC-01: Fix Background Cutout on PAN Photo & Passport Tools (`pan_photo`, `passport`)**
  - Allow automatic subject segmentation or optional one-tap background removal so the photo cleanly sits on the required pure `#ffffff` background.
- [ ] **[P1] DOC-02: Official Dimensions & File Size Validation**
  - **PAN Photo (UTIITSL & NSDL):** Verify exact 213x213 px at 300 DPI, strictly $<30\text{ KB}$ (and $>10\text{ KB}$).
  - **PAN Signature:** Verify 400x200 px (2:1 aspect ratio), strictly $<20\text{ KB}$ (and $>10\text{ KB}$).
  - **Passport / Visa:** Standard 2x2 inch (600x600 px at 300 DPI), white/off-white background, face filling 70-80% of frame.
- [ ] **[P1] DOC-03: Pre-Export Document Compliance Validator**
  - Display real-time validation badges (Dimensions OK, File Size OK, Aspect Ratio OK) before download.
- [ ] **[P2] DOC-04: Disclaimer on Government Affiliation**
  - Explicitly state in the UI that EverydayCut is an independent utility and is not affiliated with NSDL, UTIITSL, or the Income Tax Department of India.

---

### STAGE 4 — Client-Side Privacy & Security
- [ ] **[P1] SEC-01: Implement Strict Content-Security-Policy (CSP)**
  - Add strict CSP header in `public/_headers` permitting only self, Google AdSense, and Hugging Face model downloads.
- [ ] **[P1] SEC-02: Fix Object URL Memory Leaks in Batch Studio**
  - Add automatic cleanup hooks to revoke `previewUrl` and `cutoutUrl` on modal close or item deletion.
- [ ] **[P1] SEC-03: Dependency Vulnerability Review**
  - Audit `@huggingface/transformers` and `sharp` vulnerability status; ensure vulnerable native libraries are not bundled in browser output.

---

### STAGE 5 — Performance & Browser AI Inference
- [ ] **[P0] PERF-01: Optimize Service Worker Precache Strategy**
  - Remove 32.7 MB of WASM binaries from `PRECACHE_URLS` in `public/sw.js`.
  - Shift WASM binaries to an on-demand, cache-first runtime caching strategy.
- [ ] **[P1] PERF-02: Eliminate Duplicate WASM Chunks in Build Output**
  - Configure Vite to prevent duplicating `ort-wasm-simd-threaded.jsep.wasm` between `dist/assets/` and `dist/wasm/`.
- [x] **[P1] PERF-03: Restore `.nvmrc` for Cloudflare Pages**
  - Re-add `.nvmrc` with Node version `24.22.3` LTS (upgraded from EOL Node 20.18.0) to ensure build environment stability.
- [ ] **[P2] PERF-04: Code Splitting & Dynamic Imports**
  - Dynamically import heavy modules (Konva, JSZip) to reduce initial main thread bundle size from 712 kB.

---

### STAGE 6 — User Experience & Accessibility
- [ ] **[P1] UX-01: Mobile Touch & Keyboard Accessibility**
  - Ensure all tool triggers and modal close buttons have minimum $44\times 44\text{px}$ touch targets.
  - Add `aria-label` and keyboard navigation (`Tab` / `Enter` / `Escape`) across all modals.
- [ ] **[P2] UX-02: Before / After Comparison Slider**
  - Provide an interactive before/after split slider for background removal and upscaling results.

---

### STAGE 7 — Search Content & Organic Acquisition
- [ ] **[P1] CONTENT-01: Enrich Individual Tool Landing Page Content**
  - Expand each tool page with original, actionable utility content: Step-by-step instructions, supported MIME formats, technical limitations, and practical use cases.
- [ ] **[P2] CONTENT-02: Contextual Interlinking with EverydayPDF.me**
  - Add relevant, non-spammy links between complementary tools (e.g., PAN Card Photo Resizer $\leftrightarrow$ PDF to JPG / Compress PDF).

---

### STAGE 8 — Google AdSense & Monetization Compliance
- [ ] **[P0] ADS-01: Fix Non-Numeric Ad Slot Identifiers**
  - Replace non-numeric slot strings (`leaderboard-desktop`, `banner-mobile`, `sidebar-rectangle`) in `AdBannerSlot.tsx` with valid numeric publisher slot IDs or configure responsive auto-ad slots.
- [ ] **[P1] ADS-02: Prevent Accidental Click Placement**
  - Ensure generous visual separation ($>32\text{px}$) between ad units and canvas export/action buttons.
- [ ] **[P1] ADS-03: Consent Management Integration (CMP)**
  - Integrate Google-certified consent mechanism (or Google Funding Choices CMP) for visitors from EEA/UK.

---

### STAGE 9 — Competitive Differentiation & Launch Strategy
- [ ] **[P2] COMP-01: Benchmark EverydayCut Against Competitors**
  - Produce competitive matrix against remove.bg, Pixelcut, Photoroom, and Indian document resizers.
- [ ] **[P2] COMP-02: Define 30/60/90-Day Organic Acquisition Roadmap**
  - Establish measurable KPIs: Indexation count, organic impressions, CTR, export completion rate.

---

### STAGE 10 — Release Gate
- [ ] **[P0] GATE-01: Production Build & Multi-Browser Smoke Tests**
  - Verify clean TypeScript compilation (`npm run typecheck`), production build (`npm run build`), and automated smoke tests across Chrome, Safari, and Firefox.
- [ ] **[P0] GATE-02: Final Pre-Deployment Approval Checkpoint**
  - Present final evidence report and release recommendation (GO / CONDITIONAL GO / NO-GO). Halt before deployment.
