import { useState, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../gameConfig';
import { useGameSettings } from '../../../context/GameSettingsContext';

/**
 * Custom hook to manage game state in Challenge Mode
 * Handles game state initialization, updates, and level management
 *
 * @returns {Object} Game state and update functions
 */
export const useGameState = () => {
  // Initialize game state with default values
  const [gameState, setGameState] = useState({
    level: 1,
    lives: 3,
    zombiesDefeated: 0,
    gameOver: false,
    currentTheme: '',
    currentDifficulty: GAME_CONFIG.INITIAL_DIFFICULTY,
    remainingThemes: [...GAME_CONFIG.THEME_POOL]
  });

  // Update only specific gameState properties
  const updateGameState = useCallback((updates) => {
    setGameState((prev) =>
      typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }
    );
  }, []);

  return {
    gameState,
    updateGameState
  };
};
