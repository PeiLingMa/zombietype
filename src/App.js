import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import zombie1 from "./zombie1.png";
import zombie2 from "./zombie2.png";
import zombie3 from "./zombie3.png";
import zombie4 from "./zombie4.png";

//vocabulary pool
const words = ["zombie", "attack", "survive", "escape", "horror", "danger", "fight"];
const zombieImages = [zombie1, zombie2, zombie3, zombie4];

export default function TypingGame() {
  const [currentWord, setCurrentWord] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // State for zombie image scale (used for gradual zoom-in effect)
  const [scale, setScale] = useState(0.1);

  // State for the currently displayed zombie image (randomly chosen)
  const [currentZombie, setCurrentZombie] = useState(zombieImages[Math.floor(Math.random() * zombieImages.length)]);

  //useEffect: Runs once on game start, generates the first word and starts the zombie zoom-in timer
  useEffect(() => {
    spawnWord(); // Generate the first word

    // Set interval to gradually increase zombie scale every 300ms
    let interval = setInterval(() => {
      setScale((prev) => {
        if (prev >= 1) {// If the zombie reaches full size, end the game
          setGameOver(true);
          clearInterval(interval);
          return prev;
        }
        return prev + 0.05;// Increase scale by 0.05 each time
      });
    }, 300);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Function to generate a new word and reset the zombie
  const spawnWord = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setInputValue("");// Clear user input field
    setScale(0.1);// Reset zombie size
    setCurrentZombie(zombieImages[Math.floor(Math.random() * zombieImages.length)]);// Select a new random zombie image
  };

  // Function to handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // If the entered word matches the current word, increase score and spawn a new word
    if (e.target.value === currentWord) {
      setScore(score + 1);
      spawnWord();// Generate a new word
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

          {/* Zombie image that gradually scales up */}
          <div className="position-relative d-flex justify-content-center align-items-center my-4" style={{ transform: `scale(${scale})`, transition: "transform 0.3s linear" }}>
            <img src={currentZombie} alt="Zombie" className="img-fluid rounded-circle border border-warning bg-light p-3 shadow-lg" style={{ width: "250px", height: "250px" }} />
          </div>
          <div className="bg-warning text-dark px-4 py-2 rounded-pill fs-4 fw-bold border border-dark shadow mb-4">
            {currentWord}
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="form-control text-center w-50 mx-auto p-3 fs-4 border border-warning shadow-lg"
            autoFocus
            disabled={gameOver}
          />
          <p className="mt-4 fw-bold text-warning bg-dark py-2 px-4 rounded-pill shadow">Score: {score}</p>
        </>
      )}
    </div>
  );
}
