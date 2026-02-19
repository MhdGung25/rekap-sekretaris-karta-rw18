import React, { useState, useEffect } from 'react';
import { 
  Mail, Plus, Search, X, FileText, 
  Download, Trash2, Calendar, Hash, ArrowUpRight, ArrowDownLeft, Eye 
} from 'lucide-react';
// Pastikan file firebaseConfig.js sudah benar konfigurasinya
import { db } from '../firebaseConfig'; 
import { 
  collection, addDoc, onSnapshot, 
  query, deleteDoc, doc, orderBy 
} from 'firebase/firestore';

const RekapSurat = () => {
  const [suratList, setSuratList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    noSurat: "",
    perihal: "",
    tanggal: "",
    status: "Masuk",
    fileBase64: null,
    fileName: ""
  });

  // 1. LOAD DATA REAL-TIME DARI CLOUD
  useEffect(() => {
    const q = query(collection(db, "rekap_surat"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSuratList(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const capitalize = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Hanya file PDF yang diperbolehkan!");
        return;
      }
      // Firestore Doc Limit is 1MB. We cap at 800KB for safety.
      if (file.size > 800000) { 
        alert("File Terlalu Besar! Gunakan PDF di bawah 800KB agar database tetap cepat.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fileBase64: reader.result, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. SIMPAN DATA KE FIREBASE
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "rekap_surat"), {
        noSurat: formData.noSurat.toUpperCase(),
        perihal: capitalize(formData.perihal),
        tanggal: formData.tanggal,
        status: formData.status,
        fileBase64: formData.fileBase64,
        fileName: formData.fileName,
        createdAt: new Date().toISOString()
      });

      setShowModal(false);
      setFormData({ noSurat: "", perihal: "", tanggal: "", status: "Masuk", fileBase64: null, fileName: "" });
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("Koneksi gagal. Cek internet atau kuota database Firebase Anda.");
    }
  };

  // 3. HAPUS DATA DARI FIREBASE
  const deleteSurat = async (id) => {
    if (window.confirm("Hapus arsip ini secara permanen dari server?")) {
      try {
        await deleteDoc(doc(db, "rekap_surat", id));
      } catch (error) {
        console.error("Delete Error:", error);
      }
    }
  };

  const filteredSurat = suratList.filter(s => 
    s.noSurat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.perihal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black text-white rounded-2xl shadow-2xl shrink-0">
            <Mail size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">Arsip Surat</h1>
            <p className="text-zinc-500 text-[10px] md:text-xs font-bold mt-1 uppercase tracking-[0.2em]">
              Database Cloud • {suratList.length} Dokumen Tersimpan
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-black/10"
        >
          <Plus size={18} /> Tambah Surat
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white border border-zinc-200 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm transition-all focus-within:border-black focus-within:ring-4 focus-within:ring-black/5">
        <div className="p-4 md:p-6 flex items-center gap-4">
          <Search size={20} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nomor surat atau perihal..." 
            className="bg-transparent outline-none text-sm w-full font-bold text-zinc-700 placeholder:text-zinc-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 border-b border-zinc-100 bg-zinc-50/30">
                <th className="px-8 py-5">Identitas Surat</th>
                <th className="px-6 py-5">Tanggal</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5">File PDF</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                <tr><td colSpan="5" className="py-20 text-center text-xs font-black text-zinc-300 animate-pulse">MENGHUBUNGKAN KE SERVER...</td></tr>
              ) : filteredSurat.length > 0 ? (
                filteredSurat.map((s) => (
                  <tr key={s.id} className="group hover:bg-zinc-50/80 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{s.noSurat}</span>
                        <span className="text-sm font-bold text-zinc-800 leading-tight">{s.perihal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-zinc-500">{s.tanggal}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        s.status === 'Masuk' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.status === 'Masuk' ? <ArrowDownLeft size={10}/> : <ArrowUpRight size={10}/>}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {s.fileBase64 ? (
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => {
                              const win = window.open();
                              win.document.write(`<iframe src="${s.fileBase64}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                            }}
                            className="p-2 bg-zinc-100 rounded-lg text-zinc-600 hover:bg-black hover:text-white transition-all shadow-sm"
                            title="Pratinjau PDF"
                          >
                            <Eye size={16} />
                          </button>
                          <a 
                            href={s.fileBase64} 
                            download={`Arsip_${s.noSurat}.pdf`}
                            className="flex items-center gap-2 text-[10px] font-black text-red-500 hover:bg-red-50 pr-3 py-1 rounded-lg transition-all"
                          >
                            <FileText size={18} /> DOWNLOAD
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-200">
                          <FileText size={18} />
                          <span className="text-[10px] font-black italic uppercase">Kosong</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => deleteSurat(s.id)}
                        className="p-3 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-32 text-center">
                    <div className="flex flex-col items-center opacity-10">
                      <Mail size={64} strokeWidth={1} />
                      <p className="text-xs font-black uppercase tracking-[0.5em] mt-6 text-black">Data Nihil</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="bg-white w-full max-w-xl rounded-t-[40px] sm:rounded-[40px] p-8 md:p-12 relative z-10 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-10 sticky top-0 bg-white z-20 pb-4 border-b border-zinc-100">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Arsip Baru</h2>
                <p className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase mt-1">Input data ke Cloud Storage</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-zinc-100 hover:bg-red-500 hover:text-white rounded-full transition-all text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-2 gap-3">
                {['Masuk', 'Keluar'].map((type) => (
                  <button
                    key={type} type="button"
                    onClick={() => setFormData({...formData, status: type})}
                    className={`py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      formData.status === type ? 'bg-black text-white border-black shadow-2xl' : 'bg-zinc-50 text-zinc-400 border-zinc-100 hover:border-zinc-200'
                    }`}
                  >
                    Surat {type}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                    <Hash size={12}/> Nomor Surat
                  </label>
                  <input required type="text" placeholder="CONTOH: 001/KT/2026" className="w-full p-5 bg-zinc-50 border-2 border-zinc-100 rounded-3xl outline-none focus:border-black font-bold text-sm uppercase transition-all" 
                    value={formData.noSurat} onChange={(e) => setFormData({...formData, noSurat: e.target.value})} />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                    <Calendar size={12}/> Tanggal
                  </label>
                  <input required type="date" className="w-full p-5 bg-zinc-50 border-2 border-zinc-100 rounded-3xl outline-none focus:border-black font-bold text-sm transition-all" 
                    value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Perihal / Keterangan</label>
                <textarea required rows="2" placeholder="Masukkan perihal surat secara singkat..." className="w-full p-5 bg-zinc-50 border-2 border-zinc-100 rounded-3xl outline-none focus:border-black font-bold text-sm transition-all resize-none" 
                  value={formData.perihal} onChange={(e) => setFormData({...formData, perihal: e.target.value})} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Lampiran PDF</label>
                  {formData.fileName && <span className="text-[10px] font-black text-emerald-600 truncate max-w-[200px]">{formData.fileName}</span>}
                </div>
                <div className="relative group">
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full p-8 border-2 border-dashed border-zinc-200 group-hover:border-black rounded-[32px] flex flex-col items-center justify-center gap-3 bg-zinc-50/50 transition-all text-center">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-zinc-400 group-hover:text-black transition-colors">
                      <Download size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tighter">Pilih File PDF</p>
                      <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase">Maksimal Ukuran 800KB</p>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-black text-white p-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-[10px] mt-4 hover:bg-zinc-800 transition-all shadow-2xl active:scale-[0.98] shadow-black/20">
                Simpan Ke Database Cloud
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapSurat;