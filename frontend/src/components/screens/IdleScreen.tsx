import { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import sleepImg from "../../assets/images/miku_sleep.png";
import PictureBackground from "../ui/PictureBackground";
import RecordCap from "../ui/RecordCap";

export default function IdleScreen() {
	const { setViewMode, startRecording, takeScreenshot } = useApp();

	const handleStart = async () => {
		await startRecording();
		setViewMode("recording");
	};

	const handleScreenshot = async () => {
		await startRecording();
		setViewMode("chat");
		await takeScreenshot();
	};

	useEffect(() => {
		const handleKeyPress = async (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				await handleStart();
			}

			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
				e.preventDefault();
				await handleScreenshot();
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
			<div className="w-full h-full flex flex-row justify-center gap-1 items-end relative z-10">
				<button
					className="primary-button flex items-center gap-2"
					onClick={handleStart}
				>
					<RecordCap />
					<span>Cheat</span>
				</button>
				<button
					className="primary-button flex items-center gap-2"
					onClick={handleStart}
				>
					<RecordCap secondCap={{ key: "h", label: "H" }} />
					<span>Screenshot</span>
				</button>
			</div>
		</div>
	);
}
