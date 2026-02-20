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

  // FUNGSI OTOMATIS: Mengubah "nama saya" menjadi "Nama Saya"
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
      // Nama disimpan dengan format Capitalize Each Word
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
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all shadow-md active:scale-95"
        >
          <UserPlus size={16} /> Tambah Data
        </button>
      </div>

      {/* PENGURUS GRID */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 opacity-60">
          <ShieldCheck size={16} />
          <h2 className="text-xs font-bold uppercase tracking-widest">Struktur Inti (Pengurus)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pengurus.length > 0 ? pengurus.map((p) => (
            <div key={p.id} className="bg-white border border-zinc-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                  {p.nama.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="font-bold text-sm truncate leading-none">{p.nama}</p>
                  <p className="text-[10px] font-medium text-zinc-400 mt-1">{p.jabatan}</p>
                </div>
              </div>
              <button onClick={() => deleteData(p.id, "Pengurus")} className="text-zinc-200 hover:text-rose-500 transition-colors ml-2">
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
            <h2 className="text-xs font-bold uppercase tracking-widest">Daftar Anggota ({filteredAnggota.length})</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input 
              type="text" placeholder="Cari nama anggota..." 
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-black outline-none"
              value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-[1.5rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 text-[10px] font-bold text-zinc-400 uppercase border-b border-zinc-50">
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {currentAnggota.length > 0 ? currentAnggota.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm tracking-tight">{item.nama}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-md text-[9px] font-bold border ${
                        item.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteData(item.id, "Anggota")} className="text-zinc-200 hover:text-rose-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="py-20 text-center text-xs font-medium text-zinc-300 italic uppercase tracking-widest">
                      {searchTerm ? "Hasil pencarian nihil" : "Data cloud kosong"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-50 flex items-center justify-between bg-zinc-50/30">
              <p className="text-[10px] font-bold text-zinc-400">Halaman {currentPage} dari {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 hover:bg-black hover:text-white transition-all">
                  <ChevronLeft size={14} />
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 hover:bg-black hover:text-white transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL INPUT */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold tracking-tight">Tambah Personel</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-black font-bold text-xs">Tutup</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
                {['Anggota', 'Pengurus'].map((role) => (
                  <button key={role} type="button" onClick={() => setFormData({...formData, peran: role})}
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all ${
                      formData.peran === role ? 'bg-white text-black shadow-sm' : 'text-zinc-400'
                    }`}
                  > {role} </button>
                ))}
              </div>
              <input 
                required 
                placeholder="Nama Lengkap" 
                className="w-full p-3.5 bg-zinc-50 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-black"
                value={formData.nama} 
                onChange={(e) => setFormData({...formData, nama: e.target.value})} 
              />
              {formData.peran === "Pengurus" && (
                <input 
                  required 
                  placeholder="Jabatan (Misal: Ketua)" 
                  className="w-full p-3.5 bg-zinc-50 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-black"
                  value={formData.jabatan} 
                  onChange={(e) => setFormData({...formData, jabatan: e.target.value})} 
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                {['Aktif', 'Tidak Aktif'].map((s) => (
                  <button key={s} type="button" onClick={() => setFormData({...formData, status: s})}
                    className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${
                      formData.status === s ? 'bg-black text-white' : 'bg-white text-zinc-400 border-zinc-100'
                    }`}
                  > {s} </button>
                ))}
              </div>
              <button type="submit" className="w-full bg-black text-white py-4 rounded-2xl font-bold text-xs tracking-widest shadow-lg hover:bg-zinc-800 transition-all">
                Simpan Data
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnggota;