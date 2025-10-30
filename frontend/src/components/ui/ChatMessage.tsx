import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

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

	const components: Components = {
		code(props) {
			const { className, children, ...rest } = props as any;
			const inline = (props as any).inline;
			const match = /language-(\w+)/.exec(className || "");
			const codeString = String(children).replace(/\n$/, "");

			const [copied, setCopied] = useState(false);

			const handleCopy = async () => {
				await navigator.clipboard.writeText(codeString);
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			};

			if (!inline && match) {
				return (
					<div className="relative group">
						<button
							onClick={handleCopy}
							className="absolute top-2 right-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
						>
							{copied ? "Copied!" : "Copy"}
						</button>
						<SyntaxHighlighter
							style={atomDark as any}
							language={match[1]}
							PreTag="div"
							{...rest}
						>
							{codeString}
						</SyntaxHighlighter>
					</div>
				);
			}

			return (
				<code className="bg-gray-600 rounded px-1 py-0.5 text-sm" {...rest}>
					{children}
				</code>
			);
		},
	};

	return (
		<div className={`message-box ${isAI ? "response-box" : "transcription-box"}`}>
			<div className="box-label">{isAI ? "AI Response:" : "You said:"}</div>
			<div className="box-content prose prose-invert max-w-none">
				{imageBase64 ? (
					<img
						src={`data:image/png;base64,${imageBase64}`}
						alt="Generated"
						className="rounded-lg max-w-full h-auto my-2"
					/>
				) : text ? (
					<ReactMarkdown components={components}>{text}</ReactMarkdown>
				) : null}
			</div>
		</div>
	);
}
