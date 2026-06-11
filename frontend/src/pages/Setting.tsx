import React, { useState, useEffect } from 'react'
import api from '../utils/api'

const PRODI_LIST = [
  'Teknologi Rekayasa Perangkat Lunak',
  'Teknologi Rekayasa Internet',
  'Manajemen Informatika',
  'Rekayasa Elektronika',
  'Rekayasa Data Science',
];

const Setting = () => {
  const [profileData, setProfileData] = useState({ name: '', nip: '', email: '' });
  const [savedProfile, setSavedProfile] = useState({ name: '', nip: '', email: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [systemData, setSystemData] = useState({ jamApel: '07:30', toleransi: '15', kunciOtomatis: true });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSystem, setIsSavingSystem] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/profile');
      const { user } = response.data.data;
      const data = {
        name: user.nama || '',
        nip: user.nip || user.nim || '',
        email: user.email || ''
      };
      setProfileData(data);
      setSavedProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData(savedProfile); // revert to saved data
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSavedProfile(profileData);
      setIsEditingProfile(false);
      showToast('Profil berhasil diperbarui!');
    } catch (err) {
      alert('Gagal menyimpan profil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSystem(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      showToast('Pengaturan sistem berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setIsSavingSystem(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#031634]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#031634]">Pengaturan Sistem</h1>
        <p className="text-sm lg:text-base text-[#44474e] mt-1">
          Kelola preferensi akun, aturan kehadiran, dan konektivitas perangkat RFID.
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1e8e3e] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column: Profil Administrator */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-[#e4e2e5] rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-[#e4e2e5] pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2d5ea2] bg-[#e8f0fe] p-2 rounded-full">person</span>
                <h3 className="text-lg font-bold text-[#031634]">Profil Administrator</h3>
              </div>
              {/* Edit / Cancel Button */}
              {!isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2d5ea2] border border-[#2d5ea2] rounded-lg hover:bg-[#e8f0fe] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit Profil
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#44474e] border border-[#c5c6cf] rounded-lg hover:bg-[#f5f3f6] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  Batal
                </button>
              )}
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="relative group cursor-pointer">
                <img
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-[#e8f0fe] object-cover"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'Admin')}&background=031634&color=fff&size=128`}
                />
                {isEditingProfile && (
                  <button
                    type="button"
                    aria-label="Upload Foto"
                    className="absolute bottom-0 right-0 bg-white border border-[#e4e2e5] rounded-full p-1.5 text-[#2d5ea2] hover:bg-[#f5f3f6] shadow-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  </button>
                )}
              </div>
              <span className="text-xs text-[#75777e]">
                {isEditingProfile ? 'Klik kamera untuk ganti foto' : profileData.name || '-'}
              </span>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-xs font-bold text-[#44474e] uppercase mb-1.5 block">Nama Lengkap</label>
                <input
                  name="name"
                  value={profileData.name}
                  onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                  readOnly={!isEditingProfile}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${
                    isEditingProfile
                      ? 'bg-[#fbf8fc] border-[#2d5ea2] focus:ring-2 focus:ring-[#2d5ea2]/20'
                      : 'bg-[#f5f3f6] border-[#e4e2e5] text-[#44474e] cursor-default'
                  }`}
                  type="text"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#44474e] uppercase mb-1.5 block">NIP / NIDN</label>
                <input
                  name="nip"
                  value={profileData.nip}
                  onChange={e => setProfileData({ ...profileData, nip: e.target.value })}
                  readOnly={!isEditingProfile}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${
                    isEditingProfile
                      ? 'bg-[#fbf8fc] border-[#2d5ea2] focus:ring-2 focus:ring-[#2d5ea2]/20'
                      : 'bg-[#f5f3f6] border-[#e4e2e5] text-[#44474e] cursor-default'
                  }`}
                  type="text"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#44474e] uppercase mb-1.5 block">Email</label>
                <input
                  name="email"
                  value={profileData.email}
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                  readOnly={!isEditingProfile}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${
                    isEditingProfile
                      ? 'bg-[#fbf8fc] border-[#2d5ea2] focus:ring-2 focus:ring-[#2d5ea2]/20'
                      : 'bg-[#f5f3f6] border-[#e4e2e5] text-[#44474e] cursor-default'
                  }`}
                  type="email"
                />
              </div>

              {/* Save Profile Button - only visible when editing */}
              {isEditingProfile && (
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className={`w-full mt-2 bg-[#2d5ea2] text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isSavingProfile ? 'opacity-70 cursor-wait' : 'hover:bg-[#031634]'
                  }`}
                >
                  {isSavingProfile ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">save</span>
                  )}
                  {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Sistem & IoT */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSaveSystem} className="flex flex-col gap-6">
            {/* Aturan Apel Card */}
            <div className="bg-white border border-[#e4e2e5] rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e4e2e5] pb-4">
                <span className="material-symbols-outlined text-[#2d5ea2] bg-[#e8f0fe] p-2 rounded-full">schedule</span>
                <h3 className="text-lg font-bold text-[#031634]">Aturan Apel & Kehadiran</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div>
                  <label className="text-xs font-bold text-[#44474e] uppercase mb-1.5 block">Jam Mulai Apel</label>
                  <input
                    name="jamApel"
                    value={systemData.jamApel}
                    onChange={e => setSystemData({ ...systemData, jamApel: e.target.value })}
                    className="w-full bg-[#fbf8fc] border border-[#c5c6cf] rounded-lg px-4 py-2.5 text-sm focus:border-[#2d5ea2] outline-none"
                    type="time"
                    required
                  />
                  <p className="text-xs text-[#75777e] mt-1.5">Waktu sistem mulai mencatat kehadiran otomatis via RFID.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#44474e] uppercase mb-1.5 block">Toleransi (Menit)</label>
                  <input
                    name="toleransi"
                    value={systemData.toleransi}
                    onChange={e => setSystemData({ ...systemData, toleransi: e.target.value })}
                    className="w-full bg-[#fbf8fc] border border-[#c5c6cf] rounded-lg px-4 py-2.5 text-sm focus:border-[#2d5ea2] outline-none"
                    max="60"
                    min="0"
                    type="number"
                    required
                  />
                  <p className="text-xs text-[#75777e] mt-1.5">Melewati batas ini akan tercatat sebagai 'Terlambat'.</p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between bg-[#fbf8fc] p-4 rounded-xl border border-[#e4e2e5]">
                <div>
                  <span className="text-sm font-bold text-[#031634] block">Kunci Kehadiran Otomatis</span>
                  <span className="text-xs text-[#44474e] block mt-0.5">Ubah status menjadi 'Alpa' jika tidak ada scan setelah batas waktu.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    name="kunciOtomatis"
                    checked={systemData.kunciOtomatis}
                    onChange={e => setSystemData({ ...systemData, kunciOtomatis: e.target.checked })}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-[#c5c6cf] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d5ea2]"></div>
                </label>
              </div>
            </div>

            {/* Program Studi Card */}
            <div className="bg-white border border-[#e4e2e5] rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e4e2e5] pb-4">
                <span className="material-symbols-outlined text-[#2d5ea2] bg-[#e8f0fe] p-2 rounded-full">school</span>
                <h3 className="text-lg font-bold text-[#031634]">Program Studi Aktif</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {PRODI_LIST.map(prodi => (
                  <div key={prodi} className="flex items-center gap-3 bg-[#e8f0fe] px-4 py-3 rounded-xl border border-[#2d5ea2]/20">
                    <span className="material-symbols-outlined text-[#2d5ea2] text-[20px]">check_circle</span>
                    <span className="text-sm font-semibold text-[#031634]">{prodi}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrasi IoT Card */}
            <div className="bg-white border border-[#e4e2e5] rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e4e2e5] pb-4 justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2d5ea2] bg-[#e8f0fe] p-2 rounded-full">router</span>
                  <h3 className="text-lg font-bold text-[#031634]">Koneksi IoT & RFID</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e6f4ea] text-[#1e8e3e] rounded-full text-xs font-bold border border-[#1e8e3e]/20">
                  <span className="w-2 h-2 rounded-full bg-[#1e8e3e] animate-pulse"></span> Online
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div>
                  <label className="text-xs font-bold text-[#44474e] uppercase mb-1.5 block">Device ID (RFID Reader)</label>
                  <input
                    className="w-full bg-[#f5f3f6] border border-[#e4e2e5] text-[#75777e] rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                    readOnly
                    type="text"
                    value="RDR-GTM-204"
                  />
                  <p className="text-xs text-[#75777e] mt-1.5">ID fisik perangkat RFID yang terpasang. Tidak bisa diubah.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#44474e] uppercase mb-1.5 block">API Key Autentikasi</label>
                  <div className="flex relative">
                    <input
                      className="w-full bg-[#fbf8fc] border border-[#c5c6cf] rounded-l-lg px-4 py-2.5 text-sm focus:outline-none text-[#44474e] tracking-wider"
                      readOnly
                      type="password"
                      value="sk_live_8392jf9823fj9283f"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('sk_live_8392jf9823fj9283f');
                        showToast('API Key disalin ke clipboard!');
                      }}
                      className="bg-[#f5f3f6] border border-l-0 border-[#c5c6cf] rounded-r-lg px-4 text-[#44474e] hover:bg-[#e4e2e5] transition-colors flex items-center justify-center"
                      title="Salin API Key"
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#75777e] mt-1.5">Rahasiakan kunci ini. Digunakan untuk sinkronisasi perangkat RFID.</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingSystem}
                className={`bg-[#2d5ea2] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                  isSavingSystem ? 'opacity-70 cursor-wait' : 'hover:bg-[#031634] active:scale-95'
                }`}
              >
                {isSavingSystem ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">save</span>
                )}
                {isSavingSystem ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Setting