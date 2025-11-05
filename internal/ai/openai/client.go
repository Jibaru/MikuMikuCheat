package openai

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	openai "github.com/sashabaranov/go-openai"
)

type Client struct {
	client          *openai.Client
	responseModel   string
	transcribeModel string
	imageModel      string
}

func NewClient(
	apiKey string,
	responseModel string,
	transcribeModel string,
	imageModel string,
) *Client {
	client := openai.NewClient(apiKey)
	return &Client{
		client:          client,
		responseModel:   responseModel,
		transcribeModel: transcribeModel,
		imageModel:      imageModel,
	}
}

func (m *Client) GenerateResponse(ctx context.Context, prompt string) (string, error) {
	resp, err := m.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: "gpt-4o-mini",
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt,
			},
		},
	})
	if err != nil {
		return "", fmt.Errorf("error generating response: %w", err)
	}
	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no responses received from AI model")
	}
	return resp.Choices[0].Message.Content, nil
}

func (m *Client) TranscribeAudio(ctx context.Context, filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("can not open audio file: %w", err)
	}
	defer file.Close()

	resp, err := m.client.CreateTranscription(ctx, openai.AudioRequest{
		Model:    "gpt-4o-mini-transcribe",
		FilePath: filePath,
	})
	if err != nil {
		return "", fmt.Errorf("error transcribing audio: %w", err)
	}
	return resp.Text, nil
}

// ProcessImage analyzes an image (provided as a local file) containing a text or coding problem
// and returns a detailed solution or answer.
func (m *Client) ProcessImage(ctx context.Context, filePath string) (string, error) {
	// Read file
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("can not read image file: %w", err)
	}

	// Detect mime type from extension
	ext := strings.ToLower(filepath.Ext(filePath))
	mimeType := "image/png"
	switch ext {
	case ".jpg", ".jpeg":
		mimeType = "image/jpeg"
	case ".webp":
		mimeType = "image/webp"
	case ".gif":
		mimeType = "image/gif"
	}

	// Convert to base64
	base64Data := base64.StdEncoding.EncodeToString(data)
	imageData := fmt.Sprintf("data:%s;base64,%s", mimeType, base64Data)

	// Send image to GPT-4o-mini
	resp, err := m.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: "gpt-4o-mini", // supports vision
		Messages: []openai.ChatCompletionMessage{
			{
				Role: openai.ChatMessageRoleUser,
				MultiContent: []openai.ChatMessagePart{
					{
						Type: openai.ChatMessagePartTypeText,
						Text: "Analyze this image. It contains a problem or question (maybe code-related). Please provide a clear and correct solution or answer.",
					},
					{
						Type: openai.ChatMessagePartTypeImageURL,
						ImageURL: &openai.ChatMessageImageURL{
							URL: imageData,
						},
					},
				},
			},
		},
	})
	if err != nil {
		return "", fmt.Errorf("error processing image: %w", err)
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no responses received from AI model")
	}

	return resp.Choices[0].Message.Content, nil
}
