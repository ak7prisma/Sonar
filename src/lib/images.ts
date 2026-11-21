export interface AccessibleImage {
  src: string;
  alt: string;
  caption?: string;
  category?: string;
}

export const APP_IMAGES = {
  heroStudent: {
    src: "/images/hero_student.jpg",
    alt: "Mahasiswa tunanetra mengenakan headphone berkabel dengan senyum ramah di ruang perpustakaan kampus, siap mengakses materi perkuliahan digital melalui audio dan pembaca layar.",
    caption: "Aksesibilitas mandiri untuk mahasiswa tunanetra di perguruan tinggi.",
    category: "hero",
  },
  featureSpeech: {
    src: "/images/feature_speech.jpg",
    alt: "Tangan memegang smartphone yang menampilkan antarmuka aplikasi audio pembaca layar SONAR dengan visualisasi gelombang suara yang merepresentasikan sintesis teks ke suara secara real-time.",
    caption: "Articulating visual information into natural academic speech.",
    category: "feature",
  },
  featureGlasses: {
    src: "/images/feature_glasses.jpg",
    alt: "Tampilan jarak dekat mahasiswa yang mengenakan kacamata berbingkai modern dengan integrasi sensor kamera mikro untuk membantu navigasi ruang dan pembacaan teks visual.",
    caption: "Dukungan perangkat wearable dan asisten visual cerdas.",
    category: "feature",
  },
  featureScan: {
    src: "/images/feature_scan.jpg",
    alt: "Buku teks perkuliahan terbuka di atas meja belajar dengan kamera ponsel mengarah ke halaman cetak untuk proses OCR dan restrukturisasi semantik dokumen.",
    caption: "Pemindaian instan untuk dokumen cetak, modul kuliah, dan handout.",
    category: "feature",
  },
  featureStudy: {
    src: "/images/feature_study.jpg",
    alt: "Dua mahasiswa universitas duduk berdampingan di meja perpustakaan kampus, saling berdiskusi dan memeriksa hasil verifikasi dokumen perkuliahan.",
    caption: "Kolaborasi antara mahasiswa dan volunteer reviewer dalam satu mata kuliah.",
    category: "feature",
  },
  featureBraille: {
    src: "/images/feature_braille.jpg",
    alt: "Jari-jemari seorang mahasiswa menyentuh titik-titik timbul braille pada buku bertekstur tebal, menggambarkan pentingnya representasi taktil dan format alternatif.",
    caption: "Kompatibilitas penuh dengan refreshable braille display dan screen reader.",
    category: "feature",
  },
  testimonialStudent1: {
    src: "/images/testimonial_1.jpg",
    alt: "Foto potret Maya Lin, mahasiswi Ilmu Komputer tunanetra angkatan 2024, tersenyum percaya diri di koridor fakultas.",
    name: "Maya Lin",
    role: "Mahasiswi Ilmu Komputer (Tunanetra Total)",
    university: "Universitas Indonesia",
    quote:
      "Sebelum ada SONAR, rumus kalkulus dan struktur pohon biner di PDF slide selalu dibacakan 'image graphic' oleh NVDA. Sekarang semua rumus dibacakan runtut dalam MathML dan bahasa Indonesia yang natural.",
    rating: 5,
  },
  testimonialStudent2: {
    src: "/images/testimonial_2.jpg",
    alt: "Foto potret David Pratama, mahasiswa Program Studi Matematika low-vision, mengenakan kacamata dan tersenyum di ruang baca komputasi.",
    name: "David Pratama",
    role: "Mahasiswa Matematika (Low Vision)",
    university: "Institut Teknologi Bandung",
    quote:
      "Fitur high-contrast warm surface dan navigasi heading level di SONAR membuat saya tidak cepat lelah saat membaca jurnal puluhan halaman. Fitur Tanya AI dengan sitasi dokumen sangat membantu pemahaman materi.",
    rating: 5,
  },
  testimonialVolunteer: {
    src: "/images/testimonial_3.jpg",
    alt: "Foto potret Sarah Jenkins, S.Kom., asisten pengajar pascasarjana dan volunteer reviewer dokumen aksesibilitas, berpose profesional.",
    name: "Sarah Jenkins, S.Kom.",
    role: "Senior Teaching Assistant & Volunteer Reviewer",
    university: "Universitas Gadjah Mada",
    quote:
      "Sebagai volunteer, review workbench SONAR memudahkan saya memeriksa LaTeX formula dan deskripsi diagram secara side-by-side. Sekali materi saya setujui, seluruh mahasiswa sekelas langsung dapat menggunakannya kembali.",
    rating: 5,
  },
  courseCS: {
    src: "/images/course_cs.jpg",
    alt: "Visualisasi struktur pohon graf dan potongan kode algoritma pemrograman dengan latar belakang kontras tinggi yang ramah pembaca layar.",
    caption: "CS 201 — Struktur Data dan Algoritma",
  },
  courseMath: {
    src: "/images/course_math.jpg",
    alt: "Papan tulis akademis yang memuat formula kalkulus integral lipat, gradien vektor, dan pembuktian matriks aljabar terstruktur rapi.",
    caption: "MATH 105 — Kalkulus Multivariabel & Aljabar Linier",
  },
  courseStat: {
    src: "/images/course_stat.jpg",
    alt: "Diagram kurva distribusi probabilitas normal standar dan tabel ringkasan inferensi statistik dengan anotasi data yang jelas.",
    caption: "STAT 210 — Teori Probabilitas & Inferensi Statistik",
  },
} as const;
