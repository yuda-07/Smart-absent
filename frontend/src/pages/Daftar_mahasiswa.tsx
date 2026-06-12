import React, { useState, useMemo, useEffect } from 'react';
import api from '../utils/api';

type StudentStatus = 'Aktif' | 'Peringatan' | 'Kritis';

interface Student {
  id: string;
  name: string;
  email: string;
  nim: string;
  jurusan: string;
  angkatan: string;
  status: StudentStatus;
  avatar: string;
}

const DaftarMahasiswa = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form States
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '', email: '', nim: '', jurusan: 'Teknologi Rekayasa Perangkat Lunak', angkatan: '2023', status: 'Aktif'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/mahasiswa', { params: { per_page: 200 } });
      const mhsData = response.data.data.mahasiswas.data || response.data.data.mahasiswas;
      const mappedStudents = (Array.isArray(mhsData) ? mhsData : []).map((m: any) => ({
        id: m.id,
        name: m.nama,
        email: m.email,
        nim: m.nim,
        jurusan: m.kelas || m.jurusan || '',
        angkatan: '2023', // Default
        status: 'Aktif' as StudentStatus,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nama)}&background=random`
      }));
      setStudents(mappedStudents);
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Derived filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.nim.includes(searchQuery);
      const matchesJurusan = filterJurusan ? student.jurusan === filterJurusan : true;
      const matchesAngkatan = filterAngkatan ? student.angkatan === filterAngkatan : true;
      return matchesSearch && matchesJurusan && matchesAngkatan;
    });
  }, [students, searchQuery, filterJurusan, filterAngkatan]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mahasiswa ini?')) {
      try {
        await api.delete(`/mahasiswa/${id}`);
        setStudents(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        alert('Gagal menghapus mahasiswa');
      }
    }
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '', email: '', nim: '', jurusan: 'Teknologi Rekayasa Perangkat Lunak', angkatan: '2023', status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        // Update
        await api.put(`/mahasiswa/${editingStudent.id}`, {
          nama: formData.name,
          nim: formData.nim,
          kelas: formData.jurusan
        });
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } as Student : s));
      } else {
        // Create
        // Note: Backend requires password for new user
        await api.post('/mahasiswa', {
          email: formData.email,
          password: 'password123', // Default password
          nama: formData.name,
          nim: formData.nim,
          kelas: formData.jurusan
        });
        fetchStudents();
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const renderStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'Aktif':
        return (
          <span className="bg-[#e6f4ea] text-[#1e8e3e] px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border border-[#1e8e3e]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1e8e3e]"></span> Aktif
          </span>
        );
      case 'Peringatan':
        return (
          <span className="bg-[#fef7e0] text-[#f29900] px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border border-[#f29900]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f29900]"></span> Peringatan
          </span>
        );
      case 'Kritis':
        return (
          <span className="bg-[#fce8e6] text-[#d93025] px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border border-[#d93025]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d93025]"></span> Kritis
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e4e2e5] pb-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#031634]">Direktori Mahasiswa</h1>
          <p className="text-sm lg:text-base text-[#44474e] mt-1">
            Kelola data, status kehadiran, dan profil akademik mahasiswa terdaftar.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#2d5ea2] text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-[#031634] transition-all shadow-sm whitespace-nowrap active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          Tambah Mahasiswa
        </button>
      </div>

      {/* Filters & Controls Container */}
      <div className="bg-white p-4 rounded-xl border border-[#e4e2e5] shadow-sm flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#44474e] uppercase tracking-wide">Cari Mahasiswa</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75777e]">
              search
            </span>
            <input
              className="w-full pl-10 pr-3 py-2.5 border border-[#c5c6cf] rounded-lg text-sm text-[#1b1b1e] focus:border-[#2d5ea2] focus:ring-2 focus:ring-[#2d5ea2]/20 focus:outline-none bg-[#fbf8fc]"
              placeholder="Cari berdasarkan nama atau NIM..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full lg:w-64 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#44474e] uppercase tracking-wide">Jurusan</label>
          <div className="relative">
            <select 
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 border border-[#c5c6cf] rounded-lg text-sm text-[#1b1b1e] focus:border-[#2d5ea2] focus:ring-2 focus:ring-[#2d5ea2]/20 focus:outline-none bg-[#fbf8fc] appearance-none"
            >
              <option value="">Semua Jurusan</option>
              <option value="Teknologi Rekayasa Perangkat Lunak">Teknologi Rekayasa Perangkat Lunak</option>
              <option value="Teknologi Rekayasa Internet">Teknologi Rekayasa Internet</option>
              <option value="Manajemen Informatika">Manajemen Informatika</option>
              <option value="Rekayasa Elektronika">Rekayasa Elektronika</option>
              <option value="Rekayasa Data Science">Rekayasa Data Science</option>
              <option value="Teknologi Ternak">Teknologi Ternak</option>
              <option value="Pertanian">Pertanian</option>
              <option value="Perikanan">Perikanan</option>
              <option value="Perkebunan">Perkebunan</option>
              <option value="Teknologi Pangan">Teknologi Pangan</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75777e] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
        <div className="w-full lg:w-48 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#44474e] uppercase tracking-wide">Angkatan</label>
          <div className="relative">
            <select 
              value={filterAngkatan}
              onChange={(e) => setFilterAngkatan(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 border border-[#c5c6cf] rounded-lg text-sm text-[#1b1b1e] focus:border-[#2d5ea2] focus:ring-2 focus:ring-[#2d5ea2]/20 focus:outline-none bg-[#fbf8fc] appearance-none"
            >
              <option value="">Semua Angkatan</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75777e] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white border border-[#e4e2e5] rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-[#f5f3f6] text-[#44474e] border-b border-[#e4e2e5]">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-16 text-center">Foto</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nama & Kontak</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">NIM</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Jurusan</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-24 text-center">Angkatan</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-32 text-center">Status Kehadiran</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-32 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e2e5]">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-[#fbf8fc] transition-colors group">
                  <td className="px-6 py-3 text-center">
                    <img
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover inline-block border-2 border-[#e4e2e5]"
                      src={student.avatar}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-sm font-bold text-[#031634] group-hover:text-[#2d5ea2] transition-colors">
                      {student.name}
                    </div>
                    <div className="text-xs text-[#75777e]">{student.email}</div>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-[#1b1b1e]">{student.nim}</td>
                  <td className="px-6 py-3 text-sm text-[#44474e]">{student.jurusan}</td>
                  <td className="px-6 py-3 text-sm font-medium text-[#1b1b1e] text-center">{student.angkatan}</td>
                  <td className="px-6 py-3 text-center">
                    {renderStatusBadge(student.status)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 text-[#44474e] hover:text-[#2d5ea2] transition-colors rounded hover:bg-[#e4e2e5]"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-1.5 text-[#44474e] hover:text-[#ba1a1a] transition-colors rounded hover:bg-[#ffdad6]"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#75777e]">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                  <p className="text-sm">Tidak ada data mahasiswa yang cocok dengan pencarian.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#e4e2e5] flex justify-between items-center bg-[#031634] text-white">
              <h2 className="text-lg font-bold">
                {editingStudent ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">Nama Lengkap</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] focus:ring-1 focus:ring-[#2d5ea2] outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">NIM</label>
                  <input 
                    required
                    type="text" 
                    value={formData.nim}
                    onChange={e => setFormData({...formData, nim: e.target.value})}
                    className="w-full px-3 py-2 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] focus:ring-1 focus:ring-[#2d5ea2] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">Angkatan</label>
                  <select 
                    value={formData.angkatan}
                    onChange={e => setFormData({...formData, angkatan: e.target.value})}
                    className="w-full px-3 py-2 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] outline-none"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] focus:ring-1 focus:ring-[#2d5ea2] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">Jurusan</label>
                <select 
                  value={formData.jurusan}
                  onChange={e => setFormData({...formData, jurusan: e.target.value})}
                  className="w-full px-3 py-2 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] outline-none"
                >
                  <option value="Teknologi Rekayasa Perangkat Lunak">Teknologi Rekayasa Perangkat Lunak</option>
                  <option value="Teknologi Rekayasa Internet">Teknologi Rekayasa Internet</option>
                  <option value="Manajemen Informatika">Manajemen Informatika</option>
                  <option value="Rekayasa Elektronika">Rekayasa Elektronika</option>
                  <option value="Rekayasa Data Science">Rekayasa Data Science</option>
                  <option value="Teknologi Ternak">Teknologi Ternak</option>
                  <option value="Pertanian">Pertanian</option>
                  <option value="Perikanan">Perikanan</option>
                  <option value="Perkebunan">Perkebunan</option>
                  <option value="Teknologi Pangan">Teknologi Pangan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">Status Kehadiran Default</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as StudentStatus})}
                  className="w-full px-3 py-2 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] outline-none"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Peringatan">Peringatan</option>
                  <option value="Kritis">Kritis</option>
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-[#e4e2e5]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-[#44474e] hover:bg-[#f5f3f6] rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-[#2d5ea2] text-white text-sm font-bold rounded-lg hover:bg-[#031634] transition-colors"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default DaftarMahasiswa