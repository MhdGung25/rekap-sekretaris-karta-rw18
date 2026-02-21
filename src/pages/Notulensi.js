import React, { useState, useEffect, useMemo } from 'react';
import logoTarka from '../assets/logo-tarka.jpeg'; 
import { BookOpen, Calendar, MapPin, Plus, Trash2, Mic, MicOff, Printer } from 'lucide-react';
import { db } from '../firebaseConfig';
import { 
  collection, addDoc, onSnapshot, 
  query, deleteDoc, doc, orderBy 
} from 'firebase/firestore';

const Notulensi = () => {
  const [notulensi, setNotulensi] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    tanggal: '',
    lokasi: '',
    hasil: ''
  });

  // 1. ANTI-ZOOM & LOCK VIEWPORT
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
    document.getElementsByTagName('head')[0].appendChild(meta);
  }, []);

  // 2. LOAD DATA DARI FIREBASE
  useEffect(() => {
    const q = query(collection(db, "notulensi"), orderBy("tanggal", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotulensi(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

  // 3. VOICE RECOGNITION SETUP
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
    } catch (error) {
      alert("Gagal simpan.");
    }
  };

  const deleteData = async (id) => {
    if (window.confirm("Hapus notulensi ini?")) {
      await deleteDoc(doc(db, "notulensi", id));
    }
  };

  const handlePrint = (item) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .kop { display: flex; align-items: center; border-bottom: 3px solid black; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { width: 80px; height: 80px; object-fit: cover; margin-right: 20px; }
            .kop-text h1 { margin: 0; font-size: 22px; }
          </style>
        </head>
        <body>
          <div class="kop">
            <img src="${logoTarka}" class="logo" />
            <div class="kop-text">
              <h1>KARANG TARUNA RW 18</h1>
              <p>Sekretariat Digital Permata Hijau</p>
            </div>
          </div>
          <h2 style="text-align:center; text-decoration: underline;">NOTULENSI RAPAT</h2>
          <p><b>Judul:</b> ${item.judul}</p>
          <p><b>Tanggal:</b> ${item.tanggal}</p>
          <p><b>Lokasi:</b> ${item.lokasi}</p>
          <hr />
          <div><b>Hasil:</b><br/>${item.hasil}</div>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 bg-[#fbfbfb] text-zinc-900 pb-20">
      
      {/* HEADER - MENGGUNAKAN BookOpen */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <img src={logoTarka} alt="Logo" className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">NOTULENSI RAPAT</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Sekretariat Digital RW 18</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm w-fit">
          <BookOpen size={16} className="text-zinc-400" />
          <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">Dokumen Resmi</span>
        </div>
      </div>

      {/* FORM INPUT */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-zinc-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              required placeholder="Judul Rapat" 
              className="w-full bg-zinc-50 p-5 rounded-2xl text-base md:text-sm outline-none"
              value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} 
            />
            <input 
              required type="date" 
              className="w-full bg-zinc-50 p-5 rounded-2xl text-base md:text-sm outline-none font-bold"
              value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
            />
            <input 
              required placeholder="Lokasi Rapat" 
              className="w-full bg-zinc-50 p-5 rounded-2xl text-base md:text-sm outline-none"
              value={formData.lokasi} onChange={(e) => setFormData({...formData, lokasi: e.target.value})} 
            />
          </div>

          <div className="relative">
            <textarea 
              required rows="6" placeholder="Hasil keputusan rapat..." 
              className="w-full bg-zinc-50 p-6 rounded-[2rem] text-base md:text-sm leading-relaxed outline-none"
              value={formData.hasil} onChange={(e) => setFormData({...formData, hasil: e.target.value})} 
            />
            <button 
              type="button" onClick={toggleListen}
              className={`absolute right-4 bottom-4 w-14 h-14 rounded-full flex items-center justify-center shadow-xl ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-black text-white'}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>

          <button type="submit" className="w-full md:w-auto bg-black text-white px-10 py-4 rounded-xl font-bold text-xs tracking-widest flex items-center justify-center gap-2">
            <Plus size={16} /> SIMPAN DATA
          </button>
        </form>
      </div>

      {/* ARSIP LIST - MENGGUNAKAN MapPin */}
      <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Informasi</th>
                <th className="px-8 py-5">Hasil</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {notulensi.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-all">
                  <td className="px-8 py-6 align-top">
                    <p className="font-bold text-sm text-zinc-900">{item.judul}</p>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                        <Calendar size={12}/> {item.tanggal}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                        <MapPin size={12} className="text-zinc-300"/> {item.lokasi}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top">
                    <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed max-w-sm">{item.hasil}</p>
                  </td>
                  <td className="px-8 py-6 text-right align-top">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handlePrint(item)} className="p-3 bg-zinc-900 text-white rounded-xl shadow-lg active:scale-90 transition-all">
                        <Printer size={14}/>
                      </button>
                      <button onClick={() => deleteData(item.id)} className="p-3 text-zinc-200 hover:text-rose-500 transition-all">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Notulensi;