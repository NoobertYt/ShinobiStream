
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-28 pb-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center">
          <div className="mb-8 relative group">
             <h1 className="text-8xl md:text-[11rem] font-black italic tracking-tighter text-white drop-shadow-[0_15px_15px_rgba(0,0,0,1)] transition-transform duration-1000 group-hover:scale-105 select-none">
              SHINOBI<span className="text-green-500">STREAM</span>
            </h1>
            <div className="absolute -bottom-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000"></div>
          </div>
          <p className="text-gray-500 text-xl md:text-3xl font-black tracking-[0.5em] uppercase text-center italic opacity-70 leading-none">
            Твоя история начинается в один клик
          </p>
        </div>
      </div>
      
      {/* Мягкие силуэты персонажей без оружия */}
      <div className="hidden lg:block absolute left-[-8%] bottom-0 pointer-events-none opacity-[0.02] hover:opacity-10 transition-opacity duration-1000">
        <img src="https://picsum.photos/seed/shinobi_art_1/600/900" alt="" className="h-[700px] object-contain mask-soft" />
      </div>
      <div className="hidden lg:block absolute right-[-8%] bottom-0 pointer-events-none opacity-[0.02] hover:opacity-10 transition-opacity duration-1000">
        <img src="https://picsum.photos/seed/shinobi_art_2/600/900" alt="" className="h-[700px] object-contain mask-soft" />
      </div>

      <style>{`
        .mask-soft {
          mask-image: linear-gradient(to top, black 40%, transparent 100%);
          -webkit-mask-image: linear-gradient(to top, black 40%, transparent 100%);
        }
      `}</style>
    </header>
  );
};

export default Header;
