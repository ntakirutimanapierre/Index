import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CountriesPage from './pages/CountriesPage';
import StartupsPage from './pages/StartupsPage';
import UserManagementPage from './pages/UserManagementPage';
import DataManagementPage from './pages/DataManagementPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import type { User } from './types';
import { AuthModal } from './components/AuthModal';
import { mockCountryData, availableYears } from './data/mockData';

export const AuthContext = createContext<any>(null);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const userStr = localStorage.getItem('fintechUser');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);
  // Use a custom hook to access navigate inside App
  function WithNavigate() {
    const navigate = useNavigate();
    useEffect(() => {
      // If user is signed out, redirect to dashboard
      if (!currentUser) {
        navigate('/');
      }
    }, [currentUser, navigate]);
    return null;
  }

  useEffect(() => {
    const stored = localStorage.getItem('fintechUser');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const handleSignIn = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fintechUser', JSON.stringify(user));
  };
  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('fintechUser');
    // navigate('/') will be triggered by WithNavigate effect
  };
  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fintechUser', JSON.stringify(user));
    setShowAuthModal(false);
  };

  return (
    <AuthContext.Provider value={{ currentUser, onSignIn: handleSignIn, onSignOut: handleSignOut }}>
      <Router>
        <WithNavigate />
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
          <Header
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            availableYears={availableYears}
            currentUser={currentUser}
            onAuthClick={openAuthModal}
            onLogout={handleSignOut}
          />
          <div className="flex flex-1">
            {currentUser && (
              <Sidebar currentUser={currentUser} onSignIn={openAuthModal} onSignOut={handleSignOut} />
            )}
            <main className="flex-1 w-full min-h-screen p-8 text-black">
              <Routes>
                <Route path="/" element={<DashboardPage selectedYear={selectedYear} onYearChange={setSelectedYear} />} />
                <Route path="/analytics" element={<AnalyticsPage selectedYear={selectedYear} onYearChange={setSelectedYear} />} />
                <Route path="/countries" element={<CountriesPage selectedYear={selectedYear} onYearChange={setSelectedYear} />} />
                <Route path="/startups" element={<StartupsPage />} />
                <Route path="/user-management" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="/data-management" element={
                  <ProtectedRoute allowedRoles={['admin', 'editor']}>
                    <DataManagementPage />
                  </ProtectedRoute>
                } />
              </Routes>
              <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} onAuthSuccess={handleAuthSuccess} currentUser={currentUser} />
            </main>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
