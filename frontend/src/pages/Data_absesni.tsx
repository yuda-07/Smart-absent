import React, { useState, useMemo, useEffect } from 'react'
import api from '../utils/api'

type AbsensiStatus = 'Hadir' | 'Terlambat' | 'Alpa' | 'Izin';

interface AbsensiRecord {
  id: string;
  name: string;
  nim: string;
  waktu: string;
  status: AbsensiStatus;
  keterangan: string;
  avatar: string;
  jam_masuk: string | null;
  terlambat_menit: number | null;
  terlambat_jam: string | null;
}

interface ManualInputForm {
  mahasiswaId: string;
  status: AbsensiStatus;
  waktu: string;
  keterangan: string;
}

const DataAbsensi = () => {
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AbsensiRecord | null>(null);

  // Manual Input Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [mahasiswaList, setMahasiswaList] = useState<{ id: string; nama: string; nim: string }[]>([]);
  const [manualForm, setManualForm] = useState<ManualInputForm>({
    mahasiswaId: '',
    status: 'Hadir',
    waktu: new Date().toTimeString().slice(0, 5),
    keterangan: 'Input Manual'
  });
  const [isSavingManual, setIsSavingManual] = useState(false);

  useEffect(() => {
    fetchAbsensi();
    fetchMahasiswaList();
  }, []);

  const fetchAbsensi = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/absensi', { params: { per_page: 200 } });
      const absensiData = response.data.data.absensi.data || response.data.data.absensi;
      const mappedRecords = absensiData.map((a: any) => ({
        id: a.id,
        name: a.nama,
        nim: a.nim,
        waktu: new Date(a.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: a.status as AbsensiStatus,
        keterangan: a.terlambat_menit && a.terlambat_menit > 0
          ? `Terlambat ${a.terlambat_jam} (Masuk: ${a.jam_masuk?.slice(0,5) || '-'})`
          : 'Tap Kartu RFID',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.nama)}&background=random`,
        jam_masuk: a.jam_masuk || null,
        terlambat_menit: a.terlambat_menit || null,
        terlambat_jam: a.terlambat_jam || null,
      }));
      setRecords(mappedRecords);
    } catch (err) {
      console.error('Failed to fetch absensi', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMahasiswaList = async () => {
    try {
      const response = await api.get('/mahasiswa', { params: { per_page: 200 } });
      const mhsData = response.data.data.mahasiswas.data || response.data.data.mahasiswas;
      setMahasiswaList(mhsData.map((m: any) => ({
        id: m.id,
        nama: m.nama,
        nim: m.nim
      })));
    } catch (err) {
      console.error('Failed to fetch mahasiswa list', err);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchSearch = record.name.toLowerCase().includes(searchQuery.toLowerCase()) || record.nim.includes(searchQuery);
      const matchStatus = filterStatus ? record.status === filterStatus : true;
      return matchSearch && matchStatus;
    });
  }, [records, searchQuery, filterStatus]);

  const handleEditClick = (record: AbsensiRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      try {
        await api.put(`/absensi/${editingRecord.id}`, { status: editingRecord.status });
        setRecords(prev => prev.map(r => r.id === editingRecord.id ? editingRecord : r));
        setIsEditModalOpen(false);
      } catch (err) {
        alert('Gagal memperbarui absensi');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus log absensi ini?')) {
      try {
        await api.delete(`/absensi/${id}`);
        setRecords(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        alert('Gagal menghapus log absensi');
      }
    }
  };

  const handleOpenManual = () => {
    setManualForm({
      mahasiswaId: mahasiswaList[0]?.id || '',
      status: 'Hadir',
      waktu: new Date().toTimeString().slice(0, 5),
      keterangan: 'Input Manual'
    });
    setIsManualModalOpen(true);
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingManual(true);
    try {
      // Build waktu timestamp by combining today's date + selected time
      const todayDate = new Date().toISOString().split('T')[0];
      const waktuISO = new Date(`${todayDate}T${manualForm.waktu}:00`).toISOString();

      await api.post('/absensi', {
        mahasiswaId: manualForm.mahasiswaId,
        status: manualForm.status,
        waktu: waktuISO,
        jam_masuk: manualForm.waktu,
      });

      // Refresh list
      await fetchAbsensi();
      setIsManualModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan absensi manual');
    } finally {
      setIsSavingManual(false);
    }
  };

  const renderStatusBadge = (status: AbsensiStatus) => {
    switch (status) {
      case 'Hadir': return <span className="bg-[#e6f4ea] text-[#1e8e3e] px-2 py-1 rounded-full text-xs font-bold border border-[#1e8e3e]/20">Hadir</span>;
      case 'Terlambat': return <span className="bg-[#fef7e0] text-[#f29900] px-2 py-1 rounded-full text-xs font-bold border border-[#f29900]/20">Terlambat</span>;
      case 'Alpa': return <span className="bg-[#fce8e6] text-[#d93025] px-2 py-1 rounded-full text-xs font-bold border border-[#d93025]/20">Alpa</span>;
      case 'Izin': return <span className="bg-[#e8f0fe] text-[#1a73e8] px-2 py-1 rounded-full text-xs font-bold border border-[#1a73e8]/20">Izin / Sakit</span>;
    }
  };

  const handleExportExcel = () => {
    const headers = ['NIM', 'Nama Mahasiswa', 'Waktu Masuk', 'Status', 'Keterangan'];
    const rows = filteredRecords.map(r =>
      [r.nim, r.name, r.waktu, r.status, r.keterangan].map(val => `"${val}"`).join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `Data_Absensi_${filterDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e4e2e5] pb-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#031634]">Data Absensi</h1>
          <p className="text-sm lg:text-base text-[#44474e] mt-1">
            Pantau dan kelola log kehadiran mahasiswa secara real-time via RFID.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* ✅ MANUAL INPUT BUTTON */}
          <button
            onClick={handleOpenManual}
            className="bg-[#031634] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-[#2d5ea2] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">edit_note</span>
            Input Manual
          </button>
          <button onClick={window.print} className="border border-[#c5c6cf] text-[#44474e] px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-[#f5f3f6] transition-all bg-white">
            <span className="material-symbols-outlined">print</span> Cetak
          </button>
          <button onClick={handleExportExcel} className="bg-[#1e8e3e] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-[#137333] transition-all shadow-sm">
            <span className="material-symbols-outlined">download</span> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#e4e2e5] shadow-sm flex flex-col lg:flex-row gap-4 items-end">
        <div className="w-full lg:w-48 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#44474e] uppercase">Tanggal</label>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] focus:outline-none bg-[#fbf8fc]"
          />
        </div>
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#44474e] uppercase">Cari Mahasiswa</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75777e]">search</span>
            <input
              className="w-full pl-10 pr-3 py-2.5 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] focus:outline-none bg-[#fbf8fc]"
              placeholder="Ketik nama atau NIM..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full lg:w-48 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#44474e] uppercase">Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] focus:outline-none bg-[#fbf8fc]"
          >
            <option value="">Semua Status</option>
            <option value="Hadir">Hadir</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Alpa">Alpa</option>
            <option value="Izin">Izin/Sakit</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e4e2e5] rounded-xl overflow-x-auto shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#031634]"></div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#031634] text-white border-b border-[#e4e2e5]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase w-16 text-center">Foto</th>
                <th className="px-6 py-4 text-xs font-bold uppercase">Mahasiswa</th>
                <th className="px-6 py-4 text-xs font-bold uppercase">Waktu Masuk</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase">Keterangan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2e5]">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-[#fbf8fc] transition-colors">
                  <td className="px-6 py-3 text-center">
                    <img src={record.avatar} alt={record.name} className="w-10 h-10 rounded-full object-cover inline-block border-2 border-[#e4e2e5]" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-sm font-bold text-[#031634]">{record.name}</div>
                    <div className="text-xs text-[#75777e]">{record.nim}</div>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#1b1b1e] font-medium">{record.waktu}</td>
                  <td className="px-6 py-3 text-center">{renderStatusBadge(record.status)}</td>
                  <td className="px-6 py-3 text-sm text-[#75777e]">{record.keterangan}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => handleEditClick(record)} className="p-1.5 text-[#44474e] hover:text-[#2d5ea2] rounded hover:bg-[#e4e2e5] mr-1">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="p-1.5 text-[#44474e] hover:text-[#ba1a1a] rounded hover:bg-[#ffdad6]">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-[#75777e]">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">event_busy</span>
                    <p className="text-sm">Data absensi tidak ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ MANUAL INPUT MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-[#031634] text-white flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">Input Absensi Manual</h2>
                <p className="text-xs text-white/60 mt-0.5">Digunakan saat sistem RFID tidak dapat digunakan</p>
              </div>
              <button onClick={() => setIsManualModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="p-6 flex flex-col gap-4">
              {/* Warning Banner */}
              <div className="bg-[#fef7e0] border border-[#f29900]/30 rounded-lg px-4 py-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-[#f29900] text-[18px] mt-0.5">warning</span>
                <p className="text-xs text-[#856404]">Input manual hanya sebagai cadangan. Pastikan data sudah diverifikasi sebelum disimpan.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">Pilih Mahasiswa</label>
                <select
                  value={manualForm.mahasiswaId}
                  onChange={e => setManualForm({ ...manualForm, mahasiswaId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] outline-none"
                  required
                >
                  <option value="">-- Pilih Mahasiswa --</option>
                  {mahasiswaList.map(m => (
                    <option key={m.id} value={m.id}>{m.nama} ({m.nim})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">Status Kehadiran</label>
                  <select
                    value={manualForm.status}
                    onChange={e => setManualForm({ ...manualForm, status: e.target.value as AbsensiStatus })}
                    className="w-full px-3 py-2.5 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] outline-none"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Alpa">Alpa</option>
                    <option value="Izin">Izin / Sakit</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">Waktu Masuk</label>
                  <input
                    type="time"
                    value={manualForm.waktu}
                    onChange={e => setManualForm({ ...manualForm, waktu: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#44474e] uppercase mb-1 block">Keterangan</label>
                <input
                  type="text"
                  value={manualForm.keterangan}
                  onChange={e => setManualForm({ ...manualForm, keterangan: e.target.value })}
                  placeholder="Misal: Input Manual - Kartu RFID rusak"
                  className="w-full px-3 py-2.5 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#e4e2e5] mt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-[#44474e] hover:bg-[#f5f3f6] rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className={`px-6 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 transition-colors ${
                    isSavingManual ? 'bg-[#2d5ea2]/70 cursor-wait' : 'bg-[#2d5ea2] hover:bg-[#031634]'
                  }`}
                >
                  {isSavingManual && <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>}
                  {isSavingManual ? 'Menyimpan...' : 'Simpan Absensi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 bg-[#031634] text-white flex justify-between items-center">
              <h2 className="font-bold">Edit Status Absensi</h2>
              <button onClick={() => setIsEditModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-[#f5f3f6] rounded-lg p-3">
                <img src={editingRecord.avatar} alt={editingRecord.name} className="w-10 h-10 rounded-full border-2 border-white" />
                <div>
                  <p className="text-sm font-bold text-[#031634]">{editingRecord.name}</p>
                  <p className="text-xs text-[#75777e]">{editingRecord.nim}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#44474e] block mb-1">Status Kehadiran</label>
                <select
                  value={editingRecord.status}
                  onChange={e => setEditingRecord({ ...editingRecord, status: e.target.value as AbsensiStatus })}
                  className="w-full px-3 py-2 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] outline-none"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Alpa">Alpa</option>
                  <option value="Izin">Izin/Sakit</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#44474e] block mb-1">Keterangan</label>
                <input
                  type="text"
                  value={editingRecord.keterangan}
                  onChange={e => setEditingRecord({ ...editingRecord, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c5c6cf] rounded-lg text-sm focus:border-[#2d5ea2] outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-[#44474e] hover:bg-[#f5f3f6] rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-[#2d5ea2] hover:bg-[#031634] rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataAbsensi