import { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import AudioWaveform from "../ui/AudioWaveForm";
import listenImg from "../../assets/images/miku_cheat.png";
import MangaLines from "../ui/MangaLines";
import PictureBackground from "../ui/PictureBackground";
import LightsBackground from "../ui/LightsBackground";
import RecordCap from "../ui/RecordCap";

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
			<PictureBackground
				imageUrl={listenImg}
				className="absolute w-full h-full bg-[#1a1a2e] overflow-hidden animate-[shake_0.3s_ease-in-out_infinite]"
			/>
			<LightsBackground className="absolute w-full h-full z-0" />
			<MangaLines className="absolute w-full h-full z-0" />
			<section className="w-full h-full flex flex-col justify-end items-center relative z-10 pb-16">
				<div className="w-full h-32">
					<AudioWaveform isRecording={isRecording} level={audioLevel} />
				</div>
				<button
					className="mb-4 primary-button flex items-center gap-2"
					onClick={processAudio}
				>
					<RecordCap />
					<span>MikuMikuCheat</span>
				</button>
			</section>
		</div>
	);
}
