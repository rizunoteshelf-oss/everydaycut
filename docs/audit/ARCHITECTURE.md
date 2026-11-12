# EVERYDAYCUT — FULL-STACK ARCHITECTURAL FORENSIC AUDIT (2026)

**Target Production Domain:** `https://cut.everydaypdf.me/`  
**Repository Working Directory:** `/Users/rizwankhan/Open source pixel cut`  
**Audit Date:** November 12, 2026  
**Auditor:** Antigravity / DeepMind Engineering Assistant  
**Branch:** `remediation/titan-master-2026`  

---

## 1. Executive Summary

EverydayCut is a client-side web application designed to deliver browser-based image editing, background removal, photo restoration, Indian document preparation (PAN card & passport photo/signature resizing), and e-commerce product staging. 

The core technological thesis of the product is **zero cloud upload cost and absolute client privacy**: neural networks and image processing pipelines execute directly inside client browser memory (RAM/VRAM) via WebGPU, WebAssembly (WASM SIMD), and the HTML5 2D Canvas API.

However, a rigorous forensic inspection of the codebase reveals critical architectural bottlenecks:
1. **Routing Failure for Organic Search:** All 19 tool URLs rely on client-side hash fragments (`/#/background-remover`). Search engine crawlers (Googlebot) ignore URL fragments, rendering all tool pages invisible to indexation.
2. **Fabricated Structured Data:** `src/seo/SEOHead.tsx` injects fake Schema.org `aggregateRating` (`ratingValue: 4.9`, `reviewCount: 14820`), presenting an immediate risk of a Google Manual Action penalty.
3. **Severe Bundle & Asset Bloat:** The service worker attempts to precache **32.7 MB** of WASM files on first load. Concurrently, Vite bundles duplicate ONNX WASM binaries into `dist/assets/` (21.6 MB) while `public/wasm/` is copied verbatim into `dist/wasm/` (32.7 MB), producing over **53 MB** of WASM in build output.
4. **Discrepancy Between Advertised and Actual Capabilities:** Several advertised tools (e.g., Image Compressor/Converter, Passport Photo Maker background replacement, 4K Super-Resolution Upscaler) either lack dedicated UI controls, rely on conventional bicubic unsharp masking rather than neural super-resolution, or do not automatically execute background removal despite marketing promises.
5. **Zero Test Automation:** Despite having `playwright` in `devDependencies`, there are 0 test files, 0 CI workflows, and 0 automated verification checks.

---

## 2. Technology Stack & Runtime Environment

### 2.1 Core Framework & Tooling

| Component | Technology | Version | Location / Config | Architectural Role |
| :--- | :--- | :--- | :--- | :--- |
| **Language** | TypeScript | `^5.7.2` | `tsconfig.json` | Type-safe application development |
| **UI Library** | React | `^18.3.1` | `package.json` | Component tree & reactivity |
| **DOM Renderer** | React-DOM | `^18.3.1` | `src/main.tsx` | Concurrent root mounting (`#root`) |
| **Bundler & Dev Server** | Vite | `^6.0.7` (runs v6.4.5) | `vite.config.ts` | ES module bundling, worker support |
| **CSS Framework** | Tailwind CSS | `^3.4.17` | `tailwind.config.js` | Utility styling & dark theme classes |
| **PostCSS** | PostCSS / Autoprefixer | `^8.4.49` / `^10.4.20` | `postcss.config.js` | CSS prefixing & compilation |
| **State Management** | Zustand | `^5.0.3` | `src/engine/state/` | Unidirectional reactive state |
| **Canvas Engine** | Konva / React-Konva | `^9.3.18` / `^18.2.10` | `src/engine/canvas/` | Multi-layer stage, transform handles, filters |
| **Icons** | Lucide React | `^0.468.0` | Global UI components | SVG iconography |
| **Compression / Packaging**| JSZip | `^3.10.2` | `src/engine/batch/` | Bulk file ZIP packaging |

### 2.2 Inference Engine & AI Models

- **Neural Pipeline Library:** `@huggingface/transformers` (`^3.3.3`)
- **Primary Segmentation Model:** `briaai/RMBG-1.4` (Quantized INT8 weights: `q8`, ~44 MB download).
- **Execution Architecture:** Dedicated Web Worker (`src/engine/ml/segmentation.worker.ts`).
- **Inference Runtime:** ONNX Runtime Web (`onnxruntime-web` bundled via `@huggingface/transformers`).
  - **Chrome / Edge / Chromium:** WebGPU preferred with fallback to WASM SIMD multi-threaded.
  - **Safari / WebKit / iOS:** Hardcoded fallback to single-threaded WASM SIMD (`numThreads = 1`) due to WebKit pthread deadlocks in Web Workers.
- **Model Storage:** Browser `CacheStorage` (`env.useBrowserCache = true`).
- **Telemetry Policy:** Disabled (`env.allowLocalModels = false`).

### 2.3 Algorithmic (Non-Neural) Processing Engines

1. **Upscaler (`src/engine/ml/upscaler.ts`):**
   - High-quality bicubic resampling via 2D Canvas context.
   - Separable multi-scale Unsharp Mask algorithm (Pass 1: Horizontal box blur; Pass 2: Vertical box blur; Pass 3: High-frequency amplification: $S = O + k \cdot (O - B)$).
   - *Forensic Note:* Advertised as "AI Super-Resolution", but is actually a classical spatial filter.
2. **Inpainting / Magic Eraser (`src/engine/ml/inpainting.ts`):**
   - Fast Marching / 16-angle multi-directional ray-casting boundary interpolation.
   - 8-pass iterative Laplacian diffusion smoothing ($3\times 3$ Gaussian-weighted neighborhood).
   - Alpha-clamped to prevent transparent background bleeding into foreground objects.
3. **Government Signature Cleaner (`src/engine/ml/signatureFilter.ts`):**
   - Perceptual luminance histogram calculation ($L = 0.299R + 0.587G + 0.114B$).
   - Dynamic thresholding ($T = \text{clamp}(0.78 \cdot \bar{L}, 70, 210)$).
   - Two-tone binarization: Paper $\to$ `#ffffff`; Ink $\to$ enhanced high-contrast dark pigment with anti-aliased edge falloff.
4. **Alpha Compositing & Feathering (`src/engine/ml/postprocessing.ts`):**
   - Bicubic upsampling of model mask ($1024\times 1024 \to$ original natural dimensions).
   - 1D separable box blur edge feathering (radius 1px) to prevent harsh stair-stepping.
5. **Canvas Export & JPEG Rate-Distortion Binary Search (`src/utils/imageExport.ts`):**
   - 8-iteration binary search between quality 0.10 and 0.98 to strictly enforce file size limits (e.g., $<30\text{ KB}$ for PAN photos, $<20\text{ KB}$ for PAN signatures).
   - High-DPI stage capture via `pixelRatio: 2`.

---

## 3. Hosting, Deployment & Infrastructure

### 3.1 Cloudflare Pages Infrastructure

The repository is configured for Cloudflare Pages static hosting:
- `public/_redirects`: Contains single SPA rewrite rule: `/* /index.html 200`.
- `public/_headers`: Enforces Cross-Origin Isolation headers:
  ```http
  /*
    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Embedder-Policy: credentialless
  ```
- **Build Output Directory:** `dist/`
- **Node.js Environment:** Commit `3ea7624` added `.nvmrc` containing `20`, but commit `94d3f56` accidentally deleted `.nvmrc`. Cloudflare Pages defaults to Node 12 or 18 if `.nvmrc` is missing, risking build failure when compiling modern dependencies.

### 3.2 Network Call Graph & Privacy Reality

Forensic inspection of network traffic and source code confirms:
1. **User Image Pixels:** Never leave the client browser. No HTTP POST/PUT/fetch requests transmit image data.
2. **External Network Requests:**
   - `https://huggingface.co/briaai/RMBG-1.4/...`: Downloads quantized model weights upon first background removal invocation.
   - `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`: Loads Google AdSense ad scripts.
3. **No Analytics / Telemetry:** No Google Analytics, no Plausible, no Sentry, no Mixpanel, and no telemetry pings exist in the codebase.

---

## 4. Architectural Defect Register (Stage 0)

| ID | Component | Architectural Defect | Classification | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **ARCH-01** | Routing / SEO | Fragment-based hash routing (`/#/tool-slug`) makes all 19 tool landing pages invisible to search engines. | **VERIFIED** | Critical blocker for organic traffic. |
| **ARCH-02** | Structured Data | Fake `aggregateRating` (`ratingValue: 4.9`, `reviewCount: 14820`) in `SEOHead.tsx` violates Google Search guidelines. | **VERIFIED** | High risk of Google manual penalty. |
| **ARCH-03** | Service Worker | Precaching 32.7 MB of WASM on initial page visit exhausts mobile data and degrades initial performance. | **VERIFIED** | Poor mobile LCP and severe bounce rate. |
| **ARCH-04** | Build / Bundling | Duplicate WASM binaries in `dist/assets/` (21.6 MB) and `dist/wasm/` (32.7 MB) bloat deployment to 53+ MB. | **VERIFIED** | Wasted CDN bandwidth and slow deployments. |
| **ARCH-05** | Cloudflare Config | `.nvmrc` was deleted in commit `94d3f56`, risking Node version mismatch on Cloudflare Pages. | **VERIFIED** | Potential production build pipeline failure. |
| **ARCH-06** | AdSense Slots | Ad slots use non-numeric strings (`leaderboard-desktop`, `banner-mobile`) instead of numeric IDs. | **VERIFIED** | AdSense ads fail to render or generate revenue. |
| **ARCH-07** | Tool Fidelity | Upscaler is bicubic unsharp mask, yet marketed as "AI Super-Resolution". | **VERIFIED** | Misleading claims; potential user churn. |
| **ARCH-08** | Tool Completeness | "Image Compressor & Converter" (`converter`) has no UI controls for WebP export, target size, or format conversion. | **VERIFIED** | Advertised tool is non-functional in UI. |
| **ARCH-09** | Document Workflow | Passport Photo and PAN Photo presets do not isolate the subject; canvas background is hidden behind opaque photo. | **VERIFIED** | Users cannot get promised white background. |
| **ARCH-10** | CI / Quality Gate | Zero automated tests or CI pipelines exist in the repository. | **VERIFIED** | High regression risk during remediation. |

---

## 5. Architectural Recommendations

1. **Adopt Crawlable Static Routing:** Implement a pre-rendering or static HTML generation pipeline so that `/background-remover`, `/magic-eraser`, `/pan-card-photo-resizer`, etc., return clean, distinct HTML documents with unique server-rendered metadata, crawlable semantic anchors, and hash-redirect backward compatibility.
2. **Purge Fake Review Schema:** Remove fabricated `aggregateRating` from `SEOHead.tsx`. Implement clean `WebApplication` and `FAQPage` schema only.
3. **Optimize Service Worker Caching:** Switch WASM binaries to an on-demand, cache-first strategy. Do not precache 32 MB of WASM during service worker installation.
4. **Eliminate Duplicate WASM Chunks:** Configure Vite build options and `@huggingface/transformers` path resolution so that only a single instance of `ort-wasm-simd-threaded.wasm` is emitted.
5. **Reintroduce `.nvmrc`:** Pin Node.js to version `24.22.3` LTS (since Node 20 reached EOL on March 24, 2026) for consistent Cloudflare Pages builds.
6. **Implement Unit & Integration Tests:** Leverage the existing `playwright` dependency and add Vitest/Playwright tests for canvas operations, image export, and all 19 tool presets.
