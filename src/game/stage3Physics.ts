import { BUILDING_CATALOG } from './data/bermainData';
import { PlacedBuildingInstance } from './stage1WorldLogic';
import {
  findStage3DistrictAt,
  STAGE3_ACTIVITY_STATIONS,
  STAGE3_COLLECTIBLES,
  STAGE3_DELIVERY_SPOTS,
  STAGE3_ELEVATOR_PADS,
  STAGE3_ENTERABLE_BUILDINGS,
  STAGE3_VEHICLES,
  STAGE3_WARDROBE_MIRROR_SPOT,
  STAGE3_WORLD_PICKUPS,
  Stage3ActivityStationDef,
  Stage3CollectibleDef,
  Stage3DeliverySpotDef,
  Stage3ElevatorPadDef,
  Stage3EnterableBuildingDef,
} from './stage3Data';
import { WorldPickupDef } from './stage1Data';
import {
  AabbCollider,
  CrowdPatrolDef,
  GRAVITY,
  JUMP_VELOCITY,
  NpcWaypoint,
  PLAYER_RADIUS,
  Player3DState,
  PlayerMoveInput,
  SceneryBuildingDef,
  SPRINT_SPEED,
  StageLandmarkDef,
  ThirdPersonCamState,
  WALK_SPEED,
} from './world3dPhysics';
import { VehicleRuntimeState } from './stage1Physics';

export const STAGE3_MIN_X = -104.0;
export const STAGE3_MAX_X = 124.0;
export const STAGE3_MIN_Z = -112.0;
export const STAGE3_MAX_Z = 102.0;

export const STAGE3_SHORELINE_X = 88.0;
export const STAGE3_MONORAIL_X = 24.0;

export function isStage3PointOnSkywalkDeck(x: number, z: number): boolean {
  return x >= -36 && x <= 36 && z >= -16 && z <= -10;
}

export function isStage3PointOnMenaraDeck(x: number, z: number): boolean {
  return x >= -10 && x <= 10 && z >= -22 && z <= -10;
}

export function isStage3PointOnEcoRoof(x: number, z: number): boolean {
  return x >= -4 && x <= 12 && z >= 50 && z <= 66;
}

export function stage3GroundHeightAt(x: number, z: number, currentY = 0): number {
  // 1. Rooftop Decks (reachable via elevator pads)
  if (currentY >= 12.0 && isStage3PointOnMenaraDeck(x, z)) {
    return 14.2;
  }
  if (currentY >= 8.5 && isStage3PointOnEcoRoof(x, z)) {
    return 10.5;
  }

  // 2. Elevated Skywalk & Walkable Ramps (z in [-16, -10])
  if (z >= -16 && z <= -10) {
    if (x >= -46 && x < -36 && (currentY >= 0.4 || x <= -43)) {
      return ((x - -46) / 10) * 6.5;
    }
    if (x > 36 && x <= 46 && (currentY >= 0.4 || x >= 43)) {
      return ((46 - x) / 10) * 6.5;
    }
    if (currentY >= 4.2 && isStage3PointOnSkywalkDeck(x, z)) {
      return 6.5;
    }
  }

  // 3. East Wind & Solar Coastal Pier
  if (x >= STAGE3_SHORELINE_X - 4 && x <= 104 && z >= 50 && z <= 62) {
    return 0.4;
  }

  // 4. East Ocean beyond shoreline
  if (x > STAGE3_SHORELINE_X) {
    return -0.65;
  }

  // 5. Enterable Interior floor slab
  if (getStage3EnterableBuildingAt(x, z)) {
    return 0.22;
  }

  return 0;
}

export function getStage3EnterableBuildingAt(
  x: number,
  z: number
): Stage3EnterableBuildingDef | null {
  for (const eb of STAGE3_ENTERABLE_BUILDINGS) {
    if (
      x >= eb.x - eb.halfW + 0.35 &&
      x <= eb.x + eb.halfW - 0.35 &&
      z >= eb.z - eb.halfD + 0.35 &&
      z <= eb.z + eb.halfD - 0.35
    ) {
      return eb;
    }
  }
  return null;
}

export function getStage3Landmarks(): StageLandmarkDef[] {
  return [
    {
      id: 'lm-s3-menara-nusantara',
      label: 'Menara Nusantara Masa Depan',
      kind: 'skyscraper',
      x: 0,
      z: -16,
      halfW: 5.5,
      halfD: 5.0,
      height: 42,
      yaw: 0,
      description:
        'Menara kembar futuristik berlapis kaca surya dan proyektor hologram yang menjadi simbol transformasi Smart City Nusantara.',
      sociologyNote:
        'Transformasi Kota Era Digital memadukan konektivitas global (Harvey: pemampatan ruang-waktu) dengan identitas budaya lokal.',
    },
    {
      id: 'lm-s3-wind-pier',
      label: 'Anjungan Energi Angin & Surya Pesisir',
      kind: 'solar_hub',
      x: 92,
      z: 56,
      halfW: 4.5,
      halfD: 4.5,
      height: 12,
      yaw: 0,
      description:
        'Jaringan turbin angin lepas pantai dan panel fotovoltaik terapung yang memasok listrik bersih bagi seluruh kota.',
      sociologyNote:
        'Menjawab masalah bersama perubahan iklim global melalui inovasi teknologi ramah lingkungan dan keadilan ekologis antargenerasi.',
    },
    {
      id: 'lm-s3-stage2-terminal',
      label: 'Peron Kereta Cepat Nusantara (Arah Stage 2)',
      kind: 'station',
      x: 0,
      z: -86,
      halfW: 8.5,
      halfD: 5.0,
      height: 6.8,
      yaw: 0,
      description:
        'Stasiun Kereta Cepat levitasi magnetik yang menghubungkan Kota Digital Masa Depan dengan Kota Industri Global (Stage 2).',
      sociologyNote:
        'Kemajuan infrastruktur transportasi modern mempercepat mobilitas barang, gagasan, dan tenaga kerja antargenerasi pembangunan.',
    },
    {
      id: 'lm-s3-monument-glokal',
      label: 'Monumen Harmoni Glokalisasi 2045',
      kind: 'monument',
      x: 0,
      z: 18,
      halfW: 3.4,
      halfD: 3.4,
      height: 11,
      yaw: 0,
      description:
        'Instalasi seni kinetik berbentuk sayap Garuda digital yang melambangkan kearifan lokal menavigasi gelombang globalisasi.',
      sociologyNote:
        'Glokalisasi (Robertson) menjaga budaya lokal tetap hidup dan berdaya saing tinggi di tengah masyarakat jaringan global.',
    },
  ];
}

export function getStage3Npcs(): NpcWaypoint[] {
  return [
    {
      id: 'npc-s3-aditya',
      name: 'Aditya',
      role: 'Hyperglobalis · Arsitek Jaringan Digital',
      characterId: 'aditya',
      x: 5.5,
      z: -6.5,
      facingYaw: Math.PI * 0.85,
      dialogue:
        'Selamat datang di Kota Digital Masa Depan! Lihatlah Menara Nusantara, skywalk kaca, dan jaringan energi bersih yang terhubung ke seluruh dunia!',
      missionHint:
        'Selesaikan Misi 1 (Welcome to the Future) dan Misi 9 untuk meresmikan deklarasi akhir Kota Nusantara.',
      recommendedCategory: 'teknologi',
    },
    {
      id: 'npc-s3-laras',
      name: 'Laras',
      role: 'Skeptis Kritis · Pengawas Keadilan Eko-Sosial',
      characterId: 'laras',
      x: -6,
      z: 40,
      facingYaw: 0,
      dialogue:
        'Kemajuan AI dan gedung pencakar langit harus dinikmati semua warga, sekaligus ditopang energi surya, angin, dan ruang hijau yang nyata.',
      missionHint:
        'Seimbangkan Konsol Energi Cerdas di Eco Dome (Misi 6) dan perhatikan indikator kualitas lingkungan.',
      recommendedCategory: 'budaya',
    },
    {
      id: 'npc-s3-naya',
      name: 'Naya',
      role: 'Transformasionalis · Pemimpin Glokalisasi',
      characterId: 'naya',
      x: 34,
      z: -6,
      facingYaw: -Math.PI * 0.5,
      dialogue:
        'Di Distrik Bisnis Digital ini, perajin batik dan UMKM Nusantara menjual karya lokal ke panggung dunia lewat e-commerce dan kurir drone!',
      missionHint:
        'Kunjungi Mal E-Commerce dan kirim paket glokalisasi pada Misi 3: The Digital Economy.',
      recommendedCategory: 'perdagangan',
    },
    {
      id: 'npc-s3-coordinator',
      name: 'Bima Pratama',
      role: 'Koordinator Operasi Smart City',
      x: -14,
      z: -9,
      facingYaw: 0.4,
      dialogue:
        'Sistem sensor kota memantau 9 indikator utama mulai dari energi terbarukan hingga kepuasan warga. Naiklah ke Dek Observasi 14 meter via Lift Menara!',
      missionHint:
        'Bicara denganku lalu naik Lift Menara Nusantara [E] untuk menuntaskan Misi 2: A Smarter City.',
    },
    {
      id: 'npc-s3-scientist',
      name: 'Dr. Raka Wijaya',
      role: 'Kepala Lab Robotika & AI',
      x: -44,
      z: -24,
      facingYaw: Math.PI / 2,
      dialogue:
        'Robot kurir dan asisten warga memerlukan kalibrasi LiDAR secara berkala agar bersikap aman dan ramah di trotoar maupun skywalk.',
      missionHint:
        'Masuk ke Lab Robotika & Riset AI lalu jalankan Meja Kalibrasi Robot untuk Misi 4.',
    },
    {
      id: 'npc-s3-transit',
      name: 'Kapten Arjuna',
      role: 'Komandan Hub Transportasi Otonom',
      x: -6,
      z: -74,
      facingYaw: 0.2,
      dialogue:
        'Dari Stasiun Kereta Cepat ini warga berdatangan dari Kota Industri Stage 2, lalu berpindah memakai monorel dan kendaraan listrik otonom.',
      missionHint:
        'Coba kendarai EV Sport/Pod Taksi [F] dan jalankan Stasiun Uji Sirkuit EV untuk Misi 5.',
    },
    {
      id: 'npc-s3-quantum',
      name: 'Prof. Kirana',
      role: 'Peneliti Komputasi Kuantum',
      x: -66,
      z: -18,
      facingYaw: Math.PI / 2,
      dialogue:
        'Ada cetak biru prototipe energi kuantum bersih di sayap barat tersembunyi distrik ini. Museum Sains menyimpan petunjuknya!',
      missionHint:
        'Ambil Cetak Biru Prototipe Rahasia di (-76, -16) untuk menyelesaikan Misi 7: The Hidden Innovation.',
    },
    {
      id: 'npc-s3-community',
      name: 'Ibu Sari',
      role: 'Ketua Komunitas Permukiman Eko',
      x: -42,
      z: 34,
      facingYaw: Math.PI / 3,
      dialogue:
        'Teknologi canggih akan sia-sia jika warga senior atau keluarga pekerja tidak mendapat akses internet, hunian nyaman, dan ruang hiburan bersama.',
      missionHint:
        'Kunjungi Hub Komunitas Permukiman & Arena Arkade Hiburan untuk menyelesaikan Misi 8.',
    },
    {
      id: 'npc-s3-stylist',
      name: 'Zara Kinetik',
      role: 'Desainer Busana Futuristik Nusantara',
      x: 46,
      z: -16,
      facingYaw: -Math.PI * 0.6,
      dialogue:
        'Di era digital, busana kita memadukan tenun tradisional dan jaket cyber bercahaya. Cobalah Studio Karakter [C] atau Cermin Butik di mal ini!',
      missionHint:
        'Ubah gaya avatarmu dan lapor kembali padaku untuk Misi Sampingan Panggung Busana Siber.',
    },
    {
      id: 'npc-s3-fintech',
      name: 'Dimas Fintech',
      role: 'Analis Ekonomi Digital & Ekspor',
      x: 62,
      z: -42,
      facingYaw: Math.PI,
      dialogue:
        'Pembayaran QR lintas negara dan platform cloud memungkinkan pengrajin lokal mengekspor langsung tanpa perantara panjang.',
      missionHint:
        'Bangun Hub Bisnis Global [B] atau kirim paket ekspor UMKM di Mal E-Commerce.',
    },
  ];
}

export function getStage3CrowdPatrols(): CrowdPatrolDef[] {
  return [
    // Office workers & commuters around Smart Center & Digital Business
    {
      id: 'c3-1',
      role: 'office',
      shirtColor: 0x1e293b,
      pantsColor: 0x0f172a,
      hatColor: 0x38bdf8,
      prop: 'tablet',
      speed: 2.2,
      pauseSeconds: 1.4,
      waypoints: [{ x: 14, z: -4 }, { x: 26, z: -4 }, { x: 26, z: 12 }, { x: 14, z: 12 }],
    },
    {
      id: 'c3-2',
      role: 'office',
      shirtColor: 0x0369a1,
      pantsColor: 0x1e293b,
      hatColor: 0xf8fafc,
      prop: 'holopad',
      speed: 2.3,
      pauseSeconds: 1.5,
      waypoints: [{ x: 32, z: -20 }, { x: 46, z: -20 }, { x: 46, z: -38 }, { x: 32, z: -38 }],
    },
    {
      id: 'c3-3',
      role: 'buyer',
      shirtColor: 0xf59e0b,
      pantsColor: 0x334155,
      hatColor: 0xfde047,
      prop: 'satchel',
      speed: 2.0,
      pauseSeconds: 1.8,
      waypoints: [{ x: 44, z: -12 }, { x: 64, z: -12 }, { x: 64, z: 2 }],
    },
    // Scientists & students in Research District
    {
      id: 'c3-4',
      role: 'scientist',
      shirtColor: 0xf8fafc,
      pantsColor: 0x334155,
      hatColor: 0xa855f7,
      prop: 'holopad',
      speed: 2.0,
      pauseSeconds: 1.6,
      waypoints: [{ x: -34, z: -18 }, { x: -46, z: -18 }, { x: -46, z: -42 }, { x: -34, z: -42 }],
    },
    {
      id: 'c3-5',
      role: 'scientist',
      shirtColor: 0xe2e8f0,
      pantsColor: 0x4c1d95,
      hatColor: 0x38bdf8,
      prop: 'tablet',
      speed: 1.9,
      pauseSeconds: 1.8,
      waypoints: [{ x: -64, z: -28 }, { x: -74, z: -28 }, { x: -74, z: -48 }],
    },
    {
      id: 'c3-6',
      role: 'citizen',
      shirtColor: 0x7c3aed,
      pantsColor: 0x1e293b,
      hatColor: 0xc084fc,
      prop: 'none',
      speed: 2.1,
      pauseSeconds: 1.2,
      waypoints: [{ x: -36, z: -56 }, { x: -62, z: -56 }],
    },
    // Residents & children in Residential District
    {
      id: 'c3-7',
      role: 'citizen',
      shirtColor: 0x10b981,
      pantsColor: 0x1e293b,
      hatColor: 0x34d399,
      prop: 'basket',
      speed: 1.8,
      pauseSeconds: 1.6,
      waypoints: [{ x: -38, z: 26 }, { x: -62, z: 26 }, { x: -62, z: 54 }, { x: -38, z: 54 }],
    },
    {
      id: 'c3-8',
      role: 'child',
      shirtColor: 0x22d3ee,
      pantsColor: 0x1e293b,
      hatColor: 0xfde047,
      prop: 'none',
      behavior: 'play_tag',
      scale: 0.72,
      speed: 2.6,
      pauseSeconds: 0.8,
      waypoints: [{ x: -44, z: 56 }, { x: -58, z: 56 }, { x: -50, z: 68 }],
    },
    {
      id: 'c3-9',
      role: 'child',
      shirtColor: 0xf472b6,
      pantsColor: 0x0f172a,
      hatColor: 0xfef08a,
      prop: 'none',
      behavior: 'play_tag',
      scale: 0.72,
      speed: 2.5,
      pauseSeconds: 0.9,
      waypoints: [{ x: -66, z: 32 }, { x: -66, z: 48 }],
    },
    // Entertainment neon crowd
    {
      id: 'c3-10',
      role: 'tourist',
      shirtColor: 0xec4899,
      pantsColor: 0x1e1b4b,
      hatColor: 0xfde047,
      prop: 'tablet',
      speed: 2.2,
      pauseSeconds: 1.5,
      waypoints: [{ x: 36, z: 32 }, { x: 66, z: 32 }, { x: 66, z: 56 }, { x: 36, z: 56 }],
    },
    {
      id: 'c3-11',
      role: 'tourist',
      shirtColor: 0x38bdf8,
      pantsColor: 0x0f172a,
      hatColor: 0xf472b6,
      prop: 'none',
      speed: 2.0,
      pauseSeconds: 1.3,
      waypoints: [{ x: 42, z: 20 }, { x: 74, z: 20 }],
    },
    {
      id: 'c3-12',
      role: 'buyer',
      shirtColor: 0xa855f7,
      pantsColor: 0x1e293b,
      hatColor: 0xe2e8f0,
      prop: 'satchel',
      speed: 1.9,
      pauseSeconds: 1.5,
      waypoints: [{ x: 72, z: 38 }, { x: 72, z: 66 }],
    },
    // Green Tech & Coastal Promenade
    {
      id: 'c3-13',
      role: 'scientist',
      shirtColor: 0x059669,
      pantsColor: 0x0f172a,
      hatColor: 0x34d399,
      prop: 'holopad',
      speed: 2.0,
      pauseSeconds: 1.5,
      waypoints: [{ x: -12, z: 42 }, { x: 18, z: 42 }, { x: 18, z: 68 }],
    },
    {
      id: 'c3-14',
      role: 'citizen',
      shirtColor: 0x34d399,
      pantsColor: 0x334155,
      hatColor: 0xfef08a,
      prop: 'none',
      speed: 1.8,
      pauseSeconds: 1.7,
      waypoints: [{ x: 82, z: -20 }, { x: 82, z: 42 }],
    },
    // Transit Hub commuters
    {
      id: 'c3-15',
      role: 'office',
      shirtColor: 0x0284c7,
      pantsColor: 0x0f172a,
      hatColor: 0x22d3ee,
      prop: 'satchel',
      speed: 2.4,
      pauseSeconds: 1.2,
      waypoints: [{ x: -24, z: -74 }, { x: 24, z: -74 }],
    },
    {
      id: 'c3-16',
      role: 'tourist',
      shirtColor: 0xfbbf24,
      pantsColor: 0x1e293b,
      hatColor: 0x38bdf8,
      prop: 'tablet',
      speed: 2.1,
      pauseSeconds: 1.5,
      waypoints: [{ x: 12, z: -64 }, { x: 12, z: -80 }, { x: -12, z: -80 }],
    },
    // Autonomous Assistant & Courier Robots!
    {
      id: 'c3-bot-1',
      role: 'robot',
      shirtColor: 0x38bdf8,
      pantsColor: 0x0f172a,
      hatColor: 0x22d3ee,
      prop: 'holopad',
      speed: 2.6,
      pauseSeconds: 1.0,
      waypoints: [{ x: -22, z: 6 }, { x: 22, z: 6 }, { x: 22, z: -24 }, { x: -22, z: -24 }],
    },
    {
      id: 'c3-bot-2',
      role: 'drone_bot',
      shirtColor: 0xf59e0b,
      pantsColor: 0x1e293b,
      hatColor: 0xfde047,
      prop: 'crate',
      speed: 2.8,
      pauseSeconds: 1.0,
      waypoints: [{ x: 28, z: -6 }, { x: 68, z: -6 }, { x: 68, z: -30 }],
    },
    {
      id: 'c3-bot-3',
      role: 'robot',
      shirtColor: 0xa855f7,
      pantsColor: 0x0f172a,
      hatColor: 0xc084fc,
      prop: 'holopad',
      speed: 2.5,
      pauseSeconds: 1.1,
      waypoints: [{ x: -32, z: -10 }, { x: -62, z: -10 }, { x: -62, z: -36 }],
    },
    {
      id: 'c3-bot-4',
      role: 'drone_bot',
      shirtColor: 0x10b981,
      pantsColor: 0x0f172a,
      hatColor: 0x34d399,
      prop: 'crate',
      speed: 2.6,
      pauseSeconds: 1.0,
      waypoints: [{ x: -18, z: 34 }, { x: 20, z: 34 }, { x: 20, z: 66 }],
    },
    {
      id: 'c3-bot-5',
      role: 'robot',
      shirtColor: 0xec4899,
      pantsColor: 0x1e1b4b,
      hatColor: 0xf472b6,
      prop: 'holopad',
      speed: 2.4,
      pauseSeconds: 1.2,
      waypoints: [{ x: 34, z: 42 }, { x: 64, z: 42 }],
    },
    // Skywalk elevated walkers (y = 6.5!)
    {
      id: 'c3-sky-1',
      role: 'office',
      shirtColor: 0x38bdf8,
      pantsColor: 0x0f172a,
      hatColor: 0xf8fafc,
      prop: 'tablet',
      speed: 2.1,
      pauseSeconds: 1.4,
      waypoints: [{ x: -32, y: 6.5, z: -13 }, { x: 32, y: 6.5, z: -13 }],
    },
    {
      id: 'c3-sky-2',
      role: 'robot',
      shirtColor: 0x22d3ee,
      pantsColor: 0x0f172a,
      hatColor: 0x67e8f9,
      prop: 'holopad',
      speed: 2.5,
      pauseSeconds: 1.2,
      waypoints: [{ x: 28, y: 6.5, z: -14 }, { x: -28, y: 6.5, z: -14 }],
    },
  ];
}

export function getStage3SceneryBuildings(): SceneryBuildingDef[] {
  return [
    // Iconic Center Tower & Framing Plaza Skyscrapers
    { id: 'sc-s3-menara', kind: 'menara_nusantara', x: 0, z: -16, halfW: 6.2, halfD: 5.5, height: 42, yaw: 0, variant: 0 },
    { id: 'sc-s3-fintech-c1', kind: 'smart_tower', x: 20, z: -20, halfW: 4.5, halfD: 4.5, height: 28, yaw: 0, variant: 0 },
    { id: 'sc-s3-fintech-c2', kind: 'eco_skyscraper', x: 20, z: 18, halfW: 4.5, halfD: 4.5, height: 24, yaw: 0, variant: 1 },
    { id: 'sc-s3-smart-west', kind: 'eco_skyscraper', x: -20, z: 18, halfW: 4.6, halfD: 4.6, height: 22, yaw: 0, variant: 2 },

    // Digital Business District (East-North) Skyscrapers
    { id: 'sc-s3-corp-1', kind: 'cyber_tower', x: 44, z: -48, halfW: 5.5, halfD: 5.5, height: 46, yaw: 0, variant: 0 },
    { id: 'sc-s3-corp-2', kind: 'smart_tower', x: 64, z: -48, halfW: 5.2, halfD: 5.2, height: 38, yaw: 0, variant: 1 },
    { id: 'sc-s3-corp-3', kind: 'cyber_tower', x: 76, z: -22, halfW: 5.0, halfD: 5.0, height: 34, yaw: 0, variant: 2 },
    { id: 'sc-s3-corp-4', kind: 'smart_tower', x: 74, z: 2, halfW: 4.8, halfD: 4.8, height: 30, yaw: 0, variant: 2 },
    { id: 'sc-s3-fintech-bank', kind: 'fintech_bank', x: 54, z: 2, halfW: 5.2, halfD: 4.5, height: 20, yaw: 0, variant: 0 },
    { id: 'sc-s3-cowork', kind: 'solar_office', x: 34, z: -38, halfW: 4.5, halfD: 4.2, height: 18, yaw: 0, variant: 0 },

    // Research & Innovation District (West-North)
    { id: 'sc-s3-uni', kind: 'cultural_hall', x: -38, z: -50, halfW: 5.6, halfD: 5.0, height: 22, yaw: 0, variant: 1 },
    { id: 'sc-s3-ai-hq', kind: 'cyber_tower', x: -74, z: -52, halfW: 5.4, halfD: 5.4, height: 36, yaw: 0, variant: 1 },
    { id: 'sc-s3-quantum-wing', kind: 'quantum_lab', x: -78, z: -18, halfW: 4.6, halfD: 4.6, height: 16, yaw: 0, variant: 0 },
    { id: 'sc-s3-data-vault', kind: 'smart_tower', x: -76, z: 2, halfW: 4.8, halfD: 4.8, height: 26, yaw: 0, variant: 0 },

    // Futuristic Residential District (West-South)
    { id: 'sc-s3-apt-1', kind: 'eco_skyscraper', x: -38, z: 68, halfW: 5.2, halfD: 4.8, height: 34, yaw: 0, variant: 0 },
    { id: 'sc-s3-apt-2', kind: 'eco_skyscraper', x: -58, z: 68, halfW: 5.2, halfD: 4.8, height: 40, yaw: 0, variant: 1 },
    { id: 'sc-s3-apt-3', kind: 'eco_skyscraper', x: -76, z: 48, halfW: 5.0, halfD: 5.0, height: 30, yaw: 0, variant: 2 },
    { id: 'sc-s3-apt-4', kind: 'apartment_block', x: -76, z: 24, halfW: 4.8, halfD: 4.8, height: 28, yaw: 0, variant: 0 },
    { id: 'sc-s3-smart-store', kind: 'modern_mall', x: -36, z: 22, halfW: 4.0, halfD: 3.6, height: 10, yaw: 0, variant: 1 },

    // Entertainment & Recreation District (East-South)
    { id: 'sc-s3-arena', kind: 'concert_arena', x: 54, z: 74, halfW: 8.0, halfD: 6.4, height: 18, yaw: 0, variant: 0 },
    { id: 'sc-s3-neon-tower-1', kind: 'cyber_tower', x: 76, z: 48, halfW: 5.0, halfD: 5.0, height: 36, yaw: 0, variant: 2 },
    { id: 'sc-s3-neon-tower-2', kind: 'cyber_tower', x: 76, z: 24, halfW: 4.8, halfD: 4.8, height: 32, yaw: 0, variant: 0 },
    { id: 'sc-s3-bistro', kind: 'cafe_terrace', x: 36, z: 54, halfW: 4.2, halfD: 3.8, height: 12, yaw: 0, variant: 1 },

    // Green Technology District (South-Center)
    { id: 'sc-s3-solar-1', kind: 'solar_office', x: -16, z: 74, halfW: 4.8, halfD: 4.8, height: 30, yaw: 0, variant: 1 },
    { id: 'sc-s3-solar-2', kind: 'solar_office', x: 18, z: 76, halfW: 4.8, halfD: 4.8, height: 28, yaw: 0, variant: 2 },
    { id: 'sc-s3-recycle', kind: 'eco_dome', x: -14, z: 38, halfW: 4.6, halfD: 4.2, height: 14, yaw: 0, variant: 0 },

    // Transportation Hub District (North)
    { id: 'sc-s3-transit-w', kind: 'smart_tower', x: -46, z: -88, halfW: 5.0, halfD: 4.8, height: 26, yaw: 0, variant: 1 },
    { id: 'sc-s3-transit-e', kind: 'smart_tower', x: 46, z: -88, halfW: 5.0, halfD: 4.8, height: 26, yaw: 0, variant: 2 },
    { id: 'sc-s3-ev-depot', kind: 'modern_mall', x: 34, z: -72, halfW: 4.5, halfD: 4.0, height: 12, yaw: 0, variant: 0 },

    // Tall Perimeter Skyline Backdrop Towers
    { id: 'sc-s3-bg-1', kind: 'smart_tower', x: -88, z: -78, halfW: 5.5, halfD: 5.5, height: 50, yaw: 0, variant: 0 },
    { id: 'sc-s3-bg-2', kind: 'eco_skyscraper', x: -88, z: 76, halfW: 5.5, halfD: 5.5, height: 48, yaw: 0, variant: 1 },
    { id: 'sc-s3-bg-3', kind: 'cyber_tower', x: 78, z: -82, halfW: 5.5, halfD: 5.5, height: 52, yaw: 0, variant: 2 },
    { id: 'sc-s3-bg-4', kind: 'cyber_tower', x: 78, z: 78, halfW: 5.5, halfD: 5.5, height: 48, yaw: 0, variant: 1 },
  ];
}

function addEnterableWallColliders(b: Stage3EnterableBuildingDef, list: AabbCollider[]) {
  const t = 0.45;
  const minX = b.x - b.halfW;
  const maxX = b.x + b.halfW;
  const minZ = b.z - b.halfD;
  const maxZ = b.z + b.halfD;
  const h = b.wallHeight;
  const dw = b.doorHalfWidth;

  if (b.doorSide === 'south') {
    list.push({ id: `${b.id}-n`, minX, maxX, minZ, maxZ: minZ + t, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-w`, minX, maxX: minX + t, minZ, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-e`, minX: maxX - t, maxX, minZ, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-sl`, minX, maxX: b.x - dw, minZ: maxZ - t, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-sr`, minX: b.x + dw, maxX, minZ: maxZ - t, maxZ, maxY: h, kind: 'building' });
  } else if (b.doorSide === 'north') {
    list.push({ id: `${b.id}-s`, minX, maxX, minZ: maxZ - t, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-w`, minX, maxX: minX + t, minZ, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-e`, minX: maxX - t, maxX, minZ, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-nl`, minX, maxX: b.x - dw, minZ, maxZ: minZ + t, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-nr`, minX: b.x + dw, maxX, minZ, maxZ: minZ + t, maxY: h, kind: 'building' });
  } else if (b.doorSide === 'east') {
    list.push({ id: `${b.id}-n`, minX, maxX, minZ, maxZ: minZ + t, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-s`, minX, maxX, minZ: maxZ - t, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-w`, minX, maxX: minX + t, minZ, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-en`, minX: maxX - t, maxX, minZ, maxZ: b.z - dw, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-es`, minX: maxX - t, maxX, minZ: b.z + dw, maxZ, maxY: h, kind: 'building' });
  } else {
    list.push({ id: `${b.id}-n`, minX, maxX, minZ, maxZ: minZ + t, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-s`, minX, maxX, minZ: maxZ - t, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-e`, minX: maxX - t, maxX, minZ, maxZ, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-wn`, minX, maxX: minX + t, minZ, maxZ: b.z - dw, maxY: h, kind: 'building' });
    list.push({ id: `${b.id}-ws`, minX, maxX: minX + t, minZ: b.z + dw, maxZ, maxY: h, kind: 'building' });
  }
}

export function buildStage3WorldColliders(placedBuildings: PlacedBuildingInstance[]): AabbCollider[] {
  const list: AabbCollider[] = [];

  for (const sb of getStage3SceneryBuildings()) {
    // Allow player to stand atop Menara Observation Deck (y=14.2) & Eco Dome Roof (y=10.5)
    list.push({
      id: sb.id,
      minX: sb.x - sb.halfW,
      maxX: sb.x + sb.halfW,
      minZ: sb.z - sb.halfD,
      maxZ: sb.z + sb.halfD,
      maxY: sb.id === 'sc-s3-menara' ? 13.8 : sb.height,
      kind: 'building',
    });
  }

  for (const eb of STAGE3_ENTERABLE_BUILDINGS) {
    addEnterableWallColliders(eb, list);
  }

  for (const pb of placedBuildings) {
    list.push({
      id: `pb-${pb.id}`,
      minX: pb.x - 2.6,
      maxX: pb.x + 2.6,
      minZ: pb.z - 2.6,
      maxZ: pb.z + 2.6,
      maxY: 16,
      kind: 'building',
    });
  }

  return list;
}

export function isStage3OnRoad(x: number, z: number): boolean {
  if (Math.abs(z) <= 4.4 && x >= -90 && x <= STAGE3_SHORELINE_X - 2) return true;
  if (Math.abs(x) <= 4.4 && z >= -74 && z <= 88) return true;
  if (Math.abs(z + 34) <= 3.6 && x >= -88 && x <= 84) return true;
  if (Math.abs(z - 32) <= 3.6 && x >= -88 && x <= 84) return true;
  if (Math.abs(z + 72) <= 3.8 && x >= -84 && x <= 84) return true;
  if (Math.abs(x - 28) <= 3.6 && z >= -72 && z <= 84) return true;
  if (Math.abs(x + 28) <= 3.6 && z >= -72 && z <= 84) return true;
  if (Math.abs(x - STAGE3_MONORAIL_X) <= 2.4) return true;
  return false;
}

export function stepStage3Player(
  state: Player3DState,
  input: PlayerMoveInput,
  cameraYaw: number,
  colliders: AabbCollider[],
  dtSeconds: number
): Player3DState {
  const stepDt = Math.min(Math.max(dtSeconds, 0.001), 0.05);
  const targetSpeed = input.sprint ? SPRINT_SPEED : WALK_SPEED;

  let moveX = 0;
  let moveZ = 0;
  if (Math.abs(input.forward) > 0.01 || Math.abs(input.right) > 0.01) {
    const fwdX = Math.sin(cameraYaw);
    const fwdZ = Math.cos(cameraYaw);
    const rightX = -Math.cos(cameraYaw);
    const rightZ = Math.sin(cameraYaw);
    moveX = fwdX * input.forward + rightX * input.right;
    moveZ = fwdZ * input.forward + rightZ * input.right;
    const len = Math.hypot(moveX, moveZ) || 1;
    moveX /= len;
    moveZ /= len;
  }

  const vx = moveX * targetSpeed;
  const vz = moveZ * targetSpeed;
  let facingYaw = state.facingYaw;
  if (Math.hypot(vx, vz) > 0.2) {
    facingYaw = Math.atan2(vx, vz);
  }

  let nextX = Math.max(STAGE3_MIN_X + 2.0, Math.min(STAGE3_MAX_X - 2.0, state.x + vx * stepDt));
  let nextZ = Math.max(STAGE3_MIN_Z + 2.0, Math.min(STAGE3_MAX_Z - 2.0, state.z + vz * stepDt));

  for (const box of colliders) {
    if (state.y >= box.maxY - 0.35) continue;
    const cx = Math.max(box.minX, Math.min(nextX, box.maxX));
    const cz = Math.max(box.minZ, Math.min(nextZ, box.maxZ));
    const dx = nextX - cx;
    const dz = nextZ - cz;
    const dSq = dx * dx + dz * dz;
    if (dSq < PLAYER_RADIUS * PLAYER_RADIUS) {
      if (dSq > 1e-6) {
        const d = Math.sqrt(dSq);
        const push = PLAYER_RADIUS - d;
        nextX += (dx / d) * push;
        nextZ += (dz / d) * push;
      } else {
        nextX = state.x;
        nextZ = state.z;
      }
    }
  }

  // Keep player on land or coastal energy pier
  if (stage3GroundHeightAt(nextX, nextZ, state.y) < -0.2) {
    nextX = state.x;
    nextZ = state.z;
  }

  const groundY = stage3GroundHeightAt(nextX, nextZ, state.y);
  let vy = state.vy;
  let nextY = state.y;
  let grounded = state.grounded;

  if (input.jump && grounded) {
    vy = JUMP_VELOCITY;
    grounded = false;
  }

  if (!grounded || nextY > groundY + 0.02) {
    vy -= GRAVITY * stepDt;
    nextY += vy * stepDt;
    if (nextY <= groundY) {
      nextY = groundY;
      vy = 0;
      grounded = true;
    }
  } else {
    nextY = groundY;
    vy = 0;
    grounded = true;
  }

  const horizSpeed = Math.hypot((nextX - state.x) / stepDt, (nextZ - state.z) / stepDt);
  const walkCycle =
    horizSpeed > 0.35 && grounded ? state.walkCycle + horizSpeed * stepDt * 1.4 : state.walkCycle;

  return {
    x: nextX,
    y: nextY,
    z: nextZ,
    vx,
    vy,
    vz,
    facingYaw,
    grounded,
    speed: horizSpeed,
    walkCycle,
  };
}

export function createInitialStage3Vehicles(): VehicleRuntimeState[] {
  return STAGE3_VEHICLES.map((def) => ({
    def,
    x: def.spawnX,
    y: stage3GroundHeightAt(def.spawnX, def.spawnZ, 0),
    z: def.spawnZ,
    yaw: def.spawnYaw,
    speed: 0,
  }));
}

export function stepStage3VehiclePhysics(
  vehicle: VehicleRuntimeState,
  input: { forward: number; right: number },
  colliders: AabbCollider[],
  dt: number
): VehicleRuntimeState {
  const stepDt = Math.min(0.05, Math.max(0.001, dt));
  const accel = 18.0;
  let speed = vehicle.speed;

  if (Math.abs(input.forward) > 0.05) {
    speed += input.forward * accel * stepDt;
  } else {
    speed *= Math.max(0, 1 - 4.4 * stepDt);
  }
  speed = Math.max(-vehicle.def.maxSpeed * 0.45, Math.min(vehicle.def.maxSpeed, speed));

  const turnRate = 2.2;
  const dirSign = speed >= -0.2 ? 1 : -1;
  const yaw =
    Math.abs(speed) > 0.3
      ? vehicle.yaw - input.right * turnRate * stepDt * dirSign
      : vehicle.yaw - input.right * 0.9 * stepDt;

  let nextX = vehicle.x + Math.sin(yaw) * speed * stepDt;
  let nextZ = vehicle.z + Math.cos(yaw) * speed * stepDt;

  nextX = Math.max(STAGE3_MIN_X + 2.5, Math.min(STAGE3_SHORELINE_X - 2.0, nextX));
  nextZ = Math.max(STAGE3_MIN_Z + 2.5, Math.min(STAGE3_MAX_Z - 2.5, nextZ));

  const radius = vehicle.def.kind === 'ev_moto' ? 1.0 : 1.45;
  for (const box of colliders) {
    const cx = Math.max(box.minX, Math.min(nextX, box.maxX));
    const cz = Math.max(box.minZ, Math.min(nextZ, box.maxZ));
    const dx = nextX - cx;
    const dz = nextZ - cz;
    if (dx * dx + dz * dz < radius * radius) {
      nextX = vehicle.x;
      nextZ = vehicle.z;
      speed = 0;
      break;
    }
  }

  if (stage3GroundHeightAt(nextX, nextZ, 0) < -0.15) {
    nextX = vehicle.x;
    nextZ = vehicle.z;
    speed = 0;
  }

  return {
    ...vehicle,
    x: nextX,
    y: Math.max(0, stage3GroundHeightAt(nextX, nextZ, 0)),
    z: nextZ,
    yaw,
    speed,
  };
}

export function validateStage3BuildingPlacement(
  buildingId: string,
  x: number,
  z: number,
  placedBuildings: PlacedBuildingInstance[],
  playerX: number,
  playerZ: number
): { valid: boolean; reason: string } {
  const def = BUILDING_CATALOG.find((b) => b.id === buildingId);
  if (!def) return { valid: false, reason: 'Bangunan tidak dikenal.' };

  if (x < STAGE3_MIN_X + 8 || x > STAGE3_SHORELINE_X - 6 || z < STAGE3_MIN_Z + 12 || z > STAGE3_MAX_Z - 8) {
    return { valid: false, reason: 'Area di luar batas pengembangan Kota Digital Masa Depan.' };
  }

  if (Math.hypot(x - playerX, z - playerZ) < 3.6) {
    return { valid: false, reason: 'Terlalu dekat dengan karaktermu, mundur sedikit.' };
  }

  if (isStage3OnRoad(x, z)) {
    return { valid: false, reason: 'Tidak boleh membangun di atas jalan otonom atau jalur monorel.' };
  }

  if (Math.abs(x) < 16 && Math.abs(z) < 16) {
    return { valid: false, reason: 'Jaga Plaza Menara Nusantara tetap terbuka.' };
  }

  for (const eb of STAGE3_ENTERABLE_BUILDINGS) {
    if (Math.abs(x - eb.x) < eb.halfW + 3.2 && Math.abs(z - eb.z) < eb.halfD + 3.2) {
      return { valid: false, reason: `Terlalu dekat dengan ${eb.label}.` };
    }
  }

  for (const sc of getStage3SceneryBuildings()) {
    if (Math.abs(x - sc.x) < sc.halfW + 2.8 && Math.abs(z - sc.z) < sc.halfD + 2.8) {
      return { valid: false, reason: 'Lahan sudah ditempati menara atau fasilitas kota.' };
    }
  }

  for (const lm of getStage3Landmarks()) {
    if (Math.abs(x - lm.x) < lm.halfW + 3.2 && Math.abs(z - lm.z) < lm.halfD + 3.2) {
      return { valid: false, reason: `Terlalu dekat dengan ${lm.label}.` };
    }
  }

  for (const pb of placedBuildings) {
    if (Math.hypot(x - pb.x, z - pb.z) < 5.6) {
      return { valid: false, reason: 'Terlalu dekat dengan bangunan yang sudah didirikan.' };
    }
  }

  const d = findStage3DistrictAt(x, z);
  return { valid: true, reason: `Siap dibangun di ${d.name}` };
}

export type Stage3Interactable =
  | { kind: 'npc'; npc: NpcWaypoint; dist: number; promptLabel: string }
  | { kind: 'pickup'; pickup: WorldPickupDef; dist: number; promptLabel: string }
  | { kind: 'collectible'; collectible: Stage3CollectibleDef; dist: number; promptLabel: string }
  | { kind: 'delivery'; delivery: Stage3DeliverySpotDef; dist: number; promptLabel: string }
  | { kind: 'activity_station'; station: Stage3ActivityStationDef; dist: number; promptLabel: string }
  | { kind: 'elevator_pad'; pad: Stage3ElevatorPadDef; dist: number; promptLabel: string }
  | { kind: 'wardrobe_mirror'; spot: typeof STAGE3_WARDROBE_MIRROR_SPOT; dist: number; promptLabel: string }
  | { kind: 'placed_building'; instance: PlacedBuildingInstance; dist: number; promptLabel: string }
  | { kind: 'landmark'; landmark: StageLandmarkDef; dist: number; promptLabel: string }
  | { kind: 'vehicle'; vehicle: VehicleRuntimeState; dist: number; promptLabel: string }
  | { kind: 'stage_transition'; targetStage: 2; label: string; dist: number; promptLabel: string };

export function findNearestStage3Interactable(
  px: number,
  py: number,
  pz: number,
  opts: {
    collectedPickups: string[];
    collectedArtifacts: string[];
    completedDeliveries: string[];
    placedBuildings: PlacedBuildingInstance[];
    vehicles: VehicleRuntimeState[];
  }
): Stage3Interactable | null {
  let best: Stage3Interactable | null = null;
  let bestDist = Infinity;

  const tryCandidate = (cand: Stage3Interactable, maxRange: number) => {
    if (cand.dist <= maxRange && cand.dist < bestDist) {
      best = cand;
      bestDist = cand.dist;
    }
  };

  // 1. Elevator Pads (match current elevation!)
  for (const pad of STAGE3_ELEVATOR_PADS) {
    if (Math.abs(py - pad.fromY) > 2.5) continue;
    const d = Math.hypot(px - pad.x, pz - pad.z);
    tryCandidate(
      { kind: 'elevator_pad', pad, dist: d, promptLabel: `[E] ${pad.targetLabel}` },
      4.2
    );
  }

  // 2. Activity Stations (ground or rooftop!)
  for (const st of STAGE3_ACTIVITY_STATIONS) {
    if (Math.abs(py - st.y) > 2.8) continue;
    const d = Math.hypot(px - st.x, pz - st.z);
    tryCandidate(
      { kind: 'activity_station', station: st, dist: d, promptLabel: `[E] ${st.name}` },
      4.4
    );
  }

  // 3. Collectibles (support ground, skywalk 6.5m, ecodome 10.5m, menara 14.2m)
  for (const col of STAGE3_COLLECTIBLES) {
    if (opts.collectedArtifacts.includes(col.id)) continue;
    const colY = col.yOffset ?? 0;
    if (Math.abs(py - colY) > 3.2) continue;
    const d = Math.hypot(px - col.x, pz - col.z);
    tryCandidate(
      {
        kind: 'collectible',
        collectible: col,
        dist: d,
        promptLabel: `[E] Kumpulkan (${col.rarity}): ${col.name}`,
      },
      3.5
    );
  }

  if (py > 4.2) {
    return best;
  }

  // 4. High-Speed Train Return Station (Stage 3 -> Stage 2)
  const hstDist = Math.hypot(px - 0, pz - -86);
  tryCandidate(
    {
      kind: 'stage_transition',
      targetStage: 2,
      label: 'Kereta Cepat Nusantara -> Kota Industri Global (Stage 2)',
      dist: hstDist,
      promptLabel: '[E] Naik Kereta Cepat Kembali ke Stage 2',
    },
    5.4
  );

  // 5. World Pickups
  for (const pk of STAGE3_WORLD_PICKUPS) {
    if (opts.collectedPickups.includes(pk.id)) continue;
    const d = Math.hypot(px - pk.x, pz - pk.z);
    tryCandidate({ kind: 'pickup', pickup: pk, dist: d, promptLabel: `[E] Ambil ${pk.label}` }, 3.4);
  }

  // 6. Delivery Spots
  for (const del of STAGE3_DELIVERY_SPOTS) {
    const d = Math.hypot(px - del.x, pz - del.z);
    tryCandidate({ kind: 'delivery', delivery: del, dist: d, promptLabel: `[E] ${del.label}` }, 4.0);
  }

  // 7. Wardrobe Mirror
  const mirrorDist = Math.hypot(px - STAGE3_WARDROBE_MIRROR_SPOT.x, pz - STAGE3_WARDROBE_MIRROR_SPOT.z);
  tryCandidate(
    {
      kind: 'wardrobe_mirror',
      spot: STAGE3_WARDROBE_MIRROR_SPOT,
      dist: mirrorDist,
      promptLabel: '[E] Studio Busana Futuristik 3D',
    },
    3.6
  );

  // 8. NPCs
  for (const npc of getStage3Npcs()) {
    const d = Math.hypot(px - npc.x, pz - npc.z);
    tryCandidate({ kind: 'npc', npc, dist: d, promptLabel: `[E] Bicara dengan ${npc.name}` }, 4.2);
  }

  // 9. Placed Buildings
  for (const pb of opts.placedBuildings) {
    const d = Math.hypot(px - pb.x, pz - pb.z);
    const def = BUILDING_CATALOG.find((b) => b.id === pb.buildingId);
    tryCandidate(
      {
        kind: 'placed_building',
        instance: pb,
        dist: d,
        promptLabel: `[E] Kelola ${def?.name ?? pb.buildingId} (Lv ${pb.level})`,
      },
      4.5
    );
  }

  // 10. Landmarks
  for (const lm of getStage3Landmarks()) {
    if (lm.id === 'lm-s3-stage2-terminal') continue;
    const d = Math.hypot(px - lm.x, pz - lm.z);
    tryCandidate(
      { kind: 'landmark', landmark: lm, dist: d, promptLabel: `[E] Inspeksi ${lm.label}` },
      lm.halfW + 3.6
    );
  }

  // 11. Vehicles
  for (const v of opts.vehicles) {
    const d = Math.hypot(px - v.x, pz - v.z);
    tryCandidate({ kind: 'vehicle', vehicle: v, dist: d, promptLabel: `[F] Kendarai ${v.def.name}` }, 4.2);
  }

  return best;
}

export function updateStage3Camera(
  cam: ThirdPersonCamState,
  player: Player3DState,
  colliders: AabbCollider[],
  dtSeconds: number
): ThirdPersonCamState {
  const dt = Math.min(Math.max(dtSeconds, 0), 0.05);
  const followAlpha = 1 - Math.exp(-12 * dt);

  const desiredTargetX = player.x;
  const desiredTargetY = player.y + 1.65;
  const desiredTargetZ = player.z;

  const targetX = cam.targetX + (desiredTargetX - cam.targetX) * followAlpha;
  const targetY = cam.targetY + (desiredTargetY - cam.targetY) * followAlpha;
  const targetZ = cam.targetZ + (desiredTargetZ - cam.targetZ) * followAlpha;

  const insideBuilding = player.y < 4.5 && getStage3EnterableBuildingAt(player.x, player.z);
  const minPitch = insideBuilding ? 0.52 : 0.14;
  const clampedPitch = Math.max(minPitch, Math.min(1.12, cam.pitch));
  const clampedDist = Math.max(5.5, Math.min(24.0, cam.distance));

  const dirX = -Math.sin(cam.yaw) * Math.cos(clampedPitch);
  const dirY = Math.sin(clampedPitch);
  const dirZ = -Math.cos(cam.yaw) * Math.cos(clampedPitch);

  let effectiveDist = clampedDist;
  if (!insideBuilding && player.y < 12.0) {
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const probeDist = clampedDist * (i / steps);
      const px = targetX + dirX * probeDist;
      const py = targetY + dirY * probeDist;
      const pz = targetZ + dirZ * probeDist;
      let hit = false;
      for (const box of colliders) {
        if (box.kind === 'water') continue;
        if (
          px >= box.minX - 0.35 &&
          px <= box.maxX + 0.35 &&
          pz >= box.minZ - 0.35 &&
          pz <= box.maxZ + 0.35 &&
          py < box.maxY + 0.25
        ) {
          hit = true;
          break;
        }
      }
      if (hit) {
        effectiveDist = Math.max(3.8, probeDist - 0.6);
        break;
      }
    }
  } else if (insideBuilding) {
    effectiveDist = Math.min(clampedDist, 10.5);
  }

  const camX = targetX + dirX * effectiveDist;
  const rawCamY = targetY + dirY * effectiveDist;
  const camZ = targetZ + dirZ * effectiveDist;
  const floorUnderCam = stage3GroundHeightAt(camX, camZ, player.y);
  const camY = Math.max(floorUnderCam + 0.8, rawCamY);

  return {
    yaw: cam.yaw,
    pitch: clampedPitch,
    distance: clampedDist,
    x: camX,
    y: camY,
    z: camZ,
    targetX,
    targetY,
    targetZ,
  };
}
