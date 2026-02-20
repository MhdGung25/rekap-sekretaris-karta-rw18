import React, { useState, useEffect } from 'react';
import { 
  Mail, Plus, Search, FileText, 
  Download, Trash2, 
  CalendarCheck, X, Image as ImageIcon, Type
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
  
  // State Form yang lebih dinamis
  const [formData, setFormData] = useState({
    noSurat: "",      // Di Absen jadi 'Periode'
    perihal: "",      // Di Absen jadi 'Keterangan Tambahan'
    tanggal: "",      // Tanggal Surat / Tanggal Upload
    status: "Masuk",  // Masuk/Keluar untuk Surat, Anggota/Pengurus untuk Absen
    fileBase64: null,
    fileName: "",
    fileType: "",
    isiManual: ""
  });

  useEffect(() => {
    setIsLoading(true);
    const qSurat = query(collection(db, "rekap_surat"), orderBy("createdAt", "desc"));
    const unsubSurat = onSnapshot(qSurat, (snapshot) => {
      setSuratList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      if (activeTab === 'surat') setIsLoading(false);
    });

    const qAbsen = query(collection(db, "rekap_absen"), orderBy("createdAt", "desc"));
    const unsubAbsen = onSnapshot(qAbsen, (snapshot) => {
      setAbsenList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      if (activeTab === 'absen') setIsLoading(false);
    });

    return () => { unsubSurat(); unsubAbsen(); };
  }, [activeTab]);

  const autoFormatText = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isPdf = file.type === "application/pdf";
      const isImg = file.type.startsWith("image/");
      if (!isPdf && !isImg) { alert("Hanya file PDF atau Gambar!"); return; }
      if (file.size > 2000000) { alert("File maksimal 2MB"); return; }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ 
          ...formData, 
          fileBase64: reader.result, 
          fileName: file.name,
          fileType: isPdf ? 'pdf' : 'image'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const collectionName = activeTab === 'surat' ? "rekap_surat" : "rekap_absen";
    
    try {
      await addDoc(collection(db, collectionName), {
        ...formData,
        noSurat: formData.noSurat.toUpperCase(),
        perihal: autoFormatText(formData.perihal),
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert("Gagal menyimpan.");
    }
  };

  const resetForm = () => {
    setFormData({ 
      noSurat: "", perihal: "", tanggal: "", 
      status: activeTab === 'surat' ? "Masuk" : "Anggota", 
      fileBase64: null, fileName: "", fileType: "", isiManual: "" 
    });
  };

  const handleViewFile = (item) => {
    const win = window.open();
    if (item.fileType === 'pdf') {
      win.document.write(`<iframe src="${item.fileBase64}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`);
    } else {
      win.document.write(`<html><body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center;"><img src="${item.fileBase64}" style="max-width:100%; max-height:100vh;" /></body></html>`);
    }
  };

  const currentData = activeTab === 'surat' ? suratList : absenList;
  const filteredData = currentData.filter(s => 
    s.noSurat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.perihal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-zinc-800">
      
      {/* TAB SELECTOR */}
      <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-fit border border-zinc-200">
        <button onClick={() => { setActiveTab('surat'); resetForm(); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'surat' ? 'bg-white shadow-md text-black' : 'text-zinc-500'}`}>
          <Mail size={14}/> Arsip Surat
        </button>
        <button onClick={() => { setActiveTab('absen'); resetForm(); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'absen' ? 'bg-white shadow-md text-black' : 'text-zinc-500'}`}>
          <CalendarCheck size={14}/> Rekap Absensi
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black text-white rounded-2xl shadow-xl">
            {activeTab === 'surat' ? <Mail size={28} /> : <CalendarCheck size={28} />}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">{activeTab === 'surat' ? 'Arsip Surat' : 'Rekap Absensi'}</h1>
            <p className="text-zinc-500 text-xs font-medium mt-1 uppercase tracking-wider">{currentData.length} Data Tersimpan</p>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg">
          <Plus size={18} /> Tambah Baru
        </button>
      </div>

      {/* SEARCH & TABLE */}
      <div className="bg-white border border-zinc-100 rounded-[28px] overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 flex items-center gap-4 border-b border-zinc-50">
          <Search size={20} className="text-zinc-400" />
          <input type="text" placeholder={`Cari ${activeTab === 'surat' ? 'surat' : 'rekap'}...`} className="bg-transparent outline-none text-sm w-full font-semibold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 bg-zinc-50/30">
                <th className="px-8 py-5">{activeTab === 'surat' ? 'Nomor Surat' : 'Periode'}</th>
                <th className="px-6 py-5">Tanggal</th>
                <th className="px-6 py-5 text-center">Kategori</th>
                <th className="px-6 py-5">File</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                <tr><td colSpan="5" className="py-20 text-center text-sm font-bold text-zinc-300">Sinkronisasi...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((s) => (
                  <tr key={s.id} className="group hover:bg-zinc-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">{s.noSurat}</span>
                        <span className="text-sm font-bold text-zinc-800">{s.perihal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-semibold text-zinc-500">{s.tanggal}</td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold ${
                        (s.status === 'Masuk' || s.status === 'Pengurus') ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      {s.fileBase64 ? (
                        <button onClick={() => handleViewFile(s)} className="flex items-center gap-2 text-[11px] font-bold text-zinc-800 hover:underline">
                          {s.fileType === 'pdf' ? <FileText size={14} className="text-rose-500"/> : <ImageIcon size={14} className="text-blue-500"/>}
                          LIHAT FILE
                        </button>
                      ) : <span className="text-[10px] text-zinc-300 font-bold">TIDAK ADA FILE</span>}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => { if(window.confirm("Hapus?")) deleteDoc(doc(db, activeTab === 'surat' ? "rekap_surat" : "rekap_absen", s.id)) }} 
                        className="p-3 text-zinc-200 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="py-32 text-center text-zinc-300 font-bold text-sm">Belum ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (LOGIKA TERPISAH) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-t-[32px] sm:rounded-[40px] p-8 md:p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[95vh]">
            
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                {activeTab === 'surat' ? 'Tambah Arsip Surat' : 'Tambah Rekap Absensi'}
               </h2>
               <button onClick={() => setShowModal(false)} className="p-2 bg-zinc-100 text-zinc-500 hover:bg-black hover:text-white rounded-full transition-all">
                 <X size={20} />
               </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Selector Kategori (Masuk/Keluar vs Anggota/Pengurus) */}
              <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
                {(activeTab === 'surat' ? ['Masuk', 'Keluar'] : ['Anggota', 'Pengurus']).map((type) => (
                  <button key={type} type="button" onClick={() => setFormData({...formData, status: type})}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all ${formData.status === type ? 'bg-white text-black shadow-sm' : 'text-zinc-400'}`}>
                    {type} 
                  </button>
                ))}
              </div>

              {/* Input Baris 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
                    {activeTab === 'surat' ? 'No. Surat' : 'Periode (Bulan/Tahun)'}
                  </label>
                  <input type="text" placeholder={activeTab === 'surat' ? "..." : "JANUARI 2026"} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-200 font-bold text-sm" 
                    value={formData.noSurat} onChange={(e) => setFormData({...formData, noSurat: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
                    {activeTab === 'surat' ? 'Tanggal Surat' : 'Tanggal Upload'}
                  </label>
                  <input type="date" className="w-full p-4 bg-zinc-50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-200 font-bold text-sm text-zinc-500" 
                    value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} required />
                </div>
              </div>

              {/* Keterangan */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
                  {activeTab === 'surat' ? 'Keterangan / Perihal' : 'Keterangan Tambahan'}
                </label>
                <input type="text" placeholder="..." className="w-full p-4 bg-zinc-50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-200 font-semibold text-sm" 
                  value={formData.perihal} onChange={(e) => setFormData({...formData, perihal: e.target.value})} />
              </div>

              {/* Upload File */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
                  {activeTab === 'surat' ? 'File PDF / Foto' : 'File Absen (PDF)'}
                </label>
                <div className="relative group">
                  <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`w-full p-6 border-2 border-dashed rounded-[28px] flex flex-col items-center justify-center gap-2 transition-all ${formData.fileName ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-zinc-50'}`}>
                    <Download size={20} className={formData.fileName ? 'text-black' : 'text-zinc-400'} />
                    <p className="text-[11px] font-bold text-zinc-600">{formData.fileName || (activeTab === 'surat' ? "Pilih File" : "Pilih File PDF")}</p>
                  </div>
                </div>
              </div>

              {/* Catatan Manual (Hanya untuk Surat) */}
              {activeTab === 'surat' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Atau Ketik Manual (Isi Surat)</label>
                  <textarea rows="3" placeholder="Ketik ringkasan isi surat di sini..." className="w-full p-4 bg-zinc-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-zinc-200 font-medium text-sm text-zinc-700 resize-none" 
                    value={formData.isiManual} onChange={(e) => setFormData({...formData, isiManual: e.target.value})} />
                </div>
              )}

              <button type="submit" className="w-full bg-black text-white p-5 rounded-[24px] font-bold text-sm shadow-xl hover:bg-zinc-800 transition-all active:scale-95">
                Simpan ke Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapSurat;