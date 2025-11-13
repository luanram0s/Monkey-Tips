import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import Card from './ui/Card';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('mtips@2025');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'mtips@2025') {
      setError('');
      onLogin(username);
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-md w-full">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-accent">Bem-vindo!</h2>
            <p className="text-brand-subtle">Acesse o painel para começar.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário"
                className="w-full bg-brand-dark border border-brand-secondary rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full bg-brand-dark border border-brand-secondary rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-brand-accent text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors duration-300"
            >
              Entrar
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Login;