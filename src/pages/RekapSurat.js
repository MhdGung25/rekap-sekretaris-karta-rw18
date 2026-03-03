import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, FileText, 
  Download, Trash2, X, 
  ArrowRight, Image as ImageIcon,
  Calendar, MapPin, Loader2,
  ArrowUpRight, ArrowDownLeft
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
    jenisSurat: "Masuk", 
    fileBase64: null, fileName: "", fileType: ""
  });

  useEffect(() => {
    setIsLoading(true);
    const qSurat = query(collection(db, "rekap_surat"), orderBy("createdAt", "desc"));
    const unsubSurat = onSnapshot(qSurat, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuratList(data);
      if (activeTab === 'surat') setIsLoading(false);
    });

    const qAbsen = query(collection(db, "rekap_absen"), orderBy("createdAt", "desc"));
    const unsubAbsen = onSnapshot(qAbsen, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAbsenList(data);
      if (activeTab === 'absen') setIsLoading(false);
    });

    return () => { unsubSurat(); unsubAbsen(); };
  }, [activeTab]);

  const handleSave = async (e) => {
    e.preventDefault();
    const collectionName = activeTab === 'surat' ? "rekap_surat" : "rekap_absen";
    
    try {
      await addDoc(collection(db, collectionName), {
        ...formData,
        noSurat: activeTab === 'surat' ? formData.noSurat.toUpperCase() : "",
        perihal: formData.perihal, // Hanya kapital di awal dari input
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert("Gagal menyimpan data.");
    }
  };

  const resetForm = () => {
    setFormData({ noSurat: "", perihal: "", tanggal: "", jenisSurat: "Masuk", fileBase64: null, fileName: "", fileType: "" });
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
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-10 font-sans">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">SISTEM ARSIP</span>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
              REKAP SURAT & ABSENSI
            </h1>
          </div>

          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">
            <button onClick={() => { setActiveTab('surat'); resetForm(); }}
              className={`flex-1 md:flex-none px-6 py-2 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider ${activeTab === 'surat' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
              LOG SURAT
            </button>
            <button onClick={() => { setActiveTab('absen'); resetForm(); }}
              className={`flex-1 md:flex-none px-6 py-2 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider ${activeTab === 'absen' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
              ABSENSI
            </button>
          </div>
        </div>

        {/* --- TOOLBAR --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={activeTab === 'surat' ? "Cari nomor surat atau perihal..." : "Cari nama agenda..."}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <Plus size={16} /> TAMBAH DATA
          </button>
        </div>

        {/* --- TABLE AREA --- */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] uppercase tracking-[0.15em] font-bold text-slate-400 border-b border-slate-100">
                  {activeTab === 'surat' ? (
                    <>
                      <th className="px-6 py-4 w-40">TIPE DOKUMEN</th>
                      <th className="px-6 py-4">KETERANGAN SURAT</th>
                    </>
                  ) : (
                    <th className="px-6 py-4">AGENDA KEGIATAN</th>
                  )}
                  <th className="px-6 py-4 w-44">TANGGAL</th>
                  <th className="px-6 py-4 text-center w-36">DOKUMEN</th>
                  <th className="px-6 py-4 text-right w-20">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan="5" className="px-6 py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={24} /></td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400 text-[10px] uppercase tracking-widest">Tidak ada data ditemukan</td></tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                      {activeTab === 'surat' && (
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${
                            item.jenisSurat === 'Masuk' 
                            ? 'bg-white border-slate-200 text-slate-600' 
                            : 'bg-slate-900 border-slate-900 text-white'
                          }`}>
                            {item.jenisSurat === 'Masuk' ? <ArrowDownLeft size={12}/> : <ArrowUpRight size={12}/>}
                            {item.jenisSurat}
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          {activeTab === 'surat' && <span className="text-[10px] font-mono text-slate-400 mb-1">{item.noSurat}</span>}
                          <div className="flex items-center gap-2">
                            {activeTab === 'absen' && <MapPin size={12} className="text-slate-300" />}
                            <span className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
                              {item.perihal.charAt(0).toUpperCase() + item.perihal.slice(1)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <Calendar size={14} className="text-slate-300" />
                          {item.tanggal}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        {item.fileBase64 ? (
                          <button onClick={() => handleViewFile(item)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-slate-600 text-[9px] font-bold uppercase hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                            {item.fileType === 'pdf' ? <FileText size={12}/> : <ImageIcon size={12}/>} Lihat file
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-300 font-medium uppercase italic">Tanpa berkas</span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button onClick={() => { if(window.confirm("Hapus data ini secara permanen?")) deleteDoc(doc(db, activeTab === 'surat' ? "rekap_surat" : "rekap_absen", item.id)) }} 
                          className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL INPUT --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-5 bg-slate-900 flex justify-between items-center text-white">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">INPUT DATA {activeTab === 'surat' ? 'SURAT' : 'ABSENSI'}</h2>
              <button onClick={() => setShowModal(false)} className="hover:rotate-90 transition-transform"><X size={20}/></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {activeTab === 'surat' && (
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">TIPE DOKUMEN</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Masuk', 'Keluar'].map(type => (
                      <button key={type} type="button" onClick={() => setFormData({...formData, jenisSurat: type})}
                        className={`py-3 text-[10px] font-bold rounded-xl border transition-all uppercase ${formData.jenisSurat === type ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">{activeTab === 'surat' ? 'PERIHAL / ISI RINGKAS' : 'NAMA AGENDA'}</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 focus:bg-white outline-none transition-all placeholder:text-slate-300" 
                  placeholder="Contoh: Rapat koordinasi"
                  value={formData.perihal} onChange={(e) => setFormData({...formData, perihal: e.target.value})} required />
              </div>

              {activeTab === 'surat' && (
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">NOMOR SURAT</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:border-slate-900 focus:bg-white outline-none transition-all placeholder:text-slate-300" 
                    placeholder="001/RW18/III/2026"
                    value={formData.noSurat} onChange={(e) => setFormData({...formData, noSurat: e.target.value})} required />
                </div>
              )}
              
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">TANGGAL KEJADIAN</label>
                <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-slate-900 focus:bg-white outline-none transition-all" 
                  value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} required />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">UNGGAH BERKAS</label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-slate-900/20 transition-all cursor-pointer group">
                  <input type="file" accept=".pdf,image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({...formData, fileBase64: reader.result, fileName: file.name, fileType: file.type.includes('pdf') ? 'pdf' : 'image'});
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <Download size={24} className="text-slate-300 group-hover:text-slate-900 mb-2 transition-colors" />
                  <p className="text-[9px] font-bold text-slate-400 group-hover:text-slate-900 text-center uppercase truncate w-full px-2">
                    {formData.fileName || "Pilih PDF atau gambar"}
                  </p>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl">
                SIMPAN DATA <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapSurat;