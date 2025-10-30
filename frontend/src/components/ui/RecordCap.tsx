import { Keycap } from "keycap";

interface Props {
	secondCap?: {
		key: string;
		label: string;
	};
}

export default function RecordCap({
	secondCap = { key: "Enter", label: "↵" },
}: Props) {
	return (
		<div className="flex w-fit items-center gap-1 justify-center">
			<Keycap
				activeKey="Meta"
				style={{
					marginRight: "0",
				}}
			>
				⌘
			</Keycap>
			<div>+</div>
			<Keycap
				activeKey={secondCap.key}
				style={{
					marginRight: "0",
				}}
			>
				{secondCap.label}
			</Keycap>
		</div>
	);
}
