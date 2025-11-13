
import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  const handleLogin = (user: string) => {
    setIsAuthenticated(true);
    setUsername(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Dashboard username={username} onLogout={handleLogout} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
