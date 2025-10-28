import { useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import AudioWaveform from "../ui/AudioWaveForm";
import thinkImg from "../../assets/images/miku_think.png";

export default function ChatScreen() {
	const {
		messages,
		isRecording,
		isProcessing,
		audioLevel,
		processAudio,
		startRecording,
	} = useApp();

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// 🎧 Keyboard shortcuts for recording and processing
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

	// ⬇️ Auto scroll to bottom when new messages arrive
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	return (
		<div className="app-container">
			<div className="glass-window-chat chat-view">
				<div className="messages-container">
					{messages.length !== 0 &&
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
						))}
					{/* Invisible div to auto-scroll into view */}
					<div ref={messagesEndRef} />
				</div>

				{isProcessing && (
					<div className="flex justify-center">
						<div className="relative w-[70px] h-[70px] rounded-full overflow-hidden flex items-center justify-center">
							{/* Glowing animated gradient border */}
							<div className="absolute inset-0 rounded-full p-[3px]">
								<div className="w-full h-full rounded-full relative">
									<div className="absolute inset-0 rounded-full bg-[linear-gradient(130deg,#a020f0,#38d8e3,#dbabc9,#05a0ed,#a020f0)] bg-[length:300%_300%] animate-[flowingGradient_6s_ease-in-out_infinite] brightness-125 saturate-150 blur-[0.5px]"></div>
									<div className="absolute inset-[3px] rounded-full"></div>
								</div>
							</div>

							{/* Inner image */}
							<img
								src={thinkImg}
								alt="thinking"
								className="h-[150px] object-cover absolute top-[-10px] animate-[shake_0.3s_ease-in-out_infinite]"
							/>

							{/* Custom animation keyframes */}
							<style>{`
                @keyframes flowingGradient {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
						</div>
					</div>
				)}

				{!isProcessing && (
					<div className="bottom-section">
						<div className="mini-waveform-container">
							<AudioWaveform isRecording={isRecording} level={audioLevel} />
						</div>
						<button
							className="primary-button"
							onClick={isRecording ? processAudio : startRecording}
						>
							<span>[⌘ + enter] {isRecording ? "cheat" : "resume listening"}</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
