import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css'; // 確保路徑正確

function Dropdown({ buttonText, options, onOptionSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setIsOpen(false); // 點擊選項後關閉下拉選單
    onOptionSelect(option); // 呼叫父組件傳入的選項處理函數
  };

  // 點擊選單外部時關閉選單
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div
      className="dropdown"
      ref={dropdownRef}
    >
      <button
        className="dropdown-button btn btn-warning my-2 px-4 py-3 fs-4 fw-bold btn-lg mb-3" // 保持原按鈕樣式
        onClick={toggleDropdown}
        aria-expanded={isOpen} // 讓 screen reader 知道下拉選單的狀態
        aria-haspopup="true" // 標記為彈出選單
      >
        {buttonText}
      </button>
      <ul
        className={`dropdown-menu ${isOpen ? 'open' : ''}`}
        aria-label="dropdown options"
      >
        {options.map((option, index) => (
          <li
            key={index}
            className="dropdown-item"
          >
            <button
              className="dropdown-option-button" // 選項按鈕樣式
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dropdown;
