
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName });
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 border border-green-500/30 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <i className="fas fa-times"></i>
        </button>
        
        <h2 className="text-2xl font-black italic text-green-400 mb-6 uppercase tracking-wider text-center">
          {isLogin ? 'Вход в систему' : 'Новая чакра'}
        </h2>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-xs p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Имя Ниндзя</label>
              <input 
                type="text" 
                className="w-full bg-black/40 border border-green-900/50 rounded p-3 text-white focus:ring-1 focus:ring-green-500 outline-none" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
            <input 
              type="email" 
              className="w-full bg-black/40 border border-green-900/50 rounded p-3 text-white focus:ring-1 focus:ring-green-500 outline-none" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Пароль</label>
            <input 
              type="password" 
              className="w-full bg-black/40 border border-green-900/50 rounded p-3 text-white focus:ring-1 focus:ring-green-500 outline-none" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-600 py-3 rounded font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : (isLogin ? 'Войти' : 'Создать аккаунт')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          {isLogin ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-green-500 ml-2 hover:underline font-bold"
          >
            {isLogin ? 'Регистрация' : 'Авторизация'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
