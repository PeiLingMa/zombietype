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
 * @param {Function} updateGameState - Function to update game state
 */
export const useZombieManager = () => {
  const [zombieState, setZombieState] = useState({
    currentZombie: zombieImages[Math.floor(Math.random() * zombieImages.length)],
    currentChargeRate: 0.0
  });

  /**
   * Returns the current zombie image
   * @returns {string} - Path to the current zombie image
   */
  const getCurrentZombieImage = useCallback(() => {
    return zombieState.currentZombie;
  }, [zombieState.currentZombie]);

  /**
   * Changes the current zombie to a random one from the available images
   */
  const changeCurrentZombie = useCallback(() => {
    const newZombie = zombieImages[Math.floor(Math.random() * zombieImages.length)];
    setZombieState((prev) => ({
      ...prev,
      currentZombie: newZombie
    }));
  }, []);

  /**
   * Returns the current charge rate of the zombie
   * @returns {number} - Current charge rate (0.0 to 1.0)
   */
  const getCurrentChargeRate = useCallback(() => {
    return zombieState.currentChargeRate;
  }, [zombieState.currentChargeRate]);

  /**
   * Increases the zombie's charge rate by the specified value
   * @param {number} value - Amount to increase the charge rate
   */
  const charge = useCallback((value) => {
    setChargeRate((prev) => {
      return Math.min(prev + value, 1.0);
    });
  }, []);

  /**
   * Sets the zombie's charge rate to a new value
   * @param {number|Function} newCharge - New charge rate value or function to calculate it
   */
  const setChargeRate = useCallback((newCharge) => {
    setZombieState((prev) =>
      typeof newCharge === 'function'
        ? { ...prev, currentChargeRate: newCharge(prev.currentChargeRate) }
        : { ...prev, currentChargeRate: newCharge }
    );
  }, []);

  /**
   * Resets the zombie's charge rate to 0
   */
  const resetChargeRate = useCallback(() => {
    setChargeRate(0);
  }, []);

  return {
    getCurrentZombieImage,
    changeCurrentZombie,
    getCurrentChargeRate,
    charge,
    resetChargeRate
  };
};
