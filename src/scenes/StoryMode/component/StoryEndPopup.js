// src\scenes\StoryMode\component\StoryEndPopup.js
import React from 'react';
import './StoryEndPopup.css';

// props:
// isVisible: 控制彈出視窗是否顯示的布林值
// message: 顯示在彈出視窗中的訊息 (例如: "故事結束")
// onConfirm: 點擊按鈕時執行的函數 (例如: 返回選單)
export default function StoryEndPopup({ isVisible, message, answerSummary, onConfirm }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="story-end-popup-overlay">
      <div className="story-end-popup-content">
        <h2>{message}</h2>
        {answerSummary && answerSummary.length > 0 && (
          <div className="answer-summary-container">
            <h3>本次回答記錄：</h3>
            <ul>
              {answerSummary.map((item, index) => (
                <li
                  key={index}
                  className={`summary-item ${item.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <p>
                    <strong>問題：</strong> {item.questionText}
                  </p>
                  <p>
                    <strong>你的答案：</strong> {item.userAnswer}
                  </p>
                  {!item.isCorrect && (
                    <p>
                      <strong>正確答案：</strong> {item.correctAnswer}
                    </p>
                  )}
                  <p>
                    <strong>結果：</strong> {item.isCorrect ? '答對' : '答錯'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={onConfirm}
          className="popup-confirm-button"
        >
          返回主選單
        </button>
      </div>
    </div>
  );
}
