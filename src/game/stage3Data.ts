import { Stage3ActivityKind } from './types';
import {
  AchievementDef,
  CollectionMilestoneDef,
  EnterableBuildingDef,
  QuestDef,
  RideableVehicleDef,
  Stage1ItemDef,
  WorldPickupDef,
} from './stage1Data';

export type Stage3DistrictId =
  | 's3-smart-center'
  | 's3-digital-business'
  | 's3-research'
  | 's3-residential'
  | 's3-entertainment'
  | 's3-green-tech'
  | 's3-transit-hub';

export interface Stage3DistrictDef {
  id: Stage3DistrictId;
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

export const STAGE3_DISTRICTS: Stage3DistrictDef[] = [
  {
    id: 's3-smart-center',
    name: 'Smart City Center',
    subtitle: 'Jantung Kota Digital & Menara Nusantara Masa Depan',
    description:
      'Kawasan pusat tata kelola cerdas dengan Menara Nusantara, Balai Layanan Digital, plaza air mancur, dan tampilan hologram publik.',
    colorHex: '#38bdf8',
    minX: -28,
    maxX: 28,
    minZ: -28,
    maxZ: 28,
    centerX: 0,
    centerZ: 0,
    discoveryXp: 50,
  },
  {
    id: 's3-digital-business',
    name: 'Digital Business District',
    subtitle: 'Gedung Korporasi, Bank Fintech & Mal E-Commerce',
    description:
      'Pusat bisnis masa depan dengan menara kaca tinggi, ruang kerja bersama, kafe digital, dan gerbang ekspor UMKM glokalisasi.',
    colorHex: '#fbbf24',
    minX: 28,
    maxX: 90,
    minZ: -68,
    maxZ: 14,
    centerX: 54,
    centerZ: -26,
    discoveryXp: 55,
  },
  {
    id: 's3-research',
    name: 'Research & Innovation District',
    subtitle: 'Lab Robotika, Riset AI, Universitas & Museum Sains',
    description:
      'Kawasan ilmu pengetahuan tempat peneliti mengembangkan robot asisten, AI beretika, dan komputasi kuantum Nusantara.',
    colorHex: '#a855f7',
    minX: -94,
    maxX: -28,
    minZ: -68,
    maxZ: 14,
    centerX: -54,
    centerZ: -28,
    discoveryXp: 55,
  },
  {
    id: 's3-residential',
    name: 'Futuristic Residential District',
    subtitle: 'Apartemen Eko Vertikal, Taman & Hub Komunitas',
    description:
      'Permukiman modern ramah pejalan kaki lengkap dengan apartemen hijau, kafe digital komunitas, toko cerdas, dan halte EV.',
    colorHex: '#34d399',
    minX: -94,
    maxX: -28,
    minZ: 14,
    maxZ: 92,
    centerX: -54,
    centerZ: 46,
    discoveryXp: 55,
  },
  {
    id: 's3-entertainment',
    name: 'Entertainment & Recreation District',
    subtitle: 'Mal Futuristik, Arkade Neon & Arena Konser',
    description:
      'Distrik rekreasi malam yang semarak dengan jalur neon, sinema 4D, restoran modern, dan alun-alun hiburan inklusif.',
    colorHex: '#f472b6',
    minX: 28,
    maxX: 90,
    minZ: 14,
    maxZ: 92,
    centerX: 54,
    centerZ: 48,
    discoveryXp: 55,
  },
  {
    id: 's3-green-tech',
    name: 'Green Technology District',
    subtitle: 'Menara Surya, Turbin Angin Laut & Eco Dome',
    description:
      'Zona teknologi hijau dengan kubah botani, taman vertikal bertingkat, fasilitas daur ulang canggih, dan pembangkit energi bersih pesisir.',
    colorHex: '#10b981',
    minX: -28,
    maxX: 28,
    minZ: 28,
    maxZ: 102,
    centerX: 4,
    centerZ: 58,
    discoveryXp: 60,
  },
  {
    id: 's3-transit-hub',
    name: 'Futuristic Transportation Hub',
    subtitle: 'Stasiun Kereta Cepat, Monorel & Plaza EV Otonom',
    description:
      'Simpul konektivitas antar-era yang menghubungkan Stage 2 via Kereta Cepat serta mengintegrasikan monorel dan kendaraan listrik otonom.',
    colorHex: '#22d3ee',
    minX: -94,
    maxX: 90,
    minZ: -116,
    maxZ: -68,
    centerX: 0,
    centerZ: -80,
    discoveryXp: 50,
  },
];

export function findStage3DistrictAt(x: number, z: number): Stage3DistrictDef {
  for (const d of STAGE3_DISTRICTS) {
    if (x >= d.minX && x <= d.maxX && z >= d.minZ && z <= d.maxZ) {
      return d;
    }
  }
  return STAGE3_DISTRICTS[0];
}

export const STAGE3_ITEMS: Stage1ItemDef[] = [
  {
    id: 's3-chip-kuantum',
    name: 'Mikroprosesor Kuantum',
    category: 'material',
    description: 'Chip berkecepatan ultra-tinggi untuk server AI dan pengendali jaringan Smart City.',
    effectLabel: 'Komponen Server · Nilai Jual Tinggi',
    iconKey: 'cpu',
  },
  {
    id: 's3-sel-surya',
    name: 'Modul Sel Surya Perovskit',
    category: 'material',
    description: 'Panel penangkap energi matahari efisiensi tinggi untuk menara hijau dan kendaraan listrik.',
    effectLabel: 'Komponen Energi Bersih',
    iconKey: 'zap',
  },
  {
    id: 's3-modul-robot',
    name: 'Modul Sensor Robot Asisten',
    category: 'material',
    description: 'Aktuator dan sensor LiDAR presisi untuk kalibrasi robot pekerja dan kurir otonom.',
    effectLabel: 'Komponen Robotika & AI',
    iconKey: 'cog',
  },
  {
    id: 's3-paket-umkm-digital',
    name: 'Paket Ekspor UMKM Digital',
    category: 'quest',
    description: 'Produk batik dan kriya Nusantara berlabel pintar siap dikirim melalui e-commerce global.',
    effectLabel: 'Paket Glokalisasi · Siap Ekspor',
    iconKey: 'package',
  },
  {
    id: 's3-data-warga',
    name: 'Kapsul Data Layanan Publik',
    category: 'quest',
    description: 'Laporan umpan balik warga dari seluruh distrik untuk evaluasi kota inklusif.',
    effectLabel: 'Data Evaluasi Smart City',
    iconKey: 'file',
  },
  {
    id: 's3-cetak-biru-rahasia',
    name: 'Cetak Biru Prototipe Rahasia',
    category: 'quest',
    description: 'Arsip inovasi tersembunyi di sayap kuantum untuk energi bersih generasi mendatang.',
    effectLabel: 'Item Misi 7: Inovasi Tersembunyi',
    iconKey: 'sparkles',
  },
  {
    id: 's3-kopi-siber',
    name: 'Kopi Siber Nusantara',
    category: 'consumable',
    description: 'Minuman seduh presisi kafe pintar (+40 XP & +5 Kebahagiaan Warga).',
    effectLabel: 'Gunakan: +40 XP & +5 Kebahagiaan',
    iconKey: 'coffee',
  },
  {
    id: 's3-drone-konstruksi',
    name: 'Drone Percepat Konstruksi',
    category: 'consumable',
    description: 'Armada drone otonom yang mempercepat kemajuan pembangunan konstruksi kota.',
    effectLabel: 'Gunakan: Percepat Konstruksi Aktif +60%',
    iconKey: 'hammer',
  },
];

export interface Stage3SupplyOffer {
  itemId: string;
  costCoins: number;
  label: string;
}

export const STAGE3_MARKET_SUPPLIES: Stage3SupplyOffer[] = [
  { itemId: 's3-chip-kuantum', costCoins: 55, label: 'Mikroprosesor Kuantum' },
  { itemId: 's3-sel-surya', costCoins: 50, label: 'Modul Sel Surya Perovskit' },
  { itemId: 's3-modul-robot', costCoins: 65, label: 'Modul Sensor Robot' },
  { itemId: 's3-paket-umkm-digital', costCoins: 70, label: 'Paket Ekspor UMKM Digital' },
  { itemId: 's3-kopi-siber', costCoins: 28, label: 'Kopi Siber Nusantara (+XP)' },
  { itemId: 's3-drone-konstruksi', costCoins: 95, label: 'Drone Percepat Konstruksi' },
];

export interface Stage3EnterableBuildingDef extends Omit<EnterableBuildingDef, 'districtId' | 'furnitureKind'> {
  districtId: Stage3DistrictId;
  furnitureKind: 'townhall' | 'market' | 'warehouse' | 'house' | 'workshop' | 'school' | 'boutique' | 'hotel' | 'cafe';
  floorTheme: 'smart_admin' | 'mall' | 'robotics' | 'museum' | 'cafe' | 'arcade' | 'ecodome' | 'station';
}

export const STAGE3_ENTERABLE_BUILDINGS: Stage3EnterableBuildingDef[] = [
  {
    id: 'eb-s3-admin',
    label: 'Balai Smart City & Pusat Layanan Publik',
    districtId: 's3-smart-center',
    x: -18,
    z: -16,
    halfW: 7.2,
    halfD: 6.0,
    wallHeight: 6.4,
    doorSide: 'south',
    doorHalfWidth: 1.9,
    roofColor: 0x0284c7,
    wallColor: 0xe2e8f0,
    furnitureKind: 'townhall',
    floorTheme: 'smart_admin',
  },
  {
    id: 'eb-s3-mall',
    label: 'Mal E-Commerce & Butik Busana 3D',
    districtId: 's3-digital-business',
    x: 52,
    z: -22,
    halfW: 8.2,
    halfD: 6.8,
    wallHeight: 6.6,
    doorSide: 'west',
    doorHalfWidth: 1.9,
    roofColor: 0xf59e0b,
    wallColor: 0x1e293b,
    furnitureKind: 'boutique',
    floorTheme: 'mall',
  },
  {
    id: 'eb-s3-robotics',
    label: 'Lab Robotika, AI & Inovasi Tersembunyi',
    districtId: 's3-research',
    x: -54,
    z: -24,
    halfW: 8.0,
    halfD: 6.6,
    wallHeight: 6.4,
    doorSide: 'east',
    doorHalfWidth: 1.9,
    roofColor: 0x7c3aed,
    wallColor: 0x0f172a,
    furnitureKind: 'workshop',
    floorTheme: 'robotics',
  },
  {
    id: 'eb-s3-museum',
    label: 'Museum Sains & Sejarah Teknologi Nusantara',
    districtId: 's3-research',
    x: -54,
    z: -48,
    halfW: 7.5,
    halfD: 6.2,
    wallHeight: 6.0,
    doorSide: 'east',
    doorHalfWidth: 1.9,
    roofColor: 0x0ea5e9,
    wallColor: 0xcbd5e1,
    furnitureKind: 'school',
    floorTheme: 'museum',
  },
  {
    id: 'eb-s3-cafe',
    label: 'Kafe Digital, Coworking & Hub Komunitas',
    districtId: 's3-residential',
    x: -52,
    z: 42,
    halfW: 7.0,
    halfD: 5.8,
    wallHeight: 5.4,
    doorSide: 'east',
    doorHalfWidth: 1.9,
    roofColor: 0x10b981,
    wallColor: 0xf8fafc,
    furnitureKind: 'cafe',
    floorTheme: 'cafe',
  },
  {
    id: 'eb-s3-arcade',
    label: 'Arena Arkade Neon, Sinema & Kuliner Masa Depan',
    districtId: 's3-entertainment',
    x: 54,
    z: 46,
    halfW: 8.2,
    halfD: 6.8,
    wallHeight: 6.4,
    doorSide: 'west',
    doorHalfWidth: 1.9,
    roofColor: 0xec4899,
    wallColor: 0x1e1b4b,
    furnitureKind: 'market',
    floorTheme: 'arcade',
  },
  {
    id: 'eb-s3-ecodome',
    label: 'Eco Dome Energi Terbarukan & Taman Vertikal',
    districtId: 's3-green-tech',
    x: 4,
    z: 58,
    halfW: 8.2,
    halfD: 7.2,
    wallHeight: 6.8,
    doorSide: 'north',
    doorHalfWidth: 1.9,
    roofColor: 0x059669,
    wallColor: 0xecfdf5,
    furnitureKind: 'hotel',
    floorTheme: 'ecodome',
  },
  {
    id: 'eb-s3-hst',
    label: 'Stasiun Kereta Cepat (Stage 2 <-> Stage 3)',
    districtId: 's3-transit-hub',
    x: 0,
    z: -86,
    halfW: 11.0,
    halfD: 6.8,
    wallHeight: 6.8,
    doorSide: 'south',
    doorHalfWidth: 2.2,
    roofColor: 0x06b6d4,
    wallColor: 0x0f172a,
    furnitureKind: 'warehouse',
    floorTheme: 'station',
  },
];

export interface Stage3ElevatorPadDef {
  id: string;
  label: string;
  x: number;
  z: number;
  fromY: number;
  toY: number;
  targetLabel: string;
  destX: number;
  destZ: number;
  accentHex: string;
}

export const STAGE3_ELEVATOR_PADS: Stage3ElevatorPadDef[] = [
  {
    id: 'elev-menara-up',
    label: 'Lift Dek Observasi Menara Nusantara',
    x: 10.5,
    z: -14,
    fromY: 0,
    toY: 14.2,
    targetLabel: 'Naik ke Dek Observasi Atap (14m)',
    destX: 0,
    destZ: -16,
    accentHex: '#38bdf8',
  },
  {
    id: 'elev-menara-down',
    label: 'Lift Turun Menara Nusantara',
    x: 8.0,
    z: -16,
    fromY: 14.2,
    toY: 0,
    targetLabel: 'Turun ke Plaza Smart City',
    destX: 12.5,
    destZ: -14,
    accentHex: '#38bdf8',
  },
  {
    id: 'elev-skywalk-east-up',
    label: 'Lift Skywalk Bisnis Digital',
    x: 34,
    z: -13,
    fromY: 0,
    toY: 6.5,
    targetLabel: 'Naik ke Skywalk Kaca (6.5m)',
    destX: 30,
    destZ: -13,
    accentHex: '#fbbf24',
  },
  {
    id: 'elev-skywalk-east-down',
    label: 'Lift Turun Skywalk Timur',
    x: 34,
    z: -13,
    fromY: 6.5,
    toY: 0,
    targetLabel: 'Turun ke Jalan Bisnis Digital',
    destX: 36,
    destZ: -10,
    accentHex: '#fbbf24',
  },
  {
    id: 'elev-skywalk-west-up',
    label: 'Lift Skywalk Distrik Riset',
    x: -34,
    z: -13,
    fromY: 0,
    toY: 6.5,
    targetLabel: 'Naik ke Skywalk Kaca (6.5m)',
    destX: -30,
    destZ: -13,
    accentHex: '#a855f7',
  },
  {
    id: 'elev-skywalk-west-down',
    label: 'Lift Turun Skywalk Barat',
    x: -34,
    z: -13,
    fromY: 6.5,
    toY: 0,
    targetLabel: 'Turun ke Jalan Riset & Inovasi',
    destX: -36,
    destZ: -10,
    accentHex: '#a855f7',
  },
  {
    id: 'elev-ecodome-up',
    label: 'Lift Kanopi Taman Vertikal',
    x: 15.5,
    z: 58,
    fromY: 0,
    toY: 10.5,
    targetLabel: 'Naik ke Taman Atap Eco Dome (10.5m)',
    destX: 4,
    destZ: 58,
    accentHex: '#10b981',
  },
  {
    id: 'elev-ecodome-down',
    label: 'Lift Turun Taman Vertikal',
    x: 11.0,
    z: 58,
    fromY: 10.5,
    toY: 0,
    targetLabel: 'Turun ke Zona Teknologi Hijau',
    destX: 18,
    destZ: 58,
    accentHex: '#10b981',
  },
];

export interface Stage3ActivityStationDef {
  id: string;
  kind: Stage3ActivityKind;
  name: string;
  label: string;
  description: string;
  x: number;
  y: number;
  z: number;
  districtId: Stage3DistrictId;
  rewardCoins: number;
  rewardXp: number;
  actionLabel: string;
  requiredItemId?: string;
  outputItemId?: string;
  metricEffects: {
    economicGrowth?: number;
    digitalDevelopment?: number;
    employment?: number;
    publicSatisfaction?: number;
    environmentalQuality?: number;
    renewableEnergy?: number;
    transportationEfficiency?: number;
    researchDevelopment?: number;
    infrastructureQuality?: number;
  };
}

export const STAGE3_ACTIVITY_STATIONS: Stage3ActivityStationDef[] = [
  {
    id: 'act-s3-smart-grid',
    kind: 'smart_grid',
    name: 'Konsol Jaringan Energi Cerdas',
    label: 'Kalibrasi Panel Surya & Turbin Angin',
    description:
      'Menyeimbangkan pasokan energi terbarukan di Eco Dome & pembangkit lepas pantai agar kota beroperasi tanpa emisi.',
    x: 16,
    y: 0,
    z: 48,
    districtId: 's3-green-tech',
    rewardCoins: 110,
    rewardXp: 70,
    actionLabel: 'Seimbangkan Jaringan Energi Bersih',
    outputItemId: 's3-sel-surya',
    metricEffects: {
      renewableEnergy: 10,
      environmentalQuality: 8,
      infrastructureQuality: 5,
      digitalDevelopment: 4,
    },
  },
  {
    id: 'act-s3-robotics-cal',
    kind: 'robotics_lab',
    name: 'Meja Kalibrasi Robot & AI',
    label: 'Program & Kalibrasi Robot Asisten',
    description:
      'Melatih sistem visi dan sensor LiDAR robot layanan publik serta otomasi laboratorium di Distrik Riset.',
    x: -54,
    y: 0,
    z: -24,
    districtId: 's3-research',
    rewardCoins: 125,
    rewardXp: 85,
    actionLabel: 'Kalibrasi & Uji Robot Asisten',
    outputItemId: 's3-modul-robot',
    metricEffects: {
      researchDevelopment: 10,
      digitalDevelopment: 7,
      employment: 5,
      infrastructureQuality: 4,
    },
  },
  {
    id: 'act-s3-ecommerce',
    kind: 'ecommerce_dispatch',
    name: 'Terminal E-Commerce & Kurir Drone',
    label: 'Kirim Paket Ekspor UMKM Digital',
    description:
      'Mengelola pesanan niaga elektronik dan memberangkatkan drone pengantar produk lokal Nusantara berdaya saing global.',
    x: 52,
    y: 0,
    z: -22,
    districtId: 's3-digital-business',
    rewardCoins: 140,
    rewardXp: 80,
    actionLabel: 'Kirim Pesanan E-Commerce Global',
    outputItemId: 's3-paket-umkm-digital',
    metricEffects: {
      economicGrowth: 9,
      digitalDevelopment: 8,
      employment: 6,
      publicSatisfaction: 4,
    },
  },
  {
    id: 'act-s3-ev-circuit',
    kind: 'ev_circuit',
    name: 'Stasiun Uji Transit & Sirkuit EV',
    label: 'Optimasi Jalur EV & Monorel Cerdas',
    description:
      'Menguji efisiensi baterai kendaraan listrik otonom dan sinkronisasi sinyal monorel di Transportation Hub.',
    x: 34,
    y: 0,
    z: -76,
    districtId: 's3-transit-hub',
    rewardCoins: 120,
    rewardXp: 75,
    actionLabel: 'Jalankan Uji Efisiensi EV & Transit',
    metricEffects: {
      transportationEfficiency: 11,
      infrastructureQuality: 7,
      environmentalQuality: 5,
      publicSatisfaction: 5,
    },
  },
  {
    id: 'act-s3-sky-scan',
    kind: 'observation_scan',
    name: 'Pemindai Panorama Dek Observasi',
    label: 'Pindai Kota & Kumpulkan Data Smart City',
    description:
      'Dari puncak Menara Nusantara (ketinggian 14m), pindai kepadatan kota, kualitas udara, dan arus lalu lintas real-time.',
    x: 0,
    y: 14.2,
    z: -16,
    districtId: 's3-smart-center',
    rewardCoins: 150,
    rewardXp: 95,
    actionLabel: 'Pindai Panorama Kota 360°',
    metricEffects: {
      publicSatisfaction: 8,
      digitalDevelopment: 7,
      infrastructureQuality: 6,
      environmentalQuality: 4,
    },
  },
];

export const STAGE3_VEHICLES: RideableVehicleDef[] = [
  {
    id: 'veh-s3-evcar',
    kind: 'ev_car',
    name: 'Nusantara EV Sport',
    spawnX: -12,
    spawnZ: 10,
    spawnYaw: Math.PI / 2,
    maxSpeed: 19.5,
    description: 'Sedan sport listrik futuristik tanpa emisi dengan akselerasi halus.',
  },
  {
    id: 'veh-s3-taxi',
    kind: 'autonomous_taxi',
    name: 'Pod Taksi Otonom',
    spawnX: -14,
    spawnZ: -74,
    spawnYaw: Math.PI / 2,
    maxSpeed: 17.5,
    description: 'Kapsul taksi cerdas otomatis penghubung Stasiun Kereta Cepat dan distrik bisnis.',
  },
  {
    id: 'veh-s3-evmoto',
    kind: 'ev_moto',
    name: 'Motor Listrik Neon',
    spawnX: 38,
    spawnZ: 22,
    spawnYaw: 0,
    maxSpeed: 21.0,
    description: 'Kendaraan roda dua bertenaga baterai cepat beraksen lampu neon.',
  },
  {
    id: 'veh-s3-bus',
    kind: 'future_bus',
    name: 'Bus Transit Masa Depan',
    spawnX: 34,
    spawnZ: -8,
    spawnYaw: 0,
    maxSpeed: 16.0,
    description: 'Armada angkutan massal listrik ramah warga berkapasitas besar.',
  },
  {
    id: 'veh-s3-courier',
    kind: 'courier_pod',
    name: 'Pod Kurir Otonom',
    spawnX: -34,
    spawnZ: 18,
    spawnYaw: -Math.PI / 2,
    maxSpeed: 17.0,
    description: 'Unit logistik ringkas pengirim paket e-commerce dan modul riset antardistrik.',
  },
];

export interface Stage3CollectibleDef {
  id: string;
  name: string;
  category: 'Teknologi' | 'Energi' | 'Kota' | 'Budaya';
  rarity: 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  districtId: Stage3DistrictId;
  description: string;
  x: number;
  yOffset?: number;
  z: number;
  hint: string;
  xpReward: number;
  coinReward: number;
}

export const STAGE3_COLLECTIBLES: Stage3CollectibleDef[] = [
  {
    id: 'col-s3-1',
    name: 'Inti Hologram Menara Nusantara',
    category: 'Kota',
    rarity: 'Epic',
    districtId: 's3-smart-center',
    description: 'Kristal proyektor yang merekam peta tiga dimensi seluruh distrik Kota Digital.',
    x: 0,
    yOffset: 14.2,
    z: -12,
    hint: 'Naik lift Menara Nusantara ke Dek Observasi Atap (14m).',
    xpReward: 110,
    coinReward: 180,
  },
  {
    id: 'col-s3-2',
    name: 'Kartu Akses Balai Smart City',
    category: 'Kota',
    rarity: 'Uncommon',
    districtId: 's3-smart-center',
    description: 'Kunci digital enkripsi tinggi untuk sistem layanan publik warga.',
    x: -18,
    yOffset: 0.22,
    z: -16,
    hint: 'Di dalam Balai Smart City & Layanan Digital.',
    xpReward: 70,
    coinReward: 110,
  },
  {
    id: 'col-s3-3',
    name: 'Drone Mikro Kurir Angkasa',
    category: 'Teknologi',
    rarity: 'Rare',
    districtId: 's3-digital-business',
    description: 'Prototipe drone pengiriman cepat bertenaga baterai solid-state.',
    x: 42,
    z: -34,
    hint: 'Di plaza menara bisnis timur dekat Fintech HQ.',
    xpReward: 90,
    coinReward: 140,
  },
  {
    id: 'col-s3-4',
    name: 'Katalog Batik Digital 3D',
    category: 'Budaya',
    rarity: 'Rare',
    districtId: 's3-digital-business',
    description: 'Arsip digital ratusan motif batik Nusantara yang dijual ke pasar global.',
    x: 52,
    yOffset: 0.22,
    z: -22,
    hint: 'Di dalam Mal E-Commerce & Butik Futuristik.',
    xpReward: 90,
    coinReward: 145,
  },
  {
    id: 'col-s3-5',
    name: 'Jaringan Saraf AI Pemandu',
    category: 'Teknologi',
    rarity: 'Epic',
    districtId: 's3-research',
    description: 'Modul komputasi etika AI karya peneliti muda Nusantara.',
    x: -54,
    yOffset: 0.22,
    z: -24,
    hint: 'Di dalam Lab Robotika & Riset AI.',
    xpReward: 110,
    coinReward: 175,
  },
  {
    id: 'col-s3-6',
    name: 'Fosil Disket Era Perintis',
    category: 'Budaya',
    rarity: 'Uncommon',
    districtId: 's3-research',
    description: 'Artefak sejarah komputasi awal yang dipajang sebagai pengingat evolusi teknologi.',
    x: -54,
    yOffset: 0.22,
    z: -48,
    hint: 'Di dalam Museum Sains & Inovasi Nusantara.',
    xpReward: 75,
    coinReward: 120,
  },
  {
    id: 'col-s3-7',
    name: 'Cincin Skywalk Kaca',
    category: 'Kota',
    rarity: 'Rare',
    districtId: 's3-smart-center',
    description: 'Suvenir arsitektur jembatan penyeberangan tinggi antardistrik.',
    x: 0,
    yOffset: 6.5,
    z: -13,
    hint: 'Di tengah Skywalk Kaca Timur-Barat pada ketinggian 6.5m.',
    xpReward: 95,
    coinReward: 150,
  },
  {
    id: 'col-s3-8',
    name: 'Biji Tanaman Vertikal Abadi',
    category: 'Energi',
    rarity: 'Uncommon',
    districtId: 's3-residential',
    description: 'Bibit pohon penyerap karbon ultra-cepat untuk taman apartemen.',
    x: -52,
    yOffset: 0.22,
    z: 42,
    hint: 'Di dalam Kafe Digital & Hub Komunitas Permukiman.',
    xpReward: 75,
    coinReward: 120,
  },
  {
    id: 'col-s3-9',
    name: 'Token Konser Hologram',
    category: 'Budaya',
    rarity: 'Rare',
    districtId: 's3-entertainment',
    description: 'Tiket edisi kolektor pertunjukan wayang dan musik elektronik Nusantara.',
    x: 54,
    yOffset: 0.22,
    z: 46,
    hint: 'Di dalam Arena Arkade Neon & Sinema 4D.',
    xpReward: 90,
    coinReward: 145,
  },
  {
    id: 'col-s3-10',
    name: 'Kunci Neon Jalan Hiburan',
    category: 'Kota',
    rarity: 'Uncommon',
    districtId: 's3-entertainment',
    description: 'Lencana lampu neon berpola ukiran tradisional distrik rekreasi.',
    x: 68,
    z: 24,
    hint: 'Di jalur pejalan kaki neon sebelah timur Distrik Hiburan.',
    xpReward: 75,
    coinReward: 120,
  },
  {
    id: 'col-s3-11',
    name: 'Miniatur Turbin Angin Laut',
    category: 'Energi',
    rarity: 'Rare',
    districtId: 's3-green-tech',
    description: 'Replika generator turbin angin lepas pantai pesisir timur Nusantara.',
    x: 92,
    yOffset: 0.4,
    z: 56,
    hint: 'Di Dermaga Energi Bersih pesisir timur Distrik Teknologi Hijau.',
    xpReward: 95,
    coinReward: 155,
  },
  {
    id: 'col-s3-12',
    name: 'Kristal Kubah Ekosistem',
    category: 'Energi',
    rarity: 'Epic',
    districtId: 's3-green-tech',
    description: 'Sensor kelembapan otomatis dari taman atap Eco Dome.',
    x: 4,
    yOffset: 10.5,
    z: 58,
    hint: 'Naik lift Eco Dome ke Taman Vertikal Atap (10.5m).',
    xpReward: 115,
    coinReward: 185,
  },
  {
    id: 'col-s3-13',
    name: 'Tiket Emas Kereta Cepat',
    category: 'Kota',
    rarity: 'Rare',
    districtId: 's3-transit-hub',
    description: 'Kenang-kenangan perjalanan perdana Kereta Cepat dari Kota Industri ke Masa Depan.',
    x: 0,
    yOffset: 0.22,
    z: -86,
    hint: 'Di dalam Stasiun Kereta Cepat Nusantara utara.',
    xpReward: 90,
    coinReward: 145,
  },
  {
    id: 'col-s3-14',
    name: 'Lencana Superkonduktor Monorel',
    category: 'Teknologi',
    rarity: 'Epic',
    districtId: 's3-transit-hub',
    description: 'Komponen magnet levitasi tanpa gesekan jalur monorel kota.',
    x: -18,
    z: -74,
    hint: 'Di plaza parkir Pod Taksi Otonom Transportation Hub.',
    xpReward: 110,
    coinReward: 180,
  },
  {
    id: 'col-s3-15',
    name: 'Kapsul Waktu Glokalisasi 2045',
    category: 'Budaya',
    rarity: 'Legendary',
    districtId: 's3-research',
    description: 'Pesan generasi muda Nusantara tentang keseimbangan teknologi dan kearifan lokal.',
    x: -74,
    z: -42,
    hint: 'Tersembunyi di sayap barat tersembunyi di belakang Lab & Museum Riset.',
    xpReward: 160,
    coinReward: 260,
  },
  {
    id: 'col-s3-16',
    name: 'Reaktor Kuantum Mini',
    category: 'Teknologi',
    rarity: 'Legendary',
    districtId: 's3-research',
    description: 'Prototipe sumber energi kuantum rahasia berdaya bersih tanpa batas.',
    x: -76,
    z: -16,
    hint: 'Di Laboratorium Inovasi Tersembunyi sudut barat Distrik Riset.',
    xpReward: 170,
    coinReward: 280,
  },
];

export const STAGE3_COLLECTION_MILESTONES: CollectionMilestoneDef[] = [
  {
    id: 'mile-s3-4',
    requiredCount: 4,
    title: 'Kolektor Siber Pemula (4/15)',
    description: 'Berhasil mengumpulkan 4 artefak & komponen Kota Digital Masa Depan.',
    xpReward: 120,
    coinReward: 200,
    unlockCustomizationIds: ['jacket-cyber-explorer', 'glasses-holo-visor'],
  },
  {
    id: 'mile-s3-8',
    requiredCount: 8,
    title: 'Penjaga Infrastruktur Digital (8/15)',
    description: 'Separuh khazanah inovasi Stage 3 berhasil diarsipkan untuk kota.',
    xpReward: 200,
    coinReward: 360,
    unlockBlueprintId: 'taman-vertikal-cerdas',
    unlockCustomizationIds: ['jacket-futuristic-security'],
  },
  {
    id: 'mile-s3-12',
    requiredCount: 12,
    title: 'Master Inovasi Kuantum (12/15)',
    description: 'Mengumpulkan teknologi kunci dari Eco Dome, Skywalk, dan sayap riset.',
    xpReward: 320,
    coinReward: 550,
    unlockCustomizationIds: ['jacket-quantum-scientist', 'bag-jetpack-drone'],
  },
  {
    id: 'mile-s3-15',
    requiredCount: 15,
    title: 'Kurator Agung Kota Masa Depan (15/15)',
    description: 'Hampir seluruh koleksi tersembunyi Kota Digital Masa Depan lengkap!',
    xpReward: 500,
    coinReward: 900,
    unlockTitleId: 'title-kurator-masa-depan',
    unlockCustomizationIds: ['jacket-future-guardian'],
  },
];

export const STAGE3_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'ach-s3-arrive',
    title: 'Penjelajah Era Digital',
    description: 'Tiba di Kota Digital Masa Depan (Stage 3) menggunakan Kereta Cepat Nusantara.',
    badgeColor: '#38bdf8',
    xpReward: 70,
    coinReward: 120,
  },
  {
    id: 'ach-s3-districts',
    title: 'Peta Metropolis Lengkap',
    description: 'Menjelajahi seluruh 7 distrik futuristik Stage 3.',
    badgeColor: '#22d3ee',
    xpReward: 220,
    coinReward: 380,
  },
  {
    id: 'ach-s3-skyhigh',
    title: 'Penakluk Skywalk & Dek Observasi',
    description: 'Menggunakan lift kota untuk mencapai Skywalk atau Dek Observasi 14 meter.',
    badgeColor: '#fbbf24',
    xpReward: 110,
    coinReward: 180,
  },
  {
    id: 'ach-s3-activities',
    title: 'Operator Smart City Andal',
    description: 'Menyelesaikan minimal 3 aktivitas interaktif masa depan (Energi, Robotika, E-Commerce, EV, atau Pindai).',
    badgeColor: '#10b981',
    xpReward: 180,
    coinReward: 300,
  },
  {
    id: 'ach-s3-ev-driver',
    title: 'Pengemudi Masa Depan Nihil Emisi',
    description: 'Mengendarai kendaraan listrik atau otonom di Kota Digital Masa Depan.',
    badgeColor: '#ec4899',
    xpReward: 95,
    coinReward: 160,
  },
  {
    id: 'ach-s3-builder',
    title: 'Arsitek Metropolis Cerdas',
    description: 'Mendirikan minimal 3 bangunan Smart City atau Teknologi Hijau baru di Stage 3.',
    badgeColor: '#f59e0b',
    xpReward: 240,
    coinReward: 420,
  },
  {
    id: 'ach-s3-costume-fan',
    title: 'Kolektor Busana Futuristik',
    description: 'Membuka minimal 5 kostum eksklusif Kota Digital Masa Depan.',
    badgeColor: '#a855f7',
    xpReward: 200,
    coinReward: 350,
  },
  {
    id: 'ach-s3-all-missions',
    title: 'Penjaga Masa Depan Nusantara',
    description: 'Menuntaskan seluruh 9 Misi Utama Stage 3: Kota Digital Masa Depan.',
    badgeColor: '#fde047',
    xpReward: 550,
    coinReward: 1000,
  },
];

export const STAGE3_WORLD_PICKUPS: WorldPickupDef[] = [
  { id: 'pk-s3-chip', itemId: 's3-chip-kuantum', label: 'Mikroprosesor Kuantum', x: -40, z: -20 },
  { id: 'pk-s3-solar', itemId: 's3-sel-surya', label: 'Modul Sel Surya', x: 18, z: 62 },
  { id: 'pk-s3-robot', itemId: 's3-modul-robot', label: 'Modul Sensor Robot', x: -64, z: -32 },
  { id: 'pk-s3-umkm', itemId: 's3-paket-umkm-digital', label: 'Paket Ekspor UMKM', x: 42, z: -14 },
  { id: 'pk-s3-secret', itemId: 's3-cetak-biru-rahasia', label: 'Cetak Biru Prototipe Rahasia', x: -76, z: -16 },
  { id: 'pk-s3-data', itemId: 's3-data-warga', label: 'Kapsul Data Layanan Publik', x: -36, z: 36 },
];

export interface Stage3DeliverySpotDef {
  id: string;
  label: string;
  x: number;
  z: number;
  yOffset?: number;
  description: string;
  acceptedItems: { itemId: string; payoutCoins: number; xpReward: number }[];
}

export const STAGE3_DELIVERY_SPOTS: Stage3DeliverySpotDef[] = [
  {
    id: 'deliv-s3-server',
    label: 'Node Server Balai Smart City',
    x: -18,
    z: -9,
    description: 'Serahkan Mikroprosesor Kuantum atau Data Layanan Publik untuk memperkuat server kota.',
    acceptedItems: [
      { itemId: 's3-chip-kuantum', payoutCoins: 145, xpReward: 55 },
      { itemId: 's3-data-warga', payoutCoins: 110, xpReward: 50 },
    ],
  },
  {
    id: 'deliv-s3-ecommerce',
    label: 'Gerai Ekspor Mal E-Commerce',
    x: 43,
    z: -22,
    description: 'Kirim Paket Ekspor UMKM Digital atau Modul Sensor Robot ke jaringan logistik global.',
    acceptedItems: [
      { itemId: 's3-paket-umkm-digital', payoutCoins: 165, xpReward: 60 },
      { itemId: 's3-modul-robot', payoutCoins: 150, xpReward: 55 },
    ],
  },
  {
    id: 'deliv-s3-ecodome',
    label: 'Pos Energi Eco Dome',
    x: 4,
    z: 49,
    description: 'Pasang Modul Sel Surya atau serahkan Cetak Biru Rahasia di pusat energi bersih.',
    acceptedItems: [
      { itemId: 's3-sel-surya', payoutCoins: 135, xpReward: 50 },
      { itemId: 's3-cetak-biru-rahasia', payoutCoins: 240, xpReward: 95 },
    ],
  },
];

export const STAGE3_WARDROBE_MIRROR_SPOT = {
  id: 'mirror-s3-mall',
  label: 'Butik Busana Futuristik 3D',
  x: 52,
  z: -25,
  yOffset: 0.22,
};

export const STAGE3_QUESTS: QuestDef[] = [
  // MAIN MISSION 1: Welcome to the Future
  {
    id: 'q-s3-1',
    title: 'Misi 1: Welcome to the Future',
    kind: 'main',
    order: 1,
    giverNpcId: 'npc-s3-aditya',
    summary:
      'Kamu baru tiba dengan Kereta Cepat Nusantara. Kenali Smart City Center, temui Aditya, dan masuk ke Balai Layanan Digital.',
    steps: [
      {
        id: 'qs3-1-1',
        description: 'Jelajahi Smart City Center di pusat kota digital',
        eventType: 'visit_district',
        targetId: 's3-smart-center',
        waypointX: 0,
        waypointZ: 0,
        waypointLabel: 'Smart City Center',
      },
      {
        id: 'qs3-1-2',
        description: 'Temui Aditya di Plaza Menara Nusantara untuk pengarahan awal',
        eventType: 'talk_npc',
        targetId: 'npc-s3-aditya',
        waypointX: 5.5,
        waypointZ: -6.5,
        waypointLabel: 'Aditya (Plaza Menara)',
      },
      {
        id: 'qs3-1-3',
        description: 'Masuk ke dalam Balai Smart City & Layanan Digital',
        eventType: 'enter_interior',
        targetId: 'eb-s3-admin',
        waypointX: -18,
        waypointZ: -16,
        waypointLabel: 'Balai Smart City',
      },
    ],
    rewards: {
      xp: 120,
      coins: 220,
      reputation: 6,
      happiness: 5,
      welfare: 4,
      unlockCustomizationIds: ['jacket-smart-city-officer'],
    },
  },
  // MAIN MISSION 2: A Smarter City
  {
    id: 'q-s3-2',
    title: 'Misi 2: A Smarter City',
    kind: 'main',
    order: 2,
    giverNpcId: 'npc-s3-coordinator',
    summary:
      'Optimalkan tata kelola kota cerdas dengan naik ke Dek Observasi Menara Nusantara via lift [E] dan memindai kondisi kota.',
    steps: [
      {
        id: 'qs3-2-1',
        description: 'Bicara dengan Koordinator Smart City di depan Balai Layanan',
        eventType: 'talk_npc',
        targetId: 'npc-s3-coordinator',
        waypointX: -14,
        waypointZ: -9,
        waypointLabel: 'Koordinator Smart City',
      },
      {
        id: 'qs3-2-2',
        description: 'Gunakan Lift Menara Nusantara [E] untuk naik ke Dek Observasi',
        eventType: 'use_elevator',
        targetId: '*',
        waypointX: 10.5,
        waypointZ: -14,
        waypointLabel: 'Lift Menara Nusantara',
      },
      {
        id: 'qs3-2-3',
        description: 'Pindai panorama metropolis di Pemindai Dek Observasi (Lantai Atap)',
        eventType: 'complete_activity',
        targetId: 'observation_scan',
        waypointX: 0,
        waypointZ: -16,
        waypointLabel: 'Pemindai Dek Observasi (14m)',
      },
    ],
    rewards: {
      xp: 160,
      coins: 280,
      reputation: 8,
      happiness: 6,
      welfare: 5,
      unlockCustomizationIds: ['jacket-cyber-explorer', 'hat-cyber-visor-helm'],
    },
  },
  // MAIN MISSION 3: The Digital Economy
  {
    id: 'q-s3-3',
    title: 'Misi 3: The Digital Economy',
    kind: 'main',
    order: 3,
    giverNpcId: 'npc-s3-naya',
    summary:
      'Naya mengajakmu menggerakkan ekonomi digital UMKM Nusantara. Kunjungi Distrik Bisnis Digital, masuk ke Mal E-Commerce, dan kirim pesanan ekspor.',
    steps: [
      {
        id: 'qs3-3-1',
        description: 'Temui Naya di gerbang Digital Business District',
        eventType: 'talk_npc',
        targetId: 'npc-s3-naya',
        waypointX: 34,
        waypointZ: -6,
        waypointLabel: 'Naya (Bisnis Digital)',
      },
      {
        id: 'qs3-3-2',
        description: 'Masuk ke Mal E-Commerce & Butik Busana Futuristik',
        eventType: 'enter_interior',
        targetId: 'eb-s3-mall',
        waypointX: 52,
        waypointZ: -22,
        waypointLabel: 'Mal E-Commerce',
      },
      {
        id: 'qs3-3-3',
        description: 'Kirim paket ekspor melalui Terminal E-Commerce & Kurir Drone',
        eventType: 'complete_activity',
        targetId: 'ecommerce_dispatch',
        waypointX: 52,
        waypointZ: -22,
        waypointLabel: 'Terminal E-Commerce',
      },
    ],
    rewards: {
      xp: 185,
      coins: 340,
      reputation: 9,
      happiness: 5,
      welfare: 6,
      itemId: 's3-paket-umkm-digital',
      itemQty: 1,
      unlockCustomizationIds: ['jacket-digital-entrepreneur'],
      unlockTitleId: 'title-inovator-digital',
    },
  },
  // MAIN MISSION 4: Robotics in Action
  {
    id: 'q-s3-4',
    title: 'Misi 4: Robotics in Action',
    kind: 'main',
    order: 4,
    giverNpcId: 'npc-s3-scientist',
    summary:
      'Robot asisten membutuhkan kalibrasi ulang agar aman berinteraksi dengan warga. Kunjungi Research & Innovation District dan operasikan Meja Kalibrasi Robot.',
    steps: [
      {
        id: 'qs3-4-1',
        description: 'Jelajahi Research & Innovation District di sisi barat kota',
        eventType: 'visit_district',
        targetId: 's3-research',
        waypointX: -46,
        waypointZ: -16,
        waypointLabel: 'Distrik Riset & Inovasi',
      },
      {
        id: 'qs3-4-2',
        description: 'Masuk ke Lab Robotika & Riset AI Nusantara',
        eventType: 'enter_interior',
        targetId: 'eb-s3-robotics',
        waypointX: -54,
        waypointZ: -24,
        waypointLabel: 'Lab Robotika & AI',
      },
      {
        id: 'qs3-4-3',
        description: 'Kalibrasi & uji robot asisten di Meja Kalibrasi Robot',
        eventType: 'complete_activity',
        targetId: 'robotics_lab',
        waypointX: -54,
        waypointZ: -24,
        waypointLabel: 'Meja Kalibrasi Robot',
      },
    ],
    rewards: {
      xp: 200,
      coins: 360,
      reputation: 8,
      happiness: 5,
      welfare: 6,
      itemId: 's3-modul-robot',
      itemQty: 1,
      unlockCustomizationIds: ['jacket-robotics-engineer'],
    },
  },
  // MAIN MISSION 5: The Future of Transportation
  {
    id: 'q-s3-5',
    title: 'Misi 5: The Future of Transportation',
    kind: 'main',
    order: 5,
    giverNpcId: 'npc-s3-transit',
    summary:
      'Uji kelancaran mobilitas nihil emisi di Futuristic Transportation Hub dengan mengendarai kendaraan listrik dan mengoptimalkan sirkuit EV.',
    steps: [
      {
        id: 'qs3-5-1',
        description: 'Bicara dengan Kapten Transit Masa Depan di Transportation Hub utara',
        eventType: 'talk_npc',
        targetId: 'npc-s3-transit',
        waypointX: -6,
        waypointZ: -74,
        waypointLabel: 'Kapten Transit (Hub Utara)',
      },
      {
        id: 'qs3-5-2',
        description: 'Kendarai kendaraan listrik atau pod otonom [F] mengelilingi kota',
        eventType: 'drive_vehicle',
        targetId: '*',
        waypointX: -14,
        waypointZ: -74,
        waypointLabel: 'Kendaraan Listrik [F]',
      },
      {
        id: 'qs3-5-3',
        description: 'Jalankan uji efisiensi di Stasiun Uji Transit & Sirkuit EV',
        eventType: 'complete_activity',
        targetId: 'ev_circuit',
        waypointX: 34,
        waypointZ: -76,
        waypointLabel: 'Sirkuit Uji EV',
      },
    ],
    rewards: {
      xp: 220,
      coins: 400,
      reputation: 9,
      happiness: 7,
      welfare: 5,
      unlockCustomizationIds: ['jacket-advanced-pilot', 'hat-pilot-helm'],
    },
  },
  // MAIN MISSION 6: Green Technology
  {
    id: 'q-s3-6',
    title: 'Misi 6: Green Technology',
    kind: 'main',
    order: 6,
    giverNpcId: 'npc-s3-laras',
    summary:
      'Laras menekankan pentingnya keadilan ekologis di era digital. Kunjungi Eco Dome, operasikan Konsol Energi Cerdas, dan dirikan Menara Energi Surya/Taman.',
    steps: [
      {
        id: 'qs3-6-1',
        description: 'Temui Laras di Distrik Teknologi Hijau sebelah selatan',
        eventType: 'talk_npc',
        targetId: 'npc-s3-laras',
        waypointX: -6,
        waypointZ: 40,
        waypointLabel: 'Laras (Teknologi Hijau)',
      },
      {
        id: 'qs3-6-2',
        description: 'Seimbangkan pasokan daya di Konsol Jaringan Energi Cerdas',
        eventType: 'complete_activity',
        targetId: 'smart_grid',
        waypointX: 16,
        waypointZ: 48,
        waypointLabel: 'Konsol Energi Cerdas',
      },
      {
        id: 'qs3-6-3',
        description: 'Bangun minimal 1 bangunan Smart City / Energi Hijau [B]',
        eventType: 'build_facility',
        targetId: '*',
        waypointX: 20,
        waypointZ: 34,
        waypointLabel: 'Bangun Fasilitas Hijau [B]',
      },
    ],
    rewards: {
      xp: 250,
      coins: 450,
      reputation: 11,
      happiness: 9,
      welfare: 9,
      unlockBlueprintId: 'taman-vertikal-cerdas',
      unlockCustomizationIds: ['bag-jetpack-drone', 'acc-holo-armband'],
      unlockTitleId: 'title-pelopor-energi-hijau',
    },
  },
  // MAIN MISSION 7: The Hidden Innovation
  {
    id: 'q-s3-7',
    title: 'Misi 7: The Hidden Innovation',
    kind: 'main',
    order: 7,
    giverNpcId: 'npc-s3-quantum',
    summary:
      'Rumor beredar tentang sayap komputasi kuantum rahasia di barat Distrik Riset. Selidiki Museum Sains dan temukan Cetak Biru Prototipe Rahasia.',
    steps: [
      {
        id: 'qs3-7-1',
        description: 'Masuk ke Museum Sains & Inovasi Nusantara untuk mencari petunjuk arsip',
        eventType: 'enter_interior',
        targetId: 'eb-s3-museum',
        waypointX: -54,
        waypointZ: -48,
        waypointLabel: 'Museum Sains',
      },
      {
        id: 'qs3-7-2',
        description: 'Ambil Cetak Biru Prototipe Rahasia di sayap barat Distrik Riset',
        eventType: 'collect_item',
        targetId: 's3-cetak-biru-rahasia',
        waypointX: -76,
        waypointZ: -16,
        waypointLabel: 'Sayap Inovasi Tersembunyi',
      },
      {
        id: 'qs3-7-3',
        description: 'Serahkan cetak biru rahasia kepada Prof. Kirana di Distrik Riset',
        eventType: 'talk_npc',
        targetId: 'npc-s3-quantum',
        waypointX: -66,
        waypointZ: -18,
        waypointLabel: 'Prof. Kirana (Kuantum)',
      },
    ],
    rewards: {
      xp: 270,
      coins: 500,
      reputation: 11,
      happiness: 7,
      welfare: 7,
      unlockCustomizationIds: ['jacket-ai-researcher', 'glasses-holo-visor'],
    },
  },
  // MAIN MISSION 8: A City for Everyone
  {
    id: 'q-s3-8',
    title: 'Misi 8: A City for Everyone',
    kind: 'main',
    order: 8,
    giverNpcId: 'npc-s3-community',
    summary:
      'Kota masa depan tidak boleh meninggalkan siapa pun (mencegah cultural lag & kesenjangan). Kunjungi Distrik Permukiman dan Distrik Hiburan, lalu lapor ke Ketua Warga.',
    steps: [
      {
        id: 'qs3-8-1',
        description: 'Masuk ke Kafe Digital & Hub Komunitas di Distrik Permukiman Futuristik',
        eventType: 'enter_interior',
        targetId: 'eb-s3-cafe',
        waypointX: -52,
        waypointZ: 42,
        waypointLabel: 'Hub Komunitas Permukiman',
      },
      {
        id: 'qs3-8-2',
        description: 'Kunjungi Arena Arkade Neon & Sinema 4D di Distrik Hiburan',
        eventType: 'enter_interior',
        targetId: 'eb-s3-arcade',
        waypointX: 54,
        waypointZ: 46,
        waypointLabel: 'Arena Hiburan Neon',
      },
      {
        id: 'qs3-8-3',
        description: 'Diskusikan kota inklusif bersama Ibu Sari di Permukiman Futuristik',
        eventType: 'talk_npc',
        targetId: 'npc-s3-community',
        waypointX: -42,
        waypointZ: 34,
        waypointLabel: 'Ibu Sari (Permukiman)',
      },
    ],
    rewards: {
      xp: 290,
      coins: 520,
      reputation: 12,
      happiness: 10,
      welfare: 10,
      unlockCustomizationIds: ['shirt-neon-streetwear'],
    },
  },
  // MAIN MISSION 9: The Future Continues
  {
    id: 'q-s3-9',
    title: 'Misi 9: The Future Continues',
    kind: 'main',
    order: 9,
    giverNpcId: 'npc-s3-aditya',
    summary:
      'Puncak perjalanan Wali Kota Nusantara! Perbarui salah satu bangunan kota, inspeksi Menara Nusantara Masa Depan, dan rayakan keberlanjutan bersama Aditya.',
    steps: [
      {
        id: 'qs3-9-1',
        description: 'Upgrade bangunan mana pun di Stage 3 untuk memperkuat daya saing Smart City',
        eventType: 'upgrade_facility',
        targetId: '*',
        waypointX: 0,
        waypointZ: 0,
        waypointLabel: 'Upgrade Bangunan [E]',
      },
      {
        id: 'qs3-9-2',
        description: 'Inspeksi Menara Nusantara Masa Depan di pusat Smart City',
        eventType: 'inspect_landmark',
        targetId: 'lm-s3-menara-nusantara',
        waypointX: 0,
        waypointZ: -16,
        waypointLabel: 'Menara Nusantara Masa Depan',
      },
      {
        id: 'qs3-9-3',
        description: 'Temui Aditya di Plaza Menara untuk Deklarasi Kota Era Tanpa Batas',
        eventType: 'talk_npc',
        targetId: 'npc-s3-aditya',
        waypointX: 5.5,
        waypointZ: -6.5,
        waypointLabel: 'Aditya (Deklarasi Akhir)',
      },
    ],
    rewards: {
      xp: 420,
      coins: 800,
      reputation: 16,
      happiness: 14,
      welfare: 14,
      unlockCustomizationIds: ['jacket-future-guardian', 'hat-future-crown'],
      unlockTitleId: 'title-penjaga-masa-depan',
    },
  },
  // SIDE QUESTS STAGE 3
  {
    id: 'q-s3-side-security',
    title: 'Misi Sampingan: Perisai Keamanan Siber',
    kind: 'side',
    order: 10,
    giverNpcId: 'npc-s3-coordinator',
    summary:
      'Bantu pusat kendali mengumpulkan Mikroprosesor Kuantum dan mengantarkannya ke Node Server Balai Smart City.',
    steps: [
      {
        id: 'qs3-s1-1',
        description: 'Ambil Mikroprosesor Kuantum di Distrik Riset (-40, -20)',
        eventType: 'collect_item',
        targetId: 's3-chip-kuantum',
        waypointX: -40,
        waypointZ: -20,
        waypointLabel: 'Node Riset Kuantum',
      },
      {
        id: 'qs3-s1-2',
        description: 'Antarkan Mikroprosesor ke Node Server Balai Smart City',
        eventType: 'deliver_item',
        targetId: 'deliv-s3-server',
        requiredItemToConsume: 's3-chip-kuantum',
        waypointX: -18,
        waypointZ: -9,
        waypointLabel: 'Node Server Balai Smart City',
      },
    ],
    rewards: {
      xp: 160,
      coins: 300,
      reputation: 8,
      happiness: 5,
      welfare: 6,
      unlockCustomizationIds: ['jacket-futuristic-security'],
    },
  },
  {
    id: 'q-s3-side-fashion',
    title: 'Misi Sampingan: Panggung Busana Siber Nusantara',
    kind: 'side',
    order: 11,
    giverNpcId: 'npc-s3-stylist',
    summary:
      'Desainer Mal E-Commerce ingin memadukan motif Nusantara dan lampu neon modern. Gunakan Studio Karakter [C] atau Cermin Butik Mal dan lapor kembali.',
    steps: [
      {
        id: 'qs3-s2-1',
        description: 'Ubah gaya avatarmu menggunakan Studio Karakter [C] atau Cermin Butik Mal',
        eventType: 'customize_avatar',
        targetId: '*',
        waypointX: 52,
        waypointZ: -25,
        waypointLabel: 'Butik Busana Futuristik 3D',
      },
      {
        id: 'qs3-s2-2',
        description: 'Laporkan hasil desain kepada Zara Kinetik di Distrik Bisnis Digital',
        eventType: 'talk_npc',
        targetId: 'npc-s3-stylist',
        waypointX: 46,
        waypointZ: -16,
        waypointLabel: 'Zara Kinetik (Mal E-Commerce)',
      },
    ],
    rewards: {
      xp: 140,
      coins: 260,
      reputation: 7,
      happiness: 8,
      welfare: 4,
      unlockCustomizationIds: ['jacket-quantum-scientist'],
    },
  },
];
