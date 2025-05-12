import { useCallback, useReducer } from 'react';

/**
 * Game state reducer function
 * @param {Object} state - Current game state
 * @param {Object|Function} action - Update action or update function
 * @returns {Object} New game state
 */
const gameStateReducer = (state, action) => {
  if (typeof action === 'function') {
    return action(state);
  }
  if (action.type === 'initial') {
    return {
      level: 1,
      lives: 3,
      zombiesDefeated: 0,
      gameOver: false,
      currentTheme: '',
      remainingThemes: []
    };
  }
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
    remainingThemes: []
  };

  // Use reducer instead of useState
  const [gameState, dispatch] = useReducer(gameStateReducer, initialState);

  // Update only specific gameState properties
  // We keep the same function signature for compatibility
  const updateGameState = useCallback((updates) => {
    dispatch(updates);
  }, []);

  const initializeGameState = useCallback(() => {
    dispatch({
      type: 'initial'
    });
  }, []);

  return {
    gameState,
    updateGameState,
    initializeGameState
  };
};
