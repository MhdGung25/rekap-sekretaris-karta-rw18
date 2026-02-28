import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  PieChart,
  Menu,
  X,
  // ChevronRight dihapus dari sini untuk menghilangkan warning eslint
  ShieldCheck
} from 'lucide-react';

import logoImg from '../assets/logo-tarka.jpeg';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const mainMenus = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20}/> },
    { name: 'Arsip Surat', path: '/rekap-surat', icon: <FileText size={20}/> },
    { name: 'Database Anggota', path: '/data-anggota', icon: <Users size={20}/> },
    { name: 'Buku Notulensi', path: '/notulensi', icon: <BookOpen size={20}/> },
    { name: 'Laporan Berkala', path: '/laporan', icon: <PieChart size={20}/> },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* --- PREMIUM MOBILE HEADER --- */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-5 flex items-center justify-between z-50 md:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-zinc-200 shadow-sm">
            <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[13px] font-black text-zinc-900 uppercase leading-none tracking-tight">
              Sekretaris Karta
            </span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.1em] mt-0.5">
              Sistem Administrasi
            </span>
          </div>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-2.5 bg-zinc-900 text-white rounded-xl active:scale-90 transition-all shadow-md shadow-zinc-200"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* --- OVERLAY --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[55] md:hidden transition-all duration-300" 
          onClick={toggleSidebar} 
        />
      )}

      {/* --- SIDEBAR ASIDE --- */}
      <aside className={`
        fixed top-0 left-0 h-screen w-[290px] bg-white z-[60] border-r border-zinc-200
        transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          
          {/* BRANDING SECTION (SIDEBAR) */}
          <div className="relative px-6 h-28 flex items-center mb-4 border-b border-zinc-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-zinc-100 shadow-lg flex-shrink-0">
                 <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[17px] font-black text-zinc-900 leading-tight uppercase tracking-tighter">
                  Sekretaris Karta
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <ShieldCheck size={12} className="text-blue-600 fill-blue-50" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Adm. Terpusat</p>
                </div>
              </div>
            </div>

            {/* Tombol X (Hanya Mobile) */}
            <button 
              onClick={toggleSidebar} 
              className="md:hidden absolute top-8 right-4 p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all"
            >
              <X size={22} />
            </button>
          </div>

          {/* NAVIGATION SECTION */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <div className="px-4 mb-4 flex items-center gap-2">
              <div className="h-[1px] w-4 bg-zinc-200"></div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Menu Navigasi</p>
            </div>
            
            <nav className="space-y-1.5">
              {mainMenus.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group
                      ${active 
                        ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200 translate-x-1' 
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`transition-colors duration-300 ${active ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-900'}`}>
                        {item.icon}
                      </span>
                      <span className={`text-[14px] tracking-tight ${active ? 'font-bold' : 'font-semibold'}`}>
                        {item.name}
                      </span>
                    </div>
                    {/* Indikator Aktif (Glow Dot) */}
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      <div className="h-16 md:hidden" />
    </>
  );
};

export default Sidebar;