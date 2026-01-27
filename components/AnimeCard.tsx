
import React from 'react';
import { Link } from 'react-router-dom';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  return (
    <Link to={`/watch/${anime.id}`} className="group relative block">
      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-green-900/50 shadow-2xl transition-all group-hover:scale-105 group-hover:border-green-500">
             <img 
               src={anime.imageUrl} 
               alt={anime.title} 
               className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
             />
          </div>
          <div className={`absolute bottom-0 right-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${anime.status === 'ongoing' ? 'bg-green-600' : 'bg-blue-600'}`}>
            {anime.status}
          </div>
        </div>
        
        <h4 className="text-center font-bold text-sm md:text-base text-gray-200 group-hover:text-green-400 transition-colors line-clamp-2 px-2 italic uppercase">
          {anime.title}
        </h4>
        
        <div className="flex gap-1 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
           {/* Fix: Using episodesCount instead of episodes to match the Anime interface */}
           <span className="text-[10px] bg-black/40 px-1.5 rounded text-gray-400">{anime.episodesCount || 0} серий</span>
           <span className="text-[10px] bg-black/40 px-1.5 rounded text-yellow-500 font-bold">
             <i className="fas fa-star text-[8px] mr-1"></i>{anime.rating?.toFixed(1) || '0.0'}
           </span>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;