interface Props {
	imageUrl: string;
	className?: string;
}

export default function PictureBackground({ imageUrl, className }: Props) {
	return (
		<div className={className}>
			<style>{`
        .background-image {
          object-fit: cover;
          height: 150%;
          max-height: 150%;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 1));
        }
      `}</style>

			<picture className="w-full h-full display-flex justify-center align-center absolute z-0">
				<img
					src={imageUrl}
					alt="Image"
					className="background-image"
					draggable="false"
				/>
			</picture>
		</div>
	);
}
