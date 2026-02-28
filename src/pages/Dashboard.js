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

    // 1. SYNC DATA ANGGOTA (Firebase + Local)
    const unsubAnggota = onSnapshot(collection(db, "anggota_rw18"), (snapshot) => {
      const dataFirebase = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const dataLocal = JSON.parse(localStorage.getItem('database_anggota_rw18') || '[]');
      const gabungAnggota = [...dataFirebase, ...dataLocal];
      const uniqueAnggota = Array.from(new Map(gabungAnggota.map(item => [item.nama, item])).values());

      setStatsData(prev => ({ ...prev, totalAnggota: uniqueAnggota.length }));
      setAnggotaTerakhir(uniqueAnggota.slice(-5).reverse());
    });

    // 2. SYNC LAPORAN KERJA
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

    // 3. SYNC NOTULENSI
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
    { label: 'Total Anggota', value: statsData.totalAnggota, sub: 'Personel', icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Progres Kerja', value: `${statsData.programSelesai}/${statsData.totalProgram}`, sub: 'Selesai', icon: <CheckCircle2 size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Arsip Surat', value: statsData.totalNotulensi, sub: 'Dokumen', icon: <FileText size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 text-zinc-900 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER - Ukuran Lebih Standar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              RINGKASAN SISTEM
            </h1>
            <p className="text-gray-500 text-xs md:text-sm font-medium">Monitoring Administrasi Karta RW 18</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Cloud Connected</span>
          </div>
        </div>

        {/* STATS GRID - Padding & Font diperkecil */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {statsCards.map((card, i) => (
            <div key={i} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:border-blue-200 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                  {card.icon}
                </div>
                <Activity size={14} className="text-gray-300" />
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">{card.label}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <h2 className="text-2xl font-bold text-gray-900">{card.value}</h2>
                <span className="text-[9px] text-gray-400 font-semibold uppercase">{card.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE SECTION - Desain Lebih Ringkas */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">Aktivitas Anggota Terbaru</h3>
            </div>
            {isLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[9px] font-bold uppercase tracking-widest bg-white border-b border-gray-50">
                  <th className="px-5 py-3">Nama Anggota</th>
                  <th className="px-5 py-3">Bidang</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {anggotaTerakhir.length > 0 ? (
                  anggotaTerakhir.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-200">
                            {item.nama ? item.nama.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{item.nama}</p>
                            <p className="text-[9px] text-gray-400 font-mono">
                              ID: {item.id && typeof item.id === 'string' ? item.id.substring(0, 6) : 'LCL-01'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded text-center">
                          {item.bidang || 'Umum'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-[9px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm uppercase">
                          {item.jabatan || 'Anggota'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-5 py-12 text-center text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em]">
                      Data Tidak Ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;