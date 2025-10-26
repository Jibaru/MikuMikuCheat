import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import AudioWaveform from "./AudioWaveForm";
import thinkImg from "../assets/images/think.png";

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
					{messages.length !== 0 && (
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
					{/* Invisible div to auto-scroll into view */}
					<div ref={messagesEndRef} />
				</div>

				{isProcessing && (
					<div className="loading">
						<div className="miku-circle" style={{ width: "50px", height: "50px" }}>
							<img
								className="miku-img"
								src={thinkImg}
								style={{ width: "100px", height: "100px" }}
							/>
						</div>
						<div className="loading-dots">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
				)}

				{!isProcessing && (
					<div className="bottom-section">
						<div className="mini-waveform-container">
							<AudioWaveform isRecording={isRecording} level={audioLevel} />
						</div>
						<button
							className="solve-button"
							onClick={isRecording ? processAudio : startRecording}
						>
							<span>
								[⌘ + enter] {isRecording ? "cheat" : "resume listening"}
							</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
