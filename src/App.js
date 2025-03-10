import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import zombie1 from "./zombie1.png";
import zombie2 from "./zombie2.png";
import zombie3 from "./zombie3.png";
import zombie4 from "./zombie4.png";
import "./shake.css";

const words = ["zombie", "attack", "survive", "escape", "horror", "danger", "fight"];
const zombieImages = [zombie1, zombie2, zombie3, zombie4];

const usePreloadedSounds = () => {
  const sounds = useRef({});

  useEffect(() => {
    const soundFiles = ["accept.wav", "defeated.mp3", "wrong_answer.mp3"];
    soundFiles.forEach((file) => {
      const audio = new Audio(process.env.PUBLIC_URL + `/sounds/${file}`);
      audio.load();
      sounds.current[file] = audio;
    });
  }, []);

  return sounds;
};

export default function TypingGame() {
  const [currentWord, setCurrentWord] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [scale, setScale] = useState(0.1);
  const [currentZombie, setCurrentZombie] = useState(zombieImages[Math.floor(Math.random() * zombieImages.length)]);
  const [isShaking, setIsShaking] = useState(false);

  const sounds = usePreloadedSounds();

  const playSound = (soundFile) => {
    if (sounds.current[soundFile]) {
      const audio = sounds.current[soundFile];
      audio.currentTime = 0;
      audio.play();
    }
  };

  useEffect(() => {
    spawnWord();
    let interval = setInterval(() => {
      setScale((prev) => {
        if (prev >= 1) {
          setGameOver(true);
          clearInterval(interval);
          playSound("defeated.mp3");
          return prev;
        }
        return prev + 0.05;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const spawnWord = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setInputValue("");
    setScale(0.1);
    setCurrentZombie(zombieImages[Math.floor(Math.random() * zombieImages.length)]);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.length === currentWord.length) {
      if (newValue === currentWord) {
        setScore(score + 1);
        playSound("accept.wav");
        spawnWord();
      } else {
        setIsShaking(true);
        setInputValue("");
        playSound("error.wav");

        setTimeout(() => setIsShaking(false), 300);
      }
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center bg-dark text-light p-4">
      {gameOver ? (
        <h1 className="display-3 text-danger fw-bold animate__animated animate__bounce">You Died!</h1>
      ) : (
        <>
          <h1 className="display-4 fw-bold text-warning mb-4">Monster Typing Game</h1>
          <p className="lead">Type the word to defeat the monster!</p>

          <div className="position-relative d-flex justify-content-center align-items-center my-4"
               style={{ transform: `scale(${scale})`, transition: "transform 0.3s linear" }}>
            <img src={currentZombie} alt="Zombie"
                 className="img-fluid rounded-circle border border-warning bg-light p-3 shadow-lg"
                 style={{ width: "250px", height: "250px" }} />
          </div>

          <div className="bg-warning text-dark px-4 py-2 rounded-pill fs-4 fw-bold border border-dark shadow mb-4">
            {currentWord}
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className={`form-control text-center w-50 mx-auto p-3 fs-4 border border-warning shadow-lg ${isShaking ? "shake" : ""}`}
            autoFocus
            disabled={gameOver}
          />

          <p className="mt-4 fw-bold text-warning bg-dark py-2 px-4 rounded-pill shadow">Score: {score}</p>
        </>
      )}
    </div>
  );
}
