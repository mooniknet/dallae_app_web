export const MUSIC_THEMES = [
  {
    id: 'nature',
    name: '자연',
    tracks: [
      { id: 'gentle-rain', name: 'Gentle Rain', file: 'nature/karim_alaoui-gentle-rain-sounds-for-relaxation-and-sleep-585942.mp3' },
      { id: 'rain-thunder', name: 'Rain & Thunder', file: 'nature/loswin23-rain-and-thunder-585637.mp3' },
      { id: 'ocean-waves', name: 'Ocean Waves · Pebbles Coast', file: 'nature/somaa26-ocean-waves_-pebbles-coast-568723.mp3' },
      { id: 'forest-birds', name: 'Mountain Forest Birds', file: 'nature/wr-sound-library-mountain-forest-birds-singing-no-copyright-infinite-556890.mp3' },
    ],
  },
  {
    id: 'instruments',
    name: '악기',
    tracks: [
      { id: 'home-again', name: 'Home Again', file: 'instruments/mickeyscat-home-again-589835.mp3' },
    ],
  },
  {
    id: 'universe',
    name: '우주',
    tracks: [
      { id: 'silent-universe', name: 'Silent Universe', file: 'universe/universfield-silent-universe-351473.mp3' },
    ],
  },
]

export const DEFAULT_MUSIC_VOLUME = 0

export function allTrackIds() {
  return MUSIC_THEMES.flatMap((theme) => theme.tracks.map((t) => t.id))
}
