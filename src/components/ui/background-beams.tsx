"use client";
import React from "react";
import { cn } from "../../lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 h-full w-full overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        fill="none"
        className="absolute inset-0 h-full w-full"
      >
        <g opacity="0.4">
          {/* Main diagonal beams */}
          <path d="M-100 100L1540 800" stroke="url(#beam-gradient-1)" strokeWidth="2" strokeLinecap="round" />
          <path d="M1540 100L-100 800" stroke="url(#beam-gradient-2)" strokeWidth="2" strokeLinecap="round" />
          
          {/* Vertical and horizontal beams */}
          <path d="M720 -100V1000" stroke="url(#beam-gradient-3)" strokeWidth="1" strokeLinecap="round" />
          <path d="M-100 450H1540" stroke="url(#beam-gradient-4)" strokeWidth="1" strokeLinecap="round" />
          
          {/* Secondary diagonal beams */}
          <path d="M200 -100L1240 1000" stroke="url(#beam-gradient-1)" strokeWidth="1" strokeLinecap="round" />
          <path d="M1240 -100L200 1000" stroke="url(#beam-gradient-2)" strokeWidth="1" strokeLinecap="round" />
          <path d="M0 0L1440 900" stroke="url(#beam-gradient-1)" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M1440 0L0 900" stroke="url(#beam-gradient-2)" strokeWidth="0.5" strokeLinecap="round" />
          
          {/* More subtle beams for depth */}
          <path d="M400 -100L1040 1000" stroke="url(#beam-gradient-3)" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M1040 -100L400 1000" stroke="url(#beam-gradient-4)" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M-100 200L1540 700" stroke="url(#beam-gradient-1)" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M1540 200L-100 700" stroke="url(#beam-gradient-2)" strokeWidth="0.5" strokeLinecap="round" />
        </g>
        <defs>
          <linearGradient id="beam-gradient-1" x1="-100" y1="100" x2="1540" y2="800" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E10600" stopOpacity="0" />
            <stop offset="0.5" stopColor="#E10600" />
            <stop offset="1" stopColor="#E10600" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam-gradient-2" x1="1540" y1="100" x2="-100" y2="800" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E10600" stopOpacity="0" />
            <stop offset="0.5" stopColor="#E10600" />
            <stop offset="1" stopColor="#E10600" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam-gradient-3" x1="720" y1="-100" x2="720" y2="1000" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam-gradient-4" x1="-100" y1="450" x2="1540" y2="450" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,6,0,0.05),transparent_70%)]" />
    </div>
  );
};
