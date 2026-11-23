import React, { useEffect, useState } from 'react';
import { Compass, Lock, MapPin, Navigation, Ship, X } from 'lucide-react';
import { BUILDING_CATALOG } from '../../game/data/bermainData';
import { STAGE1_COLLECTIBLES, STAGE1_DISTRICTS, STAGE1_VEHICLES } from '../../game/stage1Data';
import {
  getStage1Npcs,
  STAGE1_MAX_X,
  STAGE1_MAX_Z,
  STAGE1_MIN_X,
  STAGE1_MIN_Z,
  STAGE1_SHORELINE_X,
} from '../../game/stage1Physics';
import { PlacedBuildingInstance } from '../../game/stage1WorldLogic';
import {
  STAGE2_COLLECTIBLES,
  STAGE2_DISTRICTS,
  STAGE2_ENTERABLE_BUILDINGS,
  STAGE2_VEHICLES,
} from '../../game/stage2Data';
import {
  getStage2Npcs,
  STAGE2_MAX_X,
  STAGE2_MAX_Z,
  STAGE2_MIN_X,
  STAGE2_MIN_Z,
  STAGE2_RAIL_X,
  STAGE2_SHORELINE_X,
} from '../../game/stage2Physics';

interface WorldMapModalProps {
  open: boolean;
  onClose: () => void;
  activeStage?: 1 | 2;
  playerX: number;
  playerZ: number;
  stage1PlayerPos?: { x: number; z: number };
  stage2PlayerPos?: { x: number; z: number };
  discoveredDistricts: string[];
  stage1Discovered?: string[];
  stage2Discovered?: string[];
  collectedArtifacts: string[];
  stage1Collected?: string[];
  stage2Collected?: string[];
  placedBuildings: PlacedBuildingInstance[];
  stage1Buildings?: PlacedBuildingInstance[];
  stage2Buildings?: PlacedBuildingInstance[];
  questTarget?: { x: number; z: number; label: string } | null;
  onTravelStage?: (targetStage: 1 | 2) => void;
}

const MAP_W = 680;
const MAP_H = 440;

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  open,
  onClose,
  activeStage = 1,
  playerX,
  playerZ,
  stage1PlayerPos,
  stage2PlayerPos,
  discoveredDistricts,
  stage1Discovered,
  stage2Discovered,
  collectedArtifacts,
  stage1Collected,
  stage2Collected,
  placedBuildings,
  stage1Buildings,
  stage2Buildings,
  questTarget,
  onTravelStage,
}) => {
  const [viewStage, setViewStage] = useState<1 | 2>(activeStage);

  useEffect(() => {
    if (open) setViewStage(activeStage);
  }, [open, activeStage]);

  if (!open) return null;

  const isStage2 = viewStage === 2;
  const minX = isStage2 ? STAGE2_MIN_X : STAGE1_MIN_X;
  const maxX = isStage2 ? STAGE2_MAX_X : STAGE1_MAX_X;
  const minZ = isStage2 ? STAGE2_MIN_Z : STAGE1_MIN_Z;
  const maxZ = isStage2 ? STAGE2_MAX_Z : STAGE1_MAX_Z;
  const shoreVal = isStage2 ? STAGE2_SHORELINE_X : STAGE1_SHORELINE_X;

  const toX = (wx: number) => ((wx - minX) / (maxX - minX)) * MAP_W;
  const toY = (wz: number) => ((wz - minZ) / (maxZ - minZ)) * MAP_H;

  const districts = isStage2 ? STAGE2_DISTRICTS : STAGE1_DISTRICTS;
  const npcs = isStage2 ? getStage2Npcs() : getStage1Npcs();
  const collectibles = isStage2 ? STAGE2_COLLECTIBLES : STAGE1_COLLECTIBLES;
  const vehicles = isStage2 ? STAGE2_VEHICLES : STAGE1_VEHICLES;

  const shownDiscovered = isStage2
    ? stage2Discovered ?? discoveredDistricts
    : stage1Discovered ?? discoveredDistricts;
  const shownArtifacts = isStage2
    ? stage2Collected ?? collectedArtifacts
    : stage1Collected ?? collectedArtifacts;
  const shownBuildings = isStage2
    ? stage2Buildings ?? placedBuildings
    : stage1Buildings ?? placedBuildings;
  const shownPlayerPos =
    viewStage === activeStage
      ? { x: playerX, z: playerZ }
      : isStage2
        ? stage2PlayerPos ?? { x: 56, z: 0 }
        : stage1PlayerPos ?? { x: -7.5, z: 0.4 };

  const shoreX = toX(shoreVal);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
      role="dialog"
      aria-modal="true"
      data-testid="world-map-modal"
    >
      <div className="animate-pop-in flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-5 py-3.5">
          <div>
            <div className="text-xs font-bold text-amber-300 uppercase">
              Peta Dunia Terbuka · {isStage2 ? 'Stage 2: Kota Industri Global' : 'Stage 1: Kota Perdagangan'}
            </div>
            <h2 className="text-lg font-extrabold text-white">
              {isStage2 ? 'Kota Industri Nusantara' : 'Kota Perdagangan Nusantara'} (
              {shownDiscovered.length}/{districts.length} Kawasan Ditemukan)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="map-view-stage-1"
              onClick={() => setViewStage(1)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewStage === 1
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Stage 1
            </button>
            <button
              type="button"
              data-testid="map-view-stage-2"
              onClick={() => setViewStage(2)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewStage === 2
                  ? 'bg-sky-500 text-slate-950'
                  : 'border border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Stage 2
            </button>
            <button
              type="button"
              disabled
              data-testid="map-view-stage-3-locked"
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-slate-500 cursor-not-allowed"
            >
              <Lock className="h-3 w-3" /> Stage 3
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Peta Dunia"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 overflow-y-auto p-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
              <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full">
                {/* Land & Sea */}
                <rect x={0} y={0} width={shoreX} height={MAP_H} fill={isStage2 ? '#1e293b' : '#1f3524'} />
                <rect x={shoreX} y={0} width={MAP_W - shoreX} height={MAP_H} fill="#0c4a6e" />

                {/* Districts */}
                {districts.map((d) => {
                  const dx = toX(d.minX);
                  const dy = toY(d.minZ);
                  const dw = toX(Math.min(d.maxX, maxX)) - dx;
                  const dh = toY(Math.min(d.maxZ, maxZ)) - dy;
                  const known = shownDiscovered.includes(d.id);
                  return (
                    <g key={d.id}>
                      <rect
                        x={dx}
                        y={dy}
                        width={dw}
                        height={dh}
                        fill={known ? d.colorHex : '#1e293b'}
                        fillOpacity={known ? 0.16 : 0.45}
                        stroke={known ? d.colorHex : '#475569'}
                        strokeDasharray={known ? undefined : '4 4'}
                        strokeWidth={1.2}
                      />
                      <text
                        x={dx + dw / 2}
                        y={dy + 18}
                        textAnchor="middle"
                        fill={known ? '#f8fafc' : '#94a3b8'}
                        fontSize={10.5}
                        fontWeight={700}
                      >
                        {known ? d.name : 'Kawasan Belum Dijelajahi'}
                      </text>
                    </g>
                  );
                })}

                {!isStage2 ? (
                  <>
                    {/* Stage 1 River */}
                    <rect
                      x={toX(-61.5)}
                      y={toY(-46)}
                      width={toX(-54.5) - toX(-61.5)}
                      height={toY(59) - toY(-46)}
                      fill="#0284c7"
                    />
                    <rect
                      x={toX(-61.5)}
                      y={toY(52.5)}
                      width={shoreX - toX(-61.5)}
                      height={toY(59.5) - toY(52.5)}
                      fill="#0284c7"
                    />
                    {/* Piers */}
                    <rect x={shoreX} y={toY(-4.2)} width={toX(85) - shoreX} height={toY(4.2) - toY(-4.2)} fill="#78350f" />
                    <rect x={shoreX} y={toY(-34)} width={toX(74) - shoreX} height={toY(-27.5) - toY(-34)} fill="#78350f" />
                    <rect x={shoreX} y={toY(25)} width={toX(72) - shoreX} height={toY(31.5) - toY(25)} fill="#78350f" />
                    {/* Lighthouse Island */}
                    <circle cx={toX(130)} cy={toY(-22)} r={20} fill="#b49c6e" stroke="#fef08a" strokeWidth={1.2} />
                    <text x={toX(130)} y={toY(-22) - 24} textAnchor="middle" fill="#fef08a" fontSize={9.5} fontWeight={700}>
                      Pulau Mercusuar
                    </text>
                    {/* Roads */}
                    <line x1={toX(-72)} y1={toY(0)} x2={shoreX} y2={toY(0)} stroke="#cbd5e1" strokeWidth={4} strokeOpacity={0.55} />
                    <line x1={toX(0)} y1={toY(-72)} x2={toX(0)} y2={toY(78)} stroke="#cbd5e1" strokeWidth={4} strokeOpacity={0.55} />
                    <line x1={toX(21.5)} y1={toY(-50)} x2={toX(21.5)} y2={toY(46)} stroke="#cbd5e1" strokeWidth={3} strokeOpacity={0.4} />
                    <line x1={toX(-29.5)} y1={toY(-68)} x2={toX(-29.5)} y2={toY(52)} stroke="#cbd5e1" strokeWidth={3} strokeOpacity={0.4} />
                  </>
                ) : (
                  <>
                    {/* Stage 2 Industrial River */}
                    <rect
                      x={toX(-61.5)}
                      y={toY(12)}
                      width={toX(-54.5) - toX(-61.5)}
                      height={toY(77) - toY(12)}
                      fill="#0284c7"
                    />
                    <rect
                      x={toX(-61.5)}
                      y={toY(70)}
                      width={shoreX - toX(-61.5)}
                      height={Math.max(2, toY(77) - toY(70))}
                      fill="#0284c7"
                    />
                    {/* Piers */}
                    <rect x={shoreX} y={toY(-4.4)} width={toX(86) - shoreX} height={toY(4.4) - toY(-4.4)} fill="#64748b" />
                    <rect x={shoreX} y={toY(24)} width={toX(76) - shoreX} height={toY(31) - toY(24)} fill="#64748b" />
                    {/* Asphalt Crossroads & Rail */}
                    <line x1={toX(-82)} y1={toY(0)} x2={shoreX} y2={toY(0)} stroke="#94a3b8" strokeWidth={4} strokeOpacity={0.6} />
                    <line x1={toX(0)} y1={toY(-76)} x2={toX(0)} y2={toY(76)} stroke="#94a3b8" strokeWidth={4} strokeOpacity={0.6} />
                    <line x1={toX(-82)} y1={toY(-28)} x2={toX(48)} y2={toY(-28)} stroke="#94a3b8" strokeWidth={2.5} strokeOpacity={0.45} />
                    <line x1={toX(-82)} y1={toY(28)} x2={toX(48)} y2={toY(28)} stroke="#94a3b8" strokeWidth={2.5} strokeOpacity={0.45} />
                    <line x1={toX(STAGE2_RAIL_X)} y1={0} x2={toX(STAGE2_RAIL_X)} y2={MAP_H} stroke="#fbbf24" strokeDasharray="6 4" strokeWidth={2.5} />
                    {/* Enterable Buildings */}
                    {STAGE2_ENTERABLE_BUILDINGS.map((eb) => (
                      <rect
                        key={eb.id}
                        x={toX(eb.x - eb.halfW)}
                        y={toY(eb.z - eb.halfD)}
                        width={Math.max(8, toX(eb.x + eb.halfW) - toX(eb.x - eb.halfW))}
                        height={Math.max(8, toY(eb.z + eb.halfD) - toY(eb.z - eb.halfD))}
                        fill="#475569"
                        stroke="#e2e8f0"
                        strokeWidth={0.9}
                      >
                        <title>{eb.label}</title>
                      </rect>
                    ))}
                    {/* Locked Stage 3 Terminal Marker */}
                    <g>
                      <rect
                        x={toX(-4) - 9}
                        y={toY(-74) - 6}
                        width={18}
                        height={12}
                        rx={3}
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth={1.5}
                      />
                      <text x={toX(-4)} y={toY(-74) - 10} textAnchor="middle" fill="#7dd3fc" fontSize={8.5} fontWeight={700}>
                        Terminal Stage 3 (Terkunci)
                      </text>
                    </g>
                  </>
                )}

                {/* Player Placed Buildings */}
                {shownBuildings.map((pb) => {
                  const def = BUILDING_CATALOG.find((b) => b.id === pb.buildingId);
                  return (
                    <g key={pb.id}>
                      <rect
                        x={toX(pb.x) - 5}
                        y={toY(pb.z) - 5}
                        width={10}
                        height={10}
                        rx={2}
                        fill={pb.isConstructing ? '#f97316' : '#f59e0b'}
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                      <title>{def?.name ?? pb.buildingId} (Lv {pb.level})</title>
                    </g>
                  );
                })}

                {/* Unfound Collectibles */}
                {collectibles.map((c) => {
                  const found = shownArtifacts.includes(c.id);
                  if (found) return null;
                  return (
                    <circle
                      key={c.id}
                      cx={toX(c.x)}
                      cy={toY(c.z)}
                      r={3.2}
                      fill="#f472b6"
                      stroke="#ffffff"
                      strokeWidth={0.7}
                    >
                      <title>Koleksi: {c.name}</title>
                    </circle>
                  );
                })}

                {/* Vehicles */}
                {vehicles.map((v) => (
                  <rect
                    key={v.id}
                    x={toX(v.spawnX) - 3.5}
                    y={toY(v.spawnZ) - 3.5}
                    width={7}
                    height={7}
                    fill="#22d3ee"
                    stroke="#0f172a"
                    strokeWidth={1}
                  >
                    <title>Kendaraan: {v.name}</title>
                  </rect>
                ))}

                {/* NPCs */}
                {npcs.map((n) => (
                  <circle
                    key={n.id}
                    cx={toX(n.x)}
                    cy={toY(n.z)}
                    r={4}
                    fill={n.characterId ? '#38bdf8' : '#e2e8f0'}
                    stroke="#0f172a"
                    strokeWidth={1}
                  >
                    <title>{n.name} — {n.role}</title>
                  </circle>
                ))}

                {/* Active Quest Waypoint */}
                {questTarget && viewStage === activeStage && (
                  <g>
                    <circle cx={toX(questTarget.x)} cy={toY(questTarget.z)} r={11} fill="#fbbf24" fillOpacity={0.32} />
                    <circle cx={toX(questTarget.x)} cy={toY(questTarget.z)} r={5.5} fill="#fbbf24" stroke="#ffffff" strokeWidth={1.5} />
                  </g>
                )}

                {/* Player Pin */}
                <circle
                  cx={toX(shownPlayerPos.x)}
                  cy={toY(shownPlayerPos.z)}
                  r={6.5}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </svg>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500 border border-white" /> Posisi Pemain
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-400 border border-white" /> Target Misi Aktif
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-sky-400" /> NPC Utama
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-400" /> Koleksi Tersembunyi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-cyan-400" /> Kendaraan [F]
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-amber-500" /> Bangunan Kota
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Compass className="h-4 w-4" /> Daftar Kawasan Stage {viewStage}
              </div>
              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {districts.map((d) => {
                  const found = shownDiscovered.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      className={`rounded-lg border px-2.5 py-2 text-xs ${
                        found
                          ? 'border-emerald-500/35 bg-emerald-950/25 text-slate-100'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{d.name}</span>
                        <span className={found ? 'text-emerald-300' : 'text-slate-500'}>
                          {found ? 'Terbuka' : 'Belum'}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400">{d.subtitle}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {questTarget && viewStage === activeStage && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Navigation className="h-3.5 w-3.5" /> Penunjuk Misi Aktif
                </div>
                <div className="mt-1 font-semibold text-white">{questTarget.label}</div>
                <div className="mt-1 text-[11px] text-slate-300">
                  Jarak: {Math.round(Math.hypot(questTarget.x - playerX, questTarget.z - playerZ))} m dari posisimu.
                </div>
              </div>
            )}

            {/* Global Era Progression Status (Stage 1 Open, Stage 2 Open, Stage 3 Strictly Locked) */}
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Ship className="h-3.5 w-3.5 text-amber-400" /> Pelabuhan Lintas Era Nusantara
              </div>
              <div className="mt-2 space-y-1.5 text-[11px]">
                <div
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${
                    activeStage === 1
                      ? 'border-emerald-500/50 bg-emerald-950/35 text-emerald-200'
                      : 'border-slate-700 bg-slate-900 text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" /> Stage 1: Kota Perdagangan
                  </span>
                  {activeStage === 1 ? (
                    <span className="font-bold text-emerald-300">LOKASI SAAT INI</span>
                  ) : onTravelStage ? (
                    <button
                      type="button"
                      data-testid="travel-to-stage-1-btn"
                      onClick={() => {
                        onClose();
                        onTravelStage(1);
                      }}
                      className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400"
                    >
                      Berlayar
                    </button>
                  ) : (
                    <span className="text-emerald-300">TERBUKA</span>
                  )}
                </div>

                <div
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${
                    activeStage === 2
                      ? 'border-sky-500/50 bg-sky-950/35 text-sky-200'
                      : 'border-slate-700 bg-slate-900 text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <Ship className="h-3.5 w-3.5 text-sky-400" /> Stage 2: Kota Industri Global
                  </span>
                  {activeStage === 2 ? (
                    <span className="font-bold text-sky-300">LOKASI SAAT INI</span>
                  ) : onTravelStage ? (
                    <button
                      type="button"
                      data-testid="travel-to-stage-2-btn"
                      onClick={() => {
                        onClose();
                        onTravelStage(2);
                      }}
                      className="rounded bg-sky-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-sky-400"
                    >
                      Berlayar
                    </button>
                  ) : (
                    <span className="text-sky-300">TERBUKA</span>
                  )}
                </div>

                <div
                  data-testid="stage3-locked-map-card"
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-slate-500"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Stage 3: Kota Digital Tanpa Batas
                  </span>
                  <span className="font-bold">TERKUNCI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
