import React, { useState, useEffect, useMemo } from 'react';
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

  // FUNGSI OTOMATIS: Mengubah "rapat kerja" menjadi "Rapat Kerja"
  const formatAutoCase = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // FUNGSI OTOMATIS: Untuk hasil rapat (Huruf besar di awal kalimat)
  // Perbaikan ESLint: Menghilangkan backslash (\) yang tidak perlu pada . ! ?
  const formatSentenceCase = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  // 2. SETUP VOICE RECOGNITION
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
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setFormData(prev => ({ ...prev, hasil: formatSentenceCase(transcript) }));
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
      judul: formatAutoCase(formData.judul),
      tanggal: formData.tanggal,
      lokasi: formatAutoCase(formData.lokasi),
      hasil: formatSentenceCase(formData.hasil),
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
    if (window.confirm("Hapus notulensi ini dari cloud?")) {
      try {
        await deleteDoc(doc(db, "notulensi", id));
      } catch (error) {
        console.error("Gagal menghapus:", error);
      }
    }
  };

  const handlePrint = (item) => {
    const formatTanggalLengkap = (dateString) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    };

 const printWindow = window.open('', '_blank');
printWindow.document.write(`
  <html>
    <head>
      <style>
        /* Pengaturan Kertas A4 & Multi-halaman */
        @page { 
          size: A4; 
          margin: 20mm; 
        }
        @media print {
          html, body { height: 100%; }
          .no-print { display: none; }
        }

        body { 
          font-family: "Arial", sans-serif; 
          color: #000; 
          line-height: 1.6; 
          padding: 0; 
          margin: 0;
          background: #fff;
        }

        /* Header / Kop Surat */
        .header { 
          display: flex; 
          align-items: center; 
          border-bottom: 3px solid #000; 
          padding-bottom: 15px; 
          margin-bottom: 5px; 
        }
        .logo-box { flex: 0 0 100px; }
        .logo-img { width: 90px; height: auto; display: block; }
        
        .kop-text { flex: 1; text-align: left; padding-left: 20px; }
        .kop-h1 { font-size: 24px; margin: 0; font-weight: bold; letter-spacing: 1px; }
        .kop-sub { margin: 5px 0 0 0; font-size: 14px; color: #333; font-weight: 500; }
        
        .line-thin { border-bottom: 1px solid #000; margin-top: 2px; margin-bottom: 25px; }
        .content-title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 30px; text-decoration: underline; }
        
        /* Tabel Meta/Detail */
        .meta-table { width: 100%; margin-bottom: 30px; font-size: 14px; border-collapse: collapse; }
        .meta-table td { padding: 8px 0; vertical-align: top; }
        .meta-label { width: 160px; font-weight: normal; color: #444; } /* Tidak Bold */
        .meta-sep { width: 20px; }
        .meta-value { font-weight: bold; font-size: 15px; } /* Isi Baru yang Bold */
        
        /* Bagian Isi / Hasil */
        .hasil-section { margin-top: 20px; }
        .hasil-label { 
          font-size: 14px; 
          font-weight: bold; 
          display: block; 
          border-bottom: 1px solid #000; 
          padding-bottom: 5px; 
          margin-bottom: 15px; 
          text-transform: uppercase;
        }
        .hasil-text { 
          font-size: 14px; 
          text-align: justify; 
          line-height: 1.8; 
          color: #000; 
          white-space: pre-line; 
          word-wrap: break-word; /* Memastikan teks panjang tidak keluar halaman */
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-box">
          <img src="${logoTarka}" class="logo-img" alt="Logo">
        </div>
        <div class="kop-text">
          <h1 class="kop-h1">KARANG TARUNA RW 18</h1>
          <p class="kop-sub">Sekretariat: RW 18 Permata Hijau, Kab. Bandung</p>
        </div>
      </div>
      <div class="line-thin"></div>
      
      <div class="content-title">NOTULENSI HASIL RAPAT</div>
      
      <table class="meta-table">
        <tr>
          <td class="meta-label">Perihal</td>
          <td class="meta-sep">:</td>
          <td class="meta-value">${item.judul}</td>
        </tr>
        <tr>
          <td class="meta-label">Hari / tanggal</td>
          <td class="meta-sep">:</td>
          <td class="meta-value">${formatTanggalLengkap(item.tanggal)}</td>
        </tr>
        <tr>
          <td class="meta-label">Tempat</td>
          <td class="meta-sep">:</td>
          <td class="meta-value">${item.lokasi}</td>
        </tr>
      </table>
      
      <div class="hasil-section">
        <span class="hasil-label">Isi / hasil keputusan rapat:</span>
        <div class="hasil-text">
          ${item.hasil
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.charAt(0).toUpperCase() + line.slice(1)) // Otomatis kapital awal baris
            .join('\n')
          }
        </div>
      </div>

      <script>
        window.onload = () => { 
          setTimeout(() => { 
            window.print(); 
            window.close(); 
          }, 500); 
        };
      </script>
    </body>
  </html>
`);
printWindow.document.close();
};

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 bg-[#fbfbfb] text-zinc-900">
      
     {/* HEADER FORMAL */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-6">
  <div className="space-y-1">
    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 uppercase">
      Notulensi Rapat
    </h1>
    <p className="text-zinc-500 text-sm font-normal italic">
      Sistem Dokumentasi Digital Terintegrasi
    </p>
  </div>
  
  <div className="flex items-center gap-3 px-3 py-2 border border-zinc-300 rounded-md bg-zinc-50 shadow-sm">
    <BookOpen size={18} className="text-zinc-700" />
    <div className="h-4 w-[1px] bg-zinc-300" /> {/* Divider kecil untuk kesan rapi */}
    <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-widest">
      Dokumen Resmi
    </span>
  </div>
</div>

      {/* FORM INPUT */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-zinc-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 px-1">Judul Rapat</label>
              <input required placeholder="Contoh: Rapat Koordinasi" className="w-full bg-zinc-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-1 focus:ring-black outline-none"
                value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 px-1">Tanggal</label>
              <input required type="date" className="w-full bg-zinc-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-1 focus:ring-black outline-none"
                value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 px-1">Lokasi</label>
              <input required placeholder="Contoh: Balai Warga" className="w-full bg-zinc-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-1 focus:ring-black outline-none"
                value={formData.lokasi} onChange={(e) => setFormData({...formData, lokasi: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-zinc-400 px-1">Hasil Rapat (Gunakan Mic untuk otomatis)</label>
            <div className="relative">
              <textarea required rows="6" placeholder="Tulis atau gunakan suara untuk mencatat..." className="w-full bg-zinc-50 border-none rounded-2xl p-5 text-sm font-medium leading-relaxed focus:ring-1 focus:ring-black outline-none"
                value={formData.hasil} onChange={(e) => setFormData({...formData, hasil: e.target.value})} />
              <button type="button" onClick={toggleListen} className={`absolute right-4 bottom-4 p-4 rounded-2xl transition-all shadow-lg ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-zinc-900 border border-zinc-100 hover:bg-zinc-50'}`}>
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="bg-black text-white px-8 py-4 rounded-xl font-bold text-xs tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-md">
            <Plus size={16} /> Simpan Notulensi Ke Cloud
          </button>
        </form>
      </div>

      {/* ARSIP LIST */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-zinc-100">
        <div className="p-6 border-b border-zinc-50 bg-zinc-50/30">
          <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400">Arsip Notulensi ({notulensi.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <th className="px-8 py-4">Informasi Rapat</th>
                <th className="px-8 py-4">Ringkasan Hasil</th>
                <th className="px-8 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {notulensi.length > 0 ? notulensi.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/30 transition-colors">
                  <td className="px-8 py-6 align-top">
                    <p className="font-bold text-zinc-900 text-sm mb-2">{item.judul}</p>
                    <div className="flex flex-col gap-1 text-[10px] font-medium text-zinc-400">
                      <span className="flex items-center gap-1"><Calendar size={10}/> {item.tanggal}</span>
                      <span className="flex items-center gap-1"><MapPin size={10}/> {item.lokasi}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top">
                    <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-sm line-clamp-3">{item.hasil}</p>
                  </td>
                  <td className="px-8 py-6 text-right align-top">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handlePrint(item)} className="p-2.5 bg-zinc-900 text-white rounded-lg hover:bg-black transition-all shadow-sm">
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
                  <td colSpan="3" className="px-8 py-20 text-center text-xs font-medium text-zinc-300 italic">Belum ada arsip tersimpan</td>
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