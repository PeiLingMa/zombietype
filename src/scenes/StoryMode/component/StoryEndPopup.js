// src\scenes\StoryMode\component\StoryEndPopup.js
import React from 'react';
import './StoryEndPopup.css';

// props:
// isVisible: 控制彈出視窗是否顯示的布林值
// message: 顯示在彈出視窗中的訊息 (例如: "故事結束")
// onConfirm: 點擊按鈕時執行的函數 (例如: 返回選單)
export default function StoryEndPopup({ isVisible, message, onConfirm }) {
  if (!isVisible) {
    return null; // 如果 isVisible 為 false，則不渲染任何內容
  }

  return (
    <div className="story-end-overlay">
      <div className="story-end-dialog">
        <h3>{message || '故事結束'}</h3> {/* 如果沒有傳入 message，顯示預設文字 */}
        <button
          className="story-end-button"
          onClick={onConfirm}
        >
          Back Menu
        </button>
      </div>
    </div>
  );
}
