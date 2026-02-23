import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/login', { password });
      // Store password in memory or session storage for subsequent requests
      // For this demo, we'll use sessionStorage to persist across reloads but clear on close
      sessionStorage.setItem('admin_password', password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-white/10">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gh-purple/20 rounded-full">
            <Lock className="w-8 h-8 text-gh-accent" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Moderation Access</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gh-accent text-center tracking-widest"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-gh-green-dark hover:bg-gh-green-dark/80 text-white rounded-lg font-medium transition-colors"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
