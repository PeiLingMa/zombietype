import { useState, useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { useLevelManager } from './hooks/useLevelManager';
import { GAME_CONFIG } from './gameConfig';

import 'bootstrap/dist/css/bootstrap.min.css';
import zombie1 from './zombie1.png';
import zombie2 from './zombie2.png';
import zombie3 from './zombie3.png';
import zombie4 from './zombie4.png';
import './shake.css';

const zombieImages = [zombie1, zombie2, zombie3, zombie4];

const usePreloadedSounds = () => {
  const sounds = useRef({});

  useEffect(() => {
    const soundFiles = ['accept.wav', 'defeated.mp3', 'wrong_answer.mp3'];
    soundFiles.forEach((file) => {
      const audio = new Audio(process.env.PUBLIC_URL + `/sounds/${file}`);
      audio.load();
      sounds.current[file] = audio;
    });
  }, []);

  return sounds;
};

export default function ChallengeMode({ onBack }) {
  // Game state variables
  const { gameState, updateGameState } = useGameState();
  const { getChargeSpeed } = useLevelManager(gameState, updateGameState);

  const [wordList, setWordList] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [scale, setScale] = useState(0.1);
  const [currentZombie, setCurrentZombie] = useState(
    zombieImages[Math.floor(Math.random() * zombieImages.length)]
  );
  const [isWrong, setIsWrong] = useState(false);

  // Game sound effects
  const sounds = usePreloadedSounds();

  const playSound = (soundFile) => {
    if (sounds.current[soundFile]) {
      const audio = sounds.current[soundFile];
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn('音效播放被阻擋:', err));
    }
  };

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/data.json')
      .then((res) => res.json())
      .then((data) =>
        setWordList(data['topics'][gameState.currentTheme][gameState.currentDifficulty])
      );
  }, [gameState.currentDifficulty]);

  // main logic in game loop
  useEffect(() => {
    if (wordList.length > 0 && !gameState.gameOver) {
      spawnWord(wordList);
    }

    let interval = setInterval(() => {
      setScale((prev) => {
        if (prev >= 1) {
          const newLives = gameState.lives - 1;
          if (newLives <= 0) {
            updateGameState({ gameOver: true });
            playSound('defeated.mp3');
            clearInterval(interval);
          }
          updateGameState({ lives: newLives });
          return 0;
        }
        return prev + getChargeSpeed();
      });
    }, GAME_CONFIG.CHARGE_INTERVAL);

    return () => clearInterval(interval);
  }, [wordList, gameState.lives, gameState.gameOver, getChargeSpeed]);

  const spawnWord = (words) => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord['word']);
    setInputValue('');
    setScale(0);
    setCurrentZombie(zombieImages[Math.floor(Math.random() * zombieImages.length)]);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.length === currentWord.length) {
      if (newValue === currentWord) {
        playSound('accept.wav');
        updateGameState({ zombiesDefeated: gameState.zombiesDefeated + 1 });
        spawnWord(wordList);
      } else {
        setIsWrong(true);
        setInputValue('');
        playSound('wrong_answer.mp3');

        setTimeout(() => setIsWrong(false), 300);
      }
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center bg-dark text-light p-4">
      {gameState.gameOver ? (
        <>
          <h1 className="display-3 text-danger fw-bold animate__animated animate__bounce">
            You Died!
          </h1>
          <button
            className="btn btn-info my-2 px-4 py-3 fs-4 fw-bold btn-lg mb-3"
            onClick={onBack}
          >
            Back Menu
          </button>
        </>
      ) : (
        <>
          <h1 className="display-4 fw-bold text-warning mb-4">Monster Typing Game</h1>
          <p className="lead">Type the word to defeat the monster!</p>
          <p
            className={`mt-2 fw-bold ${scale >= 0.75 ? 'text-danger' : 'text-warning'} bg-dark py-2 px-4 rounded-pill shadow`}
          >
            Time Left: {Math.ceil((1 - scale) * 20)}s{' '}
          </p>
          <div
            className="position-relative d-flex justify-content-center align-items-center my-4"
            style={{ transform: `scale(${scale})`, transition: 'transform 0.3s linear' }}
          >
            <img
              src={currentZombie}
              alt="Zombie"
              className="img-fluid rounded-circle border border-warning bg-light p-3 shadow-lg"
              style={{ width: '250px', height: '250px' }}
            />
          </div>

          <div className="bg-warning text-dark px-4 py-2 rounded-pill fs-4 fw-bold border border-dark shadow mb-4">
            {currentWord}
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className={`form-control text-center w-50 mx-auto p-3 fs-4 border border-warning shadow-lg ${isWrong ? 'shake' : ''}`}
            autoFocus
            disabled={gameState.gameOver}
          />
          <p className="level">level: {gameState.level}</p>
          <p className="lives">lives: {gameState.lives}</p>
          <p className="speed">speed: {getChargeSpeed()}</p>
          <p className="charge">charge: {Math.round(scale * 100)}%</p>
        </>
      )}
    </div>
  );
}
