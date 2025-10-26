import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import AudioWaveform from "./AudioWaveForm";
import listenImg from "../assets/images/listen.png";

export default function WelcomeScreen() {
	const { isRecording, audioLevel, processAudio } = useApp();

	useEffect(() => {
		const handleKeyPress = async (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				await processAudio();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [processAudio]);

	return (
		<div className="app-container">
			<div className="glass-window recording-view">
				<div className="waveform-container">
					<AudioWaveform isRecording={isRecording} level={audioLevel} />
				</div>

				<div className="recording-section">
					<div className="miku-circle">
						<img className="miku-img" src={listenImg} />
					</div>
				</div>

				<button className="solve-button" onClick={processAudio}>
					<span>[⌘ + enter] solve answer</span>
				</button>
			</div>
		</div>
	);
}
