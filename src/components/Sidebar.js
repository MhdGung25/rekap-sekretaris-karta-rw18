import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Archive,
  BookOpen, // Tambahkan icon ini
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
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={22}/> },
    { name: 'Rekap Surat', path: '/rekap-surat', icon: <Archive size={22}/> },
    { name: 'Data Anggota', path: '/data-anggota', icon: <Users size={22}/> },
    { name: 'Notulensi Rapat', path: '/notulensi', icon: <BookOpen size={22}/> }, // Menu Baru
    { name: 'Laporan Kerja', path: '/laporan', icon: <UserPlus size={22}/> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between bg-black text-white px-6 py-5 fixed w-full top-0 z-[100] border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="w-9 h-9 rounded-lg border border-white/20" />
          <span className="font-black tracking-tighter text-sm uppercase">SEKRE KARTA 18</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 hover:bg-zinc-900 rounded-lg transition-colors">
          {open ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* SIDEBAR ASIDE */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[280px] bg-black text-white z-[120] border-r border-white/10 transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex flex-col h-full p-8">
          
          {/* LOGO SECTION */}
          <div className="flex items-center gap-4 mb-14">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white bg-white">
              <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-lg leading-none tracking-tighter uppercase"> SEKRE KARTA 18</h1>
              <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] mt-1 uppercase">Digital System</p>
            </div>
          </div>

          {/* MENU NAVIGASI */}
          <nav className="space-y-3 flex-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6 px-2">Navigation</p>
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="text-[13px] font-bold uppercase tracking-tight">{item.name}</span>
                </div>
                {isActive(item.path) && <ChevronRight size={18} />}
              </Link>
            ))}
          </nav>

          {/* FOOTER CARD */}
          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5">
              <h2 className="text-[10px] font-black text-white tracking-widest uppercase mb-1">Sekretariat</h2>
              <p className="text-[9px] text-zinc-500 leading-relaxed font-bold uppercase">
                RW 18 Permata Hijau<br />Kab. Bandung
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[8px] text-zinc-700 font-black">© 2026</span>
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;