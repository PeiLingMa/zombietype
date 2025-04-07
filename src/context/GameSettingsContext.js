// src/context/GameSettingsContext.js

import React, { createContext, useState, useContext, useMemo } from 'react';
import { GAME_CONFIG as BASE_GAME_CONFIG } from '../components/ChallengeMode/gameConfig';

const GameSettingsContext = createContext();

/**
 * Checks if the provided difficulty is a valid difficulty level.
 *
 * @returns {boolean} - Returns true if the difficulty is valid, otherwise false.
 */

/**
 * Provides the current game settings to the children components.
 *
 * The provided value is an object with the following properties:
 * - `volume`: The current volume.
 * - `updateVolume`: A function that updates the volume.
 * - `gameConfig`: The game configuration object
 *
 * The children components can use the `useGameSettings` hook to access the provided value.
 */
export const GameSettingsProvider = ({ children }) => {
  const [currentVolume, setCurrentVolume] = useState(0.5); // 初始音量設為 50%

  const updateVolume = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, parseFloat(newVolume)));
    setCurrentVolume(clampedVolume);
    console.log(`Volume set to: ${clampedVolume}`);
  };

  const contextValue = useMemo(
    () => ({
      volume: currentVolume,
      updateVolume,
      gameConfig: { ...BASE_GAME_CONFIG }
    }),
    [currentVolume]
  );

  return (
    <GameSettingsContext.Provider value={contextValue}>{children}</GameSettingsContext.Provider>
  );
};

/**
 * Hook to access the game settings context.
 *
 * This hook provides the current game settings context value, which is an object
 * with the following properties:
 * - `volume`: The current volume.
 * - `updateVolume`: A function that updates the volume.
 * - `gameConfig`: The game configuration object.
 *
 * Must be used within a `GameSettingsProvider` component.
 *
 * @returns {object} The game settings context value.
 */
export const useGameSettings = () => {
  const context = useContext(GameSettingsContext);
  if (context === undefined) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider');
  }
  return context;
};

export const useVolumeControl = () => {
  const { volume, updateVolume } = useGameSettings();
  return { volume, updateVolume };
};
