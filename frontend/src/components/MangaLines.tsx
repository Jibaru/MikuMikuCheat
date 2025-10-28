interface Props {
	className?: string;
}

export default function MangaLines({ className }: Props) {
	return (
		<div className={className}>
			<style>{`
        .manga-lines {
          --center-x: 50%;
          --center-y: 50%;
          --size-x: 45%;
          --size-y: 45%;
          --speed: 0.8s;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .manga-lines::before {
          --x: 1.1;
          --y: 1.1;
          --space: 10deg;
          --from: 2deg;
          --width: 0.7deg;
          content: "";
          position: absolute;
          z-index: 0;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            repeating-conic-gradient(from calc(var(--from) * 1.75 * var(--x)) at var(--center-x) var(--center-y),
              rgba(255, 255, 255, 0.9) 0 0.1deg,
              rgba(255, 255, 255, 0.9) 0.1deg var(--width),
              #0000 var(--width) var(--space)),
            repeating-conic-gradient(from var(--from) at var(--center-x) var(--center-y),
              rgba(255, 255, 255, 0.8) 0 0.05deg,
              rgba(255, 255, 255, 0.8) 0.05deg calc(var(--width) * var(--x)),
              #0000 calc(var(--width) * var(--x)) calc(var(--space) * var(--y) * 2.5)),
            repeating-conic-gradient(from calc(var(--from) * 13) at var(--center-x) var(--center-y),
              rgba(255, 255, 255, 0.8) 0 0.05deg,
              rgba(255, 255, 255, 0.8) 0.05deg calc(var(--width) * var(--x)),
              #0000 calc(var(--width) * var(--x)) calc(var(--space) * var(--y) * 2.5));
          mask: radial-gradient(calc(var(--size-x) * var(--x)) calc(var(--size-y) * var(--y)) at var(--center-x) var(--center-y), #f000 99%, #000);
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))
                  drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))
                  drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
          animation: moveLines var(--speed) -0.33s infinite;
        }

        .manga-lines::after {
          --x: 1.1;
          --y: 1.1;
          --space: 10deg;
          --from: 2deg;
          --width: 0.7deg;
          content: "";
          position: absolute;
          z-index: 0;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            repeating-conic-gradient(from var(--from) at var(--center-x) var(--center-y),
              rgba(255, 255, 255, 0.9) 0 0.1deg,
              rgba(255, 255, 255, 0.9) 0.1deg var(--width),
              #0000 var(--width) var(--space)),
            repeating-conic-gradient(from var(--from) at var(--center-x) var(--center-y),
              rgba(255, 255, 255, 0.7) 0 0.05deg,
              rgba(255, 255, 255, 0.7) 0.05deg calc(var(--width) * var(--y)),
              #0000 calc(var(--width) * var(--y)) calc(var(--space) * var(--x) * 2.5));
          mask: radial-gradient(calc(var(--size-x) * var(--x)) calc(var(--size-y) * var(--y)) at var(--center-x) var(--center-y), #f000 99%, #000);
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))
                  drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))
                  drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
          animation: moveLines calc(var(--speed) * var(--x)) steps(10, start) infinite;
        }

        @keyframes moveLines {
          0% { --x: 1.1; --y: 1.1; --from: 5deg; --width: 0.7deg; --space: 10deg; }
          10% { --x: 1.2; --y: 1.3; --from: 2deg; --width: 0.8deg; --space: 11deg; }
          20% { --x: 1.0; --y: 1.1; --from: 4deg; --width: 0.6deg; --space: 13deg; }
          30% { --x: 1.1; --y: 1.2; --from: 2deg; --width: 0.3deg; --space: 10deg; }
          40% { --x: 0.9; --y: 1.0; --from: -1deg; --width: 0.9deg; --space: 13deg; }
          50% { --x: 1.1; --y: 1.0; --from: 2deg; --width: 1.0deg; --space: 11deg; }
          60% { --x: 1.2; --y: 0.9; --from: 3deg; --width: 0.7deg; --space: 10deg; }
          70% { --x: 1.1; --y: 1.0; --from: -2deg; --width: 0.8deg; --space: 9deg; }
          80% { --x: 1.1; --y: 0.9; --from: 5deg; --width: 0.5deg; --space: 10deg; }
          90% { --x: 1.0; --y: 1.0; --from: 9deg; --width: 0.6deg; --space: 11deg; }
          100% { --x: 0.9; --y: 1.1; --from: 7deg; --width: 0.7deg; --space: 10deg; }
        }
      `}</style>

			<div className="manga-lines"></div>
		</div>
	);
}
