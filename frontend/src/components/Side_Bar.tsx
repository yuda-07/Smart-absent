import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import api from '../utils/api'

interface SideBarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

function Side_Bar({ isOpen = false, setIsOpen }: SideBarProps) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        await api.delete('/authentications', { data: { refreshToken } });
      } catch (err) {
        console.error('Logout backend error', err);
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    }
  };

  const menuItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/absensi', icon: 'calendar_month', label: 'Data Absensi' },
    { path: '/mahasiswa', icon: 'groups', label: 'Daftar Mahasiswa' },
    { path: '/laporan', icon: 'analytics', label: 'Laporan & Statistik' },
    { path: '/notifikasi', icon: 'notifications', label: 'Notifikasi' },
    { path: '/pengaturan', icon: 'settings', label: 'Pengaturan' },
  ];

  return (
    <aside 
      className={`h-screen w-72 fixed left-0 top-0 bg-[#031634] text-white border-r border-[#1a2b4a] flex flex-col z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Mobile Close Button */}
      <button 
        onClick={() => setIsOpen?.(false)}
        className="lg:hidden absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50 flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-white">close</span>
      </button>

      {/* Header / Logo Section */}
      <div 
        className="p-6 border-b border-[#1a2b4a]/50 cursor-pointer group hover:bg-[#1a2b4a]/30 transition-colors"
        onClick={() => { navigate('/'); setIsOpen?.(false); }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-[#88b4fe] rounded-full flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#034587] text-2xl font-bold">fingerprint</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SiAPEL</h1>
            <p className="text-xs text-[#8293b7] font-medium uppercase tracking-wider">Smart Absence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-2 bg-[#1a2b4a] rounded-full border border-[#4e5e80]/20">
          <div className="relative">
            <img
              alt="Admin"
              className="w-10 h-10 rounded-full border-2 border-[#88b4fe] object-cover"
              src="https://ui-avatars.com/api/?name=Admin&background=031634&color=fff"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#031634] rounded-full"></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Administrator</p>
            <p className="text-xs text-[#8293b7] truncate uppercase font-bold tracking-tighter">Dosen Pengawas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen?.(false)}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-[#88b4fe] text-[#034587] shadow-md' 
                : 'text-white/70 hover:bg-[#1a2b4a] hover:text-white'}
            `}
          >
            <span className={`material-symbols-outlined transition-colors text-lg ${
              'group-hover:scale-110 transition-transform duration-200'
            }`}>
              {item.icon}
            </span>
            <span className="text-sm font-bold flex-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1a2b4a]/50 space-y-1">
        <NavLink
          to="/bantuan"
          className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
            ${isActive 
              ? 'bg-[#1a2b4a] text-white' 
              : 'text-white/70 hover:bg-[#1a2b4a] hover:text-white'}
          `}
        >
          <span className="material-symbols-outlined text-lg">help</span>
          <span className="text-sm font-bold">Bantuan</span>
        </NavLink>
        
        <button
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[#ffdad6] hover:bg-[#ba1a1a]/20 transition-all duration-200"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="text-sm font-bold">Keluar</span>
        </button>
      </div>
    </aside>
  )
}

export default Side_Bar
