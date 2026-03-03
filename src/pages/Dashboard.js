import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, FileText, Loader2,
} from 'lucide-react';
import { db } from '../firebaseConfig'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

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

    // 1. Sinkronisasi Anggota (Koleksi: "anggota")
    // Menggunakan query & orderBy agar ESLint warning hilang dan data rapi
    const qAnggota = query(collection(db, "anggota"), orderBy("createdAt", "desc"));
    const unsubAnggota = onSnapshot(qAnggota, (snapshot) => {
      const dataFirebase = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const dataLocal = JSON.parse(localStorage.getItem('database_anggota_rw18') || '[]');
      
      const gabungAnggota = [...dataFirebase, ...dataLocal];
      const uniqueAnggota = Array.from(
        new Map(gabungAnggota.map(item => [item.nama?.toLowerCase(), item])).values()
      );

      setStatsData(prev => ({ ...prev, totalAnggota: uniqueAnggota.length }));
      setAnggotaTerakhir(uniqueAnggota.slice(0, 5));
      setIsLoading(false);
    }, (error) => {
      console.error("Error Anggota:", error);
      setIsLoading(false);
    });

    // 2. Sinkronisasi Laporan Kerja (Koleksi: "laporan_kerja")
    const unsubLaporan = onSnapshot(collection(db, "laporan_kerja"), (snapshot) => {
      const dataFirebase = snapshot.docs.map(doc => doc.data());
      const dataLocal = JSON.parse(localStorage.getItem('laporan_kerja_rw18') || '[]');
      const gabungLaporan = [...dataFirebase, ...dataLocal];
      
      setStatsData(prev => ({ 
        ...prev, 
        totalProgram: gabungLaporan.length,
        programSelesai: gabungLaporan.filter(p => Number(p.progress || p.progres) === 100).length
      }));
    });

    // 3. Sinkronisasi Notulensi (Koleksi: "notulensi")
    const unsubNotulensi = onSnapshot(collection(db, "notulensi"), (snapshot) => {
      const dataFirebase = snapshot.docs.map(doc => doc.data());
      const dataLocal = JSON.parse(localStorage.getItem('notulensi_rw18') || '[]');
      
      setStatsData(prev => ({ 
        ...prev, 
        totalNotulensi: dataFirebase.length + dataLocal.length 
      }));
    });

    // Cleanup saat ganti halaman
    return () => {
      unsubAnggota();
      unsubLaporan();
      unsubNotulensi();
    };
  }, []);

  const statsCards = [
    { 
      label: 'TOTAL ANGGOTA', 
      value: statsData.totalAnggota, 
      sub: 'Personel terdaftar', 
      icon: <Users size={20} />,
      color: 'bg-slate-900' 
    },
    { 
      label: 'PROGRES KERJA', 
      value: `${statsData.programSelesai}/${statsData.totalProgram}`, 
      sub: 'Program selesai', 
      icon: <CheckCircle2 size={20} />,
      color: 'bg-slate-900'
    },
    { 
      label: 'ARSIP ADMINISTRASI', 
      value: statsData.totalNotulensi, 
      sub: 'Dokumen tercatat', 
      icon: <FileText size={20} />,
      color: 'bg-slate-900'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 text-slate-900 pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pt-6 md:pt-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-200 pb-8 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">RINGKASAN DASBOR</h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">Sistem Informasi Sekretariat Karta RW 18</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isLoading && <Loader2 className="animate-spin text-slate-400" size={18} />}
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">LIVE MONITORING</span>
            </div>
          </div>
        </div>

        {/* --- CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statsCards.map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-900 transition-all shadow-sm group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-900 rounded-xl text-white group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">AKTIF</div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
              <h2 className="text-3xl font-black mt-1 text-slate-900">{card.value}</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-2">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* --- TABLE & ACTIVITY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">DIREKTORI ANGGOTA TERBARU</h3>
              <div className="h-[1px] flex-1 bg-slate-200" />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">NAMA PERSONEL</th>
                    <th className="px-6 py-4">KATEGORI</th>
                    <th className="px-6 py-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {anggotaTerakhir.length > 0 ? (
                    anggotaTerakhir.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-900 uppercase border border-slate-200">
                              {item.nama ? item.nama.charAt(0) : '?'}
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase">{item.nama}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-tighter">
                            {item.tipe || 'Anggota'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-[9px] font-black uppercase ${item.status === 'Aktif' ? 'text-emerald-600' : 'text-slate-300'}`}>
                            {item.status || 'Aktif'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-16 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">
                        Database Kosong
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-6 border-b border-slate-100 pb-4">LOG AKTIVITAS</h3>
            <div className="space-y-6">
              {[
                { title: 'Database Sync', desc: 'Realtime Firebase Connected.' },
                { title: 'Local Bridge', desc: 'LocalStorage Data Merged.' }
              ].map((log, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-white border-2 border-slate-900" />
                  <p className="text-[9px] font-black text-slate-400 uppercase">{log.title}</p>
                  <p className="text-[11px] font-bold text-slate-600 italic">"{log.desc}"</p>
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