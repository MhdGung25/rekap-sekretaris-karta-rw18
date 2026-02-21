import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, LayoutGrid, 
  Calendar, Target, Search, AlertCircle 
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
  
  const [formData, setFormData] = useState({
    judul: "",
    tgl: new Date().toISOString().split('T')[0],
    progress: 0,
    deskripsi: "",
    kategori: "Program"
  });

  // Mencegah Zoom Otomatis di Mobile via Meta Tag JS
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
    document.getElementsByTagName('head')[0].appendChild(meta);
  }, []);

  useEffect(() => {
    // Pastikan nama koleksi konsisten dengan Dashboard (laporan_kerja)
    const q = query(collection(db, "laporan_kerja"), orderBy("tgl", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDataLaporan(data);
    });
    return () => unsubscribe();
  }, []);

  const fixTextFormat = (str) => {
    if (!str) return "";
    return str
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "laporan_kerja"), {
        ...formData,
        judul: fixTextFormat(formData.judul),
        createdAt: new Date().toISOString()
      });
      
      setShowModal(false);
      setFormData({ 
        judul: "", 
        tgl: new Date().toISOString().split('T')[0], 
        progress: 0, 
        deskripsi: "",
        kategori: "Program"
      });
    } catch (error) {
      console.error("Gagal simpan:", error);
      alert("Terjadi kesalahan koneksi database.");
    }
  };

  const deleteLaporan = async (id) => {
    if (window.confirm("Hapus laporan ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, "laporan_kerja", id));
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const filteredData = dataLaporan.filter(l => {
    const matchSearch = l.judul.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "Selesai") return matchSearch && l.progress === 100;
    if (filterStatus === "Progres") return matchSearch && l.progress > 0 && l.progress < 100;
    if (filterStatus === "Belum Terlaksana") return matchSearch && (l.progress === 0 || !l.progress);
    return matchSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#fbfbfb] min-h-screen text-zinc-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black text-white rounded-[24px] shadow-xl">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Laporan Kerja</h1>
            <p className="text-zinc-500 text-xs font-medium mt-1 uppercase tracking-widest">RW 18 Digital Cloud</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-black text-white px-8 py-5 rounded-2xl font-bold text-xs hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} /> BUAT LAPORAN
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white border border-zinc-100 rounded-2xl flex items-center px-4 shadow-sm focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
          <Search size={18} className="text-zinc-400" />
          {/* text-base (16px) untuk cegah zoom mobile */}
          <input 
            type="text" 
            placeholder="Cari laporan..." 
            className="w-full p-4 bg-transparent outline-none text-base md:text-sm font-medium text-zinc-700 placeholder:text-zinc-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1.5 bg-zinc-100 rounded-2xl overflow-x-auto no-scrollbar">
          {['Semua', 'Progres', 'Selesai', 'Belum Terlaksana'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-tighter ${
                filterStatus === s ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* GRID LAPORAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {filteredData.length > 0 ? (
          filteredData.map((l) => (
            <div key={l.id} className="bg-white border border-zinc-50 p-6 md:p-8 rounded-[2.5rem] space-y-6 hover:shadow-xl hover:border-zinc-200 transition-all group relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`p-4 rounded-2xl transition-colors ${l.progress === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-900 text-white'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg tracking-tight text-zinc-900 leading-tight">{l.judul}</h3>
                    <div className="flex items-center gap-2 mt-1 text-zinc-400">
                      <Calendar size={12} />
                      <p className="text-[11px] font-bold">{l.tgl}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteLaporan(l.id)} className="p-2 text-zinc-100 hover:text-rose-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-3">
                 <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden p-0.5 border border-zinc-100">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        l.progress === 100 ? "bg-emerald-500" : 
                        l.progress === 0 ? "bg-zinc-200" : "bg-black"
                      }`}
                      style={{ width: `${l.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-zinc-900">
                      <Target size={14} className="text-zinc-400" />
                      <span className="text-xl font-black">{l.progress || 0}%</span>
                    </div>
                    {l.progress === 100 ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-4 py-1.5 rounded-xl border border-emerald-100 uppercase">Selesai</span>
                    ) : (
                      <span className="bg-zinc-50 text-zinc-500 text-[10px] font-bold px-4 py-1.5 rounded-xl border border-zinc-100 uppercase tracking-widest">
                        {l.progress === 0 ? "Menunggu" : "Proses"}
                      </span>
                    )}
                  </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] flex flex-col items-center justify-center gap-3">
             <AlertCircle size={40} className="text-zinc-100" />
             <p className="text-zinc-300 font-bold text-sm italic">Data tidak ditemukan di database cloud</p>
          </div>
        )}
      </div>

      {/* MODAL INPUT */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3.5rem] p-8 md:p-12 relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Input Laporan Baru</h2>
              <button onClick={() => setShowModal(false)} className="bg-zinc-100 p-2 rounded-full text-zinc-400 hover:text-black transition-colors">Tutup</button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
                {['Program', 'Rutin'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, kategori: t})}
                    className={`flex-1 py-4 rounded-xl text-xs font-bold transition-all ${
                      formData.kategori === t ? 'bg-white text-black shadow-sm' : 'text-zinc-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 ml-2 uppercase tracking-widest text-zinc-400">Nama Laporan</label>
                {/* text-base (16px) untuk cegah zoom mobile */}
                <input 
                  required 
                  type="text" 
                  placeholder="Ketik judul laporan..." 
                  className="w-full p-5 bg-zinc-50 border border-transparent focus:border-zinc-200 rounded-[1.5rem] outline-none font-semibold text-base md:text-sm text-zinc-700 placeholder:text-zinc-300 focus:ring-4 focus:ring-zinc-50 transition-all" 
                  value={formData.judul} 
                  onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                />
              </div>

              <div className="space-y-4 bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Progress Kerja</label>
                  <span className="text-xl font-black">{formData.progress}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
                  value={formData.progress} 
                  onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 ml-2 uppercase tracking-widest">Tanggal Pelaksanaan</label>
                <input 
                  required 
                  type="date" 
                  className="w-full p-5 bg-zinc-50 border border-transparent focus:border-zinc-200 rounded-2xl outline-none font-bold text-base md:text-sm text-zinc-600 focus:ring-4 focus:ring-zinc-50 transition-all" 
                  value={formData.tgl} 
                  onChange={(e) => setFormData({...formData, tgl: e.target.value})} 
                />
              </div>

              <button type="submit" className="w-full bg-black text-white p-6 rounded-[2.5rem] font-bold text-sm tracking-[0.2em] shadow-xl hover:bg-zinc-800 transition-all active:scale-95 mt-4 shadow-black/20">
                SIMPAN DATA LAPORAN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;