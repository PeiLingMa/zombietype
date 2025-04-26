import React, { useState, useCallback, useEffect, useRef } from 'react';
import './InputFrame.css';

export default function InputFrame({
  currentScene,
  questionText,
  isTyping,
  onClick,
  onChoiceSelect, // called only when player's answer matched
  updateDialogueHistory
}) {
  const [choiceInput, setChoiceInput] = useState('');
  const inputRef = useRef(null);

  const handleInputChange = useCallback((event) => {
    setChoiceInput(event.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmedInput = choiceInput.trim();
    if (!trimmedInput) {
      console.warn('Input is empty.');

      return;
    }

    const matchedChoice = currentScene?.choices?.find(
      (choice) => choice.text.trim().toLowerCase() === trimmedInput.toLowerCase()
    );

    if (matchedChoice) {
      updateDialogueHistory('You typed:', `[${trimmedInput}]`);
      onChoiceSelect(matchedChoice);
      setChoiceInput('');
    } else {
      console.warn(`No matching choice found for input: "${trimmedInput}"`);

      updateDialogueHistory('You typed:', `[${trimmedInput}] - No match found`);
      setChoiceInput('');
    }
  }, [choiceInput, currentScene, onChoiceSelect, updateDialogueHistory]);

  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === 'Enter' && !isTyping) {
        handleSubmit();
      }
    },
    [handleSubmit, isTyping]
  );

  useEffect(() => {
    if (currentScene?.type === 'question') {
      setChoiceInput('');
      if (!isTyping) {
        inputRef?.current.focus();
      }
    }
  }, [currentScene, isTyping]);

  if (!currentScene || currentScene.type !== 'question') {
    return null;
  }

  return (
    <div className="question-box">
      {' '}
      <h3>{currentScene.character}</h3>
      <p
        onClick={onClick}
        className="question-content"
      >
        {questionText}
      </p>{' '}
      {/* 顯示打字中的問題文字 */}
      {/* 顯示可選的選項列表作為提示 */}
      {/* <div className="choices-hint">
        Choices: {currentScene.choices?.map((c) => c.text).join(', ')}
      </div> */}
      <div className="choice-input-container">
        <input
          ref={inputRef}
          type="text"
          value={choiceInput}
          onChange={handleInputChange}
          onKeyUp={handleKeyPress}
          placeholder="Type your answer here..."
          disabled={isTyping}
        />
        <button
          onClick={handleSubmit}
          disabled={isTyping || choiceInput.trim() === ''}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
