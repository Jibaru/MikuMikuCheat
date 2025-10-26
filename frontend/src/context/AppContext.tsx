import { createContext, useContext, useRef, useState, useEffect } from "react";
import { TranscribeAudio, GetAIResponse } from "../../wailsjs/go/main/App";

export type ViewMode = "idle" | "recording" | "chat";
export interface Message {
  sender: "user" | "ai";
  text: string;
}

interface AppContextProps {
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  isRecording: boolean;
  isProcessing: boolean;
  messages: Message[];
  audioLevel: number;
  startRecording: () => Promise<void>;
  processAudio: () => Promise<void>;
  addMessage: (msg: Message) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastProcessedIndex = useRef(0); // 👈 nuevo: marcador de procesamiento
  const animationFrameRef = useRef<number>();

  // 🎙 Start recording (solo una vez)
  const startRecording = async () => {
    if (isRecording) return;
    if (!streamRef.current) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
      });
      streamRef.current = stream;
    }

    const mediaRecorder = new MediaRecorder(streamRef.current);
    audioChunksRef.current = [];
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.start(100);
    setIsRecording(true);

    // 🎚 Nivel de audio
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(streamRef.current);
    source.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(avg / 255);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();

    console.log("🎙 Grabación iniciada permanentemente.");
  };

  // 🧠 Process only new audio since last time
  const processAudio = async () => {
    if (!mediaRecorderRef.current || !streamRef.current) return;

    setViewMode("chat");

    // Detiene temporalmente el recorder actual
    const recorder = mediaRecorderRef.current;
    recorder.stop();

    // Espera a que termine de escribir los últimos chunks
    await new Promise((resolve) => {
      recorder.onstop = resolve;
    });

    // 🔹 Crea un blob completo (válido)
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    // Reinicia los chunks para la próxima grabación
    audioChunksRef.current = [];
    lastProcessedIndex.current = 0;

    // 🔹 Reinicia la grabación inmediatamente
    const newRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = newRecorder;
    newRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    newRecorder.start(100);

    setIsProcessing(true);

    // 🔹 Procesa el audio recién grabado
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await TranscribeAudio({
          audioBase64: base64,
          mimeType: audioBlob.type,
        });
        if (res.error) throw new Error(res.error);

        setMessages((prev) => [
          ...prev,
          { sender: "user", text: res.transcription },
        ]);

        const aiRes = await GetAIResponse(res.transcription);
        if (aiRes.error) throw new Error(aiRes.error);

        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: aiRes.aiResponse },
        ]);
      } catch (e: any) {
        console.error(e);
        alert("Error processing audio: " + e.message);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(audioBlob);
  };

  const addMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (mediaRecorderRef.current?.state === "recording")
        mediaRecorderRef.current.stop();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        isRecording,
        isProcessing,
        messages,
        audioLevel,
        startRecording,
        processAudio,
        addMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
