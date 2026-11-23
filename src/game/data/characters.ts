import { CharacterId, CharacterProfile } from '../types';

export const CHARACTERS: Record<CharacterId, CharacterProfile> = {
  aditya: {
    id: 'aditya',
    name: 'Aditya',
    title: 'Sang Visioner Kota',
    theory: 'Hiperglobalis',
    profession: 'Arsitek & Perencana Kota',
    personality: 'Ambisius, optimis, dan menyukai inovasi',
    focus: 'Membangun kota modern dengan teknologi dan investasi internasional',
    signatureQuote: 'Ayo wujudkan kota ini jadi pusat kemajuan di era global!',
    avatarSrc: '/assets/characters/aditya-avatar.png',
    fullBodySrc: '/assets/characters/aditya-full.png',
    accentHex: '#0284C7',
    badgeBgClass: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    borderClass: 'border-sky-400/40',
    textAccentClass: 'text-sky-300',
  },
  laras: {
    id: 'laras',
    name: 'Laras',
    title: 'Sang Penjaga Budaya',
    theory: 'Skeptis',
    profession: 'Peneliti Budaya & Sejarah Lokal',
    personality: 'Bijaksana, kritis, dan tegas',
    focus: 'Menjaga budaya lokal serta mengkritisi dampak negatif globalisasi',
    signatureQuote: 'Jangan hanya mengejar kemajuan, tapi juga jaga jati diri kita.',
    avatarSrc: '/assets/characters/laras-avatar.png',
    fullBodySrc: '/assets/characters/laras-full.png',
    accentHex: '#D97706',
    badgeBgClass: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    borderClass: 'border-rose-400/40',
    textAccentClass: 'text-rose-300',
  },
  naya: {
    id: 'naya',
    name: 'Naya',
    title: 'Sang Penggerak Lokal',
    theory: 'Transformasionalis',
    profession: 'Pengusaha Produk Lokal',
    personality: 'Kreatif, adaptif, dan ramah',
    focus: 'Mengembangkan produk lokal agar mampu bersaing di pasar internasional',
    signatureQuote: 'Kita bisa maju, tanpa melupakan budaya kita sendiri!',
    avatarSrc: '/assets/characters/naya-avatar.png',
    fullBodySrc: '/assets/characters/naya-full.png',
    accentHex: '#10B981',
    badgeBgClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    borderClass: 'border-emerald-400/40',
    textAccentClass: 'text-emerald-300',
  },
};

export const CHARACTER_LIST: CharacterProfile[] = [
  CHARACTERS.aditya,
  CHARACTERS.laras,
  CHARACTERS.naya,
];

export const DYNAMIC_DIALOGUES = {
  buildTrade: {
    character: 'aditya' as CharacterId,
    mood: 'optimis' as const,
    text: 'Langkah bagus! Infrastruktur perdagangan ini membuka koneksi Nusantara ke pasar dunia.',
  },
  buildIndustry: {
    character: 'laras' as CharacterId,
    mood: 'waspada' as const,
    text: 'Kapasitas produksi meningkat, tetapi pastikan hak pekerja dan kelestarian lingkungan tetap terjaga.',
  },
  buildTech: {
    character: 'aditya' as CharacterId,
    mood: 'senang' as const,
    text: 'Investasi IPTEK ini akan mempercepat efisiensi layanan kota dan daya saing generasi muda!',
  },
  buildCulture: {
    character: 'naya' as CharacterId,
    mood: 'bangga' as const,
    text: 'Inilah wujud glokalisasi! Budaya lokal tidak tertinggal, justru menjadi daya tarik utama kota.',
  },
  buildCivic: {
    character: 'laras' as CharacterId,
    mood: 'senang' as const,
    text: 'Kesejahteraan warga meningkat! Pembangunan sejati harus dirasakan seluruh lapisan masyarakat.',
  },
  lowHpWarning: {
    character: 'laras' as CharacterId,
    mood: 'kritis' as const,
    text: 'Perhatikan keseimbangan kota! Kemajuan ekonomi tidak boleh mengorbankan kesejahteraan warga dan lingkungan.',
  },
  imbalanceWarning: {
    character: 'naya' as CharacterId,
    mood: 'waspada' as const,
    text: 'Ada ketimpangan antar-aspek kota. Seimbangkan kembali Ekonomi Global, IPTEK, dan Kearifan Lokal!',
  },
  stageUp: {
    character: 'aditya' as CharacterId,
    mood: 'bangga' as const,
    text: 'Selamat, Wali Kota! Kota Nusantara siap melangkah ke era peradaban berikutnya!',
  },
  victory: {
    character: 'naya' as CharacterId,
    mood: 'bangga' as const,
    text: 'Akhirnya! Kota Nusantara menjadi kota global yang modern sekaligus tetap berakar pada jati diri budaya bangsa!',
  },
};

export const TEAM_IDENTITY = {
  subject: 'Sosiologi Kelas XII',
  topic: 'Perubahan Sosial dan Globalisasi',
  groupName: 'Kelompok 3',
  className: 'XII-9',
  members: [
    'Dwi Miftakhul Ilmiyah (12)',
    'Hazimah Aqilah Azka Mufida (19)',
    'Riska Oktavia Haryanti (27)',
    'Riski Novita Sari (28)',
    'Saylatur Rizkiyah (32)',
    'Tsabita Angelia Anabel Susanti (36)',
  ],
};
