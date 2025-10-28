import { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import sleepImg from "../../assets/images/miku_sleep.png";
import PictureBackground from "../ui/PictureBackground";

export default function IdleScreen() {
	const { setViewMode, startRecording } = useApp();

	const handleStart = async () => {
		await startRecording();
		setViewMode("recording");
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
			<PictureBackground
				imageUrl={sleepImg}
				className="absolute w-full h-full bg-[#1a1a2e] overflow-hidden"
			/>
			<div className="w-full h-full flex flex-col justify-end items-center relative z-10">
				<button className="primary-button" onClick={handleStart}>
					<span>[⌘ + enter] Cheat</span>
				</button>
			</div>
		</div>
	);
}
