import { ToolPresetId } from '../engine/state/types.ts';

export interface ToolSEOEntry {
  presetId: ToolPresetId;
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  h2: string;
  keywords: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export const SEO_TOOL_REGISTRY: Record<ToolPresetId, ToolSEOEntry> = {
  cutout: {
    presetId: 'cutout',
    slug: 'background-remover',
    title: 'Free AI Background Remover Online (No Sign-Up) - EverydayCut',
    metaDescription: 'Remove image backgrounds in 1 second with 100% in-browser AI. Free, private, unlimited HD exports with zero cloud uploads or data tracking.',
    h1: '100% Free In-Browser AI Background Remover',
    h2: 'Instant Transparent Cutouts in 4K Resolution With Zero Cloud Transmission',
    keywords: ['remove background', 'background remover online', 'free background eraser', 'transparent png maker', 'cutout photo', 'pixelcut alternative free'],
    faqs: [
      {
        question: 'Is this background remover completely free?',
        answer: 'Yes, EverydayCut is 100% free and open-source. There are no subscriptions, credits, daily limits, or watermarks.',
      },
      {
        question: 'Are my photos uploaded to a cloud server?',
        answer: 'Never. Unlike Pixelcut or remove.bg, EverydayCut executes neural AI models directly inside your browser memory using WebGPU and WebAssembly. Your photos never leave your device.',
      },
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
    faqs: [
      {
        question: 'How does the in-browser Magic Eraser work?',
        answer: 'Our Fast Marching and Laplacian texture diffusion engine samples surrounding pixels to seamlessly reconstruct the background where the object was brushed away.',
      },
    ],
  },
  upscale: {
    presetId: 'upscale',
    slug: 'image-upscaler',
    title: 'Free 2x & 4x AI Image Upscaler Online - EverydayCut',
    metaDescription: 'Enhance low-resolution photos to crisp, ultra-HD 4K assets. High-precision unsharp masking and micro-texture clarity enhancement with zero cloud delay.',
    h1: 'Free 2x & 4x Super-Resolution Image Upscaler',
    h2: 'Sub-Pixel Clarity Enhancement Without Subscription Fees',
    keywords: ['image upscaler free', 'upscale photo 4k', 'photo enhancer online', 'super resolution web', 'unblur image'],
    faqs: [
      {
        question: 'What is the maximum resolution for upscaling?',
        answer: 'EverydayCut supports upscaling up to 4K resolution (4096px maximum dimension) directly in browser memory.',
      },
    ],
  },
  pan_photo: {
    presetId: 'pan_photo',
    slug: 'pan-card-photo-resizer',
    title: 'PAN Card Photo Resizer (213x213 px, <30 KB) - UTIITSL & NSDL Compliant',
    metaDescription: 'Crop and compress photo for PAN card online. Exact 213x213 pixels, 300 DPI, and guaranteed file size under 30 KB for UTIITSL and NSDL portals.',
    h1: 'PAN Card Photo Size 213x213 px Resizer',
    h2: 'Official UTIITSL & NSDL Biometric Portal Format Guarantee',
    keywords: ['pan card photo resizer', 'pan card photo size 213x213', 'pan card photo converter 300 dpi', 'nsdl photo resizer under 30kb', 'utiitsl photo cropping'],
    faqs: [
      {
        question: 'What is the official PAN card photo specification?',
        answer: 'UTIITSL and NSDL portals require exact 213x213 pixel dimensions at 300 DPI, with file size strictly between 10 KB and 30 KB.',
      },
      {
        question: 'Does EverydayCut guarantee approval on NSDL/UTIITSL?',
        answer: 'Yes, our PAN Photo preset automatically formats and compresses your image to meet all official government portal guidelines.',
      },
    ],
  },
  pan_signature: {
    presetId: 'pan_signature',
    slug: 'pan-card-signature-cropper',
    title: 'PAN Card Signature Resizer (400x200 px, <20 KB) - NSDL & UTIITSL',
    metaDescription: 'Crop PAN card signature to exact 400x200 pixels and compress under 20 KB. Automatic high-contrast ink thresholding to remove paper shadows.',
    h1: 'PAN Card Signature 400x200 px Cropper & Resizer',
    h2: 'High-Contrast Ink Thresholding with Guaranteed < 20 KB Export',
    keywords: ['pan card signature resizer', 'pan signature 400x200', 'pan card signature converter under 20kb', 'nsdl signature crop tool'],
    faqs: [
      {
        question: 'What is the required signature size for PAN card applications?',
        answer: 'The required format is 400x200 pixels (2:1 aspect ratio) with total file size under 20 KB in JPEG format.',
      },
    ],
  },
  passport: {
    presetId: 'passport',
    slug: 'passport-photo-maker',
    title: 'Free Passport & Visa Photo Maker (2x2 inch / 600x600 px) - EverydayCut',
    metaDescription: 'Create compliant biometric passport and visa photos online. Automatic white background replacement and official 70-80% face framing guidelines.',
    h1: 'Free Biometric Passport & Visa Photo Maker',
    h2: 'Standard 2x2 Inch (600x600 px) Formatting with Clean White Background',
    keywords: ['passport photo maker online', '2x2 photo maker', 'visa photo resizer', 'us visa photo white background', 'passport size photo maker free'],
    faqs: [
      {
        question: 'What are standard passport photo requirements?',
        answer: 'Most international passports (including US, India, UK, and Schengen) require a plain white background with face occupying 70% to 80% of total height.',
      },
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
    faqs: [
      {
        question: 'What is Amazon\'s main product image rule?',
        answer: 'Amazon requires a pure white background (RGB 255, 255, 255) with the product filling at least 85% of the frame.',
      },
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
    faqs: [
      {
        question: 'How do studio shadows improve product sales?',
        answer: 'Grounded contact shadows provide realistic depth perception, making digital listings feel tangible and premium.',
      },
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
    faqs: [
      {
        question: 'Can I add a custom colored background to my headshot?',
        answer: 'Yes, select from transparent, custom solid colors, or multi-stop gradients with a single click.',
      },
    ],
  },
  batch: {
    presetId: 'batch',
    slug: 'batch-background-remover',
    title: 'Free Batch Background Remover (.ZIP Download) - EverydayCut',
    metaDescription: 'Remove backgrounds from dozens of product photos in bulk. Zero server uploads, processed in parallel using client Web Workers and exported as a .ZIP.',
    h1: 'Free Batch Background Remover & Bulk Studio',
    h2: 'Process Hundreds of Photos Simultaneously With Zero Subscription Fees',
    keywords: ['batch background remover', 'bulk cutout photo', 'remove background multiple images', 'bulk png maker', 'free batch image background remover'],
    faqs: [
      {
        question: 'Is there a limit on how many photos I can batch process?',
        answer: 'No limit. Batch processing runs locally on your computer’s hardware, with all cutouts packaged into a single instant .ZIP download.',
      },
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
    faqs: [
      {
        question: 'Can I customize the badge text and color?',
        answer: 'Yes, change text content, badge style (pill, solid, outline), font size, and background colors with real-time canvas updates.',
      },
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
    faqs: [
      {
        question: 'What is the recommended photo aspect ratio for Etsy?',
        answer: 'Etsy recommends 4:3 or 1:1 square photos with high resolution so buyers can zoom into product details.',
      },
    ],
  },
  instagram_story: {
    presetId: 'instagram_story',
    slug: 'instagram-story-resizer',
    title: 'Instagram Story & Reel Resizer (9:16 Vertical, 1080x1920) - EverydayCut',
    metaDescription: 'Resize photos to 9:16 vertical (1080x1920) for Instagram Stories, Reels, and TikTok with smart blurred background padding.',
    h1: 'Instagram Story & Reel 9:16 Resizer',
    h2: 'Perfect 1080x1920 Vertical Framing Without Awkward Cropping',
    keywords: ['instagram story resizer', '9 16 photo resizer online', 'tiktok vertical photo maker', 'fit photo to instagram story without cropping'],
    faqs: [
      {
        question: 'How do I fit horizontal photos into a vertical 9:16 Story?',
        answer: 'EverydayCut centers your photo on a 9:16 vertical canvas and fills the outer space with custom gradients or blurred background padding.',
      },
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
    faqs: [
      {
        question: 'What is the official resolution for YouTube thumbnails?',
        answer: 'YouTube recommends 1920x1080 pixels (16:9 ratio) with a minimum width of 1280 pixels.',
      },
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
    faqs: [
      {
        question: 'What is the best aspect ratio for Pinterest pins?',
        answer: 'Pinterest strongly recommends a 2:3 aspect ratio (e.g. 1000 x 1500 pixels) to avoid pin truncation in feeds.',
      },
    ],
  },
  converter: {
    presetId: 'converter',
    slug: 'image-compressor-converter',
    title: 'Free Smart Image Compressor & Format Converter (PNG, JPEG, WEBP)',
    metaDescription: 'Convert between PNG, JPEG, and WEBP with precision KB budget compression. Target strict file size limits (<20KB, <30KB, <50KB) for job portals with zero cloud upload.',
    h1: 'Smart Image Compressor & Format Converter',
    h2: 'Target Strict File Size Budgets with Lossless WebGPU/WASM Precision',
    keywords: ['image compressor online', 'compress image to 20kb', 'png to jpeg converter', 'convert to webp online free', 'reduce image file size'],
    faqs: [
      {
        question: 'Can I target an exact file size in kilobytes?',
        answer: 'Yes, EverydayCut uses iterative binary rate-distortion search in browser memory to guarantee your exported image stays under your desired KB limit.',
      },
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
    faqs: [
      {
        question: 'Does cropping reduce photo quality?',
        answer: 'No, EverydayCut crops using exact mathematical coordinate transforms preserving 100% of your source pixel fidelity.',
      },
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
    faqs: [
      {
        question: 'Can I control the amount of background blur?',
        answer: 'Yes, adjust blur intensity from 1px to 40px using the real-time slider in the Adjust tab.',
      },
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
    faqs: [
      {
        question: 'What is the difference between drop shadow and soft shadow?',
        answer: 'A drop shadow casts a directional offset shadow behind the subject, while a soft shadow simulates a ground contact blur beneath the subject.',
      },
    ],
  },
};

export const getSEOEntryByPreset = (presetId?: ToolPresetId | null): ToolSEOEntry => {
  if (!presetId) return SEO_TOOL_REGISTRY['cutout'];
  return SEO_TOOL_REGISTRY[presetId] || SEO_TOOL_REGISTRY['cutout'];
};

export const getSEOEntryBySlug = (slug: string): ToolSEOEntry | undefined => {
  const cleanSlug = slug.replace(/^#?\/?/, '').trim();
  return Object.values(SEO_TOOL_REGISTRY).find((entry) => entry.slug === cleanSlug);
};

export const getPresetBySlug = (slug: string): ToolPresetId | undefined => {
  const entry = getSEOEntryBySlug(slug);
  return entry ? entry.presetId : undefined;
};

export const getAllSEOEntries = (): ToolSEOEntry[] => {
  return Object.values(SEO_TOOL_REGISTRY);
};

