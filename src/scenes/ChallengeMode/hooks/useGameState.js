import { useCallback, useReducer } from 'react';
import { GAME_CONFIG } from '../gameConfig';
import { useGameSettings } from '../../../context/GameSettingsContext';

/**
 * Game state reducer function
 * @param {Object} state - Current game state
 * @param {Object|Function} action - Update action or update function
 * @returns {Object} New game state
 */
const gameStateReducer = (state, action) => {
  // Handle functional updates (when action is a function)
  if (typeof action === 'function') {
    return action(state);
  }
  // Handle object updates (regular updates)
  return { ...state, ...action };
};

/**
 * Custom hook to manage game state in Challenge Mode
 * Handles game state initialization, updates, and level management
 *
 * @returns {Object} Game state and update functions
 */
export const useGameState = () => {
  // Initial state for the reducer
  const initialState = {
    level: 1,
    lives: 3,
    zombiesDefeated: 0,
    gameOver: false,
    currentTheme: '',
    currentDifficulty: GAME_CONFIG.INITIAL_DIFFICULTY,
    remainingThemes: [...GAME_CONFIG.THEME_POOL]
  };

  // Use reducer instead of useState
  const [gameState, dispatch] = useReducer(gameStateReducer, initialState);

  // Update only specific gameState properties
  // We keep the same function signature for compatibility
  const updateGameState = useCallback((updates) => {
    dispatch(updates);
  }, []);

  return {
    gameState,
    updateGameState
  };
};
