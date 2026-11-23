import { HotsQuestion } from '../types';

export const HOTS_QUESTIONS: HotsQuestion[] = [
  {
    id: 1,
    topicTag: 'Pengertian Globalisasi (Giddens & Soemardjan)',
    speaker: 'aditya',
    scenario:
      'Ketika terjadi gangguan jalur pelayaran peti kemas di Terusan Suez akibat konflik regional, harga komponen elektronik dan bahan baku tekstil di pasar kota Nusantara ikut melonjak dalam waktu kurang dari dua minggu.',
    question:
      'Berdasarkan analisis Anthony Giddens, fenomena tersebut paling tepat membuktikan bahwa globalisasi merupakan...',
    options: [
      {
        label: 'A',
        text: 'Penyeragaman total seluruh adat istiadat lokal oleh negara adidaya',
      },
      {
        label: 'B',
        text: 'Intensifikasi hubungan sosial mendunia sehingga peristiwa di tempat jauh langsung memengaruhi kondisi lokal',
      },
      {
        label: 'C',
        text: 'Penghapusan kedaulatan hukum nasional oleh organisasi perdagangan bebas',
      },
      {
        label: 'D',
        text: 'Perpindahan seluruh tenaga kerja industri dari desa menuju kota pelabuhan',
      },
    ],
    correctLabel: 'B',
    explanation:
      'Anthony Giddens mendefinisikan globalisasi sebagai intensifikasi hubungan sosial secara mendunia yang menghubungkan lokalitas yang berjauhan, sehingga peristiwa di satu belahan dunia segera memengaruhi kehidupan di lokasi lain.',
    distractorNotes:
      'Pilihan A merujuk pada homogenisasi budaya ekstrem, C terlalu sempit pada aspek hukum formal, dan D menggambarkan urbanisasi biasa, bukan interkoneksi global Giddens.',
  },
  {
    id: 2,
    topicTag: 'Ciri-Ciri Globalisasi (Time-Space Compression)',
    speaker: 'naya',
    scenario:
      'Kelompok perajin tenun ikat di Nusantara kini melakukan siaran langsung (live streaming) setiap sore untuk menjual kain langsung kepada pembeli di Tokyo dan Melbourne, dengan pembayaran instan serta pengiriman kurir internasional dalam 4 hari.',
    question:
      'Perubahan pola transaksi perajin tersebut mencerminkan ciri utama globalisasi yaitu...',
    options: [
      {
        label: 'A',
        text: 'Munculnya krisis lingkungan akibat industrialisasi massal',
      },
      {
        label: 'B',
        text: 'Pemampatan ruang dan waktu (time-space compression) melalui teknologi komunikasi dan logistik',
      },
      {
        label: 'C',
        text: 'Dominasi perusahaan pertambangan terhadap ekonomi maritim tradisional',
      },
      {
        label: 'D',
        text: 'Melemahnya minat masyarakat terhadap produk kerajinan bernilai budaya',
      },
    ],
    correctLabel: 'B',
    explanation:
      'Live streaming lintas negara dan pengiriman kilat menunjukkan perubahan konsep ruang dan waktu: jarak geografis ribuan kilometer tidak lagi menghambat interaksi ekonomi secara seketika.',
    distractorNotes:
      'Pilihan A tidak relevan dengan skenario, C membicarakan ekstraksi sumber daya, dan D bertentangan dengan fakta bahwa tenun justru laku di pasar internasional.',
  },
  {
    id: 3,
    topicTag: 'Ciri-Ciri Globalisasi (Masalah Bersama)',
    speaker: 'laras',
    scenario:
      'Limbah mikroplastik dari sungai industri di beberapa negara Asia mengalir ke samudra bebas dan mencemari perairan nelayan pesisir Nusantara, sekaligus mengancam rantai pangan laut global.',
    question:
      'Mengapa kasus pencemaran laut tersebut dikategorikan sebagai ciri globalisasi dalam sosiologi?',
    options: [
      {
        label: 'A',
        text: 'Karena masalah lingkungan telah menjadi persoalan bersama lintas negara yang tidak dapat diselesaikan satu negara saja',
      },
      {
        label: 'B',
        text: 'Karena nelayan lokal sudah tidak menggunakan perahu layar tradisional',
      },
      {
        label: 'C',
        text: 'Karena industri manufaktur hanya boleh berdiri di negara maju',
      },
      {
        label: 'D',
        text: 'Karena interaksi kultural melalui media sosial memicu gaya hidup konsumtif',
      },
    ],
    correctLabel: 'A',
    explanation:
      'Salah satu ciri utama globalisasi adalah meningkatnya masalah bersama (shared global problems) seperti krisis iklim, polusi lintas batas, dan pandemi yang menuntut tata kelola dan kerja sama multinasional.',
    distractorNotes:
      'Pilihan B, C, dan D tidak menjelaskan keterkaitan lintas batas pada isu ekologi global tersebut.',
  },
  {
    id: 4,
    topicTag: 'Bentuk Globalisasi (Ekonomi & IPTEK)',
    speaker: 'aditya',
    scenario:
      'Sebuah perusahaan teknologi multinasional membuka pusat riset kecerdasan buatan di kawasan smart city Nusantara, merekrut insinyur lokal, dan mengintegrasikan sistem logistik pelabuhan otomatis untuk ekspor barang.',
    question:
      'Kombinasi fenomena tersebut secara sosiologis menunjukkan keterkaitan erat antara dua bentuk globalisasi, yaitu...',
    options: [
      {
        label: 'A',
        text: 'Globalisasi budaya dan globalisasi keagamaan',
      },
      {
        label: 'B',
        text: 'Globalisasi ekonomi (TNCs & investasi) dengan globalisasi IPTEK dan transportasi',
      },
      {
        label: 'C',
        text: 'Globalisasi kuliner dan globalisasi olahraga internasional',
      },
      {
        label: 'D',
        text: 'Globalisasi politik kolonial dan perdagangan barter kuno',
      },
    ],
    correctLabel: 'B',
    explanation:
      'Kehadiran perusahaan transnasional (TNCs) dan ekspor adalah bentuk globalisasi ekonomi, sementara riset AI adalah globalisasi IPTEK yang didukung otomatisasi pelabuhan (transportasi/logistik).',
    distractorNotes:
      'Pilihan A, C, dan D tidak mencerminkan sektor ekonomi, teknologi, dan logistik yang dijelaskan dalam kasus.',
  },
  {
    id: 5,
    topicTag: 'Teori Globalisasi (Held & McGrew)',
    speaker: 'laras',
    scenario:
      'Dalam forum musyawarah kota, seorang akademisi berpendapat bahwa perdagangan bebas justru memperlebar jurang antara pemilik modal asing dan buruh lokal, serta membuat budaya lokal terpinggirkan oleh merek Barat.',
    question:
      'Menurut pemetaan David Held dan Anthony McGrew, pandangan akademisi tersebut sejalan dengan perspektif...',
    options: [
      {
        label: 'A',
        text: 'Hiperglobalis, karena menganggap pasar global membawa kemakmuran otomatis',
      },
      {
        label: 'B',
        text: 'Skeptis, karena bersikap kritis terhadap ketimpangan dan dampak negatif integrasi global',
      },
      {
        label: 'C',
        text: 'Transformasionalis, karena hanya berfokus pada kemasan produk UMKM',
      },
      {
        label: 'D',
        text: 'Evolusioner linear, karena meyakini semua kota pasti identik secara budaya',
      },
    ],
    correctLabel: 'B',
    explanation:
      'Perspektif Skeptis (diwakili oleh Laras dalam game) mengkritisi asumsi pasar bebas yang adil, menyoroti ketergantungan ekonomi, ketimpangan sosial, serta ancaman terhadap identitas budaya lokal.',
    distractorNotes:
      'Hiperglobalis (A) sangat optimis pada pasar bebas, sedangkan Transformasionalis (C) berfokus pada adaptasi dua arah dan glokalisasi.',
  },
  {
    id: 6,
    topicTag: 'World System Theory (Immanuel Wallerstein)',
    speaker: 'aditya',
    scenario:
      'Negara X hanya mengekspor bijih mineral mentah dan hasil perkebunan murah ke luar negeri, lalu mengimpor mesin pabrik dan perangkat lunak canggih dengan harga berlipat ganda dari Negara Y.',
    question:
      'Berdasarkan World System Theory Immanuel Wallerstein, langkah strategis paling tepat agar kota/negara X keluar dari posisi Periphery menuju Semi-Periphery bahkan Core adalah...',
    options: [
      {
        label: 'A',
        text: 'Menambah kuota ekspor bahan mentah tanpa pengolahan agar volume perdagangan naik',
      },
      {
        label: 'B',
        text: 'Menutup seluruh pelabuhan dagang dan melarang masuknya teknologi asing',
      },
      {
        label: 'C',
        text: 'Mengembangkan pendidikan tinggi, riset IPTEK, dan hilirisasi industri bernilai tambah tinggi',
      },
      {
        label: 'D',
        text: 'Mengalihkan seluruh anggaran kota hanya untuk impor barang konsumsi mewah',
      },
    ],
    correctLabel: 'C',
    explanation:
      'Dalam teori Wallerstein, ketimpangan antara Periphery dan Core terjadi karena penguasaan teknologi, modal, dan nilai tambah. Hilirisasi industri serta penguatan IPTEK dan SDM memutus ketergantungan ekspor bahan mentah.',
    distractorNotes:
      'Opsi A melanggengkan posisi Periphery, opsi B mengisolasi ekonomi, dan opsi D memperparah defisit serta konsumerisme.',
  },
  {
    id: 7,
    topicTag: 'Proses Terjadinya Globalisasi (Timeline Historis)',
    speaker: 'naya',
    scenario:
      'Pelabuhan kuno di pesisir Nusantara pada abad ke-14 telah menerima kapal pedagang dari Gujarat, Tiongkok, dan Arab yang membawa porselen dan kain sutra untuk ditukar dengan cengkih serta pala.',
    question:
      'Makna sosiologis penting dari fase perdagangan kuno tersebut bagi pemahaman globalisasi modern adalah...',
    options: [
      {
        label: 'A',
        text: 'Globalisasi merupakan proses historis bertahap yang berakar sejak jalur perdagangan kuno, bukan sekadar fenomena era internet',
      },
      {
        label: 'B',
        text: 'Globalisasi baru dimulai ketika kabel serat optik dipasang di dasar laut',
      },
      {
        label: 'C',
        text: 'Perdagangan kuno hanya menghasilkan konflik militer tanpa pertukaran budaya',
      },
      {
        label: 'D',
        text: 'Masyarakat kuno sudah menggunakan transaksi kripto dan e-commerce lintas benua',
      },
    ],
    correctLabel: 'A',
    explanation:
      'Proses terjadinya globalisasi berlangsung melalui fase panjang: Fase Perdagangan Kuno (Jalur Sutra & Rempah), Fase Kolonialisme-Revolusi Industri, hingga Fase Informasi Digital Modern.',
    distractorNotes:
      'Opsi B mengabaikan sejarah panjang interaksi global, C keliru karena jalur rempah memicu akulturasi budaya damai, dan D anakronistis.',
  },
  {
    id: 8,
    topicTag: 'Dampak Negatif (Cultural Lag)',
    speaker: 'laras',
    scenario:
      'Pemerintah kota meluncurkan layanan transportasi pintar dan pembayaran digital super cepat, tetapi masih banyak warga membuang sampah sembarangan di halte modern serta menyebarkan hoaks di grup digital karena rendahnya literasi etika siber.',
    question:
      'Kondisi ketimpangan antara pesatnya kemajuan teknologi dengan kesiapan nilai, norma, dan perilaku warga tersebut disebut...',
    options: [
      {
        label: 'A',
        text: 'Culture shock (guncangan budaya)',
      },
      {
        label: 'B',
        text: 'Cultural lag (ketertinggalan budaya)',
      },
      {
        label: 'C',
        text: 'Glokalisasi partisipatif',
      },
      {
        label: 'D',
        text: 'Demokratisasi digital',
      },
    ],
    correctLabel: 'B',
    explanation:
      'Cultural lag (William F. Ogburn) terjadi ketika unsur kebudayaan material (teknologi, fasilitas smart city) berubah jauh lebih cepat daripada unsur nonmaterial (norma, hukum, etika, dan kebiasaan masyarakat).',
    distractorNotes:
      'Culture shock (A) adalah keterkejutan individu saat berjumpa budaya asing yang baru, bukan ketertinggalan norma masyarakat terhadap teknologinya sendiri.',
  },
  {
    id: 9,
    topicTag: 'Dampak Negatif (Konsumerisme, Hedonisme & Westernisasi)',
    speaker: 'laras',
    scenario:
      'Sebagian remaja di kota besar rela berutang pinjaman daring demi membeli gawai dan busana impor bermerek setiap bulan agar dianggap "berkelas" di media sosial, meski secara fungsi barang lama mereka masih layak pakai.',
    question:
      'Analisis sosiologis yang paling tepat untuk menggambarkan perilaku dan cara mengatasinya adalah...',
    options: [
      {
        label: 'A',
        text: 'Wujud efisiensi ekonomi global; solusinya memperbanyak iklan produk impor',
      },
      {
        label: 'B',
        text: 'Gejala konsumerisme dan hedonisme yang didorong oleh simbol status global; solusinya penguatan literasi finansial dan kebanggaan terhadap karya lokal bermutu',
      },
      {
        label: 'C',
        text: 'Bentuk demokratisasi budaya; solusinya membebaskan seluruh utang konsumsi tanpa edukasi',
      },
      {
        label: 'D',
        text: 'Dampak kemajuan transportasi; solusinya memutus jaringan internet di sekolah',
      },
    ],
    correctLabel: 'B',
    explanation:
      'Konsumerisme terjadi ketika konsumsi didasarkan pada keinginan dan simbol gengsi sosial (bukan kebutuhan), sering beririsan dengan hedonisme. Solusinya adalah literasi finansial, berpikir kritis terhadap media, dan apresiasi produk lokal berkualitas.',
    distractorNotes:
      'Opsi A justru mendorong konsumerisme, C tidak menyelesaikan akar perilaku, dan D menghambat kemajuan IPTEK secara tidak proporsional.',
  },
  {
    id: 10,
    topicTag: 'Solusi Globalisasi (Transformasionalis & Glokalisasi)',
    speaker: 'naya',
    scenario:
      'Kota Nusantara ingin menarik wisatawan mancanegara dan meningkatkan ekspor UMKM di era digital tanpa membuat kesenian tradisional, rumah adat, dan kuliner warisan tersingkir oleh waralaba asing.',
    question:
      'Manakah strategi kebijakan pembangunan kota yang paling mencerminkan konsep glokalisasi menurut perspektif Transformasionalis?',
    options: [
      {
        label: 'A',
        text: 'Merobohkan seluruh kawasan pasar tradisional untuk dibangun mal seragam bergaya Barat',
      },
      {
        label: 'B',
        text: 'Melarang warga menggunakan internet dan menutup bandara internasional',
      },
      {
        label: 'C',
        text: 'Mengembangkan Desa Wisata dan Pusat UMKM berbasis e-commerce dengan standar mutu global serta pengemasan identitas budaya Nusantara',
      },
      {
        label: 'D',
        text: 'Membebaskan pajak hanya bagi perusahaan asing agar produk lokal tidak perlu bersaing',
      },
    ],
    correctLabel: 'C',
    explanation:
      'Glokalisasi (perspektif Transformasionalis) menggabungkan standar, teknologi, dan jaringan distribusi global dengan keunikan budaya serta potensi lokal, sehingga kota tetap mendunia tanpa kehilangan jati diri.',
    distractorNotes:
      'Opsi A menyebabkan westernisasi dan lunturnya identitas lokal; B bersifat anti-globalisasi ekstrem; D memperlemah kemandirian UMKM lokal.',
  },
];
