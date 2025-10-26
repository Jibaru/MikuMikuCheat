import { useState, useRef, useEffect } from 'react';
import { ProcessAudio, Quit } from '../wailsjs/go/main/App';
import './App.css';
import sleepImg from "./assets/images/sleep.png";
import listenImg from "./assets/images/listen.png";

type ViewMode = 'idle' | 'recording' | 'chat';

interface ProcessingState {
  transcription: string;
  aiResponse: string;
  isProcessing: boolean;
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState>({
    transcription: '',
    aiResponse: '',
    isProcessing: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Escape') {
        e.preventDefault();
        await Quit();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        
        if (viewMode === 'idle') {
          await startRecordingMode();
        } else if (viewMode === 'recording' && isRecording) {
          await processAudio();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, isRecording]);

  const handleMikuClick = async () => {
    if (viewMode === 'idle') {
      await startRecordingMode();
    }
  };

  const startRecordingMode = async () => {
    setViewMode('recording');
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true });
      streamRef.current = stream;
      startRecording();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Can not access microphone. Please try again.');
      setViewMode('idle');
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
    const microphone = audioContext.createMediaStreamSource(streamRef.current);
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
    console.error('Error setting up audio visualization:', err);
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
      alert('There is no audio recorded.');
      return;
    }

    stopRecording();
    setViewMode('chat');
    setProcessing({ transcription: '', aiResponse: '', isProcessing: true });

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      
      try {
        const response = await ProcessAudio({
          audioBase64: base64Audio,
          mimeType: audioBlob.type
        });

        if (response.error) {
          console.error('Error:', response.error);
          setProcessing({
            transcription: 'Error processing audio',
            aiResponse: response.error,
            isProcessing: false
          });
          return;
        }

        setProcessing({
          transcription: response.transcription,
          aiResponse: response.aiResponse,
          isProcessing: false
        });
      } catch (err) {
        console.error('Error processing audio:', err);
        setProcessing({
          transcription: 'Error',
          aiResponse: 'Error processing audio: ' + String(err),
          isProcessing: false
        });
      }
    };

    reader.readAsDataURL(audioBlob);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Render by mode
  if (viewMode === 'idle') {
    return (
      <div className="app-container">
        <div className="glass-window idle-view">
          <div className="miku-circle" onClick={handleMikuClick}>
            <img className="miku-img" src={sleepImg}/>
          </div>
          
          <button className="start-button">
            <span>ctrl + enter Start</span>
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'recording') {
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
              <img className="miku-img" src={listenImg}/>
            </div>
          </div>

          {/* Solve Button */}
          <button className="solve-button">
            <span>ctrl + enter Solve answer</span>
          </button>
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="app-container">
      <div className="glass-window-chat chat-view">
        {/* Transcription */}
        <div className="message-box transcription-box">
          <div className="box-label">Transcribed part</div>
          <div className="box-content">
            {processing.isProcessing ? (
              <div className="loading">Transcribing...</div>
            ) : (
              processing.transcription
            )}
          </div>
        </div>

        {/* AI Response */}
        <div className="message-box response-box">
          <div className="box-label">AI Response:</div>
          <div className="box-content">
            {processing.isProcessing ? (
              <div className="loading">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>It is something similar to...</span>
              </div>
            ) : (
              processing.aiResponse
            )}
          </div>
        </div>

        {/* Bottom section with Miku + Listening */}
        <div className="bottom-section">
          <div className="miku-circle" style={{width: '50px',height: '50px'}} onClick={handleMikuClick}>
            <img className="miku-img" style={{width: '100px',height: '100px'}} src={listenImg}/>
          </div>
          <span className="listening-text">Listening ...</span>
        </div>
      </div>
    </div>
  );
}

function AudioWaveform({ isRecording, level }: { isRecording: boolean; level: number }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    
    const interval = setInterval(() => {
      setTime(t => t + 0.1);
    }, 50);

    return () => clearInterval(interval);
  }, [isRecording]);

  const bars = Array.from({ length: 60 }, (_, i) => {
    const baseHeight = 5;
    const maxHeight = isRecording ? 90 : 10;
    const height = isRecording 
      ? baseHeight + Math.abs(Math.sin(time + i * 0.25)) * maxHeight * (0.5 + level * 0.5)
      : baseHeight;
    
    return (
      <div 
        key={i} 
        className="wave-bar" 
        style={{ 
          height: `${height}%`,
          opacity: isRecording ? 1 : 0.3
        }}
      />
    );
  });

  return <div className="audio-waveform">{bars}</div>;
}

export default App;