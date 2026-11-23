import React, { useEffect, useState } from 'react';
import { Check, Dices, Lock, RotateCcw, Smile, Sparkles, UserCheck } from 'lucide-react';
import {
  BODY_TYPES,
  CHARACTER_PRESETS,
  CharacterAppearance,
  CosmeticRarity,
  CUSTOMIZATION_ITEMS,
  CustomizationSlot,
  DEFAULT_CHARACTER_APPEARANCE,
  EYE_COLORS,
  EYE_SHAPES,
  EYEBROW_STYLES,
  FACE_PRESETS,
  HAIR_COLORS,
  MOUTH_PRESETS,
  NOSE_PRESETS,
  PLAYER_TITLES,
  SKIN_TONES,
} from '../../game/stage1Data';
import { randomizeUnlockedAppearance } from '../../game/stage1WorldLogic';
import { FacialExpression } from '../../game/threeCharacterRig';
import { CharacterPreview3D } from './CharacterPreview3D';

type StudioTabId = 'wajah' | 'busana' | 'aksesoris';
type OwnershipFilter = 'all' | 'owned' | 'locked';

interface CharacterCustomizerStudioProps {
  savedAppearance: CharacterAppearance;
  unlockedCustomizationIds: string[];
  unlockedTitles: string[];
  equippedTitle: string;
  previewExpression: FacialExpression;
  displayName?: string;
  onChangeDisplayName?: (name: string) => void;
  onChangeExpression: (expr: FacialExpression) => void;
  onApplyAppearance: (appearance: CharacterAppearance) => void;
  onEquipTitle: (titleId: string) => void;
  onApplyPreset?: (presetId: string) => void;
}

const EXPRESSIONS: { id: FacialExpression; label: string }[] = [
  { id: 'neutral', label: 'Netral' },
  { id: 'smiling', label: 'Senyum' },
  { id: 'talking', label: 'Bicara' },
  { id: 'happy', label: 'Bahagia' },
  { id: 'surprised', label: 'Terkejut' },
];

export const RARITY_BADGE_STYLES: Record<CosmeticRarity, string> = {
  Common: 'border-slate-600 bg-slate-800/70 text-slate-300',
  Uncommon: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300',
  Rare: 'border-sky-500/50 bg-sky-500/15 text-sky-300',
  Epic: 'border-purple-500/50 bg-purple-500/15 text-purple-300',
  Legendary: 'border-amber-400/60 bg-amber-500/20 text-amber-300',
  'Special Event': 'border-pink-400/60 bg-pink-500/20 text-pink-300',
};

export const CharacterCustomizerStudio: React.FC<CharacterCustomizerStudioProps> = ({
  savedAppearance,
  unlockedCustomizationIds,
  unlockedTitles,
  equippedTitle,
  previewExpression,
  displayName,
  onChangeDisplayName,
  onChangeExpression,
  onApplyAppearance,
  onEquipTitle,
  onApplyPreset,
}) => {
  const [draft, setDraft] = useState<CharacterAppearance>(savedAppearance);
  const [studioTab, setStudioTab] = useState<StudioTabId>('wajah');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');

  useEffect(() => {
    setDraft(savedAppearance);
  }, [savedAppearance]);

  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(savedAppearance);
  const totalCostumes = CUSTOMIZATION_ITEMS.length;
  const ownedCostumes = CUSTOMIZATION_ITEMS.filter((i) => unlockedCustomizationIds.includes(i.id)).length;

  const handleSelectPreset = (presetId: string) => {
    const preset = CHARACTER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setDraft((prev) => ({
      ...prev,
      ...preset.appearance,
      hairstyle:
        preset.appearance.hairstyle && unlockedCustomizationIds.includes(preset.appearance.hairstyle)
          ? preset.appearance.hairstyle
          : prev.hairstyle,
      shirtId:
        preset.appearance.shirtId && unlockedCustomizationIds.includes(preset.appearance.shirtId)
          ? preset.appearance.shirtId
          : prev.shirtId,
      jacketId:
        preset.appearance.jacketId && unlockedCustomizationIds.includes(preset.appearance.jacketId)
          ? preset.appearance.jacketId
          : prev.jacketId,
      pantsId:
        preset.appearance.pantsId && unlockedCustomizationIds.includes(preset.appearance.pantsId)
          ? preset.appearance.pantsId
          : prev.pantsId,
      shoeId:
        preset.appearance.shoeId && unlockedCustomizationIds.includes(preset.appearance.shoeId)
          ? preset.appearance.shoeId
          : prev.shoeId,
      hatId:
        preset.appearance.hatId && unlockedCustomizationIds.includes(preset.appearance.hatId)
          ? preset.appearance.hatId
          : prev.hatId,
      glassesId:
        preset.appearance.glassesId && unlockedCustomizationIds.includes(preset.appearance.glassesId)
          ? preset.appearance.glassesId
          : prev.glassesId,
      bagId:
        preset.appearance.bagId && unlockedCustomizationIds.includes(preset.appearance.bagId)
          ? preset.appearance.bagId
          : prev.bagId,
      accessoryId:
        preset.appearance.accessoryId && unlockedCustomizationIds.includes(preset.appearance.accessoryId)
          ? preset.appearance.accessoryId
          : prev.accessoryId,
    }));
    onApplyPreset?.(presetId);
  };

  const renderSlotSection = (
    title: string,
    slot: CustomizationSlot,
    selectedId: string,
    onSelect: (id: string) => void
  ) => {
    const items = CUSTOMIZATION_ITEMS.filter((i) => {
      if (i.slot !== slot) return false;
      const unlocked = unlockedCustomizationIds.includes(i.id);
      if (ownershipFilter === 'owned') return unlocked;
      if (ownershipFilter === 'locked') return !unlocked;
      return true;
    });
    if (items.length === 0) return null;

    return (
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-amber-300 uppercase">{title}</div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {items.map((item) => {
            const unlocked = unlockedCustomizationIds.includes(item.id);
            const active = selectedId === item.id;
            const rarity: CosmeticRarity = item.rarity ?? 'Common';
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`custom-item-${item.id}`}
                disabled={!unlocked}
                onClick={() => onSelect(item.id)}
                className={`rounded-xl border p-2.5 text-left text-xs transition-colors ${
                  active
                    ? 'border-amber-400 bg-amber-500/15'
                    : unlocked
                      ? 'border-slate-800 bg-slate-950 hover:border-slate-600'
                      : 'border-slate-800/80 bg-slate-950/50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-2 font-bold text-white min-w-0">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-white/40"
                      style={{ backgroundColor: item.primaryHex }}
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`rounded border px-1 py-0.5 text-[9px] font-bold ${RARITY_BADGE_STYLES[rarity]}`}>
                      {rarity}
                    </span>
                    {active ? (
                      <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950">
                        Dipilih
                      </span>
                    ) : !unlocked ? (
                      <Lock className="h-3.5 w-3.5 text-slate-500" />
                    ) : null}
                  </div>
                </div>
                <div className="mt-1 line-clamp-2 text-[10px] text-slate-400">
                  {unlocked ? item.description : `Cara buka: ${item.unlockHint}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12" data-testid="character-customizer-studio">
      {/* Left: Live Interactive 3D Viewport + Expressions + Presets + Save Actions */}
      <div className="space-y-3 lg:col-span-5">
        <CharacterPreview3D appearance={draft} expression={previewExpression} />

        {typeof displayName === 'string' && onChangeDisplayName && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <label className="block text-[10px] font-bold text-amber-300 uppercase">
              Nama Wali Kota (Tampil di Solo & Multiplayer)
            </label>
            <input
              type="text"
              maxLength={24}
              data-testid="customizer-display-name-input"
              value={displayName}
              onChange={(e) => onChangeDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white outline-none focus:border-amber-400"
            />
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-sky-300 uppercase">
            <Smile className="h-3.5 w-3.5" /> Uji Ekspresi Wajah 3D
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXPRESSIONS.map((exp) => (
              <button
                key={exp.id}
                type="button"
                data-testid={`expr-btn-${exp.id}`}
                onClick={() => onChangeExpression(exp.id)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  previewExpression === exp.id
                    ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'
                }`}
              >
                {exp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="randomize-appearance-btn"
              onClick={() => setDraft(randomizeUnlockedAppearance(unlockedCustomizationIds))}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-2 text-xs font-bold text-slate-200 hover:border-amber-400"
            >
              <Dices className="h-3.5 w-3.5 text-amber-400" />
              Acak Tampilan
            </button>
            <button
              type="button"
              data-testid="reset-appearance-btn"
              onClick={() => setDraft({ ...DEFAULT_CHARACTER_APPEARANCE })}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-2 text-xs font-bold text-slate-300 hover:border-rose-400"
            >
              <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
              Reset Standar
            </button>
          </div>
          <button
            type="button"
            data-testid="save-appearance-btn"
            onClick={() => onApplyAppearance(draft)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg hover:bg-emerald-400"
          >
            <Check className="h-4 w-4" />
            {hasUnsavedChanges ? 'Terapkan & Simpan Karakter 3D' : 'Karakter Tersimpan (Klik untuk Terapkan)'}
          </button>
        </div>
      </div>

      {/* Right: Presets + Studio Customization Categories */}
      <div className="flex flex-col gap-3 lg:col-span-7">
        {/* Preset Quick Strip */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase">
            <span className="text-amber-300">Preset Gaya Siap Pakai</span>
            <span className="text-slate-400">
              Lemari Busana: {ownedCostumes}/{totalCostumes} Terbuka
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CHARACTER_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                data-testid={`preset-btn-${p.id}`}
                onClick={() => handleSelectPreset(p.id)}
                title={p.tagline}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:border-amber-400"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.badgeColor }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'wajah', label: 'Wajah & Rambut' },
                { id: 'busana', label: 'Tubuh & Busana' },
                { id: 'aksesoris', label: 'Aksesoris & Gelar' },
              ] as { id: StudioTabId; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`studio-tab-${t.id}`}
                onClick={() => setStudioTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  studioTab === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-800 bg-slate-950 text-slate-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-[10px]">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'owned', label: 'Dimiliki' },
                { id: 'locked', label: 'Terkunci' },
              ] as { id: OwnershipFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                data-testid={`studio-filter-${f.id}`}
                onClick={() => setOwnershipFilter(f.id)}
                className={`rounded-md px-2 py-1 font-bold ${
                  ownershipFilter === f.id
                    ? 'bg-sky-500 text-slate-950'
                    : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[440px] space-y-4 overflow-y-auto pr-1">
          {studioTab === 'wajah' && (
            <>
              <div>
                <div className="mb-1.5 text-[11px] font-bold text-amber-300 uppercase">Warna Kulit</div>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TONES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      data-testid={`skin-tone-${st.id}`}
                      onClick={() => setDraft((d) => ({ ...d, skinTone: st.id }))}
                      title={st.name}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                        draft.skinTone === st.id
                          ? 'border-amber-400 bg-amber-500/15 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300'
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white/40"
                        style={{ backgroundColor: st.hex }}
                      />
                      <span>{st.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 text-[11px] font-bold text-amber-300 uppercase">Struktur Wajah</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FACE_PRESETS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, facePreset: f.id }))}
                        className={`rounded-lg border py-1.5 text-[11px] font-bold ${
                          draft.facePreset === f.id
                            ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                            : 'border-slate-800 bg-slate-950 text-slate-300'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-[11px] font-bold text-amber-300 uppercase">Bentuk Mata</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EYE_SHAPES.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, eyeShape: e.id }))}
                        className={`rounded-lg border py-1.5 text-[11px] font-bold ${
                          draft.eyeShape === e.id
                            ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                            : 'border-slate-800 bg-slate-950 text-slate-300'
                        }`}
                      >
                        {e.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] font-bold text-amber-300 uppercase">Warna Iris Mata</div>
                <div className="flex flex-wrap gap-2">
                  {EYE_COLORS.map((ec) => (
                    <button
                      key={ec.id}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, eyeColor: ec.id }))}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                        draft.eyeColor === ec.id
                          ? 'border-amber-400 bg-amber-500/15 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300'
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-white/40"
                        style={{ backgroundColor: ec.hex }}
                      />
                      <span>{ec.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="mb-1.5 text-[11px] font-bold text-amber-300 uppercase">Alis</div>
                  <div className="space-y-1">
                    {EYEBROW_STYLES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, eyebrowStyle: b.id }))}
                        className={`w-full rounded-lg border px-2 py-1 text-left text-[11px] font-semibold ${
                          draft.eyebrowStyle === b.id
                            ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                            : 'border-slate-800 bg-slate-950 text-slate-300'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-[11px] font-bold text-amber-300 uppercase">Hidung</div>
                  <div className="space-y-1">
                    {NOSE_PRESETS.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, nosePreset: n.id }))}
                        className={`w-full rounded-lg border px-2 py-1 text-left text-[11px] font-semibold ${
                          draft.nosePreset === n.id
                            ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                            : 'border-slate-800 bg-slate-950 text-slate-300'
                        }`}
                      >
                        {n.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-[11px] font-bold text-amber-300 uppercase">Mulut</div>
                  <div className="space-y-1">
                    {MOUTH_PRESETS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, mouthPreset: m.id }))}
                        className={`w-full rounded-lg border px-2 py-1 text-left text-[11px] font-semibold ${
                          draft.mouthPreset === m.id
                            ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                            : 'border-slate-800 bg-slate-950 text-slate-300'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] font-bold text-amber-300 uppercase">Warna Rambut</div>
                <div className="flex flex-wrap gap-2">
                  {HAIR_COLORS.map((hc) => (
                    <button
                      key={hc.id}
                      type="button"
                      data-testid={`hair-color-${hc.id}`}
                      onClick={() => setDraft((d) => ({ ...d, hairColor: hc.id }))}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                        draft.hairColor === hc.id
                          ? 'border-amber-400 bg-amber-500/15 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300'
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-white/40"
                        style={{ backgroundColor: hc.hex }}
                      />
                      <span>{hc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {renderSlotSection('Gaya Rambut 3D', 'hairstyle', draft.hairstyle, (id) =>
                setDraft((d) => ({ ...d, hairstyle: id }))
              )}
            </>
          )}

          {studioTab === 'busana' && (
            <>
              <div>
                <div className="mb-1.5 text-[11px] font-bold text-amber-300 uppercase">Postur & Tipe Tubuh</div>
                <div className="grid grid-cols-3 gap-2">
                  {BODY_TYPES.map((bt) => (
                    <button
                      key={bt.id}
                      type="button"
                      data-testid={`body-type-${bt.id}`}
                      onClick={() => setDraft((d) => ({ ...d, bodyType: bt.id }))}
                      className={`rounded-xl border py-2 text-xs font-bold ${
                        draft.bodyType === bt.id
                          ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                          : 'border-slate-800 bg-slate-950 text-slate-300'
                      }`}
                    >
                      {bt.name}
                    </button>
                  ))}
                </div>
              </div>

              {renderSlotSection('Kemeja, Gaun, Hoodie & Olahraga', 'shirt', draft.shirtId, (id) =>
                setDraft((d) => ({ ...d, shirtId: id }))
              )}
              {renderSlotSection('Jaket, Rompi & Hoodie Luaran', 'jacket', draft.jacketId, (id) =>
                setDraft((d) => ({ ...d, jacketId: id }))
              )}
              {renderSlotSection('Celana, Rok & Kain Bawahan', 'pants', draft.pantsId, (id) =>
                setDraft((d) => ({ ...d, pantsId: id }))
              )}
              {renderSlotSection('Sepatu & Alas Kaki', 'shoes', draft.shoeId, (id) =>
                setDraft((d) => ({ ...d, shoeId: id }))
              )}
              {renderSlotSection('Penutup Kepala & Helm 3D', 'hat', draft.hatId, (id) =>
                setDraft((d) => ({ ...d, hatId: id }))
              )}
            </>
          )}

          {studioTab === 'aksesoris' && (
            <>
              {renderSlotSection('Kacamata & Goggles 3D', 'glasses', draft.glassesId, (id) =>
                setDraft((d) => ({ ...d, glassesId: id }))
              )}
              {renderSlotSection('Tas & Ransel', 'bag', draft.bagId, (id) =>
                setDraft((d) => ({ ...d, bagId: id }))
              )}
              {renderSlotSection('Jam Tangan, Masker, Ikat Kepala & Lencana', 'accessory', draft.accessoryId, (id) =>
                setDraft((d) => ({ ...d, accessoryId: id }))
              )}

              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase">
                  <Sparkles className="h-3.5 w-3.5" /> Gelar Kehormatan Wali Kota
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PLAYER_TITLES.map((t) => {
                    const unlocked = unlockedTitles.includes(t.id);
                    const equipped = equippedTitle === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        data-testid={`title-btn-${t.id}`}
                        disabled={!unlocked}
                        onClick={() => onEquipTitle(t.id)}
                        className={`rounded-xl border p-2.5 text-left text-xs ${
                          equipped
                            ? 'border-amber-400 bg-amber-500/15'
                            : unlocked
                              ? 'border-slate-800 bg-slate-950 hover:border-slate-600'
                              : 'border-slate-800/70 bg-slate-950/50 opacity-55 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold" style={{ color: unlocked ? t.colorHex : '#94a3b8' }}>
                            {t.name}
                          </span>
                          {equipped ? (
                            <span className="flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950">
                              <UserCheck className="h-2.5 w-2.5" /> Aktif
                            </span>
                          ) : !unlocked ? (
                            <Lock className="h-3.5 w-3.5 text-slate-500" />
                          ) : null}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">
                          {unlocked ? t.description : `Cara buka: ${t.unlockHint}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
