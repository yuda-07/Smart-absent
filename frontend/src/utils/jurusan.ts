// Struktur Jurusan dan Prodi Politeknik

export interface Prodi {
  nama: string;
  jenjang: string; // D3 atau D4
}

export interface Jurusan {
  kode: string;
  nama: string;
  prodi: Prodi[];
}

export const JURUSAN_LIST: Jurusan[] = [
  {
    kode: 'BTP',
    nama: 'Budidaya Tanaman Pangan',
    prodi: [
      { nama: 'Hortikultura', jenjang: 'D3' },
      { nama: 'Produksi dan Manajemen Industri Perkebunan', jenjang: 'D4' },
      { nama: 'Teknologi Produksi Tanaman Pangan', jenjang: 'D4' },
      { nama: 'Pengelolaan Perkebunan Kopi', jenjang: 'D4' },
    ],
  },
  {
    kode: 'BTPk',
    nama: 'Budidaya Tanaman Perkebunan',
    prodi: [
      { nama: 'Produksi Tanaman Perkebunan', jenjang: 'D3' },
      { nama: 'Produksi dan Manajemen Industri Perkebunan', jenjang: 'D4' },
      { nama: 'Pengelolaan Perkebunan Kopi', jenjang: 'D4' },
    ],
  },
  {
    kode: 'TP',
    nama: 'Teknologi Pertanian',
    prodi: [
      { nama: 'Teknologi Pangan', jenjang: 'D3' },
      { nama: 'Mekanisasi Pertanian', jenjang: 'D3' },
      { nama: 'Teknik Sumber Daya Lahan dan Lingkungan', jenjang: 'D3' },
      { nama: 'Teknologi Rekayasa Pangan', jenjang: 'D4' },
      { nama: 'Teknologi Rekayasa Pertanian', jenjang: 'D4' },
    ],
  },
  {
    kode: 'PTK',
    nama: 'Peternakan',
    prodi: [
      { nama: 'Produksi Ternak', jenjang: 'D3' },
      { nama: 'Teknologi Produksi Ternak', jenjang: 'D4' },
      { nama: 'Teknologi Pakan Ternak', jenjang: 'D4' },
    ],
  },
  {
    kode: 'EB',
    nama: 'Ekonomi dan Bisnis',
    prodi: [
      { nama: 'Akuntansi', jenjang: 'D3' },
      { nama: 'Akuntansi Perpajakan', jenjang: 'D4' },
      { nama: 'Agribisnis Pangan', jenjang: 'D4' },
      { nama: 'Pengelolaan Agribisnis', jenjang: 'D4' },
    ],
  },
  {
    kode: 'TNK',
    nama: 'Teknik',
    prodi: [
      { nama: 'Teknologi Rekayasa Konstruksi Jalan dan Jembatan', jenjang: 'D4' },
      { nama: 'Teknologi Rekayasa Otomotif', jenjang: 'D4' },
      { nama: 'Teknologi Rekayasa Mekatronika', jenjang: 'D4' },
    ],
  },
  {
    kode: 'PK',
    nama: 'Perikanan dan Kelautan',
    prodi: [
      { nama: 'Budidaya Perikanan', jenjang: 'D3' },
      { nama: 'Perikanan Tangkap', jenjang: 'D3' },
      { nama: 'Teknologi Akuakultur', jenjang: 'D4' },
      { nama: 'Pengelolaan Perikanan Tangkap', jenjang: 'D4' },
    ],
  },
  {
    kode: 'TI',
    nama: 'Teknologi Informasi',
    prodi: [
      { nama: 'Manajemen Informatika', jenjang: 'D3' },
      { nama: 'Teknologi Rekayasa Perangkat Lunak', jenjang: 'D4' },
      { nama: 'Teknologi Rekayasa Internet', jenjang: 'D4' },
      { nama: 'Teknologi Rekayasa Elektronika', jenjang: 'D4' },
    ],
  },
];

// Helper: get all jurusan names
export const getJurusanNames = (): string[] => JURUSAN_LIST.map(j => j.nama);

// Helper: get all prodi names (flat)
export const getAllProdiNames = (): string[] =>
  JURUSAN_LIST.flatMap(j => j.prodi.map(p => `${j.kode} - ${p.jenjang} ${p.nama}`));

// Helper: get prodi for a specific jurusan
export const getProdiByJurusan = (jurusanNama: string): Prodi[] => {
  const jurusan = JURUSAN_LIST.find(j => j.nama === jurusanNama);
  return jurusan?.prodi || [];
};

// Helper: find jurusan from prodi name
export const findJurusanFromProdi = (prodiNama: string): string => {
  for (const j of JURUSAN_LIST) {
    if (j.prodi.some(p => p.nama === prodiNama || `${p.jenjang} ${p.nama}` === prodiNama)) {
      return j.nama;
    }
  }
  return 'Lainnya';
};
