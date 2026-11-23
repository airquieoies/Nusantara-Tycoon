import { BUILDING_CATALOG } from './data/bermainData';
import { PlacedBuildingInstance } from './stage1WorldLogic';
import {
  CollectibleDef,
  DeliverySpotDef,
  RideableVehicleDef,
  WorldPickupDef,
} from './stage1Data';
import {
  findStage2DistrictAt,
  STAGE2_COLLECTIBLES,
  STAGE2_DELIVERY_SPOTS,
  STAGE2_ENTERABLE_BUILDINGS,
  STAGE2_FACTORY_STATIONS,
  STAGE2_VEHICLES,
  STAGE2_WARDROBE_MIRROR_SPOT,
  STAGE2_WORLD_PICKUPS,
  Stage2EnterableBuildingDef,
  Stage2FactoryStationDef,
} from './stage2Data';
import {
  AabbCollider,
  CrowdPatrolDef,
  GRAVITY,
  JUMP_VELOCITY,
  NpcWaypoint,
  PIER_HEIGHT,
  PLAYER_RADIUS,
  Player3DState,
  PlayerMoveInput,
  SceneryBuildingDef,
  SPRINT_SPEED,
  StageLandmarkDef,
  WALK_SPEED,
} from './world3dPhysics';
import { ShipDeckZone, VehicleRuntimeState } from './stage1Physics';

export const STAGE2_MIN_X = -114.0;
export const STAGE2_MAX_X = 152.0;
export const STAGE2_MIN_Z = -94.0;
export const STAGE2_MAX_Z = 94.0;

export const STAGE2_SHORELINE_X = 54.0;
export const STAGE2_RAIL_X = 36.0;

export const STAGE2_SHIP_DECKS: (Omit<ShipDeckZone, 'id'> & { id: 'ship-stage1-return' })[] = [
  {
    id: 'ship-stage1-return',
    name: 'Kapal Ekspres Industri (Rute Stage 1)',
    minX: 64.0,
    maxX: 85.0,
    minZ: 5.5,
    maxZ: 12.2,
    deckY: 2.05,
    gangway: {
      minX: 71.0,
      maxX: 75.5,
      minZ: 3.6,
      maxZ: 5.8,
      startZ: 3.8,
      endZ: 5.6,
    },
  },
];

export function stage2GroundHeightAt(x: number, z: number): number {
  // 1. Return Ship Deck & Gangway
  for (const ship of STAGE2_SHIP_DECKS) {
    const gw = ship.gangway;
    if (x >= gw.minX && x <= gw.maxX && z >= gw.minZ && z <= gw.maxZ) {
      const t = Math.max(0, Math.min(1, (z - gw.startZ) / (gw.endZ - gw.startZ)));
      return PIER_HEIGHT + t * (ship.deckY - PIER_HEIGHT);
    }
    if (x >= ship.minX && x <= ship.maxX && z >= ship.minZ && z <= ship.maxZ) {
      return ship.deckY;
    }
  }

  // 2. Industrial Harbor Pier (ramp from x=51.5..54.5)
  const onMainPier = Math.abs(z) <= 4.4 && x >= 51.5 && x <= 86.0;
  const onCargoPier = z >= 24.0 && z <= 31.0 && x >= 51.5 && x <= 76.0;
  if (onMainPier || onCargoPier) {
    if (x < 54.5) {
      return ((x - 51.5) / 3.0) * PIER_HEIGHT;
    }
    return PIER_HEIGHT;
  }

  // 3. Arched River Bridges (West Bridge z=28, South Bridge x=10)
  if (x >= -65.0 && x <= -51.0 && Math.abs(z - 28.0) <= 3.6) {
    const t = (x + 65.0) / 14.0;
    return Math.sin(t * Math.PI) * 1.45;
  }
  if (z >= 66.0 && z <= 81.0 && Math.abs(x - 10.0) <= 3.8) {
    const t = (z - 66.0) / 15.0;
    return Math.sin(t * Math.PI) * 1.45;
  }

  // 4. Enterable Building Interior Thresholds
  for (const b of STAGE2_ENTERABLE_BUILDINGS) {
    if (Math.abs(x - b.x) <= b.halfW - 0.15 && Math.abs(z - b.z) <= b.halfD - 0.15) {
      return 0.22;
    }
  }

  // 5. Industrial River Channel
  const inNorthSouthRiver = x >= -61.5 && x <= -54.5 && z >= 12.0 && z <= 77.0;
  const inEastWestRiver = z >= 70.0 && z <= 77.0 && x >= -61.5 && x <= STAGE2_SHORELINE_X;
  if (inNorthSouthRiver || inEastWestRiver) {
    return -0.5;
  }

  // 6. Seafloor east of shoreline
  if (x > STAGE2_SHORELINE_X) {
    return -0.35;
  }

  return 0;
}

export function getStage2EnterableBuildingAt(
  x: number,
  z: number
): Stage2EnterableBuildingDef | null {
  for (const b of STAGE2_ENTERABLE_BUILDINGS) {
    if (Math.abs(x - b.x) <= b.halfW - 0.25 && Math.abs(z - b.z) <= b.halfD - 0.25) {
      return b;
    }
  }
  return null;
}

export function getStage2BoardedShipId(
  x: number,
  z: number,
  y: number
): 'ship-stage1-return' | null {
  if (y < 1.5) return null;
  for (const ship of STAGE2_SHIP_DECKS) {
    if (x >= ship.minX && x <= ship.maxX && z >= ship.minZ && z <= ship.maxZ) {
      return ship.id;
    }
  }
  return null;
}

export function getStage2Npcs(): NpcWaypoint[] {
  return [
    {
      id: 's2-npc-aditya',
      name: 'Aditya',
      role: 'Perencana Kota Industri (Hiperglobalis)',
      characterId: 'aditya',
      x: 48.5,
      z: -5.0,
      facingYaw: Math.PI * 0.25,
      dialogue:
        'Selamat datang di Stage 2: Kota Industri Nusantara! Kini kapal uap, rel logistik, dan pabrik mekanis mempercepat ekonomi kota. Kunjungi Kawasan Industri di barat!',
      missionHint: 'Misi 1 Stage 2: Jelajahi Kawasan Industri Barat & temui Mandor Pak Hendra.',
      recommendedCategory: 'industri',
      recommendedBuildingId: 'pabrik-tekstil',
    },
    {
      id: 's2-npc-mandor',
      name: 'Pak Hendra',
      role: 'Mandor Produksi Pabrik',
      x: -53.5,
      z: -24.0,
      facingYaw: Math.PI / 2,
      dialogue:
        'Lini mesin tenun siap beroperasi! Ambil Bal Kapas di depan pabrik, masuk ke Pabrik Tekstil, lalu jalankan Panel Mesin untuk menghasilkan Tekstil Batik Industri.',
      missionHint: 'Misi 2 Stage 2: Olah Kapas -> Tekstil Jadi di Panel Mesin Pabrik.',
      recommendedCategory: 'industri',
      recommendedBuildingId: 'pabrik-pangan',
    },
    {
      id: 's2-npc-naya',
      name: 'Naya',
      role: 'Penggerak Ekonomi & Rantai Pasok (Transformasionalis)',
      characterId: 'naya',
      x: -4.0,
      z: 34.0,
      facingYaw: Math.PI,
      dialogue:
        'Produksi pabrik hanya bermakna jika rantai pasoknya lancar dan produk lokal kita berdaya saing! Setorkan barang jadi ke Gudang Logistik, lalu jual di Pasar Grosir Utara.',
      missionHint: 'Misi 3 Stage 2: Setor ke Gudang Logistik & jual ke Pasar Grosir Komersial.',
      recommendedCategory: 'perdagangan',
      recommendedBuildingId: 'gudang-logistik-besar',
    },
    {
      id: 's2-npc-pekerja',
      name: 'Kang Dani',
      role: 'Perwakilan Serikat Pekerja',
      x: -4.5,
      z: 11.0,
      facingYaw: -Math.PI * 0.2,
      dialogue:
        'Pabrik bekerja 3 shift sehari, tetapi keselamatan dan kesehatan buruh sering terabaikan! Bantu kirim Paket Perlengkapan K3 ke Klinik Pekerja di dekat sini.',
      missionHint: 'Misi 4 Stage 2: Ambil Paket K3 & antarkan ke Klinik Kesejahteraan Pekerja.',
      recommendedCategory: 'masyarakat',
      recommendedBuildingId: 'perumahan-pekerja',
    },
    {
      id: 's2-npc-kepala-gudang',
      name: 'Ibu Mira',
      role: 'Kepala Gudang & Armada Logistik',
      x: -18.5,
      z: 42.0,
      facingYaw: 0,
      dialogue:
        'Kapasitas gudang dan transportasi kota harus ikut tumbuh! Bangun fasilitas Stage 2 lewat Menu Bangun [B] serta tingkatkan ke Level 2, dan coba kendarai truk maupun forklift.',
      missionHint: 'Misi 5 Stage 2: Bangun 1 fasilitas baru, Upgrade Lv 2 & kunjungi Balai Kota.',
      recommendedCategory: 'perdagangan',
      recommendedBuildingId: 'stasiun-kereta-logistik',
    },
    {
      id: 's2-npc-laras',
      name: 'Laras',
      role: 'Peneliti Dampak Sosial & Ekologi (Skeptis)',
      characterId: 'laras',
      x: -48.0,
      z: 28.0,
      facingYaw: -Math.PI * 0.5,
      dialogue:
        'Industrialisasi tanpa regulasi mencemari Sungai Industri! Periksa Sensor Kualitas Air bersama Dr. Sinta, lalu pasang Filter Bio-Limbah di Pusat Daur Ulang barat daya.',
      missionHint: 'Misi 6 Stage 2: Inspeksi Sensor Sungai & pasang Filter Bio-Limbah.',
      recommendedCategory: 'masyarakat',
      recommendedBuildingId: 'instalasi-pengolah-air',
    },
    {
      id: 's2-npc-lingkungan',
      name: 'Dr. Sinta',
      role: 'Ahli Pengolahan Air & Lingkungan',
      x: -64.5,
      z: 44.0,
      facingYaw: Math.PI / 2,
      dialogue:
        'Setiap pabrik yang beroperasi menurunkan Kualitas Lingkungan jika tidak diimbangi Instalasi Pengolah Air dan Pusat Daur Ulang!',
      missionHint: 'Pasang Bio-Filter di dalam Pusat Daur Ulang untuk memulihkan sungai.',
      recommendedCategory: 'budaya',
      recommendedBuildingId: 'fasilitas-daur-ulang',
    },
    {
      id: 's2-npc-kapten-ekspres',
      name: 'Kapten Arman',
      role: 'Nakhoda Kapal Ekspres Nusantara',
      x: 57.5,
      z: 2.5,
      facingYaw: -Math.PI * 0.65,
      dialogue:
        'Kapal Ekspres Industri siap membawamu pulang-pergi ke Pelabuhan Kota Perdagangan Stage 1 kapan saja! Naiki gangway ke dek kapal atau periksa Terminal Pelabuhan.',
      missionHint: 'Naiki dek Kapal Ekspres [E] jika ingin kembali berlayar ke Stage 1.',
    },
    {
      id: 's2-npc-desainer',
      name: 'Mbak Tari',
      role: 'Desainer Seragam K3 & Busana Industri',
      x: 10.2,
      z: 12.2,
      facingYaw: Math.PI * 0.1,
      dialogue:
        'Di era industri, helm keselamatan, rompi K3, dan seragam kerja juga menjadi bagian dari identitas profesional warga. Yuk coba Studio 3D di Butik!',
      missionHint: 'Masuk ke Butik Seragam & ubah tampilanmu di Studio Karakter [C].',
    },
  ];
}

export function getStage2Landmarks(): StageLandmarkDef[] {
  return [
    {
      id: 'lm-s2-ship-return',
      label: 'Kapal Ekspres Industri (Ke Stage 1)',
      kind: 'ship_dock',
      x: 73.2,
      z: 4.0,
      halfW: 3.5,
      halfD: 2.5,
      height: 5.2,
      yaw: 0,
      description:
        'Kapal penumpang cepat yang menghubungkan Dermaga Kota Industri (Stage 2) kembali ke Kota Perdagangan Nusantara (Stage 1).',
      sociologyNote:
        'Integrasi antar-kota memperkuat arus pertukaran komoditas bahan mentah dari Stage 1 dan barang manufaktur dari Stage 2.',
    },
    {
      id: 'lm-s2-derek-industri',
      label: 'Derek Peti Kemas Pelabuhan Industri',
      kind: 'harbor_crane',
      x: 66.0,
      z: -2.0,
      halfW: 2.2,
      halfD: 2.0,
      height: 7.5,
      yaw: 0,
      description:
        'Derek mekanis baja yang mengangkat kontainer kargo langsung dari kereta api barang menuju kapal ekspor.',
      sociologyNote:
        'Mekanisasi bongkar muat melipatgandakan kapasitas perdagangan sekaligus menuntut peningkatan keterampilan operator lokal.',
    },
    {
      id: 'lm-s2-sungai-sensor',
      label: 'Sensor Kualitas Air Sungai Industri',
      kind: 'water_monitor',
      x: -54.0,
      z: 34.0,
      halfW: 1.5,
      halfD: 1.5,
      height: 3.6,
      yaw: 0,
      description:
        'Pos pemantau tingkat kekeruhan, suhu, dan kadar limbah cair dari kawasan pabrik barat.',
      sociologyNote:
        'Industrialisasi tidak terkendali menimbulkan eksternalitas negatif yang merugikan kesehatan masyarakat hilir sungai.',
    },
    {
      id: 'lm-s2-pembangkit',
      label: 'Turbin & Pembangkit Listrik Uap Kota',
      kind: 'generator',
      x: -44.0,
      z: -56.0,
      halfW: 4.5,
      halfD: 4.0,
      height: 8.2,
      yaw: 0,
      description:
        'Pusat energi mekanis dan generator listrik penggerak mesin pabrik serta jaringan rel kota.',
      sociologyNote:
        'Penguasaan infrastruktur energi menentukan kemandirian kota industri agar tidak bergantung pada pasokan luar.',
    },
    {
      id: 'lm-s2-stage3-terminal',
      label: 'Terminal Kereta Cepat Masa Depan (Stage 3 Terkunci)',
      kind: 'portal',
      x: -4.0,
      z: -74.0,
      halfW: 5.5,
      halfD: 3.6,
      height: 6.5,
      yaw: 0,
      description:
        'Proyek stasiun kaca futuristik untuk Kota Digital Tanpa Batas (Stage 3). Saat ini masih dalam tahap perancangan dan TERKUNCI.',
      sociologyNote:
        'Stage 3 akan menghadirkan jaringan smart city, otomatisasi digital, dan glokalisasi modern pada pembaruan berikutnya.',
    },
  ];
}

export function getStage2SceneryBuildings(): SceneryBuildingDef[] {
  return [
    // Kawasan Industri & Pabrik Berat (NW: x -106..-40, z -86..6)
    { id: 's2-sc-fac-1', kind: 'brick_factory', x: -86, z: -26, halfW: 5.6, halfD: 4.6, height: 6.2, yaw: 0, variant: 0 },
    { id: 's2-sc-fac-2', kind: 'brick_foundry', x: -86, z: -48, halfW: 5.6, halfD: 4.6, height: 6.8, yaw: Math.PI / 2, variant: 1 },
    { id: 's2-sc-fac-3', kind: 'brick_factory', x: -64, z: -50, halfW: 5.2, halfD: 4.4, height: 5.8, yaw: 0, variant: 2 },
    { id: 's2-sc-fac-4', kind: 'brick_foundry', x: -88, z: -4, halfW: 5.4, halfD: 4.5, height: 6.0, yaw: Math.PI, variant: 0 },
    { id: 's2-sc-fac-5', kind: 'cargo_depot', x: -46, z: -74, halfW: 4.5, halfD: 3.8, height: 4.6, yaw: 0, variant: 1 },
    { id: 's2-sc-fac-6', kind: 'brick_factory', x: -72, z: -74, halfW: 5.4, halfD: 4.3, height: 5.8, yaw: Math.PI, variant: 1 },
    { id: 's2-sc-fac-7', kind: 'cargo_depot', x: -94, z: -70, halfW: 4.8, halfD: 4.0, height: 4.8, yaw: Math.PI / 2, variant: 0 },
    { id: 's2-sc-pwr-1', kind: 'brick_foundry', x: -44, z: -56, halfW: 4.2, halfD: 3.8, height: 5.8, yaw: 0, variant: 2 },

    // Kawasan Komersial & Perdagangan (North-Center: x -30..30, z -84..-28)
    { id: 's2-sc-com-1', kind: 'corner_shop', x: 14, z: -44, halfW: 4.0, halfD: 3.4, height: 4.5, yaw: Math.PI, variant: 0 },
    { id: 's2-sc-com-2', kind: 'corner_shop', x: 24, z: -44, halfW: 3.8, halfD: 3.4, height: 4.8, yaw: -Math.PI / 2, variant: 1 },
    { id: 's2-sc-com-3', kind: 'worker_rowhouse', x: -24, z: -44, halfW: 4.4, halfD: 3.4, height: 5.4, yaw: 0, variant: 0 },
    { id: 's2-sc-com-4', kind: 'worker_rowhouse', x: -12, z: -44, halfW: 4.4, halfD: 3.4, height: 5.6, yaw: 0, variant: 1 },
    { id: 's2-sc-com-5', kind: 'corner_shop', x: 22, z: -60, halfW: 4.2, halfD: 3.4, height: 5.0, yaw: Math.PI, variant: 2 },
    { id: 's2-sc-com-6', kind: 'worker_rowhouse', x: -24, z: -62, halfW: 4.4, halfD: 3.6, height: 5.8, yaw: Math.PI / 2, variant: 2 },
    { id: 's2-sc-com-7', kind: 'clock_tower', x: 12, z: -62, halfW: 2.4, halfD: 2.4, height: 8.5, yaw: 0, variant: 0 },

    // Kawasan Permukiman Pekerja & Pusat (Center: x -32..30, z -24..24)
    { id: 's2-sc-res-1', kind: 'worker_rowhouse', x: -28, z: -15, halfW: 4.2, halfD: 3.2, height: 4.8, yaw: Math.PI / 2, variant: 0 },
    { id: 's2-sc-res-2', kind: 'worker_rowhouse', x: -28, z: 15, halfW: 4.2, halfD: 3.2, height: 4.8, yaw: Math.PI / 2, variant: 1 },
    { id: 's2-sc-res-3', kind: 'worker_rowhouse', x: 16, z: -15, halfW: 4.2, halfD: 3.2, height: 5.0, yaw: 0, variant: 2 },
    { id: 's2-sc-res-4', kind: 'corner_shop', x: 26, z: -15, halfW: 3.4, halfD: 3.0, height: 4.2, yaw: -Math.PI / 2, variant: 0 },
    { id: 's2-sc-res-5', kind: 'worker_rowhouse', x: 26, z: 16, halfW: 3.6, halfD: 3.2, height: 4.6, yaw: -Math.PI / 2, variant: 3 },
    { id: 's2-sc-park-1', kind: 'pocket_park', x: 0, z: 0, halfW: 3.6, halfD: 3.6, height: 0.4, yaw: 0, variant: 0 },

    // Kawasan Logistik & Gudang (South: x -32..32, z 28..66)
    { id: 's2-sc-log-1', kind: 'cargo_depot', x: -26, z: 60, halfW: 4.5, halfD: 3.6, height: 4.5, yaw: 0, variant: 0 },
    { id: 's2-sc-log-2', kind: 'cargo_depot', x: 14, z: 52, halfW: 4.6, halfD: 3.8, height: 4.8, yaw: Math.PI, variant: 1 },
    { id: 's2-sc-log-3', kind: 'cargo_depot', x: 25, z: 36, halfW: 4.2, halfD: 3.4, height: 4.4, yaw: -Math.PI / 2, variant: 2 },
    { id: 's2-sc-log-4', kind: 'brick_factory', x: -24, z: 34, halfW: 4.2, halfD: 3.4, height: 4.6, yaw: Math.PI / 2, variant: 1 },
    { id: 's2-sc-log-5', kind: 'cargo_depot', x: -22, z: 82, halfW: 4.8, halfD: 3.8, height: 4.8, yaw: Math.PI, variant: 0 },
    { id: 's2-sc-log-6', kind: 'cargo_depot', x: 24, z: 82, halfW: 4.8, halfD: 3.8, height: 4.8, yaw: Math.PI, variant: 1 },

    // Kawasan Lingkungan & Sungai (SW: x -106..-64, z 16..86)
    { id: 's2-sc-env-1', kind: 'pocket_park', x: -88, z: 22, halfW: 4.5, halfD: 4.2, height: 0.4, yaw: 0, variant: 1 },
    { id: 's2-sc-env-2', kind: 'cargo_depot', x: -92, z: 46, halfW: 4.4, halfD: 3.6, height: 4.2, yaw: Math.PI / 2, variant: 2 },
    { id: 's2-sc-env-3', kind: 'pocket_park', x: -84, z: 68, halfW: 5.0, halfD: 4.2, height: 0.4, yaw: 0, variant: 0 },
    { id: 's2-sc-env-4', kind: 'worker_rowhouse', x: -42, z: 82, halfW: 4.2, halfD: 3.2, height: 4.5, yaw: Math.PI, variant: 1 },

    // Kawasan Transportasi & Pelabuhan (East: x 40..52, z -84..84)
    { id: 's2-sc-tr-1', kind: 'cargo_depot', x: 44, z: 16, halfW: 4.0, halfD: 3.4, height: 4.4, yaw: -Math.PI / 2, variant: 0 },
    { id: 's2-sc-tr-2', kind: 'cargo_depot', x: 44, z: 36, halfW: 4.0, halfD: 3.4, height: 4.4, yaw: -Math.PI / 2, variant: 1 },
    { id: 's2-sc-tr-3', kind: 'corner_shop', x: 44, z: -42, halfW: 3.8, halfD: 3.2, height: 4.6, yaw: -Math.PI / 2, variant: 1 },
    { id: 's2-sc-tr-4', kind: 'brick_factory', x: 44, z: -64, halfW: 4.4, halfD: 3.6, height: 5.2, yaw: -Math.PI / 2, variant: 2 },
    { id: 's2-sc-tr-5', kind: 'cargo_depot', x: 44, z: 56, halfW: 4.0, halfD: 3.4, height: 4.4, yaw: -Math.PI / 2, variant: 2 },
  ];
}

export function getStage2CrowdPatrols(): CrowdPatrolDef[] {
  return [
    { id: 's2-cw-1', role: 'worker', shirtColor: 0x1d4ed8, pantsColor: 0x1e293b, hatColor: 0xfacc15, prop: 'crate', speed: 2.3, pauseSeconds: 1.2, waypoints: [{ x: -46, z: -20 }, { x: -46, z: 4 }, { x: -34, z: 4 }, { x: -34, z: -20 }] },
    { id: 's2-cw-2', role: 'engineer', shirtColor: 0xea580c, pantsColor: 0x334155, hatColor: 0xffffff, prop: 'wrench', speed: 2.4, pauseSeconds: 1.4, waypoints: [{ x: -50, z: -30 }, { x: -34, z: -30 }, { x: -34, z: -48 }, { x: -50, z: -48 }] },
    { id: 's2-cw-3', role: 'worker', shirtColor: 0x0284c7, pantsColor: 0x1e293b, hatColor: 0xfacc15, prop: 'crate', speed: 2.1, pauseSeconds: 1.1, waypoints: [{ x: -75, z: -12 }, { x: -52, z: -12 }, { x: -52, z: 8 }, { x: -75, z: 8 }] },
    { id: 's2-cw-4', role: 'porter', shirtColor: 0xd97706, pantsColor: 0x292524, hatColor: 0xfde047, prop: 'crate', speed: 2.0, pauseSeconds: 1.3, waypoints: [{ x: -20, z: 40 }, { x: 8, z: 40 }, { x: 8, z: 58 }, { x: -20, z: 58 }] },
    { id: 's2-cw-5', role: 'worker', shirtColor: 0xf97316, pantsColor: 0x0f172a, hatColor: 0xfacc15, prop: 'wrench', speed: 2.2, pauseSeconds: 1.0, waypoints: [{ x: 46, z: -10 }, { x: 46, z: 10 }, { x: 58, z: 10 }, { x: 58, z: -10 }] },
    { id: 's2-cw-6', role: 'engineer', shirtColor: 0x0f766e, pantsColor: 0x334155, hatColor: 0xe2e8f0, prop: 'tablet', speed: 2.3, pauseSeconds: 1.6, waypoints: [{ x: -64, z: 30 }, { x: -44, z: 30 }, { x: -44, z: 52 }, { x: -64, z: 52 }] },
    { id: 's2-cw-7', role: 'buyer', shirtColor: 0x7c3aed, pantsColor: 0x1e293b, hatColor: 0xfef3c7, prop: 'basket', speed: 2.2, pauseSeconds: 1.8, waypoints: [{ x: -16, z: -32 }, { x: 18, z: -32 }, { x: 18, z: -50 }, { x: -16, z: -50 }] },
    { id: 's2-cw-8', role: 'citizen', shirtColor: 0x10b981, pantsColor: 0x334155, hatColor: 0xfde68a, prop: 'satchel', speed: 2.0, pauseSeconds: 1.5, waypoints: [{ x: -20, z: -4 }, { x: 20, z: -4 }, { x: 20, z: 8 }, { x: -20, z: 8 }] },
    { id: 's2-cw-9', role: 'worker', shirtColor: 0x334155, pantsColor: 0x0f172a, hatColor: 0xfacc15, prop: 'wrench', speed: 2.3, pauseSeconds: 1.2, waypoints: [{ x: 30, z: -26 }, { x: 30, z: 26 }, { x: 48, z: 26 }, { x: 48, z: -26 }] },
    { id: 's2-cw-10', role: 'porter', shirtColor: 0xb45309, pantsColor: 0x1e293b, hatColor: 0xfef3c7, prop: 'crate', speed: 1.9, pauseSeconds: 1.5, waypoints: [{ x: 54, z: -2 }, { x: 76, z: -2 }, { x: 76, z: 2 }, { x: 54, z: 2 }] },
    { id: 's2-cw-11', role: 'shopkeeper', shirtColor: 0xbe123c, pantsColor: 0x292524, hatColor: 0xfef08a, prop: 'none', behavior: 'tend_stall', speed: 1.7, pauseSeconds: 2.5, waypoints: [{ x: 6, z: -38 }, { x: 18, z: -38 }] },
    { id: 's2-cw-12', role: 'engineer', shirtColor: 0x0369a1, pantsColor: 0x1e293b, hatColor: 0xf8fafc, prop: 'tablet', speed: 2.2, pauseSeconds: 1.4, waypoints: [{ x: -10, z: -64 }, { x: 10, z: -64 }, { x: 10, z: -54 }, { x: -10, z: -54 }] },
    { id: 's2-cw-13', role: 'citizen', shirtColor: 0x15803d, pantsColor: 0x334155, hatColor: 0xfde68a, prop: 'none', speed: 2.1, pauseSeconds: 1.3, waypoints: [{ x: -30, z: 2 }, { x: -30, z: 22 }, { x: -6, z: 22 }, { x: -6, z: 2 }] },
    { id: 's2-cw-14', role: 'worker', shirtColor: 0x1e40af, pantsColor: 0x0f172a, hatColor: 0xfacc15, prop: 'crate', speed: 2.3, pauseSeconds: 1.1, waypoints: [{ x: 2, z: 16 }, { x: 26, z: 16 }, { x: 26, z: 32 }, { x: 2, z: 32 }] },
    { id: 's2-cw-15', role: 'buyer', shirtColor: 0x0d9488, pantsColor: 0x1e293b, hatColor: 0xfef3c7, prop: 'basket', speed: 2.0, pauseSeconds: 1.9, waypoints: [{ x: 16, z: -6 }, { x: 34, z: -6 }, { x: 34, z: -20 }, { x: 16, z: -20 }] },
    { id: 's2-cw-16', role: 'engineer', shirtColor: 0xca8a04, pantsColor: 0x1e293b, hatColor: 0xf8fafc, prop: 'tablet', speed: 2.1, pauseSeconds: 1.7, waypoints: [{ x: -76, z: 32 }, { x: -66, z: 32 }, { x: -66, z: 54 }, { x: -76, z: 54 }] },
    { id: 's2-cw-17', role: 'worker', shirtColor: 0xdc2626, pantsColor: 0x1e293b, hatColor: 0xfacc15, prop: 'wrench', speed: 2.2, pauseSeconds: 1.3, waypoints: [{ x: -40, z: -42 }, { x: -24, z: -42 }, { x: -24, z: -24 }, { x: -40, z: -24 }] },
    { id: 's2-cw-18', role: 'citizen', shirtColor: 0x4f46e5, pantsColor: 0x334155, hatColor: 0xfef3c7, prop: 'satchel', speed: 2.0, pauseSeconds: 1.5, waypoints: [{ x: -12, z: -20 }, { x: 12, z: -20 }, { x: 12, z: -8 }, { x: -12, z: -8 }] },
  ];
}

export function buildStage2WorldColliders(
  placedBuildings: PlacedBuildingInstance[]
): AabbCollider[] {
  const colliders: AabbCollider[] = [];

  // 1. Enterable Buildings (4 walls with open doorway gap!)
  for (const b of STAGE2_ENTERABLE_BUILDINGS) {
    const wt = 0.42;
    const minX = b.x - b.halfW;
    const maxX = b.x + b.halfW;
    const minZ = b.z - b.halfD;
    const maxZ = b.z + b.halfD;
    const h = b.wallHeight;

    if (b.doorSide === 'north') {
      colliders.push({ id: `${b.id}-nl`, minX, maxX: b.x - b.doorHalfWidth, minZ, maxZ: minZ + wt, maxY: h, kind: 'building' });
      colliders.push({ id: `${b.id}-nr`, minX: b.x + b.doorHalfWidth, maxX, minZ, maxZ: minZ + wt, maxY: h, kind: 'building' });
    } else {
      colliders.push({ id: `${b.id}-n`, minX, maxX, minZ, maxZ: minZ + wt, maxY: h, kind: 'building' });
    }

    if (b.doorSide === 'south') {
      colliders.push({ id: `${b.id}-sl`, minX, maxX: b.x - b.doorHalfWidth, minZ: maxZ - wt, maxZ, maxY: h, kind: 'building' });
      colliders.push({ id: `${b.id}-sr`, minX: b.x + b.doorHalfWidth, maxX, minZ: maxZ - wt, maxZ, maxY: h, kind: 'building' });
    } else {
      colliders.push({ id: `${b.id}-s`, minX, maxX, minZ: maxZ - wt, maxZ, maxY: h, kind: 'building' });
    }

    if (b.doorSide === 'west') {
      colliders.push({ id: `${b.id}-wt`, minX, maxX: minX + wt, minZ, maxZ: b.z - b.doorHalfWidth, maxY: h, kind: 'building' });
      colliders.push({ id: `${b.id}-wb`, minX, maxX: minX + wt, minZ: b.z + b.doorHalfWidth, maxZ, maxY: h, kind: 'building' });
    } else {
      colliders.push({ id: `${b.id}-w`, minX, maxX: minX + wt, minZ, maxZ, maxY: h, kind: 'building' });
    }

    if (b.doorSide === 'east') {
      colliders.push({ id: `${b.id}-et`, minX: maxX - wt, maxX, minZ, maxZ: b.z - b.doorHalfWidth, maxY: h, kind: 'building' });
      colliders.push({ id: `${b.id}-eb`, minX: maxX - wt, maxX, minZ: b.z + b.doorHalfWidth, maxZ, maxY: h, kind: 'building' });
    } else {
      colliders.push({ id: `${b.id}-e`, minX: maxX - wt, maxX, minZ, maxZ, maxY: h, kind: 'building' });
    }
  }

  // 2. Scenery Buildings
  for (const sc of getStage2SceneryBuildings()) {
    if (sc.kind === 'pocket_park') continue;
    colliders.push({
      id: sc.id,
      minX: sc.x - sc.halfW,
      maxX: sc.x + sc.halfW,
      minZ: sc.z - sc.halfD,
      maxZ: sc.z + sc.halfD,
      maxY: sc.height,
      kind: 'landmark',
    });
  }

  // 3. Stage 2 Landmarks (skip ship_dock, water_monitor as open walk-up zones)
  for (const lm of getStage2Landmarks()) {
    if (lm.kind === 'ship_dock' || lm.kind === 'water_monitor') continue;
    colliders.push({
      id: lm.id,
      minX: lm.x - lm.halfW,
      maxX: lm.x + lm.halfW,
      minZ: lm.z - lm.halfD,
      maxZ: lm.z + lm.halfD,
      maxY: lm.height,
      kind: 'landmark',
    });
  }

  // 4. Placed Buildings
  for (const pb of placedBuildings) {
    const def = BUILDING_CATALOG.find((b) => b.id === pb.buildingId);
    const height = pb.isConstructing ? 2.8 : Math.max(2.6, (def?.heightLevel ?? 2) * 2.3 + 1.2);
    colliders.push({
      id: pb.id,
      minX: pb.x - 2.35,
      maxX: pb.x + 2.35,
      minZ: pb.z - 2.35,
      maxZ: pb.z + 2.35,
      maxY: height,
      kind: 'building',
    });
  }

  return colliders;
}

function resolveStage2WaterSafety(
  x: number,
  z: number,
  prevX: number,
  prevZ: number
): { x: number; z: number } {
  const ground = stage2GroundHeightAt(x, z);
  if (ground < -0.15) {
    return { x: prevX, z: prevZ };
  }
  return { x, z };
}

export function stepStage2PlayerPhysics(
  state: Player3DState,
  input: PlayerMoveInput,
  cameraYaw: number,
  colliders: AabbCollider[],
  dt: number
): Player3DState {
  const stepDt = Math.min(0.05, Math.max(0.001, dt));
  const moveLen = Math.hypot(input.forward, input.right);

  let vx = 0;
  let vz = 0;
  let facingYaw = state.facingYaw;

  if (moveLen > 0.05) {
    const nf = input.forward / moveLen;
    const nr = input.right / moveLen;
    const fwdX = Math.sin(cameraYaw);
    const fwdZ = Math.cos(cameraYaw);
    const rightX = -Math.cos(cameraYaw);
    const rightZ = Math.sin(cameraYaw);
    const dirX = fwdX * nf + rightX * nr;
    const dirZ = fwdZ * nf + rightZ * nr;
    const targetSpeed = input.sprint ? SPRINT_SPEED : WALK_SPEED;
    vx = dirX * targetSpeed;
    vz = dirZ * targetSpeed;
    facingYaw = Math.atan2(dirX, dirZ);
  }

  let nextX = Math.max(STAGE2_MIN_X + 1.5, Math.min(STAGE2_MAX_X - 1.5, state.x + vx * stepDt));
  let nextZ = Math.max(STAGE2_MIN_Z + 1.5, Math.min(STAGE2_MAX_Z - 1.5, state.z + vz * stepDt));

  for (const box of colliders) {
    const closestX = Math.max(box.minX, Math.min(nextX, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(nextZ, box.maxZ));
    const dx = nextX - closestX;
    const dz = nextZ - closestZ;
    const distSq = dx * dx + dz * dz;
    if (distSq < PLAYER_RADIUS * PLAYER_RADIUS) {
      if (distSq > 0.00001) {
        const dist = Math.sqrt(distSq);
        const push = PLAYER_RADIUS - dist;
        nextX += (dx / dist) * push;
        nextZ += (dz / dist) * push;
      } else {
        const leftPen = Math.abs(nextX - box.minX);
        const rightPen = Math.abs(box.maxX - nextX);
        const topPen = Math.abs(nextZ - box.minZ);
        const botPen = Math.abs(box.maxZ - nextZ);
        const minPen = Math.min(leftPen, rightPen, topPen, botPen);
        if (minPen === leftPen) nextX = box.minX - PLAYER_RADIUS;
        else if (minPen === rightPen) nextX = box.maxX + PLAYER_RADIUS;
        else if (minPen === topPen) nextZ = box.minZ - PLAYER_RADIUS;
        else nextZ = box.maxZ + PLAYER_RADIUS;
      }
    }
  }

  const safePos = resolveStage2WaterSafety(nextX, nextZ, state.x, state.z);
  nextX = safePos.x;
  nextZ = safePos.z;

  const groundY = stage2GroundHeightAt(nextX, nextZ);
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

export function createInitialStage2Vehicles(): VehicleRuntimeState[] {
  return STAGE2_VEHICLES.map((def) => ({
    def,
    x: def.spawnX,
    y: stage2GroundHeightAt(def.spawnX, def.spawnZ),
    z: def.spawnZ,
    yaw: def.spawnYaw,
    speed: 0,
  }));
}

export function stepStage2VehiclePhysics(
  vehicle: VehicleRuntimeState,
  input: { forward: number; right: number },
  colliders: AabbCollider[],
  dt: number
): VehicleRuntimeState {
  const stepDt = Math.min(0.05, Math.max(0.001, dt));
  const accel = 16.0;
  let speed = vehicle.speed;

  if (Math.abs(input.forward) > 0.05) {
    speed += input.forward * accel * stepDt;
  } else {
    speed *= Math.max(0, 1 - 4.2 * stepDt);
  }
  speed = Math.max(-vehicle.def.maxSpeed * 0.45, Math.min(vehicle.def.maxSpeed, speed));

  const turnRate = 2.0;
  const dirSign = speed >= -0.2 ? 1 : -1;
  const yaw =
    Math.abs(speed) > 0.3
      ? vehicle.yaw - input.right * turnRate * stepDt * dirSign
      : vehicle.yaw - input.right * 0.85 * stepDt;

  let nextX = vehicle.x + Math.sin(yaw) * speed * stepDt;
  let nextZ = vehicle.z + Math.cos(yaw) * speed * stepDt;

  nextX = Math.max(STAGE2_MIN_X + 2.5, Math.min(STAGE2_SHORELINE_X - 2.0, nextX));
  nextZ = Math.max(STAGE2_MIN_Z + 2.5, Math.min(STAGE2_MAX_Z - 2.5, nextZ));

  const radius = vehicle.def.kind === 'forklift' ? 1.05 : 1.45;
  for (const box of colliders) {
    const cx = Math.max(box.minX, Math.min(nextX, box.maxX));
    const cz = Math.max(box.minZ, Math.min(nextZ, box.maxZ));
    const dx = nextX - cx;
    const dz = nextZ - cz;
    const dSq = dx * dx + dz * dz;
    if (dSq < radius * radius) {
      nextX = vehicle.x;
      nextZ = vehicle.z;
      speed = 0;
      break;
    }
  }

  const gY = stage2GroundHeightAt(nextX, nextZ);
  if (gY < -0.15) {
    nextX = vehicle.x;
    nextZ = vehicle.z;
    speed = 0;
  }

  return {
    ...vehicle,
    x: nextX,
    y: Math.max(0, stage2GroundHeightAt(nextX, nextZ)),
    z: nextZ,
    yaw,
    speed,
  };
}

export function validateStage2BuildingPlacement(
  buildingId: string,
  x: number,
  z: number,
  placedBuildings: PlacedBuildingInstance[],
  playerX: number,
  playerZ: number
): { valid: boolean; reason: string } {
  const def = BUILDING_CATALOG.find((b) => b.id === buildingId);
  if (!def) return { valid: false, reason: 'Bangunan tidak dikenal.' };
  if (def.minStage > 2) {
    return { valid: false, reason: `Terkunci! Bangunan ${def.name} baru tersedia di Stage ${def.minStage}.` };
  }

  if (x < -104 || x > 51 || z < -86 || z > 86) {
    return { valid: false, reason: 'Area luar batas pengembangan kota.' };
  }

  // Keep player outside building footprint
  if (Math.hypot(x - playerX, z - playerZ) < 3.6) {
    return { valid: false, reason: 'Terlalu dekat dengan karaktermu, mundur sedikit.' };
  }

  // Reject main asphalt roads & railway track
  const onMainEW = Math.abs(z) < 4.5;
  const onMainNS = Math.abs(x) < 4.5;
  const onWestIndustrialRd = Math.abs(x - -36) < 4.0 && z >= -80 && z <= 80;
  const onEastStationRd = Math.abs(x - 28) < 3.8 && z >= -75 && z <= 75;
  const onRailTrack = Math.abs(x - STAGE2_RAIL_X) < 3.6;
  const onSouthLoopRd = Math.abs(z - 28) < 3.6 && x >= -82 && x <= 48;
  const onNorthLoopRd = Math.abs(z - -28) < 3.6 && x >= -82 && x <= 48;

  if (onMainEW || onMainNS || onWestIndustrialRd || onEastStationRd || onRailTrack || onSouthLoopRd || onNorthLoopRd) {
    return { valid: false, reason: 'Tidak bisa membangun di atas jalan raya atau rel kereta.' };
  }

  // Reject river channel
  if (stage2GroundHeightAt(x, z) < -0.1) {
    return { valid: false, reason: 'Area sungai/perairan tidak cocok untuk bangunan ini.' };
  }

  // Reject Stage 2 Enterable buildings
  for (const eb of STAGE2_ENTERABLE_BUILDINGS) {
    if (Math.abs(x - eb.x) < eb.halfW + 3.2 && Math.abs(z - eb.z) < eb.halfD + 3.2) {
      return { valid: false, reason: `Terlalu dekat dengan ${eb.label}.` };
    }
  }

  // Reject Scenery Buildings
  for (const sc of getStage2SceneryBuildings()) {
    if (Math.abs(x - sc.x) < sc.halfW + 2.8 && Math.abs(z - sc.z) < sc.halfD + 2.8) {
      return { valid: false, reason: 'Lahan sudah terisi bangunan atau taman kota.' };
    }
  }

  // Reject Landmarks
  for (const lm of getStage2Landmarks()) {
    if (Math.abs(x - lm.x) < lm.halfW + 3.2 && Math.abs(z - lm.z) < lm.halfD + 3.2) {
      return { valid: false, reason: `Terlalu dekat dengan ${lm.label}.` };
    }
  }

  // Reject Existing Placed Buildings
  for (const pb of placedBuildings) {
    if (Math.hypot(x - pb.x, z - pb.z) < 5.6) {
      return { valid: false, reason: 'Terlalu dekat dengan bangunan yang sudah didirikan.' };
    }
  }

  const d = findStage2DistrictAt(x, z);
  return { valid: true, reason: `Siap dibangun di ${d.name}` };
}

export type Stage2Interactable =
  | { kind: 'npc'; npc: NpcWaypoint; dist: number; promptLabel: string }
  | { kind: 'pickup'; pickup: WorldPickupDef; dist: number; promptLabel: string }
  | { kind: 'collectible'; collectible: CollectibleDef; dist: number; promptLabel: string }
  | { kind: 'delivery'; delivery: DeliverySpotDef; dist: number; promptLabel: string }
  | { kind: 'factory_station'; station: Stage2FactoryStationDef; dist: number; promptLabel: string }
  | { kind: 'wardrobe_mirror'; spot: typeof STAGE2_WARDROBE_MIRROR_SPOT; dist: number; promptLabel: string }
  | { kind: 'placed_building'; instance: PlacedBuildingInstance; dist: number; promptLabel: string }
  | { kind: 'landmark'; landmark: StageLandmarkDef; dist: number; promptLabel: string }
  | { kind: 'vehicle'; vehicle: VehicleRuntimeState; dist: number; promptLabel: string }
  | { kind: 'stage_transition'; targetStage: 1 | 2 | 3; label: string; dist: number; promptLabel: string }
  | { kind: 'locked_stage3'; landmark: StageLandmarkDef; dist: number; promptLabel: string };

export function findNearestStage2Interactable(
  px: number,
  pz: number,
  opts: {
    collectedPickups: string[];
    collectedArtifacts: string[];
    completedDeliveries: string[];
    placedBuildings: PlacedBuildingInstance[];
    vehicles: VehicleRuntimeState[];
  }
): Stage2Interactable | null {
  let best: Stage2Interactable | null = null;
  let bestDist = Infinity;

  const tryCandidate = (cand: Stage2Interactable, maxRange: number) => {
    if (cand.dist <= maxRange && cand.dist < bestDist) {
      best = cand;
      bestDist = cand.dist;
    }
  };

  // 1. Factory Production Stations (high priority inside factories)
  for (const st of STAGE2_FACTORY_STATIONS) {
    const d = Math.hypot(px - st.x, pz - st.z);
    tryCandidate({ kind: 'factory_station', station: st, dist: d, promptLabel: `[E] Buka ${st.label}` }, 4.0);
  }

  // 2. Return Ship Transition (near gangway or on ship deck)
  const shipDist = Math.hypot(px - 73.2, pz - 7.5);
  if (shipDist <= 7.5) {
    tryCandidate(
      {
        kind: 'stage_transition',
        targetStage: 1,
        label: 'Kapal Ekspres Industri -> Kota Nusantara (Stage 1)',
        dist: shipDist,
        promptLabel: '[E] Berlayar Kembali ke Stage 1',
      },
      7.5
    );
  }

  // 3. Pickups
  for (const pk of STAGE2_WORLD_PICKUPS) {
    if (opts.collectedPickups.includes(pk.id)) continue;
    const d = Math.hypot(px - pk.x, pz - pk.z);
    tryCandidate({ kind: 'pickup', pickup: pk, dist: d, promptLabel: `[E] Ambil ${pk.label}` }, 3.4);
  }

  // 4. Collectibles
  for (const c of STAGE2_COLLECTIBLES) {
    if (opts.collectedArtifacts.includes(c.id)) continue;
    const d = Math.hypot(px - c.x, pz - c.z);
    const colDef: CollectibleDef = {
      id: c.id,
      name: c.name,
      category: 'sejarah',
      rarity: c.rarity,
      districtId: 'industri',
      x: c.x,
      z: c.z,
      yOffset: c.yOffset,
      hint: c.hint,
      description: c.description,
      xpReward: c.xpReward,
      coinReward: c.coinReward,
      cultureBonus: c.industryBonus,
    };
    tryCandidate({ kind: 'collectible', collectible: colDef, dist: d, promptLabel: `[E] Kumpulkan ${c.name}` }, 3.4);
  }

  // 5. Delivery / Wholesale Sale Spots
  for (const del of STAGE2_DELIVERY_SPOTS) {
    const isRepeatableSale = del.id === 's2-del-gudang' || del.id === 's2-del-grosir';
    if (!isRepeatableSale && opts.completedDeliveries.includes(del.id)) continue;
    const d = Math.hypot(px - del.x, pz - del.z);
    tryCandidate(
      { kind: 'delivery', delivery: del, dist: d, promptLabel: `[E] ${del.label}` },
      3.8
    );
  }

  // 6. Wardrobe Mirror
  const mirrorDist = Math.hypot(px - STAGE2_WARDROBE_MIRROR_SPOT.x, pz - STAGE2_WARDROBE_MIRROR_SPOT.z);
  tryCandidate(
    {
      kind: 'wardrobe_mirror',
      spot: STAGE2_WARDROBE_MIRROR_SPOT,
      dist: mirrorDist,
      promptLabel: '[E] Studio Seragam & Karakter 3D',
    },
    3.4
  );

  // 7. NPCs
  for (const npc of getStage2Npcs()) {
    const d = Math.hypot(px - npc.x, pz - npc.z);
    tryCandidate({ kind: 'npc', npc, dist: d, promptLabel: `[E] Bicara dengan ${npc.name}` }, 4.2);
  }

  // 8. Placed Buildings
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

  // 9. Landmarks (including Locked Stage 3 Terminal!)
  for (const lm of getStage2Landmarks()) {
    if (lm.id === 'lm-s2-ship-return') continue;
    const d = Math.hypot(px - lm.x, pz - lm.z);
    const range = lm.halfW + 3.6;
    if (lm.id === 'lm-s2-stage3-terminal') {
      tryCandidate(
        {
          kind: 'stage_transition',
          targetStage: 3,
          label: 'Kereta Cepat Nusantara -> Kota Digital Masa Depan (Stage 3)',
          dist: d,
          promptLabel: '[E] Naik Kereta Cepat ke Stage 3 (Kota Digital)',
        },
        range
      );
    } else {
      tryCandidate({ kind: 'landmark', landmark: lm, dist: d, promptLabel: `[E] Inspeksi ${lm.label}` }, range);
    }
  }

  // 10. Driveable Vehicles
  for (const v of opts.vehicles) {
    const d = Math.hypot(px - v.x, pz - v.z);
    tryCandidate({ kind: 'vehicle', vehicle: v, dist: d, promptLabel: `[F] Kendarai ${v.def.name}` }, 4.2);
  }

  return best;
}

export function updateStage2Camera(
  cam: {
    yaw: number;
    pitch: number;
    distance: number;
    x: number;
    y: number;
    z: number;
    targetX: number;
    targetY: number;
    targetZ: number;
  },
  player: Player3DState,
  colliders: AabbCollider[],
  dtSeconds: number
) {
  const dt = Math.min(Math.max(dtSeconds, 0), 0.05);
  const followAlpha = 1 - Math.exp(-12 * dt);

  const desiredTargetX = player.x;
  const desiredTargetY = player.y + 1.65;
  const desiredTargetZ = player.z;

  const targetX = cam.targetX + (desiredTargetX - cam.targetX) * followAlpha;
  const targetY = cam.targetY + (desiredTargetY - cam.targetY) * followAlpha;
  const targetZ = cam.targetZ + (desiredTargetZ - cam.targetZ) * followAlpha;

  const insideBuilding = getStage2EnterableBuildingAt(player.x, player.z);
  const minPitch = insideBuilding ? 0.52 : 0.14;
  const clampedPitch = Math.max(minPitch, Math.min(1.1, cam.pitch));
  const clampedDist = Math.max(5.5, Math.min(22.0, cam.distance));

  const dirX = -Math.sin(cam.yaw) * Math.cos(clampedPitch);
  const dirY = Math.sin(clampedPitch);
  const dirZ = -Math.cos(cam.yaw) * Math.cos(clampedPitch);

  let effectiveDist = clampedDist;
  if (!insideBuilding) {
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
  } else {
    effectiveDist = Math.min(clampedDist, 10.5);
  }

  const camX = targetX + dirX * effectiveDist;
  const rawCamY = targetY + dirY * effectiveDist;
  const camZ = targetZ + dirZ * effectiveDist;
  const floorUnderCam = stage2GroundHeightAt(camX, camZ);
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
