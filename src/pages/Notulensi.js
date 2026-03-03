import React, { useState, useEffect, useMemo } from 'react';
import logoTarka from '../assets/logo-tarka.jpeg'; 
import { 
  Calendar, Plus, Trash2, Mic, MicOff, Printer, Search, 
  ArrowRight, FileText, History, Bell, MapPin, Loader2
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
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    judul: '',
    tanggal: '',
    lokasi: '',
    hasil: ''
  });

  // Mencegah zoom otomatis di mobile
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewportnetwork"]');
    if (meta) meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
  }, []);

  // Fetch Data dari Firebase
  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "notulensi"), orderBy("tanggal", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotulensi(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatAutoCase = (text) => {
    if (!text) return '';
    return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatSentenceCase = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  // Speech Recognition Setup
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
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.hasil) return alert("Judul dan hasil rapat harus diisi!");

    try {
      await addDoc(collection(db, "notulensi"), {
        ...formData,
        judul: formatAutoCase(formData.judul),
        lokasi: formatAutoCase(formData.lokasi),
        hasil: formatSentenceCase(formData.hasil),
        createdAt: new Date().toISOString()
      });

      setFormData({ judul: '', tanggal: '', lokasi: '', hasil: '' });
      if (isListening) recognition.stop();
      setIsListening(false);
      setActiveTab('list');
      showToast("Notulensi berhasil disimpan");
      window.dispatchEvent(new Event('storage')); 
    } catch (error) {
      showToast("Gagal menyimpan data");
    }
  };

  const deleteData = async (id) => {
    if (window.confirm("Hapus notulensi ini secara permanen?")) {
      try {
        await deleteDoc(doc(db, "notulensi", id));
        showToast("Data telah dihapus");
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        showToast("Gagal menghapus data");
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
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; padding: 20px; }
            .header { border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; align-items: center; gap: 20px; }
            .logo { width: 60px; height: 60px; border-radius: 12px; }
            .title-area h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: -0.02em; }
            .title-area p { margin: 0; font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 0.1em; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 20px; border-radius: 15px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            .meta-item b { display: block; font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
            .content { white-space: pre-wrap; font-size: 14px; text-align: justify; color: #334155; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoTarka}" class="logo" />
            <div class="title-area">
              <p>KARANG TARUNA RW 18</p>
              <h1>NOTULENSI HASIL RAPAT</h1>
            </div>
          </div>
          <div class="meta-grid">
            <div class="meta-item"><b>AGENDA PERTEMUAN</b>${item.judul}</div>
            <div class="meta-item"><b>TANGGAL PELAKSANAAN</b>${item.tanggal}</div>
            <div class="meta-item"><b>LOKASI / TEMPAT</b>${item.lokasi}</div>
            <div class="meta-item"><b>ID DOKUMEN</b>#${item.id.slice(-6).toUpperCase()}</div>
          </div>
          <div class="content">
            <h3 style="text-transform:uppercase; font-size: 12px; letter-spacing: 0.1em; border-left: 4px solid #0f172a; padding-left: 10px; margin-bottom: 15px;">HASIL & KEPUTUSAN:</h3>
            ${item.hasil}
          </div>
          <div class="footer">Dokumen ini dihasilkan secara digital melalui Sekretariat Digital RW 18 - ${new Date().toLocaleDateString('id-ID')}</div>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredData = notulensi.filter(n => 
    (n.judul && n.judul.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (n.hasil && n.hasil.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-24 font-sans">
      
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
                <img src={logoTarka} alt="Logo" className="w-14 h-14 rounded-2xl shadow-sm object-cover border border-white" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-1">SEKRETARIAT DIGITAL</span>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                {activeTab === 'list' ? 'ARSIP NOTULENSI' : 'NOTULENSI BARU'}
              </h1>
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase flex items-center justify-center gap-2 tracking-widest ${
                activeTab === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <History size={14}/> RIWAYAT
            </button>
            <button 
              onClick={() => setActiveTab('form')}
              className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase flex items-center justify-center gap-2 tracking-widest ${
                activeTab === 'form' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Plus size={14}/> BUAT BARU
            </button>
          </div>
        </div>

        {activeTab === 'list' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* SEARCH BAR */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari agenda atau hasil rapat..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            {/* TABLE AREA */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/50 text-[9px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-100">
                      <th className="px-8 py-5">DETAIL AGENDA</th>
                      <th className="px-8 py-5">RINGKASAN PEMBAHASAN</th>
                      <th className="px-8 py-5 text-right">OPSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                       <tr><td colSpan="3" className="px-8 py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={24} /></td></tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-2">
                              <span className="text-sm font-black text-slate-800 uppercase leading-none tracking-tight">{item.judul}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1.5 uppercase bg-slate-100 px-2 py-1 rounded">
                                  <Calendar size={10} className="text-slate-400"/> {item.tanggal}
                                </span>
                                <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1.5 uppercase bg-slate-100 px-2 py-1 rounded">
                                  <MapPin size={10} className="text-slate-400"/> {item.lokasi}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium max-w-sm italic">
                              "{item.hasil}"
                            </p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handlePrint(item)} 
                                className="p-2.5 bg-slate-900 text-white rounded-xl hover:scale-110 transition-all shadow-md">
                                <Printer size={16} />
                              </button>
                              <button onClick={() => deleteData(item.id)} 
                                className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center opacity-20">
                                <FileText size={48} className="mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">ARSIP KOSONG</p>
                            </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* FORM SECTION */
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <FileText size={24}/>
                        </div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">MEETING RECORDS</h2>
                            <p className="text-lg font-black uppercase tracking-tight">INPUT DATA RAPAT</p>
                        </div>
                    </div>
                    {isListening && (
                        <div className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest">LISTENING</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">AGENDA UTAMA</label>
                        <input 
                            required placeholder="Ketik judul rapat..." 
                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                            value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">TANGGAL</label>
                            <input 
                                required type="date" 
                                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                                value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">LOKASI</label>
                            <input 
                                required placeholder="Ketik lokasi rapat..." 
                                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                                value={formData.lokasi} onChange={(e) => setFormData({...formData, lokasi: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">HASIL & KEPUTUSAN</label>
                        <textarea 
                            required rows="10" placeholder="Tuliskan hasil rapat atau gunakan fitur suara..." 
                            className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl text-sm font-medium leading-relaxed outline-none focus:border-slate-900 focus:bg-white transition-all shadow-sm resize-none"
                            value={formData.hasil} onChange={(e) => setFormData({...formData, hasil: e.target.value})} 
                        />
                        
                        {/* Voice Button */}
                        <button 
                            type="button" onClick={toggleListen}
                            className={`absolute right-4 bottom-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] pt-4">
                        FINALISASI & SIMPAN <ArrowRight size={18} />
                    </button>
                </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notulensi;