import React, { useState, useEffect } from 'react';
import { 
  Mail, Plus, Search, X, FileText, 
  Download, Trash2, Calendar, Hash, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';

const RekapSurat = () => {
  const [suratList, setSuratList] = useState(() => {
    const saved = localStorage.getItem('db_rekap_surat');
    return saved ? JSON.parse(saved) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    noSurat: "",
    perihal: "",
    tanggal: "",
    status: "Masuk",
    fileBase64: null,
    fileName: ""
  });

  useEffect(() => {
    localStorage.setItem('db_rekap_surat', JSON.stringify(suratList));
  }, [suratList]);

  const capitalize = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Hanya file PDF yang diperbolehkan!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fileBase64: reader.result, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newSurat = {
      id: Date.now(),
      ...formData,
      perihal: capitalize(formData.perihal), 
      noSurat: formData.noSurat.toUpperCase()
    };

    setSuratList([newSurat, ...suratList]);
    setShowModal(false);
    setFormData({ noSurat: "", perihal: "", tanggal: "", status: "Masuk", fileBase64: null, fileName: "" });
  };

  const deleteSurat = (id) => {
    if (window.confirm("Hapus arsip surat ini secara permanen?")) {
      setSuratList(suratList.filter(s => s.id !== id));
    }
  };

  const filteredSurat = suratList.filter(s => 
    s.noSurat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.perihal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER SECTION - Responsive Stack on Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black text-white rounded-2xl shadow-xl shrink-0">
            <Mail size={28} />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none truncate">Rekap Surat</h1>
            <p className="text-zinc-500 text-xs md:text-sm font-medium mt-1 uppercase tracking-wider">
              Arsip Digital • {suratList.length} Dokumen
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} /> Tambah Surat
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white border border-zinc-200 rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
          <Search size={20} className="text-zinc-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Cari nomor surat atau perihal..." 
            className="bg-transparent outline-none text-sm w-full font-bold text-zinc-700 placeholder:text-zinc-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE CONTAINER - Horizontal Scroll for Mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] font-black text-zinc-400 border-b border-zinc-100 bg-white">
                <th className="px-6 md:px-8 py-5">Informasi Dokumen</th>
                <th className="px-6 py-5">Tanggal Terbit</th>
                <th className="px-6 py-5 text-center">Tipe</th>
                <th className="px-6 py-5">Dokumen</th>
                <th className="px-6 py-5 text-right px-8">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredSurat.length > 0 ? (
                filteredSurat.map((s) => (
                  <tr key={s.id} className="group hover:bg-zinc-50/50 transition-all">
                    <td className="px-6 md:px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-400 uppercase leading-none mb-1">{s.noSurat}</span>
                        <span className="text-sm font-bold text-zinc-800">{s.perihal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-500">{s.tanggal}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        s.status === 'Masuk' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.status === 'Masuk' ? <ArrowDownLeft size={10}/> : <ArrowUpRight size={10}/>}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {s.fileBase64 ? (
                        <a 
                          href={s.fileBase64} 
                          download={`Arsip_${s.noSurat}.pdf`}
                          className="flex items-center gap-2 text-xs font-black text-black hover:text-red-600 transition-colors"
                        >
                          <FileText size={16} className="text-red-500" /> PDF
                        </a>
                      ) : (
                        <span className="text-[10px] font-black text-zinc-300 uppercase italic">Kosong</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right px-8">
                      <button 
                        onClick={() => deleteSurat(s.id)}
                        className="p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Mail size={48} />
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] mt-4 text-black">Tidak Ada Data</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT - Full Screen on Small Mobile, Centered on Laptop */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          
          <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 md:p-10 relative z-10 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-20 pb-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Tambah Arsip</h2>
              <button onClick={() => setShowModal(false)} className="p-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Kategori Surat</label>
                <div className="flex gap-2 mt-2">
                  {['Masuk', 'Keluar'].map((type) => (
                    <button
                      key={type} type="button"
                      onClick={() => setFormData({...formData, status: type})}
                      className={`flex-1 py-4 rounded-2xl text-xs font-bold border-2 transition-all ${
                        formData.status === type ? 'bg-black text-white border-black shadow-lg' : 'bg-zinc-50 text-zinc-400 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      Surat {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-1">
                    <Hash size={10}/> Nomor Surat
                  </label>
                  <input required type="text" placeholder="001/..." className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 focus:border-black font-bold text-sm uppercase transition-all" 
                    value={formData.noSurat} onChange={(e) => setFormData({...formData, noSurat: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-1">
                    <Calendar size={10}/> Tanggal
                  </label>
                  <input required type="date" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 focus:border-black font-bold text-sm transition-all" 
                    value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Perihal / Keterangan</label>
                <input required type="text" placeholder="Masukkan perihal..." className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 focus:border-black font-bold text-sm transition-all" 
                  value={formData.perihal} onChange={(e) => setFormData({...formData, perihal: capitalize(e.target.value)})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center justify-between">
                  <span>Lampiran PDF (Opsional)</span>
                  {formData.fileName && <span className="text-green-600 font-bold max-w-[150px] truncate">{formData.fileName}</span>}
                </label>
                <div className="relative group">
                  <input 
                    type="file" accept=".pdf" onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full p-6 border-2 border-dashed border-zinc-200 group-hover:border-zinc-400 rounded-2xl flex flex-col items-center justify-center gap-2 bg-zinc-50 transition-all text-center">
                    <Download size={24} className="text-zinc-400 group-hover:text-black transition-colors" />
                    <span className="text-xs font-bold text-zinc-400">Klik atau seret file PDF</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 hover:bg-zinc-800 transition-all shadow-xl active:scale-95 shadow-black/20">
                Simpan Ke Arsip Digital
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapSurat;