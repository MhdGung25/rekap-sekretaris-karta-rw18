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
} from 'lucide-react';

import logoImg from '../assets/logo-tarka.jpeg';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Nama menu menggunakan huruf kapital hanya di awal kata (Title Case)
  const mainMenus = [
    { name: 'Dashboard utama', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Manajemen arsip surat', path: '/rekap-surat', icon: <FileText size={18} /> },
    { name: 'Database keanggotaan', path: '/data-anggota', icon: <Users size={18} /> },
    { name: 'Risalah notulensi', path: '/notulensi', icon: <BookOpen size={18} /> },
    { name: 'Laporan progres kerja', path: '/laporan', icon: <PieChart size={18} /> },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* --- MOBILE TOP BAR --- */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 px-5 flex items-center justify-between z-50 md:hidden">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-gray-900 text-sm uppercase tracking-tight">SEKRETARIAT KARTA</span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* --- OVERLAY --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] md:hidden transition-opacity" 
          onClick={toggleSidebar} 
        />
      )}

      {/* --- SIDEBAR ASIDE --- */}
      <aside className={`
        fixed top-0 left-0 h-screen w-[270px] bg-white z-[60] border-r border-gray-100
        transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          
          {/* BRANDING SECTION - JUDUL WAJIB KAPITAL SEMUA */}
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-center border border-gray-100">
                 <img src={logoImg} alt="Logo" className="w-7 h-7 object-contain rounded" />
              </div>
              <div>
                <h1 className="text-[16px] font-black text-gray-900 tracking-tight leading-none uppercase">
                  SEKRETARIAT KARTA
                </h1>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1.5">
                  PORTAL ADMIN
                </p>
              </div>
            </div>

            <button 
              onClick={toggleSidebar}
              className="md:hidden p-1 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* NAVIGATION SECTION */}
          <nav className="flex-1 px-4 space-y-1.5">
            {mainMenus.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group
                    ${active 
                      ? 'bg-[#FFFFFF] text-gray-900 font-bold shadow-lg shadow-gray-200/50 border border-gray-100' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <span className={`${active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'}`}>
                    {item.icon}
                  </span>
                  <span className="text-[13px] tracking-tight">
                    {/* Menggunakan huruf kapital hanya di awal (Sentence case) */}
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-900" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* FOOTER SECTION - JUDUL WAJIB KAPITAL SEMUA */}
          <div className="p-6">
            <div className="py-5 border-t border-gray-100 flex flex-col items-center justify-center">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                SISTEM INFORMASI
              </p>
              <h2 className="text-[11px] text-gray-800 font-extrabold uppercase tracking-tight mt-1 text-center">
                REKAP ADMINISTRASI KARTA
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-200" />
                <p className="text-[8px] text-gray-400 font-medium tracking-widest">
                  OFFICIAL REGISTRY 2026
                </p>
                <div className="w-1 h-1 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* Spacer agar konten tidak tertutup header pada mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
};

export default Sidebar;