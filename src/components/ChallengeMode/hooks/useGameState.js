// src/components/ChallengeMode/hooks/useGameState.js

import { useState, useEffect } from 'react';
import { GAME_CONFIG } from '../gameConfig';
import { useGameSettings } from '../../../context/GameSettingsContext';

export const useGameState = () => {
  // 從 Context 獲取狀態，目前volume沒有實際調整音量功能(尚未使用到)
  const { difficulty, volume } = useGameSettings();

  const [gameState, setGameState] = useState({
    level: 1,
    lives: GAME_CONFIG.INITIAL_LIVES,
    zombiesDefeated: 0,
    currentTheme: 'food',
    remainingThemes: [...GAME_CONFIG.THEME_POOL],
    themeAccuracy: {},
    gameTime: 0,
    currentDifficulty: difficulty
  });

  useEffect(() => {
    console.log(`useGameState sees config update. Difficulty: ${difficulty}`);
    setGameState((prev) => ({
      ...prev,
      currentDifficulty: difficulty
    }));
  }, [difficulty]);

  const calculateChargeSpeed = () => {
    const baseSpeed = GAME_CONFIG.INITIAL_CHARGE_SPEED;
    const level = gameState.level;
    return baseSpeed * (1 + GAME_CONFIG.DIFFICULTY_MULTIPLIER * (level - 1));
  };

  const updateGameState = (updates) => {
    setGameState((prev) => ({
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
