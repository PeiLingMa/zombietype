export const GAME_CONFIG = {
  INITIAL_LIVES: 3,
  ZOMBIES_PER_LEVEL: 5,
  INITIAL_CHARGE_SPEED: 0.05,
  DIFFICULTY_MULTIPLIER: 0.1,
  ACCURACY_THRESHOLD: 0.9,
  SAMPLE_SIZE: 50,
  INITIAL_DIFFICULTY: 'beginner',
  THEME_POOL: ['food', 'animals', 'weather', 'sports'],
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
  }
};
