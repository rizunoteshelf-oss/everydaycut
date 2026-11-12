export const SEO_TOOL_REGISTRY_DATA = {
  cutout: {
    presetId: 'cutout',
    slug: 'background-remover',
    title: 'Free AI Background Remover Online (No Sign-Up) - EverydayCut',
    metaDescription: 'Remove image backgrounds in 1 second with 100% in-browser AI. Free, private, unlimited HD exports with zero cloud uploads or data tracking.',
    h1: '100% Free In-Browser AI Background Remover',
    h2: 'Instant Transparent Cutouts in 4K Resolution With Zero Cloud Transmission',
    keywords: ['remove background', 'background remover online', 'free background eraser', 'transparent png maker', 'cutout photo', 'pixelcut alternative free'],
    howToSteps: [
      'Select or drag & drop any JPG, PNG, or WebP photo into the studio.',
      'Our on-device neural network (RMBG-1.4) automatically isolates the subject in client memory.',
      'Fine-tune the alpha matte or add solid colors, gradients, or shadows.',
      'Click Export to download an uncompressed transparent PNG or HD JPEG.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'AI Model': 'RMBG-1.4 quantized INT8 (client-side)',
      'Inference Engine': 'WebGPU / WASM SIMD via ONNX Runtime Web',
      'Max Resolution': 'Original resolution preserved up to 4096px',
      'Privacy Level': '100% on-device memory execution ($0 cloud latency)',
    },
    useCases: [
      'E-commerce product photo catalog preparation for Amazon & Shopify',
      'Headshots and profile pictures for LinkedIn, Twitter, and YouTube',
      'Graphic design composites, stickers, and marketing collateral',
      'Automotive and real estate inventory staging',
    ],
    faqs: [
      {
        question: 'Is this background remover completely free?',
        answer: 'Yes, EverydayCut is 100% free and open-source. There are no subscriptions, credits, daily limits, or watermarks.',
      },
      {
        question: 'Are my photos uploaded to a cloud server?',
        answer: 'Never. Unlike commercial cloud tools, EverydayCut executes neural AI models directly inside your browser memory using WebGPU and WebAssembly. Your photos never leave your device.',
      },
      {
        question: 'What image formats can I upload and export?',
        answer: 'You can upload PNG, JPEG, and WebP images. You can export as crystal-clear transparent PNG, optimized JPEG, or high-efficiency WebP.',
      },
      {
        question: 'Can I use the exported cutouts for commercial products?',
        answer: 'Yes. You retain 100% commercial ownership and copyright over all assets generated in EverydayCut.',
      },
      {
        question: 'Does the background remover work on mobile devices?',
        answer: 'Yes. EverydayCut is fully responsive and runs on modern mobile browsers (Safari on iOS 16.4+, Chrome for Android) with hardware acceleration.',
      },
    ],
    relatedTools: [
      { name: 'Magic Eraser', slug: 'magic-eraser' },
      { name: 'Batch Background Remover', slug: 'batch-background-remover' },
      { name: 'Amazon Product Stager', slug: 'amazon-product-photo-stager' },
    ],
    relatedPdfTools: [
      { name: 'PDF to JPG', url: 'https://everydaypdf.me/pdf-to-jpg', reason: 'Extract document images to edit in EverydayCut' },
    ],
  },

  eraser: {
    presetId: 'eraser',
    slug: 'magic-eraser',
    title: 'Free Magic Eraser: Remove Objects & People from Photos - EverydayCut',
    metaDescription: 'Erase unwanted objects, photobombers, text, and watermarks from photos in seconds. Client-side Fast Marching texture diffusion with zero quality loss.',
    h1: 'Free AI Magic Eraser & Object Remover',
    h2: 'Seamless Texture Diffusion Directly in Browser Memory',
    keywords: ['magic eraser online', 'remove object from photo', 'cleanup pictures free', 'erase text from image', 'watermark remover free'],
    howToSteps: [
      'Upload the photo you wish to clean up.',
      'Adjust the brush size slider to match the unwanted element.',
      'Brush directly over the object, photobomber, or text watermark.',
      'Click Apply to diffuse surrounding textures seamlessly into the masked area.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Algorithm': 'Fast Marching 16-angle ray-casting + 8-pass Laplacian diffusion',
      'Execution': 'HTML5 2D Canvas context in local RAM',
      'Boundary Awareness': 'Alpha-clamped to prevent transparent edge bleeding',
      'Max Image Size': 'Full source resolution up to 4K',
    },
    useCases: [
      'Removing tourists, strangers, and photobombers from vacation photos',
      'Cleaning dust spots, scratches, and camera lens blemishes',
      'Erasing unwanted date stamps, text overlays, and watermarks',
      'Removing power lines, signs, and background distractions in architecture photography',
    ],
    faqs: [
      {
        question: 'How does the in-browser Magic Eraser work?',
        answer: 'Our Fast Marching and Laplacian texture diffusion engine samples surrounding boundary pixels to seamlessly reconstruct the background where the object was brushed away.',
      },
      {
        question: 'Is there any limit to how many objects I can erase?',
        answer: 'None. You can erase as many objects as you like in successive brush strokes with full Undo/Redo history support.',
      },
      {
        question: 'Does erasing reduce overall photo resolution?',
        answer: 'No. EverydayCut maps your brush strokes directly into the original high-resolution coordinate space, preserving 100% of the surrounding pixel quality.',
      },
      {
        question: 'Can I erase items from cutouts with transparent backgrounds?',
        answer: 'Yes. The algorithm is alpha-clamped, ensuring transparent regions remain transparent without creating black pixel artifacts.',
      },
    ],
    relatedTools: [
      { name: 'AI Background Remover', slug: 'background-remover' },
      { name: '4K Clarity Upscaler', slug: 'image-upscaler' },
    ],
  },

  upscale: {
    presetId: 'upscale',
    slug: 'image-upscaler',
    title: 'Free 2x & 4x Image Upscaler & Clarity Enhancer - EverydayCut',
    metaDescription: 'Enhance photo sharpness, edges, and texture resolution to crisp 4K quality. High-precision bicubic resampling and separable unsharp mask in browser memory.',
    h1: 'Free 2x & 4x Image Upscaler & Clarity Enhancer',
    h2: 'Sub-Pixel Sharpness Enhancement & 4K Resampling in Local RAM',
    keywords: ['image upscaler free', 'upscale photo 4k', 'photo enhancer online', 'clarity enhancer web', 'unblur image free'],
    howToSteps: [
      'Upload any low-resolution photo or product image.',
      'Select either 2x or 4x enhancement factor from the Enhance tab.',
      'Our client-side separable filter reconstructs micro-contrast and edge sharpness.',
      'Preview the enhanced output and export in high-definition format.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Resampling Method': 'High-precision bicubic interpolation',
      'Clarity Filter': 'Separable multi-scale unsharp masking ($O(N)$ efficiency)',
      'Max Dimension': '4096px (4K UHD bounded to prevent GPU exhaustion)',
      'Processing Latency': '<150ms on modern laptops and smartphones',
    },
    useCases: [
      'Upscaling vintage or low-resolution family photos for printing',
      'Sharpening blurry e-commerce thumbnails for high-DPI displays',
      'Preparing social media graphics for large canvas banners and posters',
      'Enhancing digital artwork and game screenshots for crisp viewing',
    ],
    faqs: [
      {
        question: 'How does this upscaler improve photo clarity?',
        answer: 'EverydayCut combines bicubic sub-pixel resampling with an optimized separable unsharp mask, amplifying high-frequency edge gradients while suppressing noise.',
      },
      {
        question: 'What is the maximum resolution for upscaling?',
        answer: 'EverydayCut supports upscaling up to 4096px maximum dimension directly in browser memory.',
      },
      {
        question: 'Is this an AI neural upscaler?',
        answer: 'EverydayCut uses a deterministic high-precision mathematical unsharp mask and bicubic resampling engine rather than hallucinating generative AI pixels, ensuring your original subject features are never distorted.',
      },
      {
        question: 'Can I upscale images with transparent backgrounds?',
        answer: 'Yes. The algorithm processes RGB channels independently while preserving the original alpha transparency channel perfectly.',
      },
    ],
    relatedTools: [
      { name: 'Background Remover', slug: 'background-remover' },
      { name: 'Image Cropper', slug: 'crop-image-aspect-ratio' },
    ],
  },

  pan_photo: {
    presetId: 'pan_photo',
    slug: 'pan-card-photo-resizer',
    title: 'PAN Card Photo Resizer (213x213 px, 300 DPI, <30 KB) - UTIITSL & NSDL',
    metaDescription: 'Resize, crop and format photo for PAN card online. Exact 213x213 pixels, 300 DPI JFIF header, pure white background, and guaranteed file size under 30 KB.',
    h1: 'PAN Card Photo Size 213x213 px Resizer & Cropper',
    h2: 'Official UTIITSL & NSDL Portal Compliant Formatting (300 DPI, <30 KB)',
    keywords: ['pan card photo resizer', 'pan card photo size 213x213', 'pan card photo converter 300 dpi', 'nsdl photo resizer under 30kb', 'utiitsl photo cropping'],
    howToSteps: [
      'Upload a passport-style portrait or selfie.',
      'Our tool automatically positions the photo within the 213x213 biometric guide.',
      'Toggle Auto White Background Cutout to replace distracting backgrounds with pure white.',
      'Export the compliant JPEG with embedded 300 DPI JFIF headers guaranteed under 30 KB.',
    ],
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    specs: {
      'Target Dimensions': 'Exact 213 x 213 pixels (1:1 square aspect ratio)',
      'DPI Metadata': '300 DPI injected via JFIF APP0 marker',
      'File Size Limit': 'Strictly between 10 KB and 30 KB',
      'Output Format': 'JPEG / JPG with pure white #FFFFFF background',
    },
    useCases: [
      'NSDL (Protean) e-PAN and physical PAN card online applications',
      'UTIITSL PAN portal photo uploading and correction requests',
      'Form 49A (Indian citizens) and Form 49AA (foreign citizens) document submission',
    ],
    faqs: [
      {
        question: 'What is the official PAN card photo specification?',
        answer: 'Both UTIITSL and NSDL (Protean) require exact 213x213 pixel dimensions at 300 DPI in JPEG format, with file size strictly between 10 KB and 30 KB.',
      },
      {
        question: 'Does this tool guarantee file size under 30 KB?',
        answer: 'Yes. EverydayCut uses an iterative binary rate-distortion search in browser memory to guarantee your exported JPEG stays strictly below 30 KB while maximizing image clarity.',
      },
      {
        question: 'Does the tool replace the background with white?',
        answer: 'Yes. With Auto White Background enabled, the tool cuts out the portrait and places it onto a pure white (#FFFFFF) background to meet official portal requirements.',
      },
      {
        question: 'Is EverydayCut affiliated with NSDL or UTIITSL?',
        answer: 'No. EverydayCut is an independent client-side privacy tool created to help applicants format their photos to government guidelines without third-party fees.',
      },
    ],
    relatedTools: [
      { name: 'PAN Signature Cropper', slug: 'pan-card-signature-cropper' },
      { name: 'Passport Photo Maker', slug: 'passport-photo-maker' },
    ],
    relatedPdfTools: [
      { name: 'Compress PDF', url: 'https://everydaypdf.me/compress-pdf', reason: 'Compress supporting PAN document PDFs' },
      { name: 'Merge PDF', url: 'https://everydaypdf.me/merge-pdf', reason: 'Combine Aadhaar and identity proof PDFs' },
    ],
  },

  pan_signature: {
    presetId: 'pan_signature',
    slug: 'pan-card-signature-cropper',
    title: 'PAN Card Signature Resizer (400x200 px, 300 DPI, <20 KB) - NSDL & UTIITSL',
    metaDescription: 'Crop PAN card signature to exact 400x200 pixels, 300 DPI, and compress under 20 KB. Automatic ink binarization removes paper shadows and wrinkles.',
    h1: 'PAN Card Signature 400x200 px Cropper & Resizer',
    h2: 'High-Contrast Ink Binarization with Guaranteed <20 KB Export',
    keywords: ['pan card signature resizer', 'pan signature 400x200', 'pan card signature converter under 20kb', 'nsdl signature crop tool', 'utiitsl signature resizer'],
    howToSteps: [
      'Take a photo of your signature signed with black or dark blue pen on white paper.',
      'Upload the photo into the PAN Signature tool.',
      'Our perceptual luminance filter automatically removes paper shadows and binarizes the ink.',
      'Adjust zoom or framing within the 400x200 (2:1) boundary and export as compliant JPEG.',
    ],
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    specs: {
      'Target Dimensions': 'Exact 400 x 200 pixels (2:1 aspect ratio)',
      'DPI Metadata': '300 DPI injected via JFIF APP0 marker',
      'File Size Limit': 'Strictly between 10 KB and 20 KB',
      'Filtering': 'Dynamic luminance thresholding ($0.78 \\cdot \\bar{L}$) for crisp ink on pure white',
    },
    useCases: [
      'NSDL (Protean) PAN card application signature upload',
      'UTIITSL PAN correction and duplicate card issuance',
      'Bank KYC, Demat account opening, and Passport verification forms',
    ],
    faqs: [
      {
        question: 'What is the required signature size for PAN applications?',
        answer: 'The required format is exact 400x200 pixels (2:1 aspect ratio) at 300 DPI with file size between 10 KB and 20 KB in JPEG format.',
      },
      {
        question: 'How does the tool remove shadows from mobile photos of paper?',
        answer: 'Our filter computes a perceptual luminance histogram of the paper and dynamically thresholds gray levels, turning uneven shadows pure white while intensifying pen strokes into crisp dark ink.',
      },
      {
        question: 'Can I use a signature signed in blue ink?',
        answer: 'Yes. The filter analyzes luminance intensity, producing clean high-contrast dark ink whether signed in black or blue ink.',
      },
      {
        question: 'Is my signature safe from identity theft?',
        answer: '100% safe. Processing happens exclusively in your browser RAM using client-side JavaScript. Your signature is NEVER uploaded to any server or database.',
      },
    ],
    relatedTools: [
      { name: 'PAN Photo Resizer', slug: 'pan-card-photo-resizer' },
      { name: 'Passport Photo Maker', slug: 'passport-photo-maker' },
    ],
    relatedPdfTools: [
      { name: 'Sign PDF', url: 'https://everydaypdf.me/sign-pdf', reason: 'Digitally sign PDF documents online' },
    ],
  },

  passport: {
    presetId: 'passport',
    slug: 'passport-photo-maker',
    title: 'Free Passport & Visa Photo Maker (2x2 inch / 600x600 px) - EverydayCut',
    metaDescription: 'Create compliant biometric passport and visa photos online. Automatic white background replacement, 300 DPI metadata, and official 70-80% face framing.',
    h1: 'Free Biometric Passport & Visa Photo Maker',
    h2: 'Standard 2x2 Inch (600x600 px) Formatting with Clean White Background',
    keywords: ['passport photo maker online', '2x2 photo maker', 'visa photo resizer', 'us visa photo white background', 'passport size photo maker free'],
    howToSteps: [
      'Upload a clear, front-facing portrait or selfie with neutral expression.',
      'The tool automatically aligns your face against the biometric head guide (70-80% frame height).',
      'Toggle Auto White Background to remove bedroom or outdoor background instantly.',
      'Export high-resolution 600x600 JPEG at 300 DPI ready for online visa/passport portals.',
    ],
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    specs: {
      'Target Dimensions': 'Exact 600 x 600 pixels (2 x 2 inches at 300 DPI)',
      'Head Height Ratio': 'Face occupies between 70% and 80% of total height',
      'Background Color': 'Pure White #FFFFFF',
      'DPI Metadata': '300 DPI JFIF density header embedded',
    },
    useCases: [
      'US Visa (DS-160) and Green Card Diversity Lottery (DV Lottery) photos',
      'Indian Passport Seva Kendra (PSK) online application upload',
      'Schengen Visa, UK Passport, Canada Visa, and international travel permits',
    ],
    faqs: [
      {
        question: 'What are standard international passport photo dimensions?',
        answer: 'Standard biometric square photos (such as US Visa, India Passport, and DV Lottery) require 2x2 inches (51x51 mm), which translates to 600x600 pixels at 300 DPI.',
      },
      {
        question: 'Does this tool automatically frame my face?',
        answer: 'Yes. The biometric guide overlay highlights the official chin-to-crown zone (70% to 80% of frame height) to ensure compliance.',
      },
      {
        question: 'Does the tool replace the background with white?',
        answer: 'Yes. EverydayCut cuts out your portrait and renders it against a pure white background, compliant with international visa standards.',
      },
      {
        question: 'Can I print these passport photos?',
        answer: 'Yes. Because EverydayCut embeds true 300 DPI metadata, your exported photo can be printed at any photo studio or pharmacy without pixelation.',
      },
    ],
    relatedTools: [
      { name: 'PAN Card Photo Resizer', slug: 'pan-card-photo-resizer' },
      { name: 'AI Background Remover', slug: 'background-remover' },
    ],
  },

  amazon: {
    presetId: 'amazon',
    slug: 'amazon-product-photo-stager',
    title: 'Amazon Product Photo Stager: Pure White Background (85% Rule)',
    metaDescription: 'Create 100% compliant Amazon product listing photos. Pure #FFFFFF white background, 1:1 square canvas, and official 85% product bounding box.',
    h1: 'Amazon Listing Photo Creator: 85% Rule & Pure White #FFFFFF',
    h2: 'Boost E-Commerce Conversion Rates with Certified Marketplace Framing',
    keywords: ['amazon product photo white background', 'amazon main image 85 rule', 'amazon listing photo editor', 'pure white background for amazon'],
    howToSteps: [
      'Upload your raw product photo taken with any camera or smartphone.',
      'Our AI instantly removes the background, keeping product edges crisp.',
      'The product is automatically framed on a 1:1 square canvas filling 85% of the frame.',
      'Export high-resolution 1080x1080 or 2000x2000 pure white JPEG ready for Seller Central.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Background Color': 'Pure White RGB (255, 255, 255) / #FFFFFF',
      'Fill Ratio': 'Product occupies 85% or more of the frame',
      'Aspect Ratio': '1:1 Square (1080x1080 default, scalable)',
      'Export Format': 'High-fidelity JPEG or transparent PNG',
    },
    useCases: [
      'Amazon Seller Central main product listing images',
      'Walmart Marketplace product staging',
      'Google Shopping feed white-background product compliance',
    ],
    faqs: [
      {
        question: 'What is Amazon\'s main product image rule?',
        answer: 'Amazon requires the main product image to have a pure white background (RGB 255, 255, 255) with the product filling at least 85% of the frame area.',
      },
      {
        question: 'Does this tool guarantee pure white background?',
        answer: 'Yes. The background is rendered with exact hex code #FFFFFF, ensuring Amazon\'s automated image inspection bots validate the listing.',
      },
      {
        question: 'Will product shadows be preserved?',
        answer: 'You can choose between pure flat white or add a subtle soft contact shadow in the Shadow tab to give your product grounding and realism.',
      },
      {
        question: 'Can I batch-process multiple product photos?',
        answer: 'Yes! Use the Batch Background Remover to process dozens of catalog photos at once and download all cutouts as a ZIP archive.',
      },
    ],
    relatedTools: [
      { name: 'Shopify Product Studio', slug: 'shopify-product-studio' },
      { name: 'Batch Background Remover', slug: 'batch-background-remover' },
    ],
  },

  shopify: {
    presetId: 'shopify',
    slug: 'shopify-product-studio',
    title: 'Shopify Product Photo Studio: Soft Shadows & Modern Pedestals',
    metaDescription: 'Create studio-grade Shopify hero photos with realistic contact shadows, pedestal backdrops, and balanced framing in seconds.',
    h1: 'Shopify E-Commerce Product Studio',
    h2: 'High-Converting Product Staging with Ambient Ground Shadows',
    keywords: ['shopify product photo editor', 'add shadow to product photo', 'ecommerce photo studio', 'product photography background replacement'],
    howToSteps: [
      'Upload a product image of apparel, accessories, electronics, or cosmetics.',
      'EverydayCut cuts out the product with sub-pixel edge feathering.',
      'A realistic soft contact shadow is synthesized automatically under the product.',
      'Adjust canvas background color or gradient to match your Shopify brand theme and export.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Canvas Presets': '1:1 Square, 4:5 Portrait, or custom dimensions',
      'Shadow Synthesis': 'Dual-mode (Directional Drop Shadow and Ambient Soft Ground Shadow)',
      'Backdrops': 'Solid neutral tones (#F8FAFC) or custom multi-stop gradients',
    },
    useCases: [
      'Shopify storefront product hero banners and collection grids',
      'WooCommerce and BigCommerce high-converting product pages',
      'Direct-to-consumer (D2C) lifestyle brand catalog photography',
    ],
    faqs: [
      {
        question: 'How do studio shadows improve product sales?',
        answer: 'Grounded contact shadows provide realistic depth perception, making digital product listings feel tangible, trustworthy, and premium.',
      },
      {
        question: 'Can I customize shadow direction, blur, and opacity?',
        answer: 'Yes. The Shadow tab in the studio sidebar provides real-time sliders for horizontal offset, vertical offset, blur radius, and shadow intensity.',
      },
      {
        question: 'What image format is best for Shopify?',
        answer: 'WebP and JPEG are ideal for fast page speed, while PNG is best if you require a transparent background.',
      },
    ],
    relatedTools: [
      { name: 'Amazon Product Stager', slug: 'amazon-product-photo-stager' },
      { name: 'E-Commerce Sales Badges', slug: 'ecommerce-sales-badges' },
    ],
  },

  pfp_maker: {
    presetId: 'pfp_maker',
    slug: 'profile-picture-maker',
    title: 'Free Profile Picture (PFP) Maker: Avatars & Circular Glow - EverydayCut',
    metaDescription: 'Make standout profile pictures for LinkedIn, Twitter, Instagram, and YouTube. Instant cutout, circular crop guide, and vibrant gradient backdrops.',
    h1: 'Free Profile Picture Maker & Avatar Studio',
    h2: 'Vibrant Gradients, Circular Framing & Studio Glow for Social Media',
    keywords: ['pfp maker online', 'profile picture creator', 'avatar background remover', 'linkedin headshot background changer', 'youtube avatar maker'],
    howToSteps: [
      'Upload a portrait, selfie, or headshot.',
      'The AI removes the messy background, leaving your portrait pin-sharp.',
      'Select a modern multi-stop gradient (Sunset, Ocean, Cosmic, Aurora) or custom solid color.',
      'Align your headshot within the circular crop boundary and download your avatar.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Canvas Dimensions': '1080 x 1080 square canvas',
      'Guide Overlay': 'Circular avatar preview boundary',
      'Gradients': 'Multi-angle linear and radial gradient backdrops',
    },
    useCases: [
      'Professional LinkedIn headshot background replacement',
      'Twitter / X, Discord, and Telegram circular avatar creation',
      'YouTube channel profile icons and creator branding',
    ],
    faqs: [
      {
        question: 'Can I add a custom colored background to my headshot?',
        answer: 'Yes. Select from transparent, custom solid hex colors, or curated multi-stop gradients with a single click.',
      },
      {
        question: 'Does the circular guide cut off my photo permanently?',
        answer: 'No. The circular guide is a non-destructive preview overlay so you can position your headshot perfectly without losing surrounding pixels.',
      },
      {
        question: 'What is the best format to upload as a profile picture?',
        answer: 'PNG or high-quality JPEG at 1080x1080 pixels ensures crisp avatar display on both retina screens and mobile apps.',
      },
    ],
    relatedTools: [
      { name: 'Background Remover', slug: 'background-remover' },
      { name: 'Instagram Story Resizer', slug: 'instagram-story-resizer' },
    ],
  },

  batch: {
    presetId: 'batch',
    slug: 'batch-background-remover',
    title: 'Free Batch Background Remover (.ZIP Download) - EverydayCut',
    metaDescription: 'Remove backgrounds from dozens of product photos in bulk. Zero server uploads, processed locally in client Web Workers and exported as a .ZIP.',
    h1: 'Free Batch Background Remover & Bulk Studio',
    h2: 'Process Hundreds of Photos Locally With Zero Subscription Fees',
    keywords: ['batch background remover', 'bulk cutout photo', 'remove background multiple images', 'bulk png maker', 'free batch image background remover'],
    howToSteps: [
      'Open Batch Studio and drop 5, 10, or up to 50 photos at once.',
      'Our client Web Worker pipeline processes each cutout in sequence with live progress.',
      'Inspect thumbnail cutouts directly in the browser grid.',
      'Click Download All (.ZIP) to save all transparent PNGs in a single packaged archive.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Batch Capacity': 'Unlimited (recommended 10-50 per session for memory stability)',
      'Worker Concurrency': 'Controlled sequential pipeline preventing GPU/VRAM thrashing',
      'Archive Engine': 'JSZip DEFLATE level 6 compression',
      'Privacy': '100% client RAM processing — zero files sent to cloud',
    },
    useCases: [
      'Bulk e-commerce catalog image preparation for retailers',
      'Event photography subject extraction and batch processing',
      'Real estate listing photo cleanup and sky background replacement',
    ],
    faqs: [
      {
        question: 'Is there a limit on how many photos I can batch process?',
        answer: 'No strict limit. Batch processing runs locally on your computer hardware, with all cutouts packaged into a single instant .ZIP download.',
      },
      {
        question: 'Why does batch processing run locally instead of on a server?',
        answer: 'Local processing ensures absolute privacy for your catalog assets, eliminates waiting in cloud server queues, and saves hundreds of dollars in API subscription fees.',
      },
      {
        question: 'Can I download individual cutouts or only the ZIP?',
        answer: 'Both! You can click the download icon on any individual photo card or click Download All (.ZIP) to get all cutouts at once.',
      },
    ],
    relatedTools: [
      { name: 'Background Remover', slug: 'background-remover' },
      { name: 'Amazon Product Stager', slug: 'amazon-product-photo-stager' },
    ],
  },

  badges: {
    presetId: 'badges',
    slug: 'ecommerce-sales-badges',
    title: 'E-Commerce Marketing Badges: 50% OFF, Bestseller Stamps - EverydayCut',
    metaDescription: 'Stamp promotional badges (BESTSELLER, 50% OFF, FREE SHIPPING, 5-Stars) with custom fonts and colors directly onto e-commerce listings.',
    h1: 'E-Commerce Sales Badges & Promotional Stamps',
    h2: 'Drive Click-Through Rates with Eye-Catching Product Badges',
    keywords: ['ecommerce sales badge maker', 'add 50 off badge to photo', 'bestseller stamp generator', 'product listing promo badge'],
    howToSteps: [
      'Upload your product photo or transparent cutout.',
      'Click Add Badge to select from presets (50% OFF, NEW ARRIVAL, BESTSELLER, FREE SHIPPING).',
      'Customize badge style (pill, solid, outline), color, font size, and position.',
      'Export high-resolution composite ready for marketplace promotion.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Badge Styles': 'Pill (rounded full), Solid box, Outline badge',
      'Typography': 'Custom font family, size, weight, alignment, and drop shadow',
      'Layer Support': 'Full Konva multi-layer drag, scale, and rotate transformer',
    },
    useCases: [
      'Promotional campaign graphics for Black Friday, Cyber Monday, and festive sales',
      'Marketplace badges on Amazon, Flipkart, Etsy, and eBay thumbnails',
      'Instagram and Facebook feed promotional ad creative',
    ],
    faqs: [
      {
        question: 'Can I customize the badge text and color?',
        answer: 'Yes, change text content, badge style, font size, badge color, and text fill with real-time canvas updates.',
      },
      {
        question: 'Can I add multiple badges to a single product image?',
        answer: 'Yes. You can add multiple text and badge layers to your canvas, repositioning each independently.',
      },
    ],
    relatedTools: [
      { name: 'Shopify Product Studio', slug: 'shopify-product-studio' },
      { name: 'Amazon Product Stager', slug: 'amazon-product-photo-stager' },
    ],
  },

  etsy: {
    presetId: 'etsy',
    slug: 'etsy-product-stager',
    title: 'Etsy & eBay Product Photo Stager: Clean Soft Shadows - EverydayCut',
    metaDescription: 'Stage handmade items, vintage goods, and crafts with natural aesthetic lighting and subtle floating drop shadows for Etsy and eBay.',
    h1: 'Etsy & eBay Product Photo Stager',
    h2: 'Showcase Handmade Goods with Natural Aesthetic Lighting',
    keywords: ['etsy product photo editor', 'ebay listing photo maker', 'clean product background for etsy', 'soft shadow photo maker'],
    howToSteps: [
      'Upload a photo of your craft, jewelry, vintage item, or artwork.',
      'Our AI segments the object cleanly from cluttered workshop backgrounds.',
      'Position the item on a warm neutral or light gray canvas.',
      'Apply subtle ambient ground shadow for an organic handmade aesthetic.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Canvas Ratios': '4:3 or 1:1 Square (Etsy recommended standards)',
      'Shadow Type': 'Soft ambient contact shadow simulation',
      'Background Tones': 'Clean neutral whites and warm studio off-whites',
    },
    useCases: [
      'Etsy shop listings for jewelry, pottery, woodworking, and apparel',
      'eBay listing photos for refurbished tech, collectibles, and vintage items',
      'Poshmark, Mercari, and Depop clothing resale photos',
    ],
    faqs: [
      {
        question: 'What is the recommended photo aspect ratio for Etsy?',
        answer: 'Etsy recommends 4:3 or 1:1 square photos with high resolution so buyers can zoom into product craftsmanship.',
      },
      {
        question: 'Will delicate jewelry edges be preserved?',
        answer: 'Yes. EverydayCut uses sub-pixel feathering and high-resolution alpha compositing to keep delicate contours and chains intact.',
      },
    ],
    relatedTools: [
      { name: 'Shopify Product Studio', slug: 'shopify-product-studio' },
      { name: 'Studio Shadows & Lighting', slug: 'studio-shadows-lighting' },
    ],
  },

  instagram_story: {
    presetId: 'instagram_story',
    slug: 'instagram-story-resizer',
    title: 'Instagram Story & Reel Resizer (9:16 Vertical, 1080x1920) - EverydayCut',
    metaDescription: 'Resize photos to 9:16 vertical (1080x1920) for Instagram Stories, Reels, and TikTok with smart blurred background padding.',
    h1: 'Instagram Story & Reel 9:16 Resizer',
    h2: 'Perfect 1080x1920 Vertical Framing with Smart Blurred Background Padding',
    keywords: ['instagram story resizer', '9 16 photo resizer online', 'tiktok vertical photo maker', 'fit photo to instagram story without cropping'],
    howToSteps: [
      'Upload any horizontal or square photo.',
      'The tool automatically places your photo onto a standard 1080x1920 9:16 vertical canvas.',
      'Smart blurred background padding fills the top and bottom borders naturally.',
      'Export ready for direct posting to Instagram Stories, Reels, or TikTok.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Canvas Dimensions': '1080 x 1920 pixels (9:16 aspect ratio)',
      'Background Padding': 'Smart blurred cover-scaled background or custom gradient',
      'Export Format': 'Full-HD JPEG or WebP',
    },
    useCases: [
      'Fitting landscape photos into Instagram Stories without awkward head cropping',
      'TikTok and YouTube Shorts static image covers',
      'Mobile vertical wallpaper creation',
    ],
    faqs: [
      {
        question: 'How do I fit horizontal photos into a vertical 9:16 Story?',
        answer: 'EverydayCut centers your photo on a 9:16 canvas and fills the outer space with a heavily blurred, color-matched version of your photo, eliminating awkward letterboxing.',
      },
      {
        question: 'Can I change the blurred background to a solid color?',
        answer: 'Yes. You can switch between blurred photo padding, solid colors, or multi-stop gradients in the Background tab.',
      },
    ],
    relatedTools: [
      { name: 'Profile Picture Maker', slug: 'profile-picture-maker' },
      { name: 'YouTube Thumbnail Pop-Out', slug: 'youtube-thumbnail-popout' },
    ],
  },

  youtube_thumb: {
    presetId: 'youtube_thumb',
    slug: 'youtube-thumbnail-popout',
    title: 'YouTube Thumbnail Pop-Out Maker (16:9 Landscape) - EverydayCut',
    metaDescription: 'Create high-CTR YouTube thumbnails with cutout subject pop-outs, high-vibrance saturation, bold drop shadows, and 16:9 canvas framing.',
    h1: 'YouTube Thumbnail Pop-Out Creator (16:9)',
    h2: 'High-CTR YouTube Thumbnails with Cutout Pop-Outs & Vibrant Lighting',
    keywords: ['youtube thumbnail maker', 'youtube thumbnail pop out cutout', '16 9 thumbnail creator', 'clickbait thumbnail cutout effect'],
    howToSteps: [
      'Upload a creator reaction photo or video frame grab.',
      'Isolate the creator or key object using instant AI background removal.',
      'Add a bold directional drop shadow and boost saturation in the Filters tab.',
      'Add high-impact bold typography badges and export at 1920x1080 resolution.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Canvas Dimensions': '1920 x 1080 pixels (16:9 widescreen)',
      'Text Engine': 'Bold headline stamps with contrast shadows',
      'Filters': 'Vibrance, saturation boost, contrast, and brightness controls',
    },
    useCases: [
      'High-CTR YouTube video thumbnails',
      'Twitch stream offline banners and video cover art',
      'Podcast episode cover art (16:9 format)',
    ],
    faqs: [
      {
        question: 'What is the official resolution for YouTube thumbnails?',
        answer: 'YouTube recommends 1280x720 or 1920x1080 pixels (16:9 aspect ratio) under 2 MB in JPEG, PNG, or WebP.',
      },
      {
        question: 'How do creator pop-outs increase click-through rate (CTR)?',
        answer: 'Isolating the expressive face or focal subject with a bold outline or drop shadow separates it visually from busy backgrounds, drawing viewers\' eyes instantly in search results.',
      },
    ],
    relatedTools: [
      { name: 'E-Commerce Sales Badges', slug: 'ecommerce-sales-badges' },
      { name: 'Instagram Story Resizer', slug: 'instagram-story-resizer' },
    ],
  },

  pinterest: {
    presetId: 'pinterest',
    slug: 'pinterest-pin-optimizer',
    title: 'Pinterest Pin Optimizer (2:3 Vertical, 1000x1500) - EverydayCut',
    metaDescription: 'Create high-performing 2:3 vertical Pinterest pins (1000x1500 px) with header and footer typographic banners for recipes, fashion, and blog posts.',
    h1: 'Pinterest Pin 2:3 Vertical Optimizer',
    h2: 'High-Engagement 1000x1500 Canvas for Recipes, Fashion & Crafts',
    keywords: ['pinterest pin maker', '2 3 pin resizer online', 'pinterest graphic creator free', 'pinterest banner maker'],
    howToSteps: [
      'Upload your recipe, craft, fashion, or travel photo.',
      'Canvas auto-formats to standard 2:3 vertical aspect ratio (1000x1500 px).',
      'Position your image and add title headers or callout badge stamps.',
      'Export optimized image ready to pin on Pinterest boards.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Canvas Dimensions': '1000 x 1500 pixels (2:3 vertical aspect ratio)',
      'Pin Guideline': 'Compliant with Pinterest recommendation to prevent feed truncation',
    },
    useCases: [
      'Food blog recipe pins and infographic step-by-steps',
      'Fashion style guides and outfit inspiration pins',
      'DIY craft tutorials, home decor ideas, and fitness routines',
    ],
    faqs: [
      {
        question: 'What is the best aspect ratio for Pinterest pins?',
        answer: 'Pinterest strongly recommends a 2:3 aspect ratio (such as 1000x1500 pixels) to avoid pin truncation in home feeds.',
      },
      {
        question: 'Can I add blog titles to my pins?',
        answer: 'Yes, click Add Text to create stylish banner headings with custom colors and bold fonts.',
      },
    ],
    relatedTools: [
      { name: 'Instagram Story Resizer', slug: 'instagram-story-resizer' },
      { name: 'Lossless Image Cropper', slug: 'crop-image-aspect-ratio' },
    ],
  },

  converter: {
    presetId: 'converter',
    slug: 'image-compressor-converter',
    title: 'Free Smart Image Compressor & Format Converter (PNG, JPEG, WEBP)',
    metaDescription: 'Convert between PNG, JPEG, and WEBP with precision KB budget compression. Target strict file size limits (<20KB, <30KB, <50KB) for job portals with zero cloud upload.',
    h1: 'Smart Image Compressor & Format Converter',
    h2: 'Target Strict File Size Budgets with Lossless In-Browser Precision',
    keywords: ['image compressor online', 'compress image to 20kb', 'png to jpeg converter', 'convert to webp online free', 'reduce image file size'],
    howToSteps: [
      'Upload the photo or graphic you wish to compress or convert.',
      'Select your desired output format: WebP, JPEG, or PNG.',
      'Choose a target file size budget (<20 KB, <30 KB, <50 KB, <100 KB) or use the quality slider.',
      'Our binary rate-distortion engine compresses the image in memory and exports instantly.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Supported Formats': 'WebP, JPEG, PNG',
      'Compression Method': 'Iterative binary search quality optimization on Canvas Blob API',
      'Target KB Budgets': '<20 KB, <30 KB, <50 KB, <100 KB, Custom KB',
      'Quality Slider': '10% to 100% granular compression control',
    },
    useCases: [
      'Compressing photos and signatures for government exam and job application portals',
      'Converting heavy PNG graphics to lightweight WebP for web performance',
      'Reducing image file sizes for email attachments and document uploads',
    ],
    faqs: [
      {
        question: 'Can I target an exact file size in kilobytes?',
        answer: 'Yes, EverydayCut uses iterative binary rate-distortion search in browser memory to guarantee your exported image stays under your desired KB limit.',
      },
      {
        question: 'Is WebP smaller than JPEG?',
        answer: 'Yes. WebP typically provides 25% to 35% smaller file sizes than JPEG at equivalent visual quality.',
      },
      {
        question: 'Are my private files safe when compressed?',
        answer: '100% safe. EverydayCut compresses all files inside your local browser RAM. No files or metadata are ever transmitted to any external server.',
      },
    ],
    relatedTools: [
      { name: 'PAN Card Photo Resizer', slug: 'pan-card-photo-resizer' },
      { name: 'PAN Card Signature Cropper', slug: 'pan-card-signature-cropper' },
    ],
    relatedPdfTools: [
      { name: 'Compress PDF', url: 'https://everydaypdf.me/compress-pdf', reason: 'Compress PDF documents under strict size limits' },
    ],
  },

  crop: {
    presetId: 'crop',
    slug: 'crop-image-aspect-ratio',
    title: 'Free Image Cropper & Aspect Ratio Studio - EverydayCut',
    metaDescription: 'Crop and frame photos to 1:1, 4:5, 9:16, 16:9 or custom dimensions with sub-pixel precision and lossless resolution preservation.',
    h1: 'Lossless Image Cropper & Aspect Ratio Studio',
    h2: 'Sub-Pixel Precision Framing for Social Media and Web',
    keywords: ['crop image online free', 'aspect ratio cropper', 'lossless photo crop tool', 'resize image dimensions online'],
    howToSteps: [
      'Upload the photo you want to crop or resize.',
      'Select an aspect ratio preset: 1:1 Square, 4:5 Portrait, 9:16 Story, 16:9 Landscape, 3:4, or 4:3.',
      'Drag and scale the image within the canvas boundary using the interactive transform handles.',
      'Export the perfectly framed crop in PNG, JPEG, or WebP.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Presets': 'Original, 1:1, 4:5, 9:16, 16:9, 3:4, 4:3',
      'Precision': 'Mathematical coordinate transform preserving original pixel clarity',
      'Overlay Grid': 'Rule-of-Thirds compositional grid',
    },
    useCases: [
      'Framing landscape photos for Instagram feed (4:5) or post (1:1)',
      'Cropping banners for LinkedIn, Twitter, and Facebook headers',
      'Reframing portraits and product shots for digital marketplaces',
    ],
    faqs: [
      {
        question: 'Does cropping reduce photo quality?',
        answer: 'No, EverydayCut crops using exact mathematical coordinate transforms preserving 100% of your source pixel fidelity.',
      },
      {
        question: 'Can I crop to custom aspect ratios?',
        answer: 'Yes, select Original or standard ratios, and scale/reposition your photo freely on the stage.',
      },
    ],
    relatedTools: [
      { name: 'Instagram Story Resizer', slug: 'instagram-story-resizer' },
      { name: 'YouTube Thumbnail Pop-Out', slug: 'youtube-thumbnail-popout' },
    ],
  },

  blur_bokeh: {
    presetId: 'blur_bokeh',
    slug: 'blur-background-bokeh',
    title: 'Free Background Blur & DSLR Bokeh Simulator - EverydayCut',
    metaDescription: 'Apply realistic DSLR shallow depth of field to portraits and product photos. Keep your subject pin-sharp while softly blurring the background.',
    h1: 'Free Background Blur & DSLR Bokeh Studio',
    h2: 'Shallow Depth of Field Simulation for Studio Photography',
    keywords: ['blur background of photo', 'dslr bokeh effect online', 'portrait mode background blur', 'blur photo background free'],
    howToSteps: [
      'Upload a portrait or product photo.',
      'Our dual-layer engine isolates the subject on the foreground while keeping the original photo in the background.',
      'Adjust the Background Blur slider to your desired depth-of-field intensity (1px to 40px).',
      'The subject stays pin-sharp while the background dissolves into soft, cinematic bokeh.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Layer Composition': 'Dual-layer (Sharp Foreground Cutout + Blurred Background Original)',
      'Blur Range': '0px to 40px Gaussian blur on background layer',
      'Subject Protection': 'Zero blur bleed onto foreground subject',
    },
    useCases: [
      'Simulating $1,000+ f/1.4 camera lenses on mobile phone photos',
      'Professional portrait mode enhancement for LinkedIn headshots',
      'Product photography depth separation for luxury items',
    ],
    faqs: [
      {
        question: 'How does EverydayCut blur only the background while keeping the subject sharp?',
        answer: 'EverydayCut uses a two-layer composition: the original photo sits on the background layer with adjustable blur, while an AI cutout of the subject is locked at zero blur on top, perfectly preserving subject sharpness.',
      },
      {
        question: 'Can I control the amount of background blur?',
        answer: 'Yes, adjust blur intensity from 0px to 40px using the real-time slider in the Filters tab.',
      },
      {
        question: 'Does the blur look realistic like a DSLR lens?',
        answer: 'Yes, our Gaussian blur simulates natural optical bokeh and depth falloff without the harsh digital halos common in mobile phone cameras.',
      },
    ],
    relatedTools: [
      { name: 'Background Remover', slug: 'background-remover' },
      { name: 'Studio Shadows & Lighting', slug: 'studio-shadows-lighting' },
    ],
  },

  studio_shadow: {
    presetId: 'studio_shadow',
    slug: 'studio-shadows-lighting',
    title: 'Studio Shadows & Lighting Generator: Drop & Contact Shadows',
    metaDescription: 'Add realistic ambient contact shadows, floating drop shadows, or studio lighting to cutout objects with full control over blur, angle, and color.',
    h1: 'Studio Shadows & Ambient Lighting Studio',
    h2: 'Synthesize Natural Ground Shadows for Products & Apparel',
    keywords: ['add drop shadow to transparent png', 'add shadow to cutout online', 'realistic contact shadow generator', 'product shadow maker'],
    howToSteps: [
      'Upload a product image or transparent cutout PNG.',
      'Choose between Directional Drop Shadow or Ambient Soft Ground Shadow.',
      'Fine-tune horizontal offset, vertical offset, blur radius, opacity, and shadow color.',
      'Export professional studio-lit product ready for your storefront.',
    ],
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    specs: {
      'Shadow Models': 'Directional Drop Shadow, Ambient Ground Contact Shadow',
      'Controls': 'X offset (-50 to +50), Y offset (-50 to +50), Blur (0 to 60), Opacity (0.0 to 1.0)',
      'Shadow Color': 'Full hex color picker with opacity modulation',
    },
    useCases: [
      'Grounding floating product cutouts for e-commerce listings',
      'Creating elevated 3D pop-out effects for social media banners',
      'Adding studio lighting depth to footwear, electronics, and bottles',
    ],
    faqs: [
      {
        question: 'What is the difference between drop shadow and soft shadow?',
        answer: 'A drop shadow casts a directional offset shadow behind the subject, while a soft shadow simulates an ambient ground contact blur beneath the subject.',
      },
      {
        question: 'Can I add shadows to transparent PNG files I already cut out?',
        answer: 'Yes! Simply upload your transparent PNG and the shadow engine will immediately compute the shadow boundary from your image\'s alpha contour.',
      },
    ],
    relatedTools: [
      { name: 'Shopify Product Studio', slug: 'shopify-product-studio' },
      { name: 'Background Blur Studio', slug: 'blur-background-bokeh' },
    ],
  },
};
