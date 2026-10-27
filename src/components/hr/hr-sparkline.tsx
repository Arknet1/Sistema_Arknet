'use client';

import React, { useId } from 'react';

export interface HrSparklineProps {
  /** Array of numeric values to plot */
  data: number[];
  /** Width of the SVG in px */
  width?: number;
  /** Height of the SVG in px */
  height?: number;
  /** Stroke color (CSS value) */
  color?: string;
  /** Area fill color (CSS value, with alpha recommended) */
  fillColor?: string;
  /** Whether to show the end-point dot */
  showDot?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Inline SVG sparkline micro-chart.
 * Renders a smooth trend line with optional gradient area fill.
 */
export function HrSparkline({
  data,
  width = 100,
  height = 28,
  color = 'var(--hr-primary)',
  fillColor,
  showDot = true,
  className = '',
}: HrSparklineProps) {
  const gradientId = `sparkGrad-${useId().replace(/:/g, '')}`;

  if (!data || data.length < 2) {
    return <span className={`hr-sparkline ${className}`} style={{ width, height }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 3;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // Generate coordinate points
  const points = data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * innerW,
    y: padding + innerH - ((val - min) / range) * innerH,
  }));

  // Build smooth bezier path
  const linePath = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (point.x - prev.x) * 0.4;
    const cpx2 = point.x - (point.x - prev.x) * 0.4;
    return `${acc} C ${cpx1},${prev.y} ${cpx2},${point.y} ${point.x},${point.y}`;
  }, '');

  // Area path (closed below the line)
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;
  const lastPoint = points[points.length - 1];
  const effectiveFill = fillColor || color;

  return (
    <svg
      className={`hr-sparkline ${className}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={effectiveFill} stopOpacity="0.25" />
          <stop offset="100%" stopColor={effectiveFill} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path
        d={linePath}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hr-sparkline-line"
      />

      {/* End dot */}
      {showDot && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2.5"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}
