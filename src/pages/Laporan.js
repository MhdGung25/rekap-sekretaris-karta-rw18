import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Clock, Plus, 
  X, Trash2, LayoutGrid, Calendar, Target,
  Search 
} from 'lucide-react';
// Import koneksi db dari firebaseConfig
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
    deskripsi: ""
  });

  // LOAD DATA DARI FIREBASE (REAL-TIME)
  useEffect(() => {
    const q = query(collection(db, "laporan"), orderBy("tgl", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDataLaporan(data);
    });

    return () => unsubscribe();
  }, []);

  const capitalize = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

  // SIMPAN KE FIREBASE
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "laporan"), {
        ...formData,
        judul: capitalize(formData.judul.trim()),
        createdAt: new Date().toISOString()
      });
      
      setShowModal(false);
      setFormData({ 
        judul: "", 
        tgl: new Date().toISOString().split('T')[0], 
        progress: 0, 
        deskripsi: "" 
      });
    } catch (error) {
      console.error("Gagal simpan laporan:", error);
      alert("Terjadi kesalahan koneksi database.");
    }
  };

  // HAPUS DARI FIREBASE
  const deleteLaporan = async (id) => {
    if (window.confirm("Hapus laporan ini secara permanen dari database cloud?")) {
      try {
        await deleteDoc(doc(db, "laporan", id));
      } catch (error) {
        console.error("Gagal menghapus:", error);
      }
    }
  };

  const filteredData = dataLaporan.filter(l => {
    const matchSearch = l.judul.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "Selesai") return matchSearch && l.progress === 100;
    if (filterStatus === "Progres") return matchSearch && l.progress < 100;
    return matchSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black text-white rounded-[24px] shadow-xl shrink-0">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none text-zinc-900">Laporan Kerja</h1>
            <p className="text-zinc-500 text-xs md:text-sm font-medium mt-1 uppercase tracking-[0.15em]">Sistem Monitoring Program Kerja</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} /> Buat Laporan
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white border border-zinc-200 rounded-2xl flex items-center px-4 py-1 shadow-sm">
          <Search size={18} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari judul laporan..." 
            className="w-full p-3 bg-transparent outline-none text-sm font-bold text-zinc-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl border border-zinc-200 overflow-x-auto">
          {['Semua', 'Progres', 'Selesai'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterStatus === s ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* GRID LAPORAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {filteredData.length > 0 ? (
          filteredData.map((l) => (
            <div key={l.id} className="bg-white border border-zinc-200 p-6 md:p-8 rounded-[40px] space-y-6 hover:border-black transition-all shadow-sm group relative overflow-hidden">
              <div className={`absolute top-0 right-10 h-1 w-20 rounded-b-full ${l.progress === 100 ? 'bg-green-500' : 'bg-amber-500'}`}></div>

              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 md:gap-5 min-w-0">
                  <div className={`p-4 rounded-2xl border transition-colors shrink-0 ${
                    l.progress === 100 
                    ? 'bg-green-50 text-green-600 border-green-100 group-hover:bg-green-600 group-hover:text-white' 
                    : 'bg-zinc-50 text-zinc-900 border-zinc-100 group-hover:bg-black group-hover:text-white'
                  }`}>
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-lg md:text-xl tracking-tight leading-tight text-zinc-900 truncate">{l.judul}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-zinc-400">
                      <Calendar size={12} />
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        {new Date(l.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {l.progress === 100 ? (
                    <CheckCircle2 className="text-green-500" size={28} />
                  ) : (
                    <Clock className="text-amber-500 animate-pulse" size={28} />
                  )}
                  <button onClick={() => deleteLaporan(l.id)} className="p-2 text-zinc-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {l.deskripsi && (
                <p className="text-sm text-zinc-500 font-medium leading-relaxed bg-zinc-50/80 p-5 rounded-3xl border border-zinc-100 italic">
                  "{l.deskripsi}"
                </p>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      <Target size={12}/> Capaian
                    </span>
                    <p className={`text-2xl font-black leading-none ${l.progress === 100 ? 'text-green-600' : 'text-zinc-900'}`}>
                      {l.progress}<span className="text-sm ml-0.5">%</span>
                    </p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border tracking-tighter ${
                    l.progress === 100 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                  }`}>
                    {l.progress === 100 ? 'Selesai' : 'Dalam Progres'}
                  </span>
                </div>
                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      l.progress === 100 ? "bg-green-500" : "bg-black shadow-lg"
                    }`}
                    style={{ width: `${l.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 border-2 border-dashed border-zinc-100 rounded-[50px] flex flex-col items-center justify-center">
            <p className="text-zinc-400 text-[11px] font-black uppercase tracking-[0.4em]">Menghubungkan ke Cloud...</p>
          </div>
        )}
      </div>

      {/* MODAL INPUT */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 md:p-10 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4 z-10 border-b border-zinc-50">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">Buat Laporan</h2>
              <button onClick={() => setShowModal(false)} className="p-3 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nama Laporan</label>
                <input required type="text" placeholder="Judul program kerja..." className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black font-bold text-sm" 
                  value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tanggal</label>
                <input required type="date" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black font-bold text-sm" 
                  value={formData.tgl} onChange={(e) => setFormData({...formData, tgl: e.target.value})} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Progres Kerja</label>
                  <span className="text-xl font-black">{formData.progress}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  className="w-full h-2.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-black"
                  value={formData.progress} onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Keterangan Tambahan</label>
                <textarea rows="4" placeholder="Detail kegiatan..." className="w-full p-5 bg-zinc-50 border border-zinc-200 rounded-[24px] outline-none focus:border-black font-medium text-sm resize-none"
                  value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}></textarea>
              </div>

              <button type="submit" className="w-full bg-black text-white p-5 rounded-[24px] font-black uppercase tracking-widest text-xs mt-4 hover:shadow-2xl transition-all">
                Simpan ke Cloud
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;