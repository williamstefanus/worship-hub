/**
 * Mock song data for local development and UI testing.
 * In production, this is replaced by Supabase queries.
 *
 * Each song object maps to the `songs` table schema:
 *   id, title, key, bpm, pdf_url, audio_url, tags
 */
export const mockSongs = [
  {
    id: '1',
    title: 'Way Maker',
    key: 'Eb Major',
    bpm: 68,
    tags: ['Contemporary', 'Worship'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'What A Beautiful Name',
    key: 'D Major',
    bpm: 72,
    tags: ['Modern', 'Hillsong'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Oceans (Where Feet May Fail)',
    key: 'D Major',
    bpm: 78,
    tags: ['Contemporary', 'Hillsong'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '4',
    title: 'Build My Life',
    key: 'G Major',
    bpm: 70,
    tags: ['Modern Worship'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '5',
    title: 'Goodness of God',
    key: 'A Major',
    bpm: 65,
    tags: ['Contemporary', 'Bethel'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '6',
    title: 'Holy Spirit',
    key: 'C Major',
    bpm: 60,
    tags: ['Intimate', 'Bryan & Katie Torwalt'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    id: '7',
    title: 'Reckless Love',
    key: 'G Major',
    bpm: 75,
    tags: ['Cory Asbury', 'Contemporary'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: '8',
    title: '10,000 Reasons (Bless the Lord)',
    key: 'G Major',
    bpm: 73,
    tags: ['Matt Redman', 'Praise'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: '9',
    title: 'King of Kings',
    key: 'B Minor',
    bpm: 66,
    tags: ['Hillsong', 'Anthemic'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  },
  {
    id: '10',
    title: 'Living Hope',
    key: 'Bb Major',
    bpm: 80,
    tags: ['Phil Wickham', 'Energetic'],
    pdf_url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  },
]
