import { CharacterId, VehicleKind } from './types';

export type DistrictId =
  | 'pusat-kota'
  | 'pasar-tradisional'
  | 'pelabuhan'
  | 'permukiman'
  | 'industri'
  | 'pendidikan'
  | 'wisata-alam';

export interface DistrictDef {
  id: DistrictId;
  name: string;
  subtitle: string;
  description: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  colorHex: string;
  discoveryXp: number;
}

export const STAGE1_DISTRICTS: DistrictDef[] = [
  {
    id: 'pusat-kota',
    name: 'Pusat Kota & Alun-Alun',
    subtitle: 'Jantung Pemerintahan & Interaksi Sosial',
    description: 'Alun-alun utama dengan Balai Kota Nusantara, Tugu Gerbang, taman warga, dan pos koordinasi pembangunan.',
    minX: -24,
    maxX: 18,
    minZ: -26,
    maxZ: 28,
    centerX: -3,
    centerZ: 0,
    colorHex: '#f59e0b',
    discoveryXp: 35,
  },
  {
    id: 'pasar-tradisional',
    name: 'Kawasan Pasar Tradisional',
    subtitle: 'Sentra Rempah, Kain Batik & Kuliner',
    description: 'Pusat jual beli komoditas Nusantara dengan Pasar Utama yang bisa dimasuki, kios rempah, dan lorong pedagang.',
    minX: 18,
    maxX: 48,
    minZ: -48,
    maxZ: 26,
    centerX: 32,
    centerZ: -12,
    colorHex: '#d97706',
    discoveryXp: 40,
  },
  {
    id: 'pelabuhan',
    name: 'Kawasan Pelabuhan & Pesisir',
    subtitle: 'Dermaga Jalur Rempah & Kapal Pinisi',
    description: 'Pesisir pantai, 3 dermaga aktif, Gudang Pelabuhan, kapal layar yang bisa dinaiki, serta perahu teluk.',
    minX: 48,
    maxX: 165,
    minZ: -54,
    maxZ: 54,
    centerX: 70,
    centerZ: 0,
    colorHex: '#0ea5e9',
    discoveryXp: 45,
  },
  {
    id: 'permukiman',
    name: 'Kawasan Permukiman Warga',
    subtitle: 'Kampung Adat, Warung & Pendopo',
    description: 'Lingkungan tempat tinggal warga dengan Rumah Adat Utama, rumah joglo, tempat ibadah, dan taman kampung.',
    minX: -54,
    maxX: -24,
    minZ: -48,
    maxZ: 48,
    centerX: -38,
    centerZ: 0,
    colorHex: '#10b981',
    discoveryXp: 40,
  },
  {
    id: 'industri',
    name: 'Kawasan Industri & Logistik',
    subtitle: 'Bengkel Kerajinan & Distribusi Barang',
    description: 'Zona pengolahan bahan lokal bernilai tambah, bengkel kerajinan, gudang distribusi, dan pedati barang.',
    minX: -24,
    maxX: 48,
    minZ: 28,
    maxZ: 96,
    centerX: 22,
    centerZ: 44,
    colorHex: '#ea580c',
    discoveryXp: 45,
  },
  {
    id: 'pendidikan',
    name: 'Kawasan Pendidikan & Budaya',
    subtitle: 'Sekolah, Perpustakaan & Riset',
    description: 'Pusat literasi dan pelestarian sejarah Nusantara dengan Sekolah & Perpustakaan yang dapat dijelajahi.',
    minX: -54,
    maxX: 48,
    minZ: -96,
    maxZ: -48,
    centerX: -16,
    centerZ: -66,
    colorHex: '#6366f1',
    discoveryXp: 45,
  },
  {
    id: 'wisata-alam',
    name: 'Kawasan Wisata, Sungai & Alam',
    subtitle: 'Jembatan Sungai, Air Terjun & Bukit Hijau',
    description: 'Hutan tropis, Sungai Nusantara dengan jembatan lengkung, Air Terjun, puncak bukit panorama, dan situs budaya.',
    minX: -115,
    maxX: -56,
    minZ: -96,
    maxZ: 96,
    centerX: -84,
    centerZ: -38,
    colorHex: '#22c55e',
    discoveryXp: 55,
  },
];

export type ItemCategory = 'quest' | 'consumable' | 'material';

export interface Stage1ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  effectLabel: string;
  iconKey: string;
}

export const STAGE1_ITEMS: Stage1ItemDef[] = [
  {
    id: 'karung-cengkih',
    name: 'Karung Cengkih Pilihan',
    category: 'quest',
    description: 'Komoditas rempah unggulan Nusantara dari Gudang Pelabuhan untuk pedagang pasar.',
    effectLabel: 'Barang Misi Pasar',
    iconKey: 'package',
  },
  {
    id: 'kain-batik-pesisir',
    name: 'Gulungan Kain Batik Pesisir',
    category: 'quest',
    description: 'Kain batik motif akulturasi Nusantara-Gujarat hasil tenunan pengrajin lokal.',
    effectLabel: 'Barang Misi Pasar',
    iconKey: 'shirt',
  },
  {
    id: 'ramuan-herbal',
    name: 'Jamu & Ramuan Herbal',
    category: 'quest',
    description: 'Ramuan tradisional sehat untuk menjaga kebugaran warga permukiman.',
    effectLabel: 'Barang Misi Warga',
    iconKey: 'heart',
  },
  {
    id: 'paket-buku',
    name: 'Paket Buku & Lontar',
    category: 'quest',
    description: 'Bahan ajar literasi budaya dan niaga untuk Sekolah Nusantara.',
    effectLabel: 'Barang Misi Pendidikan',
    iconKey: 'book',
  },
  {
    id: 'hasil-tangkapan',
    name: 'Keranjang Ikan Segar',
    category: 'quest',
    description: 'Hasil tangkapan pagi nelayan Dermaga Utara siap dikirim ke kios kuliner.',
    effectLabel: 'Barang Misi Nelayan',
    iconKey: 'fish',
  },
  {
    id: 'kopi-rempah',
    name: 'Kopi Rempah Hangat',
    category: 'consumable',
    description: 'Minuman khas pelabuhan Nusantara yang memulihkan semangat warga & memberi bonus XP.',
    effectLabel: 'Gunakan: +25 XP & +4 Kebahagiaan',
    iconKey: 'coffee',
  },
  {
    id: 'palu-arsitek',
    name: 'Palu Arsitek Nusantara',
    category: 'consumable',
    description: 'Perkakas tukang ahli untuk mempercepat penyelesaian proyek bangunan aktif.',
    effectLabel: 'Gunakan: Selesaikan Konstruksi Aktif +45%',
    iconKey: 'hammer',
  },
  {
    id: 'kompas-nakhoda',
    name: 'Kompas Nakhoda Emas',
    category: 'consumable',
    description: 'Alat navigasi maritim yang menambah wawasan IPTEK & Reputasi Kota saat digunakan.',
    effectLabel: 'Gunakan: +35 XP & +3 Reputasi',
    iconKey: 'compass',
  },
];

export type CollectibleRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type CollectibleCategory = 'batik' | 'kerajinan' | 'kapal' | 'wayang' | 'sejarah' | 'souvenir';

export interface CollectibleDef {
  id: string;
  name: string;
  category: CollectibleCategory;
  rarity: CollectibleRarity;
  districtId: DistrictId;
  x: number;
  z: number;
  yOffset?: number;
  hint: string;
  description: string;
  xpReward: number;
  coinReward: number;
  cultureBonus: number;
}

export const STAGE1_COLLECTIBLES: CollectibleDef[] = [
  {
    id: 'col-kain-batik',
    name: 'Kain Batik Tulis Pesisir',
    category: 'batik',
    rarity: 'Common',
    districtId: 'pasar-tradisional',
    x: 34.5,
    z: -16.8,
    yOffset: 0.22,
    hint: 'Di dalam Pasar Utama Nusantara dekat kios kain.',
    description: 'Kain batik pesisir bermotif mega mendung dan perahu niaga yang memadukan budaya lokal dan asing.',
    xpReward: 40,
    coinReward: 65,
    cultureBonus: 4,
  },
  {
    id: 'col-rempah-emas',
    name: 'Toples Rempah Emas Maluku',
    category: 'sejarah',
    rarity: 'Common',
    districtId: 'pelabuhan',
    x: 40.5,
    z: -24.2,
    yOffset: 0.22,
    hint: 'Di dalam Gudang Pelabuhan di tepi kawasan dermaga.',
    description: 'Simpanan pala dan cengkih pilihan berkualitas ekspor yang memicu ramainya Jalur Rempah dunia.',
    xpReward: 40,
    coinReward: 70,
    cultureBonus: 3,
  },
  {
    id: 'col-gerabah',
    name: 'Kendi Gerabah Kasongan',
    category: 'kerajinan',
    rarity: 'Common',
    districtId: 'permukiman',
    x: -28.0,
    z: 18.0,
    hint: 'Di sekitar taman permukiman warga bagian barat daya.',
    description: 'Kerajinan tanah liat Nusantara yang bertahan turun-temurun sebagai wadah air sejuk warga.',
    xpReward: 40,
    coinReward: 60,
    cultureBonus: 4,
  },
  {
    id: 'col-tenun-ikat',
    name: 'Selendang Tenun Ikat Pesisir',
    category: 'batik',
    rarity: 'Common',
    districtId: 'pusat-kota',
    x: -16.2,
    z: 22.8,
    yOffset: 0.22,
    hint: 'Di rak pajangan dalam Butik & Cermin Busana Nusantara.',
    description: 'Kain tenun ikat berwarna merah soga dan emas hasil karya penenun pesisir Nusantara.',
    xpReward: 45,
    coinReward: 70,
    cultureBonus: 4,
  },
  {
    id: 'col-cangkir-kopi',
    name: 'Cangkir Porselen Jalur Rempah',
    category: 'souvenir',
    rarity: 'Uncommon',
    districtId: 'pasar-tradisional',
    x: 36.4,
    z: -39.5,
    yOffset: 0.22,
    hint: 'Di sudut teras dalam Kedai Kopi & Kafe Pesisir.',
    description: 'Cangkir porselen perpaduan motif Tiongkok dan ukiran Nusantara peninggalan pertemuan saudagar.',
    xpReward: 55,
    coinReward: 85,
    cultureBonus: 5,
  },
  {
    id: 'col-wayang',
    name: 'Wayang Kulit Arjuna',
    category: 'wayang',
    rarity: 'Uncommon',
    districtId: 'permukiman',
    x: -40.2,
    z: -17.2,
    yOffset: 0.22,
    hint: 'Di ruang dalam Rumah Adat Utama kawasan permukiman.',
    description: 'Seni pertunjukan tradisional sarat pesan moral dan filosofi kepemimpinan Nusantara.',
    xpReward: 55,
    coinReward: 85,
    cultureBonus: 5,
  },
  {
    id: 'col-angklung',
    name: 'Angklung Bambu Perak',
    category: 'kerajinan',
    rarity: 'Uncommon',
    districtId: 'industri',
    x: 24.5,
    z: 43.8,
    yOffset: 0.22,
    hint: 'Di dalam Bengkel Kerajinan & Logistik kawasan industri selatan.',
    description: 'Alat musik bambu bernada harmonis yang mencerminkan gotong royong masyarakat Nusantara.',
    xpReward: 55,
    coinReward: 90,
    cultureBonus: 5,
  },
  {
    id: 'col-lentera-bahari',
    name: 'Lentera Kuningan Penginapan',
    category: 'souvenir',
    rarity: 'Uncommon',
    districtId: 'pasar-tradisional',
    x: 36.2,
    z: 26.2,
    yOffset: 0.22,
    hint: 'Di meja resepsionis dalam Hotel & Penginapan Bahari.',
    description: 'Lentera kuningan pelaut yang menerangi langkah para musafir di pelabuhan niaga.',
    xpReward: 60,
    coinReward: 95,
    cultureBonus: 5,
  },
  {
    id: 'col-keris-mini',
    name: 'Keris Pusaka Mini',
    category: 'sejarah',
    rarity: 'Rare',
    districtId: 'pusat-kota',
    x: -15.6,
    z: -16.8,
    yOffset: 0.22,
    hint: 'Tersimpan rapi di ruang dalam Balai Kota Nusantara.',
    description: 'Mahakarya tempa logam tradisional berlekuk indah simbol kehormatan dan kebijaksanaan pemimpin.',
    xpReward: 75,
    coinReward: 120,
    cultureBonus: 6,
  },
  {
    id: 'col-kompas-lorong',
    name: 'Astrolab Pedagang Kuno',
    category: 'sejarah',
    rarity: 'Rare',
    districtId: 'permukiman',
    x: -44.5,
    z: 4.5,
    hint: 'Tersembunyi di gang kecil antara rumah-rumah kampung permukiman barat.',
    description: 'Alat ukur bintang peninggalan navigator Arab dan Nusantara untuk membaca arah angin muson.',
    xpReward: 85,
    coinReward: 135,
    cultureBonus: 7,
  },
  {
    id: 'col-miniatur-pinisi',
    name: 'Miniatur Kapal Pinisi Emas',
    category: 'kapal',
    rarity: 'Rare',
    districtId: 'pelabuhan',
    x: 66.8,
    z: 8.5,
    hint: 'Naiki gangway Kapal Pinisi Niaga di Dermaga Utama hingga dek buritan atas!',
    description: 'Replika kapal layar legendaris pelaut Nusantara yang menaklukkan samudra tanpa kompas modern.',
    xpReward: 85,
    coinReward: 140,
    cultureBonus: 6,
  },
  {
    id: 'col-perahu-cadik',
    name: 'Ukiran Haluan Perahu Cadik',
    category: 'kapal',
    rarity: 'Rare',
    districtId: 'pelabuhan',
    x: 78.2,
    z: -8.8,
    hint: 'Naiki gangway Kapal Penumpang di sisi utara Dermaga Utama hingga haluan!',
    description: 'Ukiran kayu bermotif burung laut simbol keberanian pelaut mengarungi perairan Nusantara.',
    xpReward: 90,
    coinReward: 145,
    cultureBonus: 6,
  },
  {
    id: 'col-manuskrip',
    name: 'Manuskrip Lontar Tata Niaga',
    category: 'sejarah',
    rarity: 'Epic',
    districtId: 'pendidikan',
    x: -19.5,
    z: -67.8,
    yOffset: 0.22,
    hint: 'Di sudut baca dalam Sekolah & Perpustakaan Nusantara di kawasan utara.',
    description: 'Naskah kuno berisi catatan hukum maritim, etiket dagang lintas bangsa, dan ilmu perbintangan.',
    xpReward: 100,
    coinReward: 165,
    cultureBonus: 8,
  },
  {
    id: 'col-topeng-barong',
    name: 'Topeng Barong Ukir Agung',
    category: 'wayang',
    rarity: 'Epic',
    districtId: 'wisata-alam',
    x: -90.0,
    z: -54.0,
    hint: 'Daki bukit hijau di Kawasan Wisata Alam dekat Air Terjun barat laut!',
    description: 'Topeng seni ukir sakral lambang pelindung harmoni alam dan masyarakat Nusantara.',
    xpReward: 110,
    coinReward: 180,
    cultureBonus: 9,
  },
  {
    id: 'col-prasasti',
    name: 'Artefak Prasasti Bahari',
    category: 'sejarah',
    rarity: 'Legendary',
    districtId: 'pelabuhan',
    x: 131.5,
    z: -20.5,
    hint: 'Berlayarlah memakai Perahu Jukung dari Dermaga Selatan menuju Pulau Mercusuar di timur!',
    description: 'Batu prasasti berukir aksara kuno yang menandai sumpah persahabatan maritim antarbenua.',
    xpReward: 160,
    coinReward: 260,
    cultureBonus: 12,
  },
];

export interface CollectionMilestoneDef {
  id: string;
  requiredCount: number;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  unlockCustomizationIds?: string[];
  unlockBlueprintId?: string;
  unlockTitleId?: string;
}

export const COLLECTION_MILESTONES: CollectionMilestoneDef[] = [
  {
    id: 'mile-25',
    requiredCount: 4,
    title: 'Kolektor Pemula (25%)',
    description: 'Berhasil mengumpulkan 4 benda budaya & artefak Nusantara.',
    xpReward: 90,
    coinReward: 140,
    unlockCustomizationIds: ['glasses-cendekia', 'hair-ikal-alami'],
  },
  {
    id: 'mile-50',
    requiredCount: 8,
    title: 'Penjaga Khazanah (50%)',
    description: 'Setengah koleksi Nusantara berhasil diselamatkan untuk kota.',
    xpReward: 140,
    coinReward: 220,
    unlockCustomizationIds: ['bag-tenun-eksplorasi'],
    unlockBlueprintId: 'gapura-batik',
  },
  {
    id: 'mile-75',
    requiredCount: 12,
    title: 'Budayawan Utama (75%)',
    description: 'Koleksi langka dari daratan, bukit, dan kapal telah terhimpun.',
    xpReward: 200,
    coinReward: 320,
    unlockCustomizationIds: ['jubah-budayawan', 'hair-konde-nusantara', 'acc-selempang-emas'],
  },
  {
    id: 'mile-100',
    requiredCount: 15,
    title: 'Kurator Agung Nusantara (100%)',
    description: 'Seluruh 15 artefak sejarah, batik, wayang, dan bahari Stage 1 lengkap!',
    xpReward: 340,
    coinReward: 500,
    unlockCustomizationIds: ['hat-mahkota-adat'],
    unlockBlueprintId: 'monumen-rempah',
    unlockTitleId: 'title-kurator-agung',
  },
];

export interface SkinToneOption {
  id: string;
  name: string;
  hex: string;
}

export const SKIN_TONES: SkinToneOption[] = [
  { id: 'kulit-cerah', name: 'Kuning Langsat', hex: '#f2cba9' },
  { id: 'kulit-hangat', name: 'Sawo Matang Cerah', hex: '#e6b58a' },
  { id: 'kulit-nusantara', name: 'Sawo Matang Klasik', hex: '#cf9566' },
  { id: 'kulit-keemasan', name: 'Cokelat Keemasan', hex: '#b67a4e' },
  { id: 'kulit-tropis', name: 'Cokelat Tropis', hex: '#8f5934' },
  { id: 'kulit-gelap', name: 'Cokelat Eksotis', hex: '#6c3f24' },
];

export type FacePresetId = 'ramah' | 'tegas' | 'lembut' | 'cerdas';
export type EyeShapeId = 'bulat' | 'almond' | 'sipit' | 'tegas';
export type EyebrowStyleId = 'natural' | 'tebal' | 'melengkung' | 'lurus';
export type NosePresetId = 'klasik' | 'mancung' | 'mungil' | 'tegas';
export type MouthPresetId = 'senyum' | 'netral' | 'ceria' | 'berwibawa';
export type BodyTypeId = 'slim' | 'regular' | 'athletic';

export interface SimpleStyleOption<T extends string> {
  id: T;
  name: string;
}

export const FACE_PRESETS: SimpleStyleOption<FacePresetId>[] = [
  { id: 'ramah', name: 'Wajah Ramah' },
  { id: 'tegas', name: 'Wajah Tegas' },
  { id: 'lembut', name: 'Wajah Lembut' },
  { id: 'cerdas', name: 'Wajah Cerdas' },
];

export const EYE_SHAPES: SimpleStyleOption<EyeShapeId>[] = [
  { id: 'almond', name: 'Almond Nusantara' },
  { id: 'bulat', name: 'Bulat Ekspresif' },
  { id: 'sipit', name: 'Sipit Tenang' },
  { id: 'tegas', name: 'Tegas Fokus' },
];

export const EYE_COLORS: { id: string; name: string; hex: string }[] = [
  { id: 'mata-cokelat-gelap', name: 'Cokelat Tua', hex: '#2b1b12' },
  { id: 'mata-amber', name: 'Cokelat Amber', hex: '#6b3e1b' },
  { id: 'mata-hitam', name: 'Hitam Jelaga', hex: '#111827' },
  { id: 'mata-zamrud', name: 'Hijau Zamrud', hex: '#115e59' },
  { id: 'mata-biru-laut', name: 'Biru Samudra', hex: '#1d4ed8' },
];

export const EYEBROW_STYLES: SimpleStyleOption<EyebrowStyleId>[] = [
  { id: 'natural', name: 'Natural' },
  { id: 'tebal', name: 'Tebal Berwibawa' },
  { id: 'melengkung', name: 'Melengkung Halus' },
  { id: 'lurus', name: 'Lurus Rapi' },
];

export const NOSE_PRESETS: SimpleStyleOption<NosePresetId>[] = [
  { id: 'klasik', name: 'Klasik Seimbang' },
  { id: 'mancung', name: 'Mancung Tegas' },
  { id: 'mungil', name: 'Mungil Halus' },
  { id: 'tegas', name: 'Lebar Gagah' },
];

export const MOUTH_PRESETS: SimpleStyleOption<MouthPresetId>[] = [
  { id: 'senyum', name: 'Senyum Hangat' },
  { id: 'netral', name: 'Netral Tenang' },
  { id: 'ceria', name: 'Ceria Ramah' },
  { id: 'berwibawa', name: 'Tegas Berwibawa' },
];

export const BODY_TYPES: { id: BodyTypeId; name: string; scaleX: number; scaleZ: number }[] = [
  { id: 'slim', name: 'Ramping Lincah', scaleX: 0.9, scaleZ: 0.9 },
  { id: 'regular', name: 'Seimbang', scaleX: 1.0, scaleZ: 1.0 },
  { id: 'athletic', name: 'Tegap Gagah', scaleX: 1.12, scaleZ: 1.08 },
];

export const HAIR_COLORS: { id: string; name: string; hex: string }[] = [
  { id: 'rambut-hitam', name: 'Hitam Legam', hex: '#1c1917' },
  { id: 'rambut-cokelat-tua', name: 'Cokelat Kayu', hex: '#451a03' },
  { id: 'rambut-kastanye', name: 'Kastanye Hangat', hex: '#7c2d12' },
  { id: 'rambut-emas-senja', name: 'Cokelat Keemasan', hex: '#a16207' },
  { id: 'rambut-perak', name: 'Perak Bijak', hex: '#94a3b8' },
  { id: 'rambut-indigo', name: 'Biru Malam', hex: '#1e3a8a' },
];

export type CustomizationSlot =
  | 'hairstyle'
  | 'shirt'
  | 'jacket'
  | 'pants'
  | 'shoes'
  | 'hat'
  | 'glasses'
  | 'bag'
  | 'accessory';

export type CosmeticRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Special Event';

export interface CustomizationItemDef {
  id: string;
  slot: CustomizationSlot;
  name: string;
  description: string;
  primaryHex: string;
  accentHex: string;
  styleVariant?: string;
  rarity?: CosmeticRarity;
  unlockedByDefault: boolean;
  unlockHint: string;
  stageTag?: 1 | 2 | 3;
}

export const CUSTOMIZATION_ITEMS: CustomizationItemDef[] = [
  // Hairstyles (7)
  {
    id: 'hair-rambut-rapi',
    slot: 'hairstyle',
    name: 'Potongan Rapi Wali Kota',
    description: 'Gaya rambut pendek berponi samping yang rapi dan berwibawa.',
    primaryHex: '#1c1917',
    accentHex: '#44403c',
    styleVariant: 'rapi',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'hair-belah-tengah',
    slot: 'hairstyle',
    name: 'Belah Tengah Klasik',
    description: 'Belah tengah modern dengan poni bervolume di kanan dan kiri.',
    primaryHex: '#1c1917',
    accentHex: '#44403c',
    styleVariant: 'belah-tengah',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'hair-kuncir-ekor',
    slot: 'hairstyle',
    name: 'Kuncir Ekor Dinamis',
    description: 'Rambut diikat rapi ke belakang, cocok untuk menjelajah kota.',
    primaryHex: '#1c1917',
    accentHex: '#f59e0b',
    styleVariant: 'ponytail',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'hair-undercut',
    slot: 'hairstyle',
    name: 'Undercut Modern',
    description: 'Potongan rapi samping dengan jambul bertekstur di atas.',
    primaryHex: '#1c1917',
    accentHex: '#44403c',
    styleVariant: 'undercut',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'hair-ikal-alami',
    slot: 'hairstyle',
    name: 'Ikal Mengembang Nusantara',
    description: 'Rambut ikal alami bervolume penuh karakter.',
    primaryHex: '#1c1917',
    accentHex: '#44403c',
    styleVariant: 'ikal',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 4 Koleksi Nusantara atau capai Level 2',
  },
  {
    id: 'hair-ombak-panjang',
    slot: 'hairstyle',
    name: 'Ombak Panjang Anggun',
    description: 'Rambut panjang bergelombang sebahu dengan jepit kecil.',
    primaryHex: '#1c1917',
    accentHex: '#f59e0b',
    styleVariant: 'ombak-panjang',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi "Wajah Baru Alun-Alun" atau capai Level 3',
  },
  {
    id: 'hair-konde-nusantara',
    slot: 'hairstyle',
    name: 'Sanggul Konde Nusantara',
    description: 'Sanggul tradisional Nusantara berhias tusuk konde emas.',
    primaryHex: '#1c1917',
    accentHex: '#fbbf24',
    styleVariant: 'konde',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 12 Koleksi Nusantara',
  },

  // Shirts (5)
  {
    id: 'shirt-putih-kerah',
    slot: 'shirt',
    name: 'Kemeja Putih Resmi',
    description: 'Kemeja kerah putih bersih standar pemimpin muda.',
    primaryHex: '#f8fafc',
    accentHex: '#cbd5e1',
    styleVariant: 'kemeja',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'shirt-tenun-biru',
    slot: 'shirt',
    name: 'Kemeja Tenun Samudra',
    description: 'Kemeja katun biru laut bermotif garis tenun pesisir.',
    primaryHex: '#0284c7',
    accentHex: '#bae6fd',
    styleVariant: 'tenun',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'shirt-batik-sogan',
    slot: 'shirt',
    name: 'Kemeja Batik Sogan',
    description: 'Batik klasik cokelat keemasan kebanggaan pengrajin Jawa.',
    primaryHex: '#92400e',
    accentHex: '#fde68a',
    styleVariant: 'batik',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'shirt-kaus-rempah',
    slot: 'shirt',
    name: 'Kaos Lapangan Zamrud',
    description: 'Kaos berkerah nyaman untuk inspeksi pasar dan dermaga.',
    primaryHex: '#059669',
    accentHex: '#a7f3d0',
    styleVariant: 'polo',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'shirt-kebaya-merah',
    slot: 'shirt',
    name: 'Tunik Kebaya Merah',
    description: 'Busana atasan bernuansa merah marun anggun berbordir emas.',
    primaryHex: '#be123c',
    accentHex: '#fde047',
    styleVariant: 'kebaya',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi "Wajah Baru Alun-Alun"',
  },
  {
    id: 'shirt-hoodie-rempah',
    slot: 'shirt',
    name: 'Hoodie Nusantara Santai',
    description: 'Sweter bertudung warna krem hangat dengan saku depan nyaman.',
    primaryHex: '#d97706',
    accentHex: '#fef3c7',
    styleVariant: 'hoodie',
    rarity: 'Uncommon',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'shirt-gaun-batik',
    slot: 'shirt',
    name: 'Gaun Terusan Batik Pesisir',
    description: 'Gaun anggun bermotif batik pesisir untuk acara budaya & kota.',
    primaryHex: '#9f1239',
    accentHex: '#fbbf24',
    styleVariant: 'dress',
    rarity: 'Rare',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'shirt-olahraga-garuda',
    slot: 'shirt',
    name: 'Jersi Olahraga Garuda',
    description: 'Pakaian olahraga ringan bernapas dengan garis atletis merah putih.',
    primaryHex: '#dc2626',
    accentHex: '#f8fafc',
    styleVariant: 'sport',
    rarity: 'Epic',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 7 Stage 2: Kota Industri yang Berkembang',
    stageTag: 2,
  },

  // Jackets / Outerwear (5 — preserves legacy outfit IDs!)
  {
    id: 'seragam-walikota',
    slot: 'jacket',
    name: 'Jas Pemimpin Nusantara',
    description: 'Setelan resmi Wali Kota berwarna biru laut dengan lencana emas.',
    primaryHex: '#1e3a5f',
    accentHex: '#f59e0b',
    styleVariant: 'jas',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'jacket-none',
    slot: 'jacket',
    name: 'Tanpa Luaran (Kemeja Saja)',
    description: 'Tampil ringan dan santai hanya memakai kemeja/atasan pilihan.',
    primaryHex: '#475569',
    accentHex: '#94a3b8',
    styleVariant: 'none',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'batik-saudagar',
    slot: 'jacket',
    name: 'Beskap Batik Saudagar',
    description: 'Luaran batik cokelat keemasan kebanggaan saudagar pasar Nusantara.',
    primaryHex: '#9a3412',
    accentHex: '#fbbf24',
    styleVariant: 'beskap',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 2: Pasar yang Ramai atau temukan 2 Koleksi',
  },
  {
    id: 'rompi-insinyur',
    slot: 'jacket',
    name: 'Rompi Arsitek Lapangan',
    description: 'Rompi petualang hijau zamrud praktis untuk membangun dan menjelajah.',
    primaryHex: '#065f46',
    accentHex: '#34d399',
    styleVariant: 'rompi',
    unlockedByDefault: false,
    unlockHint: 'Bangun 1 fasilitas kota atau capai Level 2',
  },
  {
    id: 'jubah-budayawan',
    slot: 'jacket',
    name: 'Busana Agung Budayawan',
    description: 'Jubah adat merah marun berhias sulaman benang emas.',
    primaryHex: '#881337',
    accentHex: '#fde047',
    styleVariant: 'jubah',
    rarity: 'Epic',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 5 Koleksi Nusantara (atau 12 untuk paket lengkap)',
  },
  {
    id: 'jacket-hoodie-kota',
    slot: 'jacket',
    name: 'Jaket Hoodie Penjelajah Kota',
    description: 'Jaket bertudung bergaya modern cocok dipakai di Stage 1 maupun Stage 2.',
    primaryHex: '#0f766e',
    accentHex: '#5eead4',
    styleVariant: 'hoodie',
    rarity: 'Uncommon',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },

  // Pants / Lower Wear (7)
  {
    id: 'pants-resmi-slate',
    slot: 'pants',
    name: 'Celana Bahan Resmi',
    description: 'Celana panjang rapi berwarna abu-abu gelap serbaguna.',
    primaryHex: '#334155',
    accentHex: '#1e293b',
    styleVariant: 'trousers',
    rarity: 'Common',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'pants-khaki-petualang',
    slot: 'pants',
    name: 'Celana Khaki Lapangan',
    description: 'Celana lapangan cokelat muda yang tahan dipakai berpetualang.',
    primaryHex: '#8c6d46',
    accentHex: '#5c4428',
    styleVariant: 'cargo',
    rarity: 'Common',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'pants-gelap-niaga',
    slot: 'pants',
    name: 'Celana Hitam Arang',
    description: 'Celana panjang hitam elegan cocok dipadukan dengan batik.',
    primaryHex: '#1c1917',
    accentHex: '#0c0a09',
    styleVariant: 'trousers',
    rarity: 'Common',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'pants-sarung-batik',
    slot: 'pants',
    name: 'Kain / Sarung Batik Pesisir',
    description: 'Kain bawahan bermotif batik tradisional Nusantara yang anggun.',
    primaryHex: '#5c2414',
    accentHex: '#f59e0b',
    styleVariant: 'skirt',
    rarity: 'Uncommon',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'pants-pendek-petualang',
    slot: 'pants',
    name: 'Celana Pendek Pesisir',
    description: 'Celana pendek santai berbahan ringan untuk menjelajah dermaga dan alam.',
    primaryHex: '#0369a1',
    accentHex: '#bae6fd',
    styleVariant: 'shorts',
    rarity: 'Common',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'pants-rok-lipit',
    slot: 'pants',
    name: 'Rok Lipit Nusantara',
    description: 'Rok lipit klasik beraksen tenun yang ringan saat berjalan maupun berlari.',
    primaryHex: '#4338ca',
    accentHex: '#fde68a',
    styleVariant: 'skirt_pleated',
    rarity: 'Uncommon',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'pants-training-sport',
    slot: 'pants',
    name: 'Celana Training Atletik',
    description: 'Celana olahraga bergaris samping untuk aktivitas luar ruang.',
    primaryHex: '#0f172a',
    accentHex: '#ef4444',
    styleVariant: 'sport',
    rarity: 'Uncommon',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },

  // Shoes (4)
  {
    id: 'shoes-kulit-cokelat',
    slot: 'shoes',
    name: 'Sepatu Kulit Cokelat',
    description: 'Sepatu kulit klasik nyaman untuk berjalan mengelilingi kota.',
    primaryHex: '#4a2e1b',
    accentHex: '#f8fafc',
    styleVariant: 'loafers',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'shoes-sneakers-putih',
    slot: 'shoes',
    name: 'Sepatu Kets Kota Putih',
    description: 'Sepatu modern ringan untuk lari dan eksplorasi jarak jauh.',
    primaryHex: '#e2e8f0',
    accentHex: '#0284c7',
    styleVariant: 'sneakers',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'shoes-sepatu-bot',
    slot: 'shoes',
    name: 'Sepatu Bot Dermaga',
    description: 'Sepatu bot tangguh untuk medan bukit wisata dan dermaga.',
    primaryHex: '#292524',
    accentHex: '#d97706',
    styleVariant: 'boots',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'shoes-selop-emas',
    slot: 'shoes',
    name: 'Selop Tradisional Emas',
    description: 'Alas kaki adat beraksen emas khas bangsawan Nusantara.',
    primaryHex: '#7c2d12',
    accentHex: '#fbbf24',
    styleVariant: 'selop',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi "Magang Saudagar Pesisir"',
  },

  // Hats (6 — preserves legacy hat IDs!)
  {
    id: 'hat-none',
    slot: 'hat',
    name: 'Tanpa Penutup Kepala',
    description: 'Tampilkan gaya rambut 3D pilihanmu secara penuh.',
    primaryHex: '#64748b',
    accentHex: '#94a3b8',
    styleVariant: 'none',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'peci-nusantara',
    slot: 'hat',
    name: 'Peci Emas Nusantara',
    description: 'Peci hitam berlis emas khas pemimpin kota.',
    primaryHex: '#1e1b18',
    accentHex: '#f59e0b',
    styleVariant: 'peci',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'blangkon-batik',
    slot: 'hat',
    name: 'Blangkon Batik Klasik',
    description: 'Penutup kepala tradisional bermotif batik sogan.',
    primaryHex: '#78350f',
    accentHex: '#fde68a',
    styleVariant: 'blangkon',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 1: Mengenal Kota Nusantara',
  },
  {
    id: 'topi-nakhoda',
    slot: 'hat',
    name: 'Topi Nakhoda Pinisi',
    description: 'Topi pelaut tangguh penjelajah Jalur Rempah.',
    primaryHex: '#1e3a8a',
    accentHex: '#fbbf24',
    styleVariant: 'nakhoda',
    unlockedByDefault: false,
    unlockHint: 'Naiki dek Kapal Pinisi atau selesaikan Misi 3',
  },
  {
    id: 'caping-petualang',
    slot: 'hat',
    name: 'Caping Bambu Petualang',
    description: 'Caping anyaman sejuk cocok untuk mendaki bukit dan bertualang.',
    primaryHex: '#ca8a04',
    accentHex: '#78350f',
    styleVariant: 'caping',
    unlockedByDefault: false,
    unlockHint: 'Kunjungi Kawasan Wisata Alam atau selesaikan Misi Bukit',
  },
  {
    id: 'hat-mahkota-adat',
    slot: 'hat',
    name: 'Tanjak Emas Agung',
    description: 'Destar lipat keemasan kehormatan Kurator & Wali Kota utama.',
    primaryHex: '#991b1b',
    accentHex: '#fde047',
    styleVariant: 'tanjak',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan seluruh 15 Koleksi atau tuntaskan Misi Rahasia Pulau',
  },

  // Glasses (4)
  {
    id: 'glasses-none',
    slot: 'glasses',
    name: 'Tanpa Kacamata',
    description: 'Wajah alami tanpa kacamata.',
    primaryHex: '#64748b',
    accentHex: '#94a3b8',
    styleVariant: 'none',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'glasses-klasik',
    slot: 'glasses',
    name: 'Kacamata Bingkai Persegi',
    description: 'Kacamata baca bergaya modern berwarna gelap.',
    primaryHex: '#1e293b',
    accentHex: '#93c5fd',
    styleVariant: 'square',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'glasses-cendekia',
    slot: 'glasses',
    name: 'Kacamata Bulat Emas',
    description: 'Kacamata bulat bingkai emas khas peneliti dan cendekiawan.',
    primaryHex: '#d97706',
    accentHex: '#e0f2fe',
    styleVariant: 'round',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 4 Koleksi atau selesaikan Misi Wajah Baru Alun-Alun',
  },
  {
    id: 'glasses-pelaut',
    slot: 'glasses',
    name: 'Kacamata Surya Pelaut',
    description: 'Lensa teduh pelindung silau matahari pelabuhan.',
    primaryHex: '#0f172a',
    accentHex: '#f59e0b',
    styleVariant: 'sunglasses',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi Sampingan Pelaut Teluk Nusantara',
  },

  // Bags (4)
  {
    id: 'bag-none',
    slot: 'bag',
    name: 'Tanpa Tas',
    description: 'Berjalan bebas tanpa membawa tas punggung atau selempang.',
    primaryHex: '#64748b',
    accentHex: '#94a3b8',
    styleVariant: 'none',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'bag-ransel-kota',
    slot: 'bag',
    name: 'Ransel Penjelajah Kota',
    description: 'Ransel kanvas tangguh untuk membawa peta dan catatan sosiologi.',
    primaryHex: '#475569',
    accentHex: '#d97706',
    styleVariant: 'backpack',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'bag-selempang-kulit',
    slot: 'bag',
    name: 'Tas Selempang Kulit',
    description: 'Tas selempang saudagar untuk menyimpan dokumen niaga.',
    primaryHex: '#78350f',
    accentHex: '#fbbf24',
    styleVariant: 'satchel',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'bag-tenun-eksplorasi',
    slot: 'bag',
    name: 'Tas Kanvas Tenun Nusantara',
    description: 'Tas bahu bermotif tenun khas penggerak UMKM lokal.',
    primaryHex: '#f5ebd6',
    accentHex: '#059669',
    styleVariant: 'tote',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 8 Koleksi atau selesaikan Misi Magang Saudagar',
  },

  // Accessories (4)
  {
    id: 'acc-none',
    slot: 'accessory',
    name: 'Tanpa Aksesoris Tambahan',
    description: 'Tampilan bersih tanpa syal atau selempang.',
    primaryHex: '#64748b',
    accentHex: '#94a3b8',
    styleVariant: 'none',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'acc-syal-merah',
    slot: 'accessory',
    name: 'Syal Pelabuhan Nusantara',
    description: 'Syal leher hangat beraksen merah marun khas pelaut.',
    primaryHex: '#b91c1c',
    accentHex: '#fef3c7',
    styleVariant: 'scarf',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'acc-bros-emblem',
    slot: 'accessory',
    name: 'Lencana Kehormatan Kota',
    description: 'Bros emas berukir lambang Nusantara di dada.',
    primaryHex: '#fbbf24',
    accentHex: '#10b981',
    styleVariant: 'badge',
    unlockedByDefault: false,
    unlockHint: 'Capai Level 2 atau selesaikan 2 Misi',
  },
  {
    id: 'acc-selempang-emas',
    slot: 'accessory',
    name: 'Selempang Batik Emas',
    description: 'Selempang upacara kebesaran pemimpin & budayawan Nusantara.',
    primaryHex: '#991b1b',
    accentHex: '#fde047',
    styleVariant: 'sash',
    rarity: 'Epic',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi Inspeksi Kota atau kumpulkan 12 Koleksi',
  },
  {
    id: 'acc-ikat-kepala',
    slot: 'accessory',
    name: 'Ikat Kepala Batik Penjelajah',
    description: 'Aksesoris ikat rambut & dahi bermotif tenun klasik yang modis.',
    primaryHex: '#b45309',
    accentHex: '#fef08a',
    styleVariant: 'hairband',
    rarity: 'Uncommon',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'acc-jam-tangan',
    slot: 'accessory',
    name: 'Jam Tangan Kronograf Nusantara',
    description: 'Arloji perak-emas berpresisi tinggi untuk pemimpin era modern.',
    primaryHex: '#334155',
    accentHex: '#fbbf24',
    styleVariant: 'watch',
    rarity: 'Legendary',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 8 Stage 2: Destinasi Berikutnya',
    stageTag: 2,
  },
  {
    id: 'acc-masker-industri',
    slot: 'accessory',
    name: 'Masker Respirator K3 Pabrik',
    description: 'Pelindung pernapasan standar kesehatan lingkungan di kawasan industri.',
    primaryHex: '#0f766e',
    accentHex: '#cbd5e1',
    styleVariant: 'mask',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Tiba di Stage 2: Kota Industri atau mulai Misi 1 Stage 2',
    stageTag: 2,
  },

  // Stage 2: Kota Industri Customization Gear (Unlocked via Stage 2 quests, milestones, or arrival!)
  {
    id: 'shirt-seragam-pabrik',
    slot: 'shirt',
    name: 'Seragam Kerja Industri Biru',
    description: 'Kemeja kerja katun tebal standar operator pabrik modern Nusantara.',
    primaryHex: '#1d4ed8',
    accentHex: '#93c5fd',
    styleVariant: 'kemeja',
    rarity: 'Uncommon',
    unlockedByDefault: false,
    unlockHint: 'Tiba di Stage 2: Kota Industri atau mulai Misi Utama 1 Stage 2',
    stageTag: 2,
  },
  {
    id: 'jacket-rompi-keselamatan',
    slot: 'jacket',
    name: 'Rompi Keselamatan K3',
    description: 'Rompi visibilitas tinggi jingga-reflektif wajib area manufaktur dan gudang.',
    primaryHex: '#ea580c',
    accentHex: '#fde047',
    styleVariant: 'rompi',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 2 Stage 2: Operasi Pabrik',
    stageTag: 2,
  },
  {
    id: 'jacket-jas-industri',
    slot: 'jacket',
    name: 'Jas Direktur Industri',
    description: 'Setelan resmi pengelola kawasan industri & ekspor berkerah tembaga.',
    primaryHex: '#334155',
    accentHex: '#fb923c',
    styleVariant: 'jas',
    rarity: 'Epic',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 5 Stage 2: Ekspansi Industri',
    stageTag: 2,
  },
  {
    id: 'jacket-jaket-ekspor',
    slot: 'jacket',
    name: 'Jaket Ekspor & Logistik Hijau',
    description: 'Jaket pelindung industri berkelanjutan beraksen hijau zamrud.',
    primaryHex: '#0f766e',
    accentHex: '#a7f3d0',
    styleVariant: 'jubah',
    rarity: 'Epic',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 6 / 8 Stage 2 atau 12 Koleksi Industri',
    stageTag: 2,
  },
  {
    id: 'shoes-bot-safety',
    slot: 'shoes',
    name: 'Sepatu Bot Baja K3',
    description: 'Sepatu pelindung ujung baja untuk lantai produksi pabrik & rel logistik.',
    primaryHex: '#1e293b',
    accentHex: '#f59e0b',
    styleVariant: 'boots',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 4 Stage 2: Kesejahteraan Pekerja',
    stageTag: 2,
  },
  {
    id: 'hat-helm-proyek',
    slot: 'hat',
    name: 'Helm Keselamatan Proyek',
    description: 'Helm proyek K3 kuning terang pelindung kepala di kawasan pabrik dan konstruksi.',
    primaryHex: '#facc15',
    accentHex: '#0f172a',
    styleVariant: 'safety_helmet',
    rarity: 'Uncommon',
    unlockedByDefault: false,
    unlockHint: 'Tiba di Stage 2 atau temui Mandor Pabrik pada Misi 1 Stage 2',
    stageTag: 2,
  },
  {
    id: 'hat-topi-mandor',
    slot: 'hat',
    name: 'Topi Pengawas Logistik',
    description: 'Topi bervisier biru baja khas kepala gudang dan pengawas rantai pasok.',
    primaryHex: '#1e40af',
    accentHex: '#f59e0b',
    styleVariant: 'nakhoda',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 3 Stage 2: Tantangan Rantai Pasok',
    stageTag: 2,
  },
  {
    id: 'glasses-goggles-industri',
    slot: 'glasses',
    name: 'Kacamata Pengaman Pabrik',
    description: 'Goggles pelindung mata berbingkai baja untuk bengkel mesin dan laboratorium limbah.',
    primaryHex: '#0f172a',
    accentHex: '#38bdf8',
    styleVariant: 'goggles',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 4 Koleksi Era Industri Stage 2',
    stageTag: 2,
  },
  {
    id: 'bag-tas-perkakas',
    slot: 'bag',
    name: 'Tas Perkakas Teknisi',
    description: 'Ransel peralatan mekanik tangguh untuk inspeksi mesin dan jalur rel.',
    primaryHex: '#78350f',
    accentHex: '#fb923c',
    styleVariant: 'backpack',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 8 Koleksi Era Industri atau selesaikan Misi Logistik Stage 2',
    stageTag: 2,
  },
  {
    id: 'acc-lencana-k3',
    slot: 'accessory',
    name: 'Lencana Harmoni Industri',
    description: 'Pin kehormatan keseimbangan produktivitas, pekerja, dan kelestarian sungai.',
    primaryHex: '#10b981',
    accentHex: '#fbbf24',
    styleVariant: 'badge',
    rarity: 'Special Event',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 6 Stage 2 atau kumpulkan 15 Koleksi Era Industri',
    stageTag: 2,
  },
  // Stage 3: 10 Kostum Eksklusif Kota Digital Masa Depan & Aksesori Siber
  {
    id: 'jacket-smart-city-officer',
    slot: 'jacket',
    name: 'Smart City Officer',
    description: 'Seragam resmi petugas tata kelola Smart City Nusantara dengan garis neon biru bersih.',
    primaryHex: '#0f172a',
    accentHex: '#38bdf8',
    styleVariant: 'cyber_suit',
    rarity: 'Common',
    unlockedByDefault: false,
    unlockHint: 'Tiba di Stage 3 atau selesaikan Misi 1 Stage 3: Welcome to the Future',
    stageTag: 3,
  },
  {
    id: 'jacket-cyber-explorer',
    slot: 'jacket',
    name: 'Cyber Explorer',
    description: 'Jaket penjelajah siber ringan bertenaga baterai mikro untuk menapaki skywalk & dek atap.',
    primaryHex: '#1e293b',
    accentHex: '#22d3ee',
    styleVariant: 'cyber_suit',
    rarity: 'Uncommon',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 2 Stage 3: A Smarter City atau kumpulkan 4 Koleksi Masa Depan',
    stageTag: 3,
  },
  {
    id: 'jacket-digital-entrepreneur',
    slot: 'jacket',
    name: 'Digital Entrepreneur',
    description: 'Setelan eksekutif bisnis digital beraksen emas neon untuk pemimpin startup glokalisasi.',
    primaryHex: '#1e1b4b',
    accentHex: '#fbbf24',
    styleVariant: 'jas',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 3 Stage 3: The Digital Economy',
    stageTag: 3,
  },
  {
    id: 'jacket-robotics-engineer',
    slot: 'jacket',
    name: 'Robotics Engineer',
    description: 'Exosuit teknisi robotika bermodul daya bahu untuk kalibrasi AI dan otomasi presisi.',
    primaryHex: '#334155',
    accentHex: '#f97316',
    styleVariant: 'exosuit',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 4 Stage 3: Robotics in Action',
    stageTag: 3,
  },
  {
    id: 'jacket-ai-researcher',
    slot: 'jacket',
    name: 'AI Researcher',
    description: 'Mantel laboratorium riset AI putih-perak dengan sirkuit holografik canggih.',
    primaryHex: '#e2e8f0',
    accentHex: '#0ea5e9',
    styleVariant: 'jubah',
    rarity: 'Epic',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 7 Stage 3: The Hidden Innovation',
    stageTag: 3,
  },
  {
    id: 'jacket-futuristic-security',
    slot: 'jacket',
    name: 'Futuristic Security Suit',
    description: 'Zirah pengamanan siber & protokol ketahanan kota dengan pelindung bahu neon.',
    primaryHex: '#020617',
    accentHex: '#10b981',
    styleVariant: 'exosuit',
    rarity: 'Epic',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 8 Koleksi Masa Depan atau selesaikan Misi Sampingan Keamanan Siber',
    stageTag: 3,
  },
  {
    id: 'shirt-neon-streetwear',
    slot: 'shirt',
    name: 'Neon Streetwear',
    description: 'Hoodie futuristik gaya anak muda distrik hiburan dengan strip lampu magenta & sian.',
    primaryHex: '#312e81',
    accentHex: '#f472b6',
    styleVariant: 'hoodie',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 8 Stage 3: A City for Everyone atau aktivitas Arkade Hiburan',
    stageTag: 3,
  },
  {
    id: 'jacket-quantum-scientist',
    slot: 'jacket',
    name: 'Quantum Scientist',
    description: 'Setelan ilmuwan komputasi kuantum ungu kosmik dengan proyektor inti energi.',
    primaryHex: '#4c1d95',
    accentHex: '#a855f7',
    styleVariant: 'cyber_suit',
    rarity: 'Legendary',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 12 Koleksi Masa Depan atau selesaikan aktivitas Kalibrasi Kuantum',
    stageTag: 3,
  },
  {
    id: 'jacket-advanced-pilot',
    slot: 'jacket',
    name: 'Advanced Pilot Suit',
    description: 'Jaket penerbang & operator kendaraan EV otonom kecepatan tinggi beraksen titanium.',
    primaryHex: '#0f766e',
    accentHex: '#67e8f9',
    styleVariant: 'pilot_jacket',
    rarity: 'Legendary',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 5 Stage 3: The Future of Transportation & Sirkuit EV',
    stageTag: 3,
  },
  {
    id: 'jacket-future-guardian',
    slot: 'jacket',
    name: 'Legendary Future Guardian',
    description: 'Kostum kehormatan tertinggi Penjaga Masa Depan Nusantara perpaduan teknologi hijau & budaya.',
    primaryHex: '#064e3b',
    accentHex: '#fde047',
    styleVariant: 'exosuit',
    rarity: 'Special Event',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan seluruh 9 Misi Utama Stage 3 atau kumpulkan 15/15 Koleksi Masa Depan',
    stageTag: 3,
  },
  // Aksesori & Perlengkapan Siber Stage 3
  {
    id: 'hat-cyber-visor-helm',
    slot: 'hat',
    name: 'Helm Cyber Explorer',
    description: 'Helm aerodinamis dengan visor sian pemindai infrastruktur Smart City.',
    primaryHex: '#0f172a',
    accentHex: '#22d3ee',
    styleVariant: 'cyber_visor_helm',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 2 Stage 3: A Smarter City',
    stageTag: 3,
  },
  {
    id: 'hat-pilot-helm',
    slot: 'hat',
    name: 'Helm Pilot Otonom',
    description: 'Helm pengemudi kereta cepat & sirkuit kendaraan listrik berkecepatan tinggi.',
    primaryHex: '#0369a1',
    accentHex: '#fde047',
    styleVariant: 'pilot_helm',
    rarity: 'Epic',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 5 Stage 3: The Future of Transportation',
    stageTag: 3,
  },
  {
    id: 'hat-future-crown',
    slot: 'hat',
    name: 'Halo Hologram Nusantara',
    description: 'Mahkota cahaya holografik simbol kepemimpinan kota masa depan yang harmonis.',
    primaryHex: '#10b981',
    accentHex: '#fde047',
    styleVariant: 'future_crown',
    rarity: 'Special Event',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 9 Stage 3: The Future Continues',
    stageTag: 3,
  },
  {
    id: 'glasses-holo-visor',
    slot: 'glasses',
    name: 'Kacamata Holo-HUD',
    description: 'Visor realitas tertambah penampil data energi, lalu lintas, dan riset AI.',
    primaryHex: '#020617',
    accentHex: '#38bdf8',
    styleVariant: 'holo_visor',
    rarity: 'Epic',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan 4 Koleksi Masa Depan atau selesaikan Misi 7 Stage 3',
    stageTag: 3,
  },
  {
    id: 'bag-jetpack-drone',
    slot: 'bag',
    name: 'Paket Drone & Jetpack Eko',
    description: 'Modul punggung bertenaga listrik bersih beserta unit drone asisten mini.',
    primaryHex: '#1e293b',
    accentHex: '#34d399',
    styleVariant: 'jetpack',
    rarity: 'Legendary',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 6 Stage 3: Green Technology atau 12 Koleksi Masa Depan',
    stageTag: 3,
  },
  {
    id: 'acc-holo-armband',
    slot: 'accessory',
    name: 'Gelang Hologram Smart City',
    description: 'Proyektor pergelangan tangan untuk mengakses kontrol jaringan cerdas Nusantara.',
    primaryHex: '#0284c7',
    accentHex: '#67e8f9',
    styleVariant: 'holo_armband',
    rarity: 'Rare',
    unlockedByDefault: false,
    unlockHint: 'Gunakan Konsol Energi Cerdas atau selesaikan aktivitas Foto Dek Observasi',
    stageTag: 3,
  },
];

export const STAGE1_COSMETICS = CUSTOMIZATION_ITEMS.filter(
  (c) => (c.slot === 'jacket' || c.slot === 'hat') && c.stageTag !== 2 && c.stageTag !== 3
);

export interface CharacterAppearance {
  facePreset: FacePresetId;
  skinTone: string;
  eyeShape: EyeShapeId;
  eyeColor: string;
  eyebrowStyle: EyebrowStyleId;
  nosePreset: NosePresetId;
  mouthPreset: MouthPresetId;
  hairstyle: string;
  hairColor: string;
  bodyType: BodyTypeId;
  shirtId: string;
  jacketId: string;
  pantsId: string;
  shoeId: string;
  hatId: string;
  glassesId: string;
  bagId: string;
  accessoryId: string;
}

export const DEFAULT_CHARACTER_APPEARANCE: CharacterAppearance = {
  facePreset: 'ramah',
  skinTone: 'kulit-hangat',
  eyeShape: 'almond',
  eyeColor: 'mata-cokelat-gelap',
  eyebrowStyle: 'natural',
  nosePreset: 'klasik',
  mouthPreset: 'senyum',
  hairstyle: 'hair-rambut-rapi',
  hairColor: 'rambut-hitam',
  bodyType: 'regular',
  shirtId: 'shirt-putih-kerah',
  jacketId: 'seragam-walikota',
  pantsId: 'pants-resmi-slate',
  shoeId: 'shoes-kulit-cokelat',
  hatId: 'peci-nusantara',
  glassesId: 'glasses-none',
  bagId: 'bag-none',
  accessoryId: 'acc-none',
};

export interface CharacterPresetDef {
  id: string;
  name: string;
  tagline: string;
  badgeColor: string;
  appearance: Partial<CharacterAppearance>;
}

export const CHARACTER_PRESETS: CharacterPresetDef[] = [
  {
    id: 'preset-walikota',
    name: 'Wali Kota Muda',
    tagline: 'Setelan jas resmi & peci emas pemimpin Nusantara.',
    badgeColor: '#f59e0b',
    appearance: { ...DEFAULT_CHARACTER_APPEARANCE },
  },
  {
    id: 'preset-budaya',
    name: 'Penjaga Budaya',
    tagline: 'Gaun batik pesisir dengan ikat kepala tenun & selendang klasik.',
    badgeColor: '#e11d48',
    appearance: {
      facePreset: 'lembut',
      hairstyle: 'hair-kuncir-ekor',
      shirtId: 'shirt-gaun-batik',
      jacketId: 'jacket-none',
      pantsId: 'pants-rok-lipit',
      shoeId: 'shoes-kulit-cokelat',
      hatId: 'hat-none',
      accessoryId: 'acc-ikat-kepala',
      bagId: 'bag-selempang-kulit',
    },
  },
  {
    id: 'preset-pelaut',
    name: 'Penjelajah Pesisir',
    tagline: 'Celana pendek ringan, kemeja tenun samudra & syal pelabuhan.',
    badgeColor: '#0284c7',
    appearance: {
      facePreset: 'ramah',
      hairstyle: 'hair-belah-tengah',
      shirtId: 'shirt-tenun-biru',
      jacketId: 'jacket-none',
      pantsId: 'pants-pendek-petualang',
      shoeId: 'shoes-sneakers-putih',
      hatId: 'hat-none',
      accessoryId: 'acc-syal-merah',
      bagId: 'bag-ransel-kota',
    },
  },
  {
    id: 'preset-hoodie',
    name: 'Kreator Santai',
    tagline: 'Jaket hoodie modern dengan celana training & kets kota.',
    badgeColor: '#0f766e',
    appearance: {
      facePreset: 'cerdas',
      hairstyle: 'hair-undercut',
      shirtId: 'shirt-hoodie-rempah',
      jacketId: 'jacket-hoodie-kota',
      pantsId: 'pants-training-sport',
      shoeId: 'shoes-sneakers-putih',
      hatId: 'hat-none',
      glassesId: 'glasses-klasik',
      bagId: 'bag-ransel-kota',
    },
  },
  {
    id: 'preset-saudagar',
    name: 'Saudagar Batik',
    tagline: 'Kemeja batik sogan & sarung pesisir siap berniaga di pasar.',
    badgeColor: '#b45309',
    appearance: {
      facePreset: 'tegas',
      hairstyle: 'hair-rambut-rapi',
      shirtId: 'shirt-batik-sogan',
      jacketId: 'jacket-none',
      pantsId: 'pants-sarung-batik',
      shoeId: 'shoes-sepatu-bot',
      hatId: 'peci-nusantara',
      accessoryId: 'acc-none',
      bagId: 'bag-selempang-kulit',
    },
  },
  {
    id: 'preset-futuristik',
    name: 'Arsitek Masa Depan',
    tagline: 'Setelan Smart City, helm visor siber & tas teknologi (jika sudah terbuka).',
    badgeColor: '#0284c7',
    appearance: {
      facePreset: 'cerdas',
      hairstyle: 'hair-undercut',
      shirtId: 'shirt-neon-streetwear',
      jacketId: 'jacket-smart-city-officer',
      pantsId: 'pants-training-sport',
      shoeId: 'shoes-sneakers-putih',
      hatId: 'hat-cyber-visor-helm',
      glassesId: 'glasses-holo-visor',
      bagId: 'bag-jetpack-drone',
      accessoryId: 'acc-holo-armband',
    },
  },
];

export interface PlayerTitleDef {
  id: string;
  name: string;
  description: string;
  colorHex: string;
  unlockedByDefault: boolean;
  unlockHint: string;
  stageTag?: 1 | 2 | 3;
}

export const PLAYER_TITLES: PlayerTitleDef[] = [
  {
    id: 'title-wali-pemula',
    name: 'Wali Kota Muda',
    description: 'Gelar awal pemimpin Kota Perdagangan Nusantara.',
    colorHex: '#f59e0b',
    unlockedByDefault: true,
    unlockHint: 'Tersedia sejak awal',
  },
  {
    id: 'title-saudagar-muda',
    name: 'Saudagar Rempah',
    description: 'Ahli niaga pesisir dan penggerak pasar rakyat.',
    colorHex: '#fb923c',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi "Magang Saudagar Pesisir"',
  },
  {
    id: 'title-nakhoda-teluk',
    name: 'Nakhoda Jalur Rempah',
    description: 'Penjelajah teluk dan dermaga Nusantara yang pemberani.',
    colorHex: '#38bdf8',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 3: Kehidupan Pelabuhan',
  },
  {
    id: 'title-penata-gaya',
    name: 'Duta Budaya Nusantara',
    description: 'Memadukan gaya berpakaian modern dan warisan tradisi lokal.',
    colorHex: '#f472b6',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi "Wajah Baru Alun-Alun"',
  },
  {
    id: 'title-kurator-agung',
    name: 'Kurator Agung Nusantara',
    description: 'Mengumpulkan seluruh 15 koleksi artefak sejarah & budaya Stage 1.',
    colorHex: '#a855f7',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan seluruh 15/15 Koleksi Nusantara',
  },
  {
    id: 'title-arsitek-utama',
    name: 'Arsitek Kota Agung',
    description: 'Menuntaskan seluruh 5 Misi Utama Stage 1 dengan cemerlang.',
    colorHex: '#10b981',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan seluruh 5 Misi Utama Stage 1',
  },
  // Stage 2 Titles
  {
    id: 'title-perintis-industri',
    name: 'Perintis Kota Industri',
    description: 'Membuka era manufaktur modern & menggerakkan pabrik Nusantara.',
    colorHex: '#fb923c',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 2 Stage 2: Operasi Pabrik',
    stageTag: 2,
  },
  {
    id: 'title-manajer-logistik',
    name: 'Manajer Rantai Pasok',
    description: 'Menguasai distribusi barang pabrik, gudang, dan perdagangan grosir.',
    colorHex: '#38bdf8',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 3 Stage 2: Tantangan Rantai Pasok',
    stageTag: 2,
  },
  {
    id: 'title-pelopor-hijau',
    name: 'Pelopor Industri Hijau',
    description: 'Menjaga sungai bersih dan menyeimbangkan industri dengan lingkungan.',
    colorHex: '#22c55e',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 6 Stage 2: Tantangan Lingkungan',
    stageTag: 2,
  },
  {
    id: 'title-arsitek-industri',
    name: 'Arsitek Kota Industri',
    description: 'Menuntaskan seluruh 8 Misi Utama atau 15/15 Koleksi Stage 2.',
    colorHex: '#eab308',
    unlockedByDefault: false,
    unlockHint: 'Tuntaskan seluruh Misi Utama Stage 2 atau 15 Koleksi Era Industri',
    stageTag: 2,
  },
  {
    id: 'title-penggerak-industri',
    name: 'Penggerak Industri Maju',
    description: 'Mencapai ekspansi produksi pangan & perdagangan grosir Kota Industri.',
    colorHex: '#f97316',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 7 Stage 2: Kota Industri yang Berkembang',
    stageTag: 2,
  },
  // Stage 3 Titles
  {
    id: 'title-inovator-digital',
    name: 'Inovator Ekonomi Digital',
    description: 'Memajukan usaha digital & robotika Nusantara ke jaringan ekonomi global.',
    colorHex: '#38bdf8',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 3 atau 4 Stage 3',
    stageTag: 3,
  },
  {
    id: 'title-pelopor-energi-hijau',
    name: 'Pelopor Teknologi Hijau',
    description: 'Menghadirkan energi surya, angin, dan taman vertikal berkelanjutan.',
    colorHex: '#10b981',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 6 Stage 3: Green Technology',
    stageTag: 3,
  },
  {
    id: 'title-kurator-masa-depan',
    name: 'Kurator Inovasi Masa Depan',
    description: 'Mengumpulkan seluruh 15 Koleksi Kota Digital Masa Depan.',
    colorHex: '#a855f7',
    unlockedByDefault: false,
    unlockHint: 'Kumpulkan seluruh 15/15 Koleksi Masa Depan Stage 3',
    stageTag: 3,
  },
  {
    id: 'title-penjaga-masa-depan',
    name: 'Penjaga Masa Depan Nusantara',
    description: 'Menuntaskan seluruh 9 Misi Utama Kota Digital Masa Depan dengan seimbang.',
    colorHex: '#fde047',
    unlockedByDefault: false,
    unlockHint: 'Selesaikan Misi 9 Stage 3: The Future Continues',
    stageTag: 3,
  },
];

export type QuestEventType =
  | 'talk_npc'
  | 'visit_district'
  | 'collect_item'
  | 'deliver_item'
  | 'inspect_landmark'
  | 'enter_interior'
  | 'board_ship'
  | 'build_facility'
  | 'upgrade_facility'
  | 'drive_vehicle'
  | 'collect_artifact'
  | 'customize_avatar'
  | 'complete_activity'
  | 'use_elevator';

export interface QuestStepDef {
  id: string;
  description: string;
  eventType: QuestEventType;
  targetId: string; // NPC id, district id, item id, interior id, building id, or '*'
  requiredItemToConsume?: string;
  waypointX: number;
  waypointZ: number;
  waypointLabel: string;
}

export interface QuestDef {
  id: string;
  title: string;
  kind: 'main' | 'side';
  order: number;
  giverNpcId: string;
  summary: string;
  steps: QuestStepDef[];
  rewards: {
    xp: number;
    coins: number;
    reputation: number;
    happiness: number;
    welfare: number;
    itemId?: string;
    itemQty?: number;
    unlockCosmeticId?: string;
    unlockCustomizationIds?: string[];
    unlockBlueprintId?: string;
    unlockTitleId?: string;
  };
}

export const STAGE1_QUESTS: QuestDef[] = [
  {
    id: 'q-main-1',
    title: 'Misi 1: Mengenal Kota Nusantara',
    kind: 'main',
    order: 1,
    giverNpcId: 'npc-aditya',
    summary: 'Aditya mengajakmu meninjau kawasan Pasar Tradisional dan Pelabuhan untuk memahami denyut kota.',
    steps: [
      {
        id: 'q1-s1',
        description: 'Bicara dengan Aditya di Alun-Alun Pusat Kota',
        eventType: 'talk_npc',
        targetId: 'npc-aditya',
        waypointX: 5.2,
        waypointZ: -5.2,
        waypointLabel: 'Aditya (Alun-Alun)',
      },
      {
        id: 'q1-s2',
        description: 'Jelajahi Kawasan Pasar Tradisional di sebelah timur',
        eventType: 'visit_district',
        targetId: 'pasar-tradisional',
        waypointX: 28.0,
        waypointZ: -6.0,
        waypointLabel: 'Kawasan Pasar',
      },
      {
        id: 'q1-s3',
        description: 'Kunjungi Dermaga Pelabuhan Nusantara di pesisir timur',
        eventType: 'visit_district',
        targetId: 'pelabuhan',
        waypointX: 55.0,
        waypointZ: 0.0,
        waypointLabel: 'Pelabuhan Niaga',
      },
      {
        id: 'q1-s4',
        description: 'Kembali melapor kepada Aditya di Alun-Alun',
        eventType: 'talk_npc',
        targetId: 'npc-aditya',
        waypointX: 5.2,
        waypointZ: -5.2,
        waypointLabel: 'Lapor ke Aditya',
      },
    ],
    rewards: {
      xp: 90,
      coins: 150,
      reputation: 6,
      happiness: 5,
      welfare: 4,
      itemId: 'kopi-rempah',
      itemQty: 1,
      unlockCosmeticId: 'blangkon-batik',
    },
  },
  {
    id: 'q-main-2',
    title: 'Misi 2: Pasar yang Ramai',
    kind: 'main',
    order: 2,
    giverNpcId: 'npc-laras',
    summary: 'Bantu Laras dan pedagang pasar menyiapkan pasokan rempah dan kain batik sebelum kapal dagang merapat.',
    steps: [
      {
        id: 'q2-s1',
        description: 'Temui Laras di pintu depan Pasar Utama Nusantara',
        eventType: 'talk_npc',
        targetId: 'npc-laras',
        waypointX: 24.5,
        waypointZ: -12.0,
        waypointLabel: 'Laras (Pasar)',
      },
      {
        id: 'q2-s2',
        description: 'Ambil Karung Cengkih di dalam Gudang Pelabuhan',
        eventType: 'collect_item',
        targetId: 'karung-cengkih',
        waypointX: 43.2,
        waypointZ: -21.8,
        waypointLabel: 'Karung Cengkih (Gudang)',
      },
      {
        id: 'q2-s3',
        description: 'Ambil Gulungan Kain Batik di kios Ibu Sari',
        eventType: 'collect_item',
        targetId: 'kain-batik-pesisir',
        waypointX: 29.0,
        waypointZ: 12.0,
        waypointLabel: 'Kain Batik (Kios Ibu Sari)',
      },
      {
        id: 'q2-s4',
        description: 'Masuk ke Pasar Utama & antar pasokan ke meja Saudagar',
        eventType: 'deliver_item',
        targetId: 'delivery-pasar-utama',
        requiredItemToConsume: 'karung-cengkih',
        waypointX: 32.0,
        waypointZ: -15.0,
        waypointLabel: 'Dalam Pasar Utama',
      },
      {
        id: 'q2-s5',
        description: 'Lapor kembali kepada Laras bahwa pasar telah siap',
        eventType: 'talk_npc',
        targetId: 'npc-laras',
        waypointX: 24.5,
        waypointZ: -12.0,
        waypointLabel: 'Lapor ke Laras',
      },
    ],
    rewards: {
      xp: 125,
      coins: 210,
      reputation: 8,
      happiness: 8,
      welfare: 6,
      itemId: 'palu-arsitek',
      itemQty: 1,
      unlockCosmeticId: 'batik-saudagar',
    },
  },
  {
    id: 'q-main-3',
    title: 'Misi 3: Kehidupan Pelabuhan',
    kind: 'main',
    order: 3,
    giverNpcId: 'npc-syahbandar',
    summary: 'Periksa Dermaga Utama, naiki Kapal Pinisi Niaga melalui jembatan kayu, dan cek muatan ekspor.',
    steps: [
      {
        id: 'q3-s1',
        description: 'Bicara dengan Syahbandar di Dermaga Utama',
        eventType: 'talk_npc',
        targetId: 'npc-syahbandar',
        waypointX: 56.5,
        waypointZ: -2.4,
        waypointLabel: 'Syahbandar (Dermaga)',
      },
      {
        id: 'q3-s2',
        description: 'Berjalanlah melewati gangway ke dek Kapal Pinisi Niaga',
        eventType: 'board_ship',
        targetId: 'ship-pinisi',
        waypointX: 74.0,
        waypointZ: 7.5,
        waypointLabel: 'Dek Kapal Pinisi',
      },
      {
        id: 'q3-s3',
        description: 'Periksa Peti Muatan Ekspor & bicara dengan Kapten Raka di dek',
        eventType: 'talk_npc',
        targetId: 'npc-kapten-raka',
        waypointX: 77.0,
        waypointZ: 8.5,
        waypointLabel: 'Kapten Raka (Dek Kapal)',
      },
      {
        id: 'q3-s4',
        description: 'Kembali melapor ke Syahbandar di Dermaga Utama',
        eventType: 'talk_npc',
        targetId: 'npc-syahbandar',
        waypointX: 56.5,
        waypointZ: -2.4,
        waypointLabel: 'Syahbandar (Dermaga)',
      },
    ],
    rewards: {
      xp: 145,
      coins: 250,
      reputation: 10,
      happiness: 6,
      welfare: 6,
      itemId: 'kompas-nakhoda',
      itemQty: 1,
      unlockCosmeticId: 'topi-nakhoda',
      unlockTitleId: 'title-nakhoda-teluk',
    },
  },
  {
    id: 'q-main-4',
    title: 'Misi 4: Membantu Warga & Pendidikan',
    kind: 'main',
    order: 4,
    giverNpcId: 'npc-bu-ratna',
    summary: 'Warga kampung membutuhkan jamu herbal dan paket buku untuk Sekolah Nusantara di utara.',
    steps: [
      {
        id: 'q4-s1',
        description: 'Temui Bu Ratna di Kawasan Permukiman Warga',
        eventType: 'talk_npc',
        targetId: 'npc-bu-ratna',
        waypointX: -31.8,
        waypointZ: -11.5,
        waypointLabel: 'Bu Ratna (Permukiman)',
      },
      {
        id: 'q4-s2',
        description: 'Ambil Jamu & Ramuan Herbal di tepi Taman Alun-Alun',
        eventType: 'collect_item',
        targetId: 'ramuan-herbal',
        waypointX: -15.5,
        waypointZ: 10.5,
        waypointLabel: 'Ramuan Herbal',
      },
      {
        id: 'q4-s3',
        description: 'Antar Jamu ke dalam Rumah Adat Utama',
        eventType: 'deliver_item',
        targetId: 'delivery-rumah-adat',
        requiredItemToConsume: 'ramuan-herbal',
        waypointX: -38.0,
        waypointZ: -15.0,
        waypointLabel: 'Dalam Rumah Adat',
      },
      {
        id: 'q4-s4',
        description: 'Masuk ke Sekolah & Perpustakaan Nusantara di utara',
        eventType: 'enter_interior',
        targetId: 'int-sekolah-nusantara',
        waypointX: -16.0,
        waypointZ: -66.0,
        waypointLabel: 'Sekolah Nusantara',
      },
      {
        id: 'q4-s5',
        description: 'Lapor kembali ke Bu Ratna di Permukiman',
        eventType: 'talk_npc',
        targetId: 'npc-bu-ratna',
        waypointX: -31.8,
        waypointZ: -11.5,
        waypointLabel: 'Bu Ratna (Permukiman)',
      },
    ],
    rewards: {
      xp: 160,
      coins: 260,
      reputation: 9,
      happiness: 10,
      welfare: 10,
      itemId: 'kopi-rempah',
      itemQty: 2,
      unlockCustomizationIds: ['acc-bros-emblem'],
    },
  },
  {
    id: 'q-main-5',
    title: 'Misi 5: Kota yang Lebih Baik',
    kind: 'main',
    order: 5,
    giverNpcId: 'npc-naya',
    summary: 'Wujudkan pembangunan kota modern berakar budaya! Bangun fasilitas baru dan tingkatkan level bangunan.',
    steps: [
      {
        id: 'q5-s1',
        description: 'Bicara dengan Naya di Kawasan Industri & UMKM Selatan',
        eventType: 'talk_npc',
        targetId: 'npc-naya',
        waypointX: 15.5,
        waypointZ: 39.5,
        waypointLabel: 'Naya (Kawasan Industri)',
      },
      {
        id: 'q5-s2',
        description: 'Buka Menu Bangun [B], letakkan & selesaikan 1 bangunan baru',
        eventType: 'build_facility',
        targetId: '*',
        waypointX: 8.0,
        waypointZ: 14.0,
        waypointLabel: 'Area Bangun Bebas',
      },
      {
        id: 'q5-s3',
        description: 'Tingkatkan (Upgrade) salah satu bangunan ke Level 2',
        eventType: 'upgrade_facility',
        targetId: '*',
        waypointX: 8.0,
        waypointZ: 14.0,
        waypointLabel: 'Upgrade Bangunan Lv 2',
      },
      {
        id: 'q5-s4',
        description: 'Temui Kepala Kota Pak Wiryo di dalam Balai Kota Nusantara',
        eventType: 'talk_npc',
        targetId: 'npc-kepala-kota',
        waypointX: -13.0,
        waypointZ: -16.0,
        waypointLabel: 'Pak Wiryo (Balai Kota)',
      },
    ],
    rewards: {
      xp: 220,
      coins: 350,
      reputation: 14,
      happiness: 12,
      welfare: 12,
      itemId: 'palu-arsitek',
      itemQty: 1,
      unlockBlueprintId: 'monumen-rempah',
      unlockTitleId: 'title-arsitek-utama',
    },
  },
  {
    id: 'q-side-1',
    title: 'Sampingan: Tangkapan Nelayan Dermaga',
    kind: 'side',
    order: 6,
    giverNpcId: 'npc-nelayan',
    summary: 'Bantu Pak Bahri mengantarkan ikan segar dari Dermaga Utara ke kios kuliner Pak Joko.',
    steps: [
      {
        id: 'qs1-s1',
        description: 'Ambil Keranjang Ikan Segar di ujung Dermaga Utara',
        eventType: 'collect_item',
        targetId: 'hasil-tangkapan',
        waypointX: 70.5,
        waypointZ: -30.5,
        waypointLabel: 'Ikan Segar (Dermaga Utara)',
      },
      {
        id: 'qs1-s2',
        description: 'Antarkan kepada Pak Joko di kawasan Pasar Kuliner',
        eventType: 'talk_npc',
        targetId: 'npc-pedagang-kuliner',
        requiredItemToConsume: 'hasil-tangkapan',
        waypointX: 25.0,
        waypointZ: -25.0,
        waypointLabel: 'Pak Joko (Pasar)',
      },
    ],
    rewards: {
      xp: 85,
      coins: 140,
      reputation: 5,
      happiness: 6,
      welfare: 5,
    },
  },
  {
    id: 'q-side-2',
    title: 'Sampingan: Ekspedisi Air Terjun & Bukit',
    kind: 'side',
    order: 7,
    giverNpcId: 'npc-wisatawan',
    summary: 'Seberangi Jembatan Sungai Nusantara di barat, daki Bukit Hijau dan temukan Topeng Barong Ukir.',
    steps: [
      {
        id: 'qs2-s1',
        description: 'Seberangi jembatan sungai menuju Kawasan Wisata Alam',
        eventType: 'visit_district',
        targetId: 'wisata-alam',
        waypointX: -72.0,
        waypointZ: -8.0,
        waypointLabel: 'Kawasan Wisata Alam',
      },
      {
        id: 'qs2-s2',
        description: 'Temukan Topeng Barong Ukir di Puncak Bukit Air Terjun',
        eventType: 'collect_artifact',
        targetId: 'col-topeng-barong',
        waypointX: -90.0,
        waypointZ: -54.0,
        waypointLabel: 'Puncak Bukit Wisata',
      },
    ],
    rewards: {
      xp: 120,
      coins: 180,
      reputation: 7,
      happiness: 8,
      welfare: 4,
      unlockCosmeticId: 'caping-petualang',
    },
  },
  {
    id: 'q-side-3',
    title: 'Sampingan: Pelaut Teluk Nusantara',
    kind: 'side',
    order: 8,
    giverNpcId: 'npc-kapten-raka',
    summary: 'Kendarai Perahu Jukung di Dermaga Selatan dan berlayarlah ke Pulau Mercusuar di timur!',
    steps: [
      {
        id: 'qs3-s1',
        description: 'Naiki & kendarai Perahu Jukung Bermotor (tekan F di Dermaga Selatan)',
        eventType: 'drive_vehicle',
        targetId: 'veh-perahu-1',
        waypointX: 73.5,
        waypointZ: 28.2,
        waypointLabel: 'Perahu Jukung (Dermaga Selatan)',
      },
      {
        id: 'qs3-s2',
        description: 'Temukan Artefak Prasasti Bahari di Pulau Mercusuar',
        eventType: 'collect_artifact',
        targetId: 'col-prasasti',
        waypointX: 131.5,
        waypointZ: -20.5,
        waypointLabel: 'Pulau Mercusuar',
      },
    ],
    rewards: {
      xp: 150,
      coins: 240,
      reputation: 10,
      happiness: 7,
      welfare: 5,
      unlockCustomizationIds: ['glasses-pelaut'],
    },
  },
  {
    id: 'q-side-4',
    title: 'Sampingan: Magang Saudagar Pesisir',
    kind: 'side',
    order: 9,
    giverNpcId: 'npc-barista-kopi',
    summary: 'Bantu Mas Darma di Kedai Kopi Pesisir mempromosikan kopi rempah dan meninjau Hotel Bahari.',
    steps: [
      {
        id: 'qs4-s1',
        description: 'Masuk ke dalam Kedai Kopi & Kafe Pesisir di timur laut Pasar',
        eventType: 'enter_interior',
        targetId: 'int-kafe-pelabuhan',
        waypointX: 34.5,
        waypointZ: -38.0,
        waypointLabel: 'Kedai Kopi Pesisir',
      },
      {
        id: 'qs4-s2',
        description: 'Masuk ke Hotel & Penginapan Bahari untuk koordinasi wisata',
        eventType: 'enter_interior',
        targetId: 'int-hotel-bahari',
        waypointX: 34.0,
        waypointZ: 24.5,
        waypointLabel: 'Hotel Bahari',
      },
    ],
    rewards: {
      xp: 130,
      coins: 210,
      reputation: 8,
      happiness: 8,
      welfare: 6,
      itemId: 'kopi-rempah',
      itemQty: 2,
      unlockCustomizationIds: ['shoes-selop-emas', 'bag-tenun-eksplorasi'],
      unlockTitleId: 'title-saudagar-muda',
    },
  },
  {
    id: 'q-side-5',
    title: 'Sampingan: Wajah Baru Alun-Alun',
    kind: 'side',
    order: 10,
    giverNpcId: 'npc-penjahit',
    summary: 'Mbak Sekar di Butik Busana mengajakmu merancang gaya pribadi & memeriksa Tugu Persatuan.',
    steps: [
      {
        id: 'qs5-s1',
        description: 'Masuk ke Butik & Cermin Busana Nusantara di selatan Alun-Alun',
        eventType: 'enter_interior',
        targetId: 'int-butik-busana',
        waypointX: -14.0,
        waypointZ: 22.0,
        waypointLabel: 'Butik Busana Nusantara',
      },
      {
        id: 'qs5-s2',
        description: 'Ubah & simpan tampilan karaktermu di Studio Karakter [C] / Cermin',
        eventType: 'customize_avatar',
        targetId: '*',
        waypointX: -14.0,
        waypointZ: 22.0,
        waypointLabel: 'Cermin Busana [C]',
      },
      {
        id: 'qs5-s3',
        description: 'Inspeksi Tugu Persatuan Nusantara di Alun-Alun',
        eventType: 'inspect_landmark',
        targetId: 'lm-tugu-alun',
        waypointX: -4.8,
        waypointZ: 4.8,
        waypointLabel: 'Tugu Alun-Alun',
      },
    ],
    rewards: {
      xp: 145,
      coins: 220,
      reputation: 9,
      happiness: 10,
      welfare: 5,
      unlockCustomizationIds: ['shirt-kebaya-merah', 'hair-ombak-panjang', 'glasses-cendekia'],
      unlockBlueprintId: 'gapura-batik',
      unlockTitleId: 'title-penata-gaya',
    },
  },
  {
    id: 'q-hidden-1',
    title: 'Misi Rahasia: Jejak Lorong & Menara',
    kind: 'side',
    order: 11,
    giverNpcId: 'npc-kurator',
    summary: 'Temukan Astrolab Pedagang Kuno di lorong sempit kampung dan inspeksi Mercusuar Pulau Timur.',
    steps: [
      {
        id: 'qh1-s1',
        description: 'Temukan Astrolab Kuno di gang sempit Permukiman Barat',
        eventType: 'collect_artifact',
        targetId: 'col-kompas-lorong',
        waypointX: -44.5,
        waypointZ: 4.5,
        waypointLabel: 'Gang Permukiman Barat',
      },
      {
        id: 'qh1-s2',
        description: 'Inspeksi Mercusuar Pulau Timur di seberang Teluk Pelabuhan',
        eventType: 'inspect_landmark',
        targetId: 'lm-mercusuar',
        waypointX: 129.0,
        waypointZ: -23.5,
        waypointLabel: 'Mercusuar Pulau Timur',
      },
    ],
    rewards: {
      xp: 190,
      coins: 300,
      reputation: 12,
      happiness: 8,
      welfare: 6,
      unlockCustomizationIds: ['hat-mahkota-adat'],
      unlockBlueprintId: 'mercusuar-alun',
    },
  },
  {
    id: 'q-daily-1',
    title: 'Tugas Kota: Inspeksi Sarana & Budaya',
    kind: 'side',
    order: 12,
    giverNpcId: 'npc-kepala-kota',
    summary: 'Pak Wiryo meminta inspeksi derek pelabuhan serta pendirian fasilitas budaya atau peningkatan bangunan.',
    steps: [
      {
        id: 'qd1-s1',
        description: 'Inspeksi Derek Bongkar Muat Utama di Dermaga Pusat',
        eventType: 'inspect_landmark',
        targetId: 'lm-derek-pelabuhan',
        waypointX: 63.0,
        waypointZ: -2.5,
        waypointLabel: 'Derek Pelabuhan',
      },
      {
        id: 'qd1-s2',
        description: 'Inspeksi Gazebo Puncak Bukit Alam di Kawasan Wisata',
        eventType: 'inspect_landmark',
        targetId: 'lm-gazebo-bukit',
        waypointX: -93.5,
        waypointZ: -56.5,
        waypointLabel: 'Gazebo Puncak Bukit',
      },
    ],
    rewards: {
      xp: 155,
      coins: 250,
      reputation: 10,
      happiness: 9,
      welfare: 8,
      unlockCustomizationIds: ['acc-selempang-emas'],
      unlockBlueprintId: 'pendopo-seni',
    },
  },
];

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  badgeColor: string;
  xpReward: number;
  coinReward: number;
}

export const STAGE1_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'ach-explorer',
    title: 'Penjelajah Kota Nusantara',
    description: 'Temukan minimal 5 dari 7 kawasan kota Stage 1.',
    badgeColor: '#10b981',
    xpReward: 80,
    coinReward: 120,
  },
  {
    id: 'ach-citizen-friend',
    title: 'Sahabat Warga',
    description: 'Selesaikan minimal 3 misi warga atau misi utama.',
    badgeColor: '#38bdf8',
    xpReward: 100,
    coinReward: 150,
  },
  {
    id: 'ach-market-master',
    title: 'Penguasa Pasar Rempah',
    description: 'Selesaikan Misi 2: Pasar yang Ramai dan miliki minimal 900 Koin.',
    badgeColor: '#f59e0b',
    xpReward: 110,
    coinReward: 180,
  },
  {
    id: 'ach-culture-keeper',
    title: 'Penjaga Budaya Nusantara',
    description: 'Kumpulkan minimal 4 benda Koleksi Nusantara.',
    badgeColor: '#ec4899',
    xpReward: 120,
    coinReward: 180,
  },
  {
    id: 'ach-city-builder',
    title: 'Pembangun Kota Sejati',
    description: 'Bangun minimal 2 fasilitas baru dan tingkatkan 1 bangunan ke Level 2.',
    badgeColor: '#f97316',
    xpReward: 130,
    coinReward: 200,
  },
  {
    id: 'ach-harbor-adventurer',
    title: 'Petualang Pelabuhan',
    description: 'Naiki dek Kapal Pinisi Niaga dan tuntaskan Misi 3: Kehidupan Pelabuhan.',
    badgeColor: '#0ea5e9',
    xpReward: 115,
    coinReward: 170,
  },
  {
    id: 'ach-sailor',
    title: 'Pelaut Teluk Nusantara',
    description: 'Kendarai Perahu Jukung di perairan pelabuhan atau kendaraan kota.',
    badgeColor: '#06b6d4',
    xpReward: 85,
    coinReward: 130,
  },
  {
    id: 'ach-hero',
    title: 'Arsitek Utama Stage 1',
    description: 'Tuntaskan seluruh 5 Misi Utama Kota Perdagangan Stage 1.',
    badgeColor: '#a855f7',
    xpReward: 250,
    coinReward: 400,
  },
];

export interface WorldPickupDef {
  id: string;
  itemId: string;
  label: string;
  x: number;
  z: number;
  yOffset?: number;
}

export const STAGE1_WORLD_PICKUPS: WorldPickupDef[] = [
  { id: 'pk-cengkih', itemId: 'karung-cengkih', label: 'Karung Cengkih Pilihan', x: 43.2, z: -21.8, yOffset: 0.22 },
  { id: 'pk-batik', itemId: 'kain-batik-pesisir', label: 'Gulungan Kain Batik', x: 29.0, z: 12.0 },
  { id: 'pk-herbal', itemId: 'ramuan-herbal', label: 'Jamu & Ramuan Herbal', x: -15.5, z: 10.5 },
  { id: 'pk-buku', itemId: 'paket-buku', label: 'Paket Buku & Lontar', x: -10.5, z: -15.8, yOffset: 0.22 },
  { id: 'pk-ikan', itemId: 'hasil-tangkapan', label: 'Keranjang Ikan Segar', x: 70.5, z: -30.5, yOffset: 0.85 },
  { id: 'pk-kopi-1', itemId: 'kopi-rempah', label: 'Kopi Rempah Hangat', x: 19.5, z: -6.5 },
  { id: 'pk-palu-1', itemId: 'palu-arsitek', label: 'Palu Arsitek Nusantara', x: 18.2, z: 43.2, yOffset: 0.22 },
];

export interface DeliverySpotDef {
  id: string;
  label: string;
  requiredItemId: string;
  x: number;
  z: number;
  yOffset?: number;
  description: string;
}

export const STAGE1_DELIVERY_SPOTS: DeliverySpotDef[] = [
  {
    id: 'delivery-pasar-utama',
    label: 'Meja Penerimaan Saudagar Pasar',
    requiredItemId: 'karung-cengkih',
    x: 32.0,
    z: -15.0,
    yOffset: 0.22,
    description: 'Letakkan Karung Cengkih untuk pasokan utama pedagang Pasar Nusantara.',
  },
  {
    id: 'delivery-rumah-adat',
    label: 'Meja Kesehatan Rumah Adat',
    requiredItemId: 'ramuan-herbal',
    x: -38.0,
    z: -15.0,
    yOffset: 0.22,
    description: 'Antarkan Jamu & Ramuan Herbal untuk menjaga kesejahteraan warga kampung.',
  },
];

export interface EnterableBuildingDef {
  id: string;
  label: string;
  districtId: DistrictId;
  x: number;
  z: number;
  halfW: number;
  halfD: number;
  wallHeight: number;
  doorSide: 'north' | 'south' | 'east' | 'west';
  doorHalfWidth: number;
  roofColor: number;
  wallColor: number;
  furnitureKind:
    | 'townhall'
    | 'market'
    | 'warehouse'
    | 'house'
    | 'workshop'
    | 'school'
    | 'boutique'
    | 'hotel'
    | 'cafe';
}

export const STAGE1_ENTERABLE_BUILDINGS: EnterableBuildingDef[] = [
  {
    id: 'int-balai-kota',
    label: 'Balai Kota Nusantara',
    districtId: 'pusat-kota',
    x: -13.0,
    z: -15.0,
    halfW: 5.0,
    halfD: 4.0,
    wallHeight: 4.2,
    doorSide: 'south',
    doorHalfWidth: 1.5,
    roofColor: 0x991b1b,
    wallColor: 0xf5ebd6,
    furnitureKind: 'townhall',
  },
  {
    id: 'int-pasar-utama',
    label: 'Pasar Utama Nusantara',
    districtId: 'pasar-tradisional',
    x: 32.0,
    z: -15.0,
    halfW: 6.0,
    halfD: 4.5,
    wallHeight: 3.9,
    doorSide: 'west',
    doorHalfWidth: 1.8,
    roofColor: 0xb45309,
    wallColor: 0xe7d6bd,
    furnitureKind: 'market',
  },
  {
    id: 'int-gudang-pelabuhan',
    label: 'Gudang Pelabuhan Niaga',
    districtId: 'pelabuhan',
    x: 42.0,
    z: -22.0,
    halfW: 5.0,
    halfD: 4.0,
    wallHeight: 4.1,
    doorSide: 'east',
    doorHalfWidth: 1.6,
    roofColor: 0x78350f,
    wallColor: 0xc29a6b,
    furnitureKind: 'warehouse',
  },
  {
    id: 'int-rumah-adat',
    label: 'Rumah Adat Utama',
    districtId: 'permukiman',
    x: -38.0,
    z: -15.0,
    halfW: 4.5,
    halfD: 4.0,
    wallHeight: 3.8,
    doorSide: 'east',
    doorHalfWidth: 1.45,
    roofColor: 0x7c2d12,
    wallColor: 0xb0804f,
    furnitureKind: 'house',
  },
  {
    id: 'int-bengkel-industri',
    label: 'Bengkel Kerajinan & Logistik',
    districtId: 'industri',
    x: 22.0,
    z: 42.0,
    halfW: 5.0,
    halfD: 4.0,
    wallHeight: 4.1,
    doorSide: 'north',
    doorHalfWidth: 1.6,
    roofColor: 0x9a3412,
    wallColor: 0xd6c7b2,
    furnitureKind: 'workshop',
  },
  {
    id: 'int-sekolah-nusantara',
    label: 'Sekolah & Perpustakaan Nusantara',
    districtId: 'pendidikan',
    x: -16.0,
    z: -66.0,
    halfW: 6.0,
    halfD: 4.2,
    wallHeight: 4.0,
    doorSide: 'south',
    doorHalfWidth: 1.6,
    roofColor: 0x1e40af,
    wallColor: 0xf1f5f9,
    furnitureKind: 'school',
  },
  {
    id: 'int-butik-busana',
    label: 'Butik & Cermin Busana Nusantara',
    districtId: 'pusat-kota',
    x: -14.0,
    z: 22.0,
    halfW: 4.5,
    halfD: 3.8,
    wallHeight: 3.9,
    doorSide: 'north',
    doorHalfWidth: 1.5,
    roofColor: 0x9f1239,
    wallColor: 0xfdf2f8,
    furnitureKind: 'boutique',
  },
  {
    id: 'int-hotel-bahari',
    label: 'Hotel & Penginapan Bahari',
    districtId: 'pasar-tradisional',
    x: 34.0,
    z: 24.5,
    halfW: 5.0,
    halfD: 4.0,
    wallHeight: 4.3,
    doorSide: 'west',
    doorHalfWidth: 1.6,
    roofColor: 0x0f766e,
    wallColor: 0xf8fafc,
    furnitureKind: 'hotel',
  },
  {
    id: 'int-kafe-pelabuhan',
    label: 'Kedai Kopi & Kafe Pesisir',
    districtId: 'pasar-tradisional',
    x: 34.5,
    z: -38.0,
    halfW: 4.5,
    halfD: 3.6,
    wallHeight: 3.8,
    doorSide: 'west',
    doorHalfWidth: 1.5,
    roofColor: 0x78350f,
    wallColor: 0xfef3c7,
    furnitureKind: 'cafe',
  },
];

export const STAGE1_WARDROBE_MIRROR_SPOT = {
  id: 'wardrobe-mirror-butik',
  label: 'Cermin Studio Busana 3D',
  x: -12.0,
  z: 23.6,
  yOffset: 0.22,
};

export interface RideableVehicleDef {
  id: string;
  name: string;
  kind: VehicleKind;
  spawnX: number;
  spawnZ: number;
  spawnYaw: number;
  maxSpeed: number;
  description: string;
}

export const STAGE1_VEHICLES: RideableVehicleDef[] = [
  {
    id: 'veh-sepeda-1',
    name: 'Sepeda Onthel Kota',
    kind: 'bicycle',
    spawnX: 5.5,
    spawnZ: 5.5,
    spawnYaw: Math.PI / 2,
    maxSpeed: 16.5,
    description: 'Sepeda klasik cepat untuk berkeliling jalan raya & jembatan Nusantara.',
  },
  {
    id: 'veh-gerobak-1',
    name: 'Pedati Niaga Nusantara',
    kind: 'cart',
    spawnX: 21.5,
    spawnZ: 28.5,
    spawnYaw: 0,
    maxSpeed: 13.8,
    description: 'Kendaraan angkut barang niaga antara Pasar Tradisional dan Kawasan Industri.',
  },
  {
    id: 'veh-perahu-1',
    name: 'Perahu Jukung Bermotor',
    kind: 'boat',
    spawnX: 73.5,
    spawnZ: 28.2,
    spawnYaw: Math.PI / 2,
    maxSpeed: 17.5,
    description: 'Perahu bercadik untuk berlayar melintasi teluk menuju Pulau Mercusuar!',
  },
];

export function findDistrictAt(x: number, z: number): DistrictDef {
  for (const d of STAGE1_DISTRICTS) {
    if (x >= d.minX && x <= d.maxX && z >= d.minZ && z <= d.maxZ) {
      return d;
    }
  }
  return STAGE1_DISTRICTS[0];
}

export function getDistrictIdAt(x: number, z: number): DistrictId {
  return findDistrictAt(x, z).id;
}
