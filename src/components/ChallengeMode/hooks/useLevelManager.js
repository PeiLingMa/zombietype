import { useCallback } from 'react';
import { GAME_CONFIG } from '../gameConfig';

export const useLevelManager = (gameState, updateGameState) => {
  const getChargeSpeed = useCallback(() => {
    const baseSpeed = GAME_CONFIG.INITIAL_CHARGE_SPEED;
    const level = gameState.level;
    return baseSpeed * (1 + GAME_CONFIG.DIFFICULTY_MULTIPLIER * (level - 1));
  }, [gameState.level]);

  const checkLevelProgress = useCallback(() => {
    if (gameState.zombiesDefeated >= GAME_CONFIG.ZOMBIES_PER_LEVEL) {
      updateGameState({
        level: gameState.level + 1,
        zombiesDefeated: 0
      });
    }
  }, [gameState.zombiesDefeated, gameState.level, updateGameState]);

  return {
    getChargeSpeed,
    checkLevelProgress
  };
};
