package services

import "context"

type TranscriptionClient interface {
	TranscribeAudio(ctx context.Context, filePath string) (string, error)
}

type ResponsesClient interface {
	GenerateResponse(ctx context.Context, prompt string) (string, error)
}

type ImageClient interface {
	ProcessImage(ctx context.Context, filePath string) (string, error)
}
