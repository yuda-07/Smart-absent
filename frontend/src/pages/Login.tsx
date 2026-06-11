import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import api from '../utils/api'

const Login = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftSideRef = useRef<HTMLElement>(null);
  const rightSideRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
      
      tl.fromTo(leftSideRef.current, 
        { x: '-10%', opacity: 0 }, 
        { x: '0%', opacity: 1 }
      )
      .fromTo(rightSideRef.current, 
        { opacity: 0 }, 
        { opacity: 1 }, 
        "-=0.6"
      )
      .from(formRef.current?.children || [], {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
      }, "-=0.6");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/authentications', { email, password });
      const { accessToken, refreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen w-full flex flex-col md:flex-row bg-[#ffffff] font-sans"
    >
      {/* Branding Section (Left Side) - Full Height */}
      <section 
        ref={leftSideRef}
        className="w-full md:w-5/12 bg-[#031634] p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden min-h-[40vh] md:min-h-screen shrink-0"
      >
        {/* Decorative Accent Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2d5ea2] opacity-20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffddaf] opacity-10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-[#ffddaf] rounded-lg flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[#281800] text-3xl">school</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight">SiAPEL</span>
              <span className="text-[10px] uppercase tracking-widest text-[#ffddaf] font-semibold">Sistem Absensi</span>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Manajemen Kehadiran <br/><span className="text-[#ffddaf]">Lebih Efisien.</span>
          </h1>
          <p className="text-base lg:text-lg text-[#8293b7] max-w-[400px] leading-relaxed">
            Sistem informasi terpadu untuk pencatatan apel pagi mahasiswa menggunakan integrasi perangkat keras IoT.
          </p>
        </div>

        <div className="relative z-10 mt-12">
          <div className="p-4 border-l-4 border-[#ffddaf] bg-white/5 rounded-r-lg mb-8 max-w-[400px]">
            <p className="text-sm text-[#8293b7] italic leading-relaxed">
              "Integritas dan kedisiplinan adalah pilar utama keunggulan akademik."
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black/20 flex items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-white text-sm">verified</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Direktorat Kemahasiswaan</span>
              <span className="text-xs text-[#8293b7]">Tahun Akademik 2023/2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section (Right Side) - Full Height */}
      <section 
        ref={rightSideRef}
        className="w-full md:w-7/12 flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-24 relative"
      >
        <div className="w-full max-w-[420px]">
          <header className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-[#031634] mb-3">Otentikasi Admin</h2>
            <p className="text-base text-[#44474e]">
              Silakan masukkan kredensial Anda untuk mengakses dashboard manajemen.
            </p>
          </header>

          <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-sm font-medium flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1b1b1e] flex items-center gap-2" htmlFor="email">
                <span className="material-symbols-outlined text-lg text-[#2d5ea2]">mail</span>
                Email Administrator
              </label>
              <div className="relative group">
                <input 
                  className="w-full px-5 py-3.5 rounded-lg border-2 border-[#e4e2e5] focus:border-[#2d5ea2] focus:ring-4 focus:ring-[#2d5ea2]/10 outline-none transition-all text-base text-[#1b1b1e] placeholder:text-[#75777e] bg-[#fbf8fc] hover:bg-white" 
                  id="email" 
                  name="email" 
                  placeholder="admin@univ.edu" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[#1b1b1e] flex items-center gap-2" htmlFor="password">
                  <span className="material-symbols-outlined text-lg text-[#2d5ea2]">lock</span>
                  Password
                </label>
                <a className="text-sm font-semibold text-[#2d5ea2] hover:text-[#031634] transition-colors" href="#">
                  Lupa Password?
                </a>
              </div>
              <div className="relative">
                <input 
                  className="w-full px-5 py-3.5 rounded-lg border-2 border-[#e4e2e5] focus:border-[#2d5ea2] focus:ring-4 focus:ring-[#2d5ea2]/10 outline-none transition-all text-base text-[#1b1b1e] placeholder:text-[#75777e] bg-[#fbf8fc] hover:bg-white" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button 
                className={`w-full bg-[#031634] py-4 px-6 rounded-lg text-white text-base font-bold flex items-center justify-center gap-3 hover:bg-[#2d5ea2] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
                <span className="material-symbols-outlined">
                  {isLoading ? 'sync' : 'login'}
                </span>
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-[#f5f3f6] p-4 rounded-lg border border-[#e4e2e5] flex gap-3 items-start mt-8">
              <span className="material-symbols-outlined text-[#2d5ea2] text-xl shrink-0">security</span>
              <p className="text-xs text-[#44474e] leading-relaxed">
                Platform ini menggunakan enkripsi end-to-end. Seluruh aktivitas terekam dalam sistem log keamanan universitas.
              </p>
            </div>
          </form>

          {/* Footer */}
          <footer className="mt-16 text-center md:text-left">
            <p className="text-xs text-[#75777e]">
              © 2023 SiAPEL University Management System. <br className="md:hidden"/>Hak Cipta Dilindungi.
            </p>
          </footer>
        </div>
      </section>
    </div>
  )
}

export default Login
