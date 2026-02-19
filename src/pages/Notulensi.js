import React, { useState, useEffect } from 'react';
import logoTarka from '../assets/logo-tarka.jpeg';
import { BookOpen, Calendar, MapPin, Plus, Trash2, Mic, MicOff, Printer } from 'lucide-react';

const Notulensi = () => {
  const [notulensi, setNotulensi] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    tanggal: '',
    lokasi: '',
    hasil: ''
  });

  // Load data dari LocalStorage
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('db_notulensi') || '[]');
    setNotulensi(savedData);
  }, []);

  // FUNGSI KAPITAL (Sekarang Digunakan)
  const formatCaps = (text) => text ? text.toString().toUpperCase() : '';

  // Setup Voice Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      // Hasil suara otomatis jadi kapital
      setFormData(prev => ({ ...prev, hasil: formatCaps(transcript) }));
    };
  }

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Memastikan semua data yang disimpan sudah diformat Kapital
    const dataToSave = {
      id: Date.now(),
      judul: formatCaps(formData.judul),
      tanggal: formData.tanggal,
      lokasi: formatCaps(formData.lokasi),
      hasil: formatCaps(formData.hasil)
    };
    
    const newData = [dataToSave, ...notulensi];
    setNotulensi(newData);
    localStorage.setItem('db_notulensi', JSON.stringify(newData));
    setFormData({ judul: '', tanggal: '', lokasi: '', hasil: '' });
    if (isListening) recognition.stop();
    setIsListening(false);
  };

  const deleteData = (id) => {
    if (window.confirm("HAPUS NOTULENSI INI?")) {
      const filtered = notulensi.filter(item => item.id !== id);
      setNotulensi(filtered);
      localStorage.setItem('db_notulensi', JSON.stringify(filtered));
    }
  };
const handlePrint = (item) => {
    // Fungsi untuk mendapatkan nama hari otomatis dari tanggal
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
            body { 
              font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
              color: #000; margin: 0; padding: 0;
            }
            .container { width: 100%; }
            
            /* KOP SURAT */
            .kop-surat {
              display: flex;
              align-items: center;
              border-bottom: 4px solid #000;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .logo-img {
              width: 70px;
              height: 70px;
              object-fit: contain;
              margin-right: 20px;
            }
            .kop-text h2 {
              margin: 0;
              font-size: 10px;
              letter-spacing: 3px;
              font-weight: 800;
              color: #555;
              text-transform: uppercase;
            }
            .kop-text h1 {
              margin: 5px 0 0 0;
              font-size: 24px;
              font-weight: 900;
              text-transform: uppercase;
            }

            /* BOX INFORMASI */
            .meta-box {
              display: flex;
              justify-content: space-between;
              border: 1.5px solid #000;
              margin-bottom: 30px;
              padding: 12px 20px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
            }

            /* ISI RAPAT */
            .hasil-label {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 15px;
              display: inline-block;
            }
            .hasil-text {
              font-size: 14px;
              white-space: pre-wrap;
              text-align: justify;
              line-height: 1.6;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="kop-surat">
              <img src="${logoTarka}" class="logo-img" alt="LOGO">
              <div class="kop-text">
                <h2>A R S I P &nbsp; D I G I T A L &nbsp; K A R T A &nbsp; 1 8</h2>
                <h1>${item.judul}</h1>
              </div>
            </div>

            <div class="meta-box">
              <span>TANGGAL: ${getHari(item.tanggal)}, ${item.tanggal}</span>
              <span>LOKASI: ${item.lokasi}</span>
            </div>

            <div class="content-section">
              <span class="hasil-label">HASIL & KEPUTUSAN RAPAT:</span>
              <div class="hasil-text">${item.hasil}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 bg-[#fbfbfb]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-zinc-900 leading-none">Notulensi Rapat</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Digital Archive & Transcription System</p>
        </div>
        <div className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-3 w-fit">
          <BookOpen size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Digital RW 18</span>
        </div>
      </div>

      {/* FORM INPUT */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-zinc-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Judul Rapat</label>
              <input required placeholder="JUDUL..." className="w-full bg-zinc-50 border-none rounded-xl p-4 text-xs font-bold uppercase focus:ring-1 focus:ring-black"
                value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Tanggal</label>
              <input required type="date" className="w-full bg-zinc-50 border-none rounded-xl p-4 text-xs font-bold focus:ring-1 focus:ring-black"
                value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Lokasi</label>
              <input required placeholder="LOKASI..." className="w-full bg-zinc-50 border-none rounded-xl p-4 text-xs font-bold uppercase focus:ring-1 focus:ring-black"
                value={formData.lokasi} onChange={(e) => setFormData({...formData, lokasi: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Hasil Rapat</label>
            <div className="relative">
              <textarea required rows="4" placeholder="KETIK HASIL ATAU GUNAKAN MICROPHONE..." className="w-full bg-zinc-50 border-none rounded-2xl p-5 text-xs font-bold uppercase leading-relaxed focus:ring-1 focus:ring-black"
                value={formData.hasil} onChange={(e) => setFormData({...formData, hasil: e.target.value})} />
              <button type="button" onClick={toggleListen} className={`absolute right-4 bottom-4 p-3 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-zinc-900 border border-zinc-100'}`}>
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="bg-black text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-zinc-800 transition-all">
            <Plus size={16} /> Simpan Notulensi
          </button>
        </form>
      </div>

      {/* RIWAYAT TABLE */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-zinc-100">
        <div className="p-6 border-b border-zinc-50 flex justify-between items-center">
          <h3 className="font-black text-[11px] uppercase tracking-widest text-zinc-400">Arsip Tersimpan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                <th className="px-8 py-4">Informasi</th>
                <th className="px-8 py-4">Hasil Keputusan</th>
                <th className="px-8 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {notulensi.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6 align-top">
                    <p className="font-black text-zinc-900 text-xs mb-2 leading-none">{item.judul}</p>
                    <div className="flex flex-col gap-1 text-[9px] font-bold text-zinc-400">
                      <span className="flex items-center gap-1"><Calendar size={10}/> {item.tanggal}</span>
                      <span className="flex items-center gap-1"><MapPin size={10}/> {item.lokasi}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top">
                    <p className="text-[10px] font-bold text-zinc-500 leading-relaxed max-w-sm line-clamp-3">{item.hasil}</p>
                  </td>
                  <td className="px-8 py-6 text-right align-top">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handlePrint(item)} className="p-2.5 bg-zinc-900 text-white rounded-lg hover:bg-black transition-all">
                        <Printer size={14} />
                      </button>
                      <button onClick={() => deleteData(item.id)} className="p-2.5 text-zinc-300 hover:text-rose-500 transition-all">
                        <Trash2 size={16} />
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