import React, { useState, useEffect } from 'react';
import logoTarka from '../assets/logo-tarka.jpeg';
import { BookOpen, Calendar, MapPin, Plus, Trash2, Mic, MicOff, Printer } from 'lucide-react';
// Import koneksi Firebase
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

  // 1. LOAD DATA DARI FIREBASE (REAL-TIME)
  useEffect(() => {
    const q = query(collection(db, "notulensi"), orderBy("tanggal", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotulensi(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const formatCaps = (text) => text ? text.toString().toUpperCase() : '';

  // 2. SETUP VOICE RECOGNITION
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = React.useMemo(() => {
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
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setFormData(prev => ({ ...prev, hasil: formatCaps(transcript) }));
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };
  }, [recognition]);

  const toggleListen = () => {
    if (!recognition) {
      alert("Browser Anda tidak mendukung fitur suara.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  // 3. SIMPAN KE FIREBASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = {
      judul: formatCaps(formData.judul),
      tanggal: formData.tanggal,
      lokasi: formatCaps(formData.lokasi),
      hasil: formatCaps(formData.hasil),
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "notulensi"), dataToSave);
      setFormData({ judul: '', tanggal: '', lokasi: '', hasil: '' });
      if (isListening) recognition.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Gagal simpan notulensi:", error);
      alert("Gagal menyimpan ke database cloud.");
    }
  };

  // 4. HAPUS DARI FIREBASE
  const deleteData = async (id) => {
    if (window.confirm("HAPUS NOTULENSI INI DARI CLOUD?")) {
      try {
        await deleteDoc(doc(db, "notulensi", id));
      } catch (error) {
        console.error("Gagal menghapus:", error);
      }
    }
  };

  const handlePrint = (item) => {
    const getHari = (dateString) => {
      const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
      const date = new Date(dateString);
      return days[date.getDay()];
    };

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>NOTULENSI - ${item.judul}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: sans-serif; color: #000; padding: 0; margin: 0; }
            .kop { display: flex; align-items: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .logo { width: 60px; height: 60px; margin-right: 15px; }
            .kop-h2 { font-size: 10px; letter-spacing: 2px; color: #666; margin: 0; }
            .kop-h1 { font-size: 20px; margin: 5px 0 0 0; }
            .meta { display: flex; justify-content: space-between; border: 1px solid #000; padding: 10px; font-size: 11px; font-weight: bold; margin-bottom: 20px; }
            .hasil-label { font-size: 11px; font-weight: bold; text-decoration: underline; margin-bottom: 10px; display: block; }
            .hasil-text { font-size: 13px; line-height: 1.6; text-align: justify; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="kop">
            <img src="${logoTarka}" class="logo">
            <div>
              <p class="kop-h2">ARSIP DIGITAL KARANG TARUNA RW 18</p>
              <h1 class="kop-h1">${item.judul}</h1>
            </div>
          </div>
          <div class="meta">
            <span>HARI/TGL: ${getHari(item.tanggal)}, ${item.tanggal}</span>
            <span>LOKASI: ${item.lokasi}</span>
          </div>
          <span class="hasil-label">HASIL KEPUTUSAN RAPAT:</span>
          <div class="hasil-text">${item.hasil}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 bg-[#fbfbfb]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-zinc-900 leading-none">Notulensi Rapat</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Cloud Transcription System</p>
        </div>
        <div className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-3 w-fit">
          <BookOpen size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Database RW 18</span>
        </div>
      </div>

      {/* FORM INPUT */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-zinc-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Judul Rapat</label>
              <input required placeholder="JUDUL..." className="w-full bg-zinc-50 border-none rounded-xl p-4 text-xs font-bold uppercase focus:ring-1 focus:ring-black outline-none"
                value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Tanggal</label>
              <input required type="date" className="w-full bg-zinc-50 border-none rounded-xl p-4 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
                value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Lokasi</label>
              <input required placeholder="LOKASI..." className="w-full bg-zinc-50 border-none rounded-xl p-4 text-xs font-bold uppercase focus:ring-1 focus:ring-black outline-none"
                value={formData.lokasi} onChange={(e) => setFormData({...formData, lokasi: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Hasil Rapat (Voice to Text)</label>
            <div className="relative">
              <textarea required rows="6" placeholder="GUNAKAN MICROPHONE UNTUK MENCATAT OTOMATIS..." className="w-full bg-zinc-50 border-none rounded-2xl p-5 text-xs font-bold uppercase leading-relaxed focus:ring-1 focus:ring-black outline-none"
                value={formData.hasil} onChange={(e) => setFormData({...formData, hasil: e.target.value})} />
              <button type="button" onClick={toggleListen} className={`absolute right-4 bottom-4 p-4 rounded-2xl transition-all shadow-lg ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-zinc-900 border border-zinc-100 hover:bg-zinc-50'}`}>
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="bg-black text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-lg">
            <Plus size={16} /> Simpan Notulensi Ke Cloud
          </button>
        </form>
      </div>

      {/* ARSIP LIST */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-zinc-100">
        <div className="p-6 border-b border-zinc-50">
          <h3 className="font-black text-[11px] uppercase tracking-widest text-zinc-400">Arsip Notulensi Cloud ({notulensi.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                <th className="px-8 py-4">Rapat</th>
                <th className="px-8 py-4">Isi Keputusan</th>
                <th className="px-8 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {notulensi.length > 0 ? notulensi.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6 align-top">
                    <p className="font-black text-zinc-900 text-xs mb-2 leading-none uppercase">{item.judul}</p>
                    <div className="flex flex-col gap-1 text-[9px] font-bold text-zinc-400">
                      <span className="flex items-center gap-1 uppercase"><Calendar size={10}/> {item.tanggal}</span>
                      <span className="flex items-center gap-1 uppercase"><MapPin size={10}/> {item.lokasi}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top">
                    <p className="text-[10px] font-bold text-zinc-500 leading-relaxed max-w-sm line-clamp-3 uppercase">{item.hasil}</p>
                  </td>
                  <td className="px-8 py-6 text-right align-top">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handlePrint(item)} className="p-2.5 bg-zinc-900 text-white rounded-lg hover:bg-black transition-all shadow-md">
                        <Printer size={14} />
                      </button>
                      <button onClick={() => deleteData(item.id)} className="p-2.5 text-zinc-300 hover:text-rose-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">Belum ada arsip tersimpan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Notulensi;