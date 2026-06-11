import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashbord'
import DataAbsensi from './pages/Data_absesni'
import DaftarMahasiswa from './pages/Daftar_mahasiswa'
import LaporanStatistik from './pages/Laporan_statistik'
import Notifikasi from './pages/Notifikasi'
import Setting from './pages/Setting'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const token = localStorage.getItem('accessToken');

  return (
    <Router>
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
    </Router>
  )
}

export default App
