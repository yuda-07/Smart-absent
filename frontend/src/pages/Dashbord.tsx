import React, { useEffect, useState, useLayoutEffect, useRef } from 'react'
import api from '../utils/api'
import { gsap } from 'gsap'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface Summary {
  totalMahasiswa: number;
  hadir: number;
  tidakHadir: number;
  izin: number;
  terlambat: number;
  presentPercentage: number;
}

interface FeedItem {
  id: string;
  nama: string;
  nim: string;
  waktu: string;
  status: string;
}

const Dashboard = () => {
  const [summary, setSummary] = useState<Summary>({
    totalMahasiswa: 0, hadir: 0, tidakHadir: 0, izin: 0, terlambat: 0, presentPercentage: 0
  });
  const [recentFeed, setRecentFeed] = useState<FeedItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dashboardRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Use useLayoutEffect for GSAP to prevent FOUC and ensure clean start
  useLayoutEffect(() => {
    if (!isLoading && dashboardRef.current) {
      const ctx = gsap.context(() => {
        // Initial state
        gsap.set(".summary-card, .dashboard-section", { opacity: 0, y: 20 });
        
        // Animate
        gsap.to(".summary-card", {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        });
        
        gsap.to(".dashboard-section", {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.3,
          stagger: 0.15,
          ease: "power2.out"
        });
      }, dashboardRef);
      return () => ctx.revert();
    }
  }, [isLoading]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/dashboard/stats');
      setSummary(statsRes.data.data.summary);
      setRecentFeed(statsRes.data.data.recentFeed);

      const mhsRes = await api.get('/mahasiswa');
      setStudents(mhsRes.data.data.mahasiswas.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const pieData = [
    { name: 'Hadir', value: summary.hadir + summary.terlambat, color: '#28A745' },
    { name: 'Absen', value: summary.tidakHadir + summary.izin, color: '#DC3545' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#031634]"></div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-2">
        <h1 className="font-bold text-[36px] text-[#031634] leading-tight mb-1">
          Dashboard Apel Pagi
        </h1>
        <p className="text-sm text-[#44474e] font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          {currentDate}
        </p>
      </div>

      {/* Summary Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Hadir Hari Ini', val: summary.hadir + summary.terlambat, icon: 'check_circle', color: '#28A745', sub: `${summary.presentPercentage}%` },
          { label: 'Tidak Hadir', val: summary.tidakHadir, icon: 'cancel', color: '#DC3545' },
          { label: 'Izin / Sakit', val: summary.izin, icon: 'info', color: '#856404', bg: '#FFC107', sub: 'Verifikasi' },
          { label: 'Total Mahasiswa', val: summary.totalMahasiswa, icon: 'groups', color: '#44474e', sub: 'Terdaftar' },
        ].map((card, i) => (
          <div key={i} className="summary-card bg-white border border-[#e4e2e5] rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-[#44474e] uppercase tracking-wider">{card.label}</span>
              <div className="w-10 h-10 flex items-center justify-center rounded-full" style={{ backgroundColor: `${card.color}15` }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: card.color }}>{card.icon}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-auto">
              <span className="font-bold text-[40px] text-[#031634] leading-none tracking-tight">
                {card.val}
              </span>
              {card.sub && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ color: card.color, backgroundColor: `${card.color}15` }}>
                  {card.sub}
                </span>
              )}
            </div>
            {/* Subtle background icon */}
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-500" style={{ color: card.color }}>{card.icon}</span>
          </div>
        ))}
      </section>

      {/* Middle Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feed */}
        <div className="dashboard-section lg:col-span-7 bg-white border border-[#e4e2e5] rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#e4e2e5] bg-[#fbf8fc] flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#031634] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2d5ea2]">sensors</span>
              Attendance Feed
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#28A745] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#28A745] animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <ul className="divide-y divide-[#e4e2e5]">
              {recentFeed.length > 0 ? (
                recentFeed.map((item) => (
                  <li key={item.id} className="p-4 flex items-center gap-4 hover:bg-[#fbf8fc] transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-[#031634] flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
                      {item.nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#031634] truncate">{item.nama}</p>
                      <p className="text-xs text-[#75777e]">NIM {item.nim}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#031634]">
                        {new Date(item.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.status === 'Hadir' ? 'bg-[#e6f4ea] text-[#28A745]' : 
                        item.status === 'Terlambat' ? 'bg-[#fef7e0] text-[#f29900]' : 
                        'bg-[#fce8e6] text-[#d93025]'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-12 text-center text-[#75777e]">Belum ada aktivitas.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Chart */}
        <div className="dashboard-section lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-[#e4e2e5] rounded-xl p-6 flex-1 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-[#031634] mb-6 w-full text-left">Status Kehadiran</h3>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    isAnimationActive={true}
                    animationDuration={1000}
                    data={pieData}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value"
                  >
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-xs font-bold text-[#44474e] uppercase">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#fce8e6] border border-[#f9dad6] rounded-xl p-4 flex gap-3">
             <span className="material-symbols-outlined text-[#d93025]">info</span>
             <p className="text-xs text-[#b3261e] font-medium leading-relaxed">Sistem monitoring sinkron dengan database pusat. Segala perubahan status akan tercatat secara otomatis.</p>
          </div>
        </div>
      </section>

      {/* Bottom Table */}
      <section className="dashboard-section bg-white border border-[#e4e2e5] rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e4e2e5] flex justify-between items-center bg-[#fbf8fc]">
          <h3 className="text-lg font-bold text-[#031634]">Daftar Mahasiswa Terdaftar</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#031634] text-white text-xs font-bold uppercase tracking-wider">
                <th className="p-4 w-16 text-center">No</th>
                <th className="p-4 w-20 text-center">Foto</th>
                <th className="p-4">NIM</th>
                <th className="p-4">Nama Mahasiswa</th>
                <th className="p-4">Kelas / Jurusan</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm bg-white divide-y divide-[#f0f0f0]">
              {students.map((student, index) => (
                <tr key={student.id} className="hover:bg-[#fbf8fc] transition-colors group">
                  <td className="p-4 text-center font-bold text-[#75777e]">{index + 1}</td>
                  <td className="p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#f5f3f6] mx-auto overflow-hidden border group-hover:scale-110 transition-transform">
                      <img alt="Student" className="w-full h-full object-cover" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.nama)}&background=random`} />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-[#031634]">{student.nim}</td>
                  <td className="p-4 text-[#031634] font-semibold">{student.nama}</td>
                  <td className="p-4 text-[#44474e]">{student.kelas}</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-[#e6f4ea] text-[#28A745] px-2 py-0.5 rounded-full font-bold text-[10px] uppercase">AKTIF</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Dashboard