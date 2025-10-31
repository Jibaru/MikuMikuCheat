import { memo, useEffect, useRef } from "react";
import { Message, useApp } from "../../context/AppContext";
import AudioWaveform from "../ui/AudioWaveForm";
import thinkImg from "../../assets/images/miku_think.png";
import ChatMessage from "../ui/ChatMessage";
import RecordCap from "../ui/RecordCap";

const MessageWrapper = memo(
	({ message }: { message: Message }) => (
		<ChatMessage
			sender={message.sender}
			text={message.text}
			imageBase64={message.imageBase64}
		/>
	),
	(prevProps, nextProps) => prevProps.message.id === nextProps.message.id,
);

export default function ChatScreen() {
	const {
		messages,
		isRecording,
		isProcessing,
		audioLevel,
		processAudio,
		startRecording,
		takeScreenshot,
	} = useApp();

	const messagesEndRef = useRef<HTMLDivElement>(null);

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

			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
				e.preventDefault();
				await takeScreenshot();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [isRecording, processAudio, startRecording]);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	return (
		<div className="app-container">
			<div className="glass-window-chat chat-view">
				<div className="messages-container">
					{messages.map((m, i) => (
						<div key={i} className="animate-fadeIn">
							<MessageWrapper key={m.id} message={m} />
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>

				{isProcessing && (
					<div className="flex justify-center">
						<div className="relative w-[70px] h-[70px] rounded-full overflow-hidden flex items-center justify-center">
							<div className="absolute inset-0 rounded-full p-[3px]">
								<div className="w-full h-full rounded-full relative">
									<div className="absolute inset-0 rounded-full bg-[linear-gradient(130deg,#a020f0,#38d8e3,#dbabc9,#05a0ed,#a020f0)] bg-[length:300%_300%] animate-[flowingGradient_6s_ease-in-out_infinite] brightness-125 saturate-150 blur-[0.5px]" />
									<div className="absolute inset-[3px] rounded-full" />
								</div>
							</div>

							<img
								src={thinkImg}
								alt="thinking"
								className="h-[150px] object-cover absolute top-[-10px] animate-[shake_0.3s_ease-in-out_infinite]"
							/>

							<style>{`
								@keyframes flowingGradient {
									0% { background-position: 0% 50%; }
									50% { background-position: 100% 50%; }
									100% { background-position: 0% 50%; }
								}

								@keyframes fadeIn {
									from {
										opacity: 0;
										transform: translateY(10px);
									}
									to {
										opacity: 1;
										transform: translateY(0);
									}
								}

								.animate-fadeIn {
									animation: fadeIn 0.5s ease-out;
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
						<div className="flex flex-row justify-center gap-1">
							<button
								className="primary-button flex items-center gap-2"
								onClick={processAudio}
							>
								<RecordCap />
								<span>Audio</span>
							</button>
							<button
								className="primary-button flex items-center gap-2"
								onClick={takeScreenshot}
							>
								<RecordCap secondCap={{ key: "h", label: "H" }} />
								<span>Screenshot</span>
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
