import { BUILDING_CATALOG } from './data/bermainData';
import { CharacterId, CityTile, StageNumber, TileTerrain } from './types';

export const TILE_SPACING = 9.0;
export const WORLD_MIN_X = -40.0;
export const WORLD_MAX_X = 41.5;
export const WORLD_MIN_Z = -38.0;
export const WORLD_MAX_Z = 38.0;

export const PIER_HEIGHT = 0.85;

export const PLAYER_RADIUS = 0.55;
export const WALK_SPEED = 7.8;
export const SPRINT_SPEED = 14.2;
export const JUMP_VELOCITY = 9.2;
export const GRAVITY = 24.0;

export const PORTAL_POSITION = { x: 0, z: -30.5 };

export interface AabbCollider {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  maxY: number;
  kind: 'building' | 'landmark' | 'water' | 'portal_pillar';
}

export interface Player3DState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  facingYaw: number;
  grounded: boolean;
  speed: number;
  walkCycle: number;
}

export interface PlayerMoveInput {
  forward: number;
  right: number;
  sprint: boolean;
  jump: boolean;
}

export interface ThirdPersonCamState {
  yaw: number;
  pitch: number;
  distance: number;
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}

export interface NearbyPadInfo {
  row: number;
  col: number;
  x: number;
  z: number;
  terrain: TileTerrain;
  distance: number;
}

export interface NpcWaypoint {
  id: string;
  name: string;
  role: string;
  characterId?: CharacterId;
  x: number;
  z: number;
  facingYaw: number;
  dialogue: string;
  missionHint: string;
  recommendedCategory?: 'perdagangan' | 'industri' | 'teknologi' | 'masyarakat' | 'budaya';
  recommendedBuildingId?: string;
}

export interface StageLandmarkDef {
  id: string;
  label: string;
  kind:
    | 'market'
    | 'warehouse'
    | 'house'
    | 'booth'
    | 'monument'
    | 'factory'
    | 'generator'
    | 'station'
    | 'skyscraper'
    | 'ecodome'
    | 'solar_hub'
    | 'park_gazebo'
    | 'harbor_crane'
    | 'ship_dock'
    | 'water_monitor'
    | 'portal';
  x: number;
  z: number;
  halfW: number;
  halfD: number;
  height: number;
  yaw: number;
  description: string;
  sociologyNote: string;
}

export interface NearbyBuildingInfo {
  row: number;
  col: number;
  x: number;
  z: number;
  buildingId: string;
  name: string;
  functionDesc: string;
  globalizationLink: string;
  distance: number;
}

export type InteractableTarget =
  | { kind: 'pad'; pad: NearbyPadInfo; distance: number }
  | { kind: 'npc'; npc: NpcWaypoint; distance: number }
  | { kind: 'portal'; distance: number }
  | { kind: 'landmark'; landmark: StageLandmarkDef; distance: number }
  | { kind: 'building'; building: NearbyBuildingInfo; distance: number };

export type SceneryBuildingKind =
  | 'joglo_house'
  | 'stilt_house'
  | 'pendopo_hall'
  | 'spice_stall'
  | 'cloth_stall'
  | 'food_stall'
  | 'wooden_warehouse'
  | 'brick_factory'
  | 'brick_foundry'
  | 'worker_rowhouse'
  | 'corner_shop'
  | 'cargo_depot'
  | 'clock_tower'
  | 'eco_skyscraper'
  | 'smart_tower'
  | 'solar_office'
  | 'modern_mall'
  | 'pocket_park'
  | 'ruko_2story'
  | 'hotel_coastal'
  | 'office_colonial'
  | 'apartment_block'
  | 'cafe_terrace'
  | 'cultural_hall'
  | 'clinic_post'
  | 'workshop_open'
  | 'menara_nusantara'
  | 'cyber_tower'
  | 'fintech_bank'
  | 'concert_arena'
  | 'quantum_lab'
  | 'eco_dome';

export interface SceneryBuildingDef {
  id: string;
  kind: SceneryBuildingKind;
  x: number;
  z: number;
  halfW: number;
  halfD: number;
  height: number;
  yaw: number;
  variant: number;
}

export interface CrowdPatrolDef {
  id: string;
  role:
    | 'trader'
    | 'fisher'
    | 'porter'
    | 'citizen'
    | 'worker'
    | 'engineer'
    | 'courier'
    | 'shopkeeper'
    | 'buyer'
    | 'child'
    | 'tourist'
    | 'scientist'
    | 'office'
    | 'robot'
    | 'drone_bot';
  shirtColor: number;
  pantsColor: number;
  hatColor: number;
  prop: 'none' | 'crate' | 'basket' | 'wrench' | 'tablet' | 'satchel' | 'umbrella' | 'rod' | 'holopad';
  behavior?: 'patrol' | 'tend_stall' | 'play_tag' | 'converse' | 'fish';
  scale?: number;
  tunicStyle?: 'sarung' | 'vest' | 'kebaya' | 'apron' | 'casual';
  speed: number;
  pauseSeconds: number;
  waypoints: { x: number; y?: number; z: number }[];
}

/**
 * Organic district layout mapping each 7x7 city tile to natural open-world coordinates
 * clustered around avenues, plazas, and waterfront promenades (non-rigid spacing).
 */
const ORGANIC_OFFSETS: Record<string, { dx: number; dz: number }> = {
  '0,0': { dx: -1.4, dz: -0.8 },
  '0,1': { dx: -0.6, dz: -1.2 },
  '0,2': { dx: -1.2, dz: -0.5 },
  '0,4': { dx: 0.8, dz: -1.1 },
  '0,5': { dx: 0.6, dz: -0.9 },
  '1,0': { dx: -1.5, dz: 0.4 },
  '1,1': { dx: 0.4, dz: 0.8 },
  '1,2': { dx: -0.7, dz: 0.6 },
  '1,4': { dx: 0.9, dz: 0.7 },
  '1,5': { dx: -0.4, dz: 0.9 },
  '2,0': { dx: -1.2, dz: -0.6 },
  '2,1': { dx: 0.5, dz: -0.8 },
  '2,2': { dx: -0.6, dz: -0.9 },
  '2,4': { dx: 0.7, dz: -0.7 },
  '2,5': { dx: -0.5, dz: -0.8 },
  '4,0': { dx: -1.3, dz: 0.8 },
  '4,1': { dx: 0.6, dz: 0.9 },
  '4,2': { dx: -0.8, dz: 0.7 },
  '4,4': { dx: 0.8, dz: 0.7 },
  '4,5': { dx: -0.4, dz: 0.8 },
  '5,0': { dx: -1.4, dz: -0.5 },
  '5,1': { dx: 0.4, dz: -0.7 },
  '5,2': { dx: -0.9, dz: -0.6 },
  '5,4': { dx: 0.9, dz: -0.6 },
  '5,5': { dx: -0.3, dz: -0.7 },
  '6,0': { dx: -1.2, dz: 0.9 },
  '6,1': { dx: 0.5, dz: 1.0 },
  '6,2': { dx: -1.0, dz: 0.8 },
  '6,4': { dx: 1.0, dz: 0.8 },
  '6,5': { dx: 0.4, dz: 1.0 },
};

export function tileToWorld(row: number, col: number): { x: number; z: number } {
  const baseX = (col - 3) * TILE_SPACING;
  const baseZ = (row - 3) * TILE_SPACING;
  const off = ORGANIC_OFFSETS[`${row},${col}`];
  return {
    x: baseX + (off?.dx ?? 0),
    z: baseZ + (off?.dz ?? 0),
  };
}

export function getStageNpcs(stage: StageNumber): NpcWaypoint[] {
  if (stage === 1) {
    return [
      {
        id: 'npc-aditya',
        name: 'Aditya',
        role: 'Arsitek & Perencana Kota (Hiperglobalis)',
        characterId: 'aditya',
        x: 5.2,
        z: -4.4,
        facingYaw: Math.PI * 0.75,
        dialogue:
          'Pelabuhan Nusantara siap menghubungkan rempah lokal ke Jalur Sutra Maritim! Mari perkuat perdagangan dan infrastruktur niaga.',
        missionHint: 'Bangun Pelabuhan Dagang & Pasar Tradisional untuk membuka jalur ekspor.',
        recommendedCategory: 'perdagangan',
        recommendedBuildingId: 'pelabuhan-nusantara',
      },
      {
        id: 'npc-laras',
        name: 'Laras',
        role: 'Peneliti Budaya Lokal (Skeptis)',
        characterId: 'laras',
        x: 2.2,
        z: 5.0,
        facingYaw: -Math.PI * 0.65,
        dialogue:
          'Perdagangan lintas bangsa membawa akulturasi, namun kita wajib membentengi jati diri warga agar tidak luntur.',
        missionHint: 'Bangun Museum Budaya Nusantara & Sekolah Nusantara agar warga siap menghadapi perubahan.',
        recommendedCategory: 'budaya',
        recommendedBuildingId: 'museum-budaya',
      },
      {
        id: 'npc-naya',
        name: 'Naya',
        role: 'Penggerak UMKM Lokal (Transformasionalis)',
        characterId: 'naya',
        x: 13.8,
        z: 4.4,
        facingYaw: -Math.PI * 0.35,
        dialogue:
          'Jangan hanya menjual rempah mentah! Olah hasil bumi kita di Sentra Produksi & Pusat UMKM agar bernilai jual tinggi.',
        missionHint: 'Bangun Pusat UMKM Kreatif atau Sentra Produksi Lokal untuk mengangkat ekonomi warga.',
        recommendedCategory: 'budaya',
        recommendedBuildingId: 'pusat-umkm',
      },
      {
        id: 'npc-syahbandar',
        name: 'Syahbandar Pelabuhan',
        role: 'Pengawas Niaga Jalur Rempah',
        x: 24.4,
        z: -1.8,
        facingYaw: -Math.PI * 0.5,
        dialogue:
          'Kapal dagang dari Tiongkok, Gujarat, dan Timur Tengah menanti muatan cengkih & pala di Dermaga Utama.',
        missionHint: 'Dekati lahan biru di tepi pantai dan tekan E untuk mendirikan Pelabuhan Dagang.',
      },
      {
        id: 'npc-pedagang',
        name: 'Saudagar Pasar Pesisir',
        role: 'Pedagang Komoditas Nusantara',
        x: 13.5,
        z: -13.0,
        facingYaw: 0,
        dialogue:
          'Pasar rempah makin ramai setiap hari! Pastikan pasokan gudang logistik selalu mencukupi.',
        missionHint: 'Selesaikan 4 bangunan Stage 1 & 2 Studi Kasus untuk membuka Gerbang Era Industri.',
      },
      {
        id: 'npc-pedagang-kain',
        name: 'Ibu Sari',
        role: 'Pengrajin & Pedagang Kain Batik',
        x: 10.4,
        z: 15.5,
        facingYaw: -Math.PI / 2,
        dialogue:
          'Motif batik pesisir kami memadukan warna lokal dengan corak sutra dari Gujarat dan Tiongkok!',
        missionHint: 'Bangun Pusat UMKM Kreatif atau Museum Budaya agar seni kain Nusantara tetap lestari.',
        recommendedCategory: 'budaya',
        recommendedBuildingId: 'pusat-umkm',
      },
      {
        id: 'npc-pedagang-kuliner',
        name: 'Pak Joko',
        role: 'Pedagang Kuliner & Rempah Nusantara',
        x: 7.8,
        z: -13.6,
        facingYaw: Math.PI / 2,
        dialogue:
          'Aroma cengkih, pala, dan jahe hangat menarik pembeli dari kampung hingga awak kapal dagang!',
        missionHint: 'Dekati kios pasar sekitar untuk melihat aktivitas jual beli masyarakat Nusantara.',
        recommendedCategory: 'perdagangan',
        recommendedBuildingId: 'pasar-tradisional',
      },
      {
        id: 'npc-nelayan',
        name: 'Pak Bahri',
        role: 'Nelayan Tradisional Dermaga Utara',
        x: 26.8,
        z: -16.8,
        facingYaw: Math.PI * 0.25,
        dialogue:
          'Setiap pagi perahu sampan kami membawa hasil tangkapan segar untuk ditukar dengan rempah di pasar.',
        missionHint: 'Kunjungi Dermaga Utama untuk mengamati derek bongkar muat dan kapal pinisi niaga.',
      },
      {
        id: 'npc-wisatawan',
        name: 'Rania',
        role: 'Wisatawan Jalur Rempah',
        x: 6.2,
        z: 3.6,
        facingYaw: -Math.PI * 0.75,
        dialogue:
          'Luar biasa! Kota pelabuhan ini begitu ramai, penuh lampion pasar, rumah joglo, dan kapal dagang megah.',
        missionHint: 'Jelajahi kawasan pasar, pelabuhan, dan kampung adat untuk melihat interaksi warga.',
      },
    ];
  }

  if (stage === 2) {
    return [
      {
        id: 'npc-aditya',
        name: 'Aditya',
        role: 'Arsitek & Perencana Kota (Hiperglobalis)',
        characterId: 'aditya',
        x: 5.2,
        z: -4.4,
        facingYaw: Math.PI * 0.75,
        dialogue:
          'Revolusi Industri menghadirkan pabrik mekanis, rel kereta logistik, dan generator uap! Produksi kota melesat pesat.',
        missionHint: 'Bangun Pabrik Mekanis & Pusat Perdagangan serta tingkatkan Universitas & Riset.',
        recommendedCategory: 'industri',
        recommendedBuildingId: 'pabrik-industri',
      },
      {
        id: 'npc-laras',
        name: 'Laras',
        role: 'Peneliti Budaya Lokal (Skeptis)',
        characterId: 'laras',
        x: 2.2,
        z: 5.0,
        facingYaw: -Math.PI * 0.65,
        dialogue:
          'Asap pabrik mulai menebal dan buruh bekerja keras. Jangan sampai kesenjangan sosial & polusi menjatuhkan HP Kota!',
        missionHint: 'Imbangi kawasan industri dengan Rumah Sakit Kota & Hutan Kota Berkelanjutan.',
        recommendedCategory: 'masyarakat',
        recommendedBuildingId: 'rumah-sakit',
      },
      {
        id: 'npc-naya',
        name: 'Naya',
        role: 'Penggerak UMKM Lokal (Transformasionalis)',
        characterId: 'naya',
        x: 13.8,
        z: 4.4,
        facingYaw: -Math.PI * 0.35,
        dialogue:
          'Dalam teori Wallerstein, kita jangan berhenti sebagai pengekspor bahan mentah! Kuasai riset & hilirisasi produk.',
        missionHint: 'Bangun Universitas & Riset serta Desa Wisata agar ekonomi rakyat ikut naik kelas.',
        recommendedCategory: 'teknologi',
        recommendedBuildingId: 'universitas-kota',
      },
      {
        id: 'npc-insinyur',
        name: 'Kepala Pabrik & Rel',
        role: 'Mandor Kawasan Industri',
        x: 16.0,
        z: -14.2,
        facingYaw: -Math.PI * 0.4,
        dialogue:
          'Kereta kargo uap mengangkut hasil manufaktur ke seluruh penjuru Nusantara. Cek tekanan mesin generator!',
        missionHint: 'Capai 8 bangunan aktif & tuntaskan 2 kasus industri untuk membuka Gerbang Era Digital.',
      },
    ];
  }

  return [
    {
      id: 'npc-aditya',
      name: 'Aditya',
      role: 'Arsitek & Perencana Kota (Hiperglobalis)',
      characterId: 'aditya',
      x: 5.2,
      z: -4.4,
      facingYaw: Math.PI * 0.75,
      dialogue:
        'Selamat datang di Kota Digital Modern! Pencakar langit ramah lingkungan, monorel cepat, dan panel surya kini terhubung global.',
      missionHint: 'Bangun Gedung Smart City, Pusat Teknologi & AI, dan Hub Bisnis Global.',
      recommendedCategory: 'teknologi',
      recommendedBuildingId: 'gedung-smart-city',
    },
    {
      id: 'npc-laras',
      name: 'Laras',
      role: 'Peneliti Budaya Lokal (Skeptis)',
      characterId: 'laras',
      x: 2.2,
      z: 5.0,
      facingYaw: -Math.PI * 0.65,
      dialogue:
        'Teknologi serba cepat rawan memicu cultural lag dan kesenjangan digital bagi lansia serta pedagang kecil. Pastikan akses tetap inklusif!',
      missionHint: 'Jaga keseimbangan Skor >= 70 dengan memadukan IPTEK, Budaya, dan Hutan Kota.',
      recommendedCategory: 'budaya',
      recommendedBuildingId: 'hutan-kota',
    },
    {
      id: 'npc-naya',
      name: 'Naya',
      role: 'Penggerak UMKM Lokal (Transformasionalis)',
      characterId: 'naya',
      x: 13.8,
      z: 4.4,
      facingYaw: -Math.PI * 0.35,
      dialogue:
        'Inilah puncak glokalisasi! Produk batik dan kerajinan UMKM Nusantara mendunia lewat e-commerce tanpa kehilangan jati diri.',
      missionHint: 'Capai 12 bangunan aktif, Skor >= 70, dan selesaikan seluruh kasus glokalisasi.',
      recommendedCategory: 'budaya',
      recommendedBuildingId: 'pusat-umkm',
    },
    {
      id: 'npc-inovator',
      name: 'Koordinator Smart City',
      role: 'Pengelola Energi Hijau & Monorel',
      x: 10.5,
      z: -4.2,
      facingYaw: -Math.PI * 0.65,
      dialogue:
        'Turbin angin lepas pantai dan kubah konservatori menjaga udara kota tetap bersih meski aktivitas digital berjalan 24 jam.',
      missionHint: 'Jelajahi taman danau kota serta pantau keseimbangan tiga pilar globalisasi.',
    },
  ];
}

export function getStageLandmarks(stage: StageNumber): StageLandmarkDef[] {
  if (stage === 1) {
    return [
      {
        id: 'lm-pasar-1',
        label: 'Pasar Rempah Utara',
        kind: 'market',
        x: 13.5,
        z: -15.5,
        halfW: 2.2,
        halfD: 1.6,
        height: 3.2,
        yaw: 0,
        description: 'Kios rempah-rempah cengkih, pala, lada, dan kain tenun Nusantara.',
        sociologyNote: 'Pasar menjadi ruang interaksi sosial dan akulturasi antarpedagang Nusantara dan mancanegara.',
      },
      {
        id: 'lm-pasar-2',
        label: 'Kios Kain & Keramik',
        kind: 'market',
        x: 13.5,
        z: 15.5,
        halfW: 2.2,
        halfD: 1.6,
        height: 3.2,
        yaw: Math.PI,
        description: 'Sentra pertukaran keramik Tiongkok, sutra India, dan batik pesisir.',
        sociologyNote: 'Pertukaran budaya materiil memperkaya corak seni tanpa menghapus identitas lokal.',
      },
      {
        id: 'lm-gudang-1',
        label: 'Gudang Rempah Kuno',
        kind: 'warehouse',
        x: 13.5,
        z: -24.8,
        halfW: 2.9,
        halfD: 2.2,
        height: 4.5,
        yaw: 0,
        description: 'Lumbung penyimpanan hasil bumi dan peti rempah sebelum dimuat ke kapal layar.',
        sociologyNote: 'Tata kelola logistik menjaga stabilitas harga agar petani lokal tidak dirugikan tengkulak.',
      },
      {
        id: 'lm-syahbandar',
        label: 'Pos Syahbandar Pelabuhan',
        kind: 'booth',
        x: 20.6,
        z: -6.2,
        halfW: 1.9,
        halfD: 1.7,
        height: 3.6,
        yaw: -Math.PI / 2,
        description: 'Kantor pengawas pelabuhan, penimbang komoditas, dan pencatat bea kapal niaga.',
        sociologyNote: 'Regulasi pelabuhan mencegah monopoli kongsi dagang asing di era perdagangan kuno.',
      },
      {
        id: 'lm-rumah-1',
        label: 'Permukiman Rumah Adat Barat Laut',
        kind: 'house',
        x: -33.2,
        z: -13.5,
        halfW: 2.4,
        halfD: 2.1,
        height: 4.2,
        yaw: Math.PI / 2,
        description: 'Rumah panggung & pendopo kayu tradisional masyarakat pesisir Nusantara.',
        sociologyNote: 'Arsitektur tradisional mencerminkan kearifan lokal terhadap iklim tropis dan gotong royong.',
      },
      {
        id: 'lm-rumah-2',
        label: 'Permukiman Rumah Adat Barat Daya',
        kind: 'house',
        x: -33.2,
        z: 13.5,
        halfW: 2.4,
        halfD: 2.1,
        height: 4.2,
        yaw: Math.PI / 2,
        description: 'Kampung pengrajin perahu dan penenun tradisional Nusantara.',
        sociologyNote: 'Komunitas lokal menjadi penopang utama ketahanan budaya di tengah arus globalisasi awal.',
      },
      {
        id: 'lm-rumah-3',
        label: 'Pendopo Warga Selatan',
        kind: 'house',
        x: -13.5,
        z: 32.5,
        halfW: 2.6,
        halfD: 2.2,
        height: 4.4,
        yaw: Math.PI,
        description: 'Balai musyawarah warga dan tempat pertunjukan seni rakyat.',
        sociologyNote: 'Musyawarah dan kohesi sosial menjaga harmoni masyarakat saat pendatang mulai berdatangan.',
      },
      {
        id: 'lm-gapura-n',
        label: 'Tugu Gerbang Utara',
        kind: 'monument',
        x: -4.8,
        z: -4.8,
        halfW: 0.9,
        halfD: 0.9,
        height: 4.6,
        yaw: 0,
        description: 'Gapura batu dan puncak keemasan penanda Alun-Alun Niaga Nusantara.',
        sociologyNote: 'Simbol kebanggaan identitas kota maritim yang terbuka terhadap dunia.',
      },
      {
        id: 'lm-gapura-s',
        label: 'Tugu Gerbang Selatan',
        kind: 'monument',
        x: -4.8,
        z: 4.8,
        halfW: 0.9,
        halfD: 0.9,
        height: 4.6,
        yaw: 0,
        description: 'Pasangan tugu alun-alun yang mengarahkan warga menuju Pelabuhan Utama.',
        sociologyNote: 'Menghubungkan kawasan permukiman tradisional dengan simpul niaga internasional.',
      },
      {
        id: 'lm-derek-pelabuhan',
        label: 'Derek Bongkar Muat Pelabuhan',
        kind: 'harbor_crane',
        x: 30.6,
        z: -2.2,
        halfW: 0.9,
        halfD: 0.75,
        height: 4.8,
        yaw: 0,
        description: 'Alat derek kayu bertali pengerek peti rempah ekspor-impor antara dermaga dan kapal niaga.',
        sociologyNote: 'Teknologi pelabuhan mempercepat pertukaran komoditas lintas samudra sejak era niaga kuno.',
      },
      {
        id: 'lm-anjungan-kapal',
        label: 'Anjungan Kapal Pinisi Niaga',
        kind: 'ship_dock',
        x: 36.8,
        z: 2.1,
        halfW: 0.9,
        halfD: 0.7,
        height: 3.2,
        yaw: Math.PI,
        description: 'Titik tambat kapal layar besar Nusantara yang bersiap mengangkut pala, lada, dan cengkih.',
        sociologyNote: 'Pelayaran maritim Nusantara membuktikan peran aktif masyarakat lokal dalam jejaring global awal.',
      },
    ];
  }

  if (stage === 2) {
    return [
      {
        id: 'lm-s2-factory-1',
        label: 'Pabrik Uap & Peleburan Utama',
        kind: 'factory',
        x: -33.5,
        z: -14.0,
        halfW: 3.3,
        halfD: 2.6,
        height: 7.5,
        yaw: Math.PI / 2,
        description: 'Kompleks pabrik bata merah bertenaga uap dengan cerobong asap dan jalur mekanis.',
        sociologyNote: 'Industrialisasi meningkatkan produksi massal, tetapi menuntut regulasi upah layak dan filter polusi.',
      },
      {
        id: 'lm-s2-factory-2',
        label: 'Pabrik Tekstil & Manufaktur',
        kind: 'factory',
        x: -33.5,
        z: 14.0,
        halfW: 3.3,
        halfD: 2.6,
        height: 7.5,
        yaw: Math.PI / 2,
        description: 'Sentra perakitan barang ekspor berkapasitas besar di kawasan industri barat.',
        sociologyNote: 'Mekanisasi mengubah struktur pekerjaan masyarakat dari agraris menjadi buruh industri.',
      },
      {
        id: 'lm-s2-generator',
        label: 'Stasiun Dinamo & Roda Gigi Kota',
        kind: 'generator',
        x: 13.5,
        z: -14.5,
        halfW: 2.6,
        halfD: 2.4,
        height: 6.2,
        yaw: 0,
        description: 'Pusat pembangkit tenaga uap dan turbin roda gigi penggerak mesin kota.',
        sociologyNote: 'Penguasaan IPTEK energi menentukan apakah kota naik dari Periphery menuju Semi-Periphery.',
      },
      {
        id: 'lm-s2-station',
        label: 'Stasiun Kereta Logistik Nusantara',
        kind: 'station',
        x: 13.5,
        z: 14.5,
        halfW: 3.0,
        halfD: 2.2,
        height: 5.0,
        yaw: Math.PI,
        description: 'Terminal kereta api pengangkut komoditas industri dan hasil tambang menuju dermaga.',
        sociologyNote: 'Transportasi mekanis mempercepat pemampatan ruang-waktu distribusi barang antarwilayah.',
      },
      {
        id: 'lm-s2-warehouse',
        label: 'Gudang Logistik & Kontainer Baja',
        kind: 'warehouse',
        x: 20.6,
        z: -6.2,
        halfW: 2.6,
        halfD: 2.1,
        height: 4.5,
        yaw: -Math.PI / 2,
        description: 'Gudang distribusi ekspor modern di tepi dermaga kapal uap.',
        sociologyNote: 'Integrasi rantai pasok global memerlukan kemandirian SDM lokal agar tidak bergantung asing.',
      },
      {
        id: 'lm-s2-monument-n',
        label: 'Menara Jam Era Industri Utara',
        kind: 'monument',
        x: -4.8,
        z: -4.8,
        halfW: 0.9,
        halfD: 0.9,
        height: 5.2,
        yaw: 0,
        description: 'Menara besi penanda disiplin waktu kerja era industrialisasi.',
        sociologyNote: 'Era industri mengubah ritme kehidupan sosial masyarakat menjadi teratur berbasis jam mesin.',
      },
      {
        id: 'lm-s2-monument-s',
        label: 'Menara Jam Era Industri Selatan',
        kind: 'monument',
        x: -4.8,
        z: 4.8,
        halfW: 0.9,
        halfD: 0.9,
        height: 5.2,
        yaw: 0,
        description: 'Gerbang alun-alun besi baja penghubung kawasan pabrik dan pelabuhan.',
        sociologyNote: 'Kesejahteraan pekerja dan ruang publik harus dijaga di tengah ekspansi pabrik.',
      },
    ];
  }

  // Stage 3: Kota Digital Modern
  return [
    {
      id: 'lm-s3-tower-1',
      label: 'Menara Eco-Tech Nusantara',
      kind: 'skyscraper',
      x: -33.5,
      z: -14.5,
      halfW: 3.0,
      halfD: 3.0,
      height: 12.5,
      yaw: 0,
      description: 'Gedung pencakar langit kaca bertingkat dengan taman vertikal dan panel surya atap.',
      sociologyNote: 'Arsitektur hijau membuktikan kemajuan ekonomi global dapat berjalan seiring kelestarian lingkungan.',
    },
    {
      id: 'lm-s3-tower-2',
      label: 'Pusat Inovasi & Riset Digital',
      kind: 'skyscraper',
      x: -33.5,
      z: 14.5,
      halfW: 3.0,
      halfD: 3.0,
      height: 11.5,
      yaw: 0,
      description: 'Hub startup, riset kecerdasan buatan, dan inkubator UMKM ekspor digital.',
      sociologyNote: 'Penguasaan IPTEK tingkat tinggi menempatkan kota sejajar sebagai pusat inovasi (Core) yang berbudaya.',
    },
    {
      id: 'lm-s3-ecodome',
      label: 'Kubah Konservatori & Taman Botani',
      kind: 'ecodome',
      x: 13.8,
      z: 14.8,
      halfW: 3.1,
      halfD: 3.1,
      height: 5.8,
      yaw: 0,
      description: 'Kubah kaca raksasa pelestarian flora Nusantara sekaligus pusat edukasi ekologi.',
      sociologyNote: 'Respon nyata kota global terhadap krisis iklim melalui pelestarian keanekaragaman hayati lokal.',
    },
    {
      id: 'lm-s3-solar',
      label: 'Stasiun Monorel & Panel Surya',
      kind: 'solar_hub',
      x: 13.8,
      z: -14.8,
      halfW: 3.0,
      halfD: 2.3,
      height: 5.4,
      yaw: 0,
      description: 'Stasiun transportasi publik bebas emisi yang ditenagai energi matahari dan turbin angin.',
      sociologyNote: 'Mobilitas cerdas yang inklusif mengurangi ketimpangan akses ruang kota bagi seluruh warga.',
    },
    {
      id: 'lm-s3-gazebo',
      label: 'Paviliun Danau Taman Kota',
      kind: 'park_gazebo',
      x: -13.6,
      z: -13.6,
      halfW: 1.55,
      halfD: 1.55,
      height: 4.2,
      yaw: 0,
      description: 'Gazebo publik di tengah danau taman hijau untuk interaksi warga dan literasi digital.',
      sociologyNote: 'Ruang ketiga perkotaan menangkal alienasi sosial akibat gaya hidup serba daring.',
    },
    {
      id: 'lm-s3-pillar-n',
      label: 'Gerbang Cahaya Smart City Utara',
      kind: 'monument',
      x: -4.8,
      z: -4.8,
      halfW: 0.9,
      halfD: 0.9,
      height: 5.5,
      yaw: 0,
      description: 'Pilar informasi digital interaktif yang memadukan ornamen Nusantara dan sensor kota.',
      sociologyNote: 'Simbol glokalisasi: wujud modern yang tetap membawa karakter estetika Nusantara.',
    },
    {
      id: 'lm-s3-pillar-s',
      label: 'Gerbang Cahaya Smart City Selatan',
      kind: 'monument',
      x: -4.8,
      z: 4.8,
      halfW: 0.9,
      halfD: 0.9,
      height: 5.5,
      yaw: 0,
      description: 'Pilar penghubung boulevard hijau menuju pantai turbin angin lepas pantai.',
      sociologyNote: 'Menyatukan konektivitas global dengan kenyamanan ruang publik warga.',
    },
  ];
}

/**
 * Dense city buildings, traditional kampung rows, markets, factories, shops, and skyscrapers
 * placed in non-blocking outer districts and staggered mid-block plazas (zero overlap with pads/roads/NPCs).
 */
export function getStageSceneryBuildings(stage: StageNumber): SceneryBuildingDef[] {
  if (stage === 1) {
    return [
      // Western Nusantara Kampung (two lush rows of Joglo & stilt houses)
      { id: 's1-h1', kind: 'joglo_house', x: -33.6, z: -22.5, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 0 },
      { id: 's1-h2', kind: 'stilt_house', x: -33.6, z: -5.8, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: Math.PI / 2, variant: 1 },
      { id: 's1-h3', kind: 'stilt_house', x: -33.6, z: 5.8, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: Math.PI / 2, variant: 2 },
      { id: 's1-h4', kind: 'joglo_house', x: -33.6, z: 22.5, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 3 },
      { id: 's1-h5', kind: 'pendopo_hall', x: -41.0, z: -26.5, halfW: 2.5, halfD: 2.2, height: 4.5, yaw: Math.PI / 2, variant: 0 },
      { id: 's1-h6', kind: 'joglo_house', x: -41.0, z: -13.5, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 1 },
      { id: 's1-h7', kind: 'stilt_house', x: -41.0, z: 0.0, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 2 },
      { id: 's1-h8', kind: 'joglo_house', x: -41.0, z: 13.5, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 0 },
      { id: 's1-h9', kind: 'stilt_house', x: -41.0, z: 26.5, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: Math.PI / 2, variant: 3 },

      // Northern & Southern Kampung Perimeter
      { id: 's1-n1', kind: 'joglo_house', x: -27.2, z: -34.2, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: 0, variant: 1 },
      { id: 's1-n2', kind: 'stilt_house', x: -18.0, z: -34.2, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: 0, variant: 2 },
      { id: 's1-n3', kind: 'wooden_warehouse', x: -9.6, z: -34.2, halfW: 2.3, halfD: 1.9, height: 4.3, yaw: 0, variant: 0 },
      { id: 's1-n4', kind: 'wooden_warehouse', x: 9.6, z: -34.2, halfW: 2.3, halfD: 1.9, height: 4.3, yaw: 0, variant: 1 },
      { id: 's1-n5', kind: 'joglo_house', x: 18.0, z: -34.2, halfW: 2.2, halfD: 1.9, height: 4.2, yaw: 0, variant: 0 },

      { id: 's1-s1', kind: 'stilt_house', x: -27.2, z: 34.2, halfW: 2.1, halfD: 1.8, height: 4.0, yaw: Math.PI, variant: 0 },
      { id: 's1-s2', kind: 'joglo_house', x: -4.8, z: 34.2, halfW: 2.1, halfD: 1.8, height: 4.1, yaw: Math.PI, variant: 2 },
      { id: 's1-s3', kind: 'pendopo_hall', x: 9.6, z: 34.2, halfW: 2.4, halfD: 2.0, height: 4.4, yaw: Math.PI, variant: 1 },
      { id: 's1-s4', kind: 'wooden_warehouse', x: 18.0, z: 34.2, halfW: 2.3, halfD: 1.9, height: 4.3, yaw: Math.PI, variant: 0 },

      // Bustling Mid-Block Spice, Cloth & Food Market Stalls (safe diagonal pockets)
      { id: 's1-m1', kind: 'spice_stall', x: 13.6, z: -5.4, halfW: 1.7, halfD: 1.2, height: 3.0, yaw: Math.PI, variant: 0 },
      { id: 's1-m2', kind: 'cloth_stall', x: 13.6, z: 10.6, halfW: 1.7, halfD: 1.2, height: 3.0, yaw: 0, variant: 1 },
      { id: 's1-m3', kind: 'food_stall', x: 13.6, z: 22.6, halfW: 1.7, halfD: 1.2, height: 3.0, yaw: Math.PI, variant: 2 },
      { id: 's1-m4', kind: 'spice_stall', x: 5.2, z: -22.6, halfW: 1.6, halfD: 1.2, height: 3.0, yaw: -Math.PI / 2, variant: 1 },
      { id: 's1-m5', kind: 'cloth_stall', x: 5.2, z: 13.6, halfW: 1.6, halfD: 1.2, height: 3.0, yaw: -Math.PI / 2, variant: 0 },
      { id: 's1-m6', kind: 'food_stall', x: 5.2, z: -13.6, halfW: 1.6, halfD: 1.2, height: 3.0, yaw: -Math.PI / 2, variant: 2 },

      // Inner Kampung Houses & Pocket Gardens
      { id: 's1-k1', kind: 'joglo_house', x: -13.6, z: -13.6, halfW: 2.0, halfD: 1.7, height: 4.0, yaw: Math.PI / 4, variant: 2 },
      { id: 's1-k2', kind: 'stilt_house', x: -13.6, z: 13.6, halfW: 2.0, halfD: 1.7, height: 4.0, yaw: -Math.PI / 4, variant: 0 },
      { id: 's1-k3', kind: 'joglo_house', x: -22.6, z: -5.2, halfW: 1.9, halfD: 1.7, height: 3.9, yaw: 0, variant: 1 },
      { id: 's1-k4', kind: 'stilt_house', x: -22.6, z: 5.2, halfW: 1.9, halfD: 1.7, height: 3.9, yaw: Math.PI, variant: 3 },
      { id: 's1-k5', kind: 'pocket_park', x: -13.6, z: 22.6, halfW: 1.7, halfD: 1.7, height: 2.5, yaw: 0, variant: 0 },
      { id: 's1-k6', kind: 'pocket_park', x: -22.6, z: -22.6, halfW: 1.7, halfD: 1.7, height: 2.5, yaw: 0, variant: 1 },
      { id: 's1-m7', kind: 'joglo_house', x: 5.2, z: 22.6, halfW: 1.8, halfD: 1.6, height: 4.0, yaw: -Math.PI / 2, variant: 3 },
      { id: 's1-m8', kind: 'stilt_house', x: -5.2, z: -22.6, halfW: 1.8, halfD: 1.6, height: 4.0, yaw: Math.PI / 2, variant: 1 },
      { id: 's1-m9', kind: 'spice_stall', x: 13.6, z: -10.2, halfW: 1.5, halfD: 1.1, height: 3.0, yaw: -Math.PI / 2, variant: 2 },
      { id: 's1-m10', kind: 'food_stall', x: 13.6, z: 19.2, halfW: 1.5, halfD: 1.1, height: 3.0, yaw: -Math.PI / 2, variant: 1 },
      { id: 's1-k7', kind: 'pendopo_hall', x: -13.6, z: -22.6, halfW: 2.0, halfD: 1.8, height: 4.3, yaw: Math.PI / 4, variant: 1 },
      { id: 's1-k8', kind: 'joglo_house', x: -22.6, z: 13.6, halfW: 1.9, halfD: 1.6, height: 3.9, yaw: Math.PI / 2, variant: 2 },
    ];
  }

  if (stage === 2) {
    return [
      // Dense Western Brick Factories & Foundries
      { id: 's2-f1', kind: 'brick_factory', x: -33.6, z: -23.0, halfW: 2.5, halfD: 2.1, height: 7.2, yaw: Math.PI / 2, variant: 0 },
      { id: 's2-f2', kind: 'brick_foundry', x: -33.6, z: -5.8, halfW: 2.4, halfD: 2.0, height: 6.8, yaw: Math.PI / 2, variant: 1 },
      { id: 's2-f3', kind: 'brick_factory', x: -33.6, z: 5.8, halfW: 2.4, halfD: 2.0, height: 7.2, yaw: Math.PI / 2, variant: 2 },
      { id: 's2-f4', kind: 'brick_foundry', x: -33.6, z: 23.0, halfW: 2.5, halfD: 2.1, height: 6.8, yaw: Math.PI / 2, variant: 0 },
      { id: 's2-f5', kind: 'brick_factory', x: -41.5, z: -26.5, halfW: 2.6, halfD: 2.2, height: 7.5, yaw: Math.PI / 2, variant: 1 },
      { id: 's2-f6', kind: 'brick_foundry', x: -41.5, z: -13.5, halfW: 2.6, halfD: 2.2, height: 7.0, yaw: Math.PI / 2, variant: 2 },
      { id: 's2-f7', kind: 'brick_factory', x: -41.5, z: 0.0, halfW: 2.6, halfD: 2.2, height: 7.5, yaw: Math.PI / 2, variant: 0 },
      { id: 's2-f8', kind: 'brick_foundry', x: -41.5, z: 13.5, halfW: 2.6, halfD: 2.2, height: 7.0, yaw: Math.PI / 2, variant: 1 },
      { id: 's2-f9', kind: 'cargo_depot', x: -41.5, z: 26.5, halfW: 2.5, halfD: 2.1, height: 5.0, yaw: Math.PI / 2, variant: 0 },

      // Northern Industrial Line & Depots
      { id: 's2-n1', kind: 'brick_factory', x: -27.2, z: -34.2, halfW: 2.4, halfD: 2.0, height: 7.0, yaw: 0, variant: 1 },
      { id: 's2-n2', kind: 'cargo_depot', x: -18.0, z: -34.2, halfW: 2.3, halfD: 1.9, height: 4.8, yaw: 0, variant: 0 },
      { id: 's2-n3', kind: 'worker_rowhouse', x: -9.6, z: -34.2, halfW: 2.2, halfD: 1.8, height: 4.6, yaw: 0, variant: 0 },
      { id: 's2-n4', kind: 'cargo_depot', x: 9.6, z: -34.2, halfW: 2.3, halfD: 1.9, height: 4.8, yaw: 0, variant: 1 },
      { id: 's2-n5', kind: 'brick_foundry', x: 16.5, z: -34.2, halfW: 2.2, halfD: 1.9, height: 6.5, yaw: 0, variant: 0 },

      // Southern Workers' Townhouses & Commercial Shops
      { id: 's2-s1', kind: 'worker_rowhouse', x: -27.2, z: 34.2, halfW: 2.2, halfD: 1.8, height: 4.6, yaw: Math.PI, variant: 1 },
      { id: 's2-s2', kind: 'worker_rowhouse', x: -13.6, z: 34.2, halfW: 2.2, halfD: 1.8, height: 4.6, yaw: Math.PI, variant: 2 },
      { id: 's2-s3', kind: 'corner_shop', x: -4.8, z: 34.2, halfW: 2.0, halfD: 1.8, height: 4.4, yaw: Math.PI, variant: 0 },
      { id: 's2-s4', kind: 'corner_shop', x: 9.6, z: 34.2, halfW: 2.0, halfD: 1.8, height: 4.4, yaw: Math.PI, variant: 1 },
      { id: 's2-s5', kind: 'cargo_depot', x: 16.5, z: 34.2, halfW: 2.2, halfD: 1.9, height: 4.8, yaw: Math.PI, variant: 0 },

      // Mid-Block Workshops, Corner Shops, Clock Tower & Rail Freight Sheds
      { id: 's2-m1', kind: 'corner_shop', x: 13.6, z: -5.4, halfW: 1.8, halfD: 1.5, height: 4.2, yaw: Math.PI, variant: 0 },
      { id: 's2-m2', kind: 'corner_shop', x: 13.6, z: 9.8, halfW: 1.8, halfD: 1.5, height: 4.2, yaw: 0, variant: 1 },
      { id: 's2-m3', kind: 'cargo_depot', x: 13.6, z: -22.6, halfW: 1.9, halfD: 1.6, height: 4.5, yaw: 0, variant: 0 },
      { id: 's2-m4', kind: 'worker_rowhouse', x: 13.6, z: 22.6, halfW: 1.9, halfD: 1.6, height: 4.4, yaw: Math.PI, variant: 2 },
      { id: 's2-m5', kind: 'clock_tower', x: -13.6, z: -13.6, halfW: 1.6, halfD: 1.6, height: 7.5, yaw: 0, variant: 0 },
      { id: 's2-m6', kind: 'worker_rowhouse', x: -13.6, z: 13.6, halfW: 1.9, halfD: 1.6, height: 4.4, yaw: 0, variant: 0 },
      { id: 's2-m7', kind: 'corner_shop', x: -22.6, z: -5.2, halfW: 1.8, halfD: 1.5, height: 4.2, yaw: 0, variant: 2 },
      { id: 's2-m8', kind: 'worker_rowhouse', x: -22.6, z: 5.2, halfW: 1.9, halfD: 1.6, height: 4.4, yaw: Math.PI, variant: 1 },
      { id: 's2-m9', kind: 'pocket_park', x: -13.6, z: 22.6, halfW: 1.7, halfD: 1.7, height: 2.5, yaw: 0, variant: 0 },
      { id: 's2-m10', kind: 'brick_foundry', x: -22.6, z: -22.6, halfW: 1.9, halfD: 1.7, height: 5.8, yaw: 0, variant: 0 },
    ];
  }

  // Stage 3: Dense Modern Smart Eco-City Skyscrapers, Malls, Solar Offices & Parks
  return [
    // Western Eco-Tech Skyline Wall
    { id: 's3-t1', kind: 'eco_skyscraper', x: -33.6, z: -23.0, halfW: 2.4, halfD: 2.4, height: 13.5, yaw: 0, variant: 0 },
    { id: 's3-t2', kind: 'smart_tower', x: -33.6, z: -5.8, halfW: 2.3, halfD: 2.3, height: 15.0, yaw: 0, variant: 1 },
    { id: 's3-t3', kind: 'eco_skyscraper', x: -33.6, z: 5.8, halfW: 2.3, halfD: 2.3, height: 12.5, yaw: 0, variant: 2 },
    { id: 's3-t4', kind: 'smart_tower', x: -33.6, z: 23.0, halfW: 2.4, halfD: 2.4, height: 14.5, yaw: 0, variant: 0 },
    { id: 's3-t5', kind: 'smart_tower', x: -41.5, z: -26.5, halfW: 2.6, halfD: 2.6, height: 17.5, yaw: 0, variant: 2 },
    { id: 's3-t6', kind: 'eco_skyscraper', x: -41.5, z: -13.5, halfW: 2.6, halfD: 2.6, height: 16.0, yaw: 0, variant: 1 },
    { id: 's3-t7', kind: 'smart_tower', x: -41.5, z: 0.0, halfW: 2.6, halfD: 2.6, height: 19.0, yaw: 0, variant: 0 },
    { id: 's3-t8', kind: 'eco_skyscraper', x: -41.5, z: 13.5, halfW: 2.6, halfD: 2.6, height: 15.5, yaw: 0, variant: 2 },
    { id: 's3-t9', kind: 'smart_tower', x: -41.5, z: 26.5, halfW: 2.6, halfD: 2.6, height: 16.5, yaw: 0, variant: 1 },

    // Northern & Southern Modern Towers & Solar Offices
    { id: 's3-n1', kind: 'eco_skyscraper', x: -27.2, z: -34.2, halfW: 2.3, halfD: 2.3, height: 13.0, yaw: 0, variant: 1 },
    { id: 's3-n2', kind: 'solar_office', x: -18.0, z: -34.2, halfW: 2.3, halfD: 2.0, height: 7.5, yaw: 0, variant: 0 },
    { id: 's3-n3', kind: 'smart_tower', x: -9.6, z: -34.2, halfW: 2.2, halfD: 2.2, height: 12.0, yaw: 0, variant: 2 },
    { id: 's3-n4', kind: 'solar_office', x: 9.6, z: -34.2, halfW: 2.3, halfD: 2.0, height: 7.5, yaw: 0, variant: 1 },
    { id: 's3-n5', kind: 'eco_skyscraper', x: 17.5, z: -34.2, halfW: 2.3, halfD: 2.3, height: 13.5, yaw: 0, variant: 0 },

    { id: 's3-s1', kind: 'smart_tower', x: -27.2, z: 34.2, halfW: 2.3, halfD: 2.3, height: 14.0, yaw: Math.PI, variant: 0 },
    { id: 's3-s2', kind: 'modern_mall', x: -13.6, z: 34.2, halfW: 2.4, halfD: 2.0, height: 6.5, yaw: Math.PI, variant: 0 },
    { id: 's3-s3', kind: 'solar_office', x: -4.8, z: 34.2, halfW: 2.1, halfD: 1.9, height: 7.2, yaw: Math.PI, variant: 2 },
    { id: 's3-s4', kind: 'eco_skyscraper', x: 9.6, z: 34.2, halfW: 2.2, halfD: 2.2, height: 12.5, yaw: Math.PI, variant: 1 },
    { id: 's3-s5', kind: 'modern_mall', x: 17.5, z: 34.2, halfW: 2.3, halfD: 2.0, height: 6.8, yaw: Math.PI, variant: 1 },

    // Mid-Block Smart Towers, Solar Pavilions & Green Pocket Parks
    { id: 's3-m1', kind: 'solar_office', x: 13.6, z: -5.4, halfW: 1.9, halfD: 1.6, height: 6.2, yaw: Math.PI, variant: 0 },
    { id: 's3-m2', kind: 'modern_mall', x: 13.6, z: 9.8, halfW: 1.9, halfD: 1.6, height: 5.8, yaw: 0, variant: 1 },
    { id: 's3-m3', kind: 'eco_skyscraper', x: 13.6, z: -22.6, halfW: 1.9, halfD: 1.9, height: 11.5, yaw: 0, variant: 2 },
    { id: 's3-m4', kind: 'smart_tower', x: 13.6, z: 22.6, halfW: 1.9, halfD: 1.9, height: 12.2, yaw: Math.PI, variant: 1 },
    { id: 's3-m5', kind: 'smart_tower', x: -22.6, z: -5.2, halfW: 1.9, halfD: 1.9, height: 11.2, yaw: 0, variant: 1 },
    { id: 's3-m6', kind: 'modern_mall', x: -22.6, z: 5.2, halfW: 1.9, halfD: 1.6, height: 5.6, yaw: Math.PI, variant: 0 },
    { id: 's3-m7', kind: 'pocket_park', x: -13.6, z: 13.6, halfW: 1.7, halfD: 1.7, height: 2.5, yaw: 0, variant: 0 },
    { id: 's3-m8', kind: 'pocket_park', x: -13.6, z: 22.6, halfW: 1.7, halfD: 1.7, height: 2.5, yaw: 0, variant: 1 },
    { id: 's3-m9', kind: 'pocket_park', x: -22.6, z: -22.6, halfW: 1.7, halfD: 1.7, height: 2.5, yaw: 0, variant: 2 },
    { id: 's3-m10', kind: 'solar_office', x: 5.2, z: -13.6, halfW: 1.7, halfD: 1.5, height: 6.0, yaw: -Math.PI / 2, variant: 2 },
  ];
}

/**
 * Autonomous living crowd NPCs patrolling along sidewalks, harbors, markets, factories, and parks.
 */
export function getStageCrowdPatrols(stage: StageNumber): CrowdPatrolDef[] {
  if (stage === 1) {
    return [
      {
        id: 'c1-porter-1',
        role: 'porter',
        shirtColor: 0x92400e,
        pantsColor: 0x451a03,
        hatColor: 0xd97706,
        prop: 'crate',
        speed: 2.3,
        pauseSeconds: 1.4,
        waypoints: [{ x: 22.0, z: -1.4 }, { x: 38.0, z: -1.4 }, { x: 38.0, z: 1.5 }, { x: 22.0, z: 1.5 }],
      },
      {
        id: 'c1-porter-2',
        role: 'porter',
        shirtColor: 0xb45309,
        pantsColor: 0x292524,
        hatColor: 0xfef3c7,
        prop: 'crate',
        speed: 2.1,
        pauseSeconds: 1.6,
        waypoints: [{ x: 18.2, z: -17.5 }, { x: 30.8, z: -17.5 }, { x: 20.5, z: -17.5 }, { x: 17.5, z: -23.5 }],
      },
      {
        id: 'c1-fisher-1',
        role: 'fisher',
        shirtColor: 0x0e7490,
        pantsColor: 0x334155,
        hatColor: 0xeab308,
        prop: 'basket',
        speed: 1.9,
        pauseSeconds: 2.4,
        waypoints: [{ x: 23.2, z: -2.2 }, { x: 31.5, z: -2.2 }, { x: 31.5, z: 2.2 }, { x: 23.2, z: 2.2 }],
      },
      {
        id: 'c1-trader-1',
        role: 'trader',
        shirtColor: 0xd97706,
        pantsColor: 0x44403c,
        hatColor: 0xf59e0b,
        prop: 'basket',
        speed: 2.2,
        pauseSeconds: 2.0,
        waypoints: [{ x: 11.2, z: -16.0 }, { x: 11.2, z: -5.5 }, { x: 16.0, z: -5.5 }, { x: 16.0, z: -16.0 }],
      },
      {
        id: 'c1-trader-2',
        role: 'trader',
        shirtColor: 0xb91c1c,
        pantsColor: 0x1e293b,
        hatColor: 0xfef3c7,
        prop: 'none',
        speed: 2.0,
        pauseSeconds: 1.8,
        waypoints: [{ x: 11.2, z: 5.5 }, { x: 11.2, z: 16.0 }, { x: 16.0, z: 16.0 }, { x: 16.0, z: 5.5 }],
      },
      {
        id: 'c1-visitor-1',
        role: 'citizen',
        shirtColor: 0x15803d,
        pantsColor: 0x3f2e21,
        hatColor: 0xfde68a,
        prop: 'none',
        speed: 2.4,
        pauseSeconds: 1.0,
        waypoints: [{ x: -2.5, z: -26.0 }, { x: 2.5, z: -26.0 }, { x: 2.5, z: -2.5 }, { x: -2.5, z: -2.5 }],
      },
      {
        id: 'c1-visitor-2',
        role: 'citizen',
        shirtColor: 0x7c2d12,
        pantsColor: 0x292524,
        hatColor: 0xf59e0b,
        prop: 'basket',
        speed: 2.2,
        pauseSeconds: 1.2,
        waypoints: [{ x: -29.5, z: -2.2 }, { x: 18.0, z: -2.2 }, { x: 18.0, z: 2.2 }, { x: -29.5, z: 2.2 }],
      },
      {
        id: 'c1-villager-1',
        role: 'citizen',
        shirtColor: 0x0f766e,
        pantsColor: 0x334155,
        hatColor: 0xd97706,
        prop: 'none',
        speed: 2.0,
        pauseSeconds: 1.5,
        waypoints: [{ x: -30.5, z: -22.0 }, { x: -30.5, z: 22.0 }, { x: -26.0, z: 22.0 }, { x: -26.0, z: -22.0 }],
      },
      {
        id: 'c1-villager-2',
        role: 'citizen',
        shirtColor: 0xa16207,
        pantsColor: 0x1c1917,
        hatColor: 0xfef3c7,
        prop: 'none',
        speed: 2.1,
        pauseSeconds: 1.3,
        waypoints: [{ x: -2.5, z: 3.5 }, { x: -2.5, z: 29.5 }, { x: 2.5, z: 29.5 }, { x: 2.5, z: 3.5 }],
      },
      {
        id: 'c1-trader-3',
        role: 'trader',
        shirtColor: 0x4338ca,
        pantsColor: 0x1e293b,
        hatColor: 0xfef3c7,
        prop: 'basket',
        tunicStyle: 'sarung',
        speed: 2.2,
        pauseSeconds: 1.7,
        waypoints: [{ x: 2.8, z: -13.5 }, { x: 8.0, z: -13.5 }, { x: 8.0, z: 13.5 }, { x: 2.8, z: 13.5 }],
      },
      // Shopkeepers tending market stalls
      {
        id: 'c1-shop-spice',
        role: 'shopkeeper',
        shirtColor: 0xb45309,
        pantsColor: 0x292524,
        hatColor: 0xfde68a,
        prop: 'basket',
        behavior: 'tend_stall',
        tunicStyle: 'apron',
        speed: 1.1,
        pauseSeconds: 2.8,
        waypoints: [{ x: 11.9, z: -5.4 }, { x: 11.9, z: -6.8 }, { x: 11.9, z: -4.2 }],
      },
      {
        id: 'c1-shop-cloth',
        role: 'shopkeeper',
        shirtColor: 0xbe123c,
        pantsColor: 0x451a03,
        hatColor: 0xfef08a,
        prop: 'none',
        behavior: 'tend_stall',
        tunicStyle: 'kebaya',
        speed: 1.0,
        pauseSeconds: 3.1,
        waypoints: [{ x: 12.0, z: 10.6 }, { x: 12.0, z: 11.8 }, { x: 12.0, z: 9.6 }],
      },
      {
        id: 'c1-shop-food',
        role: 'shopkeeper',
        shirtColor: 0x15803d,
        pantsColor: 0x1e293b,
        hatColor: 0xfef3c7,
        prop: 'basket',
        behavior: 'tend_stall',
        tunicStyle: 'apron',
        speed: 1.1,
        pauseSeconds: 2.6,
        waypoints: [{ x: 11.9, z: 22.6 }, { x: 11.9, z: 21.4 }, { x: 11.9, z: 23.6 }],
      },
      // Market Buyers visiting stalls & interacting
      {
        id: 'c1-buyer-1',
        role: 'buyer',
        shirtColor: 0x0369a1,
        pantsColor: 0x334155,
        hatColor: 0xfef3c7,
        prop: 'basket',
        behavior: 'patrol',
        tunicStyle: 'sarung',
        speed: 2.1,
        pauseSeconds: 2.2,
        waypoints: [{ x: 10.8, z: -4.8 }, { x: 10.8, z: -10.2 }, { x: 10.8, z: -15.4 }, { x: 7.5, z: -10.0 }],
      },
      {
        id: 'c1-buyer-2',
        role: 'buyer',
        shirtColor: 0x9333ea,
        pantsColor: 0x1e293b,
        hatColor: 0xfde68a,
        prop: 'basket',
        behavior: 'patrol',
        tunicStyle: 'kebaya',
        speed: 2.0,
        pauseSeconds: 2.4,
        waypoints: [{ x: 10.8, z: 10.6 }, { x: 10.8, z: 15.8 }, { x: 10.8, z: 22.4 }, { x: 8.2, z: 16.5 }],
      },
      {
        id: 'c1-buyer-3',
        role: 'buyer',
        shirtColor: 0xca8a04,
        pantsColor: 0x292524,
        hatColor: 0xd97706,
        prop: 'satchel',
        behavior: 'converse',
        tunicStyle: 'vest',
        speed: 2.2,
        pauseSeconds: 2.5,
        waypoints: [{ x: 3.4, z: -5.2 }, { x: 10.4, z: -5.2 }, { x: 10.4, z: 4.0 }, { x: 3.4, z: 4.0 }],
      },
      // Children Playing in Kampung & Pocket Parks
      {
        id: 'c1-child-1',
        role: 'child',
        shirtColor: 0xf97316,
        pantsColor: 0x1d4ed8,
        hatColor: 0xfef08a,
        prop: 'none',
        behavior: 'play_tag',
        scale: 0.72,
        speed: 3.4,
        pauseSeconds: 0.45,
        waypoints: [{ x: -15.4, z: 20.8 }, { x: -11.8, z: 20.8 }, { x: -11.8, z: 24.4 }, { x: -15.4, z: 24.4 }],
      },
      {
        id: 'c1-child-2',
        role: 'child',
        shirtColor: 0xec4899,
        pantsColor: 0x0f172a,
        hatColor: 0xffffff,
        prop: 'none',
        behavior: 'play_tag',
        scale: 0.7,
        speed: 3.5,
        pauseSeconds: 0.4,
        waypoints: [{ x: -11.8, z: 24.4 }, { x: -15.4, z: 24.4 }, { x: -15.4, z: 20.8 }, { x: -11.8, z: 20.8 }],
      },
      {
        id: 'c1-child-3',
        role: 'child',
        shirtColor: 0x14b8a6,
        pantsColor: 0x334155,
        hatColor: 0xfde047,
        prop: 'none',
        behavior: 'play_tag',
        scale: 0.72,
        speed: 3.2,
        pauseSeconds: 0.5,
        waypoints: [{ x: -24.5, z: -20.5 }, { x: -20.8, z: -20.5 }, { x: -20.8, z: -24.5 }, { x: -24.5, z: -24.5 }],
      },
      // Tourists & Fishers
      {
        id: 'c1-tourist-1',
        role: 'tourist',
        shirtColor: 0xe0f2fe,
        pantsColor: 0x78350f,
        hatColor: 0xfde68a,
        prop: 'satchel',
        behavior: 'patrol',
        tunicStyle: 'vest',
        speed: 1.9,
        pauseSeconds: 2.2,
        waypoints: [{ x: -3.2, z: -3.2 }, { x: 18.6, z: -3.2 }, { x: 18.6, z: 3.2 }, { x: -3.2, z: 3.2 }],
      },
      {
        id: 'c1-tourist-2',
        role: 'tourist',
        shirtColor: 0xfecdd3,
        pantsColor: 0x334155,
        hatColor: 0xfef3c7,
        prop: 'umbrella',
        behavior: 'converse',
        tunicStyle: 'casual',
        speed: 1.8,
        pauseSeconds: 2.6,
        waypoints: [{ x: 20.4, z: -12.0 }, { x: 20.4, z: 12.0 }, { x: 18.2, z: 12.0 }, { x: 18.2, z: -12.0 }],
      },
      {
        id: 'c1-fisher-2',
        role: 'fisher',
        shirtColor: 0x1e40af,
        pantsColor: 0x292524,
        hatColor: 0xd97706,
        prop: 'rod',
        behavior: 'fish',
        tunicStyle: 'sarung',
        speed: 1.6,
        pauseSeconds: 3.6,
        waypoints: [{ x: 24.0, z: -18.8 }, { x: 31.2, z: -18.8 }, { x: 31.2, z: -16.2 }, { x: 24.0, z: -16.2 }],
      },
    ];
  }

  if (stage === 2) {
    return [
      {
        id: 'c2-worker-1',
        role: 'worker',
        shirtColor: 0xc2410c,
        pantsColor: 0x1e293b,
        hatColor: 0xfacc15,
        prop: 'wrench',
        speed: 2.4,
        pauseSeconds: 1.5,
        waypoints: [{ x: -29.8, z: -24.0 }, { x: -29.8, z: 24.0 }, { x: -26.2, z: 24.0 }, { x: -26.2, z: -24.0 }],
      },
      {
        id: 'c2-worker-2',
        role: 'worker',
        shirtColor: 0x334155,
        pantsColor: 0x0f172a,
        hatColor: 0xf59e0b,
        prop: 'crate',
        speed: 2.5,
        pauseSeconds: 1.2,
        waypoints: [{ x: 22.0, z: -1.4 }, { x: 37.5, z: -1.4 }, { x: 37.5, z: 1.4 }, { x: 22.0, z: 1.4 }],
      },
      {
        id: 'c2-worker-3',
        role: 'worker',
        shirtColor: 0x9a3412,
        pantsColor: 0x292524,
        hatColor: 0xfde047,
        prop: 'wrench',
        speed: 2.2,
        pauseSeconds: 1.8,
        waypoints: [{ x: 11.2, z: -18.0 }, { x: 11.2, z: -5.5 }, { x: 16.0, z: -5.5 }, { x: 16.0, z: -18.0 }],
      },
      {
        id: 'c2-porter-1',
        role: 'porter',
        shirtColor: 0x475569,
        pantsColor: 0x1e293b,
        hatColor: 0xe2e8f0,
        prop: 'crate',
        speed: 2.3,
        pauseSeconds: 1.4,
        waypoints: [{ x: 11.2, z: 5.5 }, { x: 11.2, z: 18.0 }, { x: 16.0, z: 18.0 }, { x: 16.0, z: 5.5 }],
      },
      {
        id: 'c2-citizen-1',
        role: 'citizen',
        shirtColor: 0x1d4ed8,
        pantsColor: 0x334155,
        hatColor: 0x94a3b8,
        prop: 'none',
        speed: 2.5,
        pauseSeconds: 1.0,
        waypoints: [{ x: -29.0, z: -2.2 }, { x: 17.5, z: -2.2 }, { x: 17.5, z: 2.2 }, { x: -29.0, z: 2.2 }],
      },
      {
        id: 'c2-citizen-2',
        role: 'citizen',
        shirtColor: 0x0f766e,
        pantsColor: 0x1e293b,
        hatColor: 0xfbbf24,
        prop: 'none',
        speed: 2.3,
        pauseSeconds: 1.2,
        waypoints: [{ x: -2.5, z: -26.5 }, { x: 2.5, z: -26.5 }, { x: 2.5, z: 28.0 }, { x: -2.5, z: 28.0 }],
      },
      {
        id: 'c2-worker-4',
        role: 'worker',
        shirtColor: 0xb45309,
        pantsColor: 0x1e293b,
        hatColor: 0xfacc15,
        prop: 'wrench',
        speed: 2.1,
        pauseSeconds: 1.6,
        waypoints: [{ x: -22.5, z: -30.5 }, { x: 15.0, z: -30.5 }, { x: 15.0, z: -27.5 }, { x: -22.5, z: -27.5 }],
      },
      {
        id: 'c2-trader-1',
        role: 'trader',
        shirtColor: 0x7c2d12,
        pantsColor: 0x334155,
        hatColor: 0xe2e8f0,
        prop: 'basket',
        speed: 2.0,
        pauseSeconds: 1.9,
        waypoints: [{ x: -22.5, z: 30.8 }, { x: 15.0, z: 30.8 }, { x: 15.0, z: 27.8 }, { x: -22.5, z: 27.8 }],
      },
      {
        id: 'c2-worker-5',
        role: 'worker',
        shirtColor: 0x0369a1,
        pantsColor: 0x0f172a,
        hatColor: 0xfde047,
        prop: 'crate',
        speed: 2.3,
        pauseSeconds: 1.4,
        waypoints: [{ x: -16.5, z: -10.5 }, { x: -10.5, z: -10.5 }, { x: -10.5, z: -16.5 }, { x: -16.5, z: -16.5 }],
      },
      {
        id: 'c2-citizen-3',
        role: 'citizen',
        shirtColor: 0x4d7c0f,
        pantsColor: 0x1e293b,
        hatColor: 0xd6d3d1,
        prop: 'none',
        speed: 2.2,
        pauseSeconds: 1.3,
        waypoints: [{ x: 2.8, z: -13.0 }, { x: 7.5, z: -13.0 }, { x: 7.5, z: 13.0 }, { x: 2.8, z: 13.0 }],
      },
    ];
  }

  // Stage 3: Modern Smart Eco-City Citizens, Tech Engineers & Couriers
  return [
    {
      id: 'c3-eng-1',
      role: 'engineer',
      shirtColor: 0x0284c7,
      pantsColor: 0x1e293b,
      hatColor: 0x38bdf8,
      prop: 'tablet',
      speed: 2.6,
      pauseSeconds: 1.3,
      waypoints: [{ x: -29.0, z: -2.2 }, { x: 18.0, z: -2.2 }, { x: 18.0, z: 2.2 }, { x: -29.0, z: 2.2 }],
    },
    {
      id: 'c3-courier-1',
      role: 'courier',
      shirtColor: 0x10b981,
      pantsColor: 0x0f172a,
      hatColor: 0xfef08a,
      prop: 'crate',
      speed: 2.9,
      pauseSeconds: 0.9,
      waypoints: [{ x: -2.5, z: -27.5 }, { x: 2.5, z: -27.5 }, { x: 2.5, z: 28.5 }, { x: -2.5, z: 28.5 }],
    },
    {
      id: 'c3-citizen-1',
      role: 'citizen',
      shirtColor: 0xf43f5e,
      pantsColor: 0x334155,
      hatColor: 0xf8fafc,
      prop: 'none',
      speed: 2.2,
      pauseSeconds: 1.8,
      waypoints: [{ x: -17.0, z: -10.4 }, { x: -10.5, z: -10.4 }, { x: -10.5, z: -17.0 }, { x: -17.0, z: -17.0 }],
    },
    {
      id: 'c3-citizen-2',
      role: 'citizen',
      shirtColor: 0x8b5cf6,
      pantsColor: 0x1e293b,
      hatColor: 0x38bdf8,
      prop: 'tablet',
      speed: 2.4,
      pauseSeconds: 1.5,
      waypoints: [{ x: 22.0, z: -1.4 }, { x: 37.5, z: -1.4 }, { x: 37.5, z: 1.4 }, { x: 22.0, z: 1.4 }],
    },
    {
      id: 'c3-eng-2',
      role: 'engineer',
      shirtColor: 0x0d9488,
      pantsColor: 0x0f172a,
      hatColor: 0xf8fafc,
      prop: 'tablet',
      speed: 2.4,
      pauseSeconds: 1.5,
      waypoints: [{ x: 11.2, z: -18.0 }, { x: 11.2, z: -5.5 }, { x: 16.0, z: -5.5 }, { x: 16.0, z: -18.0 }],
    },
    {
      id: 'c3-citizen-3',
      role: 'citizen',
      shirtColor: 0xf59e0b,
      pantsColor: 0x334155,
      hatColor: 0x10b981,
      prop: 'basket',
      speed: 2.2,
      pauseSeconds: 1.7,
      waypoints: [{ x: 11.2, z: 5.5 }, { x: 11.2, z: 18.0 }, { x: 16.0, z: 18.0 }, { x: 16.0, z: 5.5 }],
    },
    {
      id: 'c3-courier-2',
      role: 'courier',
      shirtColor: 0x0ea5e9,
      pantsColor: 0x1e293b,
      hatColor: 0x22d3ee,
      prop: 'crate',
      speed: 2.7,
      pauseSeconds: 1.1,
      waypoints: [{ x: -29.8, z: -24.0 }, { x: -29.8, z: 24.0 }, { x: -26.2, z: 24.0 }, { x: -26.2, z: -24.0 }],
    },
    {
      id: 'c3-citizen-4',
      role: 'citizen',
      shirtColor: 0xec4899,
      pantsColor: 0x1e293b,
      hatColor: 0xf8fafc,
      prop: 'none',
      speed: 2.1,
      pauseSeconds: 1.6,
      waypoints: [{ x: -22.5, z: 30.8 }, { x: 15.0, z: 30.8 }, { x: 15.0, z: 27.8 }, { x: -22.5, z: 27.8 }],
    },
    {
      id: 'c3-eng-3',
      role: 'engineer',
      shirtColor: 0x059669,
      pantsColor: 0x0f172a,
      hatColor: 0xfde047,
      prop: 'tablet',
      speed: 2.4,
      pauseSeconds: 1.4,
      waypoints: [{ x: -22.5, z: -30.5 }, { x: 15.0, z: -30.5 }, { x: 15.0, z: -27.5 }, { x: -22.5, z: -27.5 }],
    },
    {
      id: 'c3-citizen-5',
      role: 'citizen',
      shirtColor: 0x2563eb,
      pantsColor: 0x334155,
      hatColor: 0x38bdf8,
      prop: 'none',
      speed: 2.3,
      pauseSeconds: 1.4,
      waypoints: [{ x: 2.8, z: -13.0 }, { x: 7.5, z: -13.0 }, { x: 7.5, z: 13.0 }, { x: 2.8, z: 13.0 }],
    },
  ];
}

export function createInitialPlayerState(): Player3DState {
  return {
    x: -7.5,
    y: 0,
    z: 0.4,
    vx: 0,
    vy: 0,
    vz: 0,
    facingYaw: Math.PI / 2,
    grounded: true,
    speed: 0,
    walkCycle: 0,
  };
}

export function createInitialCameraState(player: Player3DState): ThirdPersonCamState {
  const yaw = Number.isFinite(player.facingYaw) ? player.facingYaw : Math.PI / 2;
  const pitch = 0.34;
  const distance = 11.8;
  const targetY = player.y + 1.65;
  return {
    yaw,
    pitch,
    distance,
    targetX: player.x,
    targetY,
    targetZ: player.z,
    x: player.x - Math.sin(yaw) * Math.cos(pitch) * distance,
    y: targetY + Math.sin(pitch) * distance,
    z: player.z - Math.cos(yaw) * Math.cos(pitch) * distance,
  };
}

export function groundHeightAt(x: number, z: number): number {
  const onMainPierZ = Math.abs(z) <= 3.35;
  if (onMainPierZ && x >= 19.5 && x <= 42.0) {
    if (x < 22.0) {
      return ((x - 19.5) / 2.5) * PIER_HEIGHT;
    }
    return PIER_HEIGHT;
  }

  const onNorthJettyZ = z >= -19.8 && z <= -15.2;
  if (onNorthJettyZ && x >= 19.5 && x <= 33.0) {
    if (x < 22.0) {
      return ((x - 19.5) / 2.5) * PIER_HEIGHT;
    }
    return PIER_HEIGHT;
  }

  return 0;
}

export function buildWorldColliders(grid: CityTile[][], stage: StageNumber): AabbCollider[] {
  const colliders: AabbCollider[] = [];

  // 1. Stage-specific Inspectable Landmarks
  for (const lm of getStageLandmarks(stage)) {
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

  // 1b. Dense Stage Scenery Buildings (skip walkable pocket parks so players can stroll through gardens)
  for (const sc of getStageSceneryBuildings(stage)) {
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

  // 2. Stage Portal Gate Side Pillars (central arch stays open to walk right up to!)
  colliders.push(
    {
      id: 'portal-pillar-left',
      minX: PORTAL_POSITION.x - 3.6,
      maxX: PORTAL_POSITION.x - 2.0,
      minZ: PORTAL_POSITION.z - 0.9,
      maxZ: PORTAL_POSITION.z + 0.9,
      maxY: 6.5,
      kind: 'portal_pillar',
    },
    {
      id: 'portal-pillar-right',
      minX: PORTAL_POSITION.x + 2.0,
      maxX: PORTAL_POSITION.x + 3.6,
      minZ: PORTAL_POSITION.z - 0.9,
      maxZ: PORTAL_POSITION.z + 0.9,
      maxY: 6.5,
      kind: 'portal_pillar',
    }
  );

  // 3. Dynamic Placed Buildings on the City Grid
  for (const row of grid) {
    for (const tile of row) {
      if (!tile.buildingId) continue;
      const def = BUILDING_CATALOG.find((b) => b.id === tile.buildingId);
      if (!def) continue;
      const pos = tileToWorld(tile.row, tile.col);
      const worldX = tile.terrain === 'water' ? 25.0 : pos.x;

      const isOpenPark = def.id === 'taman-kota' || def.id === 'hutan-kota';
      const halfSpan = isOpenPark ? 1.15 : 2.3;
      const height = Math.max(2.6, def.heightLevel * 2.3 + 1.2);

      colliders.push({
        id: `bldg-${tile.row}-${tile.col}`,
        minX: worldX - halfSpan,
        maxX: worldX + halfSpan,
        minZ: pos.z - halfSpan,
        maxZ: pos.z + halfSpan,
        maxY: height,
        kind: 'building',
      });
    }
  }

  // 4. Shoreline & Pier Water Guard Colliders
  colliders.push(
    { id: 'water-south', minX: 23.8, maxX: 48, minZ: 2.95, maxZ: 45, maxY: 4, kind: 'water' },
    { id: 'water-mid', minX: 23.8, maxX: 48, minZ: -15.8, maxZ: -2.95, maxY: 4, kind: 'water' },
    { id: 'water-north', minX: 23.8, maxX: 48, minZ: -45, maxZ: -19.2, maxY: 4, kind: 'water' },
    { id: 'pier-main-end', minX: 40.9, maxX: 48, minZ: -4, maxZ: 4, maxY: 4, kind: 'water' },
    { id: 'pier-jetty-end', minX: 31.8, maxX: 48, minZ: -21, maxZ: -14, maxY: 4, kind: 'water' }
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

export function stepPlayerPhysics(
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

  nextX = Math.max(WORLD_MIN_X, Math.min(WORLD_MAX_X, nextX));
  nextZ = Math.max(WORLD_MIN_Z, Math.min(WORLD_MAX_Z, nextZ));

  for (let pass = 0; pass < 2; pass++) {
    for (const box of colliders) {
      if (nextY >= box.maxY - 0.15) continue;
      const resolved = resolveCircleAabb(nextX, nextZ, PLAYER_RADIUS, box);
      nextX = resolved.x;
      nextZ = resolved.z;
    }
  }

  nextX = Math.max(WORLD_MIN_X, Math.min(WORLD_MAX_X, nextX));
  nextZ = Math.max(WORLD_MIN_Z, Math.min(WORLD_MAX_Z, nextZ));

  const floorY = groundHeightAt(nextX, nextZ);
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

export function findNearestBuildPad(
  playerX: number,
  playerZ: number,
  grid: CityTile[][],
  maxDistance = 4.6
): NearbyPadInfo | null {
  let best: NearbyPadInfo | null = null;
  for (const row of grid) {
    for (const tile of row) {
      if (tile.terrain === 'road' || tile.buildingId !== null) continue;
      const pos = tileToWorld(tile.row, tile.col);
      const padX = tile.terrain === 'water' ? 23.2 : pos.x;
      const padZ = pos.z;
      const dist = Math.hypot(playerX - padX, playerZ - padZ);
      if (dist <= maxDistance && (!best || dist < best.distance)) {
        best = {
          row: tile.row,
          col: tile.col,
          x: padX,
          z: padZ,
          terrain: tile.terrain,
          distance: dist,
        };
      }
    }
  }
  return best;
}

export function findNearestNpc(
  playerX: number,
  playerZ: number,
  npcs: NpcWaypoint[],
  maxDistance = 4.0
): { npc: NpcWaypoint; distance: number } | null {
  let best: { npc: NpcWaypoint; distance: number } | null = null;
  for (const npc of npcs) {
    const dist = Math.hypot(playerX - npc.x, playerZ - npc.z);
    if (dist <= maxDistance && (!best || dist < best.distance)) {
      best = { npc, distance: dist };
    }
  }
  return best;
}

export function findNearestInteractable(
  playerX: number,
  playerZ: number,
  grid: CityTile[][],
  stage: StageNumber
): InteractableTarget | null {
  const candidates: InteractableTarget[] = [];

  // 1. Stage Portal Gate
  const portalDist = Math.hypot(playerX - PORTAL_POSITION.x, playerZ - PORTAL_POSITION.z);
  if (portalDist <= 4.4 && stage < 3) {
    candidates.push({ kind: 'portal', distance: portalDist * 0.8 });
  }

  // 2. Tycoon Build Pads (standing directly on a pad <= 2.2m takes top priority over nearby NPCs)
  const pad = findNearestBuildPad(playerX, playerZ, grid, 4.4);
  if (pad) {
    candidates.push({ kind: 'pad', pad, distance: pad.distance <= 2.2 ? pad.distance * 0.72 : pad.distance });
  }

  // 3. NPCs
  const npcHit = findNearestNpc(playerX, playerZ, getStageNpcs(stage), 3.8);
  if (npcHit) {
    candidates.push({ kind: 'npc', npc: npcHit.npc, distance: npcHit.distance * 0.85 });
  }

  // 4. Placed Buildings
  for (const row of grid) {
    for (const tile of row) {
      if (!tile.buildingId) continue;
      const def = BUILDING_CATALOG.find((b) => b.id === tile.buildingId);
      if (!def) continue;
      const pos = tileToWorld(tile.row, tile.col);
      const bx = tile.terrain === 'water' ? 25.0 : pos.x;
      const dist = Math.hypot(playerX - bx, playerZ - pos.z);
      if (dist <= 4.6) {
        candidates.push({
          kind: 'building',
          building: {
            row: tile.row,
            col: tile.col,
            x: bx,
            z: pos.z,
            buildingId: def.id,
            name: def.name,
            functionDesc: def.functionDesc,
            globalizationLink: def.globalizationLink,
            distance: dist,
          },
          distance: dist + 0.4,
        });
      }
    }
  }

  // 5. Static Stage Landmarks
  for (const lm of getStageLandmarks(stage)) {
    const edgeDist = Math.hypot(
      Math.max(0, Math.abs(playerX - lm.x) - lm.halfW),
      Math.max(0, Math.abs(playerZ - lm.z) - lm.halfD)
    );
    if (edgeDist <= 3.0) {
      candidates.push({ kind: 'landmark', landmark: lm, distance: edgeDist + 1.2 });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.distance - b.distance);
  return candidates[0];
}

export function updateThirdPersonCamera(
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

  const clampedPitch = Math.max(0.14, Math.min(1.05, cam.pitch));
  const clampedDist = Math.max(5.5, Math.min(22.0, cam.distance));

  const dirX = -Math.sin(cam.yaw) * Math.cos(clampedPitch);
  const dirY = Math.sin(clampedPitch);
  const dirZ = -Math.cos(cam.yaw) * Math.cos(clampedPitch);

  let effectiveDist = clampedDist;
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const probeDist = clampedDist * t;
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
      effectiveDist = Math.max(3.6, probeDist - 0.6);
      break;
    }
  }

  const camX = targetX + dirX * effectiveDist;
  const rawCamY = targetY + dirY * effectiveDist;
  const camZ = targetZ + dirZ * effectiveDist;
  const floorUnderCam = groundHeightAt(camX, camZ);
  const camY = Math.max(floorUnderCam + 0.7, rawCamY);

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
