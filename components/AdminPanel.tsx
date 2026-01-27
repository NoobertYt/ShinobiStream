
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';
import { Anime } from '../types';

const AdminPanel: React.FC<{ user: User | null }> = ({ user }) => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState('');
  const [epNum, setEpNum] = useState(1);
  const [epTitle, setEpTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');

  // Robust check for admin
  const isAdmin = user?.email?.toLowerCase().trim() === 'admin@shinobstream.com';

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'anime'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnimeList(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Anime)));
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const handleAddAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'anime'), {
        title,
        description: desc,
        imageUrl: img,
        rating: 0,
        ratingSum: 0,
        ratingCount: 0,
        status: 'ongoing',
        genres: []
      });
      setTitle(''); setDesc(''); setImg('');
      setMessage('Аниме успешно добавлено!');
    } catch (e) { setMessage('Ошибка при добавлении.'); }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimeId) return;
    try {
      await addDoc(collection(db, 'anime', selectedAnimeId, 'episodes'), {
        number: Number(epNum),
        title: epTitle,
        videoUrl: videoUrl
      });
      setEpTitle(''); setVideoUrl(''); setEpNum(epNum + 1);
      setMessage('Серия успешно добавлена!');
    } catch (e) { setMessage('Ошибка при добавлении серии.'); }
  };

  if (!isAdmin) return (
    <div className="max-w-4xl mx-auto py-20 px-4 text-center">
      <div className="glass-panel p-10 rounded-2xl border border-red-500/30">
        <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-6"></i>
        <h2 className="text-3xl font-bold mb-4">Техника Запечатывания!</h2>
        <p className="text-gray-400">У вас недостаточно чакры (прав доступа) для просмотра этого свитка.</p>
        <p className="text-xs text-gray-600 mt-6 bg-black/40 p-4 rounded border border-gray-900">
           Для доступа почта должна быть строго: <span className="text-green-500 font-mono">admin@ShinobStream.com</span><br/>
           Ваша текущая почта: <span className="text-red-400 font-mono">{user?.email || 'Вы не вошли'}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black italic text-white mb-8 border-l-4 border-green-500 pl-4 uppercase">Хокаге-Панель</h1>
      
      {message && <div className="bg-green-900/40 p-4 rounded mb-6 text-green-400 border border-green-500/30">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-xl border border-green-900/30">
          <h3 className="text-lg font-bold mb-4 text-green-400">Добавить Новое Аниме</h3>
          <form onSubmit={handleAddAnime} className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название" className="w-full bg-black/40 border border-green-900/50 p-2 rounded text-sm text-white" required />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Описание" className="w-full bg-black/40 border border-green-900/50 p-2 rounded text-sm text-white h-24" required />
            <input value={img} onChange={e => setImg(e.target.value)} placeholder="URL Постера" className="w-full bg-black/40 border border-green-900/50 p-2 rounded text-sm text-white" required />
            <button type="submit" className="w-full bg-green-700 py-2 rounded text-xs font-bold uppercase hover:bg-green-600 transition-colors">Сохранить</button>
          </form>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-green-900/30">
          <h3 className="text-lg font-bold mb-4 text-green-400">Добавить Серию</h3>
          <form onSubmit={handleAddEpisode} className="space-y-4">
            <select 
              className="w-full bg-black/40 border border-green-900/50 p-2 rounded text-sm text-white"
              value={selectedAnimeId}
              onChange={e => setSelectedAnimeId(e.target.value)}
              required
            >
              <option value="">Выберите аниме...</option>
              {animeList.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <input type="number" value={epNum} onChange={e => setEpNum(Number(e.target.value))} placeholder="Номер серии" className="w-full bg-black/40 border border-green-900/50 p-2 rounded text-sm text-white" required />
            <input value={epTitle} onChange={e => setEpTitle(e.target.value)} placeholder="Название серии" className="w-full bg-black/40 border border-green-900/50 p-2 rounded text-sm text-white" required />
            <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="URL Видео (Iframe/Direct)" className="w-full bg-black/40 border border-green-900/50 p-2 rounded text-sm text-white" required />
            <button type="submit" className="w-full bg-blue-700 py-2 rounded text-xs font-bold uppercase hover:bg-blue-600 transition-colors">Добавить Серию</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
