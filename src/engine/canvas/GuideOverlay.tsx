import React from 'react';
import { GuideOverlayType } from '../state/types.ts';

interface GuideOverlayProps {
  type: GuideOverlayType;
  width: number;
  height: number;
}

export const GuideOverlay: React.FC<GuideOverlayProps> = ({ type, width, height }) => {
  if (type === 'none') return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden"
      style={{ width, height }}
    >
      {/* 1. PAN Card Photo Face Guide (UTIITSL & NSDL) */}
      {type === 'pan_face' && (
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle darkened vignette around face */}
          <defs>
            <mask id="face-mask">
              <rect width="100%" height="100%" fill="white" />
              <ellipse
                cx={width / 2}
                cy={height * 0.48}
                rx={width * 0.3}
                ry={height * 0.38}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.35)"
            mask="url(#face-mask)"
          />

          {/* Oval contour for face */}
          <ellipse
            cx={width / 2}
            cy={height * 0.48}
            rx={width * 0.3}
            ry={height * 0.38}
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Eye Level Guideline */}
          <line
            x1={width * 0.28}
            y1={height * 0.42}
            x2={width * 0.72}
            y2={height * 0.42}
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Center Vertical Guideline */}
          <line
            x1={width / 2}
            y1={height * 0.15}
            x2={width / 2}
            y2={height * 0.85}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Label Badge */}
          <rect
            x={width / 2 - 45}
            y={height * 0.04}
            width="90"
            height="18"
            rx="9"
            fill="rgba(0, 0, 0, 0.7)"
          />
          <text
            x={width / 2}
            y={height * 0.04 + 12}
            fill="#22c55e"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            PAN FACE GUIDE
          </text>
        </svg>
      )}

      {/* 2. PAN Card Signature Cropper Guide */}
      {type === 'pan_signature' && (
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Safe Margin Box (80% box) */}
          <rect
            x={width * 0.06}
            y={height * 0.1}
            width={width * 0.88}
            height={height * 0.8}
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            rx="4"
          />

          {/* Horizontal Signature Baseline */}
          <line
            x1={width * 0.08}
            y1={height * 0.65}
            x2={width * 0.92}
            y2={height * 0.65}
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Corner Crosshairs */}
          <path
            d={`
              M ${width * 0.06 + 10} ${height * 0.1} H ${width * 0.06} V ${height * 0.1 + 10}
              M ${width * 0.94 - 10} ${height * 0.1} H ${width * 0.94} V ${height * 0.1 + 10}
              M ${width * 0.06 + 10} ${height * 0.9} H ${width * 0.06} V ${height * 0.9 - 10}
              M ${width * 0.94 - 10} ${height * 0.9} H ${width * 0.94} V ${height * 0.9 - 10}
            `}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
          />

          {/* Label Badge */}
          <rect
            x={width / 2 - 55}
            y={4}
            width="110"
            height="18"
            rx="9"
            fill="rgba(0, 0, 0, 0.75)"
          />
          <text
            x={width / 2}
            y={16}
            fill="#22c55e"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            SIGNATURE MARGIN
          </text>
        </svg>
      )}

      {/* 3. Passport Biometric Photo Guide */}
      {type === 'passport_biometric' && (
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head Crown Guide */}
          <line
            x1={width * 0.15}
            y1={height * 0.12}
            x2={width * 0.85}
            y2={height * 0.12}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          {/* Chin Guide */}
          <line
            x1={width * 0.2}
            y1={height * 0.82}
            x2={width * 0.8}
            y2={height * 0.82}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          {/* Oval */}
          <ellipse
            cx={width / 2}
            cy={height * 0.46}
            rx={width * 0.28}
            ry={height * 0.35}
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <rect
            x={width / 2 - 50}
            y={height * 0.02}
            width="100"
            height="16"
            rx="8"
            fill="rgba(0, 0, 0, 0.75)"
          />
          <text
            x={width / 2}
            y={height * 0.02 + 11}
            fill="#22c55e"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            PASSPORT 70-80%
          </text>
        </svg>
      )}

      {/* 4. Profile Picture Circular Crop Guide */}
      {type === 'circle_pfp' && (
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="pfp-mask">
              <rect width="100%" height="100%" fill="white" />
              <circle cx={width / 2} cy={height / 2} r={Math.min(width, height) * 0.44} fill="black" />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.5)"
            mask="url(#pfp-mask)"
          />
          <circle
            cx={width / 2}
            cy={height / 2}
            r={Math.min(width, height) * 0.44}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        </svg>
      )}

      {/* 5. Amazon 85% Frame Rule Guide */}
      {type === 'amazon_margin' && (
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x={width * 0.075}
            y={height * 0.075}
            width={width * 0.85}
            height={height * 0.85}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <rect
            x={width / 2 - 50}
            y={height * 0.075 - 10}
            width="100"
            height="18"
            rx="9"
            fill="rgba(0, 0, 0, 0.75)"
          />
          <text
            x={width / 2}
            y={height * 0.075 + 2}
            fill="#f59e0b"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            AMAZON 85% RULE
          </text>
        </svg>
      )}
    </div>
  );
};
