import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy-loaded pages — each page is code-split into its own chunk
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashbord'))
const DataAbsensi = lazy(() => import('./pages/Data_absesni'))
const DaftarMahasiswa = lazy(() => import('./pages/Daftar_mahasiswa'))
const LaporanStatistik = lazy(() => import('./pages/Laporan_statistik'))
const Notifikasi = lazy(() => import('./pages/Notifikasi'))
const Setting = lazy(() => import('./pages/Setting'))

// Fallback while lazy-loaded pages are being fetched
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#031634]"></div>
  </div>
)

function App() {
  const token = localStorage.getItem('accessToken');

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Route: Login */}
          <Route 
            path="/login" 
            element={token ? <Navigate to="/" replace /> : <Login />} 
          />

          {/* Protected Routes: Wrap everything under Layout with ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="absensi" element={<DataAbsensi />} />
              <Route path="mahasiswa" element={<DaftarMahasiswa />} />
              <Route path="laporan" element={<LaporanStatistik />} />
              <Route path="notifikasi" element={<Notifikasi />} />
              <Route path="pengaturan" element={<Setting />} />
              <Route path="bantuan" element={<div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">Halaman Bantuan</div>} />
            </Route>
          </Route>

          {/* Catch all: redirect to home/login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
