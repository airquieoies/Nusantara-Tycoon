import { BelajarModule, TimelinePhase, WorldSystemTier } from '../types';

export const TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: 'fase-1',
    era: 'Fase 1: Perdagangan Kuno',
    periodLabel: 'Abad ke-2 SM – Abad ke-15',
    summary:
      'Interaksi lintas wilayah berawal dari pertukaran komoditas alam melalui rute darat dan laut, termasuk Jalur Sutra dan jalur rempah Nusantara.',
    drivers: [
      'Perdagangan rempah (cengkih, pala, lada), sutra, dan keramik',
      'Pelabuhan niaga seperti Sriwijaya, Majapahit, dan Malaka',
      'Akulturasi bahasa, agama, dan arsitektur melalui pedagang mancanegara',
    ],
    nusantaraContext:
      'Nusantara sudah menjadi simpul perdagangan maritim dunia jauh sebelum era internet, mempertemukan pedagang Tiongkok, India, Arab, dan lokal.',
    stageRefImage: '/assets/aistudio/Tambahkan_judul__1__5ad5298b.png',
  },
  {
    id: 'fase-2',
    era: 'Fase 2: Kolonialisme & Revolusi Industri',
    periodLabel: 'Abad ke-16 – Pertengahan Abad ke-20',
    summary:
      'Penjelajahan samudra, penguasaan kolonial atas sumber daya, dan penemuan mesin uap serta pabrik mengubah produksi menjadi berskala massal dan global.',
    drivers: [
      'Mekanisasi pabrik, kereta api, dan kapal uap mempercepat distribusi',
      'Monopoli perdagangan kolonial dan integrasi ekonomi asimetris',
      'Munculnya pembagian kerja internasional antara negara industri dan penghasil bahan mentah',
    ],
    nusantaraContext:
      'Pembangunan jalur rel, pelabuhan ekspor, dan pabrik gula/perkebunan mengintegrasikan ekonomi Nusantara ke pasar dunia sekaligus memicu ketimpangan sosial.',
    stageRefImage: '/assets/aistudio/Tambahkan_judul__2__81566d0d.png',
  },
  {
    id: 'fase-3',
    era: 'Fase 3: Informasi & Digital Modern',
    periodLabel: 'Akhir Abad ke-20 – Masa Kini',
    summary:
      'Revolusi teknologi informasi, internet, kecerdasan buatan, dan e-commerce menghapus batas ruang dan waktu sehingga arus modal, data, dan budaya berlangsung seketika.',
    drivers: [
      'Internet berkecepatan tinggi, media sosial, dan komputasi awan',
      'Perusahaan transnasional (TNCs), rantai pasok global, dan ekonomi digital',
      'Glokalisasi: perpaduan inovasi digital global dengan produk dan budaya lokal',
    ],
    nusantaraContext:
      'UMKM Nusantara kini bisa mengekspor batik, kopi, dan kerajinan melalui marketplace global sambil menjaga identitas lokal dan keberlanjutan kota.',
    stageRefImage: '/assets/aistudio/Tambahkan_judul__3__9ee52f2a.png',
  },
];

export const WORLD_SYSTEM_TIERS: WorldSystemTier[] = [
  {
    id: 'core',
    name: 'Core (Negara Inti)',
    role: 'Pusat inovasi teknologi, modal finansial, dan kendali pasar global',
    characteristics: [
      'Ekonomi berbasis industri berteknologi tinggi, jasa keuangan, dan R&D',
      'Upah tenaga kerja relatif tinggi dengan perlindungan sosial kuat',
      'Menentukan standar harga, paten, dan arah perdagangan internasional',
    ],
    examples: 'Amerika Serikat, Jerman, Jepang, Inggris',
    inequalityImpact:
      'Mengakumulasi nilai tambah terbesar dari rantai pasok global melalui kepemilikan merek, paten, dan modal.',
  },
  {
    id: 'semi-periphery',
    name: 'Semi-Periphery (Negara Semi-Pinggiran)',
    role: 'Penghubung antara negara inti dan negara pinggiran dalam rantai produksi',
    characteristics: [
      'Memiliki basis manufaktur berkembang sekaligus masih mengekspor bahan baku',
      'Berupaya meningkatkan kapasitas IPTEK agar naik kelas menuju negara inti',
      'Berperan sebagai pasar konsumen besar dan lokasi relokasi industri',
    ],
    examples: 'Indonesia, Brasil, Meksiko, Afrika Selatan, Thailand',
    inequalityImpact:
      'Berpotensi mengalami pertumbuhan ekonomi cepat, namun rentan terhadap ketergantungan modal asing dan ketimpangan upah.',
  },
  {
    id: 'periphery',
    name: 'Periphery (Negara Pinggiran)',
    role: 'Pemasok bahan mentah, komoditas agraris, dan tenaga kerja berbiaya rendah',
    characteristics: [
      'Ketergantungan tinggi pada ekspor komoditas primer tanpa hilirisasi',
      'Akses teknologi, modal, dan infrastruktur pendidikan masih terbatas',
      'Posisi tawar lemah dalam perdagangan internasional',
    ],
    examples: 'Beberapa negara berkembang berpendapatan rendah di Afrika Sub-Sahara dan sebagian Asia Selatan',
    inequalityImpact:
      'Kerap mengalami pertukaran tidak setara (unequal exchange) karena menjual bahan mentah murah dan membeli barang jadi mahal.',
  },
];

export const BELAJAR_MODULES: BelajarModule[] = [
  {
    id: 'materi-1',
    number: 1,
    title: 'Pengertian Globalisasi',
    subtitle: 'Memahami konsep desa global dan definisi para tokoh sosiologi',
    expReward: 100,
    leadCharacter: 'aditya',
    characterNote:
      'Globalisasi membuka gerbang kolaborasi dunia! Pahami dulu definisi para sosiolog agar kita bisa merancang kota yang adaptif.',
    coreSummary:
      'Globalisasi adalah proses mendunianya suatu hal sehingga batas geografis antarnegara menjadi semakin kabur (borderless world). Interaksi ekonomi, informasi, budaya, dan sosial berlangsung cepat melampaui sekat teritorial.',
    scholarDefinitions: [
      {
        scholar: 'Selo Soemardjan',
        yearOrWork: 'Sosiolog Indonesia',
        definition:
          'Globalisasi adalah terbentuknya sistem organisasi dan komunikasi antarmasyarakat di seluruh dunia untuk mengikuti sistem dan kaidah-kaidah tertentu yang sama.',
      },
      {
        scholar: 'Anthony Giddens',
        yearOrWork: 'The Consequences of Modernity (1990)',
        definition:
          'Globalisasi adalah intensifikasi hubungan sosial secara mendunia yang menghubungkan kejadian di suatu lokasi dengan peristiwa yang terjadi ribuan kilometer jauhnya.',
      },
      {
        scholar: 'Martin Albrow',
        yearOrWork: 'The Global Age (1996)',
        definition:
          'Globalisasi merupakan keseluruhan proses ketika penduduk dunia terinkorporasi (tergabung) ke dalam satu masyarakat dunia tunggal atau masyarakat global.',
      },
      {
        scholar: 'Cochrane & Pain',
        yearOrWork: 'A Globalizing World? (2000)',
        definition:
          'Globalisasi ditandai oleh munculnya sebuah sistem ekonomi dan budaya global yang membuat manusia di seluruh dunia hidup dalam satu jaringan ketergantungan bersama.',
      },
    ],
    keyPoints: [
      {
        heading: 'Hilangnya Sekat Geografis (Borderless World)',
        detail:
          'Batas administratif negara tetap ada secara hukum, tetapi arus informasi, modal, barang, dan gagasan mengalir lintas negara secara hampir seketika.',
        example:
          'Siswa SMA di Indonesia bisa mengikuti kuliah daring universitas di Eropa atau berkolaborasi proyek desain dengan teman di Jepang.',
      },
      {
        heading: 'Standarisasi & Keterhubungan Sistem',
        detail:
          'Sejalan dengan Selo Soemardjan, berbagai sektor kini mengadopsi standar internasional mulai dari sistem pembayaran digital hingga sertifikasi mutu.',
        example:
          'Penggunaan QRIS lintas negara (cross-border) di Asia Tenggara serta standar emisi ramah lingkungan pada pabrik modern.',
      },
    ],
    flashcards: [
      {
        id: 'fc-1-1',
        frontTitle: 'Selo Soemardjan',
        frontPrompt: 'Apa inti pengertian globalisasi menurut Selo Soemardjan?',
        backExplanation:
          'Terbentuknya sistem organisasi dan komunikasi antarmasyarakat sedunia untuk mengikuti sistem dan kaidah yang sama.',
        everydayExample: 'Aturan transaksi e-commerce internasional dan standar keselamatan penerbangan sipil dunia.',
      },
      {
        id: 'fc-1-2',
        frontTitle: 'Anthony Giddens',
        frontPrompt: 'Bagaimana Anthony Giddens menjelaskan keterhubungan jarak jauh?',
        backExplanation:
          'Intensifikasi hubungan sosial mendunia: peristiwa lokal di suatu tempat memengaruhi (dan dipengaruhi oleh) kejadian di belahan dunia lain.',
        everydayExample: 'Gangguan jalur pelayaran di Terusan Suez langsung memengaruhi harga dan pasokan barang di pasar lokal Indonesia.',
      },
      {
        id: 'fc-1-3',
        frontTitle: 'Martin Albrow vs Cochrane & Pain',
        frontPrompt: 'Apa persamaan pandangan Martin Albrow dan Cochrane & Pain?',
        backExplanation:
          'Keduanya menekankan penyatuan manusia ke dalam satu masyarakat global dengan sistem ekonomi serta budaya yang saling terhubung.',
        everydayExample: 'Tren musik, olahraga Piala Dunia, dan kampanye iklim yang diikuti serentak di berbagai benua.',
      },
    ],
  },
  {
    id: 'materi-2',
    number: 2,
    title: 'Ciri-Ciri Globalisasi',
    subtitle: 'Empat karakteristik utama perubahan ruang, waktu, pasar, dan isu bersama',
    expReward: 100,
    leadCharacter: 'laras',
    characterNote:
      'Keterhubungan global mempercepat segalanya, tetapi juga berarti krisis di satu negara dapat segera merembet ke masyarakat lokal.',
    coreSummary:
      'Globalisasi memiliki empat ciri sosiologis utama yang membedakannya dari hubungan antarwilayah pada masa lampau: pemampatan ruang-waktu, ketergantungan ekonomi, interaksi kultural bermedia, serta meningkatnya masalah bersama.',
    keyPoints: [
      {
        heading: '1. Perubahan Konsep Ruang dan Waktu (Time-Space Compression)',
        detail:
          'Teknologi komunikasi dan transportasi membuat jarak terasa semakin pendek dan waktu penyampaian pesan mendekati nol detik.',
        example:
          'Pesan video call ke luar negeri terkirim dalam hitungan milidetik, dan pengiriman barang antarbenua kini hanya memakan beberapa hari.',
      },
      {
        heading: '2. Ketergantungan Ekonomi dan Pasar Antarnegara',
        detail:
          'Produksi satu barang sering melibatkan rantai pasok dari banyak negara sehingga krisis di satu negara berdampak pada negara lain.',
        example:
          'Sebuah ponsel dirakit dari chip desain Amerika, layar Korea Selatan, baterai Tiongkok, dan dipasarkan ke seluruh dunia.',
      },
      {
        heading: '3. Peningkatan Interaksi Kultural Melalui Media Massa',
        detail:
          'Platform streaming, media sosial, dan berita internasional mempertemukan nilai, bahasa, mode, dan hiburan lintas budaya setiap hari.',
        example:
          'Popularitas kuliner Nusantara (rendang, kopi) di media sosial global sekaligus masuknya tren K-Pop dan anime di kalangan remaja Indonesia.',
      },
      {
        heading: '4. Meningkatnya Masalah Bersama (Shared Global Problems)',
        detail:
          'Berbagai persoalan tidak lagi dapat diselesaikan oleh satu negara sendirian dan menuntut kerja sama multinasional.',
        example:
          'Perubahan iklim, polusi plastik samudra, pandemi kesehatan global, dan kejahatan siber lintas batas.',
      },
    ],
    flashcards: [
      {
        id: 'fc-2-1',
        frontTitle: 'Time-Space Compression',
        frontPrompt: 'Mengapa konsep ruang dan waktu berubah dalam era globalisasi?',
        backExplanation:
          'Karena kemajuan transportasi cepat dan internet memangkas hambatan jarak geografis serta jeda waktu interaksi.',
        everydayExample: 'Siswa mengikuti lomba debat internasional secara daring tanpa harus terbang ke luar negeri.',
      },
      {
        id: 'fc-2-2',
        frontTitle: 'Masalah Bersama Multinasional',
        frontPrompt: 'Mengapa krisis lingkungan termasuk ciri globalisasi?',
        backExplanation:
          'Emisi karbon atau polusi di satu kawasan berdampak pada iklim global sehingga penanganannya membutuhkan kesepakatan lintas negara.',
        everydayExample: 'Konferensi perubahan iklim (COP) dan transisi energi terbarukan di kota-kota dunia.',
      },
    ],
  },
  {
    id: 'materi-3',
    number: 3,
    title: 'Bentuk-Bentuk Globalisasi',
    subtitle: 'Lima dimensi globalisasi: Budaya, Komunikasi, Ekonomi, IPTEK, dan Transportasi',
    expReward: 120,
    leadCharacter: 'naya',
    characterNote:
      'Kelima bidang globalisasi saling berkaitan! Kemajuan komunikasi dan transportasi mendorong UMKM lokal menembus pasar global.',
    coreSummary:
      'Dalam kehidupan sehari-hari, globalisasi tampak nyata melalui lima bidang utama yang memengaruhi pola interaksi sosial, konsumsi, produksi, dan mobilitas masyarakat.',
    keyPoints: [
      {
        heading: '1. Globalisasi Bidang Budaya',
        detail:
          'Pertukaran nilai, gaya hidup, bahasa serapan, kuliner, seni, dan mode antarbangsa yang memicu akulturasi maupun tantangan identitas.',
        example:
          'Batik dipadukan dengan desain busana modern di panggung mode dunia, sementara kafe internasional menjamur di kota-kota Indonesia.',
      },
      {
        heading: '2. Globalisasi Bidang Komunikasi',
        detail:
          'Digitalisasi informasi, jaringan 4G/5G, media sosial, dan platform pesan instan yang menghubungkan miliaran pengguna secara real-time.',
        example:
          'Live streaming pemasaran produk daerah langsung kepada pembeli di luar negeri melalui platform video pendek.',
      },
      {
        heading: '3. Globalisasi Bidang Ekonomi',
        detail:
          'Perdagangan bebas, beroperasinya perusahaan multinasional/transnasional (TNCs), investasi asing langsung, serta e-commerce lintas negara.',
        example:
          'Ekspor kopi Gayo dan kerajinan rotan lewat marketplace global serta hadirnya pabrik otomotif multinasional di kawasan industri.',
      },
      {
        heading: '4. Globalisasi Bidang IPTEK',
        detail:
          'Percepatan inovasi sains, kecerdasan buatan (AI), robotika, energi bersih, dan otomatisasi industri yang meningkatkan efisiensi kerja.',
        example:
          'Pemanfaatan sensor smart city untuk memantau kualitas udara dan irigasi pertanian presisi berbasis Internet of Things (IoT).',
      },
      {
        heading: '5. Globalisasi Bidang Transportasi',
        detail:
          'Modernisasi pelabuhan peti kemas, kereta cepat, logistik udara, dan integrasi transportasi massal yang mempercepat mobilitas manusia dan barang.',
        example:
          'Kereta cepat antarkota, bandara hub internasional, dan sistem pelabuhan otomatis yang memangkas biaya distribusi barang.',
      },
    ],
    flashcards: [
      {
        id: 'fc-3-1',
        frontTitle: 'Perusahaan Transnasional (TNCs)',
        frontPrompt: 'Termasuk bentuk globalisasi apakah hadirnya TNCs dan e-commerce lintas negara?',
        backExplanation:
          'Globalisasi Bidang Ekonomi — ditandai perdagangan bebas, aliran modal, dan rantai pasok perusahaan yang melintasi batas negara.',
        everydayExample: 'Produsen sepatu atau elektronik global membuka pabrik dan gerai di berbagai negara sekaligus.',
      },
      {
        id: 'fc-3-2',
        frontTitle: 'IPTEK & Otomatisasi',
        frontPrompt: 'Bagaimana globalisasi IPTEK memengaruhi struktur pekerjaan masyarakat?',
        backExplanation:
          'Pekerjaan berulang digantikan otomatisasi dan AI sehingga tenaga kerja dituntut menguasai literasi digital dan kreativitas.',
        everydayExample: 'Pemanfaatan kasir digital, sistem logistik otomatis, dan analitik data dalam bisnis modern.',
      },
    ],
  },
  {
    id: 'materi-4',
    number: 4,
    title: 'Teori-Teori Globalisasi',
    subtitle: 'Tiga perspektif Held & McGrew serta World System Theory Immanuel Wallerstein',
    expReward: 150,
    leadCharacter: 'laras',
    characterNote:
      'Setiap teori punya kacamata berbeda! Aditya melihat peluang (Hiperglobalis), aku mengingatkan risikonya (Skeptis), dan Naya memadukan keduanya (Transformasionalis).',
    coreSummary:
      'David Held dan Anthony McGrew memetakan tiga perspektif utama dalam memandang globalisasi. Sementara itu, Immanuel Wallerstein menjelaskan ketimpangan struktur ekonomi global melalui World System Theory.',
    keyPoints: [
      {
        heading: 'Hiperglobalis / Globalis (Diwakili Aditya)',
        detail:
          'Meyakini globalisasi adalah era baru yang nyata dan tak terhindarkan. Negara-bangsa dianggap berkurang perannya karena digantikan pasar global tanpa batas dan teknologi.',
        example:
          'Investasi asing, kawasan perdagangan bebas, dan kota pintar dianggap sebagai mesin utama kemakmuran bersama.',
      },
      {
        heading: 'Skeptis (Diwakili Laras)',
        detail:
          'Memandang globalisasi sering dibesar-besarkan; ketimpangan antarnegara justru menguat, ekonomi masih terpusat di blok negara kaya, dan budaya lokal terancam tergerus.',
        example:
          'Masuknya produk impor murah melemahkan perajin tradisional jika tidak dilindungi kebijakan yang adil.',
      },
      {
        heading: 'Transformasionalis (Diwakili Naya)',
        detail:
          'Berpandangan bahwa globalisasi memang mengubah struktur sosial secara mendalam, namun arahnya tidak tunggal. Masyarakat lokal tetap memiliki agensi untuk beradaptasi (glokalisasi).',
        example:
          'UMKM batik mengadopsi desain kontemporer dan pemasaran digital internasional tanpa meninggalkan motif filosofis leluhur.',
      },
    ],
    hasWorldSystem: true,
    flashcards: [
      {
        id: 'fc-4-1',
        frontTitle: 'David Held & Anthony McGrew',
        frontPrompt: 'Sebutkan tiga kubu perspektif globalisasi menurut Held & McGrew!',
        backExplanation:
          '1) Hiperglobalis (optimis pasar bebas & teknologi), 2) Skeptis (kritis terhadap ketimpangan & hegemoni), 3) Transformasionalis (adaptif & dinamis).',
        everydayExample: 'Debat kebijakan membuka pasar e-commerce asing vs melindungi dan memberdayakan UMKM lokal.',
      },
      {
        id: 'fc-4-2',
        frontTitle: 'World System Theory (Wallerstein)',
        frontPrompt: 'Mengapa negara Periphery sering dirugikan dibanding negara Core?',
        backExplanation:
          'Negara Periphery mengekspor bahan mentah bernilai tambah rendah dan tenaga kerja murah, sedangkan negara Core menguasai teknologi, modal, dan keuntungan tinggi.',
        everydayExample: 'Ekspor biji kakao mentah bernilai rendah dibanding impor cokelat olahan bermerek dari negara maju.',
      },
    ],
  },
  {
    id: 'materi-5',
    number: 5,
    title: 'Proses Terjadinya Globalisasi',
    subtitle: 'Timeline interaktif dari Fase Perdagangan Kuno hingga Era Digital Modern',
    expReward: 120,
    leadCharacter: 'aditya',
    characterNote:
      'Kota Nusantara di Mode Bermain juga melewati tiga fase sejarah ini! Klik setiap era di timeline untuk melihat pendorong utamanya.',
    coreSummary:
      'Globalisasi bukanlah peristiwa instan abad ke-21, melainkan proses historis panjang yang berevolusi melalui tiga gelombang besar seiring kemajuan pelayaran, industrialisasi, dan revolusi digital.',
    hasTimeline: true,
    keyPoints: [
      {
        heading: 'Kesinambungan Lintas Zaman',
        detail:
          'Setiap fase tidak menghapus fase sebelumnya, melainkan memperluas skala, kecepatan, dan kedalaman interaksi antarbangsa.',
        example:
          'Jalur rempah maritim kuno kini berevolusi menjadi jalur logistik peti kemas dan perdagangan digital lintas benua.',
      },
    ],
    flashcards: [
      {
        id: 'fc-5-1',
        frontTitle: 'Jalur Sutra & Jalur Rempah',
        frontPrompt: 'Apa peran Nusantara pada fase awal globalisasi?',
        backExplanation:
          'Nusantara menjadi pemasok utama rempah bernilai tinggi (cengkih, pala) sekaligus pusat persinggahan dan akulturasi budaya maritim.',
        everydayExample: 'Pelabuhan dagang kuno di pesisir Sumatra dan Jawa yang mempertemukan berbagai bangsa.',
      },
      {
        id: 'fc-5-2',
        frontTitle: 'Revolusi Industri',
        frontPrompt: 'Bagaimana mesin uap mempercepat globalisasi pada Fase 2?',
        backExplanation:
          'Produksi barang menjadi massal dan murah, sementara kapal uap serta kereta api mempercepat pengangkutan bahan mentah dan barang jadi antarbenua.',
        everydayExample: 'Berdirinya pabrik-pabrik mekanis dan jalur kereta distribusi barang menuju pelabuhan ekspor.',
      },
    ],
  },
  {
    id: 'materi-6',
    number: 6,
    title: 'Contoh Nyata & Dampak Globalisasi',
    subtitle: 'Mengelola dampak positif, mewaspadai dampak negatif, dan strategi glokalisasi',
    expReward: 140,
    leadCharacter: 'naya',
    characterNote:
      'Kunci menghadapi era tanpa batas adalah bersikap selektif, memperkuat literasi, dan berinovasi lewat glokalisasi!',
    coreSummary:
      'Globalisasi membawa peluang kemajuan sekaligus risiko sosial budaya. Masyarakat yang tangguh mampu memetik manfaat efisiensi dan IPTEK sambil menangkal ketergantungan, westernisasi, dan ketimpangan.',
    keyPoints: [
      {
        heading: 'Dampak Positif Globalisasi',
        detail:
          'Meliputi efisiensi kerja, kemajuan IPTEK, penguatan nilai demokratisasi dan hak asasi manusia, pertukaran budaya konstruktif, peluang ekonomi internasional, serta lahirnya glokalisasi.',
        example:
          'Digitalisasi pelayanan publik mengurangi birokrasi berbelit; perajin daerah mengekspor tenun ikat lewat toko daring global.',
      },
      {
        heading: 'Culture Shock & Cultural Lag',
        detail:
          'Culture shock adalah guncangan psikologis ketika berhadapan dengan budaya baru yang berbeda. Cultural lag adalah ketertinggalan budaya nonmaterial (aturan/etika) terhadap pesatnya teknologi material.',
        example:
          'Maraknya penyebaran hoaks dan perundungan siber karena etika bermedia belum secepat adopsi ponsel pintar.',
      },
      {
        heading: 'Westernisasi, Konsumerisme & Hedonisme',
        detail:
          'Westernisasi meniru budaya Barat secara membabi buta; konsumerisme mendorong belanja berdasarkan gengsi bukan kebutuhan; hedonisme mengutamakan kesenangan sesaat.',
        example:
          'Gaya hidup berutang demi membeli produk bermerek asing atau mengikuti tren konsumsi impulsif di media sosial.',
      },
      {
        heading: 'Kesenjangan Sosial-Ekonomi & Lunturnya Budaya Lokal',
        detail:
          'Kelompok yang memiliki akses modal dan literasi digital melesat jauh meninggalkan kelompok rentan, sementara generasi muda berisiko melupakan bahasa dan seni tradisi.',
        example:
          'Solusi: Pendidikan vokasi digital merata, pemberdayaan UMKM, penguatan kurikulum budaya lokal, dan inovasi glokalisasi.',
      },
    ],
    flashcards: [
      {
        id: 'fc-6-1',
        frontTitle: 'Cultural Lag vs Culture Shock',
        frontPrompt: 'Apa perbedaan mendasar antara Cultural Lag dan Culture Shock?',
        backExplanation:
          'Cultural lag adalah ketimpangan kecepatan perubahan teknologi vs norma/hukum sosial; Culture shock adalah kebingungan/keterkejutan individu saat memasuki budaya asing.',
        everydayExample: 'Teknologi AI berkembang pesat sebelum regulasi hak cipta & etika AI siap (Cultural Lag).',
      },
      {
        id: 'fc-6-2',
        frontTitle: 'Glokalisasi (Solusi Naya)',
        frontPrompt: 'Bagaimana cara kerja glokalisasi dalam ekonomi kreatif?',
        backExplanation:
          'Menggabungkan standar mutu, teknologi, atau kemasan modern berskala global dengan keunikan nilai, bahan, atau budaya lokal.',
        everydayExample: 'Restoran cepat saji menghadirkan menu sambal Nusantara, atau produk kopi lokal dikemas modern untuk pasar ekspor.',
      },
    ],
  },
];
