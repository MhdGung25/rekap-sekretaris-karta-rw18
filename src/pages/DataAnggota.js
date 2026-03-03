import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, X, Trash2, CheckCircle2, XCircle, Bell, 
  ArrowRight, Shield, User, Loader2 
} from 'lucide-react';

const DataAnggota = () => {
  const [anggota, setAnggota] = useState(() => {
    const savedData = localStorage.getItem('database_anggota_rw18');
    return savedData ? JSON.parse(savedData) : [];
  });

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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const formatTeksOtomatis = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const updateDatabase = (newData) => {
    setAnggota(newData);
    localStorage.setItem('database_anggota_rw18', JSON.stringify(newData));
    window.dispatchEvent(new Event('storage'));
  };

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSimpan = (e) => {
    e.preventDefault();
    const namaRapih = formatTeksOtomatis(formData.nama);
    const jabatanRapih = formData.tipe === 'Anggota' 
      ? 'Anggota biasa' 
      : formatTeksOtomatis(formData.jabatan);

    const newEntry = { 
      ...formData, 
      id: String(Date.now()),
      nama: namaRapih,
      jabatan: jabatanRapih,
      createdAt: new Date().toISOString()
    };

    const updatedData = [newEntry, ...anggota];
    updateDatabase(updatedData);
    setIsModalOpen(false);
    setFormData({ nama: '', tipe: 'Anggota', jabatan: '', status: 'Aktif' });
    showToast(`Data ${namaRapih} berhasil disimpan`);
  };

  const handleHapus = (id) => {
    if(window.confirm("Hapus data anggota ini secara permanen?")) {
      const updatedData = anggota.filter(a => a.id !== id);
      updateDatabase(updatedData);
      showToast("Data telah dihapus");
    }
  };

  const filteredData = anggota.filter(i => 
    (i.nama && i.nama.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (i.jabatan && i.jabatan.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-10 font-sans">
      
      {/* --- TOAST NOTIFICATION --- */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <Bell size={14} className="animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{notification}</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Sistem manajemen</span>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
              DATABASE ANGGOTA & PENGURUS
            </h1>
          </div>
          
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">
             <div className="px-6 py-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider">
               TOTAL: {anggota.length} PERSONEL
             </div>
          </div>
        </div>

        {/* --- TOOLBAR --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama atau jabatan..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm tracking-wider font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <UserPlus size={16} /> TAMBAH ANGGOTA
          </button>
        </div>

        {/* --- TABLE AREA --- */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
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
                          <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[10px] border border-slate-800 shadow-sm transition-transform group-hover:scale-110">
                            {person.nama ? person.nama.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 tracking-tight">{person.nama}</span>
                            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-tighter">
                              ID-{String(person.id).slice(-5)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${
                          person.tipe === 'Pengurus' 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-white border-slate-200 text-slate-600'
                        }`}>
                          {person.tipe === 'Pengurus' ? <Shield size={10}/> : <User size={10}/>}
                          {person.tipe}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-slate-500 tracking-wider bg-slate-100 px-2 py-1 rounded">
                          {person.jabatan}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter ${person.status === 'Aktif' ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {person.status === 'Aktif' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                          {person.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleHapus(person.id)} 
                          className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <Users size={48} className="text-slate-900 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Data tidak ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL INPUT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-5 bg-slate-900 flex justify-between items-center text-white">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">REGISTRASI ANGGOTA BARU</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={20}/></button>
            </div>

            <form onSubmit={handleSimpan} className="p-6 space-y-5">
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">NAMA LENGKAP</label>
                <input 
                  required
                  type="text" 
                  placeholder="Masukkan nama lengkap..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">KATEGORI</label>
                  <select 
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 outline-none appearance-none cursor-pointer"
                    onChange={(e) => setFormData({...formData, tipe: e.target.value})}
                    value={formData.tipe}
                  >
                    <option value="Anggota">Anggota</option>
                    <option value="Pengurus">Pengurus</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">STATUS</label>
                  <select 
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 outline-none appearance-none cursor-pointer"
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              {formData.tipe === 'Pengurus' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">JABATAN PENGURUS</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Contoh: Ketua RW"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                    onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                  />
                </div>
              )}

              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95 mt-2">
                SIMPAN KE DATABASE <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnggota;