import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, FileText, Loader2, Activity
} from 'lucide-react';
import { db } from '../firebaseConfig'; 
import { collection, onSnapshot } from 'firebase/firestore';

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    totalAnggota: 0,
    totalProgram: 0,
    programSelesai: 0,
    totalNotulensi: 0
  });

  const [anggotaTerakhir, setAnggotaTerakhir] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const unsubAnggota = onSnapshot(collection(db, "anggota_rw18"), (snapshot) => {
      const dataFirebase = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const dataLocal = JSON.parse(localStorage.getItem('database_anggota_rw18') || '[]');
      const gabungAnggota = [...dataFirebase, ...dataLocal];
      const uniqueAnggota = Array.from(new Map(gabungAnggota.map(item => [item.nama, item])).values());
      setStatsData(prev => ({ ...prev, totalAnggota: uniqueAnggota.length }));
      setAnggotaTerakhir(uniqueAnggota.slice(-5).reverse());
    });

    const unsubLaporan = onSnapshot(collection(db, "laporan_kerja"), (snapshot) => {
      const dataFirebase = snapshot.docs.map(doc => doc.data());
      const dataLocal = JSON.parse(localStorage.getItem('laporan_kerja_rw18') || '[]');
      const gabungLaporan = [...dataFirebase, ...dataLocal];
      setStatsData(prev => ({ 
        ...prev, 
        totalProgram: gabungLaporan.length,
        programSelesai: gabungLaporan.filter(p => Number(p.progress) === 100).length
      }));
    });

    const unsubNotulensi = onSnapshot(collection(db, "notulensi"), (snapshot) => {
      const dataFirebase = snapshot.docs.map(doc => doc.data());
      const dataLocal = JSON.parse(localStorage.getItem('notulensi_rw18') || '[]');
      setStatsData(prev => ({ 
        ...prev, 
        totalNotulensi: dataFirebase.length + dataLocal.length 
      }));
      setIsLoading(false);
    });

    return () => {
      unsubAnggota();
      unsubLaporan();
      unsubNotulensi();
    };
  }, []);

  const statsCards = [
    { label: 'TOTAL ANGGOTA', value: statsData.totalAnggota, sub: 'Personel terdaftar', icon: <Users size={20} /> },
    { label: 'PROGRES KERJA', value: `${statsData.programSelesai}/${statsData.totalProgram}`, sub: 'Program selesai', icon: <CheckCircle2 size={20} /> },
    { label: 'ARSIP ADMINISTRASI', value: statsData.totalNotulensi, sub: 'Dokumen tercatat', icon: <FileText size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-10 font-sans">
      {/* Wrapper Utama */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pt-6 md:pt-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 border-b border-gray-100 pb-6 md:pb-8 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 uppercase">RINGKASAN DASBOR</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Sistem informasi sekretariat Karta RW 18</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {isLoading && <Loader2 className="animate-spin text-gray-300" size={18} />}
            <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm w-full md:w-auto justify-center md:justify-start">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">
                SISTEM ADMINISTRASI KARTA 18
              </span>
            </div>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          {statsCards.map((card, i) => (
            <div key={i} className="bg-white p-6 md:p-8 rounded-xl md:rounded-2xl border border-gray-100 hover:border-gray-300 transition-all shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 md:p-3 bg-gray-900 rounded-lg md:rounded-xl text-white">
                  {card.icon}
                </div>
                <Activity size={16} className="text-gray-100" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <h2 className="text-2xl md:text-3xl font-bold mt-1 text-gray-900">{card.value}</h2>
              <p className="text-[10px] md:text-[11px] text-gray-400 mt-2">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* TABLE SECTION */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-gray-900 shrink-0">
                DIREKTORI ANGGOTA TERBARU
              </h3>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>

            <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-4 md:px-6 py-3 md:py-4">NAMA PERSONEL</th>
                    <th className="px-4 md:px-6 py-3 md:py-4">BIDANG / DIVISI</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-right">ID REGISTRASI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {anggotaTerakhir.length > 0 ? (
                    anggotaTerakhir.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-gray-900 flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white uppercase shrink-0">
                              {item.nama ? item.nama.charAt(0) : '?'}
                            </div>
                            <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-black truncate max-w-[120px] md:max-w-none">
                              {item.nama}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className="text-[9px] md:text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 md:py-1 rounded uppercase">
                            {item.bidang || 'Umum'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                          <span className="text-[10px] md:text-[11px] font-mono text-gray-400 uppercase">
                            {item.id ? String(item.id).substring(0, 8) : 'REG-18'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Arsip data kosong</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="md:hidden text-center text-[9px] text-gray-400 mt-2 uppercase tracking-tighter">← Geser tabel untuk detail →</p>
          </div>

          {/* ACTIVITY SECTION */}
          <div className="flex flex-col">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-900 mb-6 md:mb-8 border-b border-gray-50 pb-4">
              LOG AKTIVITAS
            </h3>
            <div className="space-y-6 md:space-y-8">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="relative pl-6 border-l border-gray-100 group">
                  <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-gray-200 group-hover:bg-gray-900 transition-colors" />
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tight">Sistem otomatis</p>
                    <p className="text-xs md:text-[13px] text-gray-600 leading-snug">
                      Sinkronisasi basis data anggota dan laporan kerja telah diperbarui secara berkala.
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-gray-300">
                      <Activity size={10} /> 
                      <span className="uppercase tracking-tighter">SINKRONISASI SELESAI</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;