export default function SummaryPage({ onBack, onRestart }) {
  return (
    <>
      <h1>Game Summary Page</h1>
      <button onClick={onBack}>Menu</button>
      <button onClick={onRestart}>重新開始</button>
    </>
  );
}
