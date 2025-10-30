package services

import (
	"context"
	"encoding/base64"
	"fmt"
	"image/png"
	"os"
	"path/filepath"
	"time"

	"github.com/kbinani/screenshot"
)

type CheaterService struct {
	transcriptionClient TranscriptionClient
	responsesClient     ResponsesClient
}

func NewCheaterService(
	transcriptionClient TranscriptionClient,
	responsesClient ResponsesClient,
) *CheaterService {
	return &CheaterService{
		transcriptionClient: transcriptionClient,
		responsesClient:     responsesClient,
	}
}

type AudioData struct {
	AudioBase64 string `json:"audioBase64"`
	MimeType    string `json:"mimeType"`
}

type GetAIResponse struct {
	AIResponse string `json:"aiResponse"`
	Error      string `json:"error,omitempty"`
}

type TranscribeAudioResponse struct {
	Transcription string `json:"transcription"`
	Error         string `json:"error,omitempty"`
}

func (s *CheaterService) TranscribeAudio(audioData AudioData) TranscribeAudioResponse {
	audioBytes, err := base64.StdEncoding.DecodeString(audioData.AudioBase64)
	if err != nil {
		return TranscribeAudioResponse{
			Error: fmt.Sprintf("Error decoding audio: %v", err),
		}
	}

	tempDir := os.TempDir()
	audioPath := filepath.Join(tempDir, fmt.Sprintf("audio_%d.webm", time.Now().Unix()))

	err = os.WriteFile(audioPath, audioBytes, 0644)
	if err != nil {
		return TranscribeAudioResponse{
			Error: fmt.Sprintf("Error saving audio: %v", err),
		}
	}
	defer os.Remove(audioPath)

	ctx := context.Background()
	transcription, err := s.transcriptionClient.TranscribeAudio(ctx, audioPath)
	if err != nil {
		return TranscribeAudioResponse{
			Error: fmt.Sprintf("Error transcribing audio: %v", err),
		}
	}

	return TranscribeAudioResponse{
		Transcription: transcription,
	}

}

func (s *CheaterService) GetAIResponse(transcription string) GetAIResponse {
	ctx := context.Background()
	prompt := fmt.Sprintf("You are a helpful coaching assistant. Your response is exact, short and concise. Provide insights based on the following user input: %s", transcription)
	response, err := s.responsesClient.GenerateResponse(ctx, prompt)
	if err != nil {
		return GetAIResponse{
			Error: fmt.Sprintf("Error generating AI response: %v", err),
		}
	}
	return GetAIResponse{
		AIResponse: response,
	}
}

type ScreenshotResponse struct {
	ImageBase64 string `json:"imageBase64"`
	Filepath    string `json:"filepath"`
	Error       string `json:"error,omitempty"`
}

func (s *CheaterService) Screenshot() ScreenshotResponse {
	screenZero := 0

	bounds := screenshot.GetDisplayBounds(screenZero)

	img, err := screenshot.CaptureRect(bounds)
	if err != nil {
		return ScreenshotResponse{
			Error: fmt.Sprintf("Error capturing screenshot: %v", err),
		}
	}
	fileName := fmt.Sprintf("%d_%dx%d.png", screenZero, bounds.Dx(), bounds.Dy())
	file, _ := os.Create(fileName)
	defer file.Close()
	png.Encode(file, img)

	imgBytes, err := os.ReadFile(fileName)
	if err != nil {
		return ScreenshotResponse{
			Error: fmt.Sprintf("Error reading screenshot file: %v", err),
		}
	}

	imgBase64 := base64.StdEncoding.EncodeToString(imgBytes)
	absolutFilePath, _ := filepath.Abs(fileName)

	return ScreenshotResponse{
		ImageBase64: imgBase64,
		Filepath:    absolutFilePath,
	}
}
