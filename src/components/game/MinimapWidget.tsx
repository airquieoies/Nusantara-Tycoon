import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { STAGE1_DISTRICTS } from '../../game/stage1Data';
import {
  STAGE1_MAX_X,
  STAGE1_MAX_Z,
  STAGE1_MIN_X,
  STAGE1_MIN_Z,
  STAGE1_SHORELINE_X,
} from '../../game/stage1Physics';
import { STAGE2_DISTRICTS } from '../../game/stage2Data';
import {
  STAGE2_MAX_X,
  STAGE2_MAX_Z,
  STAGE2_MIN_X,
  STAGE2_MIN_Z,
  STAGE2_RAIL_X,
  STAGE2_SHORELINE_X,
} from '../../game/stage2Physics';

import { STAGE3_DISTRICTS } from '../../game/stage3Data';
import {
  STAGE3_MAX_X,
  STAGE3_MAX_Z,
  STAGE3_MIN_X,
  STAGE3_MIN_Z,
  STAGE3_MONORAIL_X,
  STAGE3_SHORELINE_X,
} from '../../game/stage3Physics';
import { StageNumber } from '../../game/types';

interface MinimapWidgetProps {
  activeStage?: StageNumber;
  playerX: number;
  playerZ: number;
  facingYaw: number;
  discoveredDistricts: string[];
  questTarget?: { x: number; z: number; label: string } | null;
  onOpenWorldMap: () => void;
}

const W = 148;
const H = 148;

export const MinimapWidget: React.FC<MinimapWidgetProps> = ({
  activeStage = 1,
  playerX,
  playerZ,
  discoveredDistricts,
  questTarget,
  onOpenWorldMap,
}) => {
  const minX = activeStage === 3 ? STAGE3_MIN_X : activeStage === 2 ? STAGE2_MIN_X : STAGE1_MIN_X;
  const maxX = activeStage === 3 ? STAGE3_MAX_X : activeStage === 2 ? STAGE2_MAX_X : STAGE1_MAX_X;
  const minZ = activeStage === 3 ? STAGE3_MIN_Z : activeStage === 2 ? STAGE2_MIN_Z : STAGE1_MIN_Z;
  const maxZ = activeStage === 3 ? STAGE3_MAX_Z : activeStage === 2 ? STAGE2_MAX_Z : STAGE1_MAX_Z;
  const shoreVal =
    activeStage === 3 ? STAGE3_SHORELINE_X : activeStage === 2 ? STAGE2_SHORELINE_X : STAGE1_SHORELINE_X;
  const districts =
    activeStage === 3 ? STAGE3_DISTRICTS : activeStage === 2 ? STAGE2_DISTRICTS : STAGE1_DISTRICTS;

  const toSvgX = (wx: number) => ((wx - minX) / (maxX - minX)) * W;
  const toSvgY = (wz: number) => ((wz - minZ) / (maxZ - minZ)) * H;

  const px = Math.max(4, Math.min(W - 4, toSvgX(playerX)));
  const py = Math.max(4, Math.min(H - 4, toSvgY(playerZ)));
  const shoreX = toSvgX(shoreVal);

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-1.5">
      <button
        type="button"
        data-testid="minimap-open-btn"
        onClick={onOpenWorldMap}
        title="Buka Peta Dunia [M]"
        className="group relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-slate-950/95 shadow-2xl transition-colors hover:border-amber-300"
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block">
          {/* Land */}
          <rect
            x={0}
            y={0}
            width={shoreX}
            height={H}
            fill={activeStage === 3 ? '#0f172a' : activeStage === 2 ? '#1e293b' : '#253b28'}
          />
          {/* Ocean */}
          <rect x={shoreX} y={0} width={W - shoreX} height={H} fill="#0c4a6e" />

          {/* River (Stage 1 & 2) */}
          {activeStage === 1 ? (
            <>
              <rect
                x={toSvgX(-61.5)}
                y={toSvgY(-46)}
                width={toSvgX(-54.5) - toSvgX(-61.5)}
                height={toSvgY(59) - toSvgY(-46)}
                fill="#0284c7"
              />
              <rect
                x={toSvgX(-61.5)}
                y={toSvgY(52.5)}
                width={shoreX - toSvgX(-61.5)}
                height={toSvgY(59.5) - toSvgY(52.5)}
                fill="#0284c7"
              />
            </>
          ) : activeStage === 2 ? (
            <>
              <rect
                x={toSvgX(-61.5)}
                y={toSvgY(12)}
                width={toSvgX(-54.5) - toSvgX(-61.5)}
                height={toSvgY(77) - toSvgY(12)}
                fill="#0284c7"
              />
              <rect
                x={toSvgX(-61.5)}
                y={toSvgY(70)}
                width={shoreX - toSvgX(-61.5)}
                height={toSvgY(77) - toSvgY(70)}
                fill="#0284c7"
              />
            </>
          ) : (
            <rect
              x={shoreX}
              y={toSvgY(50)}
              width={Math.max(4, toSvgX(104) - shoreX)}
              height={Math.max(4, toSvgY(62) - toSvgY(50))}
              fill="#38bdf8"
              fillOpacity={0.45}
            />
          )}

          {/* District Rects */}
          {districts.map((d) => {
            const dx = toSvgX(d.minX);
            const dy = toSvgY(d.minZ);
            const dw = Math.max(8, toSvgX(Math.min(d.maxX, maxX)) - dx);
            const dh = Math.max(8, toSvgY(Math.min(d.maxZ, maxZ)) - dy);
            const known = discoveredDistricts.includes(d.id);
            return (
              <rect
                key={d.id}
                x={dx}
                y={dy}
                width={dw}
                height={dh}
                fill={known ? d.colorHex : '#334155'}
                fillOpacity={known ? 0.14 : 0.25}
                stroke={known ? d.colorHex : '#475569'}
                strokeOpacity={0.4}
                strokeWidth={0.7}
              />
            );
          })}

          {/* Main Roads */}
          <line x1={toSvgX(-80)} y1={toSvgY(0)} x2={shoreX} y2={toSvgY(0)} stroke="#cbd5e1" strokeOpacity={0.45} strokeWidth={1.6} />
          <line x1={toSvgX(0)} y1={toSvgY(-76)} x2={toSvgX(0)} y2={toSvgY(78)} stroke="#cbd5e1" strokeOpacity={0.45} strokeWidth={1.6} />

          {activeStage === 3 ? (
            <>
              <line
                x1={toSvgX(STAGE3_MONORAIL_X)}
                y1={0}
                x2={toSvgX(STAGE3_MONORAIL_X)}
                y2={H}
                stroke="#22d3ee"
                strokeDasharray="3 2"
                strokeWidth={1.3}
              />
              <line
                x1={toSvgX(-42)}
                y1={toSvgY(-13)}
                x2={toSvgX(42)}
                y2={toSvgY(-13)}
                stroke="#38bdf8"
                strokeOpacity={0.7}
                strokeWidth={1.5}
              />
            </>
          ) : activeStage === 2 ? (
            <line
              x1={toSvgX(STAGE2_RAIL_X)}
              y1={0}
              x2={toSvgX(STAGE2_RAIL_X)}
              y2={H}
              stroke="#fbbf24"
              strokeDasharray="3 2"
              strokeWidth={1.2}
            />
          ) : (
            <circle cx={toSvgX(130)} cy={toSvgY(-22)} r={5} fill="#a3a375" />
          )}

          {/* Quest Waypoint */}
          {questTarget && (
            <g>
              <circle
                cx={Math.max(5, Math.min(W - 5, toSvgX(questTarget.x)))}
                cy={Math.max(5, Math.min(H - 5, toSvgY(questTarget.z)))}
                r={5.5}
                fill="#f59e0b"
                fillOpacity={0.35}
              />
              <circle
                cx={Math.max(5, Math.min(W - 5, toSvgX(questTarget.x)))}
                cy={Math.max(5, Math.min(H - 5, toSvgY(questTarget.z)))}
                r={2.8}
                fill="#fbbf24"
                stroke="#ffffff"
                strokeWidth={0.8}
              />
            </g>
          )}

          {/* Player Marker */}
          <circle cx={px} cy={py} r={4.2} fill="#34d399" stroke="#ffffff" strokeWidth={1.4} />
        </svg>

        <div className="flex items-center justify-between border-t border-white/10 bg-slate-900/95 px-2.5 py-1 text-[10px] font-bold text-amber-300">
          <span className="flex items-center gap-1">
            <MapIcon className="h-3 w-3" />
            Peta [M]
          </span>
          <span className="text-slate-300">
            {discoveredDistricts.length}/{districts.length} Area
          </span>
        </div>
      </button>
    </div>
  );
};
