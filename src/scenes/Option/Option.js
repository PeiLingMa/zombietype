// src/scenes/Option/Option.js
import { useGameSettings } from '../../context/GameSettingsContext';
import './Option.css';

export default function Option({ onBack }) {
  // 從 Context 獲取狀態和更新函數
  const { volume, updateVolume } = useGameSettings();

  const handleVolumeChange = (e) => {
    updateVolume(e.target.value);
  };

  return (
    <div className="option-page">
      <div
        className="container mt-5 p-4 border rounded shadow-lg bg-light"
        style={{ maxWidth: '700px' }}
      >
        {/* 標題 */}
        <h1 className="text-center mb-5 display-4 text-primary fw-bold">Game Options</h1>

        {/* 音量設定區塊 */}
        <div className="mb-5 p-4 border rounded bg-white shadow-sm">
          <h3 className="mb-3 text-secondary">Volume Control</h3>
          <div className="d-flex align-items-center">
            <label
              htmlFor="volume-slider"
              className="form-label fw-bold me-3 mb-0"
              style={{ minWidth: '80px' }}
            >
              Volume:
            </label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              className="form-range flex-grow-1 mx-3"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Volume control"
            />
            <span
              className="badge bg-info rounded-pill fs-6"
              style={{ minWidth: '60px' }}
            >
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* 返回按鈕區塊 */}
        <div className="text-center mt-5">
          <button
            className="btn btn-primary px-5 py-3 fs-4 fw-bold btn-lg rounded-pill shadow" // 改用 primary 或其他主題色，增加圓角和陰影
            onClick={onBack}
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
