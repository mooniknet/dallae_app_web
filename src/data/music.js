export const MUSIC_THEMES = [
  {
    id: 'nature',
    name: '자연',
    tracks: [
      { id: 'gentle-rain', name: 'Gentle Rain', icon: '🌧️', file: 'nature/karim_alaoui-gentle-rain-sounds-for-relaxation-and-sleep-585942.mp3' },
      { id: 'rain-thunder', name: 'Rain & Thunder', icon: '⛈️', file: 'nature/loswin23-rain-and-thunder-585637.mp3' },
      { id: 'ocean-waves', name: 'Ocean Waves · Pebbles Coast', icon: '🌊', file: 'nature/somaa26-ocean-waves_-pebbles-coast-568723.mp3' },
      { id: 'forest-birds', name: 'Mountain Forest Birds', icon: '🐦', file: 'nature/wr-sound-library-mountain-forest-birds-singing-no-copyright-infinite-556890.mp3' },
    ],
  },
  {
    id: 'instruments',
    name: '악기',
    tracks: [
      { id: 'home-again', name: 'Home Again', icon: '🎹', file: 'instruments/mickeyscat-home-again-589835.mp3' },
    ],
  },
  {
    id: 'universe',
    name: '우주',
    tracks: [
      { id: 'silent-universe', name: 'Silent Universe', icon: '🌌', file: 'universe/universfield-silent-universe-351473.mp3' },
    ],
  },
]

export const DEFAULT_MUSIC_VOLUME = 0
export const DEFAULT_ON_VOLUME = 0.5

export function allTrackIds() {
  return MUSIC_THEMES.flatMap((theme) => theme.tracks.map((t) => t.id))
}
