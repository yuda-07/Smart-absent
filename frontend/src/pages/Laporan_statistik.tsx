import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, memo } from 'react'
import api from '../utils/api'
import { gsap } from 'gsap'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

type PeriodType = 'hari' | 'bulan' | 'semester';

interface JurusanOption { id: number; kode: string; nama: string; }
interface ProdiOption { id: number; jurusan_id: number; jenjang: string; nama: string; }
interface ChartResult { chart: any[]; summary: { hadir: number; terlambat: number; alpa: number; izin: number }; fromCache: boolean; }

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const PERIOD_TYPES: PeriodType[] = ['hari', 'bulan', 'semester'];

// Memoized chart components to prevent unnecessary re-renders
const MemoAreaChart = memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#1e8e3e" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#1e8e3e" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#75777e' }} />
      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#75777e' }} />
      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
      <Legend />
      <Area type="monotone" dataKey="Hadir" stroke="#1e8e3e" strokeWidth={3} fillOpacity={1} fill="url(#colorHadir)" animationDuration={400} />
      <Area type="monotone" dataKey="Terlambat" stroke="#f29900" strokeWidth={2} fillOpacity={0} animationDuration={400} />
      <Area type="monotone" dataKey="Alpa" stroke="#d93025" strokeWidth={2} fillOpacity={0} animationDuration={400} />
      <Area type="monotone" dataKey="Izin" stroke="#1a73e8" strokeWidth={2} fillOpacity={0} animationDuration={400} />
    </AreaChart>
  </ResponsiveContainer>
));

const MemoBarChart = memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#75777e' }} />
      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#75777e' }} />
      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
      <Legend />
      <Bar dataKey="Hadir" fill="#1e8e3e" radius={[4, 4, 0, 0]} animationDuration={400} />
      <Bar dataKey="Terlambat" fill="#f29900" radius={[4, 4, 0, 0]} animationDuration={400} />
      <Bar dataKey="Alpa" fill="#d93025" radius={[4, 4, 0, 0]} animationDuration={400} />
      <Bar dataKey="Izin" fill="#1a73e8" radius={[4, 4, 0, 0]} animationDuration={400} />
    </BarChart>
  </ResponsiveContainer>
));

// Memoized summary card component
interface StatCardProps { label: string; val: number; color: string; icon: string; total: number; }
const StatCard = memo(({ label, val, color, icon, total }: StatCardProps) => {
  const percent = total > 0 ? Math.round((val / total) * 100) + '%' : '0%';
  return (
    <div className="stat-card bg-white p-6 rounded-2xl border border-[#e4e2e5] shadow-sm relative overflow-hidden group transition-opacity duration-200">
      <span className="text-xs font-bold text-[#44474e] uppercase tracking-wider mb-2 block">{label}</span>
      <div className="flex items-end gap-2">
        <h2 className="text-4xl font-bold text-[#031634] tabular-nums transition-all duration-200">{val}</h2>
        <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-opacity-10 transition-all duration-200" style={{ color, backgroundColor: `${color}20` }}>{percent}</span>
      </div>
      <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl opacity-[0.05] group-hover:scale-110 transition-transform duration-500" style={{ color }}>{icon}</span>
    </div>
  );
});

// Memoized period tab button
interface PeriodTabProps { label: string; icon: string; active: boolean; onClick: () => void; }
const PeriodTab = memo(({ label, icon, active, onClick }: PeriodTabProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all duration-150 border border-b-0 ${
      active
        ? 'bg-[#031634] text-white border-[#031634] shadow-sm'
        : 'bg-[#f5f3f6] text-[#44474e] border-[#e4e2e5] hover:bg-[#e8f0fe] hover:text-[#2d5ea2]'
    }`}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
    {label}
  </button>
));

const LaporanStatistik = () => {
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1 + '');
  const [filterTahun, setFilterTahun] = useState('2026');
  const [initialLoad, setInitialLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Period Type
  const [periodType, setPeriodType] = useState<PeriodType>('hari');

  // === Dependent Filter States ===
  const [jurusanList, setJurusanList] = useState<JurusanOption[]>([]);
  const [prodiList, setProdiList] = useState<ProdiOption[]>([]);
  const [angkatanList, setAngkatanList] = useState<number[]>([]);
  const [kelasList, setKelasList] = useState<string[]>([]);

  const [selectedJurusanId, setSelectedJurusanId] = useState<number | null>(null);
  const [selectedProdiId, setSelectedProdiId] = useState<number | null>(null);
  const [selectedAngkatan, setSelectedAngkatan] = useState<number | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null);

  // Data state - persists across tab switches
  const [summaryStats, setSummaryStats] = useState({ hadir: 0, terlambat: 0, alpa: 0, izin: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, ChartResult>>(new Map());
  const hasAnimatedRef = useRef(false);
  const prefetchDoneRef = useRef(false);

  // Build filter params (memoized)
  const filterParams = useMemo(() => {
    const params: Record<string, any> = { month: filterBulan, year: filterTahun, apel_only: true };
    if (selectedJurusanId) {
      const j = jurusanList.find(jr => jr.id === selectedJurusanId);
      if (j) params.jurusan = j.nama;
    }
    if (selectedProdiId) params.prodi_id = selectedProdiId;
    if (selectedAngkatan) params.angkatan = selectedAngkatan;
    if (selectedKelas) params.kelas = selectedKelas;
    return params;
  }, [filterBulan, filterTahun, selectedJurusanId, selectedProdiId, selectedAngkatan, selectedKelas, jurusanList]);

  // Cache key
  const cacheKey = useMemo(() => {
    const sorted = Object.keys(filterParams).sort().map(k => `${k}=${filterParams[k]}`).join('&');
    return `${periodType}|${sorted}`;
  }, [periodType, filterParams]);

  // Process raw API data for a given period type
  const processRawData = useCallback((rawData: any[], type: PeriodType) => {
    const grouped: Record<string, any> = {};

    rawData.forEach((item: any) => {
      let label: string;
      if (type === 'hari') {
        label = new Date(item.tanggal).toLocaleDateString('id-ID', {
          weekday: 'short', day: 'numeric', month: 'short'
        });
      } else if (type === 'bulan') {
        label = MONTH_NAMES[parseInt(item.bulan) - 1] || `Bulan ${item.bulan}`;
      } else {
        label = `Semester ${item.semester} ${item.tahun}`;
      }

      if (!grouped[label]) grouped[label] = { name: label, Hadir: 0, Terlambat: 0, Alpa: 0, Izin: 0 };
      const status = item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase();
      grouped[label][status] = parseInt(item.count);
    });

    const processed = Object.values(grouped);
    const summary = { hadir: 0, terlambat: 0, alpa: 0, izin: 0 };
    processed.forEach((item: any) => {
      summary.hadir += item.Hadir || 0;
      summary.terlambat += item.Terlambat || 0;
      summary.alpa += item.Alpa || 0;
      summary.izin += item.Izin || 0;
    });

    return { chart: processed, summary, fromCache: false } as ChartResult;
  }, []);

  // Fetch a single period's data
  const fetchPeriod = useCallback(async (type: PeriodType, params: Record<string, any>, signal?: AbortSignal): Promise<ChartResult> => {
    const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
    const key = `${type}|${sorted}`;

    // Check cache
    const cached = cacheRef.current.get(key);
    if (cached) return { ...cached, fromCache: true };

    const endpoint = `/statistik/${type}`;
    const response = await api.get(endpoint, { params, signal });
    const result = processRawData(response.data.data.stats, type);

    // Store in cache
    cacheRef.current.set(key, result);
    return result;
  }, [processRawData]);

  // === Fetch jurusan list on mount ===
  useEffect(() => {
    api.get('/jurusan').then(res => setJurusanList(res.data.data.jurusans)).catch(console.error);
  }, []);

  // === Prefetch all 3 periods on first load ===
  useEffect(() => {
    if (initialLoad && jurusanList.length > 0 && !prefetchDoneRef.current) {
      prefetchDoneRef.current = true;
      const controller = new AbortController();
      const baseParams = { month: filterBulan, year: filterTahun, apel_only: true };

      Promise.all(
        PERIOD_TYPES.map(type => fetchPeriod(type, baseParams, controller.signal).catch(() => null))
      ).then(results => {
        // Apply the 'hari' result as initial display
        const hariResult = results[0];
        if (hariResult) {
          setChartData(hariResult.chart);
          setSummaryStats(hariResult.summary);
        }
      }).finally(() => {
        setInitialLoad(false);
      });

      return () => controller.abort();
    }
  }, [initialLoad, jurusanList, filterBulan, filterTahun, fetchPeriod]);

  // === When jurusan changes → fetch prodi ===
  useEffect(() => {
    if (selectedJurusanId) {
      api.get(`/prodi/jurusan/${selectedJurusanId}`)
        .then(res => setProdiList(res.data.data.prodis))
        .catch(() => setProdiList([]));
    } else {
      setProdiList([]);
    }
    setSelectedProdiId(null);
    setSelectedAngkatan(null);
    setSelectedKelas(null);
    setAngkatanList([]);
    setKelasList([]);
  }, [selectedJurusanId]);

  // === When prodi changes → fetch angkatan ===
  useEffect(() => {
    if (selectedProdiId) {
      api.get('/statistik/filter-options', { params: { prodi_id: selectedProdiId } })
        .then(res => setAngkatanList(res.data.data.angkatans))
        .catch(() => setAngkatanList([]));
    } else {
      setAngkatanList([]);
    }
    setSelectedAngkatan(null);
    setSelectedKelas(null);
    setKelasList([]);
  }, [selectedProdiId]);

  // === When angkatan changes → fetch kelas ===
  useEffect(() => {
    if (selectedAngkatan && selectedProdiId) {
      api.get('/statistik/filter-options', { params: { prodi_id: selectedProdiId, angkatan: selectedAngkatan } })
        .then(res => setKelasList(res.data.data.kelases))
        .catch(() => setKelasList([]));
    } else {
      setKelasList([]);
    }
    setSelectedKelas(null);
  }, [selectedAngkatan, selectedProdiId]);

  // === Main chart data fetch with prefetch + abort ===
  useEffect(() => {
    if (initialLoad) return; // Handled by prefetch

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setChartData(cached.chart);
      setSummaryStats(cached.summary);
      setIsFetching(false);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsFetching(true);

    // Prefetch other periods in background while fetching current
    const currentType = periodType;
    const otherTypes = PERIOD_TYPES.filter(t => t !== currentType);

    const mainFetch = fetchPeriod(currentType, filterParams, controller.signal);
    const prefetches = otherTypes.map(t => fetchPeriod(t, filterParams, controller.signal).catch(() => null));

    mainFetch
      .then(result => {
        setChartData(result.chart);
        setSummaryStats(result.summary);
      })
      .catch((err: any) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch chart data', err);
        setChartData([]);
        setSummaryStats({ hadir: 0, terlambat: 0, alpa: 0, izin: 0 });
      })
      .finally(() => setIsFetching(false));

    return () => controller.abort();
  }, [cacheKey, initialLoad]); // Only re-run when cache key changes

  // GSAP entrance animation - only once
  useLayoutEffect(() => {
    if (!initialLoad && !hasAnimatedRef.current && containerRef.current) {
      hasAnimatedRef.current = true;
      const ctx = gsap.context(() => {
        gsap.set(".stat-card, .chart-box", { opacity: 0, y: 20 });
        gsap.to(".stat-card", { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" });
        gsap.to(".chart-box", { opacity: 1, y: 0, duration: 0.5, delay: 0.2, stagger: 0.1, ease: "power2.out" });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [initialLoad]);

  const periodOptions = useMemo(() => [
    { label: 'Per Hari', value: 'hari' as PeriodType, icon: 'calendar_today' },
    { label: 'Per Bulan', value: 'bulan' as PeriodType, icon: 'calendar_month' },
    { label: 'Per Semester', value: 'semester' as PeriodType, icon: 'school' },
  ], []);

  const resetFilters = () => {
    setSelectedJurusanId(null);
    setSelectedProdiId(null);
    setSelectedAngkatan(null);
    setSelectedKelas(null);
    setProdiList([]);
    setAngkatanList([]);
    setKelasList([]);
  };

  const hasActiveFilter = selectedJurusanId !== null || selectedProdiId !== null || selectedAngkatan !== null || selectedKelas !== null;
  const getSelectedJurusanName = () => jurusanList.find(j => j.id === selectedJurusanId)?.nama || '';
  const getSelectedProdiName = () => {
    const p = prodiList.find(p => p.id === selectedProdiId);
    return p ? `${p.jenjang} ${p.nama}` : '';
  };

  const total = summaryStats.hadir + summaryStats.terlambat + summaryStats.alpa + summaryStats.izin;
  const getPercent = (val: number) => total > 0 ? Math.round((val / total) * 100) + '%' : '0%';

  if (initialLoad) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#031634]"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e4e2e5] pb-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#031634]">Statistik Kehadiran Apel</h1>
          <p className="text-sm lg:text-base text-[#44474e] mt-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            Hanya menampilkan Angkatan 2024 & 2025 (peserta apel aktif)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="border border-[#c5c6cf] text-[#031634] px-4 py-2.5 rounded-lg text-sm font-bold bg-white outline-none focus:border-[#2d5ea2]">
            {[...Array(12)].map((_, i) => (<option key={i+1} value={i+1}>{MONTH_NAMES[i]}</option>))}
          </select>
          <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="border border-[#c5c6cf] text-[#031634] px-4 py-2.5 rounded-lg text-sm font-bold bg-white outline-none focus:border-[#2d5ea2]">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <button onClick={window.print} className="bg-[#031634] text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-[#2d5ea2] transition-all">
            <span className="material-symbols-outlined">download</span> Cetak
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Hadir" val={summaryStats.hadir} color="#1e8e3e" icon="check_circle" total={total} />
        <StatCard label="Terlambat" val={summaryStats.terlambat} color="#f29900" icon="schedule" total={total} />
        <StatCard label="Total Alpa" val={summaryStats.alpa} color="#d93025" icon="cancel" total={total} />
        <StatCard label="Izin / Sakit" val={summaryStats.izin} color="#1a73e8" icon="healing" total={total} />
      </div>

      {/* ====== UNIFIED SECTION: Filter + Chart ====== */}
      <div className="chart-box bg-white border border-[#e4e2e5] rounded-2xl shadow-sm flex flex-col">

        {/* Period Tabs */}
        <div className="flex items-center gap-2 px-6 pt-6 pb-0 flex-wrap">
          {periodOptions.map(opt => (
            <PeriodTab
              key={opt.value}
              label={opt.label}
              icon={opt.icon}
              active={periodType === opt.value}
              onClick={() => setPeriodType(opt.value)}
            />
          ))}
          <div className="ml-auto flex items-center gap-2">
            {isFetching && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#2d5ea2]">
                <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                <span className="animate-pulse">Memuat...</span>
              </span>
            )}
            {hasActiveFilter && (
              <button onClick={resetFilters} className="flex items-center gap-1 text-xs font-bold text-[#d93025] hover:text-[#a5271f] transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Dependent Filters Row */}
        <div className="px-6 pt-4 pb-4 border-b border-[#e4e2e5]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">school</span> Jurusan
              </label>
              <select value={selectedJurusanId ?? ''} onChange={(e) => setSelectedJurusanId(e.target.value ? Number(e.target.value) : null)}
                className="border border-[#c5c6cf] text-[#031634] px-3 py-2 rounded-lg text-sm bg-white outline-none focus:border-[#2d5ea2] transition-colors">
                <option value="">Semua Jurusan</option>
                {jurusanList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">menu_book</span> Program Studi
              </label>
              <select value={selectedProdiId ?? ''} onChange={(e) => setSelectedProdiId(e.target.value ? Number(e.target.value) : null)} disabled={!selectedJurusanId}
                className="border border-[#c5c6cf] text-[#031634] px-3 py-2 rounded-lg text-sm bg-white outline-none focus:border-[#2d5ea2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <option value="">{selectedJurusanId ? 'Semua Prodi' : 'Pilih Jurusan dulu'}</option>
                {prodiList.map(p => <option key={p.id} value={p.id}>{p.jenjang} {p.nama}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">date_range</span> Angkatan
              </label>
              <select value={selectedAngkatan ?? ''} onChange={(e) => setSelectedAngkatan(e.target.value ? Number(e.target.value) : null)} disabled={!selectedProdiId}
                className="border border-[#c5c6cf] text-[#031634] px-3 py-2 rounded-lg text-sm bg-white outline-none focus:border-[#2d5ea2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <option value="">{selectedProdiId ? 'Semua Angkatan' : 'Pilih Prodi dulu'}</option>
                {angkatanList.map(a => <option key={a} value={a}>Angkatan {a}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-[#44474e] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">groups</span> Kelas
              </label>
              <select value={selectedKelas ?? ''} onChange={(e) => setSelectedKelas(e.target.value || null)} disabled={!selectedAngkatan}
                className="border border-[#c5c6cf] text-[#031634] px-3 py-2 rounded-lg text-sm bg-white outline-none focus:border-[#2d5ea2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <option value="">{selectedAngkatan ? 'Semua Kelas' : 'Pilih Angkatan dulu'}</option>
                {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {hasActiveFilter && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedJurusanId && (
                <span className="inline-flex items-center gap-1 bg-[#e8f0fe] text-[#2d5ea2] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">school</span>{getSelectedJurusanName()}
                  <button onClick={() => setSelectedJurusanId(null)} className="ml-0.5 hover:text-[#d93025]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
              )}
              {selectedProdiId && (
                <span className="inline-flex items-center gap-1 bg-[#e8f0fe] text-[#2d5ea2] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">menu_book</span>{getSelectedProdiName()}
                  <button onClick={() => setSelectedProdiId(null)} className="ml-0.5 hover:text-[#d93025]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
              )}
              {selectedAngkatan && (
                <span className="inline-flex items-center gap-1 bg-[#e8f0fe] text-[#2d5ea2] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">date_range</span>Angkatan {selectedAngkatan}
                  <button onClick={() => setSelectedAngkatan(null)} className="ml-0.5 hover:text-[#d93025]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
              )}
              {selectedKelas && (
                <span className="inline-flex items-center gap-1 bg-[#e8f0fe] text-[#2d5ea2] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">groups</span>{selectedKelas}
                  <button onClick={() => setSelectedKelas(null)} className="ml-0.5 hover:text-[#d93025]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chart Area - Chart always rendered, skeleton overlays on top */}
        <div className="p-6 relative" ref={chartAreaRef}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-bold text-[#031634]">
              {periodOptions.find(o => o.value === periodType)?.label}
            </h3>
            {periodType === 'hari' && (
              <span className="text-[11px] font-bold text-[#f29900] bg-[#f29900]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">event</span> Senin (Apel)
              </span>
            )}
            <span className="text-[11px] font-bold text-[#44474e] bg-[#f5f3f6] px-2 py-0.5 rounded-full tabular-nums">{total} data</span>
          </div>

          {/* Chart always mounted - data updates in place */}
          <div className={`h-80 w-full transition-opacity duration-150 ${isFetching ? 'opacity-30' : 'opacity-100'}`}>
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#75777e]">
                <span className="material-symbols-outlined text-6xl mb-3 opacity-20">bar_chart</span>
                <p className="text-sm font-medium">Belum ada data untuk periode dan filter yang dipilih.</p>
              </div>
            ) : periodType === 'hari' ? (
              <MemoAreaChart data={chartData} />
            ) : (
              <MemoBarChart data={chartData} />
            )}
          </div>

          {/* Skeleton overlay - appears on top of chart during fetch */}
          {isFetching && (
            <div className="absolute inset-0 p-6 pointer-events-none flex items-end justify-center gap-3 pb-16">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-12 bg-gradient-to-t from-[#e4e2e5] to-transparent rounded-t animate-pulse" style={{ height: `${30 + i * 10}%`, animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LaporanStatistik
