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
