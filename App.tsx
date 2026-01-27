
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import { 
  onAuthStateChanged, 
  User, 
  signOut, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  getDoc, 
  getDocs, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Anime, Episode } from './types';

// --- Компонент Уведомлений ---
const Notification: React.FC<{ msg: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'border-green-500 bg-green-950/90 text-green-400',
    error: 'border-red-500 bg-red-950/90 text-red-400',
    info: 'border-blue-500 bg-blue-950/90 text-blue-400'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[200] p-5 rounded-2xl border-2 shadow-2xl flex items-center gap-4 fade-in ${colors[type]}`}>
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} text-xl`}></i>
      <span className="font-bold text-sm tracking-wide">{msg}</span>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><i className="fas fa-times"></i></button>
    </div>
  );
};

// --- Карточка Аниме ---
const AnimeCard: React.FC<{ anime: Anime }> = ({ anime }) => {
  const displayImage = anime.poster || anime.imageUrl || 'https://via.placeholder.com/400x600?text=No+Poster';
  
  return (
    <Link to={`/watch/${anime.id}`} className="group relative block fade-in">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-40 h-40 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-green-900/20 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-green-500/60">
             <img 
               src={displayImage} 
               alt={anime.title} 
               className="w-full h-full object-cover transition-all duration-700"
               loading="lazy"
             />
          </div>
          <div className={`absolute -bottom-1 right-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl border ${anime.status?.toLowerCase() === 'ongoing' ? 'bg-green-600 border-green-400' : 'bg-blue-600 border-blue-400'}`}>
            {anime.status || 'ЗАВЕРШЕНО'}
          </div>
        </div>
        
        <h4 className="text-center font-black text-sm md:text-base text-white group-hover:text-green-400 transition-colors line-clamp-2 px-2 uppercase tracking-tight italic">
          {anime.title}
        </h4>
        
        <div className="flex gap-3 mt-4">
           <div className="bg-gray-900/80 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
             <span className="text-[10px] font-black text-gray-400 uppercase">
               {anime.episodesCount ?? 0} СЕР
             </span>
           </div>
           <div className="bg-gray-900/80 px-3 py-1.5 rounded-lg border border-yellow-500/10 flex items-center gap-2">
             <i className="fas fa-star text-yellow-500 text-[9px]"></i>
             <span className="text-[10px] font-black text-white">{anime.rating || '0'}</span>
           </div>
        </div>
      </div>
    </Link>
  );
};

// --- Главная Страница ---
const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'anime'), orderBy('title', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnimeList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = animeList.filter(a => a.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 pt-12 pb-32">
      <div className="glass-panel rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
        <h2 className="text-5xl font-black mb-12 flex items-center gap-6 text-white italic uppercase tracking-tighter">
          <div className="w-16 h-2 bg-green-600 rounded-full"></div>
          Каталог Аниме
        </h2>
        
        <div className="mb-20">
          <div className="relative group max-w-2xl">
            <input 
              type="text" 
              placeholder="Поиск по названию..." 
              className="w-full bg-black/60 border border-green-900/30 rounded-[2rem] py-6 px-16 focus:outline-none focus:ring-4 focus:ring-green-600/20 transition-all text-white placeholder-gray-800 font-bold text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute left-7 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-green-500 transition-colors text-xl"></i>
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center opacity-20"><i className="fas fa-circle-notch fa-spin text-5xl text-green-500"></i></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12 md:gap-16">
            {filtered.map(anime => <AnimeCard key={anime.id} anime={anime} />)}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Страница Просмотра ---
const Watch: React.FC<{ user: User | null; notify: (m: string, t: any) => void }> = ({ user, notify }) => {
  const { id } = useParams();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const snap = await getDoc(doc(db, 'anime', id));
      if (snap.exists()) setAnime({ id: snap.id, ...snap.data() } as Anime);
      
      const q = query(collection(db, 'anime', id, 'episodes'), orderBy('number', 'asc'));
      const qSnap = await getDocs(q);
      const eps = qSnap.docs.map(d => ({ id: d.id, ...d.data() } as Episode));
      setEpisodes(eps);
      if (eps.length > 0) setSelectedEpisode(eps[0]);
    };
    fetchData();
  }, [id]);

  if (!anime) return <div className="min-h-screen flex items-center justify-center"><i className="fas fa-spinner fa-spin text-7xl text-green-600"></i></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="glass-panel rounded-[3rem] p-10 md:p-16 mb-16">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-2/3">
            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">{anime.title}</h2>
            <div className="mb-12">
               <span className="bg-green-700 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                 СЕРИЯ {selectedEpisode?.number || '??'}
               </span>
            </div>
            
            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden border-2 border-green-900/20 shadow-2xl relative mb-12">
              {selectedEpisode ? (
                <iframe src={selectedEpisode.videoUrl} className="w-full h-full" allowFullScreen frameBorder="0"></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-800 font-black italic uppercase tracking-[0.5em] text-xl opacity-20">СЕРИЙ НЕТ</div>
              )}
            </div>
          </div>
          
          <div className="lg:w-1/3">
             <div className="bg-black/40 rounded-[2.5rem] p-8 border border-green-900/20 h-full flex flex-col">
                <h3 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-green-500 mb-8 italic">Выбор серии</h3>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[600px]">
                  {episodes.map(ep => (
                    <button 
                      key={ep.id}
                      onClick={() => setSelectedEpisode(ep)}
                      className={`w-full flex items-center gap-6 p-6 rounded-[1.5rem] transition-all border ${selectedEpisode?.id === ep.id ? 'bg-green-800 border-green-400 text-white' : 'bg-black/50 border-green-950/20 text-gray-600 hover:border-green-600/30'}`}
                    >
                      <span className="text-2xl font-black italic w-12">{ep.number}</span>
                      <span className="font-bold text-sm truncate uppercase">{ep.title}</span>
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Админ-панель ---
const AdminPanel: React.FC<{ user: User | null; notify: (m: string, t: any) => void }> = ({ user, notify }) => {
  const isAdmin = user?.email?.toLowerCase().trim() === 'admin@shinobstream.com';
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  
  const [title, setTitle] = useState('');
  const [poster, setPoster] = useState('');
  const [epCount, setEpCount] = useState(0);

  const [selAnime, setSelAnime] = useState('');
  const [epNum, setEpNum] = useState(1);
  const [epTitle, setEpT] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, 'anime'), orderBy('title', 'asc'));
      return onSnapshot(q, s => setAnimeList(s.docs.map(d => ({ id: d.id, ...d.data() } as Anime))));
    }
  }, [isAdmin]);

  const addAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'anime'), { 
        title, poster, episodesCount: epCount, rating: 0, status: 'Completed', description: '...'
      });
      setTitle(''); setPoster(''); setEpCount(0); notify("Успех!", "success");
    } catch(e) { notify("Ошибка!", "error"); }
  };

  const addEp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selAnime) return;
    try {
      await addDoc(collection(db, 'anime', selAnime, 'episodes'), { 
        number: epNum, title: epTitle, videoUrl: url, createdAt: serverTimestamp()
      });
      setEpT(''); setUrl(''); setEpNum(n => n + 1);
      notify("Серия добавлена!", "success");
    } catch(e) { notify("Ошибка!", "error"); }
  };

  if (!isAdmin) return <div className="text-center py-40 opacity-20 text-3xl font-black italic uppercase">Нет доступа</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-20 space-y-16">
      <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">Shinobi Admin</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="glass-panel p-10 rounded-[2.5rem]">
          <h3 className="text-xl font-black mb-8 text-green-500 uppercase italic">Новое Аниме</h3>
          <form onSubmit={addAnime} className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название" className="w-full bg-black/60 border border-green-950 p-4 rounded-xl text-white font-bold" required />
            <input value={poster} onChange={e => setPoster(e.target.value)} placeholder="URL Постера" className="w-full bg-black/60 border border-green-950 p-4 rounded-xl text-white font-bold" required />
            <input type="number" value={epCount} onChange={e => setEpCount(Number(e.target.value))} placeholder="Кол-во серий" className="w-full bg-black/60 border border-green-950 p-4 rounded-xl text-white font-bold" />
            <button className="w-full bg-green-700 py-5 rounded-xl font-black uppercase text-[10px]">Добавить</button>
          </form>
        </div>

        <div className="glass-panel p-10 rounded-[2.5rem]">
          <h3 className="text-xl font-black mb-8 text-amber-500 uppercase italic">Добавить Серию</h3>
          <form onSubmit={addEp} className="space-y-4">
            <select value={selAnime} onChange={e => setSelAnime(e.target.value)} className="w-full bg-black/60 border border-amber-950 p-4 rounded-xl text-white font-bold" required>
              <option value="">Выбрать аниме...</option>
              {animeList.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" value={epNum} onChange={e => setEpNum(Number(e.target.value))} placeholder="№" className="w-full bg-black/60 border border-amber-950 p-4 rounded-xl text-white font-bold" required />
              <input value={epTitle} onChange={e => setEpT(e.target.value)} placeholder="Название" className="w-full bg-black/60 border border-amber-950 p-4 rounded-xl text-white font-bold" required />
            </div>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Iframe URL" className="w-full bg-black/60 border border-amber-950 p-4 rounded-xl text-white font-bold" required />
            <button className="w-full bg-amber-700 py-5 rounded-xl font-black uppercase text-[10px]">Загрузить</button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Модалка Авторизации ---
const AuthModal: React.FC<{ onClose: () => void; notify: (m: string, t: any) => void }> = ({ onClose, notify }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch(err: any) { notify(err.message, "error"); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-[3rem] p-12 border border-green-500/30">
        <h2 className="text-4xl font-black italic text-green-500 mb-10 uppercase text-center">ВХОД</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full bg-black/60 border border-green-950 rounded-2xl p-4 text-white font-bold" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" className="w-full bg-black/60 border border-green-950 rounded-2xl p-4 text-white font-bold" required />
          <button type="submit" className="w-full bg-green-700 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em]">ВОЙТИ</button>
        </form>
        <button onClick={onClose} className="w-full text-center text-[10px] text-gray-500 uppercase mt-8 font-black italic">Закрыть</button>
      </div>
    </div>
  );
};

// --- Основной компонент App ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [notification, setNotification] = useState<{ m: string; t: any } | null>(null);

  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  const notify = (m: string, t: any) => setNotification({ m, t });

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <nav className="fixed top-0 left-0 right-0 z-[80] bg-[#0b0f0e]/95 backdrop-blur-xl border-b border-green-900/20">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 group">
              <span className="font-black text-xl italic uppercase tracking-tighter">SHINOBI<span className="text-green-500">STREAM</span></span>
            </Link>

            <div className="flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-6">
                  {user.email?.toLowerCase().trim() === 'admin@shinobstream.com' && <Link to="/admin" className="text-[10px] font-black uppercase text-amber-500 bg-amber-950/20 px-4 py-2 rounded-full border border-amber-500/30">Админ</Link>}
                  <button onClick={() => signOut(auth)} className="text-gray-700 hover:text-red-500 transition-colors"><i className="fas fa-sign-out-alt"></i></button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="bg-green-800/20 text-green-500 border border-green-800/30 px-6 py-2 rounded-full text-[10px] font-black uppercase italic">ВОЙТИ</button>
              )}
            </div>
          </div>
        </nav>

        <header className="pt-32 pb-16 text-center">
             <h1 className="text-8xl md:text-[10rem] font-black italic tracking-tighter text-white select-none leading-none uppercase">SHINOBI<span className="text-green-500">STREAM</span></h1>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch user={user} notify={notify} />} />
            <Route path="/admin" element={<AdminPanel user={user} notify={notify} />} />
          </Routes>
        </main>

        <footer className="py-20 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] italic italic">© SHINOBISTREAM — Путь Ниндзя</p>
        </footer>

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} notify={notify} />}
        {notification && <Notification msg={notification.m} type={notification.t} onClose={() => setNotification(null)} />}
      </div>
    </Router>
  );
};

export default App;
