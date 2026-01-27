
import React, { useState, useRef } from 'react';
import { updateProfile, User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../firebase';

const UserSettings: React.FC<{ user: User | null }> = ({ user }) => {
  const [name, setName] = useState(user?.displayName || '');
  const [photo, setPhoto] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setMsg('Загрузка изображения...');
    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update local state and Firebase profile
      setPhoto(downloadURL);
      await updateProfile(user, { photoURL: downloadURL });
      setMsg('Аватар обновлен!');
    } catch (error: any) {
      console.error(error);
      setMsg('Ошибка при загрузке: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: name });
      setMsg('Имя обновлено!');
    } catch (e: any) {
      setMsg('Ошибка при обновлении: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-white">Войдите в аккаунт.</div>;

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="glass-panel p-8 rounded-2xl border border-green-500/20 shadow-2xl">
        <h2 className="text-2xl font-black mb-8 text-center text-green-400 uppercase tracking-widest">Профиль Ниндзя</h2>
        
        {msg && <p className="mb-4 text-center text-xs text-green-500 font-bold">{msg}</p>}

        <div className="space-y-6">
          <div className="flex flex-col items-center mb-4">
             <div className="w-32 h-32 rounded-full bg-black/50 border-2 border-green-500 overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {photo ? (
                  <img src={photo} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                ) : (
                  <i className="fas fa-user-ninja text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-700"></i>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <i className="fas fa-camera text-white text-xl"></i>
                </div>
             </div>
             <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">Нажмите на фото, чтобы изменить</p>
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*" 
               onChange={handleFileChange}
               disabled={loading}
             />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Имя в системе</label>
            <div className="flex gap-2">
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="flex-1 bg-black/40 border border-green-900/50 p-3 rounded text-white text-sm focus:ring-1 focus:ring-green-500 outline-none" 
                placeholder="Ваше имя"
              />
              <button 
                onClick={handleSaveName}
                disabled={loading}
                className="bg-green-700 hover:bg-green-600 px-4 rounded text-xs font-bold uppercase disabled:opacity-50 transition-colors"
              >
                ОК
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-green-900/20">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Email:</span>
              <span className="text-gray-300">{user.email}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>UID:</span>
              <span className="text-gray-400 font-mono text-[9px]">{user.uid}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
