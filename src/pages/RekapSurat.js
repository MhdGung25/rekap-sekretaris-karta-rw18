import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, FileText, 
  Download, Trash2, X, 
  ArrowRight, Image as ImageIcon,
  Calendar
} from 'lucide-react';
import { db } from '../firebaseConfig'; 
import { 
  collection, addDoc, onSnapshot, 
  query, deleteDoc, doc, orderBy 
} from 'firebase/firestore';

const RekapSurat = () => {
  const [activeTab, setActiveTab] = useState('surat');
  const [suratList, setSuratList] = useState([]);
  const [absenList, setAbsenList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    noSurat: "", perihal: "", tanggal: "", 
    fileBase64: null, fileName: "", fileType: ""
  });

  useEffect(() => {
    setIsLoading(true);
    
    // Sinkronisasi Surat
    const qSurat = query(collection(db, "rekap_surat"), orderBy("createdAt", "desc"));
    const unsubSurat = onSnapshot(qSurat, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuratList(data);
      
      // SINKRONISASI KE DASHBOARD: Simpan panjang data ke localStorage
      localStorage.setItem('total_surat_rw18', data.length);
      // Trigger event storage agar dashboard tahu ada perubahan
      window.dispatchEvent(new Event('storage'));
      
      if (activeTab === 'surat') setIsLoading(false);
    });

    // Sinkronisasi Absen (Notulensi/Dokumen)
    const qAbsen = query(collection(db, "rekap_absen"), orderBy("createdAt", "desc"));
    const unsubAbsen = onSnapshot(qAbsen, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAbsenList(data);
      
      // SINKRONISASI KE DASHBOARD: Anggap rekap absen sebagai bagian dari Notulensi/Dokumen
      // Pastikan key ini sama dengan yang dibaca di Dashboard
      localStorage.setItem('notulensi_rw18', JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));

      if (activeTab === 'absen') setIsLoading(false);
    });

    return () => { unsubSurat(); unsubAbsen(); };
  }, [activeTab]);

  const handleSave = async (e) => {
    e.preventDefault();
    const collectionName = activeTab === 'surat' ? "rekap_surat" : "rekap_absen";
    
    if (!formData.fileBase64 && activeTab === 'absen') {
      alert("Silakan unggah file bukti absensi terlebih dahulu.");
      return;
    }

    try {
      await addDoc(collection(db, collectionName), {
        ...formData,
        noSurat: formData.noSurat ? formData.noSurat.toUpperCase() : "",
        perihal: formData.perihal.toUpperCase(),
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan data ke Cloud.");
    }
  };

  const resetForm = () => {
    setFormData({ noSurat: "", perihal: "", tanggal: "", fileBase64: null, fileName: "", fileType: "" });
  };

  const handleViewFile = (item) => {
    if (!item.fileBase64) return;
    const win = window.open();
    if (item.fileType === 'pdf') {
      win.document.write(`<iframe src="${item.fileBase64}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`);
    } else {
      win.document.write(`<html><body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center;"><img src="${item.fileBase64}" style="max-width:100%; max-height:100vh;" /></body></html>`);
    }
  };

  const currentData = activeTab === 'surat' ? suratList : absenList;
  const filteredData = currentData.filter(s => 
    (s.noSurat || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.perihal || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER MINI */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sistem Arsip Cloud</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {activeTab === 'surat' ? 'Log Surat Keluar/Masuk' : 'Rekap Dokumen Absensi'}
            </h1>
          </div>

          <div className="flex bg-zinc-200/50 p-1 rounded-xl border border-zinc-200">
            <button onClick={() => { setActiveTab('surat'); resetForm(); }}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all uppercase ${activeTab === 'surat' ? 'bg-white shadow-sm text-black' : 'text-zinc-500'}`}>
              Surat
            </button>
            <button onClick={() => { setActiveTab('absen'); resetForm(); }}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all uppercase ${activeTab === 'absen' ? 'bg-white shadow-sm text-black' : 'text-zinc-500'}`}>
              Absensi
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari perihal atau nomor..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black/5 shadow-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
            <Plus size={16} /> {activeTab === 'surat' ? 'Arsip Baru' : 'Upload Absen'}
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 text-[9px] uppercase tracking-widest font-black text-zinc-400 border-b border-zinc-100">
                  <th className="px-6 py-4">Nama Dokumen / Perihal</th>
                  <th className="px-6 py-4">Tanggal Kegiatan</th>
                  <th className="px-6 py-4">File Lampiran</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {isLoading ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-[10px] font-bold text-zinc-400 uppercase animate-pulse">Memuat Data Cloud...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-[10px] font-bold text-zinc-300 uppercase italic">Belum ada data arsip</td></tr>
                ) : (
                  filteredData.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {activeTab === 'surat' && (
                            <span className="text-[8px] font-black text-blue-600 uppercase mb-0.5 tracking-tighter">{s.noSurat || 'TANPA NOMOR'}</span>
                          )}
                          <span className="text-[11px] font-black text-zinc-800 uppercase tracking-tight leading-tight">{s.perihal}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-zinc-500">
                          <div className="flex items-center gap-2 uppercase tracking-tighter">
                            <Calendar size={12} className="text-zinc-300"/> {s.tanggal}
                          </div>
                      </td>
                      <td className="px-6 py-4">
                        {s.fileBase64 ? (
                          <button onClick={() => handleViewFile(s)} className="flex items-center gap-2 group/btn">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover/btn:bg-black group-hover/btn:text-white transition-all shadow-sm">
                              {s.fileType === 'pdf' ? <FileText size={14} /> : <ImageIcon size={14} />}
                            </div>
                            <span className="text-[9px] font-black text-zinc-400 uppercase group-hover/btn:text-black transition-colors">Buka File</span>
                          </button>
                        ) : <span className="text-[9px] text-zinc-300 italic">No File</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { if(window.confirm("Hapus arsip ini? Data di Dashboard akan otomatis berkurang.")) deleteDoc(doc(db, activeTab === 'surat' ? "rekap_surat" : "rekap_absen", s.id)) }} 
                          className="p-2 text-zinc-300 hover:text-rose-500 transition-all hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL INPUT */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-[30px] sm:rounded-[24px] p-6 md:p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                  <FileText size={16}/>
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">{activeTab === 'surat' ? 'Arsip Surat Baru' : 'Upload Bukti Absen'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-zinc-400">
                  {activeTab === 'surat' ? 'Perihal Surat' : 'Nama Agenda / Kegiatan'}
                </label>
                <input type="text" placeholder="CONTOH: RAPAT KOORDINASI RW" className="w-full p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-black transition-all" 
                  value={formData.perihal} onChange={(e) => setFormData({...formData, perihal: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {activeTab === 'surat' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-400">Nomor Surat</label>
                    <input type="text" placeholder="001/SK/2026" className="w-full p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-black transition-all" 
                      value={formData.noSurat} onChange={(e) => setFormData({...formData, noSurat: e.target.value})} required />
                  </div>
                )}
                <div className={`space-y-1 ${activeTab === 'absen' ? 'col-span-2' : ''}`}>
                  <label className="text-[9px] font-bold uppercase text-zinc-400">Tanggal</label>
                  <input type="date" className="w-full p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none focus:border-black transition-all" 
                    value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-zinc-100">
                <label className="text-[9px] font-bold uppercase text-zinc-400">Upload Lampiran (PDF/IMAGE)</label>
                <div className="relative border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-100 transition-all group">
                  <input type="file" accept=".pdf,image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({...formData, fileBase64: reader.result, fileName: file.name, fileType: file.type.includes('pdf') ? 'pdf' : 'image'});
                      reader.readAsDataURL(file);
                    }
                  }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Download size={20} className="text-zinc-400" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase text-center max-w-[200px] truncate">
                    {formData.fileName || "Pilih File Dokumen"}
                  </p>
                  <p className="text-[8px] text-zinc-400 mt-1 italic">Maksimal file 2MB</p>
                </div>
              </div>

              <button type="submit" className="w-full bg-black text-white p-4 rounded-xl font-black text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-black/10">
                ARSIPKAN DATA SEKARANG <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapSurat;