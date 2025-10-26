import { useEffect, useState } from "react";

export default function AudioWaveform({
	isRecording,
	level,
}: {
	isRecording: boolean;
	level: number;
}) {
	const [time, setTime] = useState(0);

	useEffect(() => {
		if (!isRecording) return;
		const interval = setInterval(() => setTime((t) => t + 0.1), 50);
		return () => clearInterval(interval);
	}, [isRecording]);

	const bars = Array.from({ length: 60 }, (_, i) => {
		const base = 5;
		const max = isRecording ? 90 : 10;
		const h =
			base + Math.abs(Math.sin(time + i * 0.25)) * max * (0.5 + level * 0.5);
		return (
			<div
				key={i}
				className="wave-bar"
				style={{ height: `${h}%`, opacity: isRecording ? 1 : 0.3 }}
			/>
		);
	});

	return <div className="audio-waveform">{bars}</div>;
}
