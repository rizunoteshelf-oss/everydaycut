import { ShadowSettings } from '../state/types.ts';

export function hexToRgba(hex: string, opacity: number = 1): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const clampedAlpha = Math.max(0, Math.min(1, opacity));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

export interface KonvaShadowAttrs {
  shadowEnabled: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
}

export function computeKonvaShadow(settings: ShadowSettings): KonvaShadowAttrs {
  if (settings.type === 'none' || settings.opacity <= 0) {
    return { shadowEnabled: false };
  }

  if (settings.type === 'drop_shadow') {
    const rgba = hexToRgba(settings.color, settings.opacity);
    return {
      shadowEnabled: true,
      shadowColor: rgba,
      shadowBlur: settings.blur,
      shadowOffsetX: settings.x,
      shadowOffsetY: settings.y,
      shadowOpacity: 1, // opacity already encoded in rgba
    };
  }

  // Soft shadow base setup
  const rgba = hexToRgba(settings.color, settings.opacity * 0.85);
  return {
    shadowEnabled: true,
    shadowColor: rgba,
    shadowBlur: settings.blur * 1.5,
    shadowOffsetX: settings.x,
    shadowOffsetY: settings.y * 1.25 + 5,
    shadowOpacity: 1,
  };
}
