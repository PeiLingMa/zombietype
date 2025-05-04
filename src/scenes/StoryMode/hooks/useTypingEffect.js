// src\scenes\StoryMode\hooks\useTypingEffect.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Handles the character-by-character typing effect for dialogue text.
 *
 * @param {string} text - The full text to display.
 * @param {number} [speed=40] - The speed of typing in milliseconds per character.
 * @returns {{
 *   displayedText: string,
 *   isTyping: boolean,
 *   skipTyping: () => void
 * }}
 */
export default function useTypingEffect(text, speed = 40) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(null); // null when mounting
  const [characterIndex, setCharacterIndex] = useState(0);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCharacterIndex(0);
    if (text) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [text]);

  // Typing interval effect
  useEffect(() => {
    if (!isTyping) return;

    if (characterIndex >= text.length) {
      setIsTyping(false);
      return;
    }

    const intervalId = setInterval(() => {
      setCharacterIndex((prevIndex) => prevIndex + 1);
    }, speed);

    return () => clearInterval(intervalId); // Cleanup interval on unmount or dependency change
  }, [speed, isTyping, characterIndex]);

  // Update displayed text based on index
  useEffect(() => {
    setDisplayedText(text.substring(0, characterIndex));
  }, [text, characterIndex]);

  const skipTyping = useCallback(() => {
    if (isTyping) {
      setDisplayedText(text);
      setCharacterIndex(text.length);
      setIsTyping(false);
    }
  }, [text, isTyping]);

  return { displayedText, isTyping, skipTyping };
}
