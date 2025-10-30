interface ChatMessageProps {
	sender: "ai" | "user";
	text?: string;
	imageBase64?: string;
}

export default function ChatMessage({
	sender,
	text,
	imageBase64,
}: ChatMessageProps) {
	const isAI = sender === "ai";
	return (
		<div className={`message-box ${isAI ? "response-box" : "transcription-box"}`}>
			<div className="box-label">{isAI ? "AI Response:" : "You said:"}</div>
			<div className="box-content">
				{imageBase64 ? (
					<img
						src={`data:image/png;base64,${imageBase64}`}
						alt="Generated"
						className="rounded-lg max-w-full h-auto my-2"
					/>
				) : (
					<p>{text}</p>
				)}
			</div>
		</div>
	);
}
