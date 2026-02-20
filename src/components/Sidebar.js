import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Archive,
  BookOpen,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

import logoImg from '../assets/logo-tarka.jpeg';

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const menu = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20}/> },
    { name: 'Rekap Surat', path: '/rekap-surat', icon: <Archive size={20}/> },
    { name: 'Data Anggota', path: '/data-anggota', icon: <Users size={20}/> },
    { name: 'Notulensi Rapat', path: '/notulensi', icon: <BookOpen size={20}/> },
    { name: 'Laporan Kerja', path: '/laporan', icon: <UserPlus size={20}/> },
  ];

  const isActive = (path) => location.pathname === path;

  const formatText = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <>
      {/* MOBILE HEADER - Z-Index ditingkatkan agar tombol tetap bisa diklik */}
      <div className="md:hidden flex items-center justify-between bg-black text-white px-6 py-5 fixed w-full top-0 z-[130] border-b border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="w-8 h-8 rounded-lg border border-white/20" />
          <span className="font-bold tracking-tighter text-xs uppercase">SEKRE KARTA 18</span>
        </div>
        <button 
          onClick={() => setOpen(!open)} 
          className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all border border-white/10 active:scale-95"
          aria-label="Toggle Menu"
        >
          {open ? <X size={20} className="text-white"/> : <Menu size={20} className="text-white"/>}
        </button>
      </div>

      {/* SIDEBAR ASIDE */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[280px] bg-black text-white z-[140] border-r border-white/10 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl md:shadow-none`}
      >
        <div className="flex flex-col h-full p-6 md:p-8">
          
          {/* HEADER SIDEBAR (Mobile Close Button inside) */}
          <div className="flex items-center justify-between mb-10 md:mb-14">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border border-white/20 bg-white">
                <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-black text-base md:text-lg leading-none tracking-tighter uppercase text-white"> SEKRE KARTA 18</h1>
                <p className="text-[9px] font-bold text-zinc-500 tracking-[0.2em] mt-1 uppercase">Digital System</p>
              </div>
            </div>
            
            {/* Tombol X tambahan khusus di dalam sidebar mobile agar user tidak bingung */}
            <button onClick={() => setOpen(false)} className="md:hidden p-2 hover:bg-zinc-900 rounded-full transition-colors">
                <X size={20} className="text-zinc-500" />
            </button>
          </div>

          {/* MENU NAVIGASI */}
          <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2">Navigasi Utama</p>
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive(item.path)
                    ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.15)] scale-[1.02]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`transition-colors duration-300 ${isActive(item.path) ? 'text-black' : 'text-zinc-500 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold tracking-tight">
                    {formatText(item.name)}
                  </span>
                </div>
                {isActive(item.path) && (
                  <div className="bg-black/5 p-1 rounded-full">
                    <ChevronRight size={14} className="text-black" />
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* FOOTER CARD - Versi Lebih Formal */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="bg-zinc-900/50 p-5 rounded-[1.5rem] border border-white/5 backdrop-blur-sm">
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Sekretariat Resmi</h2>
              <p className="text-[11px] text-white leading-relaxed font-medium">
                RW 18 Permata Hijau<br />
                <span className="text-zinc-500">Kabupaten Bandung</span>
              </p>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-tighter">© 2026</span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* OVERLAY - Efek blur ditingkatkan agar lebih premium */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[135] md:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;