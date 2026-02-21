import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Search, ShieldCheck, 
  User, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { db } from '../firebaseConfig'; 
import { 
  collection, addDoc, onSnapshot, 
  query, deleteDoc, doc, orderBy 
} from 'firebase/firestore';

const DataAnggota = () => {
  const [pengurus, setPengurus] = useState([]);
  const [anggota, setAnggota] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    nama: "", peran: "Anggota", jabatan: "", status: "Aktif"
  });

  // Tambahkan Meta Tag via JS untuk mencegah zooming otomatis di beberapa browser
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
    document.getElementsByTagName('head')[0].appendChild(meta);
  }, []);

  useEffect(() => {
    const qPengurus = query(collection(db, "pengurus"), orderBy("nama", "asc"));
    const unsubPengurus = onSnapshot(qPengurus, (snapshot) => {
      setPengurus(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qAnggota = query(collection(db, "anggota"), orderBy("nama", "asc"));
    const unsubAnggota = onSnapshot(qAnggota, (snapshot) => {
      setAnggota(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPengurus();
      unsubAnggota();
    };
  }, []);

  const formatAutoCase = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const collectionName = formData.peran === "Pengurus" ? "pengurus" : "anggota";
    
    const dataToSave = {
      nama: formatAutoCase(formData.nama.trim()),
      status: formData.status,
      createdAt: new Date().toISOString()
    };

    if (formData.peran === "Pengurus") {
      dataToSave.jabatan = formatAutoCase(formData.jabatan.trim());
    }

    try {
      await addDoc(collection(db, collectionName), dataToSave);
      setFormData({ nama: "", peran: "Anggota", jabatan: "", status: "Aktif" });
      setShowModal(false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const deleteData = async (id, tipe) => {
    if (window.confirm("Hapus data personel ini?")) {
      const collectionName = tipe === "Pengurus" ? "pengurus" : "anggota";
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (error) {
        console.error("Gagal menghapus:", error);
      }
    }
  };

  const filteredAnggota = anggota.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAnggota = filteredAnggota.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAnggota.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#fbfbfb] p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto text-zinc-900">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Database Personel</h1>
          <p className="text-zinc-500 text-xs font-medium">Manajemen data anggota Karang Taruna RW 18</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-2xl font-bold text-xs hover:bg-zinc-800 transition-all shadow-md active:scale-95"
        >
          <UserPlus size={16} /> Tambah Data
        </button>
      </div>

      {/* PENGURUS GRID */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 opacity-60">
          <ShieldCheck size={16} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Struktur Inti (Pengurus)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pengurus.length > 0 ? pengurus.map((p) => (
            <div key={p.id} className="bg-white border border-zinc-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                  {p.nama.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="font-bold text-sm truncate leading-none mb-1">{p.nama}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{p.jabatan}</p>
                </div>
              </div>
              <button onClick={() => deleteData(p.id, "Pengurus")} className="text-zinc-200 hover:text-rose-500 transition-colors ml-2 p-2">
                <Trash2 size={14}/>
              </button>
            </div>
          )) : (
            <div className="col-span-full py-10 bg-white border border-dashed rounded-2xl text-center text-xs font-medium text-zinc-300 italic">Belum ada pengurus terdaftar</div>
          )}
        </div>
      </div>

      {/* DATABASE ANGGOTA */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2 opacity-60">
            <User size={16} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Daftar Anggota ({filteredAnggota.length})</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            {/* Font 16px di Mobile untuk mencegah zoom */}
            <input 
              type="text" placeholder="Cari nama anggota..." 
              className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-base md:text-xs font-medium focus:ring-2 focus:ring-zinc-100 outline-none transition-all"
              value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-zinc-50/50 text-[10px] font-bold text-zinc-400 uppercase border-b border-zinc-50">
                  <th className="px-8 py-5">Nama Lengkap</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {currentAnggota.length > 0 ? currentAnggota.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-sm tracking-tight text-zinc-800">{item.nama}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold border ${
                        item.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => deleteData(item.id, "Anggota")} className="p-2 text-zinc-200 hover:text-rose-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="py-24 text-center text-xs font-bold text-zinc-200 italic uppercase tracking-widest">
                      Database Kosong
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-zinc-50 flex items-center justify-between bg-zinc-50/30">
              <p className="text-[10px] font-bold text-zinc-400">Halaman {currentPage} dari {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 bg-white border border-zinc-200 rounded-xl disabled:opacity-30 hover:bg-black hover:text-white transition-all">
                  <ChevronLeft size={16} />
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 bg-white border border-zinc-200 rounded-xl disabled:opacity-30 hover:bg-black hover:text-white transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL INPUT */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 md:p-10 relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Tambah Personel</h2>
              <button onClick={() => setShowModal(false)} className="bg-zinc-100 p-2 rounded-full text-zinc-500 hover:text-black transition-all">Tutup</button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex gap-2 p-1.5 bg-zinc-100 rounded-[1.25rem]">
                {['Anggota', 'Pengurus'].map((role) => (
                  <button key={role} type="button" onClick={() => setFormData({...formData, peran: role})}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all ${
                      formData.peran === role ? 'bg-white text-black shadow-sm' : 'text-zinc-400'
                    }`}
                  > {role} </button>
                ))}
              </div>

              <div className="space-y-4">
                {/* PENTING: text-base (16px) di Mobile untuk mencegah zoom otomatis. 
                   md:text-sm akan mengecilkan font hanya di layar besar agar tetap rapi.
                */}
                <input 
                  required 
                  placeholder="Nama Lengkap" 
                  className="w-full p-4 bg-zinc-50 rounded-2xl text-base md:text-sm font-semibold outline-none focus:ring-2 focus:ring-zinc-100 border border-transparent focus:border-zinc-200 transition-all"
                  value={formData.nama} 
                  onChange={(e) => setFormData({...formData, nama: e.target.value})} 
                />
                
                {formData.peran === "Pengurus" && (
                  <input 
                    required 
                    placeholder="Jabatan (Misal: Ketua)" 
                    className="w-full p-4 bg-zinc-50 rounded-2xl text-base md:text-sm font-semibold outline-none focus:ring-2 focus:ring-zinc-100 border border-transparent focus:border-zinc-200 transition-all"
                    value={formData.jabatan} 
                    onChange={(e) => setFormData({...formData, jabatan: e.target.value})} 
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Aktif', 'Tidak Aktif'].map((s) => (
                  <button key={s} type="button" onClick={() => setFormData({...formData, status: s})}
                    className={`py-4 rounded-2xl text-[10px] font-bold border transition-all uppercase tracking-widest ${
                      formData.status === s ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-zinc-400 border-zinc-100'
                    }`}
                  > {s} </button>
                ))}
              </div>

              <button type="submit" className="w-full bg-black text-white py-5 rounded-[2rem] font-bold text-sm tracking-[0.15em] shadow-xl hover:bg-zinc-800 transition-all active:scale-95 mt-4">
                SIMPAN KE CLOUD
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnggota;