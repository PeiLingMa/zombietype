import { useRef, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../gameConfig';

const { SOUND_CONFIG } = GAME_CONFIG;

/**
 * Custom hook for managing game sound effects
 * @returns {Object} Sound manager functions
 */
export const useSoundManager = () => {
  const sounds = useRef({});

  // Preload all sound effects
  useEffect(() => {
    Object.entries(SOUND_CONFIG).forEach(([key, config]) => {
      const audio = new Audio(process.env.PUBLIC_URL + `/sounds/${config.file}`);
      audio.volume = config.volume;
      audio.load();
      sounds.current[key] = audio;
    });

    // Cleanup function
    return () => {
      Object.values(sounds.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  /**
   * Play a sound effect
   * @param {string} soundKey - Key of the sound to play
   */
  const playSound = useCallback((soundKey) => {
    if (sounds.current[soundKey]) {
      const audio = sounds.current[soundKey];
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn('Sound playback blocked:', err));
    }
  }, []);

  /**
   * Set volume for a specific sound
   * @param {string} soundKey - Key of the sound
   * @param {number} volume - Volume level (0-1)
   */
  const setVolume = (soundKey, volume) => {
    if (sounds.current[soundKey]) {
      sounds.current[soundKey].volume = Math.max(0, Math.min(1, volume));
    }
  };

  /**
   * Set volume for all sounds
   * @param {number} volume - Volume level (0-1)
   */
  const setMasterVolume = (volume) => {
    Object.values(sounds.current).forEach((audio) => {
      audio.volume = Math.max(0, Math.min(1, volume));
    });
  };

  return {
    playSound,
    setVolume,
    setMasterVolume
  };
};
