
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onAuthClick, onLogout }) => {
  const isAdmin = user?.email?.toLowerCase().trim() === 'admin@shinobstream.com';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a2421]/90 backdrop-blur-md border-b border-green-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center text-green-400 shadow-inner">
              <i className="fas fa-play text-[10px]"></i>
            </div>
            <span className="font-black text-lg hidden sm:block tracking-tighter uppercase italic">SHINOBI.ST</span>
          </Link>

          <div className="flex items-center gap-3">
             {user ? (
               <div className="flex items-center gap-4">
                 {isAdmin && (
                   <Link to="/admin" className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-[10px] font-black flex items-center gap-1">
                     <i className="fas fa-shield-alt"></i>АДМИН
                   </Link>
                 )}
                 <Link to="/settings" className="flex items-center gap-2 group">
                   <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center overflow-hidden border border-green-500">
                     {user.photoURL ? (
                       <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                       <i className="fas fa-user text-[10px]"></i>
                     )}
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">
                     {user.displayName || 'Пользователь'}
                   </span>
                 </Link>
                 <button onClick={onLogout} title="Выйти" className="text-gray-500 hover:text-red-500 transition-colors">
                   <i className="fas fa-sign-out-alt"></i>
                 </button>
               </div>
             ) : (
               <button 
                onClick={onAuthClick}
                className="flex items-center gap-2 bg-green-800/40 hover:bg-green-800 border border-green-700 rounded px-4 py-1.5 transition-all text-[10px] font-black tracking-widest"
               >
                  ВОЙТИ
               </button>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
