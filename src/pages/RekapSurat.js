import React, { useState, useEffect } from 'react';
import { 
  Mail, Plus, Search, FileText, 
  Download, Trash2, 
  CalendarCheck, X, Image as ImageIcon, 
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
    noSurat: "",      
    perihal: "",      
    tanggal: "",      
    status: "Masuk",  
    fileBase64: null,
    fileName: "",
    fileType: "",
    isiManual: ""
  });

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
    document.getElementsByTagName('head')[0].appendChild(meta);
  }, []);

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

  // Fungsi Kapitalisasi: Hanya huruf pertama kalimat yang besar
  const autoFormatText = (str) => {
    if (!str) return "";
    const clean = str.toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
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
      status: activeTab === 'surat' ? "Masuk" : "Umum", 
      fileBase64: null, fileName: "", fileType: "", isiManual: "" 
    });
  };

  const handleViewFile = (item) => {
    if (item.fileBase64) {
      const win = window.open();
      if (item.fileType === 'pdf') {
        win.document.write(`<iframe src="${item.fileBase64}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        win.document.write(`<html><body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center;"><img src="${item.fileBase64}" style="max-width:100%; max-height:100vh;" /></body></html>`);
      }
    }
  };

  const currentData = activeTab === 'surat' ? suratList : absenList;
  const filteredData = currentData.filter(s => 
    s.noSurat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.perihal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-zinc-800 pb-20">
      
      <div className="flex bg-zinc-100 p-1 rounded-2xl w-fit border border-zinc-200 mx-auto sm:mx-0">
        <button onClick={() => { setActiveTab('surat'); resetForm(); }}
          className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'surat' ? 'bg-white shadow-sm text-black' : 'text-zinc-500'}`}>
          <Mail size={14}/> Arsip Surat
        </button>
        <button onClick={() => { setActiveTab('absen'); resetForm(); }}
          className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'absen' ? 'bg-white shadow-sm text-black' : 'text-zinc-500'}`}>
          <CalendarCheck size={14}/> Rekap Absensi
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black text-white rounded-[20px] shadow-xl">
            {activeTab === 'surat' ? <Mail size={24} /> : <CalendarCheck size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{activeTab === 'surat' ? 'Arsip Surat' : 'Rekap Absensi'}</h1>
            <p className="text-zinc-500 text-[10px] font-bold mt-0.5 uppercase tracking-widest">{currentData.length} Data Tersimpan</p>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-95 shadow-lg">
          <Plus size={18} /> Tambah Baru
        </button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 flex items-center gap-4 border-b border-zinc-50">
          <Search size={20} className="text-zinc-400" />
          <input type="text" placeholder={`Cari ${activeTab === 'surat' ? 'surat' : 'rekap'}...`} 
            className="bg-transparent outline-none text-base w-full font-semibold placeholder:text-zinc-300" 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] font-black text-zinc-400 bg-zinc-50/50">
                <th className="px-8 py-5">Perihal / Keterangan</th>
                <th className="px-6 py-5">Tanggal</th>
                <th className="px-6 py-5">Media</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-sm">
              {isLoading ? (
                <tr><td colSpan="4" className="py-20 text-center font-bold text-zinc-300">Sinkronisasi...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((s) => (
                  <tr key={s.id} className="group hover:bg-zinc-50/30 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{s.noSurat}</span>
                        <span className="font-bold text-zinc-800">{s.perihal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-semibold text-zinc-500">{s.tanggal}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        {s.fileType === 'pdf' && <FileText size={16} className="text-rose-500" />}
                        {s.fileType === 'image' && <ImageIcon size={16} className="text-blue-500" />}
                        <button onClick={() => handleViewFile(s)} className="text-[10px] font-black text-zinc-900 border-b-2 border-zinc-200 hover:border-black transition-all">
                          LIHAT
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => { if(window.confirm("Hapus data ini?")) deleteDoc(doc(db, activeTab === 'surat' ? "rekap_surat" : "rekap_absen", s.id)) }} 
                        className="p-3 text-zinc-200 hover:text-rose-500 transition-all active:scale-90"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="py-32 text-center text-zinc-300 font-bold">Belum ada data tersedia.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-t-[40px] sm:rounded-[40px] p-8 md:p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[92vh] border-t border-zinc-100">
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                  {activeTab === 'surat' ? 'Arsip Surat Baru' : 'Rekap Absensi Baru'}
                </h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Input data ke database internal</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2.5 bg-zinc-100 text-zinc-500 hover:bg-black hover:text-white rounded-full transition-all active:scale-90">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    {activeTab === 'surat' ? 'No. Surat' : 'Periode (Bulan/Tahun)'}
                  </label>
                  <input type="text" placeholder={activeTab === 'surat' ? "Contoh: 001/KARTA/2026" : "Contoh: Januari 2026"} 
                    className="w-full p-4.5 bg-zinc-50 border border-zinc-100 focus:border-black focus:bg-white rounded-2xl outline-none text-base font-bold transition-all" 
                    value={formData.noSurat} onChange={(e) => setFormData({...formData, noSurat: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    {activeTab === 'surat' ? 'Tanggal Surat' : 'Tanggal Upload'}
                  </label>
                  <input type="date" className="w-full p-4.5 bg-zinc-50 border border-zinc-100 focus:border-black focus:bg-white rounded-2xl outline-none text-base font-bold text-zinc-600 transition-all" 
                    value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  {activeTab === 'surat' ? 'Keterangan / Perihal' : 'Keterangan Tambahan'}
                </label>
                <input type="text" placeholder="..." 
                  className="w-full p-4.5 bg-zinc-50 border border-zinc-100 focus:border-black focus:bg-white rounded-2xl outline-none text-base font-semibold transition-all" 
                  value={formData.perihal} onChange={(e) => setFormData({...formData, perihal: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">File Dokumen</label>
                <div className="relative group">
                  <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`w-full p-8 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all ${
                    formData.fileName ? 'border-black bg-zinc-50' : 'border-zinc-200 bg-zinc-50 group-hover:border-zinc-400'
                  }`}>
                    <Download size={24} className={formData.fileName ? 'text-black' : 'text-zinc-300'} />
                    <div className="text-center">
                      <p className="text-[11px] font-black text-zinc-900">{formData.fileName || "Pilih File (PDF/Gambar)"}</p>
                      <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Maksimal 2MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-black text-white p-5 rounded-[28px] font-black text-xs tracking-widest shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-95 uppercase mt-4">
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