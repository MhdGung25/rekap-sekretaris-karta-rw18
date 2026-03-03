import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, X, Trash2, CheckCircle2, Bell, 
  ArrowRight,  User, Loader2 
} from 'lucide-react';
import { db } from '../firebaseConfig';
import { 
  collection, addDoc, onSnapshot, 
  query, deleteDoc, doc, orderBy 
} from 'firebase/firestore';

const DataAnggota = () => {
  const [anggota, setAnggota] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nama: '',
    tipe: 'Anggota',
    jabatan: '',
    status: 'Aktif'
  });

  // --- SYNC DENGAN FIREBASE (SESUAI GAMBAR DATABASE KAMU) ---
  useEffect(() => {
    // Menghubungkan ke koleksi 'anggota' seperti di screenshot
    const q = query(collection(db, "anggota"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnggota(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching firebase:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    
    // Payload disesuaikan dengan field di Firebase kamu
    const payload = { 
      nama: formData.nama.toUpperCase(), // Sesuai di gambar: "FARID" (Kapital)
      tipe: formData.tipe,
      jabatan: formData.tipe === 'Anggota' ? 'Anggota Biasa' : formData.jabatan,
      status: formData.status,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "anggota"), payload);
      setIsModalOpen(false);
      setFormData({ nama: '', tipe: 'Anggota', jabatan: '', status: 'Aktif' });
      showToast("Data berhasil ditambahkan ke cloud");
    } catch (error) {
      showToast("Gagal menyimpan data");
    }
  };

  const handleHapus = async (id) => {
    if(window.confirm("Hapus data ini dari cloud?")) {
      try {
        await deleteDoc(doc(db, "anggota", id));
        showToast("Data telah dihapus");
      } catch (error) {
        showToast("Gagal menghapus data");
      }
    }
  };

  const filteredData = anggota.filter(i => 
    (i.nama && i.nama.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-10 font-sans">
      
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <Bell size={14} className="animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{notification}</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">SISTEM MANAJEMEN</span>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
              DATABASE ANGGOTA & PENGURUS
            </h1>
          </div>
          
          <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
               TOTAL: {anggota.length} PERSONEL
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama anggota..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
          >
            <UserPlus size={16} /> TAMBAH ANGGOTA
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] uppercase tracking-[0.15em] font-bold text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4">PROFIL ANGGOTA</th>
                  <th className="px-6 py-4">KATEGORI</th>
                  <th className="px-6 py-4">JABATAN</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan="5" className="px-6 py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={24} /></td></tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((person) => (
                    <tr key={person.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[10px]">
                            {person.nama ? person.nama.charAt(0) : '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{person.nama}</span>
                            <span className="text-[9px] text-slate-400 font-mono uppercase">ID-{person.id.slice(0,5)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase">
                          <User size={10}/> {person.tipe || 'Anggota'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {person.jabatan || 'Anggota Biasa'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${person.status === 'Aktif' ? 'text-emerald-600' : 'text-slate-300'}`}>
                          <CheckCircle2 size={12}/> {person.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleHapus(person.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <Users size={40} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATA TIDAK DITEMUKAN</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL INPUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 flex justify-between items-center text-white">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">REGISTRASI ANGGOTA BARU</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSimpan} className="p-6 space-y-5">
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block">NAMA LENGKAP</label>
                <input 
                  required type="text" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  value={formData.nama}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select 
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  onChange={(e) => setFormData({...formData, tipe: e.target.value})}
                  value={formData.tipe}
                >
                  <option value="Anggota">Anggota</option>
                  <option value="Pengurus">Pengurus</option>
                </select>
                <select 
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  value={formData.status}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
              {formData.tipe === 'Pengurus' && (
                <input 
                  required type="text" placeholder="Jabatan..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                />
              )}
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                SIMPAN KE CLOUD <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnggota;