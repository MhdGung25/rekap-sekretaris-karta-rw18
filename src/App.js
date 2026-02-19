import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Import Halaman sesuai folder src/pages
import Dashboard from './pages/Dashboard';
import DataAnggota from './pages/DataAnggota';
import Laporan from './pages/Laporan';
import Notulensi from './pages/Notulensi';
import RekapSurat from './pages/RekapSurat';

function App() {
  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans antialiased">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-12 md:ml-[280px] pt-24 md:pt-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rekap-surat" element={<RekapSurat />} />
            <Route path="/data-anggota" element={<DataAnggota />} />
            <Route path="/notulensi" element={<Notulensi />} />
            <Route path="/laporan" element={<Laporan />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;