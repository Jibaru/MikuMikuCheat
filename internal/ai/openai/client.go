package openai

import (
	"context"
	"fmt"
	"os"

	openai "github.com/sashabaranov/go-openai"
)

type Client struct {
	client *openai.Client
}

func NewClient(apiKey string) *Client {
	client := openai.NewClient(apiKey)
	return &Client{client: client}
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
