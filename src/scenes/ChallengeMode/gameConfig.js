export const GAME_CONFIG = {
  INITIAL_LIVES: 3,
  ZOMBIES_PER_LEVEL: 5,
  CHARGE_INTERVAL: 300,
  INITIAL_CHARGE_SPEED: 0.03,
  DIFFICULTY_MULTIPLIER: 0.1,
  ACCURACY_THRESHOLD: 0.9,
  SAMPLE_SIZE: 50,
  INITIAL_DIFFICULTY: 'beginner',
  THEME_POOL: [
    'animal',
    'art',
    'body and health',
    'clothes',
    'crime',
    'education',
    'describe',
    'food',
    'house',
    'money',
    'nature',
    'actions',
    'appearence',
    'personality',
    'politics',
    'relationships',
    'shopping',
    'technology',
    'travel',
    'work'
  ],
  DIFFICULTY_LEVELS: {
    BEGINNER: 1,
    MEDIUM: 2,
    HARD: 3
  },
  SAMPLING_RATIOS: {
    INITIAL: {
      beginner: 0.4,
      medium: 0.4,
      hard: 0.2
    },
    ADVANCED: {
      beginner: 0.2,
      medium: 0.4,
      hard: 0.4
    }
  },
  // Sound effects configuration
  SOUND_CONFIG: {
    accepted: {
      file: 'accept.wav',
      volume: 1.0
    },
    defeated: {
      file: 'defeated.mp3',
      volume: 0.5
    },
    wrongAnswer: {
      file: 'wrong_answer.mp3',
      volume: 1
    }
    // Add more sound effects here
  }
};
