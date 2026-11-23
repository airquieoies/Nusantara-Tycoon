import {
  AchievementDef,
  CollectionMilestoneDef,
  EnterableBuildingDef,
  QuestEventType,
  RideableVehicleDef,
  WorldPickupDef,
} from './stage1Data';
import { CharacterId, ProductionRecipeDef } from './types';

export type Stage2DistrictId =
  | 's2-industri'
  | 's2-logistik'
  | 's2-komersial'
  | 's2-transportasi'
  | 's2-permukiman'
  | 's2-lingkungan';

export interface Stage2DistrictDef {
  id: Stage2DistrictId;
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

export const STAGE2_DISTRICTS: Stage2DistrictDef[] = [
  {
    id: 's2-transportasi',
    name: 'Pelabuhan Industri & Stasiun Rel',
    subtitle: 'Terminal Kedatangan Kapal, Derek Kargo & Jalur Kereta',
    description:
      'Simpul ekspor-impor Kota Industri dengan Kapal Ekspres antar-era, stasiun kereta barang, dan jalan raya truk.',
    minX: 34,
    maxX: 152,
    minZ: -94,
    maxZ: 94,
    centerX: 60,
    centerZ: 0,
    colorHex: '#0ea5e9',
    discoveryXp: 45,
  },
  {
    id: 's2-permukiman',
    name: 'Kawasan Permukiman Pekerja & Balai Kota',
    subtitle: 'Alun-Alun Industri, Klinik Pekerja & Studio Busana K3',
    description:
      'Jantung sosial kota industri dengan deretan rumah pekerja, Klinik Kesejahteraan, Balai Kota, dan Butik Seragam.',
    minX: -36,
    maxX: 34,
    minZ: -26,
    maxZ: 26,
    centerX: 0,
    centerZ: 0,
    colorHex: '#f59e0b',
    discoveryXp: 40,
  },
  {
    id: 's2-industri',
    name: 'Kawasan Industri & Pabrik Berat',
    subtitle: 'Pabrik Tekstil, Pabrik Pangan, Pembangkit Listrik & Mesin',
    description:
      'Pusat manufaktur bata merah dengan cerobong uap, turbin listrik, serta jalur produksi bahan mentah menjadi produk ekspor.',
    minX: -114,
    maxX: -36,
    minZ: -94,
    maxZ: 10,
    centerX: -68,
    centerZ: -32,
    colorHex: '#ea580c',
    discoveryXp: 50,
  },
  {
    id: 's2-logistik',
    name: 'Kawasan Logistik & Gudang Besar',
    subtitle: 'Pusat Penyimpanan Palet, Kontainer & Forklift',
    description:
      'Zona distribusi kargo yang menampung hasil produksi pabrik sebelum dikirim ke pasar grosir atau pelabuhan.',
    minX: -36,
    maxX: 34,
    minZ: 26,
    maxZ: 94,
    centerX: 0,
    centerZ: 54,
    colorHex: '#eab308',
    discoveryXp: 45,
  },
  {
    id: 's2-komersial',
    name: 'Kawasan Komersial & Perdagangan',
    subtitle: 'Pasar Grosir Modern, Kantor Dagang & Terminal Masa Depan',
    description:
      'Pusat transaksi grosir barang industri, kantor niaga, bank, serta Terminal Kereta Cepat Nusantara menuju Kota Digital (Stage 3).',
    minX: -36,
    maxX: 34,
    minZ: -94,
    maxZ: -26,
    centerX: 0,
    centerZ: -52,
    colorHex: '#8b5cf6',
    discoveryXp: 45,
  },
  {
    id: 's2-lingkungan',
    name: 'Kawasan Sungai & Pengolahan Lingkungan',
    subtitle: 'Sungai Industri, Pengolahan Air Bersih & Taman Penyangga',
    description:
      'Zona ekologi kota dengan jembatan sungai, Pusat Daur Ulang & Pengolahan Limbah untuk memulihkan kualitas air industri.',
    minX: -114,
    maxX: -36,
    minZ: 10,
    maxZ: 94,
    centerX: -66,
    centerZ: 46,
    colorHex: '#22c55e',
    discoveryXp: 55,
  },
];

export interface Stage2ItemDef {
  id: string;
  name: string;
  category: 'raw' | 'finished' | 'welfare' | 'consumable';
  description: string;
  effectLabel: string;
  iconKey: string;
}

export const STAGE2_ITEMS: Stage2ItemDef[] = [
  {
    id: 'kapas-serat',
    name: 'Bal Kapas & Serat Nusantara',
    category: 'raw',
    description: 'Bahan baku serat tekstil siap olah untuk mesin tenun Pabrik Tekstil Nusantara.',
    effectLabel: 'Bahan Baku Pabrik Tekstil',
    iconKey: 'package',
  },
  {
    id: 'bahan-pangan-mentah',
    name: 'Hasil Panen & Rempah Mentah',
    category: 'raw',
    description: 'Pasokan hasil bumi mentah untuk diolah di Pabrik Pengolahan Pangan.',
    effectLabel: 'Bahan Baku Pabrik Pangan',
    iconKey: 'package',
  },
  {
    id: 'kayu-olahan',
    name: 'Kayu Jati & Komponen Mebel',
    category: 'raw',
    description: 'Bahan kayu terstandar untuk lini produksi furnitur ekspor Nusantara.',
    effectLabel: 'Bahan Baku Furnitur & Kerajinan',
    iconKey: 'hammer',
  },
  {
    id: 'tekstil-nusantara',
    name: 'Tekstil Batik Industri (Jadi)',
    category: 'finished',
    description: 'Kain tekstil berkualitas ekspor hasil produksi Pabrik Tekstil Nusantara.',
    effectLabel: 'Kirim ke Gudang Logistik / Jual ke Pasar Grosir',
    iconKey: 'shirt',
  },
  {
    id: 'pangan-kemasan',
    name: 'Pangan Olahan Kaleng Nusantara (Jadi)',
    category: 'finished',
    description: 'Produk makanan & minuman rempah kemasan modern tahan kirim antarwilayah.',
    effectLabel: 'Kirim ke Gudang Logistik / Jual ke Pasar Grosir',
    iconKey: 'shopping-bag',
  },
  {
    id: 'paket-k3-pekerja',
    name: 'Paket Perlengkapan K3 & Medis Pekerja',
    category: 'welfare',
    description: 'Helm, masker filter, dan kotak P3K untuk keselamatan serta kesejahteraan buruh pabrik.',
    effectLabel: 'Antar ke Klinik Pekerja',
    iconKey: 'heart-pulse',
  },
  {
    id: 'filter-limbah-bersih',
    name: 'Kartrid Filter Bio-Limbah',
    category: 'welfare',
    description: 'Komponen penyaring air limbah cair agar sungai industri kembali jernih.',
    effectLabel: 'Pasang di Pusat Pengolahan Limbah',
    iconKey: 'leaf',
  },
  {
    id: 'kopi-rempah',
    name: 'Kopi Rempah Hangat',
    category: 'consumable',
    description: 'Minuman khas pekerja & pemimpin kota untuk memulihkan semangat (+25 XP, +4 Kepuasan).',
    effectLabel: 'Gunakan: +25 XP & +4 Kepuasan',
    iconKey: 'coffee',
  },
  {
    id: 'palu-arsitek',
    name: 'Palu Arsitek Nusantara',
    category: 'consumable',
    description: 'Perkakas ahli untuk mempercepat konstruksi bangunan kota yang sedang berjalan +50%.',
    effectLabel: 'Gunakan: Percepat Konstruksi +50%',
    iconKey: 'hammer',
  },
];

export const STAGE2_PRODUCTION_RECIPES: ProductionRecipeDef[] = [
  {
    id: 'rec-tekstil',
    factoryId: 's2-int-pabrik-tekstil',
    factoryName: 'Pabrik Tekstil Nusantara',
    name: 'Tenun Tekstil Batik Ekspor',
    inputItemId: 'kapas-serat',
    inputQty: 1,
    outputItemId: 'tekstil-nusantara',
    outputQty: 2,
    durationSeconds: 7,
    sellPriceCoins: 165,
    xpReward: 65,
    pollutionDelta: 3,
  },
  {
    id: 'rec-pangan',
    factoryId: 's2-int-pabrik-pangan',
    factoryName: 'Pabrik Pengolahan Pangan',
    name: 'Pengalengan Pangan & Rempah',
    inputItemId: 'bahan-pangan-mentah',
    inputQty: 1,
    outputItemId: 'pangan-kemasan',
    outputQty: 2,
    durationSeconds: 6,
    sellPriceCoins: 155,
    xpReward: 60,
    pollutionDelta: 2,
  },
];

export interface Stage2SupplyOffer {
  itemId: string;
  name: string;
  costCoins: number;
  qty: number;
  hint: string;
}

export const STAGE2_MARKET_SUPPLIES: Stage2SupplyOffer[] = [
  {
    itemId: 'kapas-serat',
    name: 'Bal Kapas & Serat Nusantara',
    costCoins: 45,
    qty: 1,
    hint: 'Bahan baku untuk mesin tenun Pabrik Tekstil Nusantara',
  },
  {
    itemId: 'bahan-pangan-mentah',
    name: 'Hasil Panen & Rempah Mentah',
    costCoins: 40,
    qty: 1,
    hint: 'Bahan baku untuk jalur produksi Pabrik Pengolahan Pangan',
  },
  {
    itemId: 'paket-k3-pekerja',
    name: 'Paket Perlengkapan K3 & Medis Pekerja',
    costCoins: 55,
    qty: 1,
    hint: 'Perlengkapan keselamatan pekerja untuk disalurkan ke Klinik Pekerja',
  },
  {
    itemId: 'filter-limbah-bersih',
    name: 'Kartrid Filter Bio-Limbah',
    costCoins: 65,
    qty: 1,
    hint: 'Filter penyaring limbah cair di Pusat Pengolahan Limbah',
  },
];

export interface Stage2CollectibleDef {
  id: string;
  name: string;
  category: 'mesin' | 'k3' | 'logistik' | 'lingkungan' | 'arsip' | 'desain';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  districtId: Stage2DistrictId;
  x: number;
  z: number;
  yOffset?: number;
  hint: string;
  description: string;
  xpReward: number;
  coinReward: number;
  industryBonus: number;
}

export const STAGE2_COLLECTIBLES: Stage2CollectibleDef[] = [
  {
    id: 's2-col-roda-gigi',
    name: 'Roda Gigi Kuningan Pertama',
    category: 'mesin',
    rarity: 'Common',
    districtId: 's2-industri',
    x: -66.5,
    z: -24.5,
    yOffset: 0.22,
    hint: 'Di sudut lantai produksi dalam Pabrik Tekstil Nusantara.',
    description: 'Komponen penggerak mesin tenun mekanis pertama di Kota Industri.',
    xpReward: 45,
    coinReward: 75,
    industryBonus: 4,
  },
  {
    id: 's2-col-cetakan-pangan',
    name: 'Ketel Uap Rempah Tembaga',
    category: 'mesin',
    rarity: 'Common',
    districtId: 's2-industri',
    x: -68.0,
    z: -4.8,
    yOffset: 0.22,
    hint: 'Di dalam Pabrik Pengolahan Pangan di sisi barat.',
    description: 'Ketel tembaga higienis untuk sterilisasi produk pangan kemasan ekspor.',
    xpReward: 45,
    coinReward: 75,
    industryBonus: 4,
  },
  {
    id: 's2-col-manifes-gudang',
    name: 'Manifes Kargo Rantai Pasok',
    category: 'logistik',
    rarity: 'Common',
    districtId: 's2-logistik',
    x: -8.5,
    z: 52.0,
    yOffset: 0.22,
    hint: 'Di meja rak dalam Gudang Logistik Pusat di kawasan selatan.',
    description: 'Catatan pelacakan palet barang antara pabrik, gudang, dan kapal ekspor.',
    xpReward: 50,
    coinReward: 80,
    industryBonus: 4,
  },
  {
    id: 's2-col-kartu-serikat',
    name: 'Piagam Keselamatan Kerja K3',
    category: 'k3',
    rarity: 'Common',
    districtId: 's2-permukiman',
    x: -17.5,
    z: 14.5,
    yOffset: 0.22,
    hint: 'Di meja pendaftaran dalam Klinik & Balai Kesejahteraan Pekerja.',
    description: 'Dokumen kesepakatan jam kerja manusiawi dan standar pelindung pekerja.',
    xpReward: 50,
    coinReward: 85,
    industryBonus: 5,
  },
  {
    id: 's2-col-lencana-seragam',
    name: 'Sketsa Seragam Industri Nusantara',
    category: 'desain',
    rarity: 'Uncommon',
    districtId: 's2-permukiman',
    x: 16.5,
    z: 16.5,
    yOffset: 0.22,
    hint: 'Di sudut pameran dalam Butik Seragam & Studio Busana 3D.',
    description: 'Desain busana kerja modern yang memadukan motif Nusantara dan standar K3.',
    xpReward: 60,
    coinReward: 95,
    industryBonus: 5,
  },
  {
    id: 's2-col-buku-wallerstein',
    name: 'Cetak Biru Hilirisasi Ekonomi',
    category: 'arsip',
    rarity: 'Uncommon',
    districtId: 's2-permukiman',
    x: -14.5,
    z: -16.5,
    yOffset: 0.22,
    hint: 'Di ruang rapat dalam Balai Kota & Bursa Industri.',
    description: 'Rencana strategis menggeser kota dari pengekspor bahan mentah menjadi produsen mandiri.',
    xpReward: 60,
    coinReward: 100,
    industryBonus: 5,
  },
  {
    id: 's2-col-tiket-ekspres',
    name: 'Lentera Kereta Uap Nusantara',
    category: 'logistik',
    rarity: 'Uncommon',
    districtId: 's2-transportasi',
    x: 42.5,
    z: -24.5,
    yOffset: 0.22,
    hint: 'Di loket dalam Stasiun Kereta Logistik sebelah timur.',
    description: 'Lentera sinyal rel kereta kargo yang menghubungkan pabrik langsung ke dermaga.',
    xpReward: 65,
    coinReward: 105,
    industryBonus: 5,
  },
  {
    id: 's2-col-sampel-air',
    name: 'Tabung Uji Kualitas Sungai',
    category: 'lingkungan',
    rarity: 'Uncommon',
    districtId: 's2-lingkungan',
    x: -72.0,
    z: 45.5,
    yOffset: 0.22,
    hint: 'Di laboratorium dalam Pusat Daur Ulang & Pengolah Limbah.',
    description: 'Alat ukur kejernihan dan pH air sungai di kawasan industri.',
    xpReward: 65,
    coinReward: 110,
    industryBonus: 6,
  },
  {
    id: 's2-col-segel-ekspor',
    name: 'Stempel Bea Ekspor Samudra',
    category: 'logistik',
    rarity: 'Rare',
    districtId: 's2-komersial',
    x: 16.0,
    z: -46.5,
    hint: 'Di dekat Pasar Grosir Komersial bagian timur laut.',
    description: 'Cap resmi kelayakan ekspor produk manufaktur kota Nusantara.',
    xpReward: 80,
    coinReward: 130,
    industryBonus: 6,
  },
  {
    id: 's2-col-kumparan-tesla',
    name: 'Kumparan Dinamo Pembangkit',
    category: 'mesin',
    rarity: 'Rare',
    districtId: 's2-industri',
    x: -44.0,
    z: -56.0,
    hint: 'Di halaman Pembangkit Listrik Kota kawasan barat laut.',
    description: 'Gulungan tembaga penghasil daya listrik bertegangan tinggi untuk seluruh pabrik.',
    xpReward: 85,
    coinReward: 140,
    industryBonus: 6,
  },
  {
    id: 's2-col-helm-emas',
    name: 'Helm Insinyur Keselamatan Emas',
    category: 'k3',
    rarity: 'Rare',
    districtId: 's2-logistik',
    x: 24.5,
    z: 66.0,
    hint: 'Di halaman peti kemas tenggara Kawasan Logistik.',
    description: 'Penghargaan atas keberhasilan menekan angka kecelakaan kerja hingga nol.',
    xpReward: 90,
    coinReward: 145,
    industryBonus: 7,
  },
  {
    id: 's2-col-kunci-dermaga',
    name: 'Kunci Derek Kargo Pelabuhan',
    category: 'logistik',
    rarity: 'Rare',
    districtId: 's2-transportasi',
    x: 68.5,
    z: -2.0,
    yOffset: 0.9,
    hint: 'Di ujung Dermaga Industri dekat Kapal Ekspres.',
    description: 'Kunci kendali derek berat pengangkat peti kemas antar kapal dan rel kereta.',
    xpReward: 95,
    coinReward: 155,
    industryBonus: 7,
  },
  {
    id: 's2-col-filter-bio',
    name: 'Prototipe Membran Bio-Filter',
    category: 'lingkungan',
    rarity: 'Epic',
    districtId: 's2-lingkungan',
    x: -55.0,
    z: 34.5,
    hint: 'Di tepi Jembatan Pengolahan Sungai kawasan barat daya.',
    description: 'Teknologi penyaring mikro-karbon yang menetralkan limbah tekstil sebelum ke sungai.',
    xpReward: 110,
    coinReward: 185,
    industryBonus: 8,
  },
  {
    id: 's2-col-maket-rel-cepat',
    name: 'Maket Kereta Cepat Era Digital',
    category: 'arsip',
    rarity: 'Epic',
    districtId: 's2-komersial',
    x: -4.0,
    z: -72.0,
    hint: 'Di pelataran Terminal Kereta Cepat Nusantara (gerbang Stage 3) sebelah utara.',
    description: 'Model konsep jaringan transportasi listrik berkecepatan tinggi untuk era berikutnya.',
    xpReward: 120,
    coinReward: 200,
    industryBonus: 8,
  },
  {
    id: 's2-col-kompas-kapal-uap',
    name: 'Kronometer Kapal Ekspres Industri',
    category: 'arsip',
    rarity: 'Legendary',
    districtId: 's2-transportasi',
    x: 76.5,
    z: 9.0,
    yOffset: 2.1,
    hint: 'Naiki tangga dek Kapal Ekspres Industri di Dermaga Pelabuhan Timur!',
    description: 'Penunjuk waktu presisi kapal uap cepat penghubung Kota Perdagangan dan Kota Industri.',
    xpReward: 165,
    coinReward: 280,
    industryBonus: 10,
  },
];

export const STAGE2_COLLECTION_MILESTONES: CollectionMilestoneDef[] = [
  {
    id: 's2-mile-25',
    requiredCount: 4,
    title: 'Inspektor Pabrik (25%)',
    description: 'Berhasil menghimpun 4 artefak mekanisasi & keselamatan kerja Kota Industri.',
    xpReward: 100,
    coinReward: 160,
    unlockCustomizationIds: ['glasses-goggles-industri'],
  },
  {
    id: 's2-mile-50',
    requiredCount: 8,
    title: 'Pengawas Rantai Pasok (50%)',
    description: 'Setengah koleksi arsip logistik, energi, dan produksi Stage 2 terkumpul.',
    xpReward: 160,
    coinReward: 250,
    unlockCustomizationIds: ['bag-tas-perkakas'],
    unlockBlueprintId: 'pabrik-elektronik',
  },
  {
    id: 's2-mile-75',
    requiredCount: 12,
    title: 'Pelopor Industri Berkelanjutan (75%)',
    description: 'Koleksi langka dari pabrik, pembangkit, dan pengolahan sungai telah dikuasai.',
    xpReward: 230,
    coinReward: 360,
    unlockCustomizationIds: ['jacket-jaket-ekspor'],
  },
  {
    id: 's2-mile-100',
    requiredCount: 15,
    title: 'Arsitek Agung Industri (100%)',
    description: 'Seluruh 15/15 Koleksi Era Industri Stage 2 lengkap!',
    xpReward: 380,
    coinReward: 550,
    unlockCustomizationIds: ['acc-lencana-k3'],
    unlockTitleId: 'title-arsitek-industri',
  },
];

export interface Stage2EnterableBuildingDef extends Omit<EnterableBuildingDef, 'districtId' | 'furnitureKind'> {
  districtId: Stage2DistrictId;
  furnitureKind:
    | 'townhall'
    | 'warehouse'
    | 'boutique'
    | 'factory_textile'
    | 'factory_food'
    | 'clinic'
    | 'recycling'
    | 'station';
}

export const STAGE2_ENTERABLE_BUILDINGS: Stage2EnterableBuildingDef[] = [
  {
    id: 's2-int-balai-industri',
    label: 'Balai Kota & Bursa Industri',
    districtId: 's2-permukiman',
    x: -12.0,
    z: -15.0,
    halfW: 5.2,
    halfD: 4.0,
    wallHeight: 4.3,
    doorSide: 'south',
    doorHalfWidth: 1.55,
    roofColor: 0x334155,
    wallColor: 0xe2e8f0,
    furnitureKind: 'townhall',
  },
  {
    id: 's2-int-klinik-pekerja',
    label: 'Klinik & Balai Kesejahteraan Pekerja',
    districtId: 's2-permukiman',
    x: -15.0,
    z: 15.0,
    halfW: 5.0,
    halfD: 3.8,
    wallHeight: 3.9,
    doorSide: 'north',
    doorHalfWidth: 1.55,
    roofColor: 0x0f766e,
    wallColor: 0xf8fafc,
    furnitureKind: 'clinic',
  },
  {
    id: 's2-int-butik-industri',
    label: 'Butik Seragam & Studio Busana 3D',
    districtId: 's2-permukiman',
    x: 15.0,
    z: 15.0,
    halfW: 4.5,
    halfD: 3.8,
    wallHeight: 3.9,
    doorSide: 'north',
    doorHalfWidth: 1.5,
    roofColor: 0x1e3a8a,
    wallColor: 0xf1f5f9,
    furnitureKind: 'boutique',
  },
  {
    id: 's2-int-pabrik-tekstil',
    label: 'Pabrik Tekstil Nusantara',
    districtId: 's2-industri',
    x: -64.0,
    z: -24.0,
    halfW: 6.5,
    halfD: 4.8,
    wallHeight: 4.5,
    doorSide: 'east',
    doorHalfWidth: 1.8,
    roofColor: 0x475569,
    wallColor: 0x9a3412,
    furnitureKind: 'factory_textile',
  },
  {
    id: 's2-int-pabrik-pangan',
    label: 'Pabrik Pengolahan Pangan',
    districtId: 's2-industri',
    x: -64.0,
    z: -4.0,
    halfW: 6.2,
    halfD: 4.5,
    wallHeight: 4.3,
    doorSide: 'east',
    doorHalfWidth: 1.75,
    roofColor: 0x334155,
    wallColor: 0xb45309,
    furnitureKind: 'factory_food',
  },
  {
    id: 's2-int-gudang-logistik',
    label: 'Gudang Logistik Pusat',
    districtId: 's2-logistik',
    x: -10.0,
    z: 50.0,
    halfW: 6.5,
    halfD: 4.8,
    wallHeight: 4.4,
    doorSide: 'north',
    doorHalfWidth: 1.85,
    roofColor: 0x1e293b,
    wallColor: 0x64748b,
    furnitureKind: 'warehouse',
  },
  {
    id: 's2-int-daur-ulang',
    label: 'Pusat Daur Ulang & Pengolah Limbah',
    districtId: 's2-lingkungan',
    x: -72.0,
    z: 44.0,
    halfW: 5.5,
    halfD: 4.2,
    wallHeight: 4.0,
    doorSide: 'east',
    doorHalfWidth: 1.6,
    roofColor: 0x065f46,
    wallColor: 0xd1fae5,
    furnitureKind: 'recycling',
  },
  {
    id: 's2-int-stasiun-rel',
    label: 'Stasiun Kereta & Terminal Pelabuhan',
    districtId: 's2-transportasi',
    x: 41.0,
    z: -24.0,
    halfW: 5.0,
    halfD: 4.4,
    wallHeight: 4.2,
    doorSide: 'west',
    doorHalfWidth: 1.7,
    roofColor: 0x78350f,
    wallColor: 0xe7d6bd,
    furnitureKind: 'station',
  },
];

export const STAGE2_WARDROBE_MIRROR_SPOT = {
  id: 's2-wardrobe-mirror-butik',
  label: 'Cermin Studio Seragam & Busana 3D',
  x: 16.2,
  z: 16.5,
  yOffset: 0.22,
};

export interface Stage2FactoryStationDef {
  id: string;
  buildingId: string;
  label: string;
  recipeId: string;
  x: number;
  z: number;
  yOffset: number;
  description: string;
}

export const STAGE2_FACTORY_STATIONS: Stage2FactoryStationDef[] = [
  {
    id: 's2-station-tekstil',
    buildingId: 's2-int-pabrik-tekstil',
    label: 'Panel Mesin Tenun Tekstil',
    recipeId: 'rec-tekstil',
    x: -64.0,
    z: -24.0,
    yOffset: 0.22,
    description: 'Olah Bal Kapas menjadi Tekstil Batik Industri bernilai ekspor tinggi.',
  },
  {
    id: 's2-station-pangan',
    buildingId: 's2-int-pabrik-pangan',
    label: 'Panel Pengolahan & Kaleng Pangan',
    recipeId: 'rec-pangan',
    x: -64.0,
    z: -4.0,
    yOffset: 0.22,
    description: 'Olah Hasil Panen Mentah menjadi Pangan Kaleng Rempah siap kirim.',
  },
];

export const STAGE2_WORLD_PICKUPS: WorldPickupDef[] = [
  {
    id: 's2-pk-kapas',
    itemId: 'kapas-serat',
    label: 'Bal Kapas & Serat Nusantara',
    x: -48.0,
    z: -24.0,
  },
  {
    id: 's2-pk-pangan',
    itemId: 'bahan-pangan-mentah',
    label: 'Hasil Panen & Rempah Mentah',
    x: -48.0,
    z: -4.0,
  },
  {
    id: 's2-pk-kayu',
    itemId: 'kayu-olahan',
    label: 'Kayu Jati & Komponen Mebel',
    x: -24.0,
    z: 42.0,
  },
  {
    id: 's2-pk-k3',
    itemId: 'paket-k3-pekerja',
    label: 'Paket Perlengkapan K3 Pekerja',
    x: 4.5,
    z: 10.5,
  },
  {
    id: 's2-pk-filter',
    itemId: 'filter-limbah-bersih',
    label: 'Kartrid Filter Bio-Limbah',
    x: -42.0,
    z: 36.0,
  },
  {
    id: 's2-pk-kopi',
    itemId: 'kopi-rempah',
    label: 'Kopi Rempah Hangat',
    x: 18.0,
    z: -10.0,
  },
  {
    id: 's2-pk-palu',
    itemId: 'palu-arsitek',
    label: 'Palu Arsitek Nusantara',
    x: 24.0,
    z: 38.0,
  },
];

export const STAGE2_DELIVERY_SPOTS: (Omit<import('./stage1Data').DeliverySpotDef, 'requiredItemId'> & {
  acceptedItemIds: string[];
  requiredItemId: string;
  sellRewardCoins: number;
  tradeBoost: number;
  welfareBoost?: number;
  envBoost?: number;
})[] = [
  {
    id: 's2-del-gudang',
    label: 'Dermaga Penerimaan Gudang Logistik',
    requiredItemId: 'tekstil-nusantara',
    acceptedItemIds: ['tekstil-nusantara', 'pangan-kemasan'],
    x: -10.0,
    z: 48.0,
    yOffset: 0.22,
    description: 'Setorkan barang produksi pabrik ke Gudang Logistik Pusat untuk dicatat & dikirim.',
    sellRewardCoins: 140,
    tradeBoost: 8,
  },
  {
    id: 's2-del-grosir',
    label: 'Bursa Penjualan Pasar Grosir Komersial',
    requiredItemId: 'tekstil-nusantara',
    acceptedItemIds: ['tekstil-nusantara', 'pangan-kemasan'],
    x: 10.0,
    z: -44.0,
    description: 'Jual barang jadi ke Pasar Grosir untuk mendongkrak Ekspor & Ekonomi Industri!',
    sellRewardCoins: 185,
    tradeBoost: 12,
  },
  {
    id: 's2-del-klinik',
    label: 'Pos Perlengkapan K3 Klinik Pekerja',
    requiredItemId: 'paket-k3-pekerja',
    acceptedItemIds: ['paket-k3-pekerja'],
    x: -15.0,
    z: 14.0,
    yOffset: 0.22,
    description: 'Serahkan Paket K3 & Medis demi kesehatan dan keselamatan pekerja pabrik.',
    sellRewardCoins: 120,
    tradeBoost: 4,
    welfareBoost: 14,
  },
  {
    id: 's2-del-limbah',
    label: 'Unit Pemasangan Bio-Filter Limbah',
    requiredItemId: 'filter-limbah-bersih',
    acceptedItemIds: ['filter-limbah-bersih'],
    x: -71.0,
    z: 44.0,
    yOffset: 0.22,
    description: 'Pasang Kartrid Filter Bio-Limbah untuk menyaring air sungai industri.',
    sellRewardCoins: 130,
    tradeBoost: 4,
    envBoost: 18,
  },
];

export const STAGE2_VEHICLES: RideableVehicleDef[] = [
  {
    id: 's2-veh-delivery-truck',
    name: 'Truk Pengiriman Niaga',
    kind: 'delivery_truck',
    spawnX: 28.0,
    spawnZ: 6.5,
    spawnYaw: -Math.PI / 2,
    maxSpeed: 18.5,
    description: 'Truk distribusi lincah untuk mengantar bahan baku & produk antar pabrik-pasar.',
  },
  {
    id: 's2-veh-cargo-truck',
    name: 'Truk Kargo Berat Industri',
    kind: 'cargo_truck',
    spawnX: 12.0,
    spawnZ: 34.0,
    spawnYaw: Math.PI,
    maxSpeed: 16.5,
    description: 'Truk kontainer berat untuk mengangkut muatan pabrik menuju Pelabuhan & Gudang.',
  },
  {
    id: 's2-veh-industrial-bus',
    name: 'Bus Pekerja Kota Industri',
    kind: 'industrial_bus',
    spawnX: -8.0,
    spawnZ: -6.5,
    spawnYaw: -Math.PI / 2,
    maxSpeed: 17.2,
    description: 'Angkutan massal pekerja yang menghubungkan permukiman dan kawasan pabrik.',
  },
  {
    id: 's2-veh-forklift',
    name: 'Forklift Gudang Logistik',
    kind: 'forklift',
    spawnX: -20.0,
    spawnZ: 44.0,
    spawnYaw: Math.PI / 2,
    maxSpeed: 13.5,
    description: 'Forklift lincah kawasan logistik untuk memindahkan peti barang industri.',
  },
];

export type Stage2QuestEventType =
  | QuestEventType
  | 'start_production'
  | 'collect_production'
  | 'sell_goods'
  | 'inspect_locked_stage3';

export interface Stage2QuestStepDef {
  id: string;
  description: string;
  eventType: Stage2QuestEventType;
  targetId: string;
  requiredItemToConsume?: string;
  waypointX: number;
  waypointZ: number;
  waypointLabel: string;
}

export interface Stage2QuestDef {
  id: string;
  title: string;
  kind: 'main' | 'side';
  order: number;
  giverNpcId: string;
  summary: string;
  steps: Stage2QuestStepDef[];
  rewards: {
    xp: number;
    coins: number;
    reputation: number;
    happiness: number;
    welfare: number;
    itemId?: string;
    itemQty?: number;
    unlockCustomizationIds?: string[];
    unlockBlueprintId?: string;
    unlockTitleId?: string;
  };
}

export const STAGE2_QUESTS: Stage2QuestDef[] = [
  {
    id: 's2-q-main-1',
    title: 'Misi 1: Era Industri Baru',
    kind: 'main',
    order: 1,
    giverNpcId: 's2-npc-aditya',
    summary:
      'Kamu baru tiba di Pelabuhan Kota Industri! Temui Aditya di Terminal Pelabuhan dan tinjau Kawasan Pabrik Barat.',
    steps: [
      {
        id: 's2-q1-s1',
        description: 'Temui Aditya di Terminal Kedatangan Pelabuhan Industri',
        eventType: 'talk_npc',
        targetId: 's2-npc-aditya',
        waypointX: 48.5,
        waypointZ: -5.0,
        waypointLabel: 'Aditya (Terminal Pelabuhan)',
      },
      {
        id: 's2-q1-s2',
        description: 'Jelajahi Kawasan Industri & Pabrik Berat di sebelah barat',
        eventType: 'visit_district',
        targetId: 's2-industri',
        waypointX: -54.0,
        waypointZ: -20.0,
        waypointLabel: 'Kawasan Industri Barat',
      },
      {
        id: 's2-q1-s3',
        description: 'Temui Koordinator Produksi Pak Hendra di depan Pabrik Tekstil',
        eventType: 'talk_npc',
        targetId: 's2-npc-mandor',
        waypointX: -53.5,
        waypointZ: -24.0,
        waypointLabel: 'Pak Hendra (Pabrik Tekstil)',
      },
    ],
    rewards: {
      xp: 120,
      coins: 200,
      reputation: 7,
      happiness: 5,
      welfare: 4,
      itemId: 'kopi-rempah',
      itemQty: 1,
      unlockCustomizationIds: ['hat-helm-proyek', 'shirt-seragam-pabrik'],
    },
  },
  {
    id: 's2-q-main-2',
    title: 'Misi 2: Operasi Lini Produksi Pabrik',
    kind: 'main',
    order: 2,
    giverNpcId: 's2-npc-mandor',
    summary:
      'Ambil bahan baku Kapas & Serat, masuk ke Pabrik Tekstil Nusantara, dan selesaikan satu siklus produksi barang jadi.',
    steps: [
      {
        id: 's2-q2-s1',
        description: 'Ambil Bal Kapas & Serat di halaman pasokan pabrik',
        eventType: 'collect_item',
        targetId: 'kapas-serat',
        waypointX: -48.0,
        waypointZ: -24.0,
        waypointLabel: 'Bal Kapas & Serat',
      },
      {
        id: 's2-q2-s2',
        description: 'Masuk ke Pabrik Tekstil Nusantara & mulai produksi di Panel Mesin [E]',
        eventType: 'start_production',
        targetId: 'rec-tekstil',
        waypointX: -64.0,
        waypointZ: -24.0,
        waypointLabel: 'Panel Mesin Tekstil [E]',
      },
      {
        id: 's2-q2-s3',
        description: 'Ambil hasil Tekstil Batik Industri yang selesai diproduksi',
        eventType: 'collect_production',
        targetId: 'rec-tekstil',
        waypointX: -64.0,
        waypointZ: -24.0,
        waypointLabel: 'Ambil Hasil Produksi [E]',
      },
    ],
    rewards: {
      xp: 160,
      coins: 260,
      reputation: 9,
      happiness: 6,
      welfare: 5,
      itemId: 'palu-arsitek',
      itemQty: 1,
      unlockCustomizationIds: ['jacket-rompi-keselamatan'],
      unlockTitleId: 'title-perintis-industri',
    },
  },
  {
    id: 's2-q-main-3',
    title: 'Misi 3: Tantangan Rantai Pasok',
    kind: 'main',
    order: 3,
    giverNpcId: 's2-npc-naya',
    summary:
      'Kirimkan hasil produksi pabrik ke Gudang Logistik Pusat dan pasarkan ke Bursa Grosir Kawasan Komersial!',
    steps: [
      {
        id: 's2-q3-s1',
        description: 'Temui Naya di kawasan logistik selatan untuk koordinasi distribusi',
        eventType: 'talk_npc',
        targetId: 's2-npc-naya',
        waypointX: -4.0,
        waypointZ: 34.0,
        waypointLabel: 'Naya (Logistik Selatan)',
      },
      {
        id: 's2-q3-s2',
        description: 'Masuk ke Gudang Logistik Pusat & setorkan produk jadi [E]',
        eventType: 'deliver_item',
        targetId: 's2-del-gudang',
        waypointX: -10.0,
        waypointZ: 48.0,
        waypointLabel: 'Gudang Logistik Pusat',
      },
      {
        id: 's2-q3-s3',
        description: 'Jual komoditas industri di Bursa Pasar Grosir Komersial [E]',
        eventType: 'sell_goods',
        targetId: 's2-del-grosir',
        waypointX: 10.0,
        waypointZ: -44.0,
        waypointLabel: 'Pasar Grosir Komersial',
      },
    ],
    rewards: {
      xp: 185,
      coins: 310,
      reputation: 10,
      happiness: 8,
      welfare: 6,
      unlockCustomizationIds: ['hat-topi-mandor'],
      unlockTitleId: 'title-manajer-logistik',
    },
  },
  {
    id: 's2-q-main-4',
    title: 'Misi 4: Kesejahteraan Pekerja Pabrik',
    kind: 'main',
    order: 4,
    giverNpcId: 's2-npc-pekerja',
    summary:
      'Industrialisasi memicu jam kerja berat dan risiko cedera. Dengarkan keluhan Kang Dani dan kirim Paket K3 ke Klinik Pekerja.',
    steps: [
      {
        id: 's2-q4-s1',
        description: 'Bicara dengan Kang Dani (Perwakilan Pekerja) di Permukiman Tengah',
        eventType: 'talk_npc',
        targetId: 's2-npc-pekerja',
        waypointX: -4.5,
        waypointZ: 11.0,
        waypointLabel: 'Kang Dani (Permukiman)',
      },
      {
        id: 's2-q4-s2',
        description: 'Ambil Paket Perlengkapan K3 & Medis Pekerja di Alun-Alun Pekerja',
        eventType: 'collect_item',
        targetId: 'paket-k3-pekerja',
        waypointX: 4.5,
        waypointZ: 10.5,
        waypointLabel: 'Paket K3 Pekerja',
      },
      {
        id: 's2-q4-s3',
        description: 'Masuk ke Klinik Pekerja & serahkan Paket K3 di pos penerimaan [E]',
        eventType: 'deliver_item',
        targetId: 's2-del-klinik',
        waypointX: -15.0,
        waypointZ: 14.0,
        waypointLabel: 'Dalam Klinik Pekerja',
      },
    ],
    rewards: {
      xp: 195,
      coins: 300,
      reputation: 11,
      happiness: 12,
      welfare: 14,
      unlockCustomizationIds: ['shoes-bot-safety'],
    },
  },
  {
    id: 's2-q-main-5',
    title: 'Misi 5: Ekspansi & Peningkatan Industri',
    kind: 'main',
    order: 5,
    giverNpcId: 's2-npc-kepala-gudang',
    summary:
      'Perluas kapasitas kota! Dirikan fasilitas baru melalui Menu Bangun [B] dan tingkatkan salah satu bangunan ke Level 2.',
    steps: [
      {
        id: 's2-q5-s1',
        description: 'Buka Menu Bangun [B], pilih fasilitas Stage 2 & selesaikan 1 bangunan',
        eventType: 'build_facility',
        targetId: '*',
        waypointX: 14.0,
        waypointZ: -16.0,
        waypointLabel: 'Area Bangun Bebas',
      },
      {
        id: 's2-q5-s2',
        description: 'Tingkatkan (Upgrade) salah satu bangunan terpasang ke Level 2',
        eventType: 'upgrade_facility',
        targetId: '*',
        waypointX: 14.0,
        waypointZ: -16.0,
        waypointLabel: 'Upgrade Bangunan Lv 2',
      },
      {
        id: 's2-q5-s3',
        description: 'Kunjungi Balai Kota & Bursa Industri untuk laporan ekspansi',
        eventType: 'enter_interior',
        targetId: 's2-int-balai-industri',
        waypointX: -12.0,
        waypointZ: -15.0,
        waypointLabel: 'Balai Kota Industri',
      },
    ],
    rewards: {
      xp: 230,
      coins: 360,
      reputation: 12,
      happiness: 9,
      welfare: 8,
      unlockCustomizationIds: ['jacket-jas-industri'],
      unlockBlueprintId: 'pabrik-elektronik',
    },
  },
  {
    id: 's2-q-main-6',
    title: 'Misi 6: Tantangan Lingkungan Sungai Industri',
    kind: 'main',
    order: 6,
    giverNpcId: 's2-npc-laras',
    summary:
      'Laras & Dr. Sinta memperingatkan polusi sungai akibat limbah pabrik! Periksa sensor sungai dan pasang Bio-Filter Limbah.',
    steps: [
      {
        id: 's2-q6-s1',
        description: 'Temui Laras di Jembatan Sungai Kawasan Lingkungan Barat Daya',
        eventType: 'talk_npc',
        targetId: 's2-npc-laras',
        waypointX: -48.0,
        waypointZ: 28.0,
        waypointLabel: 'Laras (Kawasan Lingkungan)',
      },
      {
        id: 's2-q6-s2',
        description: 'Inspeksi Sensor Kualitas Air Sungai Industri [E]',
        eventType: 'inspect_landmark',
        targetId: 'lm-s2-sungai-sensor',
        waypointX: -54.0,
        waypointZ: 34.0,
        waypointLabel: 'Sensor Sungai Industri',
      },
      {
        id: 's2-q6-s3',
        description: 'Ambil Kartrid Filter Bio-Limbah di tepi fasilitas pengolahan',
        eventType: 'collect_item',
        targetId: 'filter-limbah-bersih',
        waypointX: -42.0,
        waypointZ: 36.0,
        waypointLabel: 'Filter Bio-Limbah',
      },
      {
        id: 's2-q6-s4',
        description: 'Masuk ke Pusat Daur Ulang & pasang Bio-Filter untuk memulihkan sungai [E]',
        eventType: 'deliver_item',
        targetId: 's2-del-limbah',
        waypointX: -71.0,
        waypointZ: 44.0,
        waypointLabel: 'Pusat Pengolahan Limbah',
      },
    ],
    rewards: {
      xp: 280,
      coins: 440,
      reputation: 15,
      happiness: 14,
      welfare: 12,
      unlockCustomizationIds: ['jacket-jaket-ekspor', 'acc-lencana-k3'],
      unlockTitleId: 'title-pelopor-hijau',
    },
  },
  {
    id: 's2-q-main-7',
    title: 'Misi 7: Kota Industri yang Berkembang',
    kind: 'main',
    order: 7,
    giverNpcId: 's2-npc-aditya',
    summary:
      'Kembangkan lini manufaktur pangan ekspor! Olah Hasil Panen di Pabrik Pangan dan jual produk kemasan di Pasar Grosir.',
    steps: [
      {
        id: 's2-q7-s1',
        description: 'Siapkan atau ambil Hasil Panen & Rempah Mentah di depan Pabrik Pangan',
        eventType: 'collect_item',
        targetId: 'bahan-pangan-mentah',
        waypointX: -48.0,
        waypointZ: -4.0,
        waypointLabel: 'Pasokan Pangan Mentah',
      },
      {
        id: 's2-q7-s2',
        description: 'Masuk ke Pabrik Pengolahan Pangan & mulai produksi di Panel Mesin [E]',
        eventType: 'start_production',
        targetId: 'rec-pangan',
        waypointX: -64.0,
        waypointZ: -4.0,
        waypointLabel: 'Pabrik Pengolahan Pangan',
      },
      {
        id: 's2-q7-s3',
        description: 'Ambil hasil Pangan Olahan Kaleng Nusantara dari mesin produksi',
        eventType: 'collect_production',
        targetId: 'rec-pangan',
        waypointX: -64.0,
        waypointZ: -4.0,
        waypointLabel: 'Ambil Pangan Kemasan',
      },
      {
        id: 's2-q7-s4',
        description: 'Pasarkan produk olahan di Bursa Pasar Grosir Komersial [E]',
        eventType: 'sell_goods',
        targetId: 's2-del-grosir',
        waypointX: 10.0,
        waypointZ: -44.0,
        waypointLabel: 'Pasar Grosir Komersial',
      },
    ],
    rewards: {
      xp: 260,
      coins: 400,
      reputation: 12,
      happiness: 10,
      welfare: 8,
      unlockCustomizationIds: ['shirt-olahraga-garuda'],
      unlockTitleId: 'title-penggerak-industri',
    },
  },
  {
    id: 's2-q-main-8',
    title: 'Misi 8: Destinasi Berikutnya (Gerbang Era Digital)',
    kind: 'main',
    order: 8,
    giverNpcId: 's2-npc-kapten-ekspres',
    summary:
      'Kota Industri kini stabil! Tinjau Terminal Kereta Cepat Nusantara (gerbang Stage 3) dan temui Aditya di Pelabuhan Ekspres.',
    steps: [
      {
        id: 's2-q8-s1',
        description: 'Inspeksi Terminal Kereta Cepat Nusantara (gerbang Stage 3) di utara',
        eventType: 'inspect_locked_stage3',
        targetId: 'lm-s2-stage3-terminal',
        waypointX: -4.0,
        waypointZ: -74.0,
        waypointLabel: 'Terminal Kereta Cepat (Stage 3)',
      },
      {
        id: 's2-q8-s2',
        description: 'Naiki dek Kapal Ekspres Industri di Dermaga Timur untuk kesiapan lintas wilayah',
        eventType: 'board_ship',
        targetId: 'ship-stage1-return',
        waypointX: 74.0,
        waypointZ: 7.5,
        waypointLabel: 'Dek Kapal Ekspres',
      },
      {
        id: 's2-q8-s3',
        description: 'Temui Aditya di Terminal Pelabuhan Industri untuk penutupan era Stage 2',
        eventType: 'talk_npc',
        targetId: 's2-npc-aditya',
        waypointX: 48.5,
        waypointZ: -5.0,
        waypointLabel: 'Aditya (Terminal Pelabuhan)',
      },
    ],
    rewards: {
      xp: 340,
      coins: 520,
      reputation: 16,
      happiness: 12,
      welfare: 10,
      unlockCustomizationIds: ['acc-jam-tangan'],
      unlockTitleId: 'title-arsitek-industri',
    },
  },
  // Side Quests Stage 2
  {
    id: 's2-q-side-1',
    title: 'Sampingan: Armada Truk & Forklift Industri',
    kind: 'side',
    order: 9,
    giverNpcId: 's2-npc-kepala-gudang',
    summary: 'Uji kendaraan logistik kota industri dan periksa derek kontainer di Pelabuhan Timur.',
    steps: [
      {
        id: 's2-qs1-s1',
        description: 'Kendarai Truk Pengiriman, Truk Kargo, atau Forklift (tekan F)',
        eventType: 'drive_vehicle',
        targetId: '*',
        waypointX: 28.0,
        waypointZ: 6.5,
        waypointLabel: 'Truk Pengiriman Niaga',
      },
      {
        id: 's2-qs1-s2',
        description: 'Inspeksi Derek Kargo Pelabuhan Industri [E]',
        eventType: 'inspect_landmark',
        targetId: 'lm-s2-derek-industri',
        waypointX: 66.0,
        waypointZ: -2.0,
        waypointLabel: 'Derek Pelabuhan Industri',
      },
    ],
    rewards: {
      xp: 145,
      coins: 240,
      reputation: 8,
      happiness: 6,
      welfare: 5,
      unlockCustomizationIds: ['bag-tas-perkakas'],
    },
  },
  {
    id: 's2-q-side-2',
    title: 'Sampingan: Standar Busana Kerja 3D',
    kind: 'side',
    order: 10,
    giverNpcId: 's2-npc-desainer',
    summary: 'Kunjungi Butik Seragam Kota Industri dan sesuaikan perlengkapan kerja karaktermu di Studio 3D.',
    steps: [
      {
        id: 's2-qs2-s1',
        description: 'Masuk ke Butik Seragam & Studio Busana 3D di selatan alun-alun',
        eventType: 'enter_interior',
        targetId: 's2-int-butik-industri',
        waypointX: 15.0,
        waypointZ: 15.0,
        waypointLabel: 'Butik Seragam 3D',
      },
      {
        id: 's2-qs2-s2',
        description: 'Ubah & simpan tampilan karaktermu di Studio Karakter [C]',
        eventType: 'customize_avatar',
        targetId: '*',
        waypointX: 16.2,
        waypointZ: 16.5,
        waypointLabel: 'Cermin Busana 3D',
      },
    ],
    rewards: {
      xp: 140,
      coins: 220,
      reputation: 8,
      happiness: 9,
      welfare: 5,
      unlockCustomizationIds: ['glasses-goggles-industri'],
    },
  },
  {
    id: 's2-q-side-3',
    title: 'Sampingan: Inspeksi Pembangkit & Sungai',
    kind: 'side',
    order: 11,
    giverNpcId: 's2-npc-kapten-ekspres',
    summary:
      'Tinjau Pembangkit Listrik Kota dan Sensor Kualitas Sungai di Kawasan Industri.',
    steps: [
      {
        id: 's2-qs3-s1',
        description: 'Inspeksi Pembangkit Listrik & Kumparan Kota di kawasan barat laut [E]',
        eventType: 'inspect_landmark',
        targetId: 'lm-s2-pembangkit',
        waypointX: -45.0,
        waypointZ: -56.0,
        waypointLabel: 'Pembangkit Listrik Kota',
      },
      {
        id: 's2-qs3-s2',
        description: 'Inspeksi Sensor Kualitas Air Sungai Industri [E]',
        eventType: 'inspect_landmark',
        targetId: 'lm-s2-sungai-sensor',
        waypointX: -54.0,
        waypointZ: 34.0,
        waypointLabel: 'Sensor Sungai Industri',
      },
    ],
    rewards: {
      xp: 170,
      coins: 260,
      reputation: 10,
      happiness: 8,
      welfare: 6,
    },
  },
];

export const STAGE2_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 's2-ach-explorer',
    title: 'Penjelajah Kota Industri',
    description: 'Temukan seluruh 6 kawasan utama di Kota Industri Stage 2.',
    badgeColor: '#0ea5e9',
    xpReward: 110,
    coinReward: 170,
  },
  {
    id: 's2-ach-producer',
    title: 'Penggerak Roda Pabrik',
    description: 'Selesaikan produksi pertama di Pabrik Tekstil atau Pabrik Pangan.',
    badgeColor: '#ea580c',
    xpReward: 120,
    coinReward: 190,
  },
  {
    id: 's2-ach-supply-chain',
    title: 'Pakar Rantai Pasok',
    description: 'Antar barang jadi ke Gudang Logistik dan jual ke Pasar Grosir.',
    badgeColor: '#f59e0b',
    xpReward: 140,
    coinReward: 230,
  },
  {
    id: 's2-ach-worker-ally',
    title: 'Sahabat Kesejahteraan Pekerja',
    description: 'Selesaikan Misi 4 Stage 2 dan jaga Kesejahteraan Pekerja >= 70%.',
    badgeColor: '#10b981',
    xpReward: 140,
    coinReward: 220,
  },
  {
    id: 's2-ach-eco-guardian',
    title: 'Penjaga Sungai Industri',
    description: 'Selesaikan Misi 6 Stage 2 & pulihkan Kualitas Lingkungan >= 65%.',
    badgeColor: '#22c55e',
    xpReward: 160,
    coinReward: 260,
  },
  {
    id: 's2-ach-fleet-driver',
    title: 'Pengemudi Armada Logistik',
    description: 'Kendarai truk pengiriman, bus pekerja, atau forklift di Stage 2.',
    badgeColor: '#38bdf8',
    xpReward: 100,
    coinReward: 150,
  },
  {
    id: 's2-ach-industrial-builder',
    title: 'Arsitek Ekspansi Industri',
    description: 'Bangun minimal 2 fasilitas Stage 2 dan tingkatkan 1 bangunan ke Level 2.',
    badgeColor: '#f97316',
    xpReward: 150,
    coinReward: 240,
  },
  {
    id: 's2-ach-hero',
    title: 'Pemimpin Kota Industri Sejati',
    description: 'Tuntaskan seluruh 8 Misi Utama Stage 2 dengan kota yang seimbang.',
    badgeColor: '#a855f7',
    xpReward: 320,
    coinReward: 500,
  },
];

export function findStage2DistrictAt(x: number, z: number): Stage2DistrictDef {
  for (const d of STAGE2_DISTRICTS) {
    if (x >= d.minX && x <= d.maxX && z >= d.minZ && z <= d.maxZ) {
      return d;
    }
  }
  return STAGE2_DISTRICTS[1];
}

export function getStage2DistrictIdAt(x: number, z: number): Stage2DistrictId {
  return findStage2DistrictAt(x, z).id;
}

export interface StageTransitionNpcDef {
  id: string;
  name: string;
  role: string;
  characterId?: CharacterId;
}
