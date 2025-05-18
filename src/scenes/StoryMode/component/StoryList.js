// src/scenes/StoryMode/component/StoryList.js
import PropTypes from 'prop-types';

import './StoryList.css';

const StoryList = ({ storyList, onStorySelect }) => {
  return (
    <ul className="story-list">
      {storyList.map((story) => (
        <li
          key={story.id}
          className="story-item"
          onClick={() => onStorySelect(story.id, story.scenes)}
        >
          <div className="story-preview-image">
            {story.previewImage ? (
              <img
                src={story.previewImage}
                alt={story.title}
              />
            ) : (
              <div className="no-preview-placeholder">No Preview</div>
            )}
          </div>
          <div className="story-info">
            <h2>{story.title}</h2>
            <p>{story.description}</p>
            <button className="play-button">Start Story</button>
          </div>
        </li>
      ))}
    </ul>
  );
};

StoryList.propTypes = {
  storyList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      previewImage: PropTypes.string,
      scenes: PropTypes.array
    })
  ).isRequired,
  onStorySelect: PropTypes.func.isRequired
};

export default StoryList;
