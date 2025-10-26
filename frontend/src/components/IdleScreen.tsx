import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import sleepImg from "../assets/images/sleep.png";

export default function IdleScreen() {
  const { setViewMode, startRecording } = useApp();

  const handleStart = async () => {
    setViewMode("recording");
    await startRecording();
  };

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        await handleStart();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="app-container">
      <div className="glass-window idle-view">
        <div className="miku-circle" onClick={handleStart}>
          <img className="miku-img" src={sleepImg} />
        </div>
        <button className="start-button">
          <span>[⌘ + enter] start</span>
        </button>
      </div>
    </div>
  );
}
