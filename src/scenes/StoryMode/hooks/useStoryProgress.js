// src\scenes\StoryMode\hooks\useStoryProgress.js
import { useState, useEffect, useRef } from 'react';

/**
 * Handles loading, saving, and clearing progress.
 *
 * @param {string} storyId - Unique identifier for the story.
 * @param {Array} scenes - The array of scene data for the story
 * @returns {{
 *   storyProgress: object,
 *   setStoryProgress: React.Dispatch<React.SetStateAction<object>>,
 *   initialSceneId: number,
 *   initialDialogueHistory: Array
 * }} - Returns the story progress state, setter, and initial values loaded from storage.
 */
export default function useStoryProgress({ storyId, scenes }) {
  const localStorageKey = `storyProgress_${storyId}`;

  // State to hold the current story progress
  const [storyProgress, setStoryProgress] = useState(() => {
    // Initial state comes from localStorage if available, otherwise defaults
    const savedProgress = localStorage.getItem(localStorageKey);
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress); // { storyId, currentSceneId, answers, dialogueHistory, startTime, endTime }
        if (
          parsedProgress &&
          parsedProgress.storyId === storyId &&
          Array.isArray(parsedProgress.dialogueHistory)
        ) {
          // console.log('Loaded story progress from localStorage:', parsedProgress);
          return parsedProgress;
        } else {
          console.warn('Invalid or mismatched story progress in localStorage. Starting new story.');
          localStorage.removeItem(localStorageKey); // Clear invalid data
        }
      } catch (error) {
        console.error('Failed to parse story progress from localStorage:', error);
        localStorage.removeItem(localStorageKey); // Clear corrupted data
      }
    }

    const initialProgress = {
      storyId: storyId,
      // currentIndex: 0,
      currentSceneId: scenes?.[0]?.id ?? 0,
      answers: [],
      dialogueHistory: [],
      startTime: new Date().toISOString(),
      endTime: null // null: story not ended
    };
    // console.log('Initializing new story progress:', initialProgress);
    return initialProgress;
  });

  const initialIndex = scenes?.findIndex((scene) => scene.id === storyProgress.currentSceneId);

  const resolvedInitialSceneId =
    initialIndex !== undefined && initialIndex !== -1 ? initialIndex : 0;

  const hasInitialized = useRef(false);
  const storyProgressRef = useRef(storyProgress);

  // Update ref whenever storyProgress state changes
  useEffect(() => {
    storyProgressRef.current = storyProgress;
  }, [storyProgress]);

  useEffect(() => {
    // Only save after the initial state has been determined
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    // Avoid saving if the story is already marked as ended,
    if (storyProgress.endTime !== null) {
      // console.log('Story ended, skipping save (will be removed on unload).');
      return;
    }

    // console.log('Saving story progress to localStorage:', storyProgress);
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(storyProgress));
    } catch (error) {
      console.error('Failed to save story progress to localStorage:', error);
      // Handle potential localStorage quota issues
    }
  }, [storyProgress, localStorageKey]); // Depend on storyProgress and localStorageKey

  // run when storyId is ready
  useEffect(() => {
    const loadProgress = () => {
      try {
        const savedProgress = localStorage.getItem(localStorageKey);
        if (!savedProgress) {
          console.log('No saved progress found in localStorage. Starting new story.');
          return;
        }

        const parsedProgress = JSON.parse(savedProgress);
        if (parsedProgress?.storyId === storyId && Array.isArray(parsedProgress.dialogueHistory)) {
          setStoryProgress(parsedProgress);
          return;
        }
        console.warn(
          'Invalid or mismatched story progress in localStorage. Clearing and starting new story.'
        );
        localStorage.removeItem(localStorageKey);
      } catch (error) {
        console.error('Error loading story progress from localStorage:', error);
        localStorage.removeItem(localStorageKey); // Clear corrupted data
      }
    };

    loadProgress();

    //clean up progress from localStorage when the story ends and component unmounts/window unloads
    const handleUnload = () => {
      const latestProgress = storyProgressRef.current;
      console.log(latestProgress);

      if (latestProgress?.endTime) {
        console.log('Story ended, removing progress from localStorage on unload.');
        localStorage.removeItem(localStorageKey);
      }
    };

    window.addEventListener('unload', handleUnload);

    // Cleanup function: remove listener and perform cleanup on unmount
    return () => {
      window.removeEventListener('unload', handleUnload);
      handleUnload();
    };
  }, [localStorageKey]); // Depend on localStorageKey

  return {
    storyProgress,
    setStoryProgress,
    initialIndex: resolvedInitialSceneId,
    initialSceneId: resolvedInitialSceneId,
    initialDialogueHistory: storyProgress.dialogueHistory ?? []
  };
}
