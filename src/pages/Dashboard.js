import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CalendarDays,
  Inbox,
  Send
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
    const dbSurat = JSON.parse(localStorage.getItem('db_rekap_surat') || '[]');
    const dbAnggota = JSON.parse(localStorage.getItem('data_anggota') || '[]');
    const dbLaporan = JSON.parse(localStorage.getItem('db_laporan_kerja') || '[]');

    setStats({
      suratMasuk: dbSurat.filter(s => s.status?.toLowerCase() === 'masuk').length,
      suratKeluar: dbSurat.filter(s => s.status?.toLowerCase() === 'keluar').length,
      totalAnggota: dbAnggota.length,
      laporanPending: dbLaporan.filter(l => l.progress < 100).length
    });

    const sortedSurat = [...dbSurat].reverse().slice(0, 5);
    setRecentSurat(sortedSurat);
  }, []);

  // Fungsi helper untuk memastikan teks kapital semua
  const formatCaps = (text) => text ? text.toString().toUpperCase() : '';

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 md:space-y-8 transition-all duration-500 bg-[#fbfbfb]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-zinc-900">
            SEKRETARIAT CENTRAL
          </h1>
          <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
            PANEL KENDALI ADMINISTRASI KARANG TARUNA RW 18
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-black px-4 py-2 md:py-2.5 rounded-xl w-fit shadow-lg">
          <CalendarDays size={16} className="text-zinc-400" />
          <span className="text-[11px] md:text-xs font-bold text-white uppercase tracking-tight">
            {formatCaps(new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }))}
          </span>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <StatCard title="SURAT MASUK" value={stats.suratMasuk} icon={<Inbox />} subtitle="ARSIP MASUK" />
        <StatCard title="SURAT KELUAR" value={stats.suratKeluar} icon={<Send />} subtitle="ARSIP KELUAR" />
        <StatCard title="DATA ANGGOTA" value={stats.totalAnggota} icon={<Users />} subtitle="TOTAL PERSONEL" />
        <StatCard title="LAPORAN KERJA" value={stats.laporanPending} icon={<FileText />} subtitle="PROSES BERJALAN" isAlert={stats.laporanPending > 0} />
      </div>

      {/* LOG SURAT TERBARU */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden border border-zinc-100">
        <div className="p-6 md:p-8 border-b border-zinc-50 bg-white">
          <h3 className="font-black text-[11px] md:text-xs uppercase tracking-[0.2em] text-zinc-900">LOG SURAT TERBARU</h3>
          <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase mt-1">AKTIVITAS KORESPONDENSI</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-[9px] md:text-[10px] uppercase font-black text-zinc-400 border-b border-zinc-50">
                {/* Padding px-8 disamakan antara th dan td agar sejajar lurus */}
                <th className="px-8 py-5 tracking-widest">NO. SURAT</th>
                <th className="px-8 py-5 tracking-widest">PERIHAL</th>
                <th className="px-8 py-5 text-right tracking-widest">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {recentSurat.length > 0 ? recentSurat.map((surat, index) => (
                <tr key={index} className="hover:bg-zinc-50/30 transition-colors group">
                  <td className="px-8 py-6 text-[11px] font-bold text-zinc-400 group-hover:text-zinc-900">
                    {formatCaps(surat.noSurat) || 'N/A'}
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-zinc-900 text-xs md:text-sm tracking-tight">
                      {formatCaps(surat.perihal)}
                    </p>
                    <p className="text-[9px] text-zinc-400 font-bold mt-1 tracking-tighter">
                      {formatCaps(surat.tanggal)}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-[0.15em] ${
                      surat.status?.toLowerCase() === 'masuk' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {formatCaps(surat.status)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="py-20 text-center text-zinc-300 text-[10px] font-black uppercase tracking-[0.3em]">
                    BELUM ADA DATA SURAT TERCATAT
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-zinc-50/30 border-t border-zinc-50 text-center">
          <p className="text-[8px] md:text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">
            SYNC ENGINE V1.0 • RW 18 DIGITAL SYSTEM
          </p>
        </div>
      </div>

    </div>
  );
};

/* COMPONENT: STAT CARD */
const StatCard = ({ title, value, icon, subtitle, isAlert }) => (
  <div className="bg-white p-6 md:p-7 rounded-[1.5rem] md:rounded-[2.2rem] shadow-lg border border-zinc-50 hover:border-zinc-200 transition-all duration-300 flex flex-col justify-between min-h-[150px] md:min-h-[180px] group">
    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-500 
      ${isAlert ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-zinc-50 text-zinc-900 group-hover:bg-black group-hover:text-white'}`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="mt-4">
      <p className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-2xl md:text-3xl font-black text-zinc-900 leading-none tracking-tighter mb-1.5">{value}</h2>
      <p className="text-[8px] md:text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;