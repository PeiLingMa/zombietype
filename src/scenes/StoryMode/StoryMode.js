import { useState, useEffect } from "react";
import sceneData from "./script";
import './test.css';

export default function StoryMode({ onBack }) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentScene = sceneData[index];

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    setIsTyping(true);
    const interval = setInterval(() => {
      if (i < currentScene.dialogue.length) {
        setDisplayText((prev) => prev + currentScene.dialogue[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [index]);

  const handleNext = () => {
    if (isTyping) return;
    if (index < sceneData.length - 1) {
      setIndex(index + 1);
    }
  };

  return (
      <div className="cutscene-container" onClick={handleNext}>
      <h1 className="mb-4">THIS IS STORYMODE PAGE</h1>

      {/* Cutscene 圖片角色 */}
      <img
        src={currentScene.image}
        alt={currentScene.character}
        className="character"
      />

      {/* 對話框 */}
      <div className="dialogue-box">
        <h3>{currentScene.character}</h3>
        <p>{displayText}</p>
        {!isTyping && <span style={{ fontSize: "0.9rem", opacity: 0.5 }}></span>}
      </div>

      {/* 返回按鈕放在畫面外 */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button
          className="btn btn-info px-4 py-2 fw-bold"
          onClick={(e) => {
            e.stopPropagation(); // 避免點擊觸發對話切換
            onBack();
          }}
        >
          Back Menu
        </button>
      </div>
    </div>
  );
}
