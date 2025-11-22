// Game Configuration Constants

export const BGM_PLAYLIST = [
  { title: "Pallet Town", file: "/music/pallet.mp3" },
  { title: "Cinnabar Island", file: "/music/cinnabar.mp3" },
  { title: "Pokemon Center", file: "/music/center.mp3" },
  { title: "Road to Viridian City", file: "/music/roadtoviri.mp3" },
  { title: "Eterna City", file: "/music/eternacity.mp3" },
];

export const GEN_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
};

export const DEFAULT_VOLUME = {
  BGM: 0.1,
  CRY: 0.3,
  SFX: 0.1,
};

export const CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_POKEMON_API_URL || 'https://pokeapi.co/api/v2',
  ENABLE_AUDIO: process.env.NEXT_PUBLIC_ENABLE_AUDIO !== 'false',
  LOADING_DELAY: 1500,
  CHECKING_DELAY: 1500,
  MAX_RETRIES: 3,
};

export const ALL_GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
