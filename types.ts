
export interface Episode {
  id?: string;
  number: number;
  title: string;
  videoUrl: string;
}

export interface Comment {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: any;
  likes?: string[]; 
  dislikes?: string[]; 
  isSpoiler?: boolean;
}

export interface Anime {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  poster?: string; // На скриншоте поле называется poster
  rating: number;
  status: string;
  genres: string[];
  episodesCount?: number; // Как на скриншоте
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
}
