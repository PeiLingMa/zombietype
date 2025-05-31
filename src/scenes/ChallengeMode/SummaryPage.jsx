import './SummaryPage.css';

export default function SummaryPage({ onBack, onRestart }) {
  return (
    <div className="summary-page-root">
      <h1 className="summary-page-title">Game Summary Page</h1>
      <div className="summary-page-btn-group">
        <button
          className="summary-page-btn"
          onClick={onBack}
        >
          Menu
        </button>
        <button
          className="summary-page-btn"
          onClick={onRestart}
        >
          Restart
        </button>
      </div>
    </div>
  );
}
