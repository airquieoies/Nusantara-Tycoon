import React, { useState } from 'react';
import { ArrowUpCircle, Check, Hammer, Lock, RotateCw, X } from 'lucide-react';
import { BUILDING_CATALOG } from '../../game/data/bermainData';
import { PlacedBuildingInstance } from '../../game/stage1WorldLogic';
import { BuildingCategory } from '../../game/types';

interface BuildCatalogBarProps {
  open: boolean;
  onClose: () => void;
  activeStage?: 1 | 2;
  coins: number;
  placedBuildings: PlacedBuildingInstance[];
  unlockedBlueprints: string[];
  activePlacementId: string | null;
  placementValid: boolean;
  placementReason: string;
  onStartPlacement: (buildingId: string) => void;
  onCancelPlacement: () => void;
  onRotatePlacement: () => void;
  onConfirmPlacement: () => void;
  onUpgradeBuilding: (instanceId: string) => void;
}

const CATEGORIES: { id: BuildingCategory | 'terbangun'; label: string }[] = [
  { id: 'perdagangan', label: 'Perdagangan' },
  { id: 'industri', label: 'Industri' },
  { id: 'teknologi', label: 'Pendidikan & Energi' },
  { id: 'masyarakat', label: 'Masyarakat' },
  { id: 'budaya', label: 'Budaya & Ekologi' },
  { id: 'terbangun', label: 'Bangunan Saya' },
];

export const BuildCatalogBar: React.FC<BuildCatalogBarProps> = ({
  open,
  onClose,
  activeStage = 1,
  coins,
  placedBuildings,
  unlockedBlueprints,
  activePlacementId,
  placementValid,
  placementReason,
  onStartPlacement,
  onCancelPlacement,
  onRotatePlacement,
  onConfirmPlacement,
  onUpgradeBuilding,
}) => {
  const [cat, setCat] = useState<BuildingCategory | 'terbangun'>(
    activeStage === 2 ? 'industri' : 'perdagangan'
  );

  // Floating Ghost Placement Bar when actively placing a 3D building
  if (activePlacementId) {
    const def = BUILDING_CATALOG.find((b) => b.id === activePlacementId);
    return (
      <div
        className="pointer-events-auto fixed bottom-4 left-1/2 z-30 w-[94vw] max-w-2xl -translate-x-1/2 rounded-2xl border border-amber-400/70 bg-slate-950/95 p-3.5 shadow-2xl"
        data-testid="ghost-placement-bar"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-extrabold text-amber-300">
              Mode Penempatan 3D (Stage {activeStage}): {def?.name} ({def?.cost} Koin)
            </div>
            <div
              className={`mt-0.5 text-[11px] font-semibold ${
                placementValid ? 'text-emerald-300' : 'text-rose-300'
              }`}
              data-testid="ghost-placement-status"
            >
              {placementReason}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="rotate-ghost-btn"
              onClick={onRotatePlacement}
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs font-bold text-slate-200 hover:border-amber-400"
            >
              <RotateCw className="h-3.5 w-3.5" /> Putar [R]
            </button>
            <button
              type="button"
              data-testid="confirm-ghost-build-btn"
              disabled={!placementValid}
              onClick={onConfirmPlacement}
              className={`flex h-9 items-center gap-1 rounded-lg px-3.5 text-xs font-extrabold ${
                placementValid
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="h-3.5 w-3.5" /> Bangun Di Sini
            </button>
            <button
              type="button"
              onClick={onCancelPlacement}
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <X className="h-3.5 w-3.5" /> Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!open) return null;

  const list = BUILDING_CATALOG.filter((b) => b.category === cat).sort(
    (a, b) => a.minStage - b.minStage
  );

  return (
    <div
      className="pointer-events-auto fixed bottom-4 left-1/2 z-30 w-[96vw] max-w-4xl -translate-x-1/2 rounded-2xl border border-amber-500/40 bg-slate-950/95 p-3.5 shadow-2xl"
      data-testid="build-catalog-bar"
    >
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              data-testid={`build-cat-${c.id}`}
              onClick={() => setCat(c.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                cat === c.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              {c.label}
              {c.id === 'terbangun' ? ` (${placedBuildings.length})` : ''}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup Menu Bangun"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {cat === 'terbangun' ? (
        placedBuildings.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">
            Belum ada bangunan yang kamu dirikan di Stage {activeStage}. Pilih kategori lain untuk meletakkan bangunan baru secara bebas!
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {placedBuildings.map((inst) => {
              const def = BUILDING_CATALOG.find((b) => b.id === inst.buildingId);
              if (!def) return null;
              const upCost = Math.round(def.cost * (inst.level === 1 ? 0.75 : 1.15));
              return (
                <div
                  key={inst.id}
                  className="min-w-[220px] shrink-0 rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>{def.name}</span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                      Lv {inst.level}
                    </span>
                  </div>
                  {inst.isConstructing ? (
                    <div className="mt-2">
                      <div className="text-[11px] text-amber-300">
                        Sedang dibangun... {Math.round(inst.constructionProgress * 100)}%
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${inst.constructionProgress * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : inst.level < 3 ? (
                    <button
                      type="button"
                      data-testid={`upgrade-building-${inst.id}`}
                      disabled={coins < upCost}
                      onClick={() => onUpgradeBuilding(inst.id)}
                      className={`mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold ${
                        coins >= upCost
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle className="h-3.5 w-3.5" />
                      Upgrade Lv {inst.level + 1} ({upCost} Koin)
                    </button>
                  ) : (
                    <div className="mt-2.5 text-[11px] font-bold text-emerald-300">Level Maksimal (Lv 3)</div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {list.map((b) => {
            const lockedStage = b.minStage > activeStage;
            const lockedBlueprint = Boolean(b.requiresBlueprintUnlock && !unlockedBlueprints.includes(b.id));
            const locked = lockedStage || lockedBlueprint;
            const affordable = coins >= b.cost;
            return (
              <button
                key={b.id}
                type="button"
                data-testid={`select-build-${b.id}`}
                disabled={locked || !affordable}
                onClick={() => onStartPlacement(b.id)}
                className={`min-w-[215px] shrink-0 rounded-xl border p-2.5 text-left transition-colors ${
                  locked
                    ? 'border-slate-800 bg-slate-900/50 opacity-60 cursor-not-allowed'
                    : affordable
                      ? 'border-slate-700 bg-slate-900 hover:border-amber-400'
                      : 'border-rose-900/50 bg-slate-900/70 opacity-75 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-white">{b.name}</span>
                  {lockedStage ? (
                    <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-bold text-slate-400">
                      <Lock className="h-3 w-3" /> {b.minStage === 3 ? 'Stg 3 (Terkunci)' : `Stg ${b.minStage}`}
                    </span>
                  ) : lockedBlueprint ? (
                    <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-amber-300">
                      <Lock className="h-3 w-3" /> Cetak Biru
                    </span>
                  ) : (
                    <span
                      className={`font-mono-num text-xs font-bold ${
                        affordable ? 'text-amber-300' : 'text-rose-400'
                      }`}
                    >
                      {b.cost}
                    </span>
                  )}
                </div>
                <div className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                  {lockedBlueprint && b.unlockHint ? b.unlockHint : b.functionDesc}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1.5 text-[10px]">
                  <span className="flex items-center gap-1 text-emerald-300">
                    <Hammer className="h-3 w-3" />+{b.effects.incomePerTick}/siklus · +{b.effects.scoreBonus} Skor
                  </span>
                  <span className="rounded bg-slate-800 px-1 py-0.5 text-[9px] text-slate-300">
                    Stg {b.minStage}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
