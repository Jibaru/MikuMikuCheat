import { useState, useRef, useEffect } from "react";
import { TranscribeAudio, GetAIResponse, Quit } from "../wailsjs/go/main/App";
import "./App.css";
import sleepImg from "./assets/images/sleep.png";
import listenImg from "./assets/images/listen.png";

type ViewMode = "idle" | "recording" | "chat";

interface Message {
  sender: "user" | "ai";
  text: string;
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();

        if (viewMode === "idle") {
          await startRecordingMode();
        } else if (viewMode === "recording" && isRecording) {
          await processAudio(); // Pasa a chat
        } else if (viewMode === "chat") {
          if (isRecording) {
            await processAudio(); // pausa para procesar lo grabado
          } else {
            startRecording(); // reanuda grabación sin pedir permisos
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [viewMode, isRecording]);

  const handleMikuClick = async () => {
    if (viewMode === "idle") {
      await startRecordingMode();
    }
  };

  const startRecordingMode = async () => {
    setViewMode("recording");

    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          audio: true,
        });
        streamRef.current = stream;
      }
      startRecording();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Can not access microphone. Please try again.");
      setViewMode("idle");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    audioChunksRef.current = [];

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        console.log("Chunk size:", event.data.size);
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start(100); // force dataavailable each 100 ms
    setIsRecording(true);

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(
        streamRef.current
      );
      microphone.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.error("Error setting up audio visualization:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.requestData(); // force last chunk
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const processAudio = async () => {
    if (!audioChunksRef.current.length) {
      alert("There is no audio recorded.");
      return;
    }

    stopRecording();
    setViewMode("chat");
    setIsProcessing(true);

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(",")[1];

      try {
        const response = await TranscribeAudio({
          audioBase64: base64Audio,
          mimeType: audioBlob.type,
        });

        if (response.error) {
          console.error("Error:", response.error);
          alert("Error transcribing audio: " + response.error);
          return;
        }

        setMessages((msgs) => [
          ...msgs,
          { sender: "user", text: response.transcription },
        ]);

        const aiResponse = await GetAIResponse(response.transcription);

        if (aiResponse.error) {
          console.error("Error:", aiResponse.error);
          alert("Error getting AI response: " + aiResponse.error);
          return;
        }

        setMessages((msgs) => [
          ...msgs,
          { sender: "ai", text: aiResponse.aiResponse },
        ]);
      } catch (err) {
        console.error("Error processing audio:", err);
        alert("Error processing audio. Please try again.");
      } finally {
        setIsProcessing(false);
        // 🔁 Reanudar grabación automática en modo chat
        if (viewMode === "chat" && streamRef.current) {
          startRecording();
        }
      }
    };

    reader.readAsDataURL(audioBlob);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Render by mode
  if (viewMode === "idle") {
    return (
      <div className="app-container">
        <div className="glass-window idle-view">
          <div className="miku-circle" onClick={handleMikuClick}>
            <img className="miku-img" src={sleepImg} />
          </div>

          <button className="start-button">
            <span>[⌘ + enter] start</span>
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === "recording") {
    return (
      <div className="app-container">
        <div className="glass-window recording-view">
          {/* Waveform */}
          <div className="waveform-container">
            <AudioWaveform isRecording={isRecording} level={audioLevel} />
          </div>

          {/* Miku Icon + Listening */}
          <div className="recording-section">
            <div className="miku-circle" onClick={handleMikuClick}>
              <img className="miku-img" src={listenImg} />
            </div>
          </div>

          {/* Solve Button */}
          <button className="solve-button">
            <span>[⌘ + enter] solve answer</span>
          </button>
        </div>
      </div>
    );
  }

  // Chat view
  if (viewMode === "chat") {
    return (
      <div className="app-container">
        <div className="glass-window-chat chat-view">
          {/* Chat messages */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-chat">No messages yet</div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-box ${
                    msg.sender === "ai" ? "response-box" : "transcription-box"
                  }`}
                >
                  <div className="box-label">
                    {msg.sender === "ai" ? "AI Response:" : "You said:"}
                  </div>
                  <div className="box-content">{msg.text}</div>
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

          {/* Bottom with waveform instead of button */}
          <div className="bottom-section">
            <div className="waveform-container">
              <AudioWaveform isRecording={isRecording} level={audioLevel} />
            </div>
            <button className="solve-button">
              <span>
                [⌘ + enter]{" "}
                {isRecording ? "process message" : "resume listening"}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div className="app-container">Unknown view mode</div>;
}

function AudioWaveform({
  isRecording,
  level,
}: {
  isRecording: boolean;
  level: number;
}) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setTime((t) => t + 0.1);
    }, 50);

    return () => clearInterval(interval);
  }, [isRecording]);

  const bars = Array.from({ length: 60 }, (_, i) => {
    const baseHeight = 5;
    const maxHeight = isRecording ? 90 : 10;
    const height = isRecording
      ? baseHeight +
        Math.abs(Math.sin(time + i * 0.25)) * maxHeight * (0.5 + level * 0.5)
      : baseHeight;

    return (
      <div
        key={i}
        className="wave-bar"
        style={{
          height: `${height}%`,
          opacity: isRecording ? 1 : 0.3,
        }}
      />
    );
  });

  return <div className="audio-waveform">{bars}</div>;
}

export default App;
