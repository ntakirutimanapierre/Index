import React, { useState } from 'react';
import { FaChartBar, FaTable, FaGlobeAfrica, FaBuilding, FaSignInAlt, FaSignOutAlt, FaTimes } from 'react-icons/fa';

interface SidebarProps {
  currentUser: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onSignIn, onSignOut }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sidebar content as a function for reuse
  const sidebarContent = (
    <>
      <div className="flex items-center justify-center h-24 border-b border-gray-100 px-6">
        <span className="text-2xl font-extrabold text-blue-700 flex items-center gap-3 tracking-tight">
          <FaGlobeAfrica className="text-3xl" />
          African Fintech Index
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <a href="#dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium">
          <FaChartBar /> Dashboard
        </a>
        <a href="#analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium">
          <FaTable /> Analytics
        </a>
        <a href="#countries" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium">
          <FaGlobeAfrica /> Countries
        </a>
        <a href="#startups" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium">
          <FaBuilding /> Startups
        </a>
      </nav>
      <div className="px-4 py-6 border-t border-gray-100">
        {currentUser ? (
          <button onClick={onSignOut} className="w-full flex items-center gap-2 justify-center px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
            <FaSignOutAlt /> Sign Out
          </button>
        ) : (
          <button onClick={onSignIn} className="w-full flex items-center gap-2 justify-center px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            <FaSignInAlt /> Sign In
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex h-screen w-64 bg-white border-r border-gray-200 flex-col fixed top-0 left-0 z-20 shadow-lg rounded-r-3xl">
        {sidebarContent}
      </aside>
      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity ${mobileOpen ? 'block' : 'hidden'}`} onClick={() => setMobileOpen(false)} />
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-lg rounded-r-3xl flex flex-col transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} sm:hidden`}>
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setMobileOpen(false)}>
          <FaTimes className="w-6 h-6" />
        </button>
        {sidebarContent}
      </aside>
      {/* Hamburger Button for Mobile (placed absolutely, you may want to move this to Header for better UX) */}
      <button className="sm:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border border-gray-200" onClick={() => setMobileOpen(true)}>
        <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </>
  );
}; 