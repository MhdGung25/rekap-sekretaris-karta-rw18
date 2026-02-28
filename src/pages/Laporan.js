import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  Search, 
  AlertCircle,
  ArrowRight,
  X
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
  
  const [formData, setFormData] = useState({
    judul: "",
    tgl: new Date().toISOString().split('T')[0],
    progress: 0,
    deskripsi: "",
    kategori: "Program"
  });

  // Listener Real-time
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
    } catch (error) {
      alert("Gagal menyimpan data.");
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
    const judul = l.judul || "";
    const matchSearch = judul.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "Selesai") return matchSearch && Number(l.progress) === 100;
    if (filterStatus === "Progres") return matchSearch && Number(l.progress) > 0 && Number(l.progress) < 100;
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8 text-zinc-900 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-blue-600"></div>
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Monitoring System</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Laporan Sekretaris Karta </h2>
            <p className="text-zinc-500 text-sm mt-1">Kelola progres program dan kegiatan secara transparan.</p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-95 shadow-md"
          >
            <Plus size={18} /> Tambah Laporan
          </button>
        </div>

        {/* STATS CARDS - Ringkasan lebih kecil */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Program</p>
            <h4 className="text-2xl font-bold text-black">{dataLaporan.length}</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <p className="text-blue-500 text-[10px] font-bold uppercase tracking-wider mb-1">Dalam Progres</p>
            <h4 className="text-2xl font-bold text-black">
                {dataLaporan.filter(l => Number(l.progress) > 0 && Number(l.progress) < 100).length}
            </h4>
          </div>
          <div className="bg-zinc-900 p-5 rounded-2xl shadow-sm text-white">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Selesai</p>
            <h4 className="text-2xl font-bold">
                {dataLaporan.filter(l => Number(l.progress) === 100).length}
            </h4>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Persentase Gol</p>
            <h4 className="text-2xl font-bold text-black">
                {dataLaporan.length ? Math.round((dataLaporan.filter(l => Number(l.progress) === 100).length / dataLaporan.length) * 100) : 0}%
            </h4>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari program..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 p-1 bg-zinc-200/50 rounded-xl border border-zinc-200">
            {['Semua', 'Progres', 'Selesai'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === s ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
             <div className="col-span-full py-20 text-center text-sm font-medium text-zinc-400">Menghubungkan ke server...</div>
          ) : filteredData.length > 0 ? (
            filteredData.map((l) => (
              <div key={l.id} className="bg-white border border-zinc-200 p-6 rounded-2xl hover:border-zinc-400 transition-all flex flex-col shadow-sm relative group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-2.5 rounded-lg ${Number(l.progress) === 100 ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-600'}`}>
                    <FileText size={20} />
                  </div>
                  <button onClick={() => deleteLaporan(l.id)} className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex-grow">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {l.kategori || 'UMUM'}
                  </span>
                  <h3 className="font-bold text-lg text-black mt-1 leading-snug">
                    {l.judul}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-zinc-400 text-[11px] font-medium">
                    <Calendar size={12} />
                    <span>{l.tgl}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">Progres</span>
                    <span className="text-sm font-bold text-black">{l.progress || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-50">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${Number(l.progress) === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${l.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
               <AlertCircle size={32} className="mx-auto text-zinc-200 mb-2" />
               <p className="text-zinc-400 font-bold text-sm uppercase tracking-wider">Tidak ada data</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL INPUT - Ukuran diperkecil untuk laptop */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-black">Tambah Laporan Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Judul Kegiatan</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white rounded-xl outline-none text-sm font-medium transition-all"
                  placeholder="Contoh: Kerja Bakti Rutin"
                  value={formData.judul} 
                  onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Kategori</label>
                  <select 
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white rounded-xl outline-none text-sm font-medium transition-all cursor-pointer"
                    value={formData.kategori}
                    onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  >
                    <option value="Program">PROGRAM</option>
                    <option value="Rutin">RUTIN</option>
                    <option value="Urgent">URGENT</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Tanggal</label>
                  <input 
                    type="date" 
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white rounded-xl outline-none text-sm font-medium transition-all"
                    value={formData.tgl}
                    onChange={(e) => setFormData({...formData, tgl: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Persentase Progres</label>
                  <span className="text-lg font-bold text-blue-600">{formData.progress}%</span>
                </div>
                <input 
                  type="range" min="0" max="100"
                  className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-black"
                  value={formData.progress} 
                  onChange={(e) => setFormData({...formData, progress: e.target.value})} 
                />
              </div>

              <button type="submit" className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                Simpan Laporan <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;