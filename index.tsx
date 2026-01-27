
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, User 
} from 'firebase/auth';
import { 
  getFirestore, collection, onSnapshot, query, orderBy, 
  doc, addDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove, getDoc 
} from 'firebase/firestore';

// --- Инициализация Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyCqu3Y6dci5ghZEbkRHQO54kl7A969C5_E",
  authDomain: "htmlive-a2dec.firebaseapp.com",
  projectId: "htmlive-a2dec",
  storageBucket: "htmlive-a2dec.firebasestorage.app",
  messagingSenderId: "569991957674",
  appId: "1:569991957674:web:7c4fddf55a34e97e8894d3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Вспомогательные функции ---
const getAvatar = (seed: string) => `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=059669`;

// --- Хук для Drag-to-Scroll ---
const useDragScroll = () => {
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, textarea, iframe, select')) return;
    setIsDragging(true);
    startY.current = e.pageY - (scrollRef.current?.offsetTop || 0);
    scrollTop.current = scrollRef.current?.scrollTop || 0;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - (scrollRef.current.offsetTop || 0);
    const walk = (y - startY.current) * 1.5;
    scrollRef.current.scrollTop = scrollTop.current - walk;
  };

  const onMouseUpOrLeave = () => {
    setIsDragging(false);
    document.body.style.userSelect = 'auto';
    document.body.style.cursor = 'default';
  };

  return { scrollRef, onMouseDown, onMouseMove, onMouseUpOrLeave };
};

// --- Компонент Комментариев ---
const CommentsSection: React.FC<{ animeId: string; user: User | null }> = ({ animeId, user }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'anime', animeId, 'comments'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, s => setComments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [animeId]);

  const sendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    await addDoc(collection(db, 'anime', animeId, 'comments'), {
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0],
      text,
      isSpoiler,
      likes: [],
      dislikes: [],
      createdAt: serverTimestamp()
    });
    setText('');
    setIsSpoiler(false);
  };

  const toggleReaction = async (commentId: string, type: 'likes' | 'dislikes') => {
    if (!user) return;
    const ref = doc(db, 'anime', animeId, 'comments', commentId);
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const hasLiked = comment.likes?.includes(user.uid);
    const hasDisliked = comment.dislikes?.includes(user.uid);

    if (type === 'likes') {
      if (hasLiked) {
        await updateDoc(ref, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(ref, { 
          likes: arrayUnion(user.uid),
          dislikes: arrayRemove(user.uid) 
        });
      }
    } else {
      if (hasDisliked) {
        await updateDoc(ref, { dislikes: arrayRemove(user.uid) });
      } else {
        await updateDoc(ref, { 
          dislikes: arrayUnion(user.uid),
          likes: arrayRemove(user.uid) 
        });
      }
    }
  };

  return (
    <div className="mt-20">
      <h3 className="text-3xl font-black italic text-white uppercase mb-10 border-l-4 border-emerald-500 pl-6 tracking-tighter">Отзывы зрителей</h3>
      
      {user ? (
        <form onSubmit={sendComment} className="bg-white/5 p-8 rounded-[2.5rem] mb-12 border border-white/5 shadow-2xl">
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Ваше мнение о тайтле..." 
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white mb-4 outline-none focus:border-emerald-500/30 resize-none h-32"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={isSpoiler} onChange={e => setIsSpoiler(e.target.checked)} className="hidden" />
              <div className={`w-5 h-5 rounded border ${isSpoiler ? 'bg-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'border-white/20'} flex items-center justify-center transition-all`}>
                {isSpoiler && <i className="fas fa-check text-[10px] text-black"></i>}
              </div>
              <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-amber-500 transition-colors">Спойлер</span>
            </label>
            <button type="submit" className="bg-emerald-500 text-black px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all shadow-lg">Отправить</button>
          </div>
        </form>
      ) : (
        <div className="text-center py-12 opacity-30 text-[10px] font-black uppercase tracking-[0.3em] border border-white/5 rounded-3xl mb-12 italic">Авторизуйтесь, чтобы оставить отзыв</div>
      )}

      <div className="space-y-6">
        {comments.map(c => (
          <div key={c.id} className="bg-white/5 p-8 rounded-[2rem] flex gap-6 border border-transparent hover:border-emerald-500/10 transition-all group">
            <img src={getAvatar(c.userId)} className="w-12 h-12 rounded-full border border-emerald-500/20 shadow-lg" />
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">{c.userName}</span>
                <div className="flex gap-4">
                  <button onClick={() => toggleReaction(c.id, 'likes')} className={`text-[10px] font-black transition-all flex items-center gap-2 px-3 py-1 rounded-full border ${c.likes?.includes(user?.uid) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-white/5 text-gray-600 hover:text-emerald-400'}`}>
                    <i className="fas fa-thumbs-up"></i> {c.likes?.length || 0}
                  </button>
                  <button onClick={() => toggleReaction(c.id, 'dislikes')} className={`text-[10px] font-black transition-all flex items-center gap-2 px-3 py-1 rounded-full border ${c.dislikes?.includes(user?.uid) ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/5 text-gray-600 hover:text-red-400'}`}>
                    <i className="fas fa-thumbs-down"></i> {c.dislikes?.length || 0}
                  </button>
                </div>
              </div>
              <div className={`text-gray-400 leading-relaxed font-medium ${c.isSpoiler ? 'filter blur-md hover:blur-0 transition-all cursor-help select-none' : ''}`}>
                {c.text}
              </div>
              {c.isSpoiler && <div className="text-[8px] text-amber-500/50 uppercase font-black mt-3 tracking-widest">Наведите для просмотра спойлера</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Navbar ---
const Navbar: React.FC<{ user: User | null; setShowAuth: (v: boolean) => void }> = ({ user, setShowAuth }) => (
  <nav className="fixed top-0 left-0 right-0 z-[100] h-20 bg-black/80 backdrop-blur-3xl border-b border-white/5">
    <div className="max-w-[1600px] mx-auto h-full px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-4 group">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:rotate-12 transition-transform">
          <i className="fas fa-bolt text-black text-sm"></i>
        </div>
        <div className="text-2xl font-black text-white italic uppercase tracking-tighter">SHINOBI<span className="text-emerald-500">STREAM</span></div>
      </Link>
      <div className="flex items-center gap-8">
        {user ? (
          <div className="flex items-center gap-6">
            {user.email === 'admin@shinobstream.com' && <Link to="/admin" className="text-emerald-500 font-black uppercase text-[10px] border border-emerald-500/30 px-6 py-2.5 rounded-full hover:bg-emerald-500 hover:text-black transition-all shadow-lg">Панель Управления</Link>}
            <img src={getAvatar(user.uid)} className="w-10 h-10 rounded-full border-2 border-emerald-500/30 shadow-xl" />
            <button onClick={() => signOut(auth)} className="text-gray-600 hover:text-red-500 transition-colors text-lg"><i className="fas fa-power-off"></i></button>
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)} className="bg-emerald-500 text-black px-10 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">Личный кабинет</button>
        )}
      </div>
    </div>
  </nav>
);

// --- Anime Card ---
const AnimeCard: React.FC<{ anime: any }> = ({ anime }) => {
  const [epCount, setEpCount] = useState(0);
  useEffect(() => {
    const q = query(collection(db, 'anime', anime.id, 'episodes'));
    return onSnapshot(q, s => setEpCount(s.size));
  }, [anime.id]);

  return (
    <Link to={`/watch/${anime.id}`} className="group relative block aspect-[2/3] rounded-[3rem] overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-700 shadow-xl">
      <img src={anime.poster || anime.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90"></div>
      <div className="absolute inset-x-8 bottom-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-2xl backdrop-blur-md">
            {epCount || anime.episodesCount} СЕР • ★ {anime.rating || '9.0'}
          </div>
        </div>
        <h3 className="text-2xl font-black text-white italic uppercase leading-none group-hover:text-emerald-500 transition-colors line-clamp-2 tracking-tighter">{anime.title}</h3>
      </div>
    </Link>
  );
};

// --- Страницы ---

const Home = () => {
  const [animeList, setAnimeList] = useState<any[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'anime'), orderBy('title', 'asc'));
    return onSnapshot(q, s => setAnimeList(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto px-8 pt-32 pb-32">
      <div className="mb-24 flex items-center justify-between border-b border-white/5 pb-12">
        <h2 className="text-8xl font-black italic uppercase tracking-tighter text-white">КАТАЛОГ <span className="text-emerald-500">2026</span></h2>
        <div className="text-gray-700 font-black uppercase text-[10px] tracking-[0.8em]">{animeList.length} ТАЙТЛОВ</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-12">
        {animeList.map(a => <AnimeCard key={a.id} anime={a} />)}
      </div>
    </div>
  );
};

const Watch = ({ user }: { user: User | null }) => {
  const { id } = useParams();
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEp, setSelectedEp] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    onSnapshot(doc(db, 'anime', id), s => setAnime(s.data()));
    const q = query(collection(db, 'anime', id, 'episodes'), orderBy('number', 'asc'));
    return onSnapshot(q, s => {
      const eps = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setEpisodes(eps);
      if (eps.length > 0) setSelectedEp(eps[0]);
    });
  }, [id]);

  if (!anime) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-8 pt-32 pb-32">
      <div className="flex flex-col lg:flex-row gap-20">
        <div className="lg:w-3/4">
          <h2 className="text-7xl font-black text-white italic uppercase mb-12 leading-none tracking-tighter">{anime.title}</h2>
          <div className="aspect-video bg-black rounded-[4rem] overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-20 relative group">
            {selectedEp ? (
              <iframe src={selectedEp.videoUrl} className="w-full h-full" allowFullScreen frameBorder="0"></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-10 text-4xl font-black italic uppercase tracking-[0.5em] text-white">Видео недоступно</div>
            )}
          </div>
          <div className="bg-white/5 p-16 rounded-[4rem] border border-white/5 mb-20 shadow-2xl">
             <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-emerald-500 mb-10 italic">О тайтле</h4>
             <p className="text-gray-400 text-2xl leading-relaxed font-medium">{anime.description}</p>
          </div>
          <CommentsSection animeId={id || ''} user={user} />
        </div>
        <div className="lg:w-1/4">
          <div className="sticky top-32 bg-white/5 rounded-[3.5rem] p-12 border border-white/5 max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-12 italic">Эпизоды</h3>
            <div className="space-y-5">
              {episodes.map(ep => (
                <button key={ep.id} onClick={() => setSelectedEp(ep)} className={`w-full flex items-center gap-8 p-8 rounded-[2.5rem] transition-all border ${selectedEp?.id === ep.id ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_15px_30px_rgba(16,185,129,0.2)] scale-105' : 'bg-black/20 border-white/5 text-gray-500 hover:bg-white/5'}`}>
                  <span className="text-3xl font-black italic">{ep.number}</span>
                  <span className="font-bold text-sm truncate uppercase tracking-tighter text-left">{ep.title || `Серия ${ep.number}`}</span>
                </button>
              ))}
              {episodes.length === 0 && <div className="text-center py-10 opacity-20 text-[10px] font-black uppercase">Нет серий</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Админ Панель ---
const Admin = ({ user }: { user: User | null }) => {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [poster, setPoster] = useState('');
  const [selAnime, setSelAnime] = useState('');
  const [epNum, setEpNum] = useState(1);
  const [epUrl, setEpUrl] = useState('');
  const [epTitle, setEpTitle] = useState('');

  const isAdmin = user?.email === 'admin@shinobstream.com';

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, 'anime'), orderBy('title', 'asc'));
      return onSnapshot(q, s => setAnimeList(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }
  }, [isAdmin]);

  const addAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'anime'), { 
      title, description: desc, poster, rating: 9.0, status: 'Completed', createdAt: serverTimestamp() 
    });
    setTitle(''); setDesc(''); setPoster('');
    alert('Тайтл добавлен!');
  };

  const addEp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selAnime) return;
    await addDoc(collection(db, 'anime', selAnime, 'episodes'), {
      number: Number(epNum), title: epTitle, videoUrl: epUrl, createdAt: serverTimestamp()
    });
    setEpTitle(''); setEpUrl(''); setEpNum(epNum + 1);
    alert('Серия добавлена!');
  };

  if (!isAdmin) return <div className="py-60 text-center opacity-5 text-9xl font-black italic uppercase tracking-tighter">RESTRICTED</div>;

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-40">
      <h2 className="text-6xl font-black italic text-white uppercase mb-24 border-l-[12px] border-emerald-500 pl-12 tracking-tighter">ПАНЕЛЬ <span className="text-emerald-500">УПРАВЛЕНИЯ</span></h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="bg-white/5 p-16 rounded-[4rem] border border-white/5 shadow-2xl">
          <h3 className="text-xl font-black mb-12 text-emerald-500 uppercase italic tracking-widest">Добавить тайтл</h3>
          <form onSubmit={addAnime} className="space-y-6">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-emerald-500/30" required />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Описание" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-emerald-500/30 h-32" required />
            <input value={poster} onChange={e => setPoster(e.target.value)} placeholder="URL Постера" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-emerald-500/30" required />
            <button type="submit" className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all">Опубликовать</button>
          </form>
        </div>

        <div className="bg-white/5 p-16 rounded-[4rem] border border-white/5 shadow-2xl">
          <h3 className="text-xl font-black mb-12 text-amber-500 uppercase italic tracking-widest">Загрузить серию</h3>
          <form onSubmit={addEp} className="space-y-6">
            <select value={selAnime} onChange={e => setSelAnime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-amber-500/30 appearance-none" required>
              <option value="">Выберите аниме...</option>
              {animeList.map(a => <option key={a.id} value={a.id} className="bg-black text-white">{a.title}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" value={epNum} onChange={e => setEpNum(Number(e.target.value))} placeholder="№ серии" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-amber-500/30" required />
              <input value={epTitle} onChange={e => setEpTitle(e.target.value)} placeholder="Название (опц)" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-amber-500/30" />
            </div>
            <input value={epUrl} onChange={e => setEpUrl(e.target.value)} placeholder="Iframe URL" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-amber-500/30" required />
            <button type="submit" className="w-full bg-amber-500 text-black py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-all">Добавить серию</button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Модалка Авторизации ---
const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try { 
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, pass); 
      } else {
        const u = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(u.user, { displayName: name });
      }
      onClose(); 
    } catch(e: any) { alert(e.message); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
      <div className="bg-[#0a0f0d] w-full max-w-lg rounded-[4rem] p-20 text-center border border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.1)]">
        <h2 className="text-5xl font-black italic text-white mb-16 uppercase tracking-tighter">{isLogin ? 'Вход' : 'Аккаунт'}</h2>
        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold outline-none focus:border-emerald-500/30" required />}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold outline-none focus:border-emerald-500/30" required />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Пароль" className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold outline-none focus:border-emerald-500/30" required />
          <button type="submit" className="w-full bg-emerald-500 py-7 rounded-3xl font-black text-black uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all">{isLogin ? 'Авторизация' : 'Регистрация'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-10 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors underline decoration-emerald-500/30 underline-offset-8">
          {isLogin ? 'Нет аккаунта? Создать его' : 'Уже есть аккаунт? Войти'}
        </button>
        <button onClick={onClose} className="mt-6 block mx-auto text-gray-700 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Закрыть</button>
      </div>
    </div>
  );
};

// --- App ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const { scrollRef, onMouseDown, onMouseMove, onMouseUpOrLeave } = useDragScroll();

  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  return (
    <Router>
      <div ref={scrollRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUpOrLeave} onMouseLeave={onMouseUpOrLeave} className="h-screen overflow-y-auto overflow-x-hidden selection:bg-emerald-500 selection:text-black bg-[#050706] custom-scrollbar">
        <Navbar user={user} setShowAuth={setShowAuth} />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch user={user} />} />
            <Route path="/admin" element={<Admin user={user} />} />
          </Routes>
        </main>
        <footer className="py-24 border-t border-white/5 text-center opacity-30 mt-20">
          <div className="text-3xl font-black italic text-white uppercase mb-4 tracking-tighter">SHINOBI<span className="text-emerald-500">STREAM 2026</span></div>
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-gray-700">© 2026 — PREMIUM QUALITY CONTENT</p>
        </footer>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    </Router>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
