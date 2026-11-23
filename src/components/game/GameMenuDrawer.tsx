import React, { useMemo, useState } from 'react';
import {
  Award,
  Backpack,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Factory,
  Lock,
  Music,
  RefreshCw,
  RotateCcw,
  Send,
  Settings,
  ShieldAlert,
  Shirt,
  ShoppingBag,
  Sparkles,
  Sun,
  User,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { BUILDING_CATALOG, STAGE_CHALLENGES } from '../../game/data/bermainData';
import {
  buildRoomInviteUrl,
  MultiplayerSessionSnapshot,
  PublicRoomSummary,
  SAFE_EMOTE_OPTIONS,
  SAFE_QUICK_CHAT_PRESETS,
} from '../../game/multiplayerClient';
import {
  getCostumeCollectionStats,
  getItemDefById,
  MultiStageWorldState,
} from '../../game/multiStageLogic';
import {
  CharacterAppearance,
  COLLECTION_MILESTONES,
  CollectibleCategory,
  CosmeticRarity,
  CUSTOMIZATION_ITEMS,
  CustomizationItemDef,
  PLAYER_TITLES,
  STAGE1_ACHIEVEMENTS,
  STAGE1_COLLECTIBLES,
  STAGE1_DISTRICTS,
  STAGE1_QUESTS,
} from '../../game/stage1Data';
import { Stage1OpenWorldState } from '../../game/stage1WorldLogic';
import {
  STAGE2_ACHIEVEMENTS,
  STAGE2_COLLECTIBLES,
  STAGE2_COLLECTION_MILESTONES,
  STAGE2_DISTRICTS,
  STAGE2_MARKET_SUPPLIES,
  STAGE2_QUESTS,
} from '../../game/stage2Data';
import { FacialExpression } from '../../game/threeCharacterRig';
import { StageChallenge } from '../../game/types';
import { CharacterCustomizerStudio, RARITY_BADGE_STYLES } from './CharacterCustomizerStudio';
import { CharacterPreview3D } from './CharacterPreview3D';

export type MenuTabId =
  | 'karakter'
  | 'busana'
  | 'inventaris'
  | 'koleksi'
  | 'misi'
  | 'pencapaian'
  | 'sosial'
  | 'pengaturan';

interface GameMenuDrawerProps {
  open: boolean;
  activeTab: MenuTabId;
  onChangeTab: (tab: MenuTabId) => void;
  onClose: () => void;
  state: MultiStageWorldState;
  muted: boolean;
  bgmActive: boolean;
  previewExpression: FacialExpression;
  onToggleMute: () => void;
  onToggleBgm: () => void;
  onChangeExpression: (expr: FacialExpression) => void;
  onUpdateDisplayName: (name: string) => void;
  onApplyAppearance: (appearance: CharacterAppearance) => void;
  onApplyPreset: (presetId: string) => void;
  onEquipTitle: (titleId: string) => void;
  onUseItem: (itemId: string) => void;
  onBuySupply: (itemId: string) => void;
  onAcceptQuest: (questId: string) => void;
  onTrackQuest: (questId: string) => void;
  onOpenChallenge: (challenge: StageChallenge) => void;
  onUpdateSettings: (patch: Partial<Stage1OpenWorldState['settings']>) => void;
  onResetProgress: () => void;
  mpSession: MultiplayerSessionSnapshot;
  publicRooms: PublicRoomSummary[];
  onRefreshRooms: () => void;
  onCreateRoom: (roomName: string, isPublic: boolean) => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  onGoOffline: () => void;
  onSendChat: (text: string, presetId?: string) => void;
  onTriggerEmote: (emoteId: string) => void;
}

const TABS: { id: MenuTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'karakter', label: 'Karakter', icon: <User className="h-3.5 w-3.5" /> },
  { id: 'busana', label: 'Busana', icon: <Shirt className="h-3.5 w-3.5" /> },
  { id: 'inventaris', label: 'Inventaris', icon: <Backpack className="h-3.5 w-3.5" /> },
  { id: 'koleksi', label: 'Koleksi', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: 'misi', label: 'Misi & Kasus', icon: <Compass className="h-3.5 w-3.5" /> },
  { id: 'pencapaian', label: 'Pencapaian', icon: <Award className="h-3.5 w-3.5" /> },
  { id: 'sosial', label: 'Multiplayer', icon: <Users className="h-3.5 w-3.5" /> },
  { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="h-3.5 w-3.5" /> },
];

const COLLECTIBLE_FILTERS: { id: 'all' | CollectibleCategory; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'batik', label: 'Batik & Tenun' },
  { id: 'kerajinan', label: 'Kerajinan' },
  { id: 'kapal', label: 'Maritim' },
  { id: 'wayang', label: 'Seni & Wayang' },
  { id: 'sejarah', label: 'Sejarah' },
  { id: 'souvenir', label: 'Suvenir' },
];

function previewAppearanceWithItem(
  base: CharacterAppearance,
  item: CustomizationItemDef
): CharacterAppearance {
  const next = { ...base };
  if (item.slot === 'hairstyle') next.hairstyle = item.id;
  else if (item.slot === 'shirt') next.shirtId = item.id;
  else if (item.slot === 'jacket') next.jacketId = item.id;
  else if (item.slot === 'pants') next.pantsId = item.id;
  else if (item.slot === 'shoes') next.shoeId = item.id;
  else if (item.slot === 'hat') next.hatId = item.id;
  else if (item.slot === 'glasses') next.glassesId = item.id;
  else if (item.slot === 'bag') next.bagId = item.id;
  else if (item.slot === 'accessory') next.accessoryId = item.id;
  return next;
}

export const GameMenuDrawer: React.FC<GameMenuDrawerProps> = ({
  open,
  activeTab,
  onChangeTab,
  onClose,
  state,
  muted,
  bgmActive,
  previewExpression,
  onToggleMute,
  onToggleBgm,
  onChangeExpression,
  onUpdateDisplayName,
  onApplyAppearance,
  onApplyPreset,
  onEquipTitle,
  onUseItem,
  onBuySupply,
  onAcceptQuest,
  onTrackQuest,
  onOpenChallenge,
  onUpdateSettings,
  onResetProgress,
  mpSession,
  publicRooms,
  onRefreshRooms,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onGoOffline,
  onSendChat,
  onTriggerEmote,
}) => {
  const [collectibleFilter, setCollectibleFilter] = useState<'all' | CollectibleCategory>('all');
  const [koleksiStageView, setKoleksiStageView] = useState<1 | 2>(state.activeStage);
  const [misiStageView, setMisiStageView] = useState<1 | 2>(state.activeStage);

  // Wardrobe Collection state
  const [wardrobeFilter, setWardrobeFilter] = useState<'all' | 'owned' | 'locked'>('all');
  const [wardrobeRarity, setWardrobeRarity] = useState<'all' | CosmeticRarity>('all');
  const [previewItem, setPreviewItem] = useState<CustomizationItemDef>(
    () => CUSTOMIZATION_ITEMS.find((c) => c.id === 'shirt-gaun-batik') ?? CUSTOMIZATION_ITEMS[0]
  );

  // Multiplayer form state
  const [newRoomName, setNewRoomName] = useState('Kota Nusantara Bersama');
  const [newRoomPublic, setNewRoomPublic] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);

  const costumeStats = useMemo(
    () => getCostumeCollectionStats(state.stage1.unlockedCustomizationIds),
    [state.stage1.unlockedCustomizationIds]
  );

  if (!open) return null;

  const s1 = state.stage1;
  const s2 = state.stage2;
  const isStage2Active = state.activeStage === 2;
  const activeTitleDef = PLAYER_TITLES.find((t) => t.id === s1.equippedTitle) ?? PLAYER_TITLES[0];

  const activeDistrictCount = isStage2Active
    ? `${s2.discoveredDistricts.length}/${STAGE2_DISTRICTS.length}`
    : `${s1.discoveredDistricts.length}/${STAGE1_DISTRICTS.length}`;
  const activeCollectibleCount = isStage2Active
    ? `${s2.collectibles.length}/${STAGE2_COLLECTIBLES.length}`
    : `${s1.collectibles.length}/${STAGE1_COLLECTIBLES.length}`;

  // Collections computed for viewed stage
  const viewingS2Koleksi = koleksiStageView === 2;
  const shownCollectibles = viewingS2Koleksi
    ? STAGE2_COLLECTIBLES
    : collectibleFilter === 'all'
      ? STAGE1_COLLECTIBLES
      : STAGE1_COLLECTIBLES.filter((c) => c.category === collectibleFilter);
  const collectedIdsForView = viewingS2Koleksi ? s2.collectibles : s1.collectibles;
  const milestonesForView = viewingS2Koleksi ? STAGE2_COLLECTION_MILESTONES : COLLECTION_MILESTONES;
  const claimedMilestonesForView = viewingS2Koleksi ? s2.claimedMilestones : s1.claimedMilestones;
  const totalCollectiblePool = viewingS2Koleksi
    ? STAGE2_COLLECTIBLES.length
    : STAGE1_COLLECTIBLES.length;
  const collectionPercent = Math.round((collectedIdsForView.length / totalCollectiblePool) * 100);

  // Wardrobe filtered items
  const filteredWardrobe = CUSTOMIZATION_ITEMS.filter((item) => {
    const owned = s1.unlockedCustomizationIds.includes(item.id);
    const rarity = item.rarity ?? 'Common';
    if (wardrobeFilter === 'owned' && !owned) return false;
    if (wardrobeFilter === 'locked' && owned) return false;
    if (wardrobeRarity !== 'all' && rarity !== wardrobeRarity) return false;
    return true;
  });

  // Quests & Challenges for viewed stage
  const viewingS2Misi = misiStageView === 2;
  const stageChallenges = STAGE_CHALLENGES.filter((c) => c.stage === misiStageView);

  const handleCopyInvite = async () => {
    if (!mpSession.room) return;
    const url = buildRoomInviteUrl(mpSession.room.code);
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      // Fallback ignored safely in restricted iframe
    }
    setCopiedInvite(true);
    window.setTimeout(() => setCopiedInvite(false), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
      role="dialog"
      aria-modal="true"
      data-testid="game-menu-drawer"
    >
      <div className="animate-pop-in flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl">
        {/* Header & Tab Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950 px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`menu-tab-${t.id}`}
                onClick={() => {
                  if (t.id === 'sosial') onRefreshRooms();
                  onChangeTab(t.id);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.id === 'sosial' && mpSession.room && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5">
          {activeTab === 'karakter' && (
            <div className="space-y-4">
              {/* Compact Mayor Profile & City Progress Summary */}
              <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3.5 md:grid-cols-12">
                <div className="md:col-span-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-300 uppercase">
                      {state.displayName} · Stage {state.activeStage}
                    </span>
                    <span
                      className="rounded border border-white/15 bg-slate-900 px-2 py-0.5 text-[10px] font-extrabold"
                      style={{ color: activeTitleDef.colorHex }}
                      data-testid="profile-active-title"
                    >
                      {activeTitleDef.name}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-lg font-extrabold text-white">Level {s1.playerLevel}</span>
                    <span className="font-mono-num text-xs text-sky-300">
                      XP {s1.xp} / {s1.xpToNext}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${Math.min(100, (s1.xp / s1.xpToNext) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[11px] md:col-span-7">
                  <div className="rounded-lg bg-slate-900 p-2">
                    <div className="text-slate-400">Reputasi</div>
                    <div className="font-mono-num text-sm font-bold text-amber-300">
                      {isStage2Active ? s2.reputation : s1.reputation}%
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-2">
                    <div className="text-slate-400">Bahagia</div>
                    <div className="font-mono-num text-sm font-bold text-emerald-300">
                      {isStage2Active ? s2.happiness : s1.happiness}%
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-2">
                    <div className="text-slate-400">Kawasan</div>
                    <div className="font-mono-num text-sm font-bold text-sky-300">{activeDistrictCount}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-2">
                    <div className="text-slate-400">Koleksi</div>
                    <div className="font-mono-num text-sm font-bold text-pink-300">{activeCollectibleCount}</div>
                  </div>
                </div>
              </div>

              <CharacterCustomizerStudio
                savedAppearance={s1.appearance}
                unlockedCustomizationIds={s1.unlockedCustomizationIds}
                unlockedTitles={s1.unlockedTitles}
                equippedTitle={s1.equippedTitle}
                previewExpression={previewExpression}
                displayName={state.displayName}
                onChangeDisplayName={onUpdateDisplayName}
                onChangeExpression={onChangeExpression}
                onApplyAppearance={onApplyAppearance}
                onApplyPreset={onApplyPreset}
                onEquipTitle={onEquipTitle}
              />
            </div>
          )}

          {activeTab === 'busana' && (
            <div className="grid gap-5 lg:grid-cols-12" data-testid="wardrobe-collection-tab">
              {/* Left: Reward / Costume 3D Preview Panel */}
              <div className="space-y-3 lg:col-span-5">
                <div className="rounded-xl border border-amber-500/40 bg-slate-950 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300 uppercase">
                      Pratinjau Hadiah & Busana 3D
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                        RARITY_BADGE_STYLES[previewItem.rarity ?? 'Common']
                      }`}
                    >
                      {previewItem.rarity ?? 'Common'}
                    </span>
                  </div>
                  <CharacterPreview3D
                    appearance={previewAppearanceWithItem(s1.appearance, previewItem)}
                    expression={previewExpression}
                  />
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-white">{previewItem.name}</h4>
                      <span
                        className="h-4 w-4 rounded-full border border-white/40"
                        style={{ backgroundColor: previewItem.primaryHex }}
                      />
                    </div>
                    <p className="text-xs text-slate-300">{previewItem.description}</p>
                    <div className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-[11px] text-amber-200">
                      <strong>Cara Membuka: </strong>
                      {previewItem.unlockHint}
                    </div>
                    {s1.unlockedCustomizationIds.includes(previewItem.id) ? (
                      <button
                        type="button"
                        data-testid="wardrobe-equip-preview-btn"
                        onClick={() =>
                          onApplyAppearance(previewAppearanceWithItem(s1.appearance, previewItem))
                        }
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
                      >
                        <Check className="h-4 w-4" /> Pakai Busana Ini Sekarang
                      </button>
                    ) : (
                      <div className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-400">
                        <Lock className="h-3.5 w-3.5" /> Item Belum Dimiliki (Mode Pratinjau)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Wardrobe Collection Progress & Filterable Grid */}
              <div className="space-y-3 lg:col-span-7">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                  <div className="flex items-center justify-between text-xs font-extrabold text-white">
                    <span>
                      Lemari Koleksi Busana Global ({costumeStats.unlockedCount}/{costumeStats.totalCount} ·{' '}
                      {costumeStats.pct}%)
                    </span>
                    <span className="text-amber-300">Tersedia di Stage 1 & Stage 2</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-amber-400" style={{ width: `${costumeStats.pct}%` }} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-1">
                      {(
                        [
                          { id: 'all', label: 'Semua' },
                          { id: 'owned', label: 'Dimiliki' },
                          { id: 'locked', label: 'Terkunci' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          data-testid={`wardrobe-filter-${f.id}`}
                          onClick={() => setWardrobeFilter(f.id)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            wardrobeFilter === f.id
                              ? 'bg-amber-500 text-slate-950'
                              : 'border border-slate-800 bg-slate-900 text-slate-300'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <select
                      aria-label="Filter Kelangkaan Busana"
                      value={wardrobeRarity}
                      onChange={(e) => setWardrobeRarity(e.target.value as 'all' | CosmeticRarity)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200"
                    >
                      <option value="all">Semua Kelangkaan</option>
                      <option value="Common">Common</option>
                      <option value="Uncommon">Uncommon</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                      <option value="Special Event">Special Event</option>
                    </select>
                  </div>
                </div>

                <div className="grid max-h-[430px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {filteredWardrobe.map((item) => {
                    const owned = s1.unlockedCustomizationIds.includes(item.id);
                    const rarity = item.rarity ?? 'Common';
                    const isPreviewed = previewItem.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-testid={`wardrobe-item-${item.id}`}
                        onClick={() => setPreviewItem(item)}
                        className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                          isPreviewed
                            ? 'border-amber-400 bg-amber-500/15'
                            : owned
                              ? 'border-emerald-500/40 bg-slate-950 hover:border-emerald-400'
                              : 'border-slate-800 bg-slate-950/60 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="flex items-center gap-1.5 font-bold text-white min-w-0">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full border border-white/40"
                              style={{ backgroundColor: item.primaryHex }}
                            />
                            <span className="truncate">{item.name}</span>
                          </span>
                          <span
                            className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold ${RARITY_BADGE_STYLES[rarity]}`}
                          >
                            {rarity}
                          </span>
                        </div>
                        <div className="mt-1 line-clamp-1 text-[10px] text-slate-400">
                          {owned ? 'Dimiliki · Klik untuk pratinjau/pakai' : `Terkunci · ${item.unlockHint}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventaris' && (
            <div className="space-y-5">
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-white">Tas & Barang Bawaan Bersama (Stage 1 & 2)</h3>
                  <span className="text-xs text-slate-400">
                    Koin Aktif: <strong className="text-amber-300">{s1.coins}</strong> · Inventaris terbawa saat menyeberang antar-era.
                  </span>
                </div>
                {s1.inventory.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-400">
                    Tas masih kosong. Kumpulkan barang di sekitar kota atau selesaikan misi!
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {s1.inventory.map((slot) => {
                      const def = getItemDefById(slot.itemId);
                      if (!def) return null;
                      return (
                        <div
                          key={slot.itemId}
                          className="flex flex-col justify-between gap-2 rounded-xl border border-slate-700 bg-slate-950 p-3.5"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white">{def.name}</span>
                              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-mono-num text-xs font-bold text-amber-300">
                                x{slot.qty}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-300">{def.description}</p>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                            <span className="text-[11px] font-semibold text-emerald-300">{def.effectLabel}</span>
                            {def.category === 'consumable' && (
                              <button
                                type="button"
                                data-testid={`use-item-${def.id}`}
                                onClick={() => onUseItem(def.id)}
                                className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                              >
                                Gunakan
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Stage 2 Raw Material & Welfare Supply Market */}
              {isStage2Active && (
                <div className="rounded-xl border border-sky-500/35 bg-slate-950 p-4" data-testid="stage2-supply-market">
                  <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-sky-300 uppercase">
                    <ShoppingBag className="h-4 w-4" /> Toko Pasokan Bahan Baku & K3 Kota Industri
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {STAGE2_MARKET_SUPPLIES.map((offer) => {
                      const canAfford = s1.coins >= offer.costCoins;
                      return (
                        <div
                          key={offer.itemId}
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">{offer.name}</div>
                            <div className="text-[10px] text-slate-400">{offer.hint}</div>
                          </div>
                          <button
                            type="button"
                            data-testid={`buy-supply-${offer.itemId}`}
                            disabled={!canAfford}
                            onClick={() => onBuySupply(offer.itemId)}
                            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-extrabold ${
                              canAfford
                                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Beli ({offer.costCoins})
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'koleksi' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-white" data-testid="collection-progress-header">
                    Koleksi Artefak Stage {koleksiStageView} ({collectedIdsForView.length}/{totalCollectiblePool} ·{' '}
                    {collectionPercent}%)
                  </h3>
                  <p className="text-[11px] text-amber-300">
                    {viewingS2Koleksi
                      ? 'Temukan 15 artefak mesin, K3, logistik & ekologi di seluruh Kota Industri Stage 2!'
                      : 'Temukan 15 artefak budaya di butik, kafe, hotel, rumah adat, dek kapal, bukit & pulau!'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    data-testid="koleksi-stage-1-btn"
                    onClick={() => setKoleksiStageView(1)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      koleksiStageView === 1
                        ? 'bg-amber-500 text-slate-950'
                        : 'border border-slate-700 bg-slate-950 text-slate-300'
                    }`}
                  >
                    Stage 1
                  </button>
                  <button
                    type="button"
                    data-testid="koleksi-stage-2-btn"
                    onClick={() => setKoleksiStageView(2)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      koleksiStageView === 2
                        ? 'bg-sky-500 text-slate-950'
                        : 'border border-slate-700 bg-slate-950 text-slate-300'
                    }`}
                  >
                    Stage 2
                  </button>
                </div>
              </div>

              {/* 4 Milestones */}
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {milestonesForView.map((m) => {
                  const claimed = claimedMilestonesForView.includes(m.id);
                  const prog = Math.min(collectedIdsForView.length, m.requiredCount);
                  const pct = Math.round((prog / m.requiredCount) * 100);
                  const bpName = m.unlockBlueprintId
                    ? BUILDING_CATALOG.find((b) => b.id === m.unlockBlueprintId)?.name
                    : null;
                  const titleName = m.unlockTitleId
                    ? PLAYER_TITLES.find((t) => t.id === m.unlockTitleId)?.name
                    : null;
                  return (
                    <div
                      key={m.id}
                      data-testid={`milestone-card-${m.id}`}
                      className={`rounded-xl border p-3 text-xs ${
                        claimed ? 'border-amber-400/60 bg-amber-950/20' : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white">{m.title}</span>
                        <span
                          className={`font-mono-num text-[10px] font-bold ${
                            claimed ? 'text-emerald-300' : 'text-amber-300'
                          }`}
                        >
                          {prog}/{m.requiredCount}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full ${claimed ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-2 text-[10px] text-slate-300">
                        +{m.xpReward} XP · +{m.coinReward} Koin
                        {bpName ? ` · Cetak Biru ${bpName}` : ''}
                        {titleName ? ` · Gelar ${titleName}` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!viewingS2Koleksi && (
                <div className="flex flex-wrap gap-1.5">
                  {COLLECTIBLE_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      data-testid={`collectible-filter-${f.id}`}
                      onClick={() => setCollectibleFilter(f.id)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                        collectibleFilter === f.id
                          ? 'border-amber-400 bg-amber-500 text-slate-950'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {shownCollectibles.map((c) => {
                  const found = collectedIdsForView.includes(c.id);
                  const badgeClass =
                    c.rarity === 'Legendary'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : c.rarity === 'Epic'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                        : c.rarity === 'Rare'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                          : c.rarity === 'Uncommon'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-700/40 text-slate-300 border-slate-600';
                  return (
                    <div
                      key={c.id}
                      className={`rounded-xl border p-3.5 text-xs ${
                        found ? 'border-emerald-500/50 bg-slate-950' : 'border-slate-800 bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white">{c.name}</span>
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                          {c.rarity}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-300">
                        {found ? c.description : `Petunjuk Lokasi: ${c.hint}`}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className={found ? 'font-bold text-emerald-300' : 'text-slate-500'}>
                          {found ? 'Sudah Dikoleksi' : 'Belum Ditemukan'}
                        </span>
                        <span className="text-amber-300">
                          +{c.xpReward} XP · +{c.coinReward} Koin
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'misi' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-white">
                  Daftar Misi & Studi Kasus · Stage {misiStageView}
                </h3>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    data-testid="misi-stage-1-btn"
                    onClick={() => setMisiStageView(1)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      misiStageView === 1
                        ? 'bg-amber-500 text-slate-950'
                        : 'border border-slate-700 bg-slate-950 text-slate-300'
                    }`}
                  >
                    Misi Stage 1
                  </button>
                  <button
                    type="button"
                    data-testid="misi-stage-2-btn"
                    onClick={() => setMisiStageView(2)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      misiStageView === 2
                        ? 'bg-sky-500 text-slate-950'
                        : 'border border-slate-700 bg-slate-950 text-slate-300'
                    }`}
                  >
                    Misi Stage 2
                  </button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-7">
                  {(viewingS2Misi ? STAGE2_QUESTS : STAGE1_QUESTS).map((q) => {
                    const prog = viewingS2Misi
                      ? s2.quests[q.id] ?? { status: 'available', stepIndex: 0 }
                      : s1.quests[q.id] ?? { status: 'available', stepIndex: 0 };
                    const isTracked = viewingS2Misi ? s2.trackedQuestId === q.id : s1.trackedQuestId === q.id;
                    const customIds: string[] = [
                      ...('unlockCosmeticId' in q.rewards &&
                      typeof q.rewards.unlockCosmeticId === 'string'
                        ? [q.rewards.unlockCosmeticId]
                        : []),
                      ...(q.rewards.unlockCustomizationIds ?? []),
                    ];
                    return (
                      <div
                        key={q.id}
                        className={`rounded-xl border p-3.5 text-xs ${
                          prog.status === 'completed'
                            ? 'border-emerald-500/40 bg-emerald-950/20'
                            : prog.status === 'active'
                              ? 'border-amber-500/60 bg-slate-950'
                              : 'border-slate-800 bg-slate-950/75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                q.kind === 'main'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-sky-500/20 text-sky-300'
                              }`}
                            >
                              {q.kind === 'main' ? 'Utama' : 'Sampingan'}
                            </span>
                            <span className="text-sm font-bold text-white">{q.title}</span>
                          </div>
                          {prog.status === 'available' && (
                            <button
                              type="button"
                              data-testid={`accept-quest-${q.id}`}
                              onClick={() => onAcceptQuest(q.id)}
                              className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-400"
                            >
                              Ambil Misi
                            </button>
                          )}
                          {prog.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => onTrackQuest(q.id)}
                              className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                isTracked
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'border border-amber-400/60 text-amber-300 hover:bg-amber-500/15'
                              }`}
                            >
                              {isTracked ? 'Sedang Dilacak' : 'Lacak'}
                            </button>
                          )}
                          {prog.status === 'completed' && (
                            <span className="flex items-center gap-1 font-bold text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-slate-300">{q.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold">
                          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300">
                            +{q.rewards.xp} XP
                          </span>
                          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">
                            +{q.rewards.coins} Koin
                          </span>
                          {q.rewards.itemId && (
                            <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-sky-300">
                              Item: {getItemDefById(q.rewards.itemId)?.name ?? q.rewards.itemId}
                            </span>
                          )}
                          {customIds.map((cid) => (
                            <span key={cid} className="rounded bg-pink-500/15 px-1.5 py-0.5 text-pink-300">
                              Busana: {CUSTOMIZATION_ITEMS.find((c) => c.id === cid)?.name ?? cid}
                            </span>
                          ))}
                          {q.rewards.unlockBlueprintId && (
                            <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-orange-300">
                              Cetak Biru:{' '}
                              {BUILDING_CATALOG.find((b) => b.id === q.rewards.unlockBlueprintId)?.name ??
                                q.rewards.unlockBlueprintId}
                            </span>
                          )}
                          {q.rewards.unlockTitleId && (
                            <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-purple-300">
                              Gelar:{' '}
                              {PLAYER_TITLES.find((t) => t.id === q.rewards.unlockTitleId)?.name ??
                                q.rewards.unlockTitleId}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 border-t border-slate-800 pt-2">
                          {q.steps.map((s, idx) => {
                            const stepDone = prog.status === 'completed' || idx < prog.stepIndex;
                            const stepNow = prog.status === 'active' && idx === prog.stepIndex;
                            return (
                              <div
                                key={s.id}
                                className={`flex items-center gap-2 text-[11px] ${
                                  stepDone
                                    ? 'text-emerald-300 line-through opacity-80'
                                    : stepNow
                                      ? 'font-bold text-amber-300'
                                      : 'text-slate-500'
                                }`}
                              >
                                <span>{stepDone ? '✓' : stepNow ? '▶' : '•'}</span>
                                <span>{s.description}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 lg:col-span-5">
                  <h3 className="text-xs font-bold text-amber-300 uppercase">
                    Studi Kasus Sosiologi Stage {misiStageView}
                  </h3>
                  {stageChallenges.map((ch) => {
                    const done = s1.resolvedChallengeIds.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        disabled={done}
                        onClick={() => onOpenChallenge(ch)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border p-3.5 text-left text-xs font-semibold ${
                          done
                            ? 'border-emerald-500/35 bg-emerald-950/20 text-emerald-300'
                            : 'border-amber-500/50 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
                        }`}
                      >
                        <span>{ch.title}</span>
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
                        )}
                      </button>
                    );
                  })}

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Factory className="h-3.5 w-3.5 text-sky-400" /> Status Era Dunia Terbuka
                    </div>
                    <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
                      <li className="text-emerald-300">✓ Stage 1: Kota Perdagangan — TERBUKA</li>
                      <li className="text-sky-300">✓ Stage 2: Kota Industri Global — TERBUKA (Naik Kapal di Dermaga!)</li>
                      <li className="flex items-center gap-1 text-slate-500">
                        <Lock className="h-3 w-3" /> Stage 3: Kota Digital Tanpa Batas — TERKUNCI
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pencapaian' && (
            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-sm font-extrabold text-white">
                  Pencapaian Stage 1: Kota Perdagangan ({s1.achievements.length}/{STAGE1_ACHIEVEMENTS.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {STAGE1_ACHIEVEMENTS.map((a) => {
                    const unlocked = s1.achievements.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        className={`rounded-xl border p-3.5 text-xs ${
                          unlocked ? 'border-amber-400/60 bg-slate-950' : 'border-slate-800 bg-slate-950/60 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{a.title}</span>
                          <span className={unlocked ? 'font-bold text-emerald-300' : 'text-slate-500'}>
                            {unlocked ? 'Terbuka' : 'Terkunci'}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-300">{a.description}</p>
                        <div className="mt-2 text-[11px] font-semibold text-amber-300">
                          Hadiah: +{a.xpReward} XP · +{a.coinReward} Koin
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-extrabold text-sky-300">
                  Pencapaian Stage 2: Kota Industri Global ({s2.achievements.length}/{STAGE2_ACHIEVEMENTS.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {STAGE2_ACHIEVEMENTS.map((a) => {
                    const unlocked = s2.achievements.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        className={`rounded-xl border p-3.5 text-xs ${
                          unlocked ? 'border-sky-400/60 bg-slate-950' : 'border-slate-800 bg-slate-950/60 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{a.title}</span>
                          <span className={unlocked ? 'font-bold text-emerald-300' : 'text-slate-500'}>
                            {unlocked ? 'Terbuka' : 'Terkunci'}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-300">{a.description}</p>
                        <div className="mt-2 text-[11px] font-semibold text-sky-300">
                          Hadiah: +{a.xpReward} XP · +{a.coinReward} Koin
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sosial' && (
            <div className="grid gap-5 lg:grid-cols-12" data-testid="multiplayer-social-tab">
              {/* Left: Connection Status, Player Identity, Create/Join Room */}
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Status Koneksi</span>
                    {mpSession.room ? (
                      <span
                        data-testid="mp-status-badge"
                        className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300"
                      >
                        <Wifi className="h-3 w-3" /> Online · Ruang {mpSession.room.code}
                      </span>
                    ) : (
                      <span
                        data-testid="mp-status-badge"
                        className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300"
                      >
                        <WifiOff className="h-3 w-3" /> Mode Solo Offline
                      </span>
                    )}
                  </div>
                  {mpSession.lastError && (
                    <div className="mt-2 rounded-lg border border-rose-500/40 bg-rose-950/50 p-2 text-[11px] text-rose-200">
                      {mpSession.lastError}
                    </div>
                  )}

                  <label className="mt-3 block text-[10px] font-bold text-amber-300 uppercase">
                    Nama Pemain Anda
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    data-testid="mp-display-name-input"
                    value={state.displayName}
                    onChange={(e) => onUpdateDisplayName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white outline-none focus:border-amber-400"
                  />
                </div>

                {!mpSession.room ? (
                  <>
                    {/* Create Room */}
                    <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                      <div className="font-bold text-amber-300 uppercase">Buat Ruang Bermain Bersama</div>
                      <input
                        type="text"
                        maxLength={32}
                        data-testid="mp-create-room-name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Nama ruang kota..."
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Tipe Ruang:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNewRoomPublic(true)}
                            className={`rounded px-2.5 py-1 text-[11px] font-bold ${
                              newRoomPublic
                                ? 'bg-sky-500 text-slate-950'
                                : 'border border-slate-700 bg-slate-900 text-slate-300'
                            }`}
                          >
                            Publik
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewRoomPublic(false)}
                            className={`rounded px-2.5 py-1 text-[11px] font-bold ${
                              !newRoomPublic
                                ? 'bg-amber-500 text-slate-950'
                                : 'border border-slate-700 bg-slate-900 text-slate-300'
                            }`}
                          >
                            Privat (Kode)
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        data-testid="mp-create-room-btn"
                        onClick={() => onCreateRoom(newRoomName, newRoomPublic)}
                        className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
                      >
                        Buat Ruang & Hubungkan
                      </button>
                    </div>

                    {/* Join by Code */}
                    <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                      <div className="font-bold text-sky-300 uppercase">Gabung Lewat Kode Undangan</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={8}
                          data-testid="mp-join-code-input"
                          value={joinCodeInput}
                          onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                          placeholder="Contoh: A1B2C"
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 font-mono-num text-xs font-bold text-white uppercase outline-none focus:border-sky-400"
                        />
                        <button
                          type="button"
                          data-testid="mp-join-code-btn"
                          disabled={!joinCodeInput.trim()}
                          onClick={() => onJoinRoom(joinCodeInput)}
                          className="rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                        >
                          Gabung
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-300 uppercase">Ruang Aktif</div>
                        <div className="text-sm font-extrabold text-white">{mpSession.room.name}</div>
                      </div>
                      <span
                        data-testid="mp-room-code-display"
                        className="rounded-lg border border-emerald-400/50 bg-slate-950 px-2.5 py-1 font-mono-num text-xs font-extrabold text-amber-300"
                      >
                        {mpSession.room.code}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        data-testid="mp-copy-invite-btn"
                        onClick={handleCopyInvite}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sky-400/50 bg-sky-950/60 py-1.5 text-[11px] font-bold text-sky-200 hover:bg-sky-900/70"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedInvite ? 'Tautan Undangan Disalin!' : 'Salin Tautan (?room)'}
                      </button>
                      <button
                        type="button"
                        data-testid="mp-leave-room-btn"
                        onClick={onLeaveRoom}
                        className="rounded-lg border border-rose-500/50 bg-rose-950/60 px-3 py-1.5 text-[11px] font-bold text-rose-200 hover:bg-rose-900/70"
                      >
                        Keluar
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={onGoOffline}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white"
                    >
                      Kembali ke Mode Solo Offline
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Public Rooms Browser (Offline/Lobby) OR Live Roster, Emotes & Safe Chat */}
              <div className="space-y-4 lg:col-span-7">
                {!mpSession.room ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="font-bold text-white">Daftar Ruang Publik Aktif</div>
                      <button
                        type="button"
                        data-testid="mp-refresh-rooms-btn"
                        onClick={onRefreshRooms}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:border-amber-400"
                      >
                        <RefreshCw className="h-3 w-3" /> Muat Ulang
                      </button>
                    </div>
                    {publicRooms.length === 0 ? (
                      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 text-center text-slate-400">
                        Belum ada ruang publik terbuka saat ini. Kamu bisa membuat ruang baru di sebelah kiri atau tetap bermain di Mode Solo Offline tanpa hambatan!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {publicRooms.map((r) => (
                          <div
                            key={r.code}
                            data-testid={`mp-public-room-${r.code}`}
                            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3"
                          >
                            <div>
                              <div className="font-bold text-white">
                                {r.name}{' '}
                                <span className="ml-1 font-mono-num text-[10px] text-amber-300">[{r.code}]</span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Host: {r.hostName} · Pemain: {r.playerCount}/{r.maxPlayers} · Stage {r.stage}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onJoinRoom(r.code)}
                              className="rounded-lg bg-sky-500 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-sky-400"
                            >
                              Gabung
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Active Room Player Roster */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-bold text-amber-300 uppercase">
                          Pemain di Ruang ({mpSession.members.length}/{mpSession.room.maxPlayers})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Avatar 3D tampil otomatis pada Stage yang sama
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2" data-testid="mp-member-roster">
                        {mpSession.members.map((m) => {
                          const tDef = PLAYER_TITLES.find((t) => t.id === m.titleId);
                          const isMe = m.id === mpSession.clientId;
                          const isHost = m.id === mpSession.hostClientId;
                          return (
                            <div
                              key={m.id}
                              className={`flex items-center justify-between rounded-lg border px-2.5 py-2 ${
                                isMe
                                  ? 'border-emerald-500/50 bg-emerald-950/30'
                                  : 'border-slate-800 bg-slate-900'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="truncate font-bold text-white">
                                  {m.name} {isMe ? '(Kamu)' : ''} {isHost ? '· Host' : ''}
                                </div>
                                <div className="truncate text-[10px]" style={{ color: tDef?.colorHex ?? '#94a3b8' }}>
                                  {tDef?.name ?? 'Wali Kota'}
                                </div>
                              </div>
                              <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                                Stg {m.stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Emotes & Safe Text Chat */}
                    <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-sky-300 uppercase">Pose & Obrolan Ruang</span>
                        <div className="flex flex-wrap gap-1.5">
                          {SAFE_EMOTE_OPTIONS.map((em) => (
                            <button
                              key={em.id}
                              type="button"
                              data-testid={`mp-emote-${em.id}`}
                              onClick={() => onTriggerEmote(em.id)}
                              className="rounded-lg border border-pink-500/40 bg-pink-950/40 px-2 py-1 text-[10px] font-bold text-pink-200 hover:bg-pink-900/50"
                            >
                              {em.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div
                        data-testid="mp-chat-log"
                        className="h-36 space-y-1.5 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/80 p-2.5"
                      >
                        {mpSession.chatMessages.length === 0 ? (
                          <div className="text-center text-[11px] text-slate-500">
                            Belum ada pesan. Sapalah rekan wali kota dengan teks atau pesan cepat!
                          </div>
                        ) : (
                          mpSession.chatMessages.map((msg) => (
                            <div key={msg.id} className="text-[11px]">
                              <span className="font-bold text-amber-300">{msg.senderName}: </span>
                              <span className="text-slate-100">{msg.text}</span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {SAFE_QUICK_CHAT_PRESETS.map((q) => (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => onSendChat(q.text, q.id)}
                            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-300 hover:border-sky-400 hover:text-white"
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>

                      <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!chatInput.trim()) return;
                          onSendChat(chatInput);
                          setChatInput('');
                        }}
                      >
                        <input
                          type="text"
                          maxLength={140}
                          data-testid="mp-chat-input"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Tulis pesan santun untuk teman satu ruang..."
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-400"
                        />
                        <button
                          type="submit"
                          data-testid="mp-chat-send-btn"
                          className="flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-sky-400"
                        >
                          <Send className="h-3.5 w-3.5" /> Kirim
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pengaturan' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 uppercase">
                  <Sun className="h-4 w-4" /> Waktu Dunia & Kamera
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200">Siklus Siang–Malam Otomatis</span>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ dayNightAuto: !s1.settings.dayNightAuto })}
                    className={`rounded-lg px-3 py-1 font-bold ${
                      s1.settings.dayNightAuto
                        ? 'bg-emerald-500 text-slate-950'
                        : 'border border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    {s1.settings.dayNightAuto ? 'Aktif' : 'Manual'}
                  </button>
                </div>

                <div>
                  <div className="mb-1.5 text-slate-300">Pilih Waktu Cepat:</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: 'Pagi', val: 0.24 },
                      { label: 'Siang', val: 0.36 },
                      { label: 'Sore', val: 0.69 },
                      { label: 'Malam', val: 0.9 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onUpdateSettings({ dayNightAuto: false, timeOfDay: preset.val })}
                        className={`rounded-lg border py-1.5 font-bold ${
                          Math.abs(s1.settings.timeOfDay - preset.val) < 0.08
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                            : 'border-slate-700 bg-slate-900 text-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-slate-300">
                    <span>Sensitivitas Kamera Mouse</span>
                    <span className="font-mono-num font-bold text-white">
                      {s1.settings.cameraSensitivity.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={s1.settings.cameraSensitivity}
                    onChange={(e) => onUpdateSettings({ cameraSensitivity: Number(e.target.value) })}
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs">
                <div className="font-bold text-amber-300 uppercase">Audio & Penyimpanan Progres</div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200">Efek Suara Game</span>
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-bold text-white"
                  >
                    {muted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
                    {muted ? 'Bisukan' : 'Aktif'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200">Musik Latar</span>
                  <button
                    type="button"
                    onClick={onToggleBgm}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-bold text-white"
                  >
                    <Music className="h-3.5 w-3.5 text-amber-400" />
                    {bgmActive ? 'Nyala' : 'Mati'}
                  </button>
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <p className="mb-2 text-[11px] text-slate-400">
                    Progres Stage 1 & Stage 2, kostum, gelar, dan inventaris disimpan otomatis ke penyimpanan browser (localStorage).
                  </p>
                  <button
                    type="button"
                    data-testid="reset-stage1-progress-btn"
                    onClick={onResetProgress}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/50 bg-rose-950/60 py-2 font-bold text-rose-200 hover:bg-rose-900/70"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Progres Dunia Nusantara dari Awal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
