import { useState } from 'react';

export default function StoryMode({ onBack }) {
  return (
    <div>
      <h1>THIS IS OPTIONS PAGE</h1>
      <>
        <button
          className="btn btn-info my-2 px-4 py-3 fs-4 fw-bold btn-lg mb-3"
          onClick={onBack}
        >
          Back Menu
        </button>
      </>
    </div>
  );
}