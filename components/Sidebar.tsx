
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-xl overflow-hidden shadow-xl border border-green-900/30">
        <div className="bg-green-900/40 p-4 border-b border-green-900/30">
          <h3 className="font-bold text-lg flex items-center gap-2 uppercase tracking-tighter">
            Навигация <span className="text-green-500 font-light">по сайту</span>
          </h3>
        </div>
        <ul className="py-2">
          <li>
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-green-400 sidebar-active-border bg-green-900/10"
            >
              <i className="fas fa-film w-5 text-center"></i>
              Аниме
            </Link>
          </li>
        </ul>
      </div>

      <div className="glass-panel rounded-xl p-4 border border-green-900/30 shadow-lg bg-black/40">
        <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Кстати, вы знали?</h4>
        <p className="text-sm text-gray-300 italic leading-relaxed">
          Администрация сайта следит за порядком в комментариях. Будьте вежливы, иначе Шинген-Буцу забанит ваш IP!
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
