import React from 'react';
import { CrackProps } from './types';

export const CrackOverlay: React.FC<CrackProps> = ({ isVisible, variant }) => {
  if (!isVisible) return null;

  // We render two paths per crack: one dark (shadow) and one light (highlight)
  // to simulate depth/thickness of the broken material.

  const getPath = () => {
    switch (variant) {
      case 1: // Top Right - Spiderweb style
        return 'M250 50 L220 80 L230 110 M220 80 L180 90 M220 80 L200 40';
      case 2: // Bottom Left - Long fracture
        return 'M20 400 L80 350 L120 380 L180 320';
      case 3: // Middle - Burst
        return 'M175 250 L120 200 M175 250 L230 220 M175 250 L160 310 M175 250 L210 290';
      case 4: // Connecting Shatter
        return 'M120 200 L80 350';
      default:
        return '';
    }
  };

  const d = getPath();

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-lg">
      <svg className="w-full h-full" viewBox="0 0 350 500" preserveAspectRatio="none">
        <defs>
          <filter id="crack-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow Layer (Offset slightly) */}
        <path
          d={d}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(1, 1)"
        />

        {/* Highlight Layer */}
        <path
          d={d}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#crack-glow)"
        />
      </svg>
    </div>
  );
};
