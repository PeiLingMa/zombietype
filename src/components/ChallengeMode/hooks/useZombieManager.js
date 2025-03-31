import { useState, useCallback } from 'react';

// Import zombie images for visualization
import zombie1 from '../zombie1.png';
import zombie2 from '../zombie2.png';
import zombie3 from '../zombie3.png';
import zombie4 from '../zombie4.png';

const zombieImages = [zombie1, zombie2, zombie3, zombie4];

/**
 * Custom hook to manage zombie generation and lifecycle in Challenge Mode
 * Handles zombie creation, scaling, and lifecycle events
 *
 * @param {Object} gameState - Current game state
 */
export const useZombieManager = (gameState, updateGameState) => {
  const [zombieState, setZombieState] = useState({
    currentZombie: zombieImages[Math.floor(Math.random() * zombieImages.length)],
    currentChargeRate: 0.0
  });

  const changeCurrentZombie = useCallback(() => {
    const newZombie = zombieImages[Math.floor(Math.random() * zombieImages.length)];
    console.log('Changing current zombie', newZombie);
    setZombieState((prev) => ({
      ...prev,
      currentZombie: newZombie
    }));
  }, []);

  // Charge rate setter of the zombie
  const setChargerate = useCallback((newCharge) => {
    setZombieState((prev) =>
      typeof newCharge === 'function'
        ? { ...prev, currentChargeRate: newCharge(prev.currentChargeRate) }
        : { ...prev, currentChargeRate: newCharge }
    );
  }, []);

  return { zombieState, changeCurrentZombie, setChargerate };
};
