import React, { useState, useEffect, useMemo } from 'react';
import logoTarka from '../assets/logo-tarka.jpeg'; 
import { 
  Calendar, Plus, Trash2, 
  Mic, MicOff, Printer, Search, ArrowRight,
  FileText, History
} from 'lucide-react';
import { db } from '../firebaseConfig';
import { 
  collection, addDoc, onSnapshot, 
  query, deleteDoc, doc, orderBy 
} from 'firebase/firestore';

const Notulensi = () => {
  const [activeTab, setActiveTab] = useState('list'); 
  const [notulensi, setNotulensi] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    judul: '',
    tanggal: '',
    lokasi: '',
    hasil: ''
  });

  // Mencegah zoom otomatis di iPhone saat klik input
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
    document.getElementsByTagName('head')[0].appendChild(meta);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "notulensi"), orderBy("tanggal", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotulensi(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatAutoCase = (text) => {
    if (!text) return '';
    return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatSentenceCase = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = useMemo(() => {
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'id-ID';
    return rec;
  }, [SpeechRecognition]);

  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
      setFormData(prev => ({ ...prev, hasil: formatSentenceCase(transcript) }));
    };
    recognition.onerror = () => setIsListening(false);
  }, [recognition]);

  const toggleListen = () => {
    if (!recognition) return alert("Browser tidak mendukung fitur suara.");
    isListening ? recognition.stop() : recognition.start();
    setIsListening(!isListening);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.hasil) return alert("Judul dan Hasil Rapat harus diisi!");

    try {
      await addDoc(collection(db, "notulensi"), {
        ...formData,
        judul: formatAutoCase(formData.judul),
        lokasi: formatAutoCase(formData.lokasi),
        hasil: formatSentenceCase(formData.hasil),
        createdAt: new Date().toISOString()
      });

      // Reset Form
      setFormData({ judul: '', tanggal: '', lokasi: '', hasil: '' });
      if (isListening) recognition.stop();
      setIsListening(false);
      
      // Pindah ke tab list (Riwayat)
      setActiveTab('list');

      // Trigger event untuk memaksa re-render jika Dashboard pakai metode manual
      window.dispatchEvent(new Event('storage')); 
      
    } catch (error) {
      console.error("Error saving notulensi:", error);
      alert("Gagal menyimpan ke database.");
    }
  };

  const deleteData = async (id) => {
    if (window.confirm("Hapus notulensi ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, "notulensi", id));
        // Setelah hapus, Firebase onSnapshot akan otomatis update data
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Gagal menghapus data.");
      }
    }
  };

  const handlePrint = (item) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Notulensi - ${item.judul}</title>
          <style>
            @page { size: A4; margin: 25mm; }
            body { font-family: sans-serif; color: #18181b; line-height: 1.6; padding: 20px; }
            .kop { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 70px; height: 70px; border-radius: 10px; margin-right: 20px; }
            .kop-text h1 { margin: 0; font-size: 20px; }
            .kop-text p { margin: 0; font-size: 12px; color: #71717a; font-weight: bold; }
            .meta { margin-bottom: 30px; background: #f4f4f5; padding: 20px; border-radius: 10px; }
            .content { white-space: pre-wrap; font-size: 15px; }
          </style>
        </head>
        <body>
          <div class="kop">
            <img src="${logoTarka}" class="logo" />
            <div class="kop-text">
              <h1>KARANG TARUNA RW 18</h1>
              <p>SEKRETARIAT DIGITAL PERMATA HIJAU</p>
            </div>
          </div>
          <h2 style="text-align:center; text-transform: uppercase;">Notulensi Rapat</h2>
          <div class="meta">
            <p><b>Judul:</b> ${item.judul}</p>
            <p><b>Tanggal:</b> ${item.tanggal}</p>
            <p><b>Lokasi:</b> ${item.lokasi}</p>
          </div>
          <div class="content">${item.hasil}</div>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredData = notulensi.filter(n => 
    n.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.hasil.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 p-4 md:p-10 font-sans pb-24">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <img src={logoTarka} alt="Logo" className="w-14 h-14 rounded-2xl shadow-sm object-cover" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sekretariat Digital</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                {activeTab === 'list' ? 'Arsip Notulensi' : 'Buat Notulensi'}
              </h1>
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex bg-zinc-200/50 p-1.5 rounded-2xl border border-zinc-200 w-full md:w-auto">
            <button onClick={() => setActiveTab('list')}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black transition-all uppercase flex items-center justify-center gap-2 ${activeTab === 'list' ? 'bg-white shadow-md text-black' : 'text-zinc-500 hover:text-zinc-700'}`}>
              <History size={16}/> Riwayat
            </button>
            <button onClick={() => setActiveTab('form')}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black transition-all uppercase flex items-center justify-center gap-2 ${activeTab === 'form' ? 'bg-white shadow-md text-black' : 'text-zinc-500 hover:text-zinc-700'}`}>
              <Plus size={16}/> Baru
            </button>
          </div>
        </div>

        {activeTab === 'list' ? (
          <div className="animate-in fade-in duration-500">
            {/* SEARCH BAR */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari judul agenda atau hasil rapat..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl text-base shadow-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 text-xs uppercase tracking-widest font-black text-zinc-400 border-b border-zinc-100">
                      <th className="px-6 py-5">Detail Pertemuan</th>
                      <th className="px-6 py-5 hidden md:table-cell">Ringkasan Pembahasan</th>
                      <th className="px-6 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {isLoading ? (
                       <tr><td colSpan="3" className="px-6 py-10 text-center text-zinc-400 font-medium">Memuat data...</td></tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-sm md:text-base font-bold text-zinc-800 uppercase leading-tight">{item.judul}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-zinc-500 font-bold flex items-center gap-1 uppercase bg-zinc-100 px-2 py-0.5 rounded">
                                  <Calendar size={12}/> {item.tanggal}
                                </span>
                              </div>
                            </div>
                            {/* Mobile only preview */}
                            <p className="mt-2 text-sm text-zinc-500 line-clamp-1 md:hidden italic">"{item.hasil}"</p>
                          </td>
                          <td className="px-6 py-5 hidden md:table-cell">
                            <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed italic max-w-md">
                              "{item.hasil}"
                            </p>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handlePrint(item)} 
                                className="p-3 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm">
                                <Printer size={18} />
                              </button>
                              <button onClick={() => deleteData(item.id)} 
                                className="p-3 text-zinc-300 hover:text-rose-500 transition-all hover:bg-rose-50 rounded-xl">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3" className="px-6 py-10 text-center text-zinc-400 font-medium">Tidak ada notulensi ditemukan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* FORM SECTION */
          <div className="max-w-3xl mx-auto bg-white p-6 md:p-12 rounded-[2.5rem] border border-zinc-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                <FileText size={24}/>
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest leading-none">Formulir Rapat</h2>
                <p className="text-xs text-zinc-400 font-bold uppercase mt-1">Dokumentasikan hasil keputusan</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-zinc-500 ml-1">Judul Agenda</label>
                <input 
                  required placeholder="Contoh: Rapat Kerja Bulanan" 
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-base font-bold uppercase outline-none focus:border-black focus:bg-white transition-all shadow-sm"
                  value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-500 ml-1">Tanggal</label>
                  <input 
                    required type="date" 
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-base font-bold outline-none focus:border-black focus:bg-white transition-all shadow-sm"
                    value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-500 ml-1">Lokasi</label>
                  <input 
                    required placeholder="Contoh: Balai Warga" 
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-base font-bold uppercase outline-none focus:border-black focus:bg-white transition-all shadow-sm"
                    value={formData.lokasi} onChange={(e) => setFormData({...formData, lokasi: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-xs font-black uppercase text-zinc-500 ml-1">Hasil & Keputusan Rapat</label>
                <textarea 
                  required rows="8" placeholder="Tuliskan detail pembahasan dan poin-poin keputusan..." 
                  className="w-full bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] text-base font-medium leading-relaxed outline-none focus:border-black focus:bg-white transition-all shadow-sm"
                  value={formData.hasil} onChange={(e) => setFormData({...formData, hasil: e.target.value})} 
                />
                
                {/* Voice Button - Large & Easy to Tap */}
                <button 
                  type="button" onClick={toggleListen}
                  className={`absolute right-4 bottom-4 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-black text-white hover:bg-zinc-800'}`}
                >
                  {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 shadow-lg shadow-black/10 hover:bg-zinc-800 transition-all active:scale-[0.98]">
                  SIMPAN DATA <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notulensi;