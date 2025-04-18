import React, { useState, useEffect } from 'react';
import './test.css';

import sceneData from './script';

const stories = [
  {
    id: 'story1',
    title: 'Story 1 Title',
    description: ' Story 1 Overview...',
    previewImage: '', // 預覽圖片路徑
    scenes: sceneData
  }
];

export default function StoryMenu({ onStorySelect, onBack }) {
  const [storyList, setStoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fetch('/api/stories')
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     return response.json();
    //   })
    //   .then(data => {
    //     setStoryList(data);
    //     setLoading(false);
    //   })
    //   .catch(error => {
    //     setError(error);
    //     setLoading(false);
    //     console.error("Failed to fetch stories:", error);
    //   });

    // 暫時使用本地 stories 資料
    setStoryList(stories);
    setLoading(false);
  }, []);

  if (loading) {
    return <p>Loading stories...</p>;
  }

  if (error) {
    return <p>Failed to load stories: {error.message}</p>;
  }

  return (
    <div className="story-menu-container">
      <h1>Story Menu</h1>
      <ul className="story-list">
        {storyList.map((story) => (
          <li
            key={story.id}
            className="story-item"
            onClick={() => onStorySelect(story.scenes)}
          >
            <div className="story-preview-image">
              {story.previewImage && (
                <img
                  src={story.previewImage}
                  alt={story.title}
                />
              )}
              {!story.previewImage && <div className="no-preview-placeholder">No Preview</div>}{' '}
              {/* 沒有預覽圖時的 placeholder */}
            </div>
            <div className="story-info">
              <h2>{story.title}</h2>
              <p>{story.description}</p>
              <button className="play-button">Start Story</button>
            </div>
          </li>
        ))}
      </ul>
      <button
        className="btn btn-info px-4 py-2 fw-bold"
        onClick={onBack}
      >
        Back Menu
      </button>
    </div>
  );
}
