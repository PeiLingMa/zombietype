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
    description: '需要三題才會被消滅，通過後換主題並升級'
  }
];

/**
 * Custom hook to manage zombie generation and lifecycle in Challenge Mode
 * Handles zombie creation, scaling, and lifecycle events
 *
 * @param {Object} gameState - Current game state
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

  const changeCurrentZombie = useCallback(() => {
    const newZombie = getRandomZombie(gameState.level);
    console.log('Changing zombie to:', newZombie.name);
    setZombieState({
      currentZombie: newZombie,
      currentChargeRate: 0.0,
      extraState: {}
    });
  }, [gameState.level]);

  // Charge rate setter of the zombie
  const setChargerate = useCallback((newCharge) => {
    setZombieState((prev) =>
      typeof newCharge === 'function'
        ? { ...prev, currentChargeRate: newCharge(prev.currentChargeRate) }
        : { ...prev, currentChargeRate: newCharge }
    );
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

  return { zombieState, changeCurrentZombie, setChargerate, setExtraState };
};
