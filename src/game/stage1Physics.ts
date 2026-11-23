import { BUILDING_CATALOG } from './data/bermainData';
import {
  CollectibleDef,
  DeliverySpotDef,
  EnterableBuildingDef,
  RideableVehicleDef,
  STAGE1_COLLECTIBLES,
  STAGE1_DELIVERY_SPOTS,
  STAGE1_ENTERABLE_BUILDINGS,
  STAGE1_VEHICLES,
  STAGE1_WARDROBE_MIRROR_SPOT,
  STAGE1_WORLD_PICKUPS,
  WorldPickupDef,
} from './stage1Data';
import { PlacedBuildingInstance } from './stage1WorldLogic';
import {
  AabbCollider,
  CrowdPatrolDef,
  NpcWaypoint,
  PIER_HEIGHT,
  PLAYER_RADIUS,
  Player3DState,
  PlayerMoveInput,
  SceneryBuildingDef,
  StageLandmarkDef,
  WALK_SPEED,
  SPRINT_SPEED,
  JUMP_VELOCITY,
  GRAVITY,
} from './world3dPhysics';

export const STAGE1_MIN_X = -114.0;
export const STAGE1_MAX_X = 152.0;
export const STAGE1_MIN_Z = -94.0;
export const STAGE1_MAX_Z = 94.0;

export const STAGE1_SHORELINE_X = 52.0;

export interface ShipDeckZone {
  id: 'ship-pinisi' | 'ship-penumpang';
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  deckY: number;
  sternMaxX?: number;
  sternDeckY?: number;
  gangway: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    startZ: number;
    endZ: number;
  };
}

export const STAGE1_SHIP_DECKS: ShipDeckZone[] = [
  {
    id: 'ship-pinisi',
    name: 'Kapal Pinisi Niaga Nusantara',
    minX: 64.0,
    maxX: 84.5,
    minZ: 5.5,
    maxZ: 11.6,
    deckY: 2.15,
    sternMaxX: 69.5,
    sternDeckY: 3.25,
    gangway: {
      minX: 71.5,
      maxX: 76.0,
      minZ: 3.6,
      maxZ: 5.8,
      startZ: 3.8,
      endZ: 5.6,
    },
  },
  {
    id: 'ship-penumpang',
    name: 'Kapal Penumpang Jalur Rempah',
    minX: 63.0,
    maxX: 81.5,
    minZ: -11.6,
    maxZ: -5.5,
    deckY: 2.05,
    gangway: {
      minX: 69.0,
      maxX: 73.0,
      minZ: -5.8,
      maxZ: -3.6,
      startZ: -3.8,
      endZ: -5.6,
    },
  },
];

export const LIGHTHOUSE_ISLAND = {
  x: 130.0,
  z: -22.0,
  radius: 13.0,
  plateauRadius: 7.5,
  height: 1.35,
};

export const BUKIT_WISATA = {
  x: -90.0,
  z: -54.0,
  outerRadius: 22.0,
  plateauRadius: 6.5,
  height: 4.6,
};

export function stage1GroundHeightAt(x: number, z: number): number {
  // 1. Boardable Ships & Gangways (check highest walkable deck first)
  for (const ship of STAGE1_SHIP_DECKS) {
    const gw = ship.gangway;
    if (x >= gw.minX && x <= gw.maxX && z >= gw.minZ && z <= gw.maxZ) {
      const denom = gw.endZ - gw.startZ;
      const t = Math.max(0, Math.min(1, (z - gw.startZ) / denom));
      return PIER_HEIGHT + t * (ship.deckY - PIER_HEIGHT);
    }

    if (x >= ship.minX && x <= ship.maxX && z >= ship.minZ && z <= ship.maxZ) {
      if (ship.sternMaxX && ship.sternDeckY) {
        if (x <= ship.sternMaxX) return ship.sternDeckY;
        if (x <= ship.sternMaxX + 1.8) {
          const t = 1 - (x - ship.sternMaxX) / 1.8;
          return ship.deckY + t * (ship.sternDeckY - ship.deckY);
        }
      }
      return ship.deckY;
    }
  }

  // 2. Three Harbor Piers (with smooth 3m ramps from x=49.5 to 52.5)
  const onMainPier = Math.abs(z) <= 4.2 && x >= 49.5 && x <= 85.0;
  const onNorthPier = z >= -34.0 && z <= -27.5 && x >= 49.5 && x <= 74.0;
  const onSouthPier = z >= 25.0 && z <= 31.5 && x >= 49.5 && x <= 72.0;
  if (onMainPier || onNorthPier || onSouthPier) {
    if (x < 52.5) {
      return ((x - 49.5) / 3.0) * PIER_HEIGHT;
    }
    return PIER_HEIGHT;
  }

  // 3. Lighthouse Island out in Harbor Bay
  const islDist = Math.hypot(x - LIGHTHOUSE_ISLAND.x, z - LIGHTHOUSE_ISLAND.z);
  if (islDist <= LIGHTHOUSE_ISLAND.radius) {
    if (islDist <= LIGHTHOUSE_ISLAND.plateauRadius) return LIGHTHOUSE_ISLAND.height;
    const t =
      1 -
      (islDist - LIGHTHOUSE_ISLAND.plateauRadius) /
        (LIGHTHOUSE_ISLAND.radius - LIGHTHOUSE_ISLAND.plateauRadius);
    return -0.3 + t * (LIGHTHOUSE_ISLAND.height + 0.3);
  }

  // 4. Two Arched River Bridges (walkable & drivable over Sungai Nusantara!)
  if (x >= -65.0 && x <= -51.0 && Math.abs(z) <= 3.4) {
    const t = (x + 65.0) / 14.0; // 0..1
    return Math.sin(t * Math.PI) * 1.65;
  }
  if (z >= 49.0 && z <= 63.0 && Math.abs(x) <= 3.4) {
    const t = (z - 49.0) / 14.0; // 0..1
    return Math.sin(t * Math.PI) * 1.65;
  }

  // 5. Enterable Building Interior Floors (gentle raised wood/stone threshold)
  for (const b of STAGE1_ENTERABLE_BUILDINGS) {
    if (Math.abs(x - b.x) <= b.halfW - 0.15 && Math.abs(z - b.z) <= b.halfD - 0.15) {
      return 0.22;
    }
  }

  // 6. Bukit Wisata Nusantara (smooth walkable hillside in NW Nature District)
  const hillDist = Math.hypot(x - BUKIT_WISATA.x, z - BUKIT_WISATA.z);
  if (hillDist <= BUKIT_WISATA.outerRadius) {
    if (hillDist <= BUKIT_WISATA.plateauRadius) return BUKIT_WISATA.height;
    const norm =
      (hillDist - BUKIT_WISATA.plateauRadius) /
      (BUKIT_WISATA.outerRadius - BUKIT_WISATA.plateauRadius);
    const smooth = 0.5 * (1 + Math.cos(norm * Math.PI));
    return smooth * BUKIT_WISATA.height;
  }

  // 7. Sungai Nusantara River Channel
  const inNorthSouthChannel = x >= -61.5 && x <= -54.5 && z >= -46.0 && z <= 59.0;
  const inEastWestChannel = z >= 52.5 && z <= 59.5 && x >= -61.5 && x <= STAGE1_SHORELINE_X;
  if (inNorthSouthChannel || inEastWestChannel) {
    return -0.5;
  }

  // 8. Ocean Seafloor East of Shoreline
  if (x > STAGE1_SHORELINE_X) {
    return -0.35;
  }

  return 0;
}

export function getStage1EnterableBuildingAt(
  x: number,
  z: number
): EnterableBuildingDef | null {
  for (const b of STAGE1_ENTERABLE_BUILDINGS) {
    if (Math.abs(x - b.x) <= b.halfW - 0.25 && Math.abs(z - b.z) <= b.halfD - 0.25) {
      return b;
    }
  }
  return null;
}

export function getStage1BoardedShipId(
  x: number,
  z: number,
  y: number
): 'ship-pinisi' | 'ship-penumpang' | null {
  if (y < 1.5) return null;
  for (const ship of STAGE1_SHIP_DECKS) {
    if (x >= ship.minX && x <= ship.maxX && z >= ship.minZ && z <= ship.maxZ) {
      return ship.id;
    }
  }
  return null;
}

export function getStage1Npcs(): NpcWaypoint[] {
  return [
    {
      id: 'npc-aditya',
      name: 'Aditya',
      role: 'Arsitek & Perencana Kota (Hiperglobalis)',
      characterId: 'aditya',
      x: 5.2,
      z: -5.2,
      facingYaw: Math.PI * 0.75,
      dialogue:
        'Selamat datang di Stage 1 Nusantara! Kunjungi Pasar Tradisional di timur dan Pelabuhan Niaga untuk melihat simpul Jalur Rempah kita.',
      missionHint: 'Misi 1: Jelajahi Pasar Tradisional & Pelabuhan, lalu kembali melapor padaku!',
      recommendedCategory: 'perdagangan',
      recommendedBuildingId: 'pelabuhan-nusantara',
    },
    {
      id: 'npc-laras',
      name: 'Laras',
      role: 'Peneliti Budaya Lokal (Skeptis)',
      characterId: 'laras',
      x: 24.5,
      z: -12.0,
      facingYaw: -Math.PI * 0.65,
      dialogue:
        'Pasar Utama kita penuh dengan akulturasi rempah, batik, dan keramik. Namun pedagang membutuhkan stok cengkih dan kain batik segera!',
      missionHint: 'Misi 2: Ambil Karung Cengkih dari Gudang Pelabuhan & Kain Batik, lalu antar ke dalam Pasar Utama.',
      recommendedCategory: 'budaya',
      recommendedBuildingId: 'museum-budaya',
    },
    {
      id: 'npc-naya',
      name: 'Naya',
      role: 'Penggerak UMKM Lokal (Transformasionalis)',
      characterId: 'naya',
      x: 15.5,
      z: 39.5,
      facingYaw: -Math.PI * 0.25,
      dialogue:
        'Kita bisa memajukan ekonomi kota sambil tetap melestarikan budaya! Gunakan mode Bangun [B] untuk menempatkan fasilitas baru secara bebas.',
      missionHint: 'Misi 5: Bangun fasilitas kota lewat Mode Bangun [B] dan tingkatkan bangunan ke Level 2.',
      recommendedCategory: 'budaya',
      recommendedBuildingId: 'pusat-umkm',
    },
    {
      id: 'npc-syahbandar',
      name: 'Syahbandar Pelabuhan',
      role: 'Pengawas Niaga Jalur Rempah',
      x: 56.5,
      z: -2.4,
      facingYaw: -Math.PI * 0.5,
      dialogue:
        'Kapal Pinisi Niaga telah bersandar di sisi selatan Dermaga Utama! Jembatan gangway kayu sudah dipasang agar kamu bisa naik langsung ke dek.',
      missionHint: 'Misi 3: Naiki gangway ke Dek Kapal Pinisi dan temui Kapten Raka di atas kapal.',
    },
    {
      id: 'npc-kapten-raka',
      name: 'Kapten Raka',
      role: 'Nakhoda Kapal Pinisi Niaga',
      x: 77.0,
      z: 8.5,
      facingYaw: -Math.PI * 0.5,
      dialogue:
        'Selamat datang di atas dek Kapal Pinisi! Peti-peti cengkih dan pala siap berlayar. Jangan lupa coba Perahu Jukung di Dermaga Selatan menuju Pulau Mercusuar!',
      missionHint: 'Periksa Dek Buritan Atas untuk Miniatur Pinisi atau berlayar dari Dermaga Selatan!',
    },
    {
      id: 'npc-pelaut-budi',
      name: 'Pelaut Budi',
      role: 'Awak Kapal Penumpang',
      x: 77.2,
      z: -8.6,
      facingYaw: -Math.PI * 0.45,
      dialogue:
        'Kapal Ekspres Jalur Rempah ini siap membawamu berlayar dari Stage 1 menuju Kota Industri (Stage 2)! Naiki dek kapal dan tekan [E] di titik keberangkatan.',
      missionHint: 'Berlayar ke Stage 2 (Kota Industri) dari dek Kapal Penumpang atau cek menu Peta Dunia!',
    },
    {
      id: 'npc-kepala-kota',
      name: 'Pak Wiryo',
      role: 'Kepala Kota Nusantara',
      x: -13.0,
      z: -16.2,
      facingYaw: 0,
      dialogue:
        'Balai Kota ini terbuka bagi seluruh warga. Pertumbuhan ekonomi harus berjalan berdampingan dengan pendidikan, kesejahteraan, dan budaya lokal.',
      missionHint: 'Pantau indeks kota dan tingkatkan bangunan melalui menu Konstruksi.',
    },
    {
      id: 'npc-bu-ratna',
      name: 'Bu Ratna',
      role: 'Tokoh Warga Permukiman',
      x: -31.8,
      z: -11.5,
      facingYaw: Math.PI * 0.45,
      dialogue:
        'Warga permukiman membutuhkan jamu herbal sehat serta dukungan buku bacaan untuk Sekolah Nusantara di kawasan utara.',
      missionHint: 'Misi 4: Ambil Jamu Herbal, antar ke Rumah Adat Utama, lalu kunjungi Sekolah Nusantara.',
    },
    {
      id: 'npc-ibu-kartini',
      name: 'Ibu Kartini',
      role: 'Kepala Sekolah & Perpustakaan',
      x: -11.5,
      z: -59.5,
      facingYaw: 0,
      dialogue:
        'Pendidikan membentengi generasi muda dari cultural lag. Masuklah ke dalam perpustakaan untuk membaca naskah lontar tata niaga!',
      missionHint: 'Masuk melalui pintu selatan Sekolah Nusantara untuk menemukan Manuskrip Lontar.',
      recommendedCategory: 'teknologi',
      recommendedBuildingId: 'sekolah-rakyat',
    },
    {
      id: 'npc-pedagang-kain',
      name: 'Ibu Sari',
      role: 'Pengrajin & Pedagang Kain Batik',
      x: 28.0,
      z: 12.0,
      facingYaw: -Math.PI / 2,
      dialogue:
        'Motif batik pesisir memadukan keindahan seni Nusantara dengan corak sutra dari Gujarat dan Tiongkok!',
      missionHint: 'Ambil Gulungan Kain Batik di samping kios jika sedang menjalankan Misi Pasar.',
    },
    {
      id: 'npc-pedagang-kuliner',
      name: 'Pak Joko',
      role: 'Pedagang Kuliner & Rempah',
      x: 25.0,
      z: -25.0,
      facingYaw: Math.PI / 2,
      dialogue:
        'Ikan bakar segar dan wedang rempah selalu jadi favorit awak kapal dan warga yang melintas di pasar!',
      missionHint: 'Misi Sampingan: Bawa Keranjang Ikan Segar dari Dermaga Utara untuk Pak Joko.',
    },
    {
      id: 'npc-nelayan',
      name: 'Pak Bahri',
      role: 'Nelayan Tradisional Dermaga Utara',
      x: 68.0,
      z: -30.5,
      facingYaw: Math.PI * 0.35,
      dialogue:
        'Tangkapan ikan hari ini melimpah! Tolong bantu antarkan keranjang ikan di ujung dermaga ini ke Pak Joko di pasar.',
      missionHint: 'Ambil Keranjang Ikan Segar di Dermaga Utara lalu bawa ke Pak Joko.',
    },
    {
      id: 'npc-wisatawan',
      name: 'Rania',
      role: 'Wisatawan & Penjelajah Alam',
      x: -68.0,
      z: -6.5,
      facingYaw: Math.PI * 0.35,
      dialogue:
        'Pemandangan Sungai Nusantara dan Air Terjun di balik bukit sungguh menakjubkan! Kudengar ada Topeng Barong tersembunyi di puncak bukit.',
      missionHint: 'Daki Bukit Wisata di barat laut untuk menemukan koleksi Topeng Barong!',
    },
    {
      id: 'npc-barista-kopi',
      name: 'Mas Darma',
      role: 'Peracik Kopi Rempah Pesisir',
      x: 33.2,
      z: -37.5,
      facingYaw: -Math.PI * 0.5,
      dialogue:
        'Aroma kopi robusta berpadu kapulaga dan kayu manis ini menarik saudagar dari berbagai pulau! Kafe ini jadi tempat bertukar gagasan warga.',
      missionHint: 'Misi Sampingan: Tinjau Hotel Bahari & Kafe Pesisir untuk promosi wisata kota!',
    },
    {
      id: 'npc-penjahit',
      name: 'Mbak Sekar',
      role: 'Perancang Busana & Penenun Butik',
      x: -15.5,
      z: 22.0,
      facingYaw: Math.PI * 0.45,
      dialogue:
        'Selamat datang di Butik Busana Nusantara! Kamu bisa bercermin di Studio Busana 3D di sebelah timur ruangan untuk mengubah wajah, rambut, dan busana!',
      missionHint: 'Gunakan Cermin [E] di dalam butik atau tekan [C] untuk membuka Studio Karakter 3D!',
    },
    {
      id: 'npc-kurator',
      name: 'Pak Baskoro',
      role: 'Kurator Sejarah & Artefak Nusantara',
      x: -10.2,
      z: -13.2,
      facingYaw: -Math.PI * 0.35,
      dialogue:
        'Ada 15 artefak budaya dan bahari tersebar di kota, bukit, lorong kampung, hingga Pulau Mercusuar. Setiap pencapaian koleksi membuka hadiah istimewa!',
      missionHint: 'Misi Rahasia: Temukan Astrolab Kuno di gang Permukiman Barat & inspeksi Mercusuar!',
    },
  ];
}

export function getStage1Landmarks(): StageLandmarkDef[] {
  return [
    {
      id: 'lm-pasar-rempah',
      label: 'Kios Rempah Nusantara',
      kind: 'market',
      x: 25.5,
      z: -28.5,
      halfW: 2.2,
      halfD: 1.6,
      height: 3.2,
      yaw: 0,
      description: 'Deretan kios cengkih, pala, lada, dan kayu manis Nusantara.',
      sociologyNote: 'Jual beli komoditas mempertemukan masyarakat lokal dengan pedagang lintas benua.',
    },
    {
      id: 'lm-pasar-kain',
      label: 'Kios Kain Batik & Tenun',
      kind: 'market',
      x: 31.5,
      z: 12.0,
      halfW: 2.2,
      halfD: 1.6,
      height: 3.2,
      yaw: Math.PI,
      description: 'Sentra kain tenun tradisional dan batik pesisir bercorak akulturasi.',
      sociologyNote: 'Akulturasi memperkaya motif seni lokal tanpa menghapus identitas budaya asli.',
    },
    {
      id: 'lm-derek-pelabuhan',
      label: 'Derek Bongkar Muat Utama',
      kind: 'harbor_crane',
      x: 63.0,
      z: -2.5,
      halfW: 1.0,
      halfD: 0.85,
      height: 4.8,
      yaw: 0,
      description: 'Derek kayu penarik peti komoditas ekspor antara Dermaga Utama dan kapal dagang.',
      sociologyNote: 'Teknologi bongkar muat mempercepat arus barang di kota pelabuhan.',
    },
    {
      id: 'lm-tugu-alun',
      label: 'Tugu Persatuan Nusantara',
      kind: 'monument',
      x: -4.8,
      z: 4.8,
      halfW: 0.95,
      halfD: 0.95,
      height: 4.8,
      yaw: 0,
      description: 'Monumen batu berukir emas di pusat Alun-Alun Kota Nusantara.',
      sociologyNote: 'Ruang publik pusat kota mempererat solidaritas sosial di tengah keragaman warga.',
    },
    {
      id: 'lm-gazebo-bukit',
      label: 'Gazebo Puncak Bukit Alam',
      kind: 'park_gazebo',
      x: -93.5,
      z: -56.5,
      halfW: 1.6,
      halfD: 1.6,
      height: 4.2,
      yaw: 0,
      description: 'Pendopo pandang di puncak Bukit Hijau yang menghadap air terjun dan lembah kota.',
      sociologyNote: 'Pelestarian ruang alam menjaga keseimbangan ekologis di tengah perkembangan kota.',
    },
    {
      id: 'lm-mercusuar',
      label: 'Mercusuar Pulau Timur',
      kind: 'monument',
      x: 129.0,
      z: -23.5,
      halfW: 1.3,
      halfD: 1.3,
      height: 9.5,
      yaw: 0,
      description: 'Menara suar batu yang memandu kapal dagang memasuki Teluk Nusantara.',
      sociologyNote: 'Infrastruktur navigasi maritim menjadikan Nusantara simpul perdagangan dunia.',
    },
  ];
}

export function getStage1SceneryBuildings(): SceneryBuildingDef[] {
  return [
    // === 1. PUSAT KOTA & ALUN-ALUN (Multi-story civic, colonial offices, ruko, cultural hall, cafe) ===
    { id: 's1x-pk1', kind: 'office_colonial', x: 10.5, z: -15.0, halfW: 3.1, halfD: 2.3, height: 6.4, yaw: Math.PI, variant: 0 },
    { id: 's1x-pk2', kind: 'ruko_2story', x: 10.5, z: -26.0, halfW: 2.5, halfD: 2.0, height: 5.8, yaw: -Math.PI / 2, variant: 1 },
    { id: 's1x-pk3', kind: 'ruko_2story', x: 10.5, z: -36.0, halfW: 2.5, halfD: 2.0, height: 5.8, yaw: -Math.PI / 2, variant: 2 },
    { id: 's1x-pk4', kind: 'cultural_hall', x: -13.0, z: -29.0, halfW: 3.2, halfD: 2.4, height: 5.2, yaw: 0, variant: 0 },
    { id: 's1x-pk5', kind: 'clinic_post', x: -22.5, z: -29.0, halfW: 2.2, halfD: 1.9, height: 3.8, yaw: 0, variant: 1 },
    { id: 's1x-pk6', kind: 'ruko_2story', x: -10.0, z: -41.0, halfW: 2.6, halfD: 2.0, height: 5.8, yaw: Math.PI / 2, variant: 0 },
    { id: 's1x-pk7', kind: 'apartment_block', x: -21.5, z: -41.0, halfW: 2.8, halfD: 2.2, height: 7.4, yaw: Math.PI / 2, variant: 1 },
    { id: 's1x-pk8', kind: 'cafe_terrace', x: -23.0, z: 9.5, halfW: 2.1, halfD: 1.8, height: 3.6, yaw: Math.PI / 2, variant: 0 },
    { id: 's1x-pk9', kind: 'pocket_park', x: -13.5, z: 10.5, halfW: 1.8, halfD: 1.8, height: 2.5, yaw: 0, variant: 1 },
    { id: 's1x-pk10', kind: 'ruko_2story', x: 11.0, z: 26.5, halfW: 2.5, halfD: 2.0, height: 5.8, yaw: -Math.PI / 2, variant: 3 },
    { id: 's1x-pk11', kind: 'ruko_2story', x: -21.5, z: -13.5, halfW: 2.2, halfD: 1.9, height: 5.6, yaw: Math.PI / 2, variant: 2 },
    { id: 's1x-pk12', kind: 'pendopo_hall', x: 10.5, z: -6.8, halfW: 2.2, halfD: 1.8, height: 4.2, yaw: Math.PI, variant: 1 },

    // === 2. PASAR TRADISIONAL & KORIDOR NIAGA TIMUR ===
    { id: 's1x-m1', kind: 'spice_stall', x: 26.8, z: -6.5, halfW: 1.7, halfD: 1.2, height: 3.0, yaw: Math.PI, variant: 0 },
    { id: 's1x-m2', kind: 'cloth_stall', x: 35.0, z: -6.5, halfW: 1.7, halfD: 1.2, height: 3.0, yaw: Math.PI, variant: 1 },
    { id: 's1x-m3', kind: 'food_stall', x: 35.0, z: 6.5, halfW: 1.7, halfD: 1.2, height: 3.0, yaw: 0, variant: 2 },
    { id: 's1x-m4', kind: 'spice_stall', x: 35.0, z: -26.5, halfW: 1.7, halfD: 1.2, height: 3.0, yaw: -Math.PI / 2, variant: 1 },
    { id: 's1x-m5', kind: 'food_stall', x: 26.8, z: 18.5, halfW: 1.7, halfD: 1.2, height: 3.0, yaw: Math.PI / 2, variant: 0 },
    { id: 's1x-m6', kind: 'wooden_warehouse', x: 42.2, z: 14.0, halfW: 2.3, halfD: 1.9, height: 4.3, yaw: -Math.PI / 2, variant: 0 },
    { id: 's1x-m7', kind: 'wooden_warehouse', x: 42.2, z: -34.0, halfW: 2.3, halfD: 1.9, height: 4.3, yaw: -Math.PI / 2, variant: 1 },
    { id: 's1x-m8', kind: 'ruko_2story', x: 28.0, z: 6.5, halfW: 2.2, halfD: 1.8, height: 5.6, yaw: 0, variant: 0 },
    { id: 's1x-m9', kind: 'ruko_2story', x: 42.5, z: -6.8, halfW: 2.3, halfD: 1.9, height: 5.8, yaw: Math.PI, variant: 1 },
    { id: 's1x-m10', kind: 'cafe_terrace', x: 42.5, z: 6.8, halfW: 2.1, halfD: 1.8, height: 3.8, yaw: 0, variant: 1 },
    { id: 's1x-m11', kind: 'cloth_stall', x: 27.2, z: -26.5, halfW: 1.6, halfD: 1.2, height: 3.0, yaw: 0, variant: 0 },
    { id: 's1x-m12', kind: 'spice_stall', x: 27.2, z: -32.0, halfW: 1.6, halfD: 1.2, height: 3.0, yaw: Math.PI / 2, variant: 2 },
    { id: 's1x-m13', kind: 'hotel_coastal', x: 43.0, z: 26.0, halfW: 2.6, halfD: 2.2, height: 6.8, yaw: -Math.PI / 2, variant: 0 },
    { id: 's1x-m14', kind: 'ruko_2story', x: 42.5, z: -43.0, halfW: 2.3, halfD: 1.8, height: 5.6, yaw: -Math.PI / 2, variant: 3 },
    { id: 's1x-m15', kind: 'food_stall', x: 35.0, z: 16.5, halfW: 1.7, halfD: 1.2, height: 3.0, yaw: Math.PI, variant: 1 },
    { id: 's1x-m16', kind: 'clinic_post', x: 12.5, z: -42.0, halfW: 2.2, halfD: 1.8, height: 3.9, yaw: Math.PI / 2, variant: 0 },

    // === 3. PERMUKIMAN WARGA (Rumah Joglo, Stilt House, Ruko, Klinik, Apartemen Kampung, Taman) ===
    { id: 's1x-h1', kind: 'joglo_house', x: -38.0, z: -27.5, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 0 },
    { id: 's1x-h2', kind: 'stilt_house', x: -38.0, z: -5.8, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: Math.PI / 2, variant: 1 },
    { id: 's1x-h3', kind: 'joglo_house', x: -38.0, z: 8.5, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 2 },
    { id: 's1x-h4', kind: 'stilt_house', x: -38.0, z: 21.5, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: Math.PI / 2, variant: 3 },
    { id: 's1x-h5', kind: 'pendopo_hall', x: -46.5, z: 14.5, halfW: 2.5, halfD: 2.2, height: 4.5, yaw: Math.PI / 2, variant: 0 },
    { id: 's1x-h6', kind: 'joglo_house', x: -46.5, z: -26.5, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 1 },
    { id: 's1x-h7', kind: 'stilt_house', x: -46.5, z: -8.0, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: Math.PI / 2, variant: 2 },
    { id: 's1x-h8', kind: 'joglo_house', x: -24.0, z: 16.0, halfW: 2.0, halfD: 1.7, height: 4.1, yaw: -Math.PI / 2, variant: 3 },
    { id: 's1x-h9', kind: 'pocket_park', x: -24.5, z: 27.5, halfW: 1.8, halfD: 1.8, height: 2.5, yaw: 0, variant: 0 },
    { id: 's1x-h10', kind: 'joglo_house', x: -38.0, z: -38.0, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 1 },
    { id: 's1x-h11', kind: 'stilt_house', x: -46.5, z: -38.0, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: Math.PI / 2, variant: 0 },
    { id: 's1x-h12', kind: 'clinic_post', x: -38.0, z: 31.5, halfW: 2.2, halfD: 1.8, height: 3.9, yaw: Math.PI / 2, variant: 1 },
    { id: 's1x-h13', kind: 'apartment_block', x: -46.5, z: 28.5, halfW: 2.7, halfD: 2.1, height: 7.2, yaw: Math.PI / 2, variant: 0 },
    { id: 's1x-h14', kind: 'joglo_house', x: -46.5, z: 40.5, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 2 },
    { id: 's1x-h15', kind: 'ruko_2story', x: -37.5, z: 42.5, halfW: 2.3, halfD: 1.9, height: 5.6, yaw: Math.PI / 2, variant: 1 },
    { id: 's1x-h16', kind: 'cafe_terrace', x: -24.0, z: -6.5, halfW: 1.9, halfD: 1.6, height: 3.6, yaw: 0, variant: 0 },
    { id: 's1x-h17', kind: 'stilt_house', x: -46.5, z: -17.5, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: Math.PI / 2, variant: 3 },
    { id: 's1x-h18', kind: 'cultural_hall', x: -23.5, z: 38.5, halfW: 2.8, halfD: 2.2, height: 5.0, yaw: -Math.PI / 2, variant: 1 },

    // === 4. KAWASAN INDUSTRI & LOGISTIK SELATAN ===
    { id: 's1x-i1', kind: 'wooden_warehouse', x: 9.5, z: 44.5, halfW: 2.4, halfD: 2.0, height: 4.4, yaw: 0, variant: 0 },
    { id: 's1x-i2', kind: 'cargo_depot', x: 34.0, z: 44.5, halfW: 2.4, halfD: 2.0, height: 4.6, yaw: 0, variant: 1 },
    { id: 's1x-i3', kind: 'wooden_warehouse', x: 14.0, z: 68.0, halfW: 2.4, halfD: 2.0, height: 4.4, yaw: Math.PI, variant: 1 },
    { id: 's1x-i4', kind: 'pendopo_hall', x: -12.0, z: 68.0, halfW: 2.5, halfD: 2.1, height: 4.5, yaw: Math.PI, variant: 0 },
    { id: 's1x-i5', kind: 'joglo_house', x: -26.0, z: 68.0, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI, variant: 2 },
    { id: 's1x-i6', kind: 'cargo_depot', x: 30.0, z: 68.0, halfW: 2.4, halfD: 2.0, height: 4.6, yaw: Math.PI, variant: 0 },
    { id: 's1x-i7', kind: 'workshop_open', x: -10.5, z: 44.5, halfW: 2.4, halfD: 2.0, height: 4.2, yaw: Math.PI, variant: 0 },
    { id: 's1x-i8', kind: 'workshop_open', x: 42.0, z: 44.5, halfW: 2.3, halfD: 1.9, height: 4.2, yaw: -Math.PI / 2, variant: 1 },
    { id: 's1x-i9', kind: 'apartment_block', x: -14.0, z: 30.0, halfW: 2.6, halfD: 2.1, height: 7.2, yaw: 0, variant: 2 },
    { id: 's1x-i10', kind: 'cargo_depot', x: 41.5, z: 68.0, halfW: 2.4, halfD: 2.0, height: 4.6, yaw: Math.PI, variant: 1 },
    { id: 's1x-i11', kind: 'ruko_2story', x: -38.0, z: 68.0, halfW: 2.5, halfD: 2.0, height: 5.8, yaw: Math.PI, variant: 2 },
    { id: 's1x-i12', kind: 'workshop_open', x: 10.5, z: 28.0, halfW: 2.2, halfD: 1.8, height: 4.0, yaw: 0, variant: 0 },
    { id: 's1x-i13', kind: 'food_stall', x: -8.5, z: 29.0, halfW: 1.6, halfD: 1.2, height: 3.0, yaw: 0, variant: 1 },

    // === 5. KAWASAN PENDIDIKAN & BUDAYA UTARA ===
    { id: 's1x-e1', kind: 'pendopo_hall', x: -35.5, z: -66.0, halfW: 2.5, halfD: 2.1, height: 4.5, yaw: 0, variant: 1 },
    { id: 's1x-e2', kind: 'joglo_house', x: 8.5, z: -66.0, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: 0, variant: 0 },
    { id: 's1x-e3', kind: 'pocket_park', x: -24.5, z: -60.5, halfW: 1.8, halfD: 1.8, height: 2.5, yaw: 0, variant: 0 },
    { id: 's1x-e4', kind: 'stilt_house', x: 22.0, z: -66.0, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: 0, variant: 2 },
    { id: 's1x-e5', kind: 'wooden_warehouse', x: 34.0, z: -66.0, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: 0, variant: 0 },
    { id: 's1x-e6', kind: 'cultural_hall', x: -45.0, z: -66.0, halfW: 2.8, halfD: 2.2, height: 5.0, yaw: 0, variant: 0 },
    { id: 's1x-e7', kind: 'office_colonial', x: 10.5, z: -78.0, halfW: 2.9, halfD: 2.2, height: 6.2, yaw: 0, variant: 1 },
    { id: 's1x-e8', kind: 'apartment_block', x: -12.0, z: -79.0, halfW: 2.8, halfD: 2.2, height: 7.4, yaw: 0, variant: 0 },
    { id: 's1x-e9', kind: 'apartment_block', x: 24.0, z: -78.0, halfW: 2.8, halfD: 2.2, height: 7.4, yaw: 0, variant: 1 },
    { id: 's1x-e10', kind: 'clinic_post', x: -37.0, z: -46.0, halfW: 2.1, halfD: 1.8, height: 3.8, yaw: Math.PI, variant: 0 },
    { id: 's1x-e11', kind: 'cafe_terrace', x: 10.5, z: -59.5, halfW: 2.0, halfD: 1.7, height: 3.6, yaw: Math.PI, variant: 1 },
    { id: 's1x-e12', kind: 'ruko_2story', x: 28.0, z: -47.0, halfW: 2.4, halfD: 1.9, height: 5.8, yaw: Math.PI, variant: 0 },
    { id: 's1x-e13', kind: 'joglo_house', x: 39.5, z: -78.0, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: 0, variant: 3 },

    // === 6. KAWASAN PESISIR & PELABUHAN DARAT ===
    { id: 's1x-c1', kind: 'hotel_coastal', x: 43.0, z: 36.0, halfW: 2.5, halfD: 2.1, height: 6.6, yaw: -Math.PI / 2, variant: 1 },
    { id: 's1x-c2', kind: 'wooden_warehouse', x: 43.0, z: -12.5, halfW: 2.2, halfD: 1.8, height: 4.2, yaw: -Math.PI / 2, variant: 0 },
    { id: 's1x-c3', kind: 'food_stall', x: 45.0, z: -5.8, halfW: 1.5, halfD: 1.1, height: 3.0, yaw: Math.PI, variant: 2 },
    { id: 's1x-c4', kind: 'spice_stall', x: 45.0, z: 5.8, halfW: 1.5, halfD: 1.1, height: 3.0, yaw: 0, variant: 0 },

    // === 7. KAWASAN WISATA ALAM & LEMBAH BARAT ===
    { id: 's1x-w1', kind: 'pendopo_hall', x: -75.0, z: 12.0, halfW: 2.4, halfD: 2.1, height: 4.4, yaw: Math.PI / 2, variant: 0 },
    { id: 's1x-w2', kind: 'stilt_house', x: -82.0, z: 24.0, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: 0, variant: 1 },
    { id: 's1x-w3', kind: 'pocket_park', x: -72.0, z: -16.0, halfW: 1.9, halfD: 1.9, height: 2.5, yaw: 0, variant: 1 },
    { id: 's1x-w4', kind: 'joglo_house', x: -86.0, z: -12.0, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 2 },
    { id: 's1x-w5', kind: 'cafe_terrace', x: -72.0, z: -26.0, halfW: 2.0, halfD: 1.7, height: 3.6, yaw: Math.PI / 2, variant: 0 },
    { id: 's1x-w6', kind: 'stilt_house', x: -74.0, z: 32.0, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: -Math.PI / 2, variant: 3 },
    { id: 's1x-w7', kind: 'joglo_house', x: -94.0, z: 14.0, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: 0, variant: 1 },
    { id: 's1x-w8', kind: 'cultural_hall', x: -73.0, z: 66.0, halfW: 2.7, halfD: 2.1, height: 5.0, yaw: Math.PI, variant: 1 },
    { id: 's1x-w9', kind: 'stilt_house', x: -86.0, z: 66.0, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: Math.PI, variant: 0 },
  ];
}

export function getStage1CrowdPatrols(): CrowdPatrolDef[] {
  return [
    {
      id: 'c1x-porter-1',
      role: 'porter',
      shirtColor: 0x92400e,
      pantsColor: 0x451a03,
      hatColor: 0xd97706,
      prop: 'crate',
      speed: 2.4,
      pauseSeconds: 1.2,
      waypoints: [{ x: 54.0, z: -1.5 }, { x: 82.0, z: -1.5 }, { x: 82.0, z: 1.5 }, { x: 54.0, z: 1.5 }],
    },
    {
      id: 'c1x-porter-2',
      role: 'porter',
      shirtColor: 0xb45309,
      pantsColor: 0x292524,
      hatColor: 0xfef3c7,
      prop: 'crate',
      speed: 2.2,
      pauseSeconds: 1.4,
      waypoints: [{ x: 48.0, z: -30.5 }, { x: 70.0, z: -30.5 }, { x: 48.5, z: -22.0 }, { x: 48.5, z: -30.5 }],
    },
    {
      id: 'c1x-fisher-1',
      role: 'fisher',
      shirtColor: 0x0e7490,
      pantsColor: 0x334155,
      hatColor: 0xeab308,
      prop: 'rod',
      behavior: 'fish',
      tunicStyle: 'sarung',
      speed: 1.6,
      pauseSeconds: 3.2,
      waypoints: [{ x: 56.0, z: -32.2 }, { x: 71.0, z: -32.2 }, { x: 71.0, z: -29.0 }, { x: 56.0, z: -29.0 }],
    },
    {
      id: 'c1x-trader-1',
      role: 'trader',
      shirtColor: 0xd97706,
      pantsColor: 0x44403c,
      hatColor: 0xf59e0b,
      prop: 'basket',
      speed: 2.2,
      pauseSeconds: 1.8,
      waypoints: [{ x: 22.0, z: -22.0 }, { x: 22.0, z: -4.0 }, { x: 24.0, z: -4.0 }, { x: 24.0, z: -22.0 }],
    },
    {
      id: 'c1x-buyer-1',
      role: 'buyer',
      shirtColor: 0x0369a1,
      pantsColor: 0x334155,
      hatColor: 0xfef3c7,
      prop: 'basket',
      tunicStyle: 'sarung',
      speed: 2.1,
      pauseSeconds: 2.0,
      waypoints: [{ x: 22.0, z: 4.0 }, { x: 22.0, z: 22.0 }, { x: 26.0, z: 22.0 }, { x: 26.0, z: 4.0 }],
    },
    {
      id: 'c1x-shop-1',
      role: 'shopkeeper',
      shirtColor: 0xbe123c,
      pantsColor: 0x451a03,
      hatColor: 0xfef08a,
      prop: 'none',
      behavior: 'tend_stall',
      tunicStyle: 'kebaya',
      speed: 1.1,
      pauseSeconds: 2.8,
      waypoints: [{ x: 29.0, z: -15.0 }, { x: 34.5, z: -15.0 }, { x: 34.5, z: -13.0 }],
    },
    {
      id: 'c1x-citizen-1',
      role: 'citizen',
      shirtColor: 0x15803d,
      pantsColor: 0x3f2e21,
      hatColor: 0xfde68a,
      prop: 'none',
      speed: 2.4,
      pauseSeconds: 1.0,
      waypoints: [{ x: -24.0, z: -2.0 }, { x: 18.0, z: -2.0 }, { x: 18.0, z: 2.0 }, { x: -24.0, z: 2.0 }],
    },
    {
      id: 'c1x-citizen-2',
      role: 'citizen',
      shirtColor: 0x0f766e,
      pantsColor: 0x334155,
      hatColor: 0xd97706,
      prop: 'satchel',
      speed: 2.3,
      pauseSeconds: 1.3,
      waypoints: [{ x: -2.0, z: -52.0 }, { x: 2.0, z: -52.0 }, { x: 2.0, z: 42.0 }, { x: -2.0, z: 42.0 }],
    },
    {
      id: 'c1x-child-1',
      role: 'child',
      shirtColor: 0xf97316,
      pantsColor: 0x1d4ed8,
      hatColor: 0xfef08a,
      prop: 'none',
      behavior: 'play_tag',
      scale: 0.72,
      speed: 3.3,
      pauseSeconds: 0.5,
      waypoints: [{ x: -29.0, z: -20.0 }, { x: -29.0, z: 12.0 }, { x: -27.0, z: 12.0 }, { x: -27.0, z: -20.0 }],
    },
    {
      id: 'c1x-child-2',
      role: 'child',
      shirtColor: 0xec4899,
      pantsColor: 0x0f172a,
      hatColor: 0xffffff,
      prop: 'none',
      behavior: 'play_tag',
      scale: 0.7,
      speed: 3.4,
      pauseSeconds: 0.4,
      waypoints: [{ x: -12.0, z: 9.0 }, { x: -15.0, z: 9.0 }, { x: -15.0, z: 13.0 }, { x: -12.0, z: 13.0 }],
    },
    {
      id: 'c1x-tourist-1',
      role: 'tourist',
      shirtColor: 0xe0f2fe,
      pantsColor: 0x78350f,
      hatColor: 0xfde68a,
      prop: 'umbrella',
      tunicStyle: 'casual',
      speed: 1.9,
      pauseSeconds: 2.0,
      waypoints: [{ x: -67.0, z: -2.0 }, { x: -48.0, z: -2.0 }, { x: -48.0, z: 2.0 }, { x: -67.0, z: 2.0 }],
    },
    {
      id: 'c1x-worker-1',
      role: 'worker',
      shirtColor: 0xb45309,
      pantsColor: 0x1e293b,
      hatColor: 0xfacc15,
      prop: 'crate',
      speed: 2.2,
      pauseSeconds: 1.4,
      waypoints: [{ x: 10.0, z: 35.5 }, { x: 35.0, z: 35.5 }, { x: 35.0, z: 37.2 }, { x: 10.0, z: 37.2 }],
    },
    {
      id: 'c1x-student-1',
      role: 'citizen',
      shirtColor: 0x2563eb,
      pantsColor: 0x1e293b,
      hatColor: 0xf8fafc,
      prop: 'satchel',
      speed: 2.2,
      pauseSeconds: 1.5,
      waypoints: [{ x: -24.0, z: -54.5 }, { x: 8.0, z: -54.5 }, { x: 8.0, z: -52.8 }, { x: -24.0, z: -52.8 }],
    },
    // 7 additional vibrant citizens across newly densified streets & plazas
    {
      id: 'c1x-promenade-1',
      role: 'tourist',
      shirtColor: 0x0d9488,
      pantsColor: 0x334155,
      hatColor: 0xfef3c7,
      prop: 'umbrella',
      tunicStyle: 'casual',
      speed: 2.0,
      pauseSeconds: 1.8,
      waypoints: [{ x: 49.0, z: -36.0 }, { x: 49.0, z: 22.0 }, { x: 51.0, z: 22.0 }, { x: 51.0, z: -36.0 }],
    },
    {
      id: 'c1x-cafe-guest',
      role: 'citizen',
      shirtColor: 0x9333ea,
      pantsColor: 0x1e293b,
      hatColor: 0xfde68a,
      prop: 'satchel',
      tunicStyle: 'casual',
      speed: 1.9,
      pauseSeconds: 2.4,
      waypoints: [{ x: 21.5, z: -42.0 }, { x: 28.0, z: -42.0 }, { x: 28.0, z: -34.0 }, { x: 21.5, z: -34.0 }],
    },
    {
      id: 'c1x-boutique-visitor',
      role: 'buyer',
      shirtColor: 0xe11d48,
      pantsColor: 0x1c1917,
      hatColor: 0xfef08a,
      prop: 'basket',
      tunicStyle: 'kebaya',
      speed: 1.8,
      pauseSeconds: 2.2,
      waypoints: [{ x: -12.0, z: 16.5 }, { x: -4.0, z: 16.5 }, { x: -4.0, z: 4.5 }, { x: -12.0, z: 4.5 }],
    },
    {
      id: 'c1x-alun-guard',
      role: 'citizen',
      shirtColor: 0x1e3a8a,
      pantsColor: 0x0f172a,
      hatColor: 0xf59e0b,
      prop: 'none',
      speed: 2.0,
      pauseSeconds: 1.6,
      waypoints: [{ x: -11.0, z: -7.5 }, { x: 4.0, z: -7.5 }, { x: 4.0, z: 7.5 }, { x: -11.0, z: 7.5 }],
    },
    {
      id: 'c1x-kampung-elder',
      role: 'citizen',
      shirtColor: 0x7c2d12,
      pantsColor: 0x292524,
      hatColor: 0x78350f,
      prop: 'satchel',
      tunicStyle: 'sarung',
      speed: 1.5,
      pauseSeconds: 2.5,
      waypoints: [{ x: -31.0, z: -42.0 }, { x: -31.0, z: 26.0 }, { x: -28.0, z: 26.0 }, { x: -28.0, z: -42.0 }],
    },
    {
      id: 'c1x-south-worker',
      role: 'worker',
      shirtColor: 0x4d7c0f,
      pantsColor: 0x1e293b,
      hatColor: 0xfacc15,
      prop: 'crate',
      speed: 2.3,
      pauseSeconds: 1.3,
      waypoints: [{ x: -2.0, z: 62.0 }, { x: 24.0, z: 62.0 }, { x: 24.0, z: 64.0 }, { x: -2.0, z: 64.0 }],
    },
    {
      id: 'c1x-hotel-porter',
      role: 'porter',
      shirtColor: 0x0f766e,
      pantsColor: 0x1e293b,
      hatColor: 0xfef3c7,
      prop: 'satchel',
      speed: 2.1,
      pauseSeconds: 1.6,
      waypoints: [{ x: 22.0, z: 24.5 }, { x: 28.0, z: 24.5 }, { x: 28.0, z: 34.0 }, { x: 22.0, z: 34.0 }],
    },
  ];
}

function addSegmentedEnterableWalls(b: EnterableBuildingDef, colliders: AabbCollider[]) {
  const t = 0.35; // wall thickness
  const minX = b.x - b.halfW;
  const maxX = b.x + b.halfW;
  const minZ = b.z - b.halfD;
  const maxZ = b.z + b.halfD;
  const h = b.wallHeight;

  // North wall (z = minZ)
  if (b.doorSide === 'north') {
    colliders.push(
      { id: `${b.id}-n1`, minX, maxX: b.x - b.doorHalfWidth, minZ, maxZ: minZ + t, maxY: h, kind: 'building' },
      { id: `${b.id}-n2`, minX: b.x + b.doorHalfWidth, maxX, minZ, maxZ: minZ + t, maxY: h, kind: 'building' }
    );
  } else {
    colliders.push({ id: `${b.id}-n`, minX, maxX, minZ, maxZ: minZ + t, maxY: h, kind: 'building' });
  }

  // South wall (z = maxZ)
  if (b.doorSide === 'south') {
    colliders.push(
      { id: `${b.id}-s1`, minX, maxX: b.x - b.doorHalfWidth, minZ: maxZ - t, maxZ, maxY: h, kind: 'building' },
      { id: `${b.id}-s2`, minX: b.x + b.doorHalfWidth, maxX, minZ: maxZ - t, maxZ, maxY: h, kind: 'building' }
    );
  } else {
    colliders.push({ id: `${b.id}-s`, minX, maxX, minZ: maxZ - t, maxZ, maxY: h, kind: 'building' });
  }

  // West wall (x = minX)
  if (b.doorSide === 'west') {
    colliders.push(
      { id: `${b.id}-w1`, minX, maxX: minX + t, minZ, maxZ: b.z - b.doorHalfWidth, maxY: h, kind: 'building' },
      { id: `${b.id}-w2`, minX, maxX: minX + t, minZ: b.z + b.doorHalfWidth, maxZ, maxY: h, kind: 'building' }
    );
  } else {
    colliders.push({ id: `${b.id}-w`, minX, maxX: minX + t, minZ, maxZ, maxY: h, kind: 'building' });
  }

  // East wall (x = maxX)
  if (b.doorSide === 'east') {
    colliders.push(
      { id: `${b.id}-e1`, minX: maxX - t, maxX, minZ, maxZ: b.z - b.doorHalfWidth, maxY: h, kind: 'building' },
      { id: `${b.id}-e2`, minX: maxX - t, maxX, minZ: b.z + b.doorHalfWidth, maxZ, maxY: h, kind: 'building' }
    );
  } else {
    colliders.push({ id: `${b.id}-e`, minX: maxX - t, maxX, minZ, maxZ, maxY: h, kind: 'building' });
  }
}

export function buildStage1WorldColliders(
  placedBuildings: PlacedBuildingInstance[]
): AabbCollider[] {
  const colliders: AabbCollider[] = [];

  // 1. Landmarks
  for (const lm of getStage1Landmarks()) {
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

  // 2. Scenery buildings (except open pocket parks)
  for (const sc of getStage1SceneryBuildings()) {
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

  // 3. Enterable Buildings (4 segmented perimeter walls leaving open doorway >= 2.9m)
  for (const eb of STAGE1_ENTERABLE_BUILDINGS) {
    addSegmentedEnterableWalls(eb, colliders);
  }

  // 4. Player Free-Placed & Constructing Buildings
  for (const pb of placedBuildings) {
    const def = BUILDING_CATALOG.find((b) => b.id === pb.buildingId);
    if (!def) continue;
    const isPark = def.id === 'taman-kota' || def.id === 'hutan-kota';
    const halfSpan = isPark ? 1.2 : 2.4;
    const height = pb.isConstructing ? 2.8 : Math.max(2.6, def.heightLevel * 2.3 + 1.2);
    colliders.push({
      id: pb.id,
      minX: pb.x - halfSpan,
      maxX: pb.x + halfSpan,
      minZ: pb.z - halfSpan,
      maxZ: pb.z + halfSpan,
      maxY: height,
      kind: 'building',
    });
  }

  // 5. Ship Deck Safety Bulwarks (keep player safely on deck except at gangway opening!)
  for (const ship of STAGE1_SHIP_DECKS) {
    const railH = (ship.sternDeckY ?? ship.deckY) + 1.3;
    // Bow / Stern X caps
    colliders.push(
      {
        id: `${ship.id}-stern`,
        minX: ship.minX - 0.5,
        maxX: ship.minX + 0.15,
        minZ: ship.minZ,
        maxZ: ship.maxZ,
        maxY: railH,
        kind: 'landmark',
      },
      {
        id: `${ship.id}-bow`,
        minX: ship.maxX - 0.15,
        maxX: ship.maxX + 0.5,
        minZ: ship.minZ,
        maxZ: ship.maxZ,
        maxY: railH,
        kind: 'landmark',
      }
    );
    // Outer Z rail & Pier-side Z rail split around gangway
    const gw = ship.gangway;
    if (ship.id === 'ship-pinisi') {
      colliders.push(
        {
          id: `${ship.id}-outer`,
          minX: ship.minX,
          maxX: ship.maxX,
          minZ: ship.maxZ - 0.15,
          maxZ: ship.maxZ + 0.5,
          maxY: railH,
          kind: 'landmark',
        },
        {
          id: `${ship.id}-inner-a`,
          minX: ship.minX,
          maxX: gw.minX,
          minZ: ship.minZ - 0.35,
          maxZ: ship.minZ + 0.15,
          maxY: railH,
          kind: 'landmark',
        },
        {
          id: `${ship.id}-inner-b`,
          minX: gw.maxX,
          maxX: ship.maxX,
          minZ: ship.minZ - 0.35,
          maxZ: ship.minZ + 0.15,
          maxY: railH,
          kind: 'landmark',
        }
      );
    } else {
      colliders.push(
        {
          id: `${ship.id}-outer`,
          minX: ship.minX,
          maxX: ship.maxX,
          minZ: ship.minZ - 0.5,
          maxZ: ship.minZ + 0.15,
          maxY: railH,
          kind: 'landmark',
        },
        {
          id: `${ship.id}-inner-a`,
          minX: ship.minX,
          maxX: gw.minX,
          minZ: ship.maxZ - 0.15,
          maxZ: ship.maxZ + 0.35,
          maxY: railH,
          kind: 'landmark',
        },
        {
          id: `${ship.id}-inner-b`,
          minX: gw.maxX,
          maxX: ship.maxX,
          minZ: ship.maxZ - 0.15,
          maxZ: ship.maxZ + 0.35,
          maxY: railH,
          kind: 'landmark',
        }
      );
    }
  }

  // 6. On-foot Shoreline & Pier Water Guard Colliders (prevents walking straight into ocean; use boat to sail!)
  colliders.push(
    { id: 's1-water-n', minX: 54.0, maxX: 92, minZ: -95, maxZ: -34.2, maxY: 1.8, kind: 'water' },
    { id: 's1-water-m1', minX: 54.0, maxX: 92, minZ: -27.3, maxZ: -12.0, maxY: 1.8, kind: 'water' },
    { id: 's1-water-m2', minX: 54.0, maxX: 62.8, minZ: -12.0, maxZ: -4.4, maxY: 1.8, kind: 'water' },
    { id: 's1-water-m3', minX: 54.0, maxX: 63.8, minZ: 4.4, maxZ: 12.0, maxY: 1.8, kind: 'water' },
    { id: 's1-water-m4', minX: 54.0, maxX: 92, minZ: 12.0, maxZ: 24.8, maxY: 1.8, kind: 'water' },
    { id: 's1-water-s', minX: 54.0, maxX: 92, minZ: 31.7, maxZ: 95, maxY: 1.8, kind: 'water' },
    { id: 's1-pier-main-end', minX: 85.1, maxX: 92, minZ: -4.5, maxZ: 4.5, maxY: 1.8, kind: 'water' },
    { id: 's1-pier-north-end', minX: 74.1, maxX: 92, minZ: -34.5, maxZ: -27.0, maxY: 1.8, kind: 'water' },
    { id: 's1-pier-south-end', minX: 72.1, maxX: 92, minZ: 24.5, maxZ: 32.0, maxY: 1.8, kind: 'water' }
  );

  return colliders;
}

function resolveCircleAabb(
  x: number,
  z: number,
  r: number,
  box: AabbCollider
): { x: number; z: number } {
  const closestX = Math.max(box.minX, Math.min(x, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));

  const dx = x - closestX;
  const dz = z - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq >= r * r) {
    return { x, z };
  }

  if (distSq < 1e-8) {
    const leftPen = x - box.minX;
    const rightPen = box.maxX - x;
    const topPen = z - box.minZ;
    const bottomPen = box.maxZ - z;
    const minPen = Math.min(leftPen, rightPen, topPen, bottomPen);
    if (minPen === leftPen) return { x: box.minX - r, z };
    if (minPen === rightPen) return { x: box.maxX + r, z };
    if (minPen === topPen) return { x, z: box.minZ - r };
    return { x, z: box.maxZ + r };
  }

  const dist = Math.sqrt(distSq);
  const overlap = r - dist;
  return {
    x: x + (dx / dist) * overlap,
    z: z + (dz / dist) * overlap,
  };
}

export function stepStage1PlayerPhysics(
  player: Player3DState,
  input: PlayerMoveInput,
  cameraYaw: number,
  colliders: AabbCollider[],
  dtSeconds: number
): Player3DState {
  const dt = Math.min(Math.max(dtSeconds, 0), 0.05);

  const fwdX = Math.sin(cameraYaw);
  const fwdZ = Math.cos(cameraYaw);
  const rightX = -Math.cos(cameraYaw);
  const rightZ = Math.sin(cameraYaw);

  let wishX = fwdX * input.forward + rightX * input.right;
  let wishZ = fwdZ * input.forward + rightZ * input.right;
  const wishMag = Math.hypot(wishX, wishZ);

  if (wishMag > 1e-4) {
    wishX /= wishMag;
    wishZ /= wishMag;
  } else {
    wishX = 0;
    wishZ = 0;
  }

  const targetSpeed = wishMag > 1e-4 ? (input.sprint ? SPRINT_SPEED : WALK_SPEED) : 0;
  const vx = wishX * targetSpeed;
  const vz = wishZ * targetSpeed;

  let vy = player.vy;
  let grounded = player.grounded;

  if (input.jump && grounded) {
    vy = JUMP_VELOCITY;
    grounded = false;
  }

  vy -= GRAVITY * dt;

  let nextX = player.x + vx * dt;
  let nextZ = player.z + vz * dt;
  let nextY = player.y + vy * dt;

  nextX = Math.max(STAGE1_MIN_X, Math.min(STAGE1_MAX_X, nextX));
  nextZ = Math.max(STAGE1_MIN_Z, Math.min(STAGE1_MAX_Z, nextZ));

  for (let pass = 0; pass < 2; pass++) {
    for (const box of colliders) {
      if (nextY >= box.maxY - 0.15) continue;
      const resolved = resolveCircleAabb(nextX, nextZ, PLAYER_RADIUS, box);
      nextX = resolved.x;
      nextZ = resolved.z;
    }
  }

  nextX = Math.max(STAGE1_MIN_X, Math.min(STAGE1_MAX_X, nextX));
  nextZ = Math.max(STAGE1_MIN_Z, Math.min(STAGE1_MAX_Z, nextZ));

  const floorY = stage1GroundHeightAt(nextX, nextZ);
  if (nextY <= floorY) {
    nextY = floorY;
    vy = 0;
    grounded = true;
  } else {
    grounded = false;
  }

  let facingYaw = player.facingYaw;
  if (targetSpeed > 0.1) {
    const desiredYaw = Math.atan2(wishX, wishZ);
    let diff = desiredYaw - facingYaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const turnAlpha = 1 - Math.exp(-14 * dt);
    facingYaw += diff * turnAlpha;
  }

  const movedDist = Math.hypot(nextX - player.x, nextZ - player.z);
  const actualSpeed = dt > 1e-5 ? movedDist / dt : 0;
  const walkCycle = actualSpeed > 0.2 ? player.walkCycle + movedDist * 1.45 : player.walkCycle;

  return {
    x: nextX,
    y: nextY,
    z: nextZ,
    vx,
    vy,
    vz,
    facingYaw,
    grounded,
    speed: actualSpeed,
    walkCycle,
  };
}

export interface VehicleRuntimeState {
  def: RideableVehicleDef;
  x: number;
  y: number;
  z: number;
  yaw: number;
  speed: number;
}

export function createInitialVehicles(): VehicleRuntimeState[] {
  return STAGE1_VEHICLES.map((def) => ({
    def,
    x: def.spawnX,
    y: def.kind === 'boat' ? -0.15 : stage1GroundHeightAt(def.spawnX, def.spawnZ),
    z: def.spawnZ,
    yaw: def.spawnYaw,
    speed: 0,
  }));
}

export function stepVehiclePhysics(
  vehicle: VehicleRuntimeState,
  input: { forward: number; right: number },
  colliders: AabbCollider[],
  dtSeconds: number
): VehicleRuntimeState {
  const dt = Math.min(Math.max(dtSeconds, 0), 0.05);
  const accel = 18.0;
  const drag = 5.0;

  let speed = vehicle.speed;
  if (input.forward !== 0) {
    speed += input.forward * accel * dt;
  } else {
    speed -= Math.sign(speed) * Math.min(Math.abs(speed), drag * dt * 2.5);
  }
  speed = Math.max(-vehicle.def.maxSpeed * 0.45, Math.min(vehicle.def.maxSpeed, speed));

  const turnRate = vehicle.def.kind === 'boat' ? 1.85 : 2.35;
  const turnSign = speed >= -0.2 ? 1 : -1;
  const yaw = vehicle.yaw - input.right * turnRate * turnSign * dt;

  let nextX = vehicle.x + Math.sin(yaw) * speed * dt;
  let nextZ = vehicle.z + Math.cos(yaw) * speed * dt;

  if (vehicle.def.kind === 'boat') {
    // Boat stays in open bay water (east of shoreline x=54, avoiding island center and piers)
    nextX = Math.max(54.5, Math.min(148.0, nextX));
    nextZ = Math.max(-88.0, Math.min(88.0, nextZ));

    // Keep clear of main pier body
    if (nextX < 86.0 && Math.abs(nextZ) < 5.0) {
      nextZ = nextZ >= 0 ? 5.0 : -5.0;
    }
    // Keep boat off Lighthouse Island dry core
    const islD = Math.hypot(nextX - LIGHTHOUSE_ISLAND.x, nextZ - LIGHTHOUSE_ISLAND.z);
    if (islD < 9.5 && islD > 0.01) {
      nextX = LIGHTHOUSE_ISLAND.x + ((nextX - LIGHTHOUSE_ISLAND.x) / islD) * 9.5;
      nextZ = LIGHTHOUSE_ISLAND.z + ((nextZ - LIGHTHOUSE_ISLAND.z) / islD) * 9.5;
    }

    return {
      def: vehicle.def,
      x: nextX,
      y: -0.15,
      z: nextZ,
      yaw,
      speed,
    };
  }

  // Land vehicles stay west of shoreline and collide cleanly with buildings
  nextX = Math.max(STAGE1_MIN_X + 2, Math.min(STAGE1_SHORELINE_X - 1.2, nextX));
  nextZ = Math.max(STAGE1_MIN_Z + 2, Math.min(STAGE1_MAX_Z - 2, nextZ));

  for (const box of colliders) {
    if (box.kind === 'water') continue;
    const res = resolveCircleAabb(nextX, nextZ, 0.95, box);
    nextX = res.x;
    nextZ = res.z;
  }

  return {
    def: vehicle.def,
    x: nextX,
    y: stage1GroundHeightAt(nextX, nextZ),
    z: nextZ,
    yaw,
    speed,
  };
}

export function validateFreeBuildingPlacement(
  buildingId: string,
  x: number,
  z: number,
  placedBuildings: PlacedBuildingInstance[],
  playerX: number,
  playerZ: number
): { valid: boolean; reason: string } {
  const def = BUILDING_CATALOG.find((b) => b.id === buildingId);
  if (!def) return { valid: false, reason: 'Jenis bangunan tidak ditemukan.' };

  if (x < -104 || x > 86 || z < -88 || z > 88) {
    return { valid: false, reason: 'Di luar batas wilayah pembangunan Stage 1.' };
  }

  const isPort = buildingId === 'pelabuhan-nusantara';
  if (isPort) {
    if (x < 48.0 || x > 62.0 || Math.abs(z) > 46.0) {
      return { valid: false, reason: 'Pelabuhan Dagang harus dibangun di garis pesisir timur.' };
    }
  } else {
    if (x > STAGE1_SHORELINE_X - 3.5) {
      return { valid: false, reason: 'Area perairan hanya cocok untuk Pelabuhan Dagang.' };
    }
  }

  // Keep central roads clear
  const onMainEW = Math.abs(z) < 4.2 && x > -68 && x < 54;
  const onMainNS = Math.abs(x) < 4.2 && z > -74 && z < 78;
  const onMarketAve = Math.abs(x - 21.5) < 3.8 && z > -50 && z < 50;
  const onWestAve = Math.abs(x + 29.5) < 3.8 && z > -68 && z < 52;
  const onEduAve = Math.abs(z + 53.5) < 3.8 && x > -50 && x < 44;
  const onIndAve = Math.abs(z - 36.0) < 3.8 && x > -34 && x < 48;
  if (onMainEW || onMainNS || onMarketAve || onWestAve || onEduAve || onIndAve) {
    return { valid: false, reason: 'Tidak boleh menutup jalan raya atau jembatan kota.' };
  }

  // Keep river channel clear
  const inRiverNS = x >= -64.0 && x <= -52.0 && z >= -48 && z <= 61;
  const inRiverEW = z >= 50.5 && z <= 61.5 && x >= -64 && x <= 53;
  if (inRiverNS || inRiverEW) {
    return { valid: false, reason: 'Area sungai tidak dapat dibangun gedung.' };
  }

  // Keep clear of enterable buildings & doorways
  for (const eb of STAGE1_ENTERABLE_BUILDINGS) {
    if (Math.abs(x - eb.x) < eb.halfW + 3.6 && Math.abs(z - eb.z) < eb.halfD + 3.6) {
      return { valid: false, reason: `Terlalu dekat dengan ${eb.label}.` };
    }
  }

  // Keep clear of landmarks & scenery
  for (const lm of getStage1Landmarks()) {
    if (Math.abs(x - lm.x) < lm.halfW + 3.2 && Math.abs(z - lm.z) < lm.halfD + 3.2) {
      return { valid: false, reason: `Terlalu dekat dengan ${lm.label}.` };
    }
  }
  for (const sc of getStage1SceneryBuildings()) {
    if (Math.abs(x - sc.x) < sc.halfW + 2.8 && Math.abs(z - sc.z) < sc.halfD + 2.8) {
      return { valid: false, reason: 'Lahan sudah terisi bangunan warga/pasar.' };
    }
  }

  // Keep clear of existing placed buildings
  for (const pb of placedBuildings) {
    if (Math.hypot(x - pb.x, z - pb.z) < 5.8) {
      return { valid: false, reason: 'Terlalu dekat dengan bangunan yang sudah ditempatkan.' };
    }
  }

  // Avoid dropping directly on player
  if (Math.hypot(x - playerX, z - playerZ) < 2.2) {
    return { valid: false, reason: 'Berjalanlah sedikit menjauh agar lokasi tidak menimpa karakter.' };
  }

  return { valid: true, reason: 'Lokasi ideal — siap dibangun!' };
}

export type Stage1Interactable =
  | { kind: 'npc'; npc: NpcWaypoint; distance: number }
  | { kind: 'pickup'; pickup: WorldPickupDef; distance: number }
  | { kind: 'collectible'; collectible: CollectibleDef; distance: number }
  | { kind: 'delivery'; delivery: DeliverySpotDef; distance: number }
  | { kind: 'wardrobe_mirror'; spot: typeof STAGE1_WARDROBE_MIRROR_SPOT; distance: number }
  | { kind: 'placed_building'; instance: PlacedBuildingInstance; distance: number }
  | { kind: 'landmark'; landmark: StageLandmarkDef; distance: number }
  | { kind: 'vehicle'; vehicle: VehicleRuntimeState; distance: number }
  | { kind: 'stage_transition'; targetStage: 2; label: string; distance: number };

export function findNearestStage1Interactable(
  playerX: number,
  playerZ: number,
  options: {
    collectedPickups: string[];
    collectedArtifacts: string[];
    completedDeliveries: string[];
    placedBuildings: PlacedBuildingInstance[];
    vehicles: VehicleRuntimeState[];
  }
): Stage1Interactable | null {
  const candidates: Stage1Interactable[] = [];

  for (const pk of STAGE1_WORLD_PICKUPS) {
    if (options.collectedPickups.includes(pk.id)) continue;
    const dist = Math.hypot(playerX - pk.x, playerZ - pk.z);
    if (dist <= 3.6) {
      candidates.push({ kind: 'pickup', pickup: pk, distance: dist * 0.72 });
    }
  }

  for (const col of STAGE1_COLLECTIBLES) {
    if (options.collectedArtifacts.includes(col.id)) continue;
    const dist = Math.hypot(playerX - col.x, playerZ - col.z);
    if (dist <= 3.6) {
      candidates.push({ kind: 'collectible', collectible: col, distance: dist * 0.72 });
    }
  }

  for (const del of STAGE1_DELIVERY_SPOTS) {
    if (options.completedDeliveries.includes(del.id)) continue;
    const dist = Math.hypot(playerX - del.x, playerZ - del.z);
    if (dist <= 3.8) {
      candidates.push({ kind: 'delivery', delivery: del, distance: dist * 0.76 });
    }
  }

  const mirrorDist = Math.hypot(
    playerX - STAGE1_WARDROBE_MIRROR_SPOT.x,
    playerZ - STAGE1_WARDROBE_MIRROR_SPOT.z
  );
  if (mirrorDist <= 3.0) {
    candidates.push({
      kind: 'wardrobe_mirror',
      spot: STAGE1_WARDROBE_MIRROR_SPOT,
      distance: mirrorDist * 0.65,
    });
  }

  for (const npc of getStage1Npcs()) {
    const dist = Math.hypot(playerX - npc.x, playerZ - npc.z);
    if (dist <= 3.8) {
      candidates.push({ kind: 'npc', npc, distance: dist * 0.82 });
    }
  }

  for (const pb of options.placedBuildings) {
    const dist = Math.hypot(playerX - pb.x, playerZ - pb.z);
    if (dist <= 4.6) {
      candidates.push({ kind: 'placed_building', instance: pb, distance: dist + 0.25 });
    }
  }

  for (const lm of getStage1Landmarks()) {
    const edgeDist = Math.hypot(
      Math.max(0, Math.abs(playerX - lm.x) - lm.halfW),
      Math.max(0, Math.abs(playerZ - lm.z) - lm.halfD)
    );
    if (edgeDist <= 3.0) {
      candidates.push({ kind: 'landmark', landmark: lm, distance: edgeDist + 0.9 });
    }
  }

  for (const veh of options.vehicles) {
    const dist = Math.hypot(playerX - veh.x, playerZ - veh.z);
    if (dist <= 4.2) {
      candidates.push({ kind: 'vehicle', vehicle: veh, distance: dist + 0.45 });
    }
  }

  // Passenger ship Stage 1 -> Stage 2 voyage boarding point (gangway & deck of ship-penumpang)
  const shipDepartureDist = Math.hypot(playerX - 70.6, playerZ - -7.2);
  if (shipDepartureDist <= 5.2) {
    candidates.push({
      kind: 'stage_transition',
      targetStage: 2,
      label: 'Berlayar ke Kota Industri (Stage 2)',
      distance: shipDepartureDist * 0.78,
    });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.distance - b.distance);
  return candidates[0];
}

export function updateStage1Camera(
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

  const insideBuilding = getStage1EnterableBuildingAt(player.x, player.z);
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
  const floorUnderCam = stage1GroundHeightAt(camX, camZ);
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
