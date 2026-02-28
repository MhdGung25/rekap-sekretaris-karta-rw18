import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, X, Trash2, CheckCircle2, XCircle, Bell
} from 'lucide-react';

const DataAnggota = () => {
  const [anggota, setAnggota] = useState(() => {
    const savedData = localStorage.getItem('database_anggota_rw18');
    return savedData ? JSON.parse(savedData) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    nama: '',
    tipe: '',
    jabatan: '',
    status: 'Aktif'
  });

  // LOGIKA SMART CAPITALIZE
  const formatTeksOtomatis = (str) => {
    if (!str) return '';
    // Jika user mengetik SEMUA KAPITAL (misal: "BCA"), biarkan saja
    if (str === str.toUpperCase() && str.length > 1) return str;
    
    // Jika tidak, buat jadi Capital Case (Huruf awal besar tiap kata)
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
      ? 'Anggota Biasa' 
      : formatTeksOtomatis(formData.jabatan);

    const newEntry = { 
      ...formData, 
      id: String(Date.now()),
      nama: namaRapih,
      jabatan: jabatanRapih,
      status: formData.status
    };

    const updatedData = [newEntry, ...anggota];
    updateDatabase(updatedData);
    
    setIsModalOpen(false);
    setFormData({ nama: '', tipe: '', jabatan: '', status: 'Aktif' });
    showToast(`Data ${namaRapih} tersimpan.`);
  };

  const handleHapus = (id) => {
    if(window.confirm("Hapus data anggota ini?")) {
      const updatedData = anggota.filter(a => a.id !== id);
      updateDatabase(updatedData);
      showToast("Data dihapus.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 p-4 lg:p-10 font-sans relative pb-20">
      
      {/* NOTIFIKASI - HITAM PUTIH */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <Bell size={16} className="text-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* HEADER - TEXT BESAR & FORMAL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900 leading-none">DATABASE ANGGOTA</h1>
            <p className="text-zinc-500 text-xs font-bold mt-2 uppercase tracking-widest">Manajemen Arsip Data</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari data..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black/5 shadow-sm uppercase tracking-wider"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              <UserPlus size={16} /> ARSIP BARU
            </button>
          </div>
        </div>

        {/* TABEL - KONSEP MINIMALIS HITAM PUTIH */}
        <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[700px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6 border-b border-zinc-100">Informasi Nama</th>
                <th className="px-8 py-6 border-b border-zinc-100">Kategori</th>
                <th className="px-8 py-6 border-b border-zinc-100">Jabatan</th>
                <th className="px-8 py-6 border-b border-zinc-100">Status</th>
                <th className="px-8 py-6 border-b border-zinc-100 text-right">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {anggota.length > 0 ? (
                anggota
                  .filter(i => i.nama.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((person) => (
                  <tr key={person.id} className="hover:bg-zinc-50/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center font-black text-xs border border-zinc-800 transition-all">
                          {person.nama.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-zinc-900 uppercase tracking-tight">{person.nama}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg">
                        {person.tipe}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-zinc-600 uppercase">
                      {person.jabatan}
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter ${person.status === 'Aktif' ? 'text-green-600' : 'text-zinc-300'}`}>
                        {person.status === 'Aktif' ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                        {person.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleHapus(person.id)} 
                        className="p-2.5 text-zinc-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Users size={48} className="text-zinc-900 mb-4" />
                      <p className="text-xs font-black uppercase tracking-[0.4em]">Database Kosong</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL - HITAM PUTIH MINIMALIS */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
                <div>
                  <h3 className="font-black text-xl text-zinc-900 uppercase tracking-tighter">Tambah Arsip</h3>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">Sistem Registrasi Unit</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 rounded-full text-zinc-400 hover:text-red-500 transition-all">
                  <X size={18}/>
                </button>
              </div>

              <form onSubmit={handleSimpan} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Nama Lengkap</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Contoh: Muhammad Agung"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Kategori</label>
                    <select 
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                      onChange={(e) => setFormData({...formData, tipe: e.target.value})}
                    >
                      <option value="">PILIH</option>
                      <option value="Pengurus">PENGURUS</option>
                      <option value="Anggota">ANGGOTA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Status</label>
                    <select 
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none"
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Aktif">AKTIF</option>
                      <option value="Non-Aktif">NON-AKTIF</option>
                    </select>
                  </div>
                </div>

                {formData.tipe === 'Pengurus' && (
                  <div className="animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Jabatan</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Contoh: Sekretaris"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all"
                      onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                    />
                  </div>
                )}

                <button type="submit" className="w-full bg-zinc-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl mt-2 active:scale-[0.98]">
                  VERIFIKASI & SIMPAN
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAnggota;