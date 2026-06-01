import React from 'react';
import { Camarote } from '../types';

interface FloorPlanMapProps {
  activeCamarotes: Camarote[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  mode: 'admin' | 'client';
  ownCabinSlug?: string;
}

export const FloorPlanMap: React.FC<FloorPlanMapProps> = ({
  activeCamarotes,
  selectedSlug,
  onSelect,
  mode,
  ownCabinSlug
}) => {
  // Helper to find if a slot is active
  const getActiveCamarote = (slug: string): Camarote | undefined => {
    return activeCamarotes.find(c => c.slug === slug && c.isActive !== false);
  };

  // Booth definitions
  const booths = [
    { id: 'c1', name: 'C1', slug: 'c1', x: 30, y: 230, width: 190, height: 160, color: '#0B4F93', gradId: 'grad-c1-c2' },
    { id: 'c2', name: 'C2', slug: 'c2', x: 30, y: 400, width: 190, height: 170, color: '#0B4F93', gradId: 'grad-c1-c2' },
    { id: 'c6', name: 'C6', slug: 'c6', x: 590, y: 120, width: 110, height: 140, color: '#562365', gradId: 'grad-c6-c7-c8' },
    { id: 'c7', name: 'C7', slug: 'c7', x: 590, y: 270, width: 110, height: 140, color: '#562365', gradId: 'grad-c6-c7-c8' },
    { id: 'c8', name: 'C8', slug: 'c8', x: 590, y: 420, width: 110, height: 150, color: '#562365', gradId: 'grad-c6-c7-c8' },
    { id: 'c5', name: 'C5', slug: 'c5', x: 710, y: 30, width: 110, height: 170, color: '#006B3E', gradId: 'grad-c3-c4-c5' },
    { id: 'c4', name: 'C4', slug: 'c4', x: 710, y: 210, width: 110, height: 170, color: '#006B3E', gradId: 'grad-c3-c4-c5' },
    { id: 'c3', name: 'C3', slug: 'c3', x: 710, y: 390, width: 110, height: 180, color: '#006B3E', gradId: 'grad-c3-c4-c5' },
  ];

  // Grid for the 18 Tables in the center
  const tables = [];
  const colX = [280, 400, 520];
  const rowY = [165, 235, 305, 375, 445, 515];
  
  let tableIndex = 1;
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 6; row++) {
      tables.push({
        id: `t${tableIndex}`,
        name: `Mesa ${tableIndex}`,
        slug: `mesa-${tableIndex}`,
        cx: colX[col],
        cy: rowY[row],
        r: 18
      });
      tableIndex++;
    }
  }

  const renderBooth = (booth: typeof booths[0]) => {
    const activeData = getActiveCamarote(booth.slug);
    const isActive = !!activeData;
    const isSelected = selectedSlug === booth.slug;
    const isOwn = ownCabinSlug === booth.slug;

    // In client mode, cannot select own cabin or inactive cabins (unless it's admin)
    const isDisabled = mode === 'client' && (isOwn || !isActive);

    let fillColor = `url(#${booth.gradId})`;
    let strokeColor = '#FFFFFF';
    let strokeWidth = isSelected ? 4 : 1.5;
    let strokeDash = undefined;
    let opacity = 1;

    if (isActive) {
      if (isSelected) {
        strokeColor = '#F59E0B'; // Golden highlight
        strokeWidth = 4;
      } else {
        strokeColor = 'rgba(255, 255, 255, 0.7)';
      }
    } else {
      fillColor = 'url(#grad-vacant)';
      strokeColor = 'rgba(255, 255, 255, 0.15)';
      strokeDash = '6 4';
      strokeWidth = isSelected ? 4 : 1.5;
    }

    if (isDisabled) {
      opacity = 0.3;
    }

    return (
      <g
        key={booth.id}
        onClick={() => !isDisabled && onSelect(booth.slug)}
        className={`${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} transition-all duration-300 select-none`}
      >
        <rect
          x={booth.x}
          y={booth.y}
          width={booth.width}
          height={booth.height}
          rx={16}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          opacity={opacity}
          className="transition-all duration-300"
          style={{
            filter: isActive && !isDisabled ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' : 'none',
          }}
        />
        {/* Glow effect for active & selected booths */}
        {isActive && !isDisabled && (
          <rect
            x={booth.x}
            y={booth.y}
            width={booth.width}
            height={booth.height}
            rx={16}
            fill="none"
            stroke={isSelected ? '#F59E0B' : booth.color}
            strokeWidth={isSelected ? 6 : 3}
            className="animate-pulse"
            opacity={isSelected ? 0.6 : 0.3}
          />
        )}
        <text
          x={booth.x + booth.width / 2}
          y={booth.y + booth.height / 2 + (isActive && activeData ? -2 : 6)}
          textAnchor="middle"
          fill={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
          className="font-display font-black text-2xl tracking-wider select-none pointer-events-none"
        >
          {booth.name}
        </text>
        {/* Sub-label showing current bill / consumption status */}
        {isActive && activeData && (
          <text
            x={booth.x + booth.width / 2}
            y={booth.y + booth.height / 2 + 22}
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            className="text-[10px] font-display font-bold tracking-widest select-none pointer-events-none"
          >
            R$ {Math.floor(activeData.totalSpent)}
          </text>
        )}
      </g>
    );
  };

  const renderTable = (table: typeof tables[0]) => {
    const activeData = getActiveCamarote(table.slug);
    const isActive = !!activeData;
    const isSelected = selectedSlug === table.slug;
    const isOwn = ownCabinSlug === table.slug;

    const isDisabled = mode === 'client' && (isOwn || !isActive);

    let fillColor = 'url(#grad-vacant)';
    let strokeColor = 'rgba(255,255,255,0.15)';
    let strokeWidth = isSelected ? 3 : 1.5;
    let strokeDash = '4 3';
    let opacity = 1;

    if (isActive) {
      fillColor = 'url(#grad-table-active)';
      strokeColor = isSelected ? '#FFFFFF' : '#D97706';
      strokeWidth = isSelected ? 3 : 1.5;
      strokeDash = undefined;
    }

    if (isDisabled) {
      opacity = 0.3;
    }

    // Chair positions at 0, 90, 180, 270 degrees
    const rChair = 4.5;
    const dChair = table.r + 6;
    const chairs = [
      { cx: table.cx + dChair, cy: table.cy },
      { cx: table.cx - dChair, cy: table.cy },
      { cx: table.cx, cy: table.cy + dChair },
      { cx: table.cx, cy: table.cy - dChair },
    ];

    return (
      <g
        key={table.id}
        onClick={() => !isDisabled && onSelect(table.slug)}
        className={`${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} transition-all duration-300 select-none`}
      >
        {/* Render chairs around the table */}
        {chairs.map((chair, idx) => (
          <circle
            key={idx}
            cx={chair.cx}
            cy={chair.cy}
            r={rChair}
            fill={isActive ? '#F59E0B' : 'rgba(255,255,255,0.1)'}
            stroke={isActive ? '#D97706' : 'rgba(255,255,255,0.15)'}
            strokeWidth={1}
            opacity={opacity}
            className="transition-all duration-300"
          />
        ))}

        {/* Main table circle */}
        <circle
          cx={table.cx}
          cy={table.cy}
          r={table.r}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          opacity={opacity}
          className="transition-all duration-300"
          style={{
            filter: isActive && !isDisabled ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'none',
          }}
        />
        {isActive && !isDisabled && (
          <circle
            cx={table.cx}
            cy={table.cy}
            r={table.r + 3}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={1.5}
            className="animate-pulse"
            opacity={0.4}
          />
        )}
        <text
          x={table.cx}
          y={table.cy + 3.5}
          textAnchor="middle"
          fill={isActive ? '#000000' : 'rgba(255,255,255,0.3)'}
          className="text-[10px] font-display font-black select-none pointer-events-none"
        >
          {table.id.substring(1)}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-black/40 border border-white/5 p-4 rounded-[2rem] backdrop-blur-xl">
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-auto select-none"
        style={{ contentVisibility: 'auto' }}
      >
        <defs>
          {/* Gradients for active cabins */}
          <linearGradient id="grad-c1-c2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B4F93" />
            <stop offset="100%" stopColor="#1D7BD7" />
          </linearGradient>
          <linearGradient id="grad-c6-c7-c8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#562365" />
            <stop offset="100%" stopColor="#8A3FA1" />
          </linearGradient>
          <linearGradient id="grad-c3-c4-c5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#006B3E" />
            <stop offset="100%" stopColor="#00B064" />
          </linearGradient>
          
          {/* Gradient for active tables */}
          <linearGradient id="grad-table-active" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Gradient for vacant areas */}
          <linearGradient id="grad-vacant" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.01)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
          </linearGradient>

          {/* Stage gradient */}
          <linearGradient id="grad-palco" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFF8E7" />
          </linearGradient>

          {/* Bar gradient */}
          <linearGradient id="grad-bar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#FF9F1C" />
          </linearGradient>
        </defs>

        {/* Outer frame matching the image */}
        <rect
          x={10}
          y={10}
          width={980}
          height={580}
          rx={40}
          ry={40}
          fill="#0D0D0F"
          stroke="#1F1F24"
          strokeWidth={8}
        />

        {/* PALCO (Stage) */}
        <g>
          <rect
            x={220}
            y={30}
            width={480}
            height={80}
            rx={16}
            fill="url(#grad-palco)"
            stroke="#FFFFFF"
            strokeWidth={1.5}
            style={{ filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.1))' }}
          />
          <text
            x={460}
            y={80}
            textAnchor="middle"
            fill="#000000"
            className="font-display font-black text-3xl tracking-[0.25em]"
          >
            PALCO
          </text>
        </g>

        {/* Top-Left Grey Area */}
        <rect
          x={30}
          y={30}
          width={190}
          height={190}
          rx={16}
          fill="#3F3F46"
          opacity={0.05}
        />

        {/* Main central table container grey background */}
        <rect
          x={220}
          y={120}
          width={360}
          height={450}
          rx={16}
          fill="#27272A"
          opacity={0.05}
        />

        {/* Render C1 and C2 */}
        {booths.filter(b => b.id === 'c1' || b.id === 'c2').map(renderBooth)}

        {/* Render 18 Tables */}
        {tables.map(renderTable)}

        {/* Render C6, C7, C8 */}
        {booths.filter(b => ['c6', 'c7', 'c8'].includes(b.id)).map(renderBooth)}

        {/* Render C5, C4, C3 */}
        {booths.filter(b => ['c3', 'c4', 'c5'].includes(b.id)).map(renderBooth)}

        {/* BAR Area */}
        <g>
          <path
            d="M 830,30 L 970,30 L 970,570 L 710,570 L 710,480 L 830,480 Z"
            fill="url(#grad-bar)"
            stroke="#FFFFFF"
            strokeWidth={1.5}
            style={{ filter: 'drop-shadow(0 6px 12px rgba(234,88,12,0.2))' }}
          />
          <text
            x={850}
            y={535}
            textAnchor="middle"
            fill="#000000"
            className="font-display font-black text-4xl tracking-[0.1em]"
          >
            BAR
          </text>
        </g>
      </svg>

      {/* Map Legend */}
      <div className="flex flex-wrap gap-4 items-center justify-center mt-4 pt-4 border-t border-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-zinc-900 border border-zinc-700 border-dashed rounded-sm" />
          <span>Vago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 border border-white rounded-sm" />
          <span>Camarote Ativo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 border border-amber-600 rounded-full" />
          <span>Mesa Ativa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-zinc-950 border border-amber-500 rounded-sm animate-pulse" />
          <span>Selecionado</span>
        </div>
      </div>
    </div>
  );
};
