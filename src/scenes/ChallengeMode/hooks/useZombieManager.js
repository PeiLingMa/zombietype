import { useState, useCallback } from 'react';

// Import zombie images for visualization
import zombie1 from '../zombie1.png';
import zombie2 from '../zombie2.png';
import zombie3 from '../zombie3.png';
import zombie4 from '../zombie4.png';

const zombieTypes = [
  {
    name: 'normal',
    image: zombie1,
    chargeSpeedMultiplier: 1,
    behavior: 'normal',
    description: '最常出現的殭屍種類'
  },
  {
    name: 'chameleon',
    image: zombie2,
    chargeSpeedMultiplier: 1,
    behavior: 'chameleon',
    description: '輸入錯誤會改變題目內容'
  },
  {
    name: 'shield',
    image: zombie3,
    chargeSpeedMultiplier: 0.6,
    behavior: 'shield',
    appearsAfterLevel: 1,
    description: '需要兩次正確答案才能消滅（護盾）'
  },
  {
    name: 'mimic',
    image: zombie4,
    chargeSpeedMultiplier: 1,
    behavior: 'mimic',
    description: '輸入第一個字後才會顯示真正的題目'
  },
  {
    name: 'boss',
    image: zombie4,
    chargeSpeedMultiplier: 0.4,
    behavior: 'boss',
    description: '需要三題才會被消滅，通過後換主題並升級',
    extraState:{
      bossHp: 3,
      bossState: 0
    }
  }
];

/**
 * Custom hook to manage zombie generation and lifecycle in Challenge Mode
 * Handles zombie creation, scaling, and lifecycle events
 *
 * @param {Object} gameState - Current game state
 * @param {Function} updateGameState - Function to update game state
 */
export const useZombieManager = (gameState, updateGameState) => {
  const getAvailableZombies = (level) => {
    return zombieTypes.filter(z => !z.appearsAfterLevel || level >= z.appearsAfterLevel);
  };

  const getRandomZombie = (level) => {
    const available = getAvailableZombies(level);
    return available[Math.floor(Math.random() * available.length)];
  };

  const [zombieState, setZombieState] = useState({
    currentZombie: getRandomZombie(gameState.level),
    currentChargeRate: 0.0,
    extraState: {} // for things like shieldHit, mimicRevealed, etc.
  });

  /**
   * Returns the current zombie image
   * @returns {string} - Path to the current zombie image
   */
  const getCurrentZombieImage = useCallback(() => {
    return zombieState.currentZombie.image;
  }, [zombieState.currentZombie.image]);

  /**
   * Changes the current zombie to a random one from the available images
   */
  const changeCurrentZombie = useCallback(() => {
    const newZombie = getRandomZombie(gameState.level);
    console.log('Changing current zombie', newZombie.name);
    setZombieState((prev) => ({
      ...prev,
      currentZombie: newZombie,
      extraState: {}
    }));
    return newZombie;
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

  const setExtraState = useCallback((key, value) => {
    setZombieState((prev) => ({
      ...prev,
      extraState: {
        ...prev.extraState,
        [key]: value
      }
    }));
  }, []);

  const getExtraState = useCallback((key) => {
    return zombieState.extraState?.[key];
  }, [zombieState.extraState]);
  
  const getCurrentZombie = useCallback(() => {
    return zombieState.currentZombie;
  }, [zombieState.currentZombie]);

  return {
    getCurrentZombieImage,
    changeCurrentZombie,
    getCurrentChargeRate,
    charge,
    resetChargeRate,
    setExtraState,
    getExtraState,
    getCurrentZombie,
  };
};
