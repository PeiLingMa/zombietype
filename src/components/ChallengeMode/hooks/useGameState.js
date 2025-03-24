import { useState, useEffect } from 'react';
import { GAME_CONFIG } from '../gameConfig';

export const useGameState = () => {
  const [gameState, setGameState] = useState({
    level: 1,
    lives: GAME_CONFIG.INITIAL_LIVES,
    zombiesDefeated: 0,
    currentTheme: '',
    remainingThemes: [...GAME_CONFIG.THEMES],
    themeAccuracy: {},
    gameTime: 0,
    samplePool: [],
    candidatePool: [],
    currentDifficulty: 'beginner'
  });

  const calculateChargeSpeed = () => {
    const baseSpeed = GAME_CONFIG.INITIAL_CHARGE_SPEED;
    const level = gameState.level;
    return baseSpeed * (1 + GAME_CONFIG.DIFFICULTY_MULTIPLIER * (level - 1));
  };

  const updateGameState = (updates) => {
    setGameState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const checkLevelProgress = () => {
    if (gameState.zombiesDefeated >= GAME_CONFIG.ZOMBIES_PER_LEVEL) {
      updateGameState({
        level: gameState.level + 1,
        zombiesDefeated: 0
      });
    }
  };

  return {
    gameState,
    updateGameState,
    calculateChargeSpeed,
    checkLevelProgress
  };
};
