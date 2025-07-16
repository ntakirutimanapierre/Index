import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaGlobeAfrica, FaChartBar, FaTable, FaBuilding, FaUsers, FaSignOutAlt, FaSignInAlt, FaDatabase } from 'react-icons/fa';

interface SidebarProps {
  currentUser: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onSignIn, onSignOut }) => {
  const role = currentUser?.role;

  return (
    <aside className="w-64 bg-white shadow-lg z-40 flex flex-col">
      <div className="flex items-center justify-center h-24 border-b border-gray-100 px-6">
        <span className="text-2xl font-extrabold text-blue-700 flex items-center gap-3 tracking-tight">
          <FaGlobeAfrica className="text-3xl" />
          African Fintech Index
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {/* Dashboard is always visible */}
        <NavLink to="/" className={({ isActive }) => isActive ? 'flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold' : 'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium'} end>
          <FaChartBar /> Dashboard
        </NavLink>
        {/* Analytics: Admin, Editor, Viewer */}
        {(role === 'admin' || role === 'editor' || role === 'viewer') && (
          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold' : 'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium'}>
            <FaTable /> Analytics
          </NavLink>
        )}
        {/* Countries: always visible */}
        <NavLink to="/countries" className={({ isActive }) => isActive ? 'flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold' : 'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium'}>
          <FaGlobeAfrica /> Countries
        </NavLink>
        {/* Startups: Admin, Editor, Viewer */}
        {(role === 'admin' || role === 'editor' || role === 'viewer') && (
          <NavLink to="/startups" className={({ isActive }) => isActive ? 'flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold' : 'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium'}>
            <FaBuilding /> Startups
          </NavLink>
        )}
        {/* Data Management: Admin, Editor */}
        {(role === 'admin' || role === 'editor') && (
          <NavLink to="/data-management" className={({ isActive }) => isActive ? 'flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold' : 'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium'}>
            <FaDatabase /> Data Management
          </NavLink>
        )}
        {/* User Management: Admin only */}
        {role === 'admin' && (
          <NavLink to="/user-management" className={({ isActive }) => isActive ? 'flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold' : 'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium'}>
            <FaUsers /> User Management
          </NavLink>
        )}
      </nav>
    </aside>
  );
}; 