import { useState, useEffect } from 'react';
import { GAME_CONFIG } from '../gameConfig';

export const useGameState = () => {
  const [gameState, setGameState] = useState({
    level: 1,
    lives: GAME_CONFIG.INITIAL_LIVES,
    zombiesDefeated: 0,
    currentTheme: 'food',
    remainingThemes: [...GAME_CONFIG.THEME_POOL],
    themeAccuracy: {},
    gameTime: 0,
    currentDifficulty: GAME_CONFIG.INITIAL_DIFFICULTY
  });

  const updateGameState = (updates) => {
    setGameState((prev) => ({
      ...prev,
      ...updates
    }));
  };

  return {
    gameState,
    updateGameState
  };
};
