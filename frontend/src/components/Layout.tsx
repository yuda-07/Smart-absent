import React, { useState } from 'react'
import Side_Bar from './Side_Bar'
import { Outlet, useNavigate } from 'react-router-dom'

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#fbf8fc] overflow-x-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Side_Bar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300 flex flex-col min-h-screen">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden bg-[#031634] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-[#88b4fe] rounded-full flex items-center justify-center shadow-lg shadow-black/20">
              <span className="material-symbols-outlined text-[#034587] text-lg font-bold">fingerprint</span>
            </div>
            <span className="font-bold text-lg tracking-tight">SiAPEL</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
