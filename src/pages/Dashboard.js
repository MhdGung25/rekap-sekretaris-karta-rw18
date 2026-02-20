import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CalendarDays,
  Inbox,
  Send,
  LayoutDashboard,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    totalAnggota: 0,
    laporanPending: 0
  });

  const [recentSurat, setRecentSurat] = useState([]);

  useEffect(() => {
    // Mengambil data dari localStorage (disesuaikan dengan key aplikasi kamu)
    const dbSurat = JSON.parse(localStorage.getItem('db_rekap_surat') || '[]');
    const dbAnggota = JSON.parse(localStorage.getItem('data_anggota') || '[]');
    const dbLaporan = JSON.parse(localStorage.getItem('laporan') || '[]'); // Mengikuti key dari halaman Laporan sebelumnya

    setStats({
      suratMasuk: dbSurat.filter(s => s.status?.toLowerCase() === 'masuk').length,
      suratKeluar: dbSurat.filter(s => s.status?.toLowerCase() === 'keluar').length,
      totalAnggota: dbAnggota.length,
      laporanPending: dbLaporan.filter(l => l.progress < 100).length
    });

    const sortedSurat = [...dbSurat].reverse().slice(0, 5);
    setRecentSurat(sortedSurat);
  }, []);

  // FUNGSI OTOMATIS: Mengubah "surat undangan" menjadi "Surat Undangan"
  const autoFormat = (text) => {
    if (!text) return '';
    const str = text.toString();
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 md:space-y-10 transition-all duration-500 bg-[#fbfbfb] text-zinc-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black text-white rounded-[20px] shadow-xl">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
              Sekretariat Central
            </h1>
            <p className="text-zinc-500 text-xs font-medium mt-1">
              Panel kendali administrasi Karang Taruna RW 18
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white border border-zinc-100 px-5 py-3 rounded-2xl shadow-sm">
          <CalendarDays size={18} className="text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-700">
            {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Surat Masuk" value={stats.suratMasuk} icon={<Inbox />} subtitle="Arsip masuk" />
        <StatCard title="Surat Keluar" value={stats.suratKeluar} icon={<Send />} subtitle="Arsip keluar" />
        <StatCard title="Data Anggota" value={stats.totalAnggota} icon={<Users />} subtitle="Total personel" />
        <StatCard title="Laporan Kerja" value={stats.laporanPending} icon={<FileText />} subtitle="Proses berjalan" isAlert={stats.laporanPending > 0} />
      </div>

      {/* LOG SURAT TERBARU */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-zinc-100">
        <div className="p-6 md:p-8 border-b border-zinc-50 bg-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-zinc-900 tracking-tight">Log Surat Terbaru</h3>
            <p className="text-xs text-zinc-400 font-medium mt-1 flex items-center gap-1">
              <Clock size={12} /> Aktivitas korespondensi terkini
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-[11px] uppercase tracking-wider font-bold text-zinc-400 border-b border-zinc-50">
                <th className="px-8 py-5">No. Surat</th>
                <th className="px-8 py-5">Perihal</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {recentSurat.length > 0 ? recentSurat.map((surat, index) => (
                <tr key={index} className="hover:bg-zinc-50/30 transition-colors group">
                  <td className="px-8 py-6 text-sm font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">
                    {surat.noSurat || 'N/A'}
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-zinc-900 text-sm md:text-base tracking-tight">
                      {autoFormat(surat.perihal)}
                    </p>
                    <p className="text-xs text-zinc-400 font-medium mt-1">
                      {surat.tanggal}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      surat.status?.toLowerCase() === 'masuk' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {autoFormat(surat.status)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox size={40} className="text-zinc-100" />
                      <p className="text-zinc-300 text-sm font-bold italic">Belum ada data surat tercatat</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-zinc-50/30 border-t border-zinc-50 text-center">
          <p className="text-[10px] font-bold text-zinc-300 tracking-[0.1em]">
            Sync Engine V1.0 • RW 18 Digital System
          </p>
        </div>
      </div>

    </div>
  );
};

/* COMPONENT: STAT CARD */
const StatCard = ({ title, value, icon, subtitle, isAlert }) => (
  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-zinc-50 hover:border-zinc-200 transition-all duration-300 flex flex-col justify-between min-h-[160px] md:min-h-[200px] group relative overflow-hidden">
    {/* Dekorasi halus di background card */}
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-zinc-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
    
    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10
      ${isAlert ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-zinc-900 text-white shadow-lg group-hover:bg-black'}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    
    <div className="mt-6 relative z-10">
      <p className="text-xs font-bold text-zinc-400 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 leading-none tracking-tighter">{value}</h2>
        {isAlert && <span className="w-2 h-2 bg-rose-500 rounded-full"></span>}
      </div>
      <p className="text-[10px] font-medium text-zinc-300 mt-2 uppercase tracking-widest">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;