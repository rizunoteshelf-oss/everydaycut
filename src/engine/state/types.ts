export type AspectRatioPreset = 'original' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '4:3';

export interface AspectRatioConfig {
  id: AspectRatioPreset;
  label: string;
  ratio: number | null; // width / height; null = natural/original
  icon?: string;
}

export type BackgroundFillType = 'transparent' | 'solid' | 'gradient';

export interface GradientConfig {
  startColor: string;
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
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  blur: number;       // 0 to 40
}

export interface Layer {
  id: string;
  name: string;
  src: string;
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
