export type AspectRatioPreset = 'original' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '4:3';

export interface AspectRatioConfig {
  id: AspectRatioPreset;
  label: string;
  ratio: number | null; // width / height; null = natural/original
  icon?: string;
}

export type BackgroundFillType = 'transparent' | 'solid' | 'gradient';

export interface GradientConfig {
  style?: 'linear' | 'radial';
  startColor: string;
  midColor?: string;
  endColor: string;
  angle: number; // in degrees, e.g. 135
}

export interface BackgroundFill {
  type: BackgroundFillType;
  color: string;
  gradient: GradientConfig;
}

export type ShadowType = 'none' | 'drop_shadow' | 'soft_shadow';

export interface ShadowSettings {
  type: ShadowType;
  color: string;
  blur: number;      // 0 - 60
  x: number;         // -50 to 50
  y: number;         // -50 to 50
  opacity: number;   // 0.0 - 1.0
}

export interface FilterSettings {
  brightness: number;  // -100 to 100
  contrast: number;    // -100 to 100
  saturation: number;  // -100 to 100
  blur: number;        // 0 to 40
}

export type LayerType = 'image' | 'text';

export type BadgeStyle = 'none' | 'pill' | 'solid' | 'outline';

export interface TextConfig {
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: string;
  align: 'left' | 'center' | 'right';
  badgeStyle: BadgeStyle;
  badgeColor: string;
  badgePadding: number;
}

export interface Layer {
  id: string;
  type?: LayerType; // 'image' | 'text', default 'image'
  name: string;
  src?: string; // for image
  textConfig?: TextConfig; // for text
  originalWidth: number;
  originalHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  shadow: ShadowSettings;
  filters: FilterSettings;
  visible: boolean;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface SegmentationProgress {
  status: 'idle' | 'loading_model' | 'processing' | 'done' | 'error';
  progress: number; // 0 to 100
  message: string;
}

export type EditorMode = 'select' | 'eraser';

export type ToolPresetId =
  | 'crop'
  | 'cutout'
  | 'eraser'
  | 'upscale'
  | 'batch'
  | 'amazon'
  | 'shopify'
  | 'etsy'
  | 'badges'
  | 'pfp_maker'
  | 'instagram_story'
  | 'youtube_thumb'
  | 'pinterest'
  | 'pan_photo'
  | 'pan_signature'
  | 'passport'
  | 'blur_bokeh'
  | 'studio_shadow'
  | 'converter';

export type GuideOverlayType =
  | 'none'
  | 'pan_face'
  | 'pan_signature'
  | 'passport_biometric'
  | 'circle_pfp'
  | 'amazon_margin'
  | 'rule_of_thirds';

