
import { Anime } from './types';

export const MOCK_ANIME: Anime[] = [
  {
    id: '1',
    title: 'Naruto: Shippuden',
    description: 'Naruto Uzumaki, is an adolescent ninja who searches for recognition from his peers and dreams of becoming the Hokage.',
    imageUrl: 'https://picsum.photos/seed/naruto/400/600',
    rating: 9.2,
    // Fix: changed 'episodes' to 'episodesCount' to match the Anime interface
    episodesCount: 500,
    status: 'completed',
    genres: ['Action', 'Adventure', 'Fantasy']
  },
  {
    id: '2',
    title: 'Bleach: Thousand-Year Blood War',
    description: 'The peace is suddenly broken when warning sirens blare through the Soul Society.',
    imageUrl: 'https://picsum.photos/seed/bleach/400/600',
    rating: 9.1,
    // Fix: changed 'episodes' to 'episodesCount' to match the Anime interface
    episodesCount: 52,
    status: 'ongoing',
    genres: ['Action', 'Supernatural']
  },
  {
    id: '3',
    title: 'One Piece',
    description: 'Monkey D. Luffy refuses to let anyone or anything stand in the way of his quest to become the king of all pirates.',
    imageUrl: 'https://picsum.photos/seed/onepiece/400/600',
    rating: 8.9,
    // Fix: changed 'episodes' to 'episodesCount' to match the Anime interface
    episodesCount: 1080,
    status: 'ongoing',
    genres: ['Action', 'Adventure', 'Comedy']
  },
  {
    id: '4',
    title: 'My Hero Academia',
    description: 'In a world where people with superpowers are the norm, Izuku Midoriya has dreams of one day becoming a Hero.',
    imageUrl: 'https://picsum.photos/seed/mha/400/600',
    rating: 8.5,
    // Fix: changed 'episodes' to 'episodesCount' to match the Anime interface
    episodesCount: 138,
    status: 'ongoing',
    genres: ['Action', 'School', 'Superpower']
  },
  {
    id: '5',
    title: 'Attack on Titan',
    description: 'Humanity is forced to live in cities surrounded by enormous walls due to the Titans.',
    imageUrl: 'https://picsum.photos/seed/aot/400/600',
    rating: 9.5,
    // Fix: changed 'episodes' to 'episodesCount' to match the Anime interface
    episodesCount: 88,
    status: 'completed',
    genres: ['Action', 'Drama', 'Fantasy']
  },
  {
    id: '6',
    title: 'Demon Slayer',
    description: 'A youth who sells charcoal for a living, Tanjiro finds his family slaughtered by a demon.',
    imageUrl: 'https://picsum.photos/seed/demonslayer/400/600',
    rating: 8.7,
    // Fix: changed 'episodes' to 'episodesCount' to match the Anime interface
    episodesCount: 55,
    status: 'ongoing',
    genres: ['Action', 'Historical', 'Supernatural']
  }
];

export const CHAKRA_NAV = [
  { label: 'ВОДА', href: '#water', chakra: 'water' },
  { label: 'МОЛНИЯ', href: '#lightning', chakra: 'lightning' },
  { label: 'ЗЕМЛЯ', href: '#earth', chakra: 'earth' },
  { label: 'ВЕТЕР', href: '#wind', chakra: 'wind' },
  { label: 'ОГОНЬ', href: '#fire', chakra: 'fire' },
  { label: 'ЧАКРА', href: '#chakra', chakra: 'chakra' },
];