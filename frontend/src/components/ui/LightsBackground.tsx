interface Props {
	className?: string;
}

export default function LightsBackground({ className }: Props) {
	return (
		<div className={className}>
			<style>{`
.light {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(100, 200, 255, 0.4), transparent);
          opacity: 0;
        }

        .light:nth-child(1) {
          left: 8%; width: 12px; height: 12px;
          animation: float1 4.2s linear infinite;
        }
        .light:nth-child(2) {
          left: 92%; width: 28px; height: 28px;
          animation: float2 2.1s linear infinite;
        }
        .light:nth-child(3) {
          left: 35%; width: 8px; height: 8px;
          animation: float3 5.5s linear infinite;
        }
        .light:nth-child(4) {
          left: 73%; width: 18px; height: 18px;
          animation: float4 3.3s linear infinite;
        }
        .light:nth-child(5) {
          left: 15%; width: 32px; height: 32px;
          animation: float5 2.8s linear infinite;
        }
        .light:nth-child(6) {
          left: 58%; width: 10px; height: 10px;
          animation: float6 4.7s linear infinite;
        }
        .light:nth-child(7) {
          left: 82%; width: 22px; height: 22px;
          animation: float7 3.6s linear infinite;
        }
        .light:nth-child(8) {
          left: 42%; width: 15px; height: 15px;
          animation: float8 5.1s linear infinite;
        }
        .light:nth-child(9) {
          left: 67%; width: 25px; height: 25px;
          animation: float9 2.5s linear infinite;
        }
        .light:nth-child(10) {
          left: 28%; width: 20px; height: 20px;
          animation: float10 3.9s linear infinite;
        }
        .light:nth-child(11) {
          left: 5%; width: 14px; height: 14px;
          animation: float11 4.4s linear infinite;
        }
        .light:nth-child(12) {
          left: 88%; width: 11px; height: 11px;
          animation: float12 3.2s linear infinite;
        }
        .light:nth-child(13) {
          left: 50%; width: 30px; height: 30px;
          animation: float13 2.7s linear infinite;
        }
        .light:nth-child(14) {
          left: 95%; width: 16px; height: 16px;
          animation: float14 5.3s linear infinite;
        }
        .light:nth-child(15) {
          left: 20%; width: 9px; height: 9px;
          animation: float15 4.0s linear infinite;
        }

        @keyframes float1 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          10% { opacity: 0.9; }
          100% { bottom: 120%; opacity: 0; transform: translateX(80px) rotate(180deg); }
        }
        @keyframes float2 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          15% { opacity: 1; }
          100% { bottom: 120%; opacity: 0; transform: translateX(-120px) rotate(-90deg); }
        }
        @keyframes float3 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          12% { opacity: 0.7; }
          100% { bottom: 120%; opacity: 0; transform: translateX(50px) rotate(270deg); }
        }
        @keyframes float4 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          18% { opacity: 0.85; }
          100% { bottom: 120%; opacity: 0; transform: translateX(-60px) rotate(135deg); }
        }
        @keyframes float5 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          8% { opacity: 1; }
          100% { bottom: 120%; opacity: 0; transform: translateX(100px) rotate(-45deg); }
        }
        @keyframes float6 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          14% { opacity: 0.75; }
          100% { bottom: 120%; opacity: 0; transform: translateX(-40px) rotate(225deg); }
        }
        @keyframes float7 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          11% { opacity: 0.95; }
          100% { bottom: 120%; opacity: 0; transform: translateX(70px) rotate(-120deg); }
        }
        @keyframes float8 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          13% { opacity: 0.8; }
          100% { bottom: 120%; opacity: 0; transform: translateX(-90px) rotate(60deg); }
        }
        @keyframes float9 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          16% { opacity: 1; }
          100% { bottom: 120%; opacity: 0; transform: translateX(110px) rotate(-150deg); }
        }
        @keyframes float10 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          9% { opacity: 0.88; }
          100% { bottom: 120%; opacity: 0; transform: translateX(-50px) rotate(100deg); }
        }
        @keyframes float11 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          12% { opacity: 0.82; }
          100% { bottom: 120%; opacity: 0; transform: translateX(65px) rotate(-75deg); }
        }
        @keyframes float12 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          17% { opacity: 0.9; }
          100% { bottom: 120%; opacity: 0; transform: translateX(-75px) rotate(200deg); }
        }
        @keyframes float13 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          10% { opacity: 1; }
          100% { bottom: 120%; opacity: 0; transform: translateX(45px) rotate(-110deg); }
        }
        @keyframes float14 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          15% { opacity: 0.77; }
          100% { bottom: 120%; opacity: 0; transform: translateX(-100px) rotate(155deg); }
        }
        @keyframes float15 {
          0% { bottom: -50px; opacity: 0; transform: translateX(0) rotate(0deg); }
          11% { opacity: 0.85; }
          100% { bottom: 120%; opacity: 0; transform: translateX(85px) rotate(-200deg); }
        }
      `}</style>

			<div className="fixed w-full h-full overflow-hidden z-0 pointer-events-none">
				{[...Array(15)].map((_, i) => (
					<div key={i} className="light" />
				))}
			</div>
		</div>
	);
}
