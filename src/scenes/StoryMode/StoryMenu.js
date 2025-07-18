import React, { useState, useEffect } from 'react';
import './test.css';
import StoryList from './component/StoryList.js';
import Story1_preview from './images/story1_preview.jpeg';
import Story2_preview from './images/story2_preview.jpeg';
import Story3_preview from './images/story3_preview.jpeg';

// import sceneData from './script';
const stories = [
  // {
  //   id: 'story1',
  //   title: 'Story 1 Title',
  //   description: ' Story 1 Overview...',
  //   previewImage: '', // 預覽圖片路徑
  //   scenes: sceneData
  // },
  // {
  //   id: 'story2',
  //   title: "It's giving",
  //   description: 'An expression meaning something has a certain energy or vibe. Learn it here.',
  //   previewImage: '', // 預覽圖片路徑
  //   scenes: await import('./script2').then((module) => module.default) // 動態導入 script2.js
  // },
  {
    id: 'story3',
    title: "Anna and Ben's Happy Time",
    description: 'Level: Easy',
    previewImage: Story1_preview, // 預覽圖片路徑
    scenes: null // 改在 useEffect 導入
  },
  {
    id: 'story4',
    title: "Talkin' Library Vibes",
    description: 'Level: Medium',
    previewImage: Story2_preview, // 預覽圖片路徑
    scenes: null
  },
  {
    id: 'story5',
    title: 'Navigating Setbacks: A Project Conundrum',
    description: 'Level: Hard',
    previewImage: Story3_preview, // 預覽圖片路徑
    scenes: null
  }
];

export default function StoryMenu({ onStorySelect, onBack }) {
  const [storyList, setStoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  async function loadStoriesWithScenes() {
    try {
      const loadedStories = [...stories];
      loadedStories[0].scenes = (await import('./script3')).default;
      loadedStories[1].scenes = (await import('./script4')).default;
      loadedStories[2].scenes = (await import('./script5')).default;
      setStoryList(loadedStories);
    } catch (err) {
      // setError(err); // Uncomment if you want to handle error state
      console.error('Failed to load story scenes:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load scenes asynchronously
    loadStoriesWithScenes();
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
      <StoryList
        storyList={storyList}
        onStorySelect={onStorySelect}
      />
      <button
        className="btn-info1 px-4 py-2 fw-bold"
        onClick={onBack}
      >
        Back Menu
      </button>
    </div>
  );
}
