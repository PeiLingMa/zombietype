import { useState, useCallback } from 'react';

// Import zombie images for visualization
import zombie1 from '../zombie1.png';
import zombie2 from '../zombie2.png';
import zombie3 from '../zombie3.png';
import zombie4 from '../zombie4.png';

// setting 4 types of zombies
const zombieTypes = [
  {
    name: 'normal',
    image: zombie1,
    chargeSpeedMultiplier: 1,
    behavior: 'normal',
    spawnWeight: 500,
  },
  {
    name: 'chameleon',
    image: zombie2,
    chargeSpeedMultiplier: 1,
    behavior: 'chameleon',
    spawnWeight: 20,
  },
  {
    name: 'shield',
    image: zombie3,
    chargeSpeedMultiplier: 0.6,
    behavior: 'shield',
    appearsAfterLevel: 1,
    spawnWeight: 15,
  },
  {
    name: 'mimic',
    image: zombie4,
    chargeSpeedMultiplier: 1,
    behavior: 'mimic',
    spawnWeight: 15,
  },
  {
    name: 'boss',
    image: zombie4,
    chargeSpeedMultiplier: 0.4,
    behavior: 'boss',
    appearsAfterLevel: 1,
    spawnWeight: 0,
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
export const useZombieManager = (gameState/*, updateGameState*/) => {
  if (!gameState || typeof gameState.level === 'undefined') {
    console.warn('❗ gameState is undefined or incomplete in useZombieManager');
  }
  const getAvailableZombies = (level) => {
    return zombieTypes.filter(z => !z.appearsAfterLevel || level >= z.appearsAfterLevel);
  };

  // randomly return zombie type by weight
  const weightedRandom = useCallback((items) => {
    const totalWeight = items.reduce((sum, item) => sum + item.spawnWeight, 0);
    const r = Math.random() * totalWeight;
    let acc = 0;
    for (const item of items) {
      acc += item.spawnWeight;
      if (r <= acc)return item;
    }
    return items[items.length - 1]; // fallback
  },[]);

  const getRandomZombie = useCallback((level) => {
    const available = getAvailableZombies(level);
    return weightedRandom(available);
  },[]);

  const [zombieState, setZombieState] = useState({
    currentZombie: getRandomZombie(gameState.level),
    currentChargeRate: 0.0,
    extraState: {}
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
  const changeCurrentZombie = useCallback((completionRate = 0) => {
    let filtered;
    if (completionRate < 0.3) {
      if (completionRate === 0) {
        // 0 completionRate -> no mimic
        filtered = getAvailableZombies(gameState.level).filter(
          z => z.behavior !== 'mimic' && z.behavior !== 'boss'
        );
      } else {
        // completionRate under 0.3 -> no boss
        filtered = getAvailableZombies(gameState.level).filter(
          z => z.behavior !== 'boss'
        );
      }
      const selected = filtered[Math.floor(Math.random() * filtered.length)];
  
      setZombieState((prev) => ({
        ...prev,
        currentZombie: selected,
        extraState: {}
      }));
  
      return selected;
    }
  
    // complationRate >= 0.3 -> only boss
    const boss = zombieTypes.find(z => z.behavior === 'boss');
    setZombieState((prev) => ({
      ...prev,
      currentZombie: boss,
      extraState: {
        bossHp: 3,
        bossStage: 0
      }
    }));
    return boss;
  }, [gameState.level]);

  /**
   * Returns the current charge rate of the zombie
   * @returns {number} - Current charge rate (0.0 to 1.0)
   */
  const getCurrentChargeRate = useCallback(() => {
    return zombieState.currentChargeRate;
  }, [zombieState.currentChargeRate]);

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
   * Increases the zombie's charge rate by the specified value
   * @param {number} value - Amount to increase the charge rate
   */
  const charge = useCallback((value) => {
    setChargeRate((prev) => {
      return Math.min(prev + value, 1.0);
    });
  }, [setChargeRate]);


  /**
   * Resets the zombie's charge rate to 0
   */
  const resetChargeRate = useCallback(() => {
    setChargeRate(0);
  }, [setChargeRate]);

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
