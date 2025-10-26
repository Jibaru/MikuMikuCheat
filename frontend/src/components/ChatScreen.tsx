import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import AudioWaveform from "./AudioWaveForm";

export default function ChatScreen() {
  const {
    messages,
    isRecording,
    isProcessing,
    audioLevel,
    processAudio,
    startRecording,
  } = useApp();

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();

        if (isRecording) {
          await processAudio();
        } else {
          await startRecording();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRecording, processAudio, startRecording]);

  return (
    <div className="app-container">
      <div className="glass-window-chat chat-view">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-chat">No messages yet</div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`message-box ${
                  m.sender === "ai" ? "response-box" : "transcription-box"
                }`}
              >
                <div className="box-label">
                  {m.sender === "ai" ? "AI Response:" : "You said:"}
                </div>
                <div className="box-content">{m.text}</div>
              </div>
            ))
          )}
        </div>

        {isProcessing && (
          <div className="loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Thinking...</span>
          </div>
        )}

        <div className="bottom-section">
          <div className="waveform-container">
            <AudioWaveform isRecording={isRecording} level={audioLevel} />
          </div>
          <button
            className="solve-button"
            onClick={isRecording ? processAudio : startRecording}
          >
            <span>
              [⌘ + enter] {isRecording ? "process message" : "resume listening"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
