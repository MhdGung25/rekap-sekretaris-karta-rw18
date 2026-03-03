import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, Calendar, Search, 
  AlertCircle, ArrowRight, X, LayoutDashboard, 
  CheckCircle2, Timer, PieChart, Loader2, Bell
} from 'lucide-react';
import { db } from '../firebaseConfig'; 
import { 
  collection, addDoc, onSnapshot, 
  query, deleteDoc, doc, orderBy 
} from 'firebase/firestore';

const Laporan = () => {
  const [dataLaporan, setDataLaporan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    judul: "",
    tgl: new Date().toISOString().split('T')[0],
    progress: 0,
    deskripsi: "",
    kategori: "Program"
  });

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "laporan_kerja"), orderBy("tgl", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDataLaporan(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.judul) return alert("Judul harus diisi!");

    try {
      await addDoc(collection(db, "laporan_kerja"), {
        ...formData,
        progress: Number(formData.progress),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString() 
      });
      
      setShowModal(false);
      setFormData({ 
        judul: "", 
        tgl: new Date().toISOString().split('T')[0], 
        progress: 0, 
        deskripsi: "", 
        kategori: "Program" 
      });
      showToast("Laporan berhasil ditambahkan");
    } catch (error) {
      showToast("Gagal menyimpan data");
    }
  };

  const deleteLaporan = async (id) => {
    if (window.confirm("Hapus laporan ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, "laporan_kerja", id));
        showToast("Laporan telah dihapus");
      } catch (error) {
        showToast("Gagal menghapus data");
      }
    }
  };

  const filteredData = dataLaporan.filter(l => {
    const judul = l.judul || "";
    const matchSearch = judul.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "Selesai") return matchSearch && Number(l.progress) === 100;
    if (filterStatus === "Progres") return matchSearch && Number(l.progress) > 0 && Number(l.progress) < 100;
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-16 font-sans">
      
      {/* --- TOAST NOTIFICATION --- */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-2">
          <div className="bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-3 border border-white/10">
            <Bell size={12} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{notification}</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
              <LayoutDashboard size={24} className="text-slate-900" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block">Monitoring</span>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">LAPORAN KERJA</h1>
            </div>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <Plus size={14} strokeWidth={3} /> BUAT LAPORAN
          </button>
        </div>

        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'TOTAL', val: dataLaporan.length, icon: <FileText size={14}/>, color: 'text-slate-900', bg: 'bg-white' },
            { label: 'PROGRES', val: dataLaporan.filter(l => Number(l.progress) > 0 && Number(l.progress) < 100).length, icon: <Timer size={14}/>, color: 'text-blue-600', bg: 'bg-white' },
            { label: 'SELESAI', val: dataLaporan.filter(l => Number(l.progress) === 100).length, icon: <CheckCircle2 size={14}/>, color: 'text-white', bg: 'bg-slate-900' },
            { label: 'EFEKTIVITAS', val: (dataLaporan.length ? Math.round((dataLaporan.filter(l => Number(l.progress) === 100).length / dataLaporan.length) * 100) : 0) + '%', icon: <PieChart size={14}/>, color: 'text-emerald-600', bg: 'bg-white' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col`}>
              <div className={`w-7 h-7 rounded-lg ${stat.bg === 'bg-slate-900' ? 'bg-white/10' : 'bg-slate-50'} flex items-center justify-center ${stat.color} mb-3`}>
                {stat.icon}
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
              <h4 className={`text-lg font-black ${stat.bg === 'bg-slate-900' ? 'text-white' : 'text-slate-900'}`}>{stat.val}</h4>
            </div>
          ))}
        </div>

        {/* --- TOOLBAR --- */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900" size={16} />
            <input 
              type="text" 
              placeholder="Cari judul laporan..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {['Semua', 'Progres', 'Selesai'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-6 py-2 rounded-lg text-[9px] font-black transition-all tracking-widest uppercase ${
                  filterStatus === s ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* --- CARDS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-slate-200 mb-3" size={28} />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sinkronisasi data...</p>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((l) => (
              <div key={l.id} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-md transition-all flex flex-col relative group">
                <div className="absolute top-4 right-4">
                   <div className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${Number(l.progress) === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {l.kategori || 'PROGRAM'}
                   </div>
                </div>

                <div className="mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors mb-4">
                    <FileText size={18} />
                  </div>
                  <h3 className="font-black text-base text-slate-900 tracking-tight leading-tight mb-1 truncate">
                    {l.judul}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold tracking-wider">
                    <Calendar size={10} className="text-blue-500" />
                    {l.tgl}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Progres</span>
                    <span className={`text-xs font-black ${Number(l.progress) === 100 ? 'text-emerald-500' : 'text-slate-900'}`}>{l.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${Number(l.progress) === 100 ? 'bg-emerald-500' : 'bg-slate-900'}`}
                      style={{ width: `${l.progress}%` }}
                    ></div>
                  </div>
                </div>

                <button onClick={() => deleteLaporan(l.id)} className="absolute bottom-16 right-6 opacity-0 group-hover:opacity-100 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    <Trash2 size={12} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white border border-slate-200 border-dashed rounded-2xl">
               <AlertCircle size={32} className="mx-auto text-slate-100 mb-4" />
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Data tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL INPUT --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LAPORAN KERJA</h3>
                <p className="text-lg font-black text-slate-900 uppercase tracking-tighter">ENTRY DATA</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">JUDUL KEGIATAN</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:border-slate-900 focus:bg-white rounded-xl outline-none text-[11px] font-bold transition-all shadow-sm"
                  placeholder="Masukkan judul kegiatan..."
                  value={formData.judul} 
                  onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">KATEGORI</label>
                  <select 
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:border-slate-900 rounded-xl outline-none text-[10px] font-black uppercase cursor-pointer"
                    value={formData.kategori}
                    onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  >
                    <option value="Program">PROGRAM</option>
                    <option value="Rutin">RUTIN</option>
                    <option value="Urgent">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">TANGGAL</label>
                  <input 
                    type="date" 
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 focus:border-slate-900 rounded-xl outline-none text-[10px] font-bold"
                    value={formData.tgl}
                    onChange={(e) => setFormData({...formData, tgl: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-5 bg-slate-900 rounded-xl text-white">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">PROGRES CAPAIAN</label>
                  <span className="text-xl font-black text-blue-400">{formData.progress}%</span>
                </div>
                <input 
                  type="range" min="0" max="100"
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-400"
                  value={formData.progress} 
                  onChange={(e) => setFormData({...formData, progress: e.target.value})} 
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                SIMPAN LAPORAN <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;